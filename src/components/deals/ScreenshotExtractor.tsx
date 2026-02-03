import { useState, useRef } from 'react';
import { Camera, Loader2, Sparkles, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DealExtraction {
  client_name?: string;
  deal_type?: 'BUY' | 'SELL';
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

interface ScreenshotExtractorProps {
  onExtract: (data: DealExtraction) => void;
  userId: string;
}

export function ScreenshotExtractor({ onExtract, userId }: ScreenshotExtractorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setPreviewImage(base64Data);
      await processImage(base64Data);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages: [{ role: 'user', content: 'Extract all deal information from this screenshot.' }],
          userId,
          imageData,
        },
      });

      if (error) throw error;

      // Check for deal preview in response
      if (data.dealPreview) {
        onExtract(data.dealPreview);
        toast.success('Deal details extracted! Review and complete the form.');
        setPreviewImage(null);
      } else if (data.message?.includes('extract')) {
        toast.info('Could not extract deal details. Please fill in manually.');
        setPreviewImage(null);
      } else {
        toast.info(data.message || 'Processing complete');
        setPreviewImage(null);
      }
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error('Failed to extract deal details');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearPreview = () => {
    setPreviewImage(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!previewImage ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className={cn(
            "w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all",
            "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50",
            "text-primary font-medium"
          )}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Extract from Screenshot</p>
            <p className="text-xs text-muted-foreground">Upload a brokerage document to auto-fill</p>
          </div>
          <Upload className="w-5 h-5 ml-auto opacity-50" />
        </button>
      ) : (
        <div className="relative rounded-xl border border-border overflow-hidden bg-muted/30">
          <img
            src={previewImage}
            alt="Screenshot preview"
            className="w-full max-h-48 object-contain"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Extracting deal info...</p>
              </div>
            </div>
          )}
          {!isProcessing && (
            <button
              type="button"
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background border shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
