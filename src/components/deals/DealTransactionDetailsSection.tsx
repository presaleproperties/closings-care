import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Pencil, Check } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { triggerHaptic } from '@/lib/haptics';

const spring = { type: 'spring' as const, stiffness: 120, damping: 20 };

const LEAD_SOURCES = ['Instagram', 'Tiktok', 'Facebook Ads', 'Referral', 'Team'];
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
  const [isEditing, setIsEditing] = useState(false);
  const [source, setSource] = useState(leadSource || '');
  const [type, setType] = useState(buyerType || '');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('synced_transactions')
        .update({
          lead_source: source || null,
          buyer_type: type || null,
        })
        .eq('id', transactionId);

      if (error) throw error;
      
      triggerHaptic('light');
      toast.success('Deal updated');
      queryClient.invalidateQueries({ queryKey: ['synced-transactions'] });
      setIsEditing(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
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
        action={
          isEditing ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              disabled={saving}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          )
        }
      >
        <div className="space-y-2.5">
          {/* Editable: Lead Source */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs lg:text-sm text-muted-foreground">Lead Source</span>
            {isEditing ? (
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="h-8 w-[160px] text-xs lg:text-sm">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {LEAD_SOURCES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-xs lg:text-sm font-medium text-foreground">{source || '—'}</span>
            )}
          </div>

          {/* Editable: Buyer Type */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs lg:text-sm text-muted-foreground">Buyer Type</span>
            {isEditing ? (
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-8 w-[160px] text-xs lg:text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {BUYER_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-xs lg:text-sm font-medium text-foreground">{type || '—'}</span>
            )}
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
