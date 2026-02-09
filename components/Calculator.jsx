'use client'

import { useState, useMemo, useEffect } from 'react';
import ProductRow from './ProductRow';
import { compareMultipleProducts } from '../utils/calculations';
import { areUnitsCompatible, getUnitCategory, convertToBaseUnit } from '../utils/conversions';
import { BASE_TO_DISPLAY, DISPLAY_UNIT_NAMES } from '../constants/units';
import './Calculator.css';

// Pre-filled example: $3.99 for 24oz vs $5.49 for 2L
const EXAMPLE_PRODUCTS = [
  { price: 3.99, quantity: 24, unit: 'oz', currency: 'USD', packs: 1 },
  { price: 5.49, quantity: 2, unit: 'L', currency: 'USD', packs: 1 },
];

export default function Calculator({ onResults }) {
  const [products, setProducts] = useState(EXAMPLE_PRODUCTS);
  const [error, setError] = useState(null);

  // Auto-calculate comparison in real-time
  const liveComparison = useMemo(() => {
    // Check if all products have valid inputs
    const allValid = products.every(p => p.price && p.quantity && p.unit);
    if (!allValid) return null;

    // Check unit compatibility
    const firstCategory = getUnitCategory(products[0].unit);
    const allCompatible = products.every(p => getUnitCategory(p.unit) === firstCategory);
    if (!allCompatible) return null;

    try {
      return compareMultipleProducts(products);
    } catch {
      return null;
    }
  }, [products]);

  // Get winner index (0-based) for highlighting
  const winnerIndex = liveComparison?.winner ? liveComparison.winner.index - 1 : -1;

  const handleProductChange = (index, updatedProduct) => {
    const newProducts = [...products];
    newProducts[index] = updatedProduct;
    setProducts(newProducts);
    setError(null);
  };

  const handleAddProduct = () => {
    if (products.length < 10) {
      const lastUnit = products[products.length - 1]?.unit || 'oz';
      const lastCurrency = products[products.length - 1]?.currency || 'USD';
      setProducts([...products, { price: '', quantity: '', unit: lastUnit, currency: lastCurrency, packs: 1 }]);
    }
  };

  const handleRemoveProduct = (index) => {
    if (products.length > 2) {
      const newProducts = products.filter((_, i) => i !== index);
      setProducts(newProducts);
    }
  };

  const handleSeeBreakdown = () => {
    // Validate
    const emptyProducts = products.filter(p => !p.price || !p.quantity || !p.unit);
    if (emptyProducts.length > 0) {
      setError('Please enter price, size, and unit for all products');
      return;
    }
    
    const firstCategory = getUnitCategory(products[0].unit);
    const incompatible = products.find(p => getUnitCategory(p.unit) !== firstCategory);
    if (incompatible) {
      setError(`Can't compare ${firstCategory} with ${getUnitCategory(incompatible.unit)}. Use same type (all volume or all weight).`);
      return;
    }
    
    // Calculate comparison and pass to results
    try {
      const comparison = compareMultipleProducts(products);
      onResults(comparison);
    } catch (err) {
      setError(err.message);
    }
  };

  const isFormValid = products.every(p => p.price && p.quantity && p.unit);

  // Format currency for display
  const formatPrice = (price, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$' };
    return `${symbols[currency] || '$'}${price.toFixed(4)}`;
  };

  return (
    <section className="calculator" id="calculator">
      <div className="calculator-container">
        {/* Minimal Headline */}
        <h1 className="calculator-headline">Which Pack Size is the Better Deal?</h1>
        
        <p className="try-note">
          👇 Try it with this example or enter your own prices
        </p>
        
        <div className="calculator-card">
          <div className="products-list">
            {products.map((product, index) => (
              <ProductRow
                key={index}
                index={index}
                product={product}
                onChange={handleProductChange}
                onRemove={handleRemoveProduct}
                canRemove={products.length > 2}
                isWinner={winnerIndex === index}
                savingsPercent={
                  winnerIndex === index && liveComparison 
                    ? Math.round(liveComparison.savings.percentage) 
                    : null
                }
              />
            ))}
          </div>
          
          {products.length < 10 && (
            <button 
              type="button"
              className="add-product-btn"
              onClick={handleAddProduct}
            >
              + Add Another Product
            </button>
          )}
        </div>
        
        {/* Instant Result Banner - Shows immediately when comparison is valid */}
        {liveComparison && liveComparison.winner && (function() {
          // Calculate actual money saved if buying equivalent amount
          const loser = liveComparison.rankings[liveComparison.rankings.length - 1];
          const winner = liveComparison.winner;
          const category = liveComparison.category;
          const displayUnit = DISPLAY_UNIT_NAMES[category] || 'unit';
          const conversionFactor = BASE_TO_DISPLAY[category] || 1;
          
          // Savings per display unit (e.g., per oz)
          const savingsPerDisplayUnit = liveComparison.savings.perUnit * conversionFactor;
          
          // Calculate savings if buying the loser's quantity at winner's price
          const loserQuantityInBase = loser.baseQuantity;
          const actualSavings = (loser.perUnitPrice - winner.perUnitPrice) * loserQuantityInBase;
          
          return (
            <div className="instant-result">
              <div className="result-winner">
                <span className="winner-emoji">🏆</span>
                <div className="winner-info">
                  <span className="winner-label">Product {winner.index} is cheaper!</span>
                  <span className="winner-savings">
                    You save <strong>{Math.round(liveComparison.savings.percentage)}%</strong>
                    {actualSavings > 0.01 && (
                      <> — that's <strong>{formatPrice(actualSavings, products[0].currency)}</strong> saved</>  
                    )}
                  </span>
                </div>
              </div>
              
              <button 
                className="see-details-btn"
                onClick={handleSeeBreakdown}
              >
                See Full Breakdown ↓
              </button>
            </div>
          );
        })()}
        
        {/* Show compare button only when no live comparison yet */}
        {!liveComparison && isFormValid && (
          <button 
            className="compare-button"
            onClick={handleSeeBreakdown}
          >
            Compare Now
          </button>
        )}
        
        {/* One-liner Context */}
        <p className="context-line">
          ✨ Different units? We convert everything automatically
        </p>
        
        {/* Error Message */}
        {error && (
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">{error}</span>
          </div>
        )}
      </div>
    </section>
  );
}
