import { useMemo, useState } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { useRevenueShare, useSyncedTransactions } from '@/hooks/usePlatformConnections';
import { useNetworkSummary } from '@/hooks/useNetworkData';
import { useSyncedIncome } from '@/hooks/useSyncedIncome';

// Team members who get a split (NOT the user)
const TEAM_MEMBERS = ['Ravish', 'Sarb'];
const ADMIN_NAMES = ['Mary'];

function getTeamMemberFromTx(tx: any): string | null {
  try {
    const participants = tx.raw_data?.participants || [];
    for (const p of participants) {
      if (p.hidden || p.external) continue;
      if (!['BUYERS_AGENT', 'SELLERS_AGENT'].includes(p.participantRole)) continue;
      const firstName = (p.firstName || '').trim();
      if (TEAM_MEMBERS.some(tm => firstName.toLowerCase().startsWith(tm.toLowerCase()))) {
        return `${firstName} ${(p.lastName || '').trim()}`.trim();
      }
    }
  } catch {}
  return null;
}

export function getEffectiveCommission(tx: any): number {
  const teamMember = getTeamMemberFromTx(tx);
  if (teamMember) return Number(tx.my_net_payout || 0);
  return Number(tx.commission_amount || 0);
}

export const normalizeCity = (city: string | null): string => {
  if (!city) return 'Unknown';
  const trimmed = city.trim();
  const cityMap: Record<string, string> = {
    'surrey bc': 'Surrey',
    'surrey': 'Surrey',
    'new westminister': 'New Westminster',
    'new westminster district plan': 'New Westminster',
    'new westminster district plan ': 'New Westminster',
    'coquitlam': 'Coquitlam',
    'langley township': 'Langley',
  };
  const lower = trimmed.toLowerCase();
  if (cityMap[lower]) return cityMap[lower];
  return trimmed.replace(/\b\w/g, c => c.toUpperCase());
};

export const isPresaleTransaction = (tx: any): boolean => {
  const addr = (tx.property_address || '').toLowerCase();
  const hasPartLabel = addr.includes('part 1/2') || addr.includes('part 2/2') || addr.includes('part 3/3');
  const hasProjectName = !!(tx.raw_data?.projectName || tx.project_name);
  return hasPartLabel || hasProjectName;
};

export const getWritingAgents = (tx: any): string[] => {
  try {
    const participants = tx.raw_data?.participants || [];
    return participants
      .filter((p: any) =>
        ['BUYERS_AGENT', 'SELLERS_AGENT'].includes(p.participantRole) &&
        !p.hidden && !p.external
      )
      .map((p: any) => `${p.firstName || ''} ${p.lastName || ''}`.trim())
      .filter((n: string) => n.length > 0);
  } catch { return []; }
};

export type TimeRange = 'ytd' | '12m' | '6m' | '3m' | 'all' | 'year';

