// Canadian Tax Calculator for Real Estate Professionals
// Based on 2024/2025 CRA tax brackets

export type TaxType = 'self-employed' | 'corporation';
export type Province = 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export interface TaxBreakdown {
  federalTax: number;
  provincialTax: number;
  cppContributions: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  takeHome: number;
}

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// Federal Tax Brackets 2024/2025
const FEDERAL_BRACKETS: TaxBracket[] = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 173205, rate: 0.26 },
  { min: 173205, max: 246752, rate: 0.29 },
  { min: 246752, max: Infinity, rate: 0.33 },
];

// Provincial Tax Brackets 2024/2025 (sourced from CRA)
const PROVINCIAL_BRACKETS: Record<Province, TaxBracket[]> = {
  AB: [ // Alberta
    { min: 0, max: 148269, rate: 0.10 },
    { min: 148269, max: 177922, rate: 0.12 },
    { min: 177922, max: 237230, rate: 0.13 },
    { min: 237230, max: 355845, rate: 0.14 },
    { min: 355845, max: Infinity, rate: 0.15 },
  ],
  BC: [ // British Columbia
    { min: 0, max: 47937, rate: 0.0506 },
    { min: 47937, max: 95875, rate: 0.077 },
    { min: 95875, max: 110076, rate: 0.105 },
    { min: 110076, max: 133664, rate: 0.1229 },
    { min: 133664, max: 181232, rate: 0.147 },
    { min: 181232, max: 252752, rate: 0.168 },
    { min: 252752, max: Infinity, rate: 0.205 },
  ],
  MB: [ // Manitoba
    { min: 0, max: 47000, rate: 0.108 },
    { min: 47000, max: 100000, rate: 0.1275 },
    { min: 100000, max: Infinity, rate: 0.174 },
  ],
  NB: [ // New Brunswick
    { min: 0, max: 49958, rate: 0.094 },
    { min: 49958, max: 99916, rate: 0.14 },
    { min: 99916, max: 185064, rate: 0.16 },
    { min: 185064, max: Infinity, rate: 0.195 },
  ],
  NL: [ // Newfoundland and Labrador
    { min: 0, max: 43198, rate: 0.087 },
    { min: 43198, max: 86395, rate: 0.145 },
    { min: 86395, max: 154244, rate: 0.158 },
    { min: 154244, max: 215943, rate: 0.178 },
    { min: 215943, max: 275870, rate: 0.198 },
    { min: 275870, max: 551739, rate: 0.208 },
    { min: 551739, max: 1103478, rate: 0.213 },
    { min: 1103478, max: Infinity, rate: 0.218 },
  ],
  NS: [ // Nova Scotia
    { min: 0, max: 29590, rate: 0.0879 },
    { min: 29590, max: 59180, rate: 0.1495 },
    { min: 59180, max: 93000, rate: 0.1667 },
    { min: 93000, max: 150000, rate: 0.175 },
    { min: 150000, max: Infinity, rate: 0.21 },
  ],
  NT: [ // Northwest Territories
    { min: 0, max: 50597, rate: 0.059 },
    { min: 50597, max: 101198, rate: 0.086 },
    { min: 101198, max: 164525, rate: 0.122 },
    { min: 164525, max: Infinity, rate: 0.1405 },
  ],
  NU: [ // Nunavut
    { min: 0, max: 53268, rate: 0.04 },
    { min: 53268, max: 106537, rate: 0.07 },
    { min: 106537, max: 173205, rate: 0.09 },
    { min: 173205, max: Infinity, rate: 0.115 },
  ],
  ON: [ // Ontario
    { min: 0, max: 51446, rate: 0.0505 },
    { min: 51446, max: 102894, rate: 0.0915 },
    { min: 102894, max: 150000, rate: 0.1116 },
    { min: 150000, max: 220000, rate: 0.1216 },
    { min: 220000, max: Infinity, rate: 0.1316 },
  ],
  PE: [ // Prince Edward Island
    { min: 0, max: 32656, rate: 0.0965 },
    { min: 32656, max: 64313, rate: 0.1363 },
    { min: 64313, max: 105000, rate: 0.1665 },
    { min: 105000, max: 140000, rate: 0.18 },
    { min: 140000, max: Infinity, rate: 0.1875 },
  ],
  QC: [ // Quebec
    { min: 0, max: 51780, rate: 0.14 },
    { min: 51780, max: 103545, rate: 0.19 },
    { min: 103545, max: 126000, rate: 0.24 },
    { min: 126000, max: Infinity, rate: 0.2575 },
  ],
  SK: [ // Saskatchewan
    { min: 0, max: 52057, rate: 0.105 },
    { min: 52057, max: 148734, rate: 0.125 },
    { min: 148734, max: Infinity, rate: 0.145 },
  ],
  YT: [ // Yukon
    { min: 0, max: 55867, rate: 0.064 },
    { min: 55867, max: 111733, rate: 0.09 },
    { min: 111733, max: 173205, rate: 0.109 },
    { min: 173205, max: 500000, rate: 0.128 },
    { min: 500000, max: Infinity, rate: 0.15 },
  ],
};

