import { useState } from 'react';
import { UNIT_OPTIONS, CURRENCIES } from '../constants/units';
import { convertToBaseUnit, getUnitCategory } from '../utils/conversions';
import { formatCurrency } from '../utils/formatting';
import './QuickTagCheck.css';

// Pre-filled example: $4.69 for 200g, tag says $0.94 per 100g (should be $2.35!)
const EXAMPLE = {
  totalPrice: '4.69',
  productSize: '200',
  productUnit: 'g',
  shelfPrice: '0.94',
  perAmount: '100',
  shelfUnit: 'g'
};

export default function QuickTagCheck() {
  const [totalPrice, setTotalPrice] = useState(EXAMPLE.totalPrice);
  const [productSize, setProductSize] = useState(EXAMPLE.productSize);
  const [productUnit, setProductUnit] = useState(EXAMPLE.productUnit);
  const [currency, setCurrency] = useState('USD');
  const [shelfPrice, setShelfPrice] = useState(EXAMPLE.shelfPrice);
  const [perAmount, setPerAmount] = useState(EXAMPLE.perAmount);
  const [shelfUnit, setShelfUnit] = useState(EXAMPLE.shelfUnit);
  const [checkResult, setCheckResult] = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const handleCheckMath = () => {
    if (!totalPrice || !productSize || !shelfPrice) return;

    const totalPriceNum = parseFloat(totalPrice);
    const productSizeNum = parseFloat(productSize);
    const shelfPriceNum = parseFloat(shelfPrice);
    const perAmountNum = parseFloat(perAmount);

    try {
      const productCategory = getUnitCategory(productUnit);
      const shelfCategory = getUnitCategory(shelfUnit);
      
      if (productCategory !== shelfCategory) {
        setCheckResult({ 
          type: 'error', 
          message: 'Unit types don\'t match (e.g., comparing weight to volume)' 
        });
        return;
      }

      const productSizeInBase = convertToBaseUnit(productSizeNum, productUnit);
      const pricePerBaseUnit = totalPriceNum / productSizeInBase;
      const shelfAmountInBase = convertToBaseUnit(perAmountNum, shelfUnit);
      const actualPriceForShelfAmount = pricePerBaseUnit * shelfAmountInBase;
      
      const difference = Math.abs(shelfPriceNum - actualPriceForShelfAmount);
      const percentDiff = (difference / actualPriceForShelfAmount) * 100;
      const impactAmount = (difference / shelfAmountInBase) * productSizeInBase;

      if (percentDiff <= 2) {
        setCheckResult({
          type: 'success',
          message: 'Tag math is correct!',
          subMessage: `${currencySymbol}${actualPriceForShelfAmount.toFixed(2)} per ${perAmount}${shelfUnit} — matches the shelf.`,
          actualPrice: actualPriceForShelfAmount
        });
      } else {
        const isShelfLower = shelfPriceNum < actualPriceForShelfAmount;
        setCheckResult({
          type: 'warning',
          shelfPrice: shelfPriceNum,
          actualPrice: actualPriceForShelfAmount,
          perAmount,
          unit: shelfUnit,
          percentOff: Math.round(percentDiff),
          impact: impactAmount,
          isShelfLower,
          productSize: productSizeNum,
          productUnit
        });
      }
      
      setShowExplainer(false);
    } catch {
      setCheckResult({ type: 'error', message: 'Unable to calculate. Please check your inputs.' });
    }
  };

  const handleReset = () => {
    setCheckResult(null);
    setShowExplainer(false);
  };

  return (
    <section className="quick-tag-check" id="quick-tag-check">
      {/* Section Header */}
      <h2 className="qtc-headline">
        🚨 Catch Wrong Shelf Tags
      </h2>
      <p className="qtc-subtext">Store tags often show wrong math. Try the example below.</p>
      
      {/* Example Callout */}
      <div className="qtc-example">
        <span className="example-label">Real example:</span>
        <span className="example-text">
          Tag says <strong>$0.94</strong>/100g for a $4.69/200g item — 
          actually <strong className="example-actual">$2.35</strong>/100g (150% off!)
        </span>
      </div>
      
      {/* Card matching Calculator style */}
      <div className="qtc-card">
        {/* Product Info Row */}
        <div className="qtc-form-row">
          <div className="qtc-field">
            <label className="qtc-label">Total Price</label>
            <div className="qtc-input-group">
              <select
                className="qtc-currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="qtc-input"
                placeholder="4.69"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                step="0.01"
              />
            </div>
          </div>
          
          <div className="qtc-field">
            <label className="qtc-label">Product Size</label>
            <div className="qtc-input-group">
              <input
                type="number"
                className="qtc-input qtc-input-size"
                placeholder="200"
                value={productSize}
                onChange={(e) => setProductSize(e.target.value)}
              />
              <select
                className="qtc-select"
                value={productUnit}
                onChange={(e) => setProductUnit(e.target.value)}
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
          </div>
        </div>
        
        {/* Shelf Tag Row */}
        <div className="qtc-shelf-row">
          <label className="qtc-label">Shelf tag says</label>
          <div className="qtc-shelf-inputs">
            <div className="qtc-input-group qtc-tag-price">
              <span className="qtc-prefix">{currencySymbol}</span>
              <input
                type="number"
                className="qtc-input"
                placeholder="0.94"
                value={shelfPrice}
                onChange={(e) => setShelfPrice(e.target.value)}
                step="0.01"
              />
            </div>
            
            <span className="qtc-per">per</span>
            
            <input
              type="number"
              className="qtc-amount-input"
              placeholder="100"
              value={perAmount}
              onChange={(e) => setPerAmount(e.target.value)}
            />
            
            <select
              className="qtc-unit-select"
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
        </div>
        
        {/* Button */}
        <button 
          className="qtc-btn"
          onClick={handleCheckMath}
          disabled={!totalPrice || !productSize || !shelfPrice}
        >
          Check Math
        </button>
      </div>
      
      {/* Result */}
      {checkResult && (
        <div className={`qtc-result ${checkResult.type}`}>
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
                <span className="result-title">
                  Tag is wrong — {checkResult.percentOff}% off!
                </span>
              </div>
              
              <div className="price-comparison">
                <div className="comparison-row">
                  <span className="comparison-label">Tag says:</span>
                  <span className="comparison-value shelf-value">
                    {formatCurrency(checkResult.shelfPrice, currency)} per {checkResult.perAmount}{checkResult.unit}
                  </span>
                </div>
                <div className="comparison-row">
                  <span className="comparison-label">Actual:</span>
                  <span className="comparison-value actual-value">
                    {formatCurrency(checkResult.actualPrice, currency)} per {checkResult.perAmount}{checkResult.unit}
                  </span>
                </div>
              </div>
              
              <p className="impact-text">
                On this pack, that's{' '}
                <strong>{formatCurrency(Math.abs(checkResult.impact), currency)} {checkResult.isShelfLower ? 'more' : 'less'}</strong>
                {' '}than the tag suggests.
              </p>
              
              <div className="result-actions">
                <button className="ok-btn" onClick={handleReset}>Got it</button>
                <button 
                  className="explainer-btn"
                  onClick={() => setShowExplainer(!showExplainer)}
                >
                  {showExplainer ? 'Hide' : 'Why does this happen?'}
                </button>
              </div>
              
              {showExplainer && (
                <div className="explainer-box">
                  <p>
                    Stores update total prices but forget to recalculate the per-unit number. 
                    You still pay the total — but the small print can make it look like a better deal than it is.
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
    </section>
  );
}
