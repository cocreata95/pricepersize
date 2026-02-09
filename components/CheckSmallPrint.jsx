import { useState, useMemo } from 'react';
import { UNIT_OPTIONS, CURRENCIES, UNIT_CONVERSIONS } from '../constants/units';
import { convertToBaseUnit, getUnitCategory } from '../utils/conversions';
import { formatCurrency } from '../utils/formatting';
import './CheckSmallPrint.css';

export default function CheckSmallPrint({ winnerProduct, baseUnit, currency = 'USD' }) {
  const [shelfPrice, setShelfPrice] = useState('');
  const [perAmount, setPerAmount] = useState('1');
  const [shelfUnit, setShelfUnit] = useState(winnerProduct?.originalUnit || 'kg');
  const [checkResult, setCheckResult] = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);

  // Get currency symbol
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  // Calculate our per-unit price in the shelf's unit
  const calculateOurPrice = (amount, unit) => {
    if (!winnerProduct) return null;
    
    try {
      // Get the category
      const category = getUnitCategory(unit);
      const winnerCategory = getUnitCategory(winnerProduct.originalUnit);
      
      if (category !== winnerCategory) {
        return { error: 'Unit types don\'t match (e.g., comparing weight to volume)' };
      }
      
      // Convert amount to base unit (g or ml)
      const amountInBase = convertToBaseUnit(parseFloat(amount), unit);
      
      // Our price per base unit
      const ourPricePerBase = winnerProduct.perUnitPrice;
      
      // Our price for the shelf's "per X" amount
      const ourPriceForAmount = ourPricePerBase * amountInBase;
      
      return { price: ourPriceForAmount, unit, amount };
    } catch {
      return { error: 'Unable to calculate' };
    }
  };

  const handleCheckMath = () => {
    if (!shelfPrice || !perAmount || !shelfUnit) {
      return;
    }

    const shelfPriceNum = parseFloat(shelfPrice);
    const ourCalc = calculateOurPrice(perAmount, shelfUnit);
    
    if (ourCalc?.error) {
      setCheckResult({ type: 'error', message: ourCalc.error });
      return;
    }

    const ourPrice = ourCalc.price;
    const difference = Math.abs(shelfPriceNum - ourPrice);
    const percentDiff = (difference / ourPrice) * 100;
    
    // Calculate impact on the actual pack
    const totalQuantity = winnerProduct.totalQuantity || winnerProduct.originalQuantity;
    const totalQuantityInBase = convertToBaseUnit(totalQuantity, winnerProduct.originalUnit);
    const shelfAmountInBase = convertToBaseUnit(parseFloat(perAmount), shelfUnit);
    const impactAmount = (difference / shelfAmountInBase) * totalQuantityInBase;

    if (percentDiff <= 2) {
      // Within 2% tolerance - correct
      setCheckResult({
        type: 'success',
        message: 'The tag\'s math looks correct.',
        subMessage: 'Per-unit price on the shelf matches the actual math.'
      });
    } else {
      // Mismatch - warning
      const isShelfLower = shelfPriceNum < ourPrice;
      setCheckResult({
        type: 'warning',
        shelfPrice: shelfPriceNum,
        actualPrice: ourPrice,
        perAmount,
        unit: shelfUnit,
        impact: impactAmount,
        isShelfLower,
        totalQuantity,
        originalUnit: winnerProduct.originalUnit
      });
    }
    
    setShowExplainer(false);
  };

  const handleReset = () => {
    setCheckResult(null);
    setShowExplainer(false);
  };

  if (!winnerProduct) return null;

  return (
    <div className="check-small-print">
      <div className="check-header">
        <span className="check-icon">🔍</span>
        <h3 className="check-title">Check the small print <span className="optional-tag">(optional)</span></h3>
      </div>
      
      <p className="check-description">
        Sometimes the tiny "per kg / per 100g / per L" line on the shelf is wrong. 
        Paste it here to double-check the math.
      </p>
      
      <div className="check-form">
        <label className="check-label">
          What does the shelf say for {winnerProduct.name}?
        </label>
        
        <div className="check-inputs">
          <div className="input-group price-group">
            <span className="currency-prefix">{currencySymbol}</span>
            <input
              type="number"
              className="shelf-price-input"
              placeholder="e.g. 165"
              value={shelfPrice}
              onChange={(e) => setShelfPrice(e.target.value)}
              step="0.01"
            />
          </div>
          
          <span className="per-text">per</span>
          
          <select
            className="per-amount-select"
            value={perAmount}
            onChange={(e) => setPerAmount(e.target.value)}
          >
            <option value="1">1</option>
            <option value="100">100</option>
          </select>
          
          <select
            className="unit-select"
            value={shelfUnit}
            onChange={(e) => setShelfUnit(e.target.value)}
          >
            {UNIT_OPTIONS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        
        <button 
          className="check-math-btn"
          onClick={handleCheckMath}
          disabled={!shelfPrice}
        >
          Check math
        </button>
      </div>
      
      {/* Result Messages */}
      {checkResult && (
        <div className={`check-result ${checkResult.type}`}>
          {checkResult.type === 'success' && (
            <>
              <div className="result-header">
                <span className="result-icon">✅</span>
                <span className="result-title">{checkResult.message}</span>
              </div>
              <p className="result-subtext">{checkResult.subMessage}</p>
            </>
          )}
          
          {checkResult.type === 'warning' && (
            <>
              <div className="result-header">
                <span className="result-icon">⚠️</span>
                <span className="result-title">The small print seems wrong.</span>
              </div>
              
              <div className="price-comparison">
                <div className="comparison-row">
                  <span className="comparison-label">Shelf says:</span>
                  <span className="comparison-value shelf-value">
                    {formatCurrency(checkResult.shelfPrice, currency)} per {checkResult.perAmount}{checkResult.unit}
                  </span>
                </div>
                <div className="comparison-row">
                  <span className="comparison-label">Actual math:</span>
                  <span className="comparison-value actual-value">
                    {formatCurrency(checkResult.actualPrice, currency)} per {checkResult.perAmount}{checkResult.unit}
                  </span>
                </div>
              </div>
              
              <p className="impact-text">
                On this pack ({checkResult.totalQuantity} {checkResult.originalUnit}), that's{' '}
                <strong>{formatCurrency(Math.abs(checkResult.impact), currency)} {checkResult.isShelfLower ? 'more' : 'less'}</strong>
                {' '}than the tag makes it look.
              </p>
              
              <div className="result-actions">
                <button className="ok-btn" onClick={handleReset}>OK</button>
                <button 
                  className="explainer-btn"
                  onClick={() => setShowExplainer(!showExplainer)}
                >
                  {showExplainer ? 'Hide explanation' : 'How is this possible?'}
                </button>
              </div>
              
              {showExplainer && (
                <div className="explainer-box">
                  <p>
                    Stores often update the total price but forget to update the per-kg/per-L number. 
                    We're only checking the math. You still pay the total price printed, 
                    but the small print can make it look cheaper than it really is.
                  </p>
                </div>
              )}
            </>
          )}
          
          {checkResult.type === 'error' && (
            <div className="result-header">
              <span className="result-icon">❌</span>
              <span className="result-title">{checkResult.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
