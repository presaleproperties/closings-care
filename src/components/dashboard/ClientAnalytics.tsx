import { useMemo } from 'react';
import { Users, MapPin, Building2 } from 'lucide-react';
import { Deal, Payout } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ClientAnalyticsProps {
  deals: Deal[];
  payouts: Payout[];
}

const COLORS = ['hsl(160, 84%, 39%)', 'hsl(168, 76%, 42%)', 'hsl(187, 92%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export function ClientAnalytics({ deals, payouts }: ClientAnalyticsProps) {
  const analytics = useMemo(() => {
    // Lead source breakdown
    const leadSourceMap = new Map<string, { count: number; revenue: number }>();
    deals.forEach(deal => {
      const source = deal.lead_source || 'Unknown';
      const existing = leadSourceMap.get(source) || { count: 0, revenue: 0 };
      const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
      const revenue = dealPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      leadSourceMap.set(source, {
        count: existing.count + 1,
        revenue: existing.revenue + revenue,
      });
    });
    const leadSources = Array.from(leadSourceMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    // Property type breakdown
    const propertyTypeMap = new Map<string, { count: number; revenue: number }>();
    deals.forEach(deal => {
      const type = deal.property_type || 'Unknown';
      const existing = propertyTypeMap.get(type) || { count: 0, revenue: 0 };
      const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
      const revenue = dealPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      propertyTypeMap.set(type, {
        count: existing.count + 1,
        revenue: existing.revenue + revenue,
      });
    });
    const propertyTypes = Array.from(propertyTypeMap.entries())
      .map(([name, data]) => ({ name: name === 'PRESALE' ? 'Pre-Sale' : name === 'RESALE' ? 'Resale' : name, ...data }))
      .sort((a, b) => b.count - a.count);

    // Deal type (Buy vs Sell)
    const dealTypeMap = new Map<string, { count: number; revenue: number }>();
    deals.forEach(deal => {
      const type = deal.deal_type;
      const existing = dealTypeMap.get(type) || { count: 0, revenue: 0 };
      const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
      const revenue = dealPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      dealTypeMap.set(type, {
        count: existing.count + 1,
        revenue: existing.revenue + revenue,
      });
    });
    const dealTypes = Array.from(dealTypeMap.entries())
      .map(([name, data]) => ({ name: name === 'BUY' ? 'Buyer Rep' : 'Seller Rep', ...data }))
      .sort((a, b) => b.count - a.count);

    return { leadSources, propertyTypes, dealTypes };
  }, [deals, payouts]);

  const renderCustomLabel = ({ name, percent }: { name: string; percent: number }) => {
    return percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '';
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Lead Sources */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Lead Sources</h3>
        </div>
        {analytics.leadSources.length > 0 ? (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.leadSources}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {analytics.leadSources.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {analytics.leadSources.slice(0, 4).map((source, i) => (
                <div key={source.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{source.name}</span>
                  </div>
                  <span className="font-medium">{source.count} deals</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
            No data yet. Add lead sources to your deals.
          </div>
        )}
      </div>

      {/* Property Types */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Property Types</h3>
        </div>
        {analytics.propertyTypes.length > 0 ? (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.propertyTypes}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {analytics.propertyTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {analytics.propertyTypes.map((type, i) => (
                <div key={type.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{type.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(type.revenue)}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        )}
      </div>

      {/* Deal Types */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Client Type</h3>
        </div>
        {analytics.dealTypes.length > 0 ? (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.dealTypes}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {analytics.dealTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {analytics.dealTypes.map((type, i) => (
                <div key={type.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{type.name}</span>
                  </div>
                  <span className="font-medium">{type.count} ({formatCurrency(type.revenue)})</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}
