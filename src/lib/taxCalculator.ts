// Canadian Tax Calculator for Self-Employed Real Estate Agents
// Based on 2024/2025 tax brackets for British Columbia

export interface TaxBreakdown {
  federalTax: number;
  provincialTax: number;
  cppContributions: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  takeHome: number;
}

// Federal Tax Brackets 2024/2025
const FEDERAL_BRACKETS = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 173205, rate: 0.26 },
  { min: 173205, max: 246752, rate: 0.29 },
  { min: 246752, max: Infinity, rate: 0.33 },
];

// BC Provincial Tax Brackets 2024/2025
const BC_BRACKETS = [
  { min: 0, max: 47937, rate: 0.0506 },
  { min: 47937, max: 95875, rate: 0.077 },
  { min: 95875, max: 110076, rate: 0.105 },
  { min: 110076, max: 133664, rate: 0.1229 },
  { min: 133664, max: 181232, rate: 0.147 },
  { min: 181232, max: 252752, rate: 0.168 },
  { min: 252752, max: Infinity, rate: 0.205 },
];

// CPP for self-employed (2024)
const CPP_MAX_PENSIONABLE = 68500;
const CPP_BASIC_EXEMPTION = 3500;
const CPP_RATE = 0.1190; // Self-employed pay both portions (5.95% x 2)

// Basic Personal Amounts
const FEDERAL_BPA = 15705;
const BC_BPA = 12580;

function calculateBracketedTax(income: number, brackets: typeof FEDERAL_BRACKETS, bpa: number): number {
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

function getMarginalRate(income: number): number {
  let federalRate = 0;
  let provincialRate = 0;

  for (const bracket of FEDERAL_BRACKETS) {
    if (income > bracket.min) federalRate = bracket.rate;
  }

  for (const bracket of BC_BRACKETS) {
    if (income > bracket.min) provincialRate = bracket.rate;
  }

  return federalRate + provincialRate;
}

export function calculateTax(grossIncome: number, deductions: number = 0): TaxBreakdown {
  const netIncome = Math.max(0, grossIncome - deductions);
  
  const federalTax = calculateBracketedTax(netIncome, FEDERAL_BRACKETS, FEDERAL_BPA);
  const provincialTax = calculateBracketedTax(netIncome, BC_BRACKETS, BC_BPA);
  const cppContributions = calculateCPP(netIncome);
  
  const totalTax = federalTax + provincialTax + cppContributions;
  const effectiveRate = netIncome > 0 ? (totalTax / netIncome) * 100 : 0;
  const marginalRate = getMarginalRate(netIncome) * 100;
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

export function getTaxTips(income: number, expenses: number): string[] {
  const tips: string[] = [];
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

  if (expenseRatio < 15) {
    tips.push("Consider tracking more business expenses - vehicle, home office, marketing, and professional development are often missed deductions.");
  }

  if (income > 50000) {
    tips.push("Consider setting up a RRSP to reduce taxable income and save for retirement.");
  }

  if (income > 100000) {
    tips.push("You may benefit from incorporating your business. Consult with an accountant about potential tax savings.");
  }

  if (income > 30000) {
    tips.push("Make quarterly tax installment payments to avoid year-end interest charges.");
  }

  tips.push("Keep all receipts for business expenses - CRA may request documentation for up to 6 years.");

  return tips;
}
