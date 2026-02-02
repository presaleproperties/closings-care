import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
      ctx.strokeStyle = 'hsl(0 84% 60%)'; // destructive color
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

// Quick Start Button Component
function QuickStartButton({ label, example, onClick }: { label: string; example: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-3 py-1.5 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer group relative"
    >
      {label}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover border border-border text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        "{example}"
      </span>
    </button>
  );
}

export function VoiceAssistant() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AssistantState>('idle');
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
      setTranscript('');
      setResponse('');
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
      
      setTranscript(userText);
      
      // Add user message to history
      const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
      setMessages(newMessages);
      
      // Step 2: Send to AI assistant
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user?.id,
        },
      });
      
      if (aiError) throw aiError;
      
      const assistantMessage = aiData.message || "Sorry, I didn't catch that.";
      setResponse(assistantMessage);
      
      // Add assistant message to history
      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
      
      // Invalidate queries if tools were called
      if (aiData.tool_calls?.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['deals'] });
        queryClient.invalidateQueries({ queryKey: ['payouts'] });
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
      }
      
      // Step 3: Text to speech
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
          body: JSON.stringify({ text: assistantMessage }),
        }
      );
      
      if (!ttsResponse.ok) {
        throw new Error('TTS failed');
      }
      
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

  const close = () => {
    stopSpeaking();
    setIsExpanded(false);
    setTranscript('');
    setResponse('');
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Mic Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={handleMicClick}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            state === 'idle' && "bg-primary hover:bg-primary/90",
            state === 'listening' && "bg-destructive animate-pulse",
            state === 'processing' && "bg-warning",
            state === 'speaking' && "bg-accent"
          )}
        >
          {state === 'idle' && <Mic className="h-6 w-6" />}
          {state === 'listening' && <MicOff className="h-6 w-6" />}
          {state === 'processing' && <Loader2 className="h-6 w-6 animate-spin" />}
          {state === 'speaking' && <Volume2 className="h-6 w-6" />}
        </Button>
      </motion.div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 max-h-96 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  state === 'idle' && "bg-muted-foreground",
                  state === 'listening' && "bg-destructive animate-pulse",
                  state === 'processing' && "bg-warning animate-pulse",
                  state === 'speaking' && "bg-accent animate-pulse"
                )} />
                <span className="text-sm font-medium text-foreground">
                  {state === 'idle' && 'Voice Assistant'}
                  {state === 'listening' && 'Listening...'}
                  {state === 'processing' && 'Thinking...'}
                  {state === 'speaking' && 'Speaking...'}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={close}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
              {transcript && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">You said:</p>
                  <p className="text-sm text-foreground">{transcript}</p>
                </div>
              )}
              
              {response && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs text-primary mb-1">Assistant:</p>
                  <p className="text-sm text-foreground">{response}</p>
                </div>
              )}

              {state === 'idle' && !transcript && !response && (
                <div className="text-center py-4">
                  <Mic className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Tap the mic to start talking
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Quick starts:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <QuickStartButton 
                        label="Add a deal" 
                        example="Add a new deal for John Smith, $500k sale"
                        onClick={startRecording}
                      />
                      <QuickStartButton 
                        label="Update a deal" 
                        example="Update the Smith deal to closed"
                        onClick={startRecording}
                      />
                      <QuickStartButton 
                        label="Add an expense" 
                        example="Add $200 marketing expense"
                        onClick={startRecording}
                      />
                    </div>
                  </div>
                </div>
              )}

              {state === 'listening' && (
                <div className="text-center py-6">
                  <div className="mb-3 h-10 flex items-center justify-center">
                    <AudioWaveform analyser={analyser} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap again when done
                  </p>
                </div>
              )}

              {state === 'processing' && !transcript && (
                <div className="text-center py-6">
                  <Loader2 className="h-8 w-8 mx-auto text-warning animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Processing your request...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
