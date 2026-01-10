import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Send, Volume2, VolumeX, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { cn } from '@/lib/utils';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    stopSpeaking,
    sendMessage,
    clearMessages,
    setTranscript,
  } = useVoiceAssistant();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send transcript when listening stops
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      sendMessage(transcript);
    }
  }, [isListening, transcript, sendMessage]);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) stopSpeaking();
      startListening();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 lg:inset-auto lg:bottom-6 lg:right-6 lg:w-[400px] z-50 flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 lg:rounded-2xl shadow-2xl overflow-hidden"
            style={{ 
              height: 'calc(100vh - 60px)',
              maxHeight: '600px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">
                    {isProcessing ? 'Thinking...' : isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready to help'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={clearMessages}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Hi! I'm your AI Assistant</h4>
                  <p className="text-sm text-muted-foreground max-w-[280px]">
                    I can help you add deals, track expenses, and manage your commissions. Just speak or type!
                  </p>
                  <div className="mt-4 space-y-2 w-full">
                    <button
                      onClick={() => sendMessage("What deals do I have?")}
                      className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-colors"
                    >
                      "What deals do I have?"
                    </button>
                    <button
                      onClick={() => sendMessage("Add a new deal for client John Smith")}
                      className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-colors"
                    >
                      "Add a new deal for John Smith"
                    </button>
                    <button
                      onClick={() => sendMessage("Show me my upcoming payouts")}
                      className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-colors"
                    >
                      "Show my upcoming payouts"
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        )}
                      >
                        {message.content}
                      </div>
                    </motion.div>
                  ))}
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Live Transcript */}
            {isListening && transcript && (
              <div className="px-4 py-2 bg-primary/5 border-t border-border/30">
                <p className="text-sm text-muted-foreground italic">"{transcript}"</p>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border/50 bg-card/30 safe-area-inset-bottom">
              <div className="flex items-center gap-2">
                {/* Voice Button */}
                <Button
                  variant={isListening ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "shrink-0 h-10 w-10 rounded-full transition-all",
                    isListening && "bg-red-500 hover:bg-red-600 animate-pulse"
                  )}
                  onClick={toggleListening}
                  disabled={isProcessing}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>

                {/* Text Input */}
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type or tap mic to speak..."
                  className="flex-1 h-10 rounded-full bg-muted/50 border-0"
                  disabled={isProcessing || isListening}
                />

                {/* Send / Stop Speaking Button */}
                {isSpeaking ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-10 w-10 rounded-full"
                    onClick={stopSpeaking}
                  >
                    <VolumeX className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="icon"
                    className="shrink-0 h-10 w-10 rounded-full"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isProcessing}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
