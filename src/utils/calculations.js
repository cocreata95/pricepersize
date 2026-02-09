// ============================================
// COMPARISON CALCULATION FUNCTIONS
// ============================================

import { 
  areUnitsCompatible, 
  convertToBaseUnit, 
  getBaseUnitName,
  getUnitCategory
} from './conversions';

/**
 * Main comparison function - compares two products
 * @param {Object} product1 - { price, quantity, unit, currency }
 * @param {Object} product2 - { price, quantity, unit, currency }
 * @returns {Object} - Comparison results
 */
export function compareProducts(product1, product2) {
  // Validate inputs
  if (!product1.price || !product1.quantity || !product1.unit) {
    throw new Error('Product 1 is missing required fields');
  }
  if (!product2.price || !product2.quantity || !product2.unit) {
    throw new Error('Product 2 is missing required fields');
  }
  
  // Check unit compatibility
  const compatibility = areUnitsCompatible(product1.unit, product2.unit);
  if (!compatibility.compatible) {
    throw new Error(compatibility.error);
  }
  
  // Convert to base units
  const baseQuantity1 = convertToBaseUnit(product1.quantity, product1.unit);
  const baseQuantity2 = convertToBaseUnit(product2.quantity, product2.unit);
  
  // Calculate per-unit prices
  const perUnitPrice1 = product1.price / baseQuantity1;
  const perUnitPrice2 = product2.price / baseQuantity2;
  
  // Determine winner (lower price is better)
  const winner = perUnitPrice1 < perUnitPrice2 ? 1 : perUnitPrice2 < perUnitPrice1 ? 2 : 0;
  
  // Calculate savings
  const difference = Math.abs(perUnitPrice1 - perUnitPrice2);
  const higherPrice = Math.max(perUnitPrice1, perUnitPrice2);
  const percentageSaved = higherPrice > 0 ? (difference / higherPrice) * 100 : 0;
  
  // Get base unit for display
  const baseUnit = getBaseUnitName(compatibility.category);
  
  return {
    winner, // 1, 2, or 0 (tie)
    category: compatibility.category,
    baseUnit,
    product1: {
      originalPrice: product1.price,
      originalQuantity: product1.quantity,
      originalUnit: product1.unit,
      currency: product1.currency,
      baseQuantity: baseQuantity1,
      perUnitPrice: perUnitPrice1,
    },
    product2: {
      originalPrice: product2.price,
      originalQuantity: product2.quantity,
      originalUnit: product2.unit,
      currency: product2.currency,
      baseQuantity: baseQuantity2,
      perUnitPrice: perUnitPrice2,
    },
    savings: {
      perUnit: difference,
      percentage: percentageSaved,
      // Calculate total savings scenarios
      ifBuyProduct1Quantity: difference * baseQuantity1,
      ifBuyProduct2Quantity: difference * baseQuantity2,
      ifBuy10Units: difference * 10,
      ifBuy100Units: difference * 100,
    },
    differentUnits: product1.unit !== product2.unit,
  };
}

/**
 * Calculate per-unit price for a single product
 * @param {number} price - Product price
 * @param {number} quantity - Product quantity
 * @param {string} unit - Product unit
 * @returns {Object} - { perUnitPrice, baseUnit, category }
 */
export function calculatePerUnitPrice(price, quantity, unit) {
  if (!price || !quantity || !unit) {
    return null;
  }
  
  try {
    const baseQuantity = convertToBaseUnit(quantity, unit);
    const perUnitPrice = price / baseQuantity;
    const category = getUnitCategory(unit);
    const baseUnit = getBaseUnitName(category);
    
    return {
      perUnitPrice,
      baseUnit,
      category,
      baseQuantity,
    };
  } catch {
    return null;
  }
}

/**
 * Compare multiple products (2-10)
 * @param {Array} products - Array of { price, quantity, unit, packs?, name? }
 * @returns {Object} - Comparison results with rankings
 */
export function compareMultipleProducts(products) {
  // Validate minimum products
  if (!products || products.length < 2) {
    throw new Error('At least 2 products are required for comparison');
  }
  
  // Validate all products have required fields
  products.forEach((product, index) => {
    if (!product.price || !product.quantity || !product.unit) {
      throw new Error(`Product ${index + 1} is missing required fields`);
    }
  });
  
  // Check all units are compatible (compare each with the first)
  const firstUnit = products[0].unit;
  for (let i = 1; i < products.length; i++) {
    const compatibility = areUnitsCompatible(firstUnit, products[i].unit);
    if (!compatibility.compatible) {
      throw new Error(`Product ${i + 1} has incompatible units with Product 1. ${compatibility.error}`);
    }
  }
  
  // Get category and base unit from first product
  const category = getUnitCategory(firstUnit);
  const baseUnit = getBaseUnitName(category);
  
  // Calculate per-unit price for each product (accounting for packs)
  const productResults = products.map((product, index) => {
    const packs = product.packs || 1;
    const totalPrice = product.price * packs;
    const totalQuantity = product.quantity * packs;
    const baseQuantity = convertToBaseUnit(totalQuantity, product.unit);
    const perUnitPrice = totalPrice / baseQuantity;
    
    return {
      index: index + 1,
      name: product.name || `Product ${index + 1}`,
      originalPrice: product.price,
      originalQuantity: product.quantity,
      originalUnit: product.unit,
      currency: product.currency || 'USD',
      packs,
      totalPrice,
      totalQuantity,
      baseQuantity,
      perUnitPrice,
    };
  });
  
  // Sort by per-unit price (ascending - lowest is best)
  const rankings = [...productResults].sort((a, b) => a.perUnitPrice - b.perUnitPrice);
  
  // Winner is the first in rankings (lowest per-unit price)
  const winner = rankings[0];
  const worstDeal = rankings[rankings.length - 1];
  
  // Calculate savings compared to worst deal
  const maxSavingsPerUnit = worstDeal.perUnitPrice - winner.perUnitPrice;
  const maxSavingsPercentage = worstDeal.perUnitPrice > 0 
    ? (maxSavingsPerUnit / worstDeal.perUnitPrice) * 100 
    : 0;
  
  // Check for ties
  const isTie = rankings.length > 1 && 
    Math.abs(rankings[0].perUnitPrice - rankings[1].perUnitPrice) < 0.0001;
  
  return {
    winner: isTie ? null : winner,
    isTie,
    category,
    baseUnit,
    rankings, // Array sorted by value (best first)
    products: productResults, // Array in original order
    savings: {
      perUnit: maxSavingsPerUnit,
      percentage: maxSavingsPercentage,
      ifBuy10Units: maxSavingsPerUnit * 10,
      ifBuy100Units: maxSavingsPerUnit * 100,
    },
    productCount: products.length,
  };
}
