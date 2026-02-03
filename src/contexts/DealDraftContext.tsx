import { createContext, useContext, useState, ReactNode } from 'react';
import { DealFormData } from '@/lib/types';

type DealDraft = Partial<DealFormData>;

interface DealDraftContextType {
  dealDraft: DealDraft | null;
  setDealDraft: (draft: DealDraft | null) => void;
  clearDraft: () => void;
}

const DealDraftContext = createContext<DealDraftContextType | undefined>(undefined);

export function DealDraftProvider({ children }: { children: ReactNode }) {
  const [dealDraft, setDealDraft] = useState<DealDraft | null>(null);

  const clearDraft = () => setDealDraft(null);

  return (
    <DealDraftContext.Provider value={{ dealDraft, setDealDraft, clearDraft }}>
      {children}
    </DealDraftContext.Provider>
  );
}

export function useDealDraft() {
  const context = useContext(DealDraftContext);
  if (context === undefined) {
    throw new Error('useDealDraft must be used within a DealDraftProvider');
  }
  return context;
}
