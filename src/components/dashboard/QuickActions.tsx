import { Link } from 'react-router-dom';
import { Plus, FileText, Receipt, TrendingUp, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link to="/deals/new">
        <Button className="btn-premium gap-2">
          <Plus className="h-4 w-4" />
          New Deal
        </Button>
      </Link>
      <Link to="/expenses">
        <Button variant="outline" className="gap-2">
          <Receipt className="h-4 w-4" />
          Add Expense
        </Button>
      </Link>
      <Link to="/forecast">
        <Button variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Forecast
        </Button>
      </Link>
      <Link to="/import">
        <Button variant="ghost" className="gap-2">
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </Link>
    </div>
  );
}