// Provincial Basic Personal Amounts 2024
const PROVINCIAL_BPA: Record<Province, number> = {
  AB: 21003,
  BC: 12580,
  MB: 15780,
  NB: 13044,
  NL: 10818,
  NS: 8481,
  NT: 17373,
  NU: 18767,
  ON: 12399,
  PE: 13500,
  QC: 18056,
  SK: 18491,
  YT: 15705,
};

// Corporation Tax Rates (Federal + Provincial Combined for Small Business)
// Small Business Deduction applies to first $500,000 of active business income
const CORPORATION_RATES: Record<Province, { small: number; general: number }> = {
  AB: { small: 0.11, general: 0.23 },    // 9% federal + 2% AB
  BC: { small: 0.11, general: 0.27 },    // 9% federal + 2% BC
  MB: { small: 0.09, general: 0.27 },    // 9% federal + 0% MB (small)
  NB: { small: 0.115, general: 0.29 },   // 9% federal + 2.5% NB
  NL: { small: 0.12, general: 0.30 },    // 9% federal + 3% NL
  NS: { small: 0.115, general: 0.29 },   // 9% federal + 2.5% NS
  NT: { small: 0.11, general: 0.265 },   // 9% federal + 2% NT
  NU: { small: 0.12, general: 0.27 },    // 9% federal + 3% NU
  ON: { small: 0.125, general: 0.265 },  // 9% federal + 3.5% ON (small)
  PE: { small: 0.10, general: 0.31 },    // 9% federal + 1% PE
  QC: { small: 0.125, general: 0.265 },  // 9% federal + 3.5% QC (approximate)
  SK: { small: 0.10, general: 0.27 },    // 9% federal + 1% SK (small)
  YT: { small: 0.09, general: 0.27 },    // 9% federal + 0% YT (small)
};

// CPP for self-employed (2024)
const CPP_MAX_PENSIONABLE = 68500;
const CPP_BASIC_EXEMPTION = 3500;
const CPP_RATE = 0.1190; // Self-employed pay both portions (5.95% x 2)

// Federal Basic Personal Amount
const FEDERAL_BPA = 15705;

// Province display names
export const PROVINCE_NAMES: Record<Province, string> = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  NS: 'Nova Scotia',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
  YT: 'Yukon',
};

// Get ordered list of provinces
export const PROVINCES: Province[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

function calculateBracketedTax(income: number, brackets: TaxBracket[], bpa: number): number {
  const taxableIncome = Math.max(0, income - bpa);
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;
    
    const bracketAmount = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += bracketAmount * bracket.rate;
    remainingIncome -= bracketAmount;
  }

  return tax;
}

function calculateCPP(income: number): number {
  const pensionableEarnings = Math.min(income, CPP_MAX_PENSIONABLE) - CPP_BASIC_EXEMPTION;
  if (pensionableEarnings <= 0) return 0;
  return pensionableEarnings * CPP_RATE;
}

function getMarginalRate(income: number, province: Province): number {
  let federalRate = 0;
  let provincialRate = 0;

  for (const bracket of FEDERAL_BRACKETS) {
    if (income > bracket.min) federalRate = bracket.rate;
  }

  const provincialBrackets = PROVINCIAL_BRACKETS[province];
  for (const bracket of provincialBrackets) {
    if (income > bracket.min) provincialRate = bracket.rate;
  }

  return federalRate + provincialRate;
}

