import { motion } from 'framer-motion';
import { User, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Participant } from './ParticipantCard';

const spring = { type: 'spring' as const, stiffness: 120, damping: 20 };

interface DealBuyerInfoCardProps {
  participants: Participant[];
  clientName?: string | null;
}

export function DealBuyerInfoCard({ participants, clientName }: DealBuyerInfoCardProps) {
  const buyer = participants.find(
    (p) => p.participantRole === 'BUYER' || p.participantRole === 'SELLER'
  );

  const name = buyer
    ? [buyer.firstName, buyer.lastName].filter(Boolean).join(' ') || buyer.company
    : clientName;

  const role = buyer
    ? buyer.participantRole === 'SELLER' ? 'Seller' : 'Buyer'
    : 'Client';

  if (!name) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.08 }}
      className="rounded-2xl border border-border/50 bg-card/80 p-4 lg:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-base lg:text-lg text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground mb-2">{role}</p>

          {buyer?.emailAddress && (
            <a
              href={`mailto:${buyer.emailAddress}`}
              className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground hover:text-primary transition-colors mb-1"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{buyer.emailAddress}</span>
            </a>
          )}

          {buyer?.phoneNumber && (
            <a
              href={`tel:${buyer.phoneNumber}`}
              className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{buyer.phoneNumber}</span>
            </a>
          )}

          {buyer && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-medium",
                buyer.external ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
              )}>
                {buyer.external ? 'External' : 'Internal'}
              </span>
              {buyer.paidByReal && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                  Paid by Real
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
