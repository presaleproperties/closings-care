import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Loader2, Volume2, X, Send, MessageCircle, Trash2, ImagePlus, Check, XCircle, Building2, DollarSign, Calendar, MapPin, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { useDealDraft } from '@/contexts/DealDraftContext';

type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking';

interface DealPreview {
  client_name: string;
  deal_type: 'BUY' | 'SELL';
  property_type?: 'PRESALE' | 'RESALE';
  city?: string;
  address?: string;
  project_name?: string;
  sale_price?: number;
  gross_commission_est?: number;
  close_date_est?: string;
  advance_date?: string;
  advance_commission?: number;
  completion_date?: string;
  completion_commission?: number;
  notes?: string;
  lead_source?: string;
  buyer_type?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
  dealPreview?: DealPreview;
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
function MessageBubble({ message, onApproveDeal, onRejectDeal }: { 
  message: Message; 
  onApproveDeal?: (preview: DealPreview) => void;
  onRejectDeal?: () => void;
}) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "max-w-[85%]",
        isUser ? "ml-auto" : "mr-auto"
      )}
    >
      {/* Regular message bubble */}
      <div className={cn(
        "rounded-2xl px-4 py-2.5",
        isUser 
          ? "bg-primary text-primary-foreground rounded-br-sm" 
          : "bg-muted text-foreground rounded-bl-sm",
        message.dealPreview && "mb-3"
      )}>
        {message.imageUrl && (
          <img 
            src={message.imageUrl} 
            alt="Uploaded" 
            className="max-w-full rounded-lg mb-2 max-h-48 object-contain"
          />
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      
      {/* Deal Preview Card */}
      {message.dealPreview && onApproveDeal && (
        <DealPreviewCard 
          preview={message.dealPreview}
          onApprove={(editedPreview) => onApproveDeal(editedPreview)}
          onReject={onRejectDeal}
        />
      )}
    </motion.div>
  );
}

