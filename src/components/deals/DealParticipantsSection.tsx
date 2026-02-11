import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { ParticipantCard, type Participant } from './ParticipantCard';

const spring = { type: 'spring' as const, stiffness: 120, damping: 20 };

interface ParticipantsSectionProps {
  participants: Participant[];
}

export function DealParticipantsSection({ participants }: ParticipantsSectionProps) {
  const visibleParticipants = participants.filter(
    (p) => !p.hidden && p.participantRole !== 'REAL' && p.participantRole !== 'REAL_ADMIN'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.2 }}
    >
      <CollapsibleSection
        icon={Users}
        title="Participants"
        badge={`${visibleParticipants.length} visible`}
        defaultOpen={false}
      >
        {visibleParticipants.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No participants found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2.5 lg:gap-3">
            {visibleParticipants.map((p) => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
          </div>
        )}
      </CollapsibleSection>
    </motion.div>
  );
}
