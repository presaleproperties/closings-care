import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

const LEAD_SOURCES = ['Instagram', 'Tiktok', 'Facebook Ads', 'YouTube', 'Referral', 'Team'];
const BUYER_TYPES = ['First Time Homebuyer', 'Investor'];

interface DealMissingInfo {
  id: string;
  propertyAddress: string | null;
  clientName: string;
  leadSource: string | null;
  buyerType: string | null;
}

interface MissingInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deals: DealMissingInfo[];
}

export function MissingInfoDialog({ open, onOpenChange, deals }: MissingInfoDialogProps) {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localValues, setLocalValues] = useState<Record<string, { source: string; type: string }>>({});
  const [saving, setSaving] = useState(false);

  // Reset index when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      // Initialize local values from existing data
      const init: Record<string, { source: string; type: string }> = {};
      deals.forEach(d => {
        init[d.id] = { source: d.leadSource || '', type: d.buyerType || '' };
      });
      setLocalValues(init);
    }
  }, [open, deals]);

  if (deals.length === 0) return null;

  const current = deals[currentIndex];
  if (!current) return null;

  const values = localValues[current.id] || { source: '', type: '' };
  const address = current.propertyAddress
    ? current.propertyAddress.replace(/Part \d+\/\d+\s*-\s*/, '').trim()
    : 'Unknown';

  const saveCurrent = async () => {
    setSaving(true);
    try {
      const updates: Record<string, string | null> = {};
      if (values.source) updates.lead_source = values.source;
      if (values.type) updates.buyer_type = values.type;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('synced_transactions')
          .update(updates)
          .eq('id', current.id);
        if (error) throw error;
        triggerHaptic('light');
      }

      if (currentIndex < deals.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast.success(`Updated ${deals.length} deal${deals.length > 1 ? 's' : ''}`);
        queryClient.invalidateQueries({ queryKey: ['synced_transactions'] });
        onOpenChange(false);
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const skipCurrent = () => {
    if (currentIndex < deals.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      queryClient.invalidateQueries({ queryKey: ['synced_transactions'] });
      onOpenChange(false);
    }
  };

  const isLast = currentIndex === deals.length - 1;
  const hasValues = !!values.source || !!values.type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <DialogTitle className="text-base">Missing Deal Info</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {deals.length} deal{deals.length > 1 ? 's' : ''} missing lead source or buyer type
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 pt-2"
          >
            {/* Deal identifier */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
              <p className="font-semibold text-sm text-foreground">{current.clientName || 'Unknown Client'}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{address}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {currentIndex + 1} of {deals.length}
                </span>
              </div>
            </div>

            {/* Lead Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Lead Source</label>
              <Select
                value={values.source}
                onValueChange={(val) =>
                  setLocalValues(prev => ({
                    ...prev,
                    [current.id]: { ...prev[current.id], source: val },
                  }))
                }
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="Where did this lead come from?" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {LEAD_SOURCES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buyer Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Buyer Type</label>
              <Select
                value={values.type}
                onValueChange={(val) =>
                  setLocalValues(prev => ({
                    ...prev,
                    [current.id]: { ...prev[current.id], type: val },
                  }))
                }
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="What type of buyer?" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {BUYER_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={skipCurrent}
              >
                {isLast ? 'Skip & Close' : 'Skip'}
              </Button>
              <div className="flex-1" />
              <Button
                size="sm"
                className="gap-1.5 rounded-lg"
                onClick={saveCurrent}
                disabled={saving || !hasValues}
              >
                {saving ? 'Saving...' : isLast ? (
                  <><Check className="h-3.5 w-3.5" /> Done</>
                ) : (
                  <><span>Save & Next</span><ChevronRight className="h-3.5 w-3.5" /></>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Helper to extract deals missing info from synced transactions
export function getDealsWithMissingInfo(transactions: any[]): DealMissingInfo[] {
  return transactions
    .filter(tx => tx.status !== 'closed' && (!tx.lead_source || !tx.buyer_type))
    .map(tx => ({
      id: tx.id,
      propertyAddress: tx.property_address,
      clientName: tx.client_name || 'Unknown',
      leadSource: tx.lead_source,
      buyerType: tx.buyer_type,
    }));
}
