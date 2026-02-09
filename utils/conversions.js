// ============================================
// UNIT CONVERSION FUNCTIONS
// ============================================

import { UNIT_CONVERSIONS, UNIT_CATEGORIES, BASE_UNIT_NAMES } from '../constants/units';

/**
 * Detect which category a unit belongs to
 * @param {string} unit - The unit to check
 * @returns {string|null} - The category name or null if not found
 */
export function getUnitCategory(unit) {
  for (const [category, units] of Object.entries(UNIT_CATEGORIES)) {
    if (units.includes(unit)) {
      return category;
    }
  }
  return null;
}

/**
 * Check if two units are compatible for comparison
 * @param {string} unit1 - First unit
 * @param {string} unit2 - Second unit
 * @returns {Object} - Compatibility result
 */
export function areUnitsCompatible(unit1, unit2) {
  const category1 = getUnitCategory(unit1);
  const category2 = getUnitCategory(unit2);
  
  if (!category1 || !category2) {
    return { compatible: false, error: 'Unknown unit type' };
  }
  
  if (category1 !== category2) {
    return { 
      compatible: false, 
      error: `Cannot compare ${category1} with ${category2}`,
      category1,
      category2
    };
  }
  
  return { compatible: true, category: category1 };
}

/**
 * Convert any unit to base unit within its category
 * @param {number} quantity - The quantity to convert
 * @param {string} unit - The unit of the quantity
 * @returns {number} - Quantity in base units
 */
export function convertToBaseUnit(quantity, unit) {
  const category = getUnitCategory(unit);
  if (!category) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  
  const conversionFactor = UNIT_CONVERSIONS[category][unit];
  if (!conversionFactor) {
    throw new Error(`No conversion factor for ${unit}`);
  }
  
  return quantity * conversionFactor;
}

/**
 * Get display name for base unit
 * @param {string} category - The unit category
 * @returns {string} - Base unit name
 */
export function getBaseUnitName(category) {
  return BASE_UNIT_NAMES[category] || 'unit';
}

/**
 * Get a user-friendly display unit based on the magnitude
 * @param {string} category - The unit category
 * @param {number} baseQuantity - The quantity in base units
 * @returns {Object} - { unit, quantity, factor }
 */
export function getDisplayUnit(category, baseQuantity) {
  // For weight, show in kg if > 1000g
  if (category === 'weight') {
    if (baseQuantity >= 1000) {
      return { unit: 'kg', quantity: baseQuantity / 1000, factor: 1000 };
    }
    return { unit: 'g', quantity: baseQuantity, factor: 1 };
  }
  
  // For volume, show in L if > 1000ml
  if (category === 'volume') {
    if (baseQuantity >= 1000) {
      return { unit: 'L', quantity: baseQuantity / 1000, factor: 1000 };
    }
    return { unit: 'ml', quantity: baseQuantity, factor: 1 };
  }
  
  // For count, just use units
  return { unit: 'unit', quantity: baseQuantity, factor: 1 };
}
