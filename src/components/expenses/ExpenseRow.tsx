import { Pencil, Trash2, Calendar, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ExpenseRowProps {
  expense: any;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  getDisplayAmount: (expense: any) => number;
  onEdit: (expense: any) => void;
  onDelete: (id: string) => void;
}

export function ExpenseRow({ expense, icon: Icon, iconBg, iconColor, getDisplayAmount, onEdit, onDelete }: ExpenseRowProps) {
  const recurrence = expense.recurrence || 'monthly';
  const displayAmount = getDisplayAmount(expense);

  return (
    <div className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors group">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{expense.category}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {recurrence !== 'monthly' && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {recurrence}
            </span>
          )}
          {expense.is_tax_deductible && (
            <span className="text-emerald-500">Tax Ded.</span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold">{formatCurrency(displayAmount)}</p>
        {recurrence === 'weekly' && (
          <p className="text-[10px] text-muted-foreground">${expense.amount}/wk</p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(expense)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
