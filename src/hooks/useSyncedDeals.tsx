import { useMemo } from 'react';
import { useSyncedTransactions } from './usePlatformConnections';

export interface Participant {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  company?: string;
  participantRole: string;
  payment?: { percent?: number };
}

export interface SyncedDeal {
  id: string;
  clientName: string;
  propertyAddress: string | null;
  status: 'active' | 'closed' | 'terminated' | 'pending';
  isListing: boolean;
  lifecycleState: string | null;
  journeyId: string | null;
  mlsNumber: string | null;
  salePrice: number | null;
  commissionAmount: number | null;
  myNetPayout: number | null;
  mySplitPercent: number | null;
  firmDate: string | null;
  closeDate: string | null;
  listingDate: string | null;
  participants: Participant[];
  rawData?: any;
}

export function useSyncedDeals() {
  const { data: syncedTransactions = [] } = useSyncedTransactions();

  const deals = useMemo(() => {
    return syncedTransactions.map((tx: any) => {
      const participants = tx.raw_data?.participants || [];
      
      return {
        id: tx.id,
        clientName: tx.client_name || 'Unknown',
        propertyAddress: tx.property_address,
        status: tx.status || 'pending',
        isListing: tx.is_listing || false,
        lifecycleState: tx.lifecycle_state,
        journeyId: tx.journey_id,
        mlsNumber: tx.mls_number,
        salePrice: tx.sale_price,
        commissionAmount: tx.commission_amount,
        myNetPayout: tx.my_net_payout,
        mySplitPercent: tx.my_split_percent,
        firmDate: tx.firm_date,
        closeDate: tx.close_date,
        listingDate: tx.listing_date,
        participants: participants as Participant[],
        rawData: tx.raw_data,
      } as SyncedDeal;
    });
  }, [syncedTransactions]);

  // Group by journey for presales (multiple parts of same deal)
  const dealsByJourney = useMemo(() => {
    const grouped = new Map<string | null, SyncedDeal[]>();
    
    deals.forEach(deal => {
      const key = deal.journeyId || deal.id;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(deal);
    });

    return grouped;
  }, [deals]);

  // Split by status
  const activeDeals = useMemo(() => deals.filter(d => d.status === 'active'), [deals]);
  const closedDeals = useMemo(() => deals.filter(d => d.status === 'closed'), [deals]);
  const listings = useMemo(() => deals.filter(d => d.isListing), [deals]);

  return {
    deals,
    dealsByJourney,
    activeDeals,
    closedDeals,
    listings,
  };
}