// Deal Preview Card Component with Inline Editing
function DealPreviewCard({ 
  preview, 
  onApprove, 
  onReject 
}: { 
  preview: DealPreview; 
  onApprove: (editedPreview: DealPreview) => void; 
  onReject?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPreview, setEditedPreview] = useState<DealPreview>(preview);

  const updateField = <K extends keyof DealPreview>(field: K, value: DealPreview[K]) => {
    setEditedPreview(prev => ({ ...prev, [field]: value }));
  };

  const handleApprove = () => {
    onApprove(editedPreview);
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {isEditing ? (
              <Input
                value={editedPreview.client_name}
                onChange={(e) => updateField('client_name', e.target.value)}
                className="h-7 text-base font-semibold"
              />
            ) : (
              editedPreview.client_name
            )}
          </CardTitle>
          <div className="flex gap-1.5">
            <Badge variant={editedPreview.deal_type === 'BUY' ? 'default' : 'secondary'}>
              {editedPreview.deal_type === 'BUY' ? 'Buyer' : 'Seller'}
            </Badge>
            <Badge variant="outline">
              {editedPreview.property_type || 'RESALE'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Property Info */}
        <div className="flex items-start gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1 space-y-1.5">
            {isEditing ? (
              <>
                <Input
                  value={editedPreview.project_name || ''}
                  onChange={(e) => updateField('project_name', e.target.value)}
                  placeholder="Project name"
                  className="h-7 text-sm"
                />
                <Input
                  value={editedPreview.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Address"
                  className="h-7 text-sm"
                />
              </>
            ) : (
              <>
                {editedPreview.project_name && <p className="font-medium">{editedPreview.project_name}</p>}
                {editedPreview.address && <p className="text-muted-foreground">{editedPreview.address}</p>}
                {!editedPreview.project_name && !editedPreview.address && (
                  <p className="text-muted-foreground/50 italic">No address specified</p>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {isEditing ? (
            <Input
              value={editedPreview.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="City"
              className="h-7 text-sm flex-1"
            />
          ) : (
            <span className={editedPreview.city ? 'text-foreground' : 'text-muted-foreground/50 italic'}>
              {editedPreview.city || 'No city specified'}
            </span>
          )}
        </div>
        
        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Sale Price</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedPreview.sale_price || ''}
                  onChange={(e) => updateField('sale_price', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="h-7 text-sm"
                />
              ) : (
                <p className="font-medium">
                  {editedPreview.sale_price ? formatCurrency(editedPreview.sale_price) : '—'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-success" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Commission</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedPreview.gross_commission_est || ''}
                  onChange={(e) => updateField('gross_commission_est', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="h-7 text-sm"
                />
              ) : (
                <p className="font-medium text-success">
                  {editedPreview.gross_commission_est ? formatCurrency(editedPreview.gross_commission_est) : '—'}
                </p>
              )}
            </div>
          </div>
          
          {(isEditing || editedPreview.advance_commission) && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-info" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Advance</p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedPreview.advance_commission || ''}
                    onChange={(e) => updateField('advance_commission', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    className="h-7 text-sm"
                  />
                ) : (
                  <p className="font-medium">{formatCurrency(editedPreview.advance_commission!)}</p>
                )}
              </div>
            </div>
          )}
          
          {(isEditing || editedPreview.completion_commission) && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Completion</p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedPreview.completion_commission || ''}
                    onChange={(e) => updateField('completion_commission', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    className="h-7 text-sm"
                  />
                ) : (
                  <p className="font-medium">{formatCurrency(editedPreview.completion_commission!)}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Closing</p>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedPreview.close_date_est || ''}
                  onChange={(e) => updateField('close_date_est', e.target.value || undefined)}
                  className="h-7 text-sm"
                />
              ) : (
                <p className="font-medium">
                  {editedPreview.close_date_est ? new Date(editedPreview.close_date_est).toLocaleDateString() : '—'}
                </p>
              )}
            </div>
          </div>
          
          {(isEditing || editedPreview.advance_date) && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-info" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Advance</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedPreview.advance_date || ''}
                    onChange={(e) => updateField('advance_date', e.target.value || undefined)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <p className="font-medium">{new Date(editedPreview.advance_date!).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
          
          {(isEditing || editedPreview.completion_date) && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Completion</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedPreview.completion_date || ''}
                    onChange={(e) => updateField('completion_date', e.target.value || undefined)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <p className="font-medium">{new Date(editedPreview.completion_date!).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-3">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isEditing ? <Check className="h-4 w-4" /> : <span className="text-xs">✏️</span>}
            {isEditing ? 'Done Editing' : 'Edit'}
          </Button>
          <Button 
            onClick={handleApprove} 
            className="flex-1 gap-2"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
            Continue to Form
          </Button>
          {onReject && (
            <Button 
              onClick={onReject} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const QUICK_PROMPTS = [
  "Add a new deal for $500k",
  "What's my commission this month?",
  "Add $150 marketing expense",
  "📷 Upload deal screenshot",
  "Show my pending payouts",
  "What deals are closing soon?",
];

export function VoiceAssistant() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { setDealDraft } = useDealDraft();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AssistantState>('idle');
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingDealPreview, setPendingDealPreview] = useState<DealPreview | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const sendTextMessage = useCallback(async (text: string, imageData?: string | null) => {
    if ((!text.trim() && !imageData) || state === 'processing' || !user?.id) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim() || (imageData ? '📷 Extract deal from screenshot' : ''),
      imageUrl: imageData || undefined,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setPendingImage(null);
    setState('processing');
    
    // Save user message to database (without image for storage efficiency)
    await saveMessage(user.id, 'user', userMessage.content);
    
    try {
      const allMessages = [...messages, userMessage];
      
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user?.id,
          imageData: imageData || undefined,
        },
      });
      
      if (aiError) throw aiError;
      
      // Check if response contains a deal preview
      let dealPreview: DealPreview | undefined;
      if (aiData.dealPreview) {
        dealPreview = aiData.dealPreview;
        setPendingDealPreview(dealPreview);
      }
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiData.message || "Sorry, I didn't understand that.",
        timestamp: new Date(),
        dealPreview,
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

  // Handle deal preview approval - navigate to form with pre-filled data
  const handleApproveDeal = useCallback((preview: DealPreview) => {
    if (!user?.id) return;
    
    setPendingDealPreview(null);
    
    // Remove the preview from the message that had it
    setMessages(prev => prev.map(m => 
      m.dealPreview ? { ...m, dealPreview: undefined } : m
    ));
    
    // Convert preview to form data and set in context
    setDealDraft({
      client_name: preview.client_name,
      deal_type: preview.deal_type || 'BUY',
      property_type: preview.property_type,
      city: preview.city,
      address: preview.address,
      project_name: preview.project_name,
      sale_price: preview.sale_price,
      gross_commission_est: preview.gross_commission_est,
      close_date_est: preview.close_date_est,
      advance_date: preview.advance_date,
      advance_commission: preview.advance_commission,
      completion_date: preview.completion_date,
      completion_commission: preview.completion_commission,
      notes: preview.notes,
      lead_source: preview.lead_source,
      buyer_type: preview.buyer_type,
      status: 'PENDING',
    });
    
    // Close the assistant and navigate to form
    setIsExpanded(false);
    toast.success('Opening deal form with extracted details');
    navigate('/deals/new');
  }, [user?.id, setDealDraft, navigate]);

  // Handle deal preview rejection
  const handleRejectDeal = useCallback(() => {
    setPendingDealPreview(null);
    
    // Remove the preview from the message that had it
    setMessages(prev => prev.map(m => 
      m.dealPreview ? { ...m, dealPreview: undefined } : m
    ));
    
    // Add rejection message
    const rejectMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: 'Cancel - I don\'t want to create this deal',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, rejectMessage]);
    
    toast.info('Deal creation cancelled');
  }, []);

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
    sendTextMessage(inputText, pendingImage);
  };

  const handlePromptClick = (prompt: string) => {
    if (prompt.includes('📷')) {
      fileInputRef.current?.click();
    } else {
      sendTextMessage(prompt);
    }
  };

  const handleImageUpload = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Please use an image under 10MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPendingImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
    e.target.value = '';
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleImageUpload(file);
          return;
        }
      }
    }
  }, [handleImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const close = () => {
    stopSpeaking();
    setPendingImage(null);
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
                      <MessageBubble 
                        key={message.id} 
                        message={message}
                        onApproveDeal={handleApproveDeal}
                        onRejectDeal={handleRejectDeal}
                      />
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
              <form 
                onSubmit={handleSubmit} 
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="p-3 border-t border-border bg-muted/30 shrink-0"
              >
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {/* Pending image preview */}
                {pendingImage && (
                  <div className="mb-2 relative inline-block">
                    <img 
                      src={pendingImage} 
                      alt="Pending upload" 
                      className="max-h-24 rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => setPendingImage(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-10 w-10 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={state === 'processing'}
                    title="Upload deal screenshot"
                  >
                    <ImagePlus className="h-5 w-5" />
                  </Button>
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
                    placeholder={pendingImage ? "Add note about the deal..." : "Type a message or paste image..."}
                    className="flex-1 bg-background"
                    disabled={state === 'processing' || state === 'speaking'}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 h-10 w-10 rounded-full"
                    disabled={(!inputText.trim() && !pendingImage) || state === 'processing' || state === 'speaking'}
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
