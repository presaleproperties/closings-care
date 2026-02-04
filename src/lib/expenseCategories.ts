// Centralized expense categories - shared between ExpensesPage and Dashboard components
export type ExpenseType = 'personal' | 'business' | 'rental' | 'taxes' | 'other';

export const expenseCategories: Record<ExpenseType, Record<string, string[]>> = {
  personal: {
    'Housing': ['Personal Mortgage', 'Strata Fees', 'Property Taxes', 'Hydro/Utilities', 'Internet'],
    'Transportation': ['Car Lease/Payment', 'Car Insurance (Personal)', 'Car Charging/Gas'],
    'Living': ['Phone (Personal)', 'Groceries', 'Entertainment/Dining', 'Gym/Fitness', 'Apps & Subscriptions'],
  },
  business: {
    'Office': ['Office Lease', 'Board Fees', 'Brokerage Fees'],
    'Technology': ['CRM (CHIME, etc.)', 'Website Hosting', 'Google Workspace', 'iCloud/Storage', 'Canva/Design Tools', 'Email Marketing (MailerLite)', 'Editing Apps', 'Other Software'],
    'Marketing': ['Facebook/Social Ads', 'Signs & Signage', 'Marketing Agency', 'Marketing Manager', 'Print Marketing'],
    'Transportation': ['Car (Business Use)', 'Car Insurance (Business)', 'Car Charging (Business)'],
    'Professional': ['BCFSA License', 'Real Estate License', 'Professional Development', 'Continuing Education'],
    'Client': ['Client Gifts', 'Staging/Clean-ups', 'Photography'],
    'Admin': ['Phone (Business)', 'Admin Support', 'Bookkeeping'],
  },
  rental: {
    'Rental Property': ['Rental Mortgage', 'Rental Strata Fees', 'Rental Property Tax', 'Property Management', 'Rental Insurance', 'Rental Repairs/Maintenance', 'Rental Utilities', 'Other Rental Expense'],
  },
  taxes: {
    'Taxes & Savings': ['Tax Set-Aside', 'GST/HST Remittance', 'Debt Pay Down'],
  },
  other: {
    'Other': ['Miscellaneous'],
  },
};

// Build a flat lookup map for fast category-to-type lookups
const categoryTypeMap = new Map<string, ExpenseType>();

Object.entries(expenseCategories).forEach(([type, groups]) => {
  Object.values(groups).forEach(items => {
    items.forEach(item => {
      categoryTypeMap.set(item.toLowerCase(), type as ExpenseType);
    });
  });
});

// Legacy prefix support - also check for "Business - Category" format
const legacyPrefixes: Record<string, ExpenseType> = {
  'personal -': 'personal',
  'business -': 'business',
  'rental -': 'rental',
};

export function getCategoryType(category: string): ExpenseType {
  if (!category) return 'other';
  
  // First try exact match (case-insensitive)
  const exactMatch = categoryTypeMap.get(category.toLowerCase());
  if (exactMatch) return exactMatch;
  
  // Check for legacy prefix format (e.g., "Business - Marketing")
  const lowerCategory = category.toLowerCase();
  for (const [prefix, type] of Object.entries(legacyPrefixes)) {
    if (lowerCategory.startsWith(prefix)) {
      return type;
    }
  }
  
  // Check if category contains known type keywords
  if (lowerCategory.includes('business') || lowerCategory === 'business') return 'business';
  if (lowerCategory.includes('personal') || lowerCategory === 'personal') return 'personal';
  if (lowerCategory.includes('rental') || lowerCategory === 'rental') return 'rental';
  if (lowerCategory.includes('tax')) return 'taxes';
  
  return 'other';
}

export function getAllCategoriesFlat(): { category: string; type: ExpenseType; group: string }[] {
  const result: { category: string; type: ExpenseType; group: string }[] = [];
  (Object.entries(expenseCategories) as [ExpenseType, Record<string, string[]>][]).forEach(([type, groups]) => {
    Object.entries(groups).forEach(([group, items]) => {
      items.forEach(item => result.push({ category: item, type, group }));
    });
  });
  return result;
}