export function useAnalyticsData() {
  const { data: revenueShares = [] } = useRevenueShare();
  const { data: networkSummary } = useNetworkSummary();
  const { data: syncedTransactions = [] } = useSyncedTransactions();
  const { syncedPayouts, receivedYTD, comingIn } = useSyncedIncome(syncedTransactions);

  const [timeRange, setTimeRange] = useState<TimeRange>('12m');
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [dealTypeFilter, setDealTypeFilter] = useState<'all' | 'presale' | 'resale'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  const now = useMemo(() => new Date(), []);
  const thisYear = now.getFullYear();

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    syncedTransactions.forEach(tx => {
      const d = tx.close_date || tx.firm_date || tx.listing_date;
      if (d) years.add(String(d).substring(0, 4));
    });
    for (let y = 2021; y <= thisYear; y++) years.add(String(y));
    return Array.from(years).sort();
  }, [syncedTransactions, thisYear]);

  const filterDimensions = useMemo(() => {
    const citySet = new Map<string, number>();
    const agentSet = new Map<string, number>();
    syncedTransactions.forEach(tx => {
      citySet.set(normalizeCity(tx.city), (citySet.get(normalizeCity(tx.city)) || 0) + 1);
      getWritingAgents(tx).forEach(agent => {
        agentSet.set(agent, (agentSet.get(agent) || 0) + 1);
      });
    });
    return {
      cities: Array.from(citySet.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
      agents: Array.from(agentSet.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    };
  }, [syncedTransactions]);

   const filteredTransactions = useMemo(() => {
     const minDate = new Date(2021, 0, 1); // Jan 1, 2021 — includes manual historical data
     let txs = syncedTransactions.filter(tx => {
       const d = tx.close_date || tx.firm_date || tx.listing_date;
       return d && new Date(d) >= minDate;
     });
     if (timeRange === 'year') {
       txs = txs.filter(tx => {
         const d = tx.close_date || tx.firm_date || tx.listing_date;
         return d && String(d).startsWith(selectedYear);
       });
     } else if (timeRange !== 'all') {
       const ranges: Record<string, Date> = {
         'ytd': new Date(thisYear, 0, 1),
         '12m': subMonths(now, 12),
         '6m': subMonths(now, 6),
         '3m': subMonths(now, 3),
       };
       const startDate = ranges[timeRange];
       if (startDate) {
         txs = txs.filter(tx => {
           const d = tx.close_date || tx.firm_date || tx.listing_date;
           return d && new Date(d) >= startDate;
         });
       }
     }
     if (dealTypeFilter === 'presale') txs = txs.filter(isPresaleTransaction);
     if (dealTypeFilter === 'resale') txs = txs.filter(tx => !isPresaleTransaction(tx));
     if (cityFilter !== 'all') txs = txs.filter(tx => normalizeCity(tx.city) === cityFilter);
     if (agentFilter !== 'all') txs = txs.filter(tx => getWritingAgents(tx).includes(agentFilter));
     return txs;
   }, [syncedTransactions, timeRange, selectedYear, dealTypeFilter, cityFilter, agentFilter, thisYear, now]);

  const monthsToShow = useMemo(() => {
    switch (timeRange) {
      case '3m': return 3;
      case '6m': return 6;
      case 'ytd': return now.getMonth() + 1;
      case '12m': return 12;
      case 'year': return 12;
      case 'all': return 48;
      default: return 12;
    }
  }, [timeRange, now]);

  // Core metrics
  const metrics = useMemo(() => {
    const closed = filteredTransactions.filter(tx => tx.status === 'closed');
    const active = filteredTransactions.filter(tx => tx.status === 'active');
    const all = [...closed, ...active];
    const totalEffectiveCommission = all.reduce((s, tx) => s + getEffectiveCommission(tx), 0);
    const closedEffectiveCommission = closed.reduce((s, tx) => s + getEffectiveCommission(tx), 0);
    const activeEffectiveCommission = active.reduce((s, tx) => s + getEffectiveCommission(tx), 0);
    const txsWithPrice = all.filter(tx => tx.sale_price && tx.sale_price > 100);
    const avgSalePrice = txsWithPrice.length > 0
      ? txsWithPrice.reduce((s, tx) => s + Number(tx.sale_price || 0), 0) / txsWithPrice.length
      : 0;
    const avgCommission = all.length > 0 ? totalEffectiveCommission / all.length : 0;
    const teamTxs = all.filter(tx => getTeamMemberFromTx(tx) !== null);
    const soloTxs = all.filter(tx => getTeamMemberFromTx(tx) === null);
    const totalVolume = all.reduce((s, tx) => s + Number(tx.sale_price || 0), 0);

    return {
      totalDeals: all.length, closedDeals: closed.length, activeDeals: active.length,
      totalEffectiveCommission, closedEffectiveCommission, activeEffectiveCommission,
      avgSalePrice, avgCommission,
      teamDeals: teamTxs.length, soloDeals: soloTxs.length, totalVolume,
    };
  }, [filteredTransactions]);

   // Previous period metrics for YoY comparison
   const previousMetrics = useMemo(() => {
     const minDate = new Date(2021, 0, 1); // Jan 1, 2021 — includes manual historical data
     let prevTxs = syncedTransactions.filter(tx => {
       const d = tx.close_date || tx.firm_date || tx.listing_date;
       return d && new Date(d) >= minDate;
     });
     if (timeRange === 'year') {
       const prevYear = String(parseInt(selectedYear) - 1);
       prevTxs = prevTxs.filter(tx => {
         const d = tx.close_date || tx.firm_date || tx.listing_date;
         return d && String(d).startsWith(prevYear);
       });
     } else if (timeRange !== 'all') {
       const offsets: Record<string, number> = { 'ytd': 12, '12m': 24, '6m': 12, '3m': 6 };
       const offset = offsets[timeRange] || 12;
       const prevStart = subMonths(now, offset);
       const prevEnd = subMonths(now, offset - monthsToShow);
       prevTxs = prevTxs.filter(tx => {
         const d = tx.close_date || tx.firm_date || tx.listing_date;
         if (!d) return false;
         const date = new Date(d);
         return date >= prevStart && date < prevEnd;
       });
     }
     if (dealTypeFilter === 'presale') prevTxs = prevTxs.filter(isPresaleTransaction);
     if (dealTypeFilter === 'resale') prevTxs = prevTxs.filter(tx => !isPresaleTransaction(tx));
     if (cityFilter !== 'all') prevTxs = prevTxs.filter(tx => normalizeCity(tx.city) === cityFilter);
     if (agentFilter !== 'all') prevTxs = prevTxs.filter(tx => getWritingAgents(tx).includes(agentFilter));

     const all = prevTxs;
     const totalGCI = all.reduce((s, tx) => s + getEffectiveCommission(tx), 0);
     return { totalDeals: all.length, totalGCI, totalVolume: all.reduce((s, tx) => s + Number(tx.sale_price || 0), 0) };
   }, [syncedTransactions, timeRange, selectedYear, dealTypeFilter, cityFilter, agentFilter, now, monthsToShow]);

  // Team member analytics
  const teamMemberData = useMemo(() => {
    const members: Record<string, {
      deals: number; closedDeals: number; totalGCI: number;
      userPortion: number; teamPortion: number; avgDeal: number; totalVolume: number;
    }> = {};
    filteredTransactions.forEach(tx => {
      const teamMember = getTeamMemberFromTx(tx);
      if (!teamMember) return;
      if (!members[teamMember]) members[teamMember] = { deals: 0, closedDeals: 0, totalGCI: 0, userPortion: 0, teamPortion: 0, avgDeal: 0, totalVolume: 0 };
      const m = members[teamMember];
      m.deals++;
      if (tx.status === 'closed') m.closedDeals++;
      const grossGCI = Number(tx.commission_amount || 0);
      const userNet = Number(tx.my_net_payout || 0);
      m.totalGCI += grossGCI;
      m.userPortion += userNet;
      m.teamPortion += grossGCI - userNet;
      m.totalVolume += Number(tx.sale_price || 0);
    });
    return Object.entries(members)
      .map(([name, data]) => ({ name, ...data, avgDeal: data.deals > 0 ? data.totalGCI / data.deals : 0 }))
      .sort((a, b) => b.deals - a.deals);
  }, [filteredTransactions]);

  // City analytics
  const cityData = useMemo(() => {
    const cities: Record<string, { count: number; closedCount: number; totalGCI: number; prices: number[] }> = {};
    filteredTransactions.forEach(tx => {
      const city = normalizeCity(tx.city);
      if (!cities[city]) cities[city] = { count: 0, closedCount: 0, totalGCI: 0, prices: [] };
      const c = cities[city];
      c.count++;
      if (tx.status === 'closed') c.closedCount++;
      c.totalGCI += getEffectiveCommission(tx);
      if (tx.sale_price && tx.sale_price > 100) c.prices.push(Number(tx.sale_price));
    });
    return Object.entries(cities)
      .map(([name, data]) => ({
        name, value: data.count, closedCount: data.closedCount, totalGCI: data.totalGCI,
        avgPrice: data.prices.length > 0 ? data.prices.reduce((s, p) => s + p, 0) / data.prices.length : 0,
      }))
      .sort((a, b) => b.value - a.value).slice(0, 12);
  }, [filteredTransactions]);

  // Lead source analytics
  const leadSourceData = useMemo(() => {
    const sources: Record<string, { count: number; gci: number }> = {};
    filteredTransactions.forEach(tx => {
      const source = tx.lead_source || 'Unknown';
      if (!sources[source]) sources[source] = { count: 0, gci: 0 };
      sources[source].count++;
      sources[source].gci += getEffectiveCommission(tx);
    });
    const total = filteredTransactions.length;
    return Object.entries(sources)
      .map(([name, data]) => ({ name, count: data.count, gci: data.gci, percentage: total > 0 ? (data.count / total) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTransactions]);

  // Presale vs Resale
  const presaleResaleData = useMemo(() => {
    const presale = filteredTransactions.filter(isPresaleTransaction);
    const resale = filteredTransactions.filter(tx => !isPresaleTransaction(tx));
    const getStats = (txs: any[]) => ({
      count: txs.length,
      gci: txs.reduce((s, tx) => s + getEffectiveCommission(tx), 0),
      avgCommission: txs.length > 0 ? txs.reduce((s, tx) => s + getEffectiveCommission(tx), 0) / txs.length : 0,
      volume: txs.reduce((s, tx) => s + Number(tx.sale_price || 0), 0),
    });
    return {
      presale: getStats(presale), resale: getStats(resale),
      comparisonData: [{ name: 'Presale', ...getStats(presale) }, { name: 'Resale', ...getStats(resale) }],
    };
  }, [filteredTransactions]);

  // GCI trends
  const gciTrends = useMemo(() => {
    const intervalStart = timeRange === 'year'
      ? new Date(parseInt(selectedYear), 0, 1)
      : subMonths(now, monthsToShow - 1);
    const intervalEnd = timeRange === 'year'
      ? new Date(parseInt(selectedYear), 11, 31)
      : now;
    const months = eachMonthOfInterval({ start: intervalStart, end: intervalEnd });
    let cumulative = 0;
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTxs = filteredTransactions.filter(tx => {
        const d = tx.close_date || tx.firm_date;
        if (!d) return false;
        return isWithinInterval(new Date(d), { start: monthStart, end: monthEnd });
      });
      const gci = monthTxs.reduce((s, tx) => s + getEffectiveCommission(tx), 0);
      cumulative += gci;
      return { month: format(month, 'MMM'), fullMonth: format(month, 'MMMM yyyy'), gci, cumulative, deals: monthTxs.length };
    });
  }, [filteredTransactions, now, monthsToShow, timeRange, selectedYear]);

  // Deals by month
  const dealsByMonth = useMemo(() => {
    const intervalStart = timeRange === 'year'
      ? new Date(parseInt(selectedYear), 0, 1)
      : subMonths(now, monthsToShow - 1);
    const intervalEnd = timeRange === 'year'
      ? new Date(parseInt(selectedYear), 11, 31)
      : now;
    const months = eachMonthOfInterval({ start: intervalStart, end: intervalEnd });
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTxs = filteredTransactions.filter(tx => {
        const d = tx.firm_date || tx.close_date;
        if (!d) return false;
        return isWithinInterval(new Date(d), { start: monthStart, end: monthEnd });
      });
      const closed = monthTxs.filter(tx => tx.status === 'closed');
      const active = monthTxs.filter(tx => tx.status === 'active');
      return {
        month: format(month, 'MMM'), fullMonth: format(month, 'MMMM yyyy'),
        closed: closed.length, pending: active.length, total: monthTxs.length,
        gci: monthTxs.reduce((s, tx) => s + getEffectiveCommission(tx), 0),
      };
    });
  }, [filteredTransactions, now, monthsToShow, timeRange, selectedYear]);

   // RevShare by month
   const revShareMonthly = useMemo(() => {
     const byYearMonth: Record<string, Record<number, number>> = {};
     revenueShares.forEach(rs => {
       if (!rs.period || rs.period === 'unknown') return;
       const [yearStr, monthStr] = rs.period.split('-');
       if (parseInt(yearStr) < 2023) return; // Exclude pre-2023 data
       if (!byYearMonth[yearStr]) byYearMonth[yearStr] = {};
       byYearMonth[yearStr][parseInt(monthStr)] = (byYearMonth[yearStr][parseInt(monthStr)] || 0) + Number(rs.amount);
     });
     const years = Object.keys(byYearMonth).sort();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      chartData: monthNames.map((name, i) => {
        const entry: Record<string, any> = { month: name };
        years.forEach(y => { entry[y] = byYearMonth[y]?.[i + 1] || 0; });
        return entry;
      }),
      years,
      yearlyTotals: years.map(y => ({
        year: y,
        total: Object.values(byYearMonth[y] || {}).reduce((s, v) => s + v, 0),
      })),
    };
  }, [revenueShares]);

  const revShareByTier = useMemo(() => {
    const tiers = networkSummary?.revshare_by_tier as any;
    if (!tiers?.tierRevshareResponses) return [];
    return (tiers.tierRevshareResponses as any[]).map((t: any) => ({
      tier: `Tier ${t.tier}`,
      earned: t.earnedRevshareAmount?.amount || 0,
      missed: t.missedRevshareAmount?.amount || 0,
      contributors: t.numberOfContributors || 0,
    })).filter((t: any) => t.earned > 0 || t.missed > 0 || t.contributors > 0);
  }, [networkSummary]);

  const hasFilters = dealTypeFilter !== 'all' || cityFilter !== 'all' || agentFilter !== 'all';

  return {
    // State & setters
    timeRange, setTimeRange, selectedYear, setSelectedYear,
    dealTypeFilter, setDealTypeFilter, cityFilter, setCityFilter,
    agentFilter, setAgentFilter,
    // Data
    syncedTransactions, filteredTransactions, revenueShares,
    availableYears, filterDimensions, hasFilters,
    metrics, previousMetrics, teamMemberData,
    cityData, leadSourceData, presaleResaleData,
    gciTrends, dealsByMonth, revShareMonthly, revShareByTier,
  };
}
