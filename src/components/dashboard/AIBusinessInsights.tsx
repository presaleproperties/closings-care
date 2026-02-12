import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target, TrendingUp, Users, Calendar, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { format, parseISO, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface AIBusinessInsightsProps {
  syncedTransactions: any[];
}

const YEARLY_TARGET = 100;

export function AIBusinessInsights({ syncedTransactions }: AIBusinessInsightsProps) {
  const navigate = useNavigate();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const now = new Date();
  const thisYear = now.getFullYear();

  // Filter transactions this year (using close_date as primary, fallback to listing_date)
  const yearlyTx = useMemo(() => {
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    return syncedTransactions.filter((tx: any) => {
      const date = tx.close_date || tx.listing_date || tx.synced_at;
      if (!date) return false;
      return isWithinInterval(new Date(date), { start: yearStart, end: yearEnd });
    });
  }, [syncedTransactions, now]);

  // Deals by month
  const dealsByMonth = useMemo(() => {
    const months: Record<string, { count: number; txs: any[] }> = {};
    
    yearlyTx.forEach((tx: any) => {
      const date = tx.close_date || tx.listing_date || tx.synced_at;
      const monthKey = format(new Date(date), 'MMM yyyy');
      
      if (!months[monthKey]) {
        months[monthKey] = { count: 0, txs: [] };
      }
      months[monthKey].count++;
      months[monthKey].txs.push(tx);
    });
    
    return months;
  }, [yearlyTx]);

  const sortedMonths = useMemo(() => {
    return Object.entries(dealsByMonth)
      .sort((a, b) => {
        const dateA = new Date(a[1].txs[0].close_date || a[1].txs[0].listing_date || a[1].txs[0].synced_at);
        const dateB = new Date(b[1].txs[0].close_date || b[1].txs[0].listing_date || b[1].txs[0].synced_at);
        return dateA.getTime() - dateB.getTime();
      });
  }, [dealsByMonth]);

  // Lead source breakdown
  const leadSourceBreakdown = useMemo(() => {
    const sources: Record<string, number> = {};
    yearlyTx.forEach((tx: any) => {
      const source = tx.lead_source || 'Unknown';
      sources[source] = (sources[source] || 0) + 1;
    });
    return Object.entries(sources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [yearlyTx]);

  // City breakdown
  const cityBreakdown = useMemo(() => {
    const cities: Record<string, number> = {};
    yearlyTx.forEach((tx: any) => {
      const city = tx.city || 'Unknown';
      cities[city] = (cities[city] || 0) + 1;
    });
    return Object.entries(cities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [yearlyTx]);

  const progressPercent = Math.min((yearlyTx.length / YEARLY_TARGET) * 100, 100);
  const dealsRemaining = Math.max(YEARLY_TARGET - yearlyTx.length, 0);
  const monthsRemaining = 12 - now.getMonth();
  const dealsPerMonthNeeded = monthsRemaining > 0 ? Math.ceil(dealsRemaining / monthsRemaining) : dealsRemaining;

  const generateInsight = async () => {
    setIsLoading(true);
    try {
      const topSource = leadSourceBreakdown[0];
      
      const prompt = `You are a business coach for a real estate agent. Analyze this data and provide 2-3 actionable insights in a friendly, encouraging tone. Keep it under 150 words.

Data for ${thisYear}:
- Total transactions: ${yearlyTx.length}
- Target: ${YEARLY_TARGET} deals
- Deals remaining: ${dealsRemaining}
- Months left: ${monthsRemaining}
- Need ${dealsPerMonthNeeded} deals/month to hit target

Top lead sources:
${leadSourceBreakdown.map(([source, count]) => `- ${source}: ${count} deals`).join('\n')}

Top cities:
${cityBreakdown.map(([city, count]) => `- ${city}: ${count} deals`).join('\n')}

Monthly breakdown:
${sortedMonths.map(([month, data]) => `- ${month}: ${data.count} deals`).join('\n')}

Focus on: Where should they double down? Any concerning trends? Celebrate wins!`;

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          messages: [{ role: 'user', content: prompt }],
          type: 'business-insight'
        }
      });

      if (error) throw error;
      setAiInsight(data.response || data.message || 'Unable to generate insight at this time.');
    } catch (err) {
      console.error('AI insight error:', err);
      const topSource = leadSourceBreakdown[0];
      setAiInsight(`📊 Your top lead source is ${topSource?.[0] || 'Unknown'} with ${topSource?.[1] || 0} deals. You're at ${yearlyTx.length}/${YEARLY_TARGET} deals for ${thisYear}. ${dealsRemaining > 0 ? `Need ${dealsPerMonthNeeded} deals/month to hit your target!` : '🎉 You hit your target!'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>
            AI Business Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsight}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : aiInsight ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {aiInsight ? 'Refresh' : 'Get Insights'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Yearly Target Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold">{thisYear} Deal Target</span>
            </div>
            <Badge variant={progressPercent >= 100 ? 'default' : progressPercent >= 50 ? 'secondary' : 'outline'}>
              {yearlyTx.length} / {YEARLY_TARGET}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{dealsRemaining} deals to go</span>
            <span>{dealsPerMonthNeeded} deals/month needed</span>
          </div>
        </div>

        {/* AI Insight Box */}
        <AnimatePresence>
          {aiInsight && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deals by Month */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-sm">Transactions by Month</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {sortedMonths.length > 0 ? (
              sortedMonths.map(([month, data]) => (
                <button
                  key={month}
                  onClick={() => navigate('/deals')}
                  className="p-3 rounded-xl bg-muted/50 text-center hover:bg-muted transition-colors cursor-pointer group"
                >
                  <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">{data.count}</div>
                  <div className="text-xs text-muted-foreground">{month}</div>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-4">
                No transactions yet this year
              </div>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Top Lead Sources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-sm">Where Business Comes From</span>
            </div>
            <div className="space-y-2">
              {leadSourceBreakdown.length > 0 ? (
                leadSourceBreakdown.map(([source, count], idx) => (
                  <button
                    key={source}
                    onClick={() => navigate('/deals')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-emerald-500/20 text-emerald-600' :
                        idx === 1 ? 'bg-blue-500/20 text-blue-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium">{source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">{count} deals</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No lead sources recorded
                </div>
              )}
            </div>
          </div>

          {/* Top Cities */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-sm">Top Cities</span>
            </div>
            <div className="space-y-2">
              {cityBreakdown.length > 0 ? (
                cityBreakdown.map(([city, count], idx) => (
                  <button
                    key={city}
                    onClick={() => navigate('/deals')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-600'
                      }`}>
                        {city.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">{count}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No city data
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
