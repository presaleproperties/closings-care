import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBulkImportDeals, useBulkImportExpenses } from '@/hooks/useDataImport';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePayout } from '@/hooks/usePayouts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Loader2, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

// 2025 Deals Data from Excel
const deals2025 = [
  { client_name: 'Harry & Kyoti Townhome', deal_type: 'SELL' as const, project_name: null, city: 'Langley', pending_date: '2025-01-15', close_date_actual: '2025-01-31', sale_price: 755900, gross_commission_actual: 11022, lead_source: 'Tiktok', status: 'CLOSED' as const },
  { client_name: 'Harry & Kyoti Detached', deal_type: 'BUY' as const, project_name: null, city: 'Surrey', pending_date: '2025-02-15', close_date_actual: '2025-02-28', sale_price: 1375000, gross_commission_actual: 17000, lead_source: 'Tiktok', status: 'CLOSED' as const },
  { client_name: 'Ray', deal_type: 'BUY' as const, project_name: 'Jericho 4', city: 'Vancouver', pending_date: '2025-02-15', close_date_actual: '2025-02-28', sale_price: 489900, gross_commission_actual: 14798, lead_source: 'Past Client', status: 'CLOSED' as const },
  { client_name: 'Mona', deal_type: 'BUY' as const, project_name: 'Jericho 4', city: 'Vancouver', pending_date: '2025-02-15', close_date_actual: '2025-02-28', sale_price: 489900, gross_commission_actual: 14798, lead_source: 'Past Client', status: 'CLOSED' as const },
  { client_name: 'Victor', deal_type: 'BUY' as const, project_name: 'Jericho 4', city: 'Vancouver', pending_date: '2025-03-15', close_date_actual: '2025-03-31', sale_price: 649900, gross_commission_actual: 17998, lead_source: 'Past Client', status: 'CLOSED' as const },
  { client_name: 'Mahvish', deal_type: 'BUY' as const, project_name: 'Solana B', city: 'Vancouver', pending_date: '2025-03-15', close_date_actual: '2025-03-31', sale_price: 504900, gross_commission_actual: 12980, lead_source: 'Referral', status: 'CLOSED' as const },
  { client_name: 'Fedrico & Sandra', deal_type: 'BUY' as const, project_name: 'Solana B', city: 'Vancouver', pending_date: '2025-03-15', close_date_actual: '2025-03-31', sale_price: 474900, gross_commission_actual: 11498, lead_source: 'Past Client', status: 'CLOSED' as const },
  { client_name: 'DakshPal Singh', deal_type: 'BUY' as const, project_name: 'Jericho 4', city: 'Vancouver', pending_date: '2025-04-15', close_date_actual: '2025-04-30', sale_price: 499900, gross_commission_actual: 17000, lead_source: 'Instagram', status: 'CLOSED' as const },
  { client_name: 'Iqjot Singh 308', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 419900, gross_commission_actual: 16899, lead_source: 'Instagram', status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 622', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 385900, gross_commission_actual: 3452, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 603', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 365900, gross_commission_actual: 3383, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 522', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 395900, gross_commission_actual: 3486, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 503', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 355900, gross_commission_actual: 3348, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 403', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 355900, gross_commission_actual: 3348, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 408', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 419900, gross_commission_actual: 3569, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 609', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 429900, gross_commission_actual: 0, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 222', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 379900, gross_commission_actual: 5682, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 422', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 379900, gross_commission_actual: 3432, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Sarbir 322', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 389900, gross_commission_actual: 0, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 303', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 364900, gross_commission_actual: 3348, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 211', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 599900, gross_commission_actual: 5691, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 319', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 399900, gross_commission_actual: 5001, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 314', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 369900, gross_commission_actual: 3397, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Uzair 320', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 399900, gross_commission_actual: 16688, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 514', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 369900, gross_commission_actual: 4879, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 614', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 369900, gross_commission_actual: 5647, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Sarbir 219', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-05-15', close_date_actual: '2025-05-31', sale_price: 429900, gross_commission_actual: 3604, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 420', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-06-15', close_date_actual: '2025-06-30', sale_price: 424900, gross_commission_actual: 5860, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Miwa & Makoto 410', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-06-15', close_date_actual: '2025-06-30', sale_price: 309900, gross_commission_actual: 18195, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Sarb 221', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-06-15', close_date_actual: '2025-06-30', sale_price: 419900, gross_commission_actual: 5091, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Mohan 414', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-06-15', close_date_actual: '2025-06-30', sale_price: 354900, gross_commission_actual: 18717, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 419 Fellow', deal_type: 'BUY' as const, project_name: 'Fellow', city: 'Vancouver', pending_date: '2025-06-15', close_date_actual: '2025-06-30', sale_price: 379900, gross_commission_actual: 4952, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Summer 2027' },
  { client_name: 'Ravish 420 Fellow', deal_type: 'BUY' as const, project_name: 'Fellow', city: 'Vancouver', pending_date: '2025-06-15', close_date_actual: '2025-06-30', sale_price: 379900, gross_commission_actual: 4952, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Summer 2027' },
  { client_name: 'Ravish 419 NV', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-06-15', close_date_actual: '2025-06-30', sale_price: 429900, gross_commission_actual: 5878, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 417', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-06-15', close_date_actual: '2025-06-30', sale_price: 424900, gross_commission_actual: 5860, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Sep 2026' },
  { client_name: 'Ravish 402', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 429900, gross_commission_actual: 5878, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Ravish 214 Atlin', deal_type: 'BUY' as const, project_name: 'Atlin', city: 'Vancouver', pending_date: '2025-06-15', close_date_actual: '2025-06-30', sale_price: 419900, gross_commission_actual: 2820, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Summer 2028' },
  { client_name: 'Riddha Pirzada 519', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 429900, gross_commission_actual: 19514, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Ravish Retirement 226', deal_type: 'SELL' as const, project_name: 'Bouliver Homes', city: 'Vancouver', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 309900, gross_commission_actual: 2250, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Ravish 2407', deal_type: 'BUY' as const, project_name: 'Civic Plaza', city: 'Vancouver', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 390000, gross_commission_actual: 3000, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Ravish 309 Atlin', deal_type: 'BUY' as const, project_name: 'Atlin', city: 'Vancouver', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 429900, gross_commission_actual: 2873, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Ravish 310 Atlin', deal_type: 'BUY' as const, project_name: 'Atlin', city: 'Vancouver', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 429900, gross_commission_actual: 0, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Marco Townhome', deal_type: 'SELL' as const, project_name: null, city: 'Richmond', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 1075000, gross_commission_actual: 16942, lead_source: 'Past Client', status: 'CLOSED' as const },
  { client_name: 'Marco Detached', deal_type: 'BUY' as const, project_name: null, city: 'Richmond', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 2198000, gross_commission_actual: 26222, lead_source: 'Past Client', status: 'CLOSED' as const },
  { client_name: 'Ravish 520 Fellow', deal_type: 'BUY' as const, project_name: 'Fellow', city: 'Vancouver', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 384900, gross_commission_actual: 4952, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Summer 2027' },
  { client_name: 'Sajjal', deal_type: 'BUY' as const, project_name: null, city: 'Richmond', pending_date: '2025-07-15', close_date_actual: '2025-07-31', sale_price: 765000, gross_commission_actual: 13400, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Ravish 201', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-08-15', close_date_actual: '2025-08-31', sale_price: 614900, gross_commission_actual: 4242, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Ravish Unit 28', deal_type: 'BUY' as const, project_name: '142 & 60th Ave', city: 'Vancouver', pending_date: '2025-08-15', close_date_actual: '2025-08-31', sale_price: 825000, gross_commission_actual: 3467, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Rajbir', deal_type: 'BUY' as const, project_name: 'Jericho Park 308', city: 'Vancouver', pending_date: '2025-10-15', close_date_actual: '2025-10-31', sale_price: 489900, gross_commission_actual: 17000, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Sarb Merchant 211', deal_type: 'BUY' as const, project_name: 'Merchant', city: 'Vancouver', pending_date: '2025-10-15', close_date_actual: '2025-10-31', sale_price: 399900, gross_commission_actual: 6500, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Ravish Steve', deal_type: 'BUY' as const, project_name: 'Jericho 4', city: 'Vancouver', pending_date: '2025-10-15', close_date_actual: '2025-10-31', sale_price: 424900, gross_commission_actual: 5250, lead_source: null, status: 'CLOSED' as const },
  { client_name: 'Ravish High Street', deal_type: 'BUY' as const, project_name: 'High Street 6', city: 'Vancouver', pending_date: '2025-10-15', close_date_actual: '2025-10-31', sale_price: 404900, gross_commission_actual: 4829, lead_source: null, status: 'CLOSED' as const, notes: 'Completion Summer 2027' },
  { client_name: 'Ravish 202', deal_type: 'BUY' as const, project_name: 'North Village', city: 'Vancouver', pending_date: '2025-11-15', close_date_est: '2025-11-30', sale_price: 439900, gross_commission_est: 5889, lead_source: null, status: 'PENDING' as const },
  { client_name: 'Ravish Client Thapa', deal_type: 'BUY' as const, project_name: '19567 64 Avenue', city: 'Vancouver', pending_date: '2025-11-15', close_date_est: '2025-11-30', sale_price: 470000, gross_commission_est: 2243, lead_source: null, status: 'PENDING' as const },
  { client_name: 'Ravish Pankaj', deal_type: 'BUY' as const, project_name: 'Jericho 4', city: 'Vancouver', pending_date: '2025-12-15', close_date_est: '2025-12-31', sale_price: 419900, gross_commission_est: 5250, lead_source: null, status: 'PENDING' as const },
  { client_name: 'Zain & Mehr', deal_type: 'BUY' as const, project_name: 'Rail District', city: 'Vancouver', pending_date: '2025-12-15', close_date_est: '2025-12-31', sale_price: 699900, gross_commission_est: 15800, lead_source: null, status: 'PENDING' as const },
  { client_name: 'Alia Aunti & Amar + Saad', deal_type: 'BUY' as const, project_name: '13520 - 60th Ave', city: 'Vancouver', pending_date: '2025-12-15', close_date_est: '2025-12-31', sale_price: 1240000, gross_commission_est: 16502, lead_source: null, status: 'PENDING' as const },
];

// 2025 Monthly Expenses from Excel (Personal + Business)
const expenses2025 = [
  // January
  { category: 'Internet', month: '2025-01', amount: 60 },
  { category: 'Mortgage', month: '2025-01', amount: 1680 },
  { category: 'Gym', month: '2025-01', amount: 60 },
  { category: 'Apps/Subscriptions', month: '2025-01', amount: 50 },
  { category: 'Amna Car Lease', month: '2025-01', amount: 815 },
  { category: 'Car Insurance Personal', month: '2025-01', amount: 350 },
  { category: 'Entertainment/Eat Out', month: '2025-01', amount: 1000 },
  { category: 'Groceries', month: '2025-01', amount: 500 },
  { category: 'Hydro', month: '2025-01', amount: 80 },
  { category: 'Strata', month: '2025-01', amount: 314 },
  { category: 'Property Taxes', month: '2025-01', amount: 120 },
  { category: 'Phone Amna', month: '2025-01', amount: 55 },
  { category: 'Car Charging Personal', month: '2025-01', amount: 75 },
  { category: 'Board Fee', month: '2025-01', amount: 117 },
  { category: 'Office Lease', month: '2025-01', amount: 1795 },
  { category: 'CHIME', month: '2025-01', amount: 150 },
  { category: 'Site Ground', month: '2025-01', amount: 50 },
  { category: 'Real Broker', month: '2025-01', amount: 100 },
  { category: 'Phone Business', month: '2025-01', amount: 60 },
  { category: 'Car Business', month: '2025-01', amount: 878 },
  { category: 'Car Insurance Business', month: '2025-01', amount: 293 },
  { category: 'Car Charging Business', month: '2025-01', amount: 75 },
  { category: 'Canva', month: '2025-01', amount: 17 },
  { category: 'Mailer Lite', month: '2025-01', amount: 45 },
  { category: 'Google Work Space', month: '2025-01', amount: 35 },
  { category: 'iCloud Storage', month: '2025-01', amount: 5 },
  { category: 'Other Apps', month: '2025-01', amount: 100 },
  { category: 'Facebook Ads', month: '2025-01', amount: 500 },
  { category: 'Editing App', month: '2025-01', amount: 15 },
  { category: 'Marketing Manager', month: '2025-01', amount: 4500 },
  // February
  { category: 'Internet', month: '2025-02', amount: 60 },
  { category: 'Mortgage', month: '2025-02', amount: 1680 },
  { category: 'Gym', month: '2025-02', amount: 60 },
  { category: 'Apps/Subscriptions', month: '2025-02', amount: 50 },
  { category: 'Amna Car Lease', month: '2025-02', amount: 883 },
  { category: 'Car Insurance Personal', month: '2025-02', amount: 350 },
  { category: 'Entertainment/Eat Out', month: '2025-02', amount: 1000 },
  { category: 'Groceries', month: '2025-02', amount: 500 },
  { category: 'Hydro', month: '2025-02', amount: 80 },
  { category: 'Strata', month: '2025-02', amount: 314 },
  { category: 'Property Taxes', month: '2025-02', amount: 120 },
  { category: 'Phone Amna', month: '2025-02', amount: 55 },
  { category: 'Car Charging Personal', month: '2025-02', amount: 75 },
  { category: 'Board Fee', month: '2025-02', amount: 117 },
  { category: 'Office Lease', month: '2025-02', amount: 1795 },
  { category: 'CHIME', month: '2025-02', amount: 150 },
  { category: 'Site Ground', month: '2025-02', amount: 50 },
  { category: 'Real Broker', month: '2025-02', amount: 100 },
  { category: 'Phone Business', month: '2025-02', amount: 60 },
  { category: 'Car Business', month: '2025-02', amount: 1621 },
  { category: 'Car Insurance Business', month: '2025-02', amount: 293 },
  { category: 'Car Charging Business', month: '2025-02', amount: 75 },
  { category: 'Canva', month: '2025-02', amount: 17 },
  { category: 'Mailer Lite', month: '2025-02', amount: 45 },
  { category: 'Google Work Space', month: '2025-02', amount: 35 },
  { category: 'iCloud Storage', month: '2025-02', amount: 5 },
  { category: 'Other Apps', month: '2025-02', amount: 100 },
  { category: 'Facebook Ads', month: '2025-02', amount: 500 },
  { category: 'Editing App', month: '2025-02', amount: 15 },
  { category: 'Marketing Manager', month: '2025-02', amount: 4500 },
  { category: 'Client Gift', month: '2025-02', amount: 1295 },
  // March
  { category: 'Internet', month: '2025-03', amount: 60 },
  { category: 'Mortgage', month: '2025-03', amount: 1680 },
  { category: 'Gym', month: '2025-03', amount: 60 },
  { category: 'Apps/Subscriptions', month: '2025-03', amount: 50 },
  { category: 'Amna Car Lease', month: '2025-03', amount: 883 },
  { category: 'Car Insurance Personal', month: '2025-03', amount: 350 },
  { category: 'Entertainment/Eat Out', month: '2025-03', amount: 1000 },
  { category: 'Groceries', month: '2025-03', amount: 500 },
  { category: 'Hydro', month: '2025-03', amount: 80 },
  { category: 'Strata', month: '2025-03', amount: 347 },
  { category: 'Property Taxes', month: '2025-03', amount: 120 },
  { category: 'Phone Amna', month: '2025-03', amount: 55 },
  { category: 'Car Charging Personal', month: '2025-03', amount: 75 },
  { category: 'Board Fee', month: '2025-03', amount: 117 },
  { category: 'Office Lease', month: '2025-03', amount: 1795 },
  { category: 'CHIME', month: '2025-03', amount: 150 },
  { category: 'Site Ground', month: '2025-03', amount: 50 },
  { category: 'Real Broker', month: '2025-03', amount: 100 },
  { category: 'Phone Business', month: '2025-03', amount: 60 },
  { category: 'Car Business', month: '2025-03', amount: 1621 },
  { category: 'Car Insurance Business', month: '2025-03', amount: 293 },
  { category: 'Car Charging Business', month: '2025-03', amount: 75 },
  { category: 'Canva', month: '2025-03', amount: 17 },
  { category: 'Mailer Lite', month: '2025-03', amount: 45 },
  { category: 'Google Work Space', month: '2025-03', amount: 35 },
  { category: 'iCloud Storage', month: '2025-03', amount: 5 },
  { category: 'Other Apps', month: '2025-03', amount: 100 },
  { category: 'Facebook Ads', month: '2025-03', amount: 500 },
  { category: 'Editing App', month: '2025-03', amount: 15 },
  { category: 'Marketing Manager', month: '2025-03', amount: 4500 },
  // April
  { category: 'Internet', month: '2025-04', amount: 60 },
  { category: 'Mortgage', month: '2025-04', amount: 1680 },
  { category: 'Gym', month: '2025-04', amount: 60 },
  { category: 'Apps/Subscriptions', month: '2025-04', amount: 50 },
  { category: 'Amna Car Lease', month: '2025-04', amount: 883 },
  { category: 'Car Insurance Personal', month: '2025-04', amount: 350 },
  { category: 'Entertainment/Eat Out', month: '2025-04', amount: 1000 },
  { category: 'Groceries', month: '2025-04', amount: 500 },
  { category: 'Hydro', month: '2025-04', amount: 80 },
  { category: 'Strata', month: '2025-04', amount: 347 },
  { category: 'Property Taxes', month: '2025-04', amount: 120 },
  { category: 'Phone Amna', month: '2025-04', amount: 55 },
  { category: 'Car Charging Personal', month: '2025-04', amount: 75 },
  { category: 'Board Fee', month: '2025-04', amount: 117 },
  { category: 'Office Lease', month: '2025-04', amount: 1795 },
  { category: 'CHIME', month: '2025-04', amount: 150 },
  { category: 'Site Ground', month: '2025-04', amount: 50 },
  { category: 'Real Broker', month: '2025-04', amount: 100 },
  { category: 'Phone Business', month: '2025-04', amount: 60 },
  { category: 'Car Business', month: '2025-04', amount: 1621 },
  { category: 'Car Insurance Business', month: '2025-04', amount: 293 },
  { category: 'Car Charging Business', month: '2025-04', amount: 75 },
  { category: 'Canva', month: '2025-04', amount: 17 },
  { category: 'Mailer Lite', month: '2025-04', amount: 45 },
  { category: 'Google Work Space', month: '2025-04', amount: 35 },
  { category: 'iCloud Storage', month: '2025-04', amount: 5 },
  { category: 'Other Apps', month: '2025-04', amount: 100 },
  { category: 'Facebook Ads', month: '2025-04', amount: 500 },
  { category: 'Editing App', month: '2025-04', amount: 15 },
  { category: 'Marketing Manager', month: '2025-04', amount: 4500 },
  // May-December (simplified - reduced office lease, no marketing manager)
  ...['05', '06', '07', '08', '09', '10', '11', '12'].flatMap(m => [
    { category: 'Internet', month: `2025-${m}`, amount: 60 },
    { category: 'Mortgage', month: `2025-${m}`, amount: 3687 },
    { category: 'Gym', month: `2025-${m}`, amount: 70 },
    { category: 'Apps/Subscriptions', month: `2025-${m}`, amount: 50 },
    { category: 'Amna Car Lease', month: `2025-${m}`, amount: 883 },
    { category: 'Car Insurance Personal', month: `2025-${m}`, amount: 350 },
    { category: 'Entertainment/Eat Out', month: `2025-${m}`, amount: 1000 },
    { category: 'Groceries', month: `2025-${m}`, amount: 500 },
    { category: 'Hydro', month: `2025-${m}`, amount: 200 },
    { category: 'Strata', month: `2025-${m}`, amount: 347 },
    { category: 'Property Taxes', month: `2025-${m}`, amount: 120 },
    { category: 'Phone Amna', month: `2025-${m}`, amount: 55 },
    { category: 'Car Charging Personal', month: `2025-${m}`, amount: 50 },
    { category: 'Board Fee', month: `2025-${m}`, amount: 117 },
    { category: 'Office Lease', month: `2025-${m}`, amount: m <= '07' ? 850 : 0 },
    { category: 'CHIME', month: `2025-${m}`, amount: 150 },
    { category: 'Site Ground', month: `2025-${m}`, amount: 50 },
    { category: 'Real Broker', month: `2025-${m}`, amount: 100 },
    { category: 'Phone Business', month: `2025-${m}`, amount: 60 },
    { category: 'Car Business', month: `2025-${m}`, amount: 1621 },
    { category: 'Car Insurance Business', month: `2025-${m}`, amount: 293 },
    { category: 'Car Charging Business', month: `2025-${m}`, amount: 50 },
    { category: 'Canva', month: `2025-${m}`, amount: 17 },
    { category: 'Mailer Lite', month: `2025-${m}`, amount: 45 },
    { category: 'Google Work Space', month: `2025-${m}`, amount: 35 },
    { category: 'iCloud Storage', month: `2025-${m}`, amount: m >= '08' ? 13 : 5 },
    { category: 'Other Apps', month: `2025-${m}`, amount: 100 },
    { category: 'Facebook Ads', month: `2025-${m}`, amount: 500 },
    { category: 'Editing App', month: `2025-${m}`, amount: 15 },
  ]),
];

export default function Import2025Page() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [importing, setImporting] = useState(false);
  const [dealsImported, setDealsImported] = useState(false);
  const [expensesImported, setExpensesImported] = useState(false);
  const [payoutsImported, setPayoutsImported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImportAll = async () => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      // 1. Import deals
      const dealsWithUser = deals2025.map(deal => ({
        ...deal,
        user_id: user.id,
      }));

      const { data: insertedDeals, error: dealsError } = await supabase
        .from('deals')
        .insert(dealsWithUser)
        .select();

      if (dealsError) throw new Error(`Deals: ${dealsError.message}`);
      setDealsImported(true);
      toast.success(`Imported ${insertedDeals?.length || 0} deals`);

      // 2. Create payouts for deals with completion notes
      if (insertedDeals) {
        const payouts: any[] = [];
        
        insertedDeals.forEach(deal => {
          // Create Advance payout (paid for most deals)
          if (deal.gross_commission_actual && deal.gross_commission_actual > 0) {
            payouts.push({
              user_id: user.id,
              deal_id: deal.id,
              payout_type: 'Advance',
              amount: deal.gross_commission_actual,
              due_date: deal.close_date_actual || deal.close_date_est,
              status: deal.status === 'CLOSED' ? 'PAID' : 'PROJECTED',
              paid_date: deal.status === 'CLOSED' ? deal.close_date_actual : null,
            });
          }

          // If notes mention completion in the future, add a Completion payout
          if (deal.notes?.includes('Completion')) {
            let completionDate = '2026-09-30';
            if (deal.notes.includes('Summer 2027')) completionDate = '2027-06-30';
            if (deal.notes.includes('Summer 2028')) completionDate = '2028-06-30';
            
            payouts.push({
              user_id: user.id,
              deal_id: deal.id,
              payout_type: 'Completion',
              amount: 0, // Amount TBD
              due_date: completionDate,
              status: 'PROJECTED',
            });
          }
        });

        if (payouts.length > 0) {
          const { error: payoutsError } = await supabase
            .from('payouts')
            .insert(payouts);

          if (payoutsError) throw new Error(`Payouts: ${payoutsError.message}`);
          toast.success(`Created ${payouts.length} payouts`);
        }
        setPayoutsImported(true);
      }

      // 3. Import expenses
      const expensesWithUser = expenses2025.map(exp => ({
        ...exp,
        user_id: user.id,
      }));

      const { data: insertedExpenses, error: expensesError } = await supabase
        .from('expenses')
        .insert(expensesWithUser);

      if (expensesError) throw new Error(`Expenses: ${expensesError.message}`);
      setExpensesImported(true);
      toast.success(`Imported ${expenses2025.length} expense records`);

      toast.success('All 2025 data imported successfully!');
      
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setImporting(false);
    }
  };

  const allDone = dealsImported && expensesImported && payoutsImported;

  return (
    <AppLayout>
      <Header title="Import 2025 Data" subtitle="From your Excel tracker" />

      <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-accent" />
              2025 Mass Production Tracker
            </CardTitle>
            <CardDescription>
              Import all deals, payouts, and expenses from your 2025 Excel file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {dealsImported ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{deals2025.length} Deals</p>
                  <p className="text-sm text-muted-foreground">All closed and pending deals from 2025</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {payoutsImported ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Payouts</p>
                  <p className="text-sm text-muted-foreground">Advance payments + future completions</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {expensesImported ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{expenses2025.length} Expense Records</p>
                  <p className="text-sm text-muted-foreground">Personal and business expenses by month</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {allDone ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">All data imported successfully!</p>
                </div>
                <Button onClick={() => navigate('/dashboard/2025')} className="w-full">
                  View 2025 Dashboard
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleImportAll} 
                disabled={importing}
                className="w-full"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import All 2025 Data
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
