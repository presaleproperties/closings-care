import { useState, useRef, useCallback } from 'react';
import { Loader2, Sparkles, X, Upload, Check, Edit2, ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

// Format number for display
const formatNumber = (value: number | undefined): string => {
  if (!value) return '';
  return value.toLocaleString('en-US');
};

// Parse formatted number
const parseNumber = (value: string): number | undefined => {
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
};

export function ScreenshotExtractor({ onExtract, userId }: ScreenshotExtractorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<DealExtraction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please upload image files');
      return;
    }

    // Convert all to base64
    const newImages: string[] = [];
    for (const file of imageFiles) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push(base64);
    }

    setUploadedImages(prev => [...prev, ...newImages]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) handleFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files) handleFiles(files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (uploadedImages.length === 0) return;
    setIsProcessing(true);

    try {
      // Process all images and merge results
      let mergedData: DealExtraction = {};

      for (const imageData of uploadedImages) {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
          body: {
            messages: [{ role: 'user', content: 'Extract all deal information from this screenshot. Look for client names, property details, commission amounts, dates, and any other relevant deal information.' }],
            userId,
            imageData,
          },
        });

        if (error) throw error;

        if (data.dealPreview) {
          // Merge - keep existing non-null values, add new ones
          mergedData = {
            client_name: mergedData.client_name || data.dealPreview.client_name,
            deal_type: mergedData.deal_type || data.dealPreview.deal_type,
            property_type: mergedData.property_type || data.dealPreview.property_type,
            city: mergedData.city || data.dealPreview.city,
            address: mergedData.address || data.dealPreview.address,
            project_name: mergedData.project_name || data.dealPreview.project_name,
            sale_price: mergedData.sale_price || data.dealPreview.sale_price,
            gross_commission_est: mergedData.gross_commission_est || data.dealPreview.gross_commission_est,
            close_date_est: mergedData.close_date_est || data.dealPreview.close_date_est,
            advance_date: mergedData.advance_date || data.dealPreview.advance_date,
            advance_commission: mergedData.advance_commission || data.dealPreview.advance_commission,
            completion_date: mergedData.completion_date || data.dealPreview.completion_date,
            completion_commission: mergedData.completion_commission || data.dealPreview.completion_commission,
            notes: mergedData.notes || data.dealPreview.notes,
            lead_source: mergedData.lead_source || data.dealPreview.lead_source,
            buyer_type: mergedData.buyer_type || data.dealPreview.buyer_type,
          };
        }
      }

      if (Object.keys(mergedData).length > 0 && mergedData.client_name) {
        setExtractedData(mergedData);
        toast.success(`Extracted info from ${uploadedImages.length} screenshot${uploadedImages.length > 1 ? 's' : ''}`);
      } else {
        toast.error('Could not extract deal details from screenshots');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error('Failed to extract deal details');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateField = <K extends keyof DealExtraction>(field: K, value: DealExtraction[K]) => {
    setExtractedData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleApply = () => {
    if (extractedData) {
      onExtract(extractedData);
      toast.success('Deal details applied to form');
      // Reset
      setExtractedData(null);
      setUploadedImages([]);
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    setExtractedData(null);
    setUploadedImages([]);
    setIsEditing(false);
  };

  // Show extracted data preview/editor
  if (extractedData) {
    return (
      <div className="border border-primary/30 rounded-xl bg-primary/5 overflow-hidden">
        <div className="p-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Extracted Deal Details</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-7 px-2 text-xs"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              {isEditing ? 'Done' : 'Edit'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="p-3 space-y-3">
          {/* Client & Type Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Client</Label>
              {isEditing ? (
                <Input
                  value={extractedData.client_name || ''}
                  onChange={(e) => updateField('client_name', e.target.value)}
                  className="h-8 text-sm"
                />
              ) : (
                <p className="text-sm font-medium truncate">{extractedData.client_name || '—'}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Deal Type</Label>
              {isEditing ? (
                <Select
                  value={extractedData.deal_type || ''}
                  onValueChange={(v) => updateField('deal_type', v as 'BUY' | 'SELL')}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={extractedData.deal_type === 'BUY' ? 'default' : 'secondary'}>
                  {extractedData.deal_type || '—'}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Property Type</Label>
              {isEditing ? (
                <Select
                  value={extractedData.property_type || ''}
                  onValueChange={(v) => updateField('property_type', v as 'PRESALE' | 'RESALE')}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESALE">Presale</SelectItem>
                    <SelectItem value="RESALE">Resale</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline">{extractedData.property_type || '—'}</Badge>
              )}
            </div>
          </div>

          {/* Property Info Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">
                {extractedData.property_type === 'PRESALE' ? 'Project' : 'Address'}
              </Label>
              {isEditing ? (
                <Input
                  value={extractedData.property_type === 'PRESALE' 
                    ? (extractedData.project_name || '') 
                    : (extractedData.address || '')}
                  onChange={(e) => updateField(
                    extractedData.property_type === 'PRESALE' ? 'project_name' : 'address',
                    e.target.value
                  )}
                  className="h-8 text-sm"
                />
              ) : (
                <p className="text-sm truncate">
                  {extractedData.property_type === 'PRESALE' 
                    ? extractedData.project_name 
                    : extractedData.address || '—'}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">City</Label>
              {isEditing ? (
                <Input
                  value={extractedData.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="h-8 text-sm"
                />
              ) : (
                <p className="text-sm">{extractedData.city || '—'}</p>
              )}
            </div>
          </div>

          {/* Financial Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Sale Price</Label>
              {isEditing ? (
                <Input
                  value={formatNumber(extractedData.sale_price)}
                  onChange={(e) => updateField('sale_price', parseNumber(e.target.value))}
                  className="h-8 text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="text-sm font-medium">
                  {extractedData.sale_price ? formatCurrency(extractedData.sale_price) : '—'}
                </p>
              )}
            </div>
            {extractedData.property_type === 'PRESALE' ? (
              <>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Advance $</Label>
                  {isEditing ? (
                    <Input
                      value={formatNumber(extractedData.advance_commission)}
                      onChange={(e) => updateField('advance_commission', parseNumber(e.target.value))}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-info">
                      {extractedData.advance_commission ? formatCurrency(extractedData.advance_commission) : '—'}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Completion $</Label>
                  {isEditing ? (
                    <Input
                      value={formatNumber(extractedData.completion_commission)}
                      onChange={(e) => updateField('completion_commission', parseNumber(e.target.value))}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-primary">
                      {extractedData.completion_commission ? formatCurrency(extractedData.completion_commission) : '—'}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-1 col-span-2">
                <Label className="text-[10px] text-muted-foreground">Gross Commission</Label>
                {isEditing ? (
                  <Input
                    value={formatNumber(extractedData.gross_commission_est)}
                    onChange={(e) => updateField('gross_commission_est', parseNumber(e.target.value))}
                    className="h-8 text-sm"
                  />
                ) : (
                  <p className="text-sm font-medium text-success">
                    {extractedData.gross_commission_est ? formatCurrency(extractedData.gross_commission_est) : '—'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-3 gap-2">
            {extractedData.property_type === 'PRESALE' ? (
              <>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Advance Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={extractedData.advance_date || ''}
                      onChange={(e) => updateField('advance_date', e.target.value)}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm">
                      {extractedData.advance_date ? new Date(extractedData.advance_date).toLocaleDateString() : '—'}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Completion Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={extractedData.completion_date || ''}
                      onChange={(e) => updateField('completion_date', e.target.value)}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm">
                      {extractedData.completion_date ? new Date(extractedData.completion_date).toLocaleDateString() : '—'}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-1 col-span-2">
                <Label className="text-[10px] text-muted-foreground">Closing Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={extractedData.close_date_est || ''}
                    onChange={(e) => updateField('close_date_est', e.target.value)}
                    className="h-8 text-sm"
                  />
                ) : (
                  <p className="text-sm">
                    {extractedData.close_date_est ? new Date(extractedData.close_date_est).toLocaleDateString() : '—'}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Buyer Type</Label>
              {isEditing ? (
                <Input
                  value={extractedData.buyer_type || ''}
                  onChange={(e) => updateField('buyer_type', e.target.value)}
                  className="h-8 text-sm"
                />
              ) : (
                <p className="text-sm">{extractedData.buyer_type || '—'}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handleApply}
              className="flex-1 gap-2"
              size="sm"
            >
              <Check className="w-4 h-4" />
              Apply to Form
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50",
          isProcessing && "pointer-events-none opacity-70"
        )}
      >
        {isProcessing ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="font-medium">Extracting from {uploadedImages.length} screenshot{uploadedImages.length > 1 ? 's' : ''}...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-primary">Extract from Screenshots</p>
                <p className="text-xs text-muted-foreground">Drop or click to upload brokerage documents</p>
              </div>
              <Upload className="w-5 h-5 ml-auto opacity-50 text-primary" />
            </div>
            {uploadedImages.length > 0 && (
              <p className="text-xs text-muted-foreground">{uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} ready</p>
            )}
          </>
        )}
      </div>

      {/* Image Thumbnails */}
      {uploadedImages.length > 0 && !isProcessing && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <Button
            type="button"
            onClick={processImages}
            disabled={isProcessing}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Extract Deal Info
          </Button>
        </div>
      )}
    </div>
  );
}
