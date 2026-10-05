export interface ParsedReceiptItem {
  name: string;
  quantity?: number;
  price?: number;
}

export interface ParsedReceipt {
  merchant: string;
  total: number;
  currency: string;
  date?: string;
  items: ParsedReceiptItem[];
  confidence: 'low' | 'medium' | 'high';
}

const MERCHANT_BLOCKLIST = [
  'gstin',
  'gst no',
  'invoice',
  'receipt',
  'bill to',
  'ship to',
  'tax invoice',
  'phone',
  'tel',
  'www',
  'http',
  'email',
  'address',
  'fssai',
  'dl no',
  'cashier',
  'cash',
  'card',
  'upi',
  'thank you',
  'welcome',
  'currency',
  'date',
  'time',
  'bill no',
  'table',
  'order no',
  'served by',
];

const TOTAL_KEYWORDS = [
  'grand total',
  'net payable',
  'net total',
  'total payable',
  'amount payable',
  'total amount payable',
  'balance due',
  'total due',
  'amount due',
  'total bill',
  'bill total',
  'total',
];

const MONTHS: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  sept: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

function stripNoise(line: string): string {
  return line
    .replace(/[₹]/g, ' ')
    .replace(/\b(?:rs\.?|inr)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAmounts(line: string): number[] {
  const cleaned = stripNoise(line);
  const matches = cleaned.match(/\d[\d,]*(?:\.\d{1,2})?/g) ?? [];

  return matches
    .map((value) => Number.parseFloat(value.replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function looksLikeDate(line: string): boolean {
  return (
    /\b(?:0?[1-9]|[12]\d|3[01])[\/\-.](?:0?[1-9]|1[0-2])[\/\-.](?:\d{2,4})\b/.test(
      line,
    ) ||
    /\b\d{4}[\/\-.](?:0?[1-9]|1[0-2])[\/\-.](?:0?[1-9]|[12]\d|3[01])\b/.test(
      line,
    ) ||
    /\b(?:0?[1-9]|[12]\d|3[01])\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(
      line,
    )
  );
}

function normalizeDate(line: string): string | undefined {
  const numeric = line.match(
    /\b(0?[1-9]|[12]\d|3[01])[\/\-.](0?[1-9]|1[0-2])[\/\-.](\d{2,4})\b/,
  );
  if (numeric) {
    const day = numeric[1];
    const month = numeric[2];
    const yearRaw = numeric[3];
    const year =
      yearRaw.length === 2
        ? Number(yearRaw) > 70
          ? `19${yearRaw}`
          : `20${yearRaw}`
        : yearRaw;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const iso = line.match(/\b(\d{4})[\/\-.](0?[1-9]|1[0-2])[\/\-.](0?[1-9]|[12]\d|3[01])\b/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  }

  const textual = line.match(
    /\b(0?[1-9]|[12]\d|3[01])\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b/,
  );
  if (textual) {
    const month = MONTHS[textual[2].slice(0, 3).toLowerCase()];
    if (month) {
      return `${textual[3]}-${month}-${textual[1].padStart(2, '0')}`;
    }
  }

  return undefined;
}

function extractMerchant(lines: string[]): string {
  for (const raw of lines.slice(0, 8)) {
    const line = stripNoise(raw).replace(/[^\w\s&'.-]/g, ' ');
    const lowered = line.toLowerCase();

    if (line.length < 3 || line.length > 60) {
      continue;
    }
    if (MERCHANT_BLOCKLIST.some((word) => lowered.includes(word))) {
      continue;
    }
    if (!/[a-zA-Z]{3}/.test(line)) {
      continue;
    }

    return line
      .split(/\s+/)
      .map((word) =>
        word.length > 2 && word === word.toLowerCase()
          ? word[0].toUpperCase() + word.slice(1)
          : word,
      )
      .join(' ')
      .trim();
  }

  return 'Receipt';
}

function extractTotal(lines: string[]): { total: number; confidence: 'low' | 'medium' | 'high' } {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const lowered = lines[index].toLowerCase();
    const matched = TOTAL_KEYWORDS.find((keyword) => lowered.includes(keyword));
    if (!matched) {
      continue;
    }
    if (lowered.includes('subtotal') && matched === 'total') {
      continue;
    }

    const amounts = extractAmounts(lines[index]);
    if (amounts.length > 0) {
      return { total: Math.max(...amounts), confidence: 'high' };
    }
  }

  const amountLines: number[] = [];
  for (const line of lines) {
    if (looksLikeDate(line)) {
      continue;
    }
    const amounts = extractAmounts(line);
    if (amounts.length > 0) {
      amountLines.push(Math.max(...amounts));
    }
  }

  if (amountLines.length > 0) {
    return { total: Math.max(...amountLines), confidence: 'medium' };
  }

  return { total: 0, confidence: 'low' };
}

function extractItems(lines: string[]): ParsedReceiptItem[] {
  const items: ParsedReceiptItem[] = [];

  for (const raw of lines) {
    if (items.length >= 30) {
      break;
    }

    const lowered = raw.toLowerCase();
    if (TOTAL_KEYWORDS.some((keyword) => lowered.includes(keyword))) {
      continue;
    }

    const match = raw.match(
      /^([A-Za-z][A-Za-z0-9&/.' -]{2,48}?)\s+(\d{1,2})\s*[xX@]?\s*(\d[\d,]*(?:\.\d{1,2})?)$/,
    );
    if (match) {
      const price = Number.parseFloat(match[3].replace(/,/g, ''));
      if (Number.isFinite(price) && price > 0) {
        items.push({
          name: match[1].trim(),
          quantity: Number.parseInt(match[2], 10),
          price,
        });
      }
      continue;
    }

    const priceOnly = raw.match(
      /^([A-Za-z][A-Za-z0-9&/.' -]{2,48}?)\s+([₹]?\s*\d[\d,]*(?:\.\d{1,2})?)$/,
    );
    if (priceOnly) {
      const price = Number.parseFloat(priceOnly[2].replace(/[₹,\s]/g, ''));
      if (Number.isFinite(price) && price > 0) {
        items.push({ name: priceOnly[1].trim(), price });
      }
    }
  }

  return items;
}

export function parseReceipt(text: string): ParsedReceipt {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const { total, confidence } = extractTotal(lines);

  let date: string | undefined;
  for (const line of lines) {
    const normalized = normalizeDate(line);
    if (normalized) {
      date = normalized;
      break;
    }
  }

  const currency = /₹|\binr\b|\brs\b|\bgstin\b/i.test(text) ? 'INR' : 'USD';

  return {
    merchant: extractMerchant(lines),
    total,
    currency,
    date,
    items: extractItems(lines),
    confidence,
  };
}
