import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { triggerHaptic } from '@/lib/haptics';

const spring = { type: 'spring' as const, stiffness: 120, damping: 20 };

const LEAD_SOURCES = ['Instagram', 'Tiktok', 'Facebook Ads', 'YouTube', 'Referral', 'Team'];
const BUYER_TYPES = ['First Time Homebuyer', 'Investor'];

interface TransactionDetailsSectionProps {
  transactionId: string;
  transactionType?: string;
  propertyType?: string;
  currency?: string;
  kind?: string;
  lifecycleDesc?: string;
  leadSource?: string | null;
  buyerType?: string | null;
  agentName?: string;
}

export function DealTransactionDetailsSection({
  transactionId,
  transactionType,
  propertyType,
  currency,
  kind,
  lifecycleDesc,
  leadSource,
  buyerType,
  agentName,
}: TransactionDetailsSectionProps) {
  const [source, setSource] = useState(leadSource || '');
  const [type, setType] = useState(buyerType || '');
  const queryClient = useQueryClient();

  // Reset local state when navigating between deals
  useEffect(() => {
    setSource(leadSource || '');
    setType(buyerType || '');
  }, [transactionId, leadSource, buyerType]);

  const saveField = async (field: 'lead_source' | 'buyer_type', value: string) => {
    try {
      const { error } = await supabase
        .from('synced_transactions')
        .update({ [field]: value || null })
        .eq('id', transactionId);

      if (error) throw error;
      
      triggerHaptic('light');
      toast.success('Saved');
      queryClient.invalidateQueries({ queryKey: ['synced_transactions'] });
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleSourceChange = (val: string) => {
    setSource(val);
    saveField('lead_source', val);
  };

  const handleTypeChange = (val: string) => {
    setType(val);
    saveField('buyer_type', val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.15 }}
    >
      <CollapsibleSection
        icon={FileText}
        title="Transaction Details"
        defaultOpen={true}
      >
        <div className="space-y-2.5">
          {/* Inline editable: Lead Source */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs lg:text-sm text-muted-foreground">Lead Source</span>
            <Select value={source} onValueChange={handleSourceChange}>
              <SelectTrigger className="h-8 w-[160px] text-xs lg:text-sm border-dashed">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {LEAD_SOURCES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inline editable: Buyer Type */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs lg:text-sm text-muted-foreground">Client Type</span>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-8 w-[160px] text-xs lg:text-sm border-dashed">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {BUYER_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DetailRow label="Type" value={transactionType || '—'} />
          <DetailRow label="Property Type" value={propertyType || '—'} />
          <DetailRow label="Currency" value={currency || 'CAD'} />
          {kind && <DetailRow label="Kind" value={kind} />}
          {lifecycleDesc && <DetailRow label="Status Info" value={lifecycleDesc} />}
          {agentName && <DetailRow label="Agent" value={agentName} />}
        </div>
      </CollapsibleSection>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs lg:text-sm text-muted-foreground">{label}</span>
      <span className="text-xs lg:text-sm font-medium text-foreground text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}
