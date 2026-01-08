import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ImportType = 'deals' | 'payouts' | 'expenses';

const columnOptions = {
  deals: [
    'client_name',
    'deal_type',
    'address',
    'project_name',
    'city',
    'listing_date',
    'pending_date',
    'close_date_est',
    'close_date_actual',
    'sale_price',
    'gross_commission_est',
    'net_commission_est',
    'status',
    'team_member',
    'lead_source',
    'notes',
    '-- skip --',
  ],
  payouts: [
    'deal_client_name',
    'payout_type',
    'amount',
    'due_date',
    'status',
    'paid_date',
    'notes',
    '-- skip --',
  ],
  expenses: [
    'category',
    'month',
    'amount',
    'notes',
    '-- skip --',
  ],
};

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportType>('deals');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string[][]>([]);
  const [status, setStatus] = useState<'idle' | 'ready' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setStatus('error');
      setErrorMessage('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map((line) => 
        line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))
      );

      if (lines.length < 2) {
        setStatus('error');
        setErrorMessage('CSV must have at least a header row and one data row');
        return;
      }

      const headerRow = lines[0];
      setHeaders(headerRow);
      setPreview(lines.slice(1, 6)); // First 5 data rows
      
      // Auto-map columns
      const mapping: Record<string, string> = {};
      headerRow.forEach((header) => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '_');
        const options = columnOptions[importType];
        const match = options.find((opt) => 
          opt !== '-- skip --' && normalizedHeader.includes(opt.replace('_', ''))
        );
        if (match) {
          mapping[header] = match;
        }
      });
      setColumnMapping(mapping);
      setStatus('ready');
      setErrorMessage('');
    };

    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    // This is a scaffold - actual import logic would go here
    setStatus('success');
  };

  return (
    <AppLayout>
      <Header 
        title="Import Data" 
        subtitle="Import deals, payouts, or expenses from CSV"
        showAddDeal={false}
      />

      <div className="p-4 lg:p-6 max-w-4xl animate-fade-in">
        <Tabs value={importType} onValueChange={(v) => {
          setImportType(v as ImportType);
          setFile(null);
          setHeaders([]);
          setPreview([]);
          setStatus('idle');
        }}>
          <TabsList>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value={importType} className="mt-6 space-y-6">
            {/* File Upload */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-semibold mb-4">1. Select CSV File</h2>
              
              <label className="block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {file ? (
                    <p className="font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="font-medium mb-1">Click to upload CSV</p>
                      <p className="text-sm text-muted-foreground">or drag and drop</p>
                    </>
                  )}
                </div>
              </label>

              {status === 'error' && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Column Mapping */}
            {headers.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold mb-4">2. Map Columns</h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {headers.map((header) => (
                    <div key={header} className="flex items-center gap-4">
                      <div className="flex-1 truncate text-sm font-medium">
                        {header}
                      </div>
                      <Select
                        value={columnMapping[header] || '-- skip --'}
                        onValueChange={(v) => setColumnMapping((m) => ({ ...m, [header]: v }))}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {columnOptions[importType].map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt === '-- skip --' ? '-- Skip Column --' : opt.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            {preview.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold mb-4">3. Preview (First 5 rows)</h2>
                
                <div className="overflow-x-auto">
                  <table className="data-table text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        {headers.map((header) => (
                          <th key={header} className="whitespace-nowrap">
                            {columnMapping[header] && columnMapping[header] !== '-- skip --' 
                              ? columnMapping[header].replace(/_/g, ' ')
                              : <span className="text-muted-foreground">(skipped)</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className="whitespace-nowrap">
                              {cell || <span className="text-muted-foreground">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import Button */}
            {status === 'ready' && (
              <div className="flex justify-end">
                <Button onClick={handleImport} className="btn-premium">
                  <Upload className="w-4 h-4 mr-2" />
                  Import {importType.charAt(0).toUpperCase() + importType.slice(1)}
                </Button>
              </div>
            )}

            {/* Success Message */}
            {status === 'success' && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-success">Import Scaffold Ready</p>
                  <p className="text-sm text-muted-foreground">
                    This is a scaffold. In a production app, the data would be validated and inserted into the database.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