export function calculateTax(
  grossIncome: number, 
  deductions: number = 0,
  province: Province = 'BC',
  taxType: TaxType = 'self-employed'
): TaxBreakdown {
  const netIncome = Math.max(0, grossIncome - deductions);
  
  if (taxType === 'corporation') {
    // Corporation tax calculation
    const rates = CORPORATION_RATES[province];
    const smallBusinessLimit = 500000;
    
    let corporateTax = 0;
    if (netIncome <= smallBusinessLimit) {
      corporateTax = netIncome * rates.small;
    } else {
      corporateTax = smallBusinessLimit * rates.small + (netIncome - smallBusinessLimit) * rates.general;
    }
    
    // For corporations, split the tax for display purposes
    const federalPortion = corporateTax * 0.6; // Approximate federal portion
    const provincialPortion = corporateTax * 0.4; // Approximate provincial portion
    
    const effectiveRate = netIncome > 0 ? (corporateTax / netIncome) * 100 : 0;
    const marginalRate = netIncome > smallBusinessLimit ? rates.general * 100 : rates.small * 100;
    
    return {
      federalTax: federalPortion,
      provincialTax: provincialPortion,
      cppContributions: 0, // Corporations don't pay CPP
      totalTax: corporateTax,
      effectiveRate,
      marginalRate,
      takeHome: netIncome - corporateTax,
    };
  }
  
  // Self-employed tax calculation
  const provincialBPA = PROVINCIAL_BPA[province];
  const provincialBrackets = PROVINCIAL_BRACKETS[province];
  
  const federalTax = calculateBracketedTax(netIncome, FEDERAL_BRACKETS, FEDERAL_BPA);
  const provincialTax = calculateBracketedTax(netIncome, provincialBrackets, provincialBPA);
  const cppContributions = calculateCPP(netIncome);
  
  const totalTax = federalTax + provincialTax + cppContributions;
  const effectiveRate = netIncome > 0 ? (totalTax / netIncome) * 100 : 0;
  const marginalRate = getMarginalRate(netIncome, province) * 100;
  const takeHome = netIncome - totalTax;

  return {
    federalTax,
    provincialTax,
    cppContributions,
    totalTax,
    effectiveRate,
    marginalRate,
    takeHome,
  };
}

export function getQuarterlyInstallment(annualTax: number): number {
  return annualTax / 4;
}

export function getTaxTips(income: number, expenses: number, taxType: TaxType = 'self-employed'): string[] {
  const tips: string[] = [];
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

  if (expenseRatio < 15) {
    tips.push("Consider tracking more business expenses - vehicle, home office, marketing, and professional development are often missed deductions.");
  }

  if (taxType === 'self-employed') {
    if (income > 50000) {
      tips.push("Consider setting up a RRSP to reduce taxable income and save for retirement.");
    }

    if (income > 100000) {
      tips.push("You may benefit from incorporating your business. Consult with an accountant about potential tax savings.");
    }

    if (income > 30000) {
      tips.push("Make quarterly tax installment payments to avoid year-end interest charges.");
    }
  } else {
    tips.push("Consider income splitting strategies through dividends to family members (consult TOSI rules).");
    
    if (income > 500000) {
      tips.push("Income above $500,000 is taxed at the general corporate rate. Consider strategies to optimize retained earnings.");
    }
  }

  tips.push("Keep all receipts for business expenses - CRA may request documentation for up to 6 years.");

  return tips;
}

// Get the tax brackets for display purposes
export function getTaxBrackets(province: Province, taxType: TaxType): {
  federal: TaxBracket[];
  provincial: TaxBracket[];
  corporateRates?: { small: number; general: number };
} {
  if (taxType === 'corporation') {
    return {
      federal: [],
      provincial: [],
      corporateRates: CORPORATION_RATES[province],
    };
  }
  
  return {
    federal: FEDERAL_BRACKETS,
    provincial: PROVINCIAL_BRACKETS[province],
  };
}
