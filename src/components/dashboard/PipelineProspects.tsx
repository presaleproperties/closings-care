import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePipelineProspects, useAddProspect, useDeleteProspect } from '@/hooks/usePipelineProspects';
import { formatCurrency } from '@/lib/format';
import { Plus, X, Users, Home, DollarSign, TrendingUp } from 'lucide-react';

const HOME_TYPES = [
  'Detached',
  'Semi-Detached',
  'Townhouse',
  'Condo',
  'Pre-Sale',
  'Commercial',
  'Land',
  'Other',
];

export function PipelineProspects() {
  const { data: prospects = [] } = usePipelineProspects();
  const addProspect = useAddProspect();
  const deleteProspect = useDeleteProspect();

  const [isAdding, setIsAdding] = useState(false);
  const [clientName, setClientName] = useState('');
  const [homeType, setHomeType] = useState('Detached');
  const [commission, setCommission] = useState('');

  const totalPotential = prospects
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + Number(p.potential_commission), 0);

  const handleAdd = () => {
    if (!clientName.trim() || !commission) return;

    addProspect.mutate(
      {
        client_name: clientName.trim(),
        home_type: homeType,
        potential_commission: parseFloat(commission),
      },
      {
        onSuccess: () => {
          setClientName('');
          setCommission('');
          setHomeType('Detached');
          setIsAdding(false);
        },
      }
    );
  };

  return (
    <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Pipeline</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Active prospects</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Potential</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalPotential)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Prospect List */}
        <AnimatePresence mode="popLayout">
          {prospects.filter(p => p.status === 'active').length === 0 && !isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 text-muted-foreground"
            >
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No active prospects yet</p>
              <p className="text-xs mt-1">Add clients you're actively working with</p>
            </motion.div>
          )}

          {prospects
            .filter(p => p.status === 'active')
            .map((prospect) => (
              <motion.div
                key={prospect.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{prospect.client_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Home className="h-3 w-3" />
                      {prospect.home_type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {formatCurrency(prospect.potential_commission)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => deleteProspect.mutate(prospect.id)}
                    disabled={deleteProspect.isPending}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Add Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2.5 p-3 rounded-xl bg-muted/40 border border-border/30">
                <Input
                  placeholder="Client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-9 text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Select value={homeType} onValueChange={setHomeType}>
                    <SelectTrigger className="h-9 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOME_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Commission"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      className="h-9 text-sm pl-7"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={handleAdd}
                    disabled={!clientName.trim() || !commission || addProspect.isPending}
                  >
                    Add Prospect
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                    onClick={() => {
                      setIsAdding(false);
                      setClientName('');
                      setCommission('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Button */}
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs gap-1.5 border-dashed border-border/50"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Prospect
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
