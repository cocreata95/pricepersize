// ============================================
// UNIT DEFINITIONS AND CONVERSIONS
// ============================================

// Unit conversions (to base unit)
export const UNIT_CONVERSIONS = {
  // Weight conversions (to grams as base)
  weight: {
    'mg': 0.001,
    'g': 1,
    'kg': 1000,
    't': 1000000,
    'oz-wt': 28.3495,  // Weight ounce (rarely used in shopping)
    'lb': 453.592,
    'st': 6350.29,
    'jin': 500,
    'liang': 50,
    'catty': 604.79,
    'tael': 37.8,
    'tola': 11.66,
    'ser': 933,
    'maund': 37324,
  },
  
  // Volume conversions (to ml as base)
  volume: {
    'ml': 1,
    'cl': 10,
    'dl': 100,
    'L': 1000,
    'tsp': 4.929,
    'tbsp': 14.787,
    'oz': 29.574,       // "oz" = fluid ounce (what shoppers mean)
    'fl-oz': 29.574,    // Explicit fluid ounce
    'fl-oz-uk': 28.413,
    'cup': 236.588,
    'cup-uk': 284.131,
    'cup-au': 250,
    'pt': 473.176,
    'pt-uk': 568.261,
    'qt': 946.353,
    'qt-uk': 1136.52,
    'gal': 3785.41,
    'gal-uk': 4546.09,
  },
  
  // Count (no conversion needed)
  count: {
    'unit': 1,
    'piece': 1,
    'item': 1,
    'ea': 1,
    'pair': 2,
    'dozen': 12,
    'gross': 144,
    'score': 20,
  },
};

// Unit category mapping
export const UNIT_CATEGORIES = {
  weight: ['mg', 'g', 'kg', 't', 'oz-wt', 'lb', 'st', 'jin', 'liang', 'catty', 'tael', 'tola', 'ser', 'maund'],
  volume: ['ml', 'cl', 'dl', 'L', 'tsp', 'tbsp', 'oz', 'fl-oz', 'fl-oz-uk', 'cup', 'cup-uk', 'cup-au', 'pt', 'pt-uk', 'qt', 'qt-uk', 'gal', 'gal-uk'],
  count: ['unit', 'piece', 'item', 'ea', 'pair', 'dozen', 'gross', 'score'],
};

// Unit display names
export const UNIT_DISPLAY_NAMES = {
  // Weight
  'mg': 'mg - Milligram',
  'g': 'g - Gram',
  'kg': 'kg - Kilogram',
  't': 't - Metric Ton',
  'oz': 'oz - Ounce',
  'lb': 'lb - Pound',
  'st': 'st - Stone',
  'jin': 'jin - Chinese Jin',
  'liang': 'liang - Chinese Liang',
  'catty': 'catty - Southeast Asian',
  'tael': 'tael - Tael',
  'tola': 'tola - South Asian',
  'ser': 'ser - Indian Ser',
  'maund': 'maund - Indian Maund',
  // Volume
  'ml': 'ml - Milliliter',
  'cl': 'cl - Centiliter',
  'dl': 'dl - Deciliter',
  'L': 'L - Liter',
  'tsp': 'tsp - Teaspoon',
  'tbsp': 'tbsp - Tablespoon',
  'fl-oz': 'fl oz - Fluid Ounce (US)',
  'fl-oz-uk': 'fl oz - Fluid Ounce (UK)',
  'cup': 'cup - Cup (US)',
  'cup-uk': 'cup - Cup (UK)',
  'cup-au': 'cup - Cup (AU)',
  'pt': 'pt - Pint (US)',
  'pt-uk': 'pt - Pint (UK)',
  'qt': 'qt - Quart (US)',
  'qt-uk': 'qt - Quart (UK)',
  'gal': 'gal - Gallon (US)',
  'gal-uk': 'gal - Gallon (UK)',
  // Count
  'unit': 'unit - Unit/Piece',
  'piece': 'piece - Piece',
  'item': 'item - Item',
  'ea': 'ea - Each',
  'pair': 'pair - Pair (2)',
  'dozen': 'dozen - Dozen (12)',
  'gross': 'gross - Gross (144)',
  'score': 'score - Score (20)',
};

// Currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
];

// Unit options grouped by category for select dropdown
// Note: "oz" = fluid ounce (what shoppers mean when they say "24 oz soda")
export const UNIT_OPTIONS = [
  {
    label: 'Volume',
    options: [
      { value: 'oz', label: 'oz - Ounce' },
      { value: 'ml', label: 'ml - Milliliter' },
      { value: 'L', label: 'L - Liter' },
      { value: 'cup', label: 'cup - Cup' },
      { value: 'pt', label: 'pt - Pint' },
      { value: 'qt', label: 'qt - Quart' },
      { value: 'gal', label: 'gal - Gallon' },
    ],
  },
  {
    label: 'Weight',
    options: [
      { value: 'g', label: 'g - Gram' },
      { value: 'kg', label: 'kg - Kilogram' },
      { value: 'lb', label: 'lb - Pound' },
      { value: 'mg', label: 'mg - Milligram' },
    ],
  },
  {
    label: 'Count',
    options: [
      { value: 'unit', label: 'unit - Unit/Piece' },
      { value: 'dozen', label: 'dozen - Dozen (12)' },
    ],
  },
];

// Base unit names for each category (for internal calculation - smallest unit)
export const BASE_UNIT_NAMES = {
  weight: 'g',
  volume: 'ml',
  count: 'unit',
};

// Display-friendly unit names (what shoppers understand)
export const DISPLAY_UNIT_NAMES = {
  weight: 'oz',    // Weight in ounces
  volume: 'oz',    // Fluid ounces (not ml!)
  count: 'unit',
};

// Conversion from base unit to display unit
export const BASE_TO_DISPLAY = {
  weight: 28.3495,  // 1 oz = 28.3495g, so multiply g price by this
  volume: 29.574,   // 1 fl oz = 29.574ml, so multiply ml price by this
  count: 1,
};
