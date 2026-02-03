import { useState, useRef, useCallback } from 'react';
import { Loader2, Sparkles, X, Upload, Check, Edit2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
  pending_date?: string;
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
            pending_date: mergedData.pending_date || data.dealPreview.pending_date,
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

  const isPresale = extractedData?.property_type === 'PRESALE';

  // Extracted data preview - matches form structure
  if (extractedData) {
    return (
      <div className="bg-card border border-primary/30 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Extracted Deal Preview</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={isEditing ? "default" : "ghost"}
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

        {/* Section 1: Client & Deal Type - matches form */}
        <div className="p-3 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">1. Client & Deal Type</h3>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Client Name</Label>
            {isEditing ? (
              <Input
                value={extractedData.client_name || ''}
                onChange={(e) => updateField('client_name', e.target.value)}
                className="h-9"
                placeholder="John Smith"
              />
            ) : (
              <p className="h-9 flex items-center text-sm font-medium">{extractedData.client_name || '—'}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Deal Type</Label>
            {isEditing ? (
              <Select
                value={extractedData.deal_type || ''}
                onValueChange={(v) => updateField('deal_type', v as 'BUY' | 'SELL')}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Buy / Sell" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">Buy</SelectItem>
                  <SelectItem value="SELL">Sell</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="h-9 flex items-center text-sm font-medium">{extractedData.deal_type || '—'}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Property Type</Label>
            {isEditing ? (
              <Select
                value={extractedData.property_type || ''}
                onValueChange={(v) => updateField('property_type', v as 'PRESALE' | 'RESALE')}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Presale / Resale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESALE">Presale</SelectItem>
                  <SelectItem value="RESALE">Resale</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="h-9 flex items-center text-sm font-medium">{extractedData.property_type || '—'}</p>
            )}
          </div>
        </div>

        {/* Section 2: Property Details - matches form */}
        <div className="p-3 border-t border-b border-border bg-muted/30">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">2. Property Details</h3>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">{isPresale ? 'Project Name' : 'Address'}</Label>
            {isEditing ? (
              <Input
                value={isPresale ? (extractedData.project_name || '') : (extractedData.address || '')}
                onChange={(e) => updateField(isPresale ? 'project_name' : 'address', e.target.value)}
                className="h-9"
                placeholder={isPresale ? 'The Palisades' : '123 Main St, Unit 1001'}
              />
            ) : (
              <p className="h-9 flex items-center text-sm font-medium truncate">
                {isPresale ? extractedData.project_name : extractedData.address || '—'}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">City</Label>
            {isEditing ? (
              <Select
                value={extractedData.city || ''}
                onValueChange={(v) => updateField('city', v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vancouver">Vancouver</SelectItem>
                  <SelectItem value="Burnaby">Burnaby</SelectItem>
                  <SelectItem value="Surrey">Surrey</SelectItem>
                  <SelectItem value="Langley">Langley</SelectItem>
                  <SelectItem value="Delta">Delta</SelectItem>
                  <SelectItem value="Coquitlam">Coquitlam</SelectItem>
                  <SelectItem value="Abbotsford">Abbotsford</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="h-9 flex items-center text-sm font-medium">{extractedData.city || '—'}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sale Price</Label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  value={formatNumber(extractedData.sale_price)}
                  onChange={(e) => updateField('sale_price', parseNumber(e.target.value))}
                  className="h-9 pl-6"
                  placeholder="1,250,000"
                />
              </div>
            ) : (
              <p className="h-9 flex items-center text-sm font-medium">
                {extractedData.sale_price ? `$${formatNumber(extractedData.sale_price)}` : '—'}
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Dates & Commission - matches form */}
        <div className="p-3 border-t border-b border-border bg-muted/30">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">3. Dates & Commission</h3>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Firm Date */}
            <div className="space-y-1">
              <Label className="text-xs">Firm Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={extractedData.pending_date || ''}
                  onChange={(e) => updateField('pending_date', e.target.value || undefined)}
                  className="h-9"
                />
              ) : (
                <p className="h-9 flex items-center text-sm font-medium">
                  {extractedData.pending_date ? new Date(extractedData.pending_date).toLocaleDateString() : '—'}
                </p>
              )}
            </div>

            {/* Presale: Advance Date & Amount */}
            {isPresale && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">Advance Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={extractedData.advance_date || ''}
                      onChange={(e) => updateField('advance_date', e.target.value || undefined)}
                      className="h-9"
                    />
                  ) : (
                    <p className="h-9 flex items-center text-sm font-medium">
                      {extractedData.advance_date ? new Date(extractedData.advance_date).toLocaleDateString() : '—'}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Advance $</Label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        value={formatNumber(extractedData.advance_commission)}
                        onChange={(e) => updateField('advance_commission', parseNumber(e.target.value))}
                        className="h-9 pl-6"
                        placeholder="5,000"
                      />
                    </div>
                  ) : (
                    <p className="h-9 flex items-center text-sm font-medium text-info">
                      {extractedData.advance_commission ? `$${formatNumber(extractedData.advance_commission)}` : '—'}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Presale: Completion Date & Amount */}
            {isPresale && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">Completion Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={extractedData.completion_date || ''}
                      onChange={(e) => updateField('completion_date', e.target.value || undefined)}
                      className="h-9"
                    />
                  ) : (
                    <p className="h-9 flex items-center text-sm font-medium">
                      {extractedData.completion_date ? new Date(extractedData.completion_date).toLocaleDateString() : '—'}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Completion $</Label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        value={formatNumber(extractedData.completion_commission)}
                        onChange={(e) => updateField('completion_commission', parseNumber(e.target.value))}
                        className="h-9 pl-6"
                        placeholder="26,250"
                      />
                    </div>
                  ) : (
                    <p className="h-9 flex items-center text-sm font-medium text-primary">
                      {extractedData.completion_commission ? `$${formatNumber(extractedData.completion_commission)}` : '—'}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Resale: Closing Date */}
            {!isPresale && (
              <div className="space-y-1">
                <Label className="text-xs">Closing Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={extractedData.close_date_est || ''}
                    onChange={(e) => updateField('close_date_est', e.target.value || undefined)}
                    className="h-9"
                  />
                ) : (
                  <p className="h-9 flex items-center text-sm font-medium">
                    {extractedData.close_date_est ? new Date(extractedData.close_date_est).toLocaleDateString() : '—'}
                  </p>
                )}
              </div>
            )}

            {/* Gross Commission */}
            <div className="space-y-1">
              <Label className="text-xs">
                Gross Commission {isPresale && <span className="text-muted-foreground">(auto)</span>}
              </Label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    value={formatNumber(
                      // Always calculate from advance + completion if both exist
                      (extractedData.advance_commission && extractedData.completion_commission)
                        ? (extractedData.advance_commission + extractedData.completion_commission)
                        : (extractedData.gross_commission_est || 
                          ((extractedData.advance_commission || 0) + (extractedData.completion_commission || 0)) || undefined)
                    )}
                    onChange={(e) => updateField('gross_commission_est', parseNumber(e.target.value))}
                    className="h-9 pl-6"
                    placeholder="31,250"
                    disabled={isPresale}
                  />
                </div>
              ) : (
                <p className="h-9 flex items-center text-sm font-medium text-success">
                  {(() => {
                    // Always calculate from advance + completion if both exist
                    const gross = (extractedData.advance_commission && extractedData.completion_commission)
                      ? (extractedData.advance_commission + extractedData.completion_commission)
                      : (extractedData.gross_commission_est || 
                        ((extractedData.advance_commission || 0) + (extractedData.completion_commission || 0)));
                    return gross ? `$${formatNumber(gross)}` : '—';
                  })()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Additional Info - matches form */}
        <div className="p-3 border-t border-b border-border bg-muted/30">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">4. Additional Info</h3>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Buyer Type</Label>
            {isEditing ? (
              <Select
                value={extractedData.buyer_type || ''}
                onValueChange={(v) => updateField('buyer_type', v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="First Time Homebuyer">First Time Homebuyer</SelectItem>
                  <SelectItem value="Investor">Investor</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="h-9 flex items-center text-sm font-medium">{extractedData.buyer_type || '—'}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Lead Source</Label>
            {isEditing ? (
              <Select
                value={extractedData.lead_source || ''}
                onValueChange={(v) => updateField('lead_source', v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Tiktok">Tiktok</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Youtube">Youtube</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="h-9 flex items-center text-sm font-medium">{extractedData.lead_source || '—'}</p>
            )}
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Notes</Label>
            {isEditing ? (
              <Input
                value={extractedData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                className="h-9"
                placeholder="Additional notes..."
              />
            ) : (
              <p className="h-9 flex items-center text-sm font-medium truncate">{extractedData.notes || '—'}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-t border-border bg-muted/20 flex gap-2">
          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 gap-2"
          >
            <Check className="w-4 h-4" />
            Apply to Form
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
          >
            Cancel
          </Button>
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
