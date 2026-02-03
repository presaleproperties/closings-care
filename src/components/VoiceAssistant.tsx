import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Loader2, Volume2, X, Send, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';

type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Save message to database
async function saveMessage(userId: string, role: 'user' | 'assistant', content: string) {
  const { error } = await supabase
    .from('chat_messages')
    .insert({ user_id: userId, role, content });
  if (error) console.error('Error saving message:', error);
}

// Fetch messages from database
async function fetchMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(50);
  
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return (data || []).map(m => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    timestamp: new Date(m.created_at),
  }));
}

// Clear chat history from database
async function clearMessages(userId: string) {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('user_id', userId);
  if (error) console.error('Error clearing messages:', error);
}

// Audio Waveform Component
function AudioWaveform({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className="mx-auto"
    />
  );
}

// Suggestion Chip Component
function SuggestionChip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-xl bg-muted/50 border border-border text-sm text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer text-left"
    >
      {text}
    </button>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-2.5",
        isUser 
          ? "bg-primary text-primary-foreground ml-auto rounded-br-sm" 
          : "bg-muted text-foreground mr-auto rounded-bl-sm"
      )}
    >
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    </motion.div>
  );
}

const QUICK_PROMPTS = [
  "Add a new deal for $500k",
  "What's my commission this month?",
  "Add $150 marketing expense",
  "Update my latest deal to closed",
  "Show my pending payouts",
  "What deals are closing soon?",
];

export function VoiceAssistant() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AssistantState>('idle');
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from database
  const { data: savedMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', user?.id],
    queryFn: () => fetchMessages(user!.id),
    enabled: !!user?.id,
  });

  // Sync loaded messages to local state
  useEffect(() => {
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, [savedMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear chat history handler
  const handleClearHistory = async () => {
    if (!user?.id) return;
    await clearMessages(user.id);
    setMessages([]);
    refetchMessages();
    toast.success('Chat history cleared');
  };

  const sendTextMessage = useCallback(async (text: string) => {
    if (!text.trim() || state === 'processing' || !user?.id) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setState('processing');
    
    // Save user message to database
    await saveMessage(user.id, 'user', userMessage.content);
    
    try {
      const allMessages = [...messages, userMessage];
      
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user?.id,
        },
      });
      
      if (aiError) throw aiError;
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiData.message || "Sorry, I didn't understand that.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to database
      await saveMessage(user.id, 'assistant', assistantMessage.content);
      
      // Invalidate queries if tools were called
      if (aiData.tool_calls?.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['deals'] });
        queryClient.invalidateQueries({ queryKey: ['payouts'] });
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
      }
      
      // Text-to-speech for the response
      setState('speaking');
      
      const ttsResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: assistantMessage.content }),
        }
      );
      
      if (ttsResponse.ok) {
        const ttsBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(ttsBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setState('idle');
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setState('idle');
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        setState('idle');
      }
      
    } catch (error) {
      console.error('AI assistant error:', error);
      toast.error('Something went wrong');
      setState('idle');
    }
  }, [messages, user?.id, session?.access_token, queryClient, state]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      // Set up audio analyser for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      audioContextRef.current = audioContext;
      setAnalyser(analyserNode);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setAnalyser(null);
        await processAudio();
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setState('listening');
      setIsExpanded(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'listening') {
      mediaRecorderRef.current.stop();
      setState('processing');
    }
  }, [state]);

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) {
      setState('idle');
      return;
    }

    const recordedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    try {
      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append('audio', recordedBlob, 'recording.webm');
      
      const sttResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`,
        {
          method: 'POST',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );
      
      if (!sttResponse.ok) {
        throw new Error('Transcription failed');
      }
      
      const sttData = await sttResponse.json();
      const userText = sttData.text || '';
      
      if (!userText.trim()) {
        toast.error("Couldn't hear you, try again");
        setState('idle');
        return;
      }
      
      // Send the transcribed text as a message
      await sendTextMessage(userText);
      
    } catch (error) {
      console.error('Voice assistant error:', error);
      toast.error('Something went wrong');
      setState('idle');
    }
  };

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState('idle');
  }, []);

  const handleMicClick = () => {
    if (state === 'idle') {
      startRecording();
    } else if (state === 'listening') {
      stopRecording();
    } else if (state === 'speaking') {
      stopSpeaking();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendTextMessage(inputText);
  };

  const handlePromptClick = (prompt: string) => {
    sendTextMessage(prompt);
  };

  const close = () => {
    stopSpeaking();
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    if (isExpanded) {
      close();
    } else {
      setIsExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={toggleExpand}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            isExpanded ? "bg-muted hover:bg-muted/80" : "bg-primary hover:bg-primary/90"
          )}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'min(600px, calc(100vh - 8rem))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  state === 'idle' && "bg-primary",
                  state === 'listening' && "bg-destructive animate-pulse",
                  state === 'processing' && "bg-primary/70 animate-pulse",
                  state === 'speaking' && "bg-primary animate-pulse"
                )} />
                <span className="text-sm font-medium text-foreground">
                  {state === 'idle' && 'AI Assistant'}
                  {state === 'listening' && 'Listening...'}
                  {state === 'processing' && 'Thinking...'}
                  {state === 'speaking' && 'Speaking...'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                    onClick={handleClearHistory}
                    title="Clear chat history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={close}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-4">
                    <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      How can I help you today?
                    </p>
                    <div className="grid gap-2">
                      {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
                        <SuggestionChip
                          key={prompt}
                          text={prompt}
                          onClick={() => handlePromptClick(prompt)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    
                    {state === 'processing' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </motion.div>
                    )}
                    
                    {/* Show suggestions after assistant response */}
                    {messages.length > 0 && state === 'idle' && messages[messages.length - 1]?.role === 'assistant' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-2 space-y-2"
                      >
                        <p className="text-xs text-muted-foreground">Suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                          {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => handlePromptClick(prompt)}
                              className="px-2 py-1 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Listening State */}
            {state === 'listening' && (
              <div className="px-4 py-3 border-t border-border bg-muted/30">
                <div className="flex items-center justify-center gap-3">
                  <AudioWaveform analyser={analyser} />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={stopRecording}
                  >
                    Stop
                  </Button>
                </div>
              </div>
            )}

            {/* Input Area */}
            {state !== 'listening' && (
              <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-muted/30 shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "shrink-0 h-10 w-10 rounded-full",
                      state === 'speaking' && "text-primary"
                    )}
                    onClick={handleMicClick}
                    disabled={state === 'processing'}
                  >
                    {state === 'processing' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : state === 'speaking' ? (
                      <Volume2 className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                  <Input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-background"
                    disabled={state === 'processing' || state === 'speaking'}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 h-10 w-10 rounded-full"
                    disabled={!inputText.trim() || state === 'processing' || state === 'speaking'}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
