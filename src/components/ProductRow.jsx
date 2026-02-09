import { useMemo } from 'react';
import { CURRENCIES, UNIT_OPTIONS, DISPLAY_UNIT_NAMES, BASE_TO_DISPLAY } from '../constants/units';
import { convertToBaseUnit, getUnitCategory } from '../utils/conversions';
import { formatCurrency } from '../utils/formatting';
import './ProductRow.css';

export default function ProductRow({ 
  index, 
  product, 
  onChange, 
  onRemove,
  canRemove,
  isWinner = false,
  savingsPercent = null,
}) {
  // Calculate live preview - convert to display-friendly unit (oz for volume/weight)
  const preview = useMemo(() => {
    const { price, quantity, unit, currency, packs = 1 } = product;
    
    if (price > 0 && quantity > 0 && unit) {
      try {
        const totalPrice = price * packs;
        const totalQuantity = quantity * packs;
        const baseQuantity = convertToBaseUnit(totalQuantity, unit);
        const perBasePrice = totalPrice / baseQuantity;
        const category = getUnitCategory(unit);
        
        // Convert to display-friendly unit (oz instead of ml/g)
        const displayUnit = DISPLAY_UNIT_NAMES[category] || 'unit';
        const conversionFactor = BASE_TO_DISPLAY[category] || 1;
        const perDisplayPrice = perBasePrice * conversionFactor;
        
        return `${formatCurrency(perDisplayPrice, currency)}/${displayUnit}`;
      } catch {
        return '—';
      }
    }
    return '—';
  }, [product]);

  const handleChange = (field, value) => {
    onChange(index, {
      ...product,
      [field]: field === 'price' || field === 'quantity' || field === 'packs'
        ? parseFloat(value) || '' 
        : value,
    });
  };

  return (
    <div className={`product-row ${isWinner ? 'winner' : ''}`}>
      <div className="product-row-header">
        <span className="product-number">Product {index + 1}</span>
        {isWinner && <span className="winner-badge">✓ Better Deal</span>}
        {canRemove && (
          <button 
            type="button"
            className="remove-btn"
            onClick={() => onRemove(index)}
            aria-label={`Remove product ${index + 1}`}
          >
            ×
          </button>
        )}
      </div>
      
      <div className="product-row-inputs">
        {/* Price per pack */}
        <div className="input-cell price-cell">
          <label className="cell-label">Price/Pack</label>
          <div className="price-wrapper">
            <select 
              className="currency-select"
              value={product.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol}
                </option>
              ))}
            </select>
            <input 
              type="number"
              className="price-input"
              placeholder="0.00"
              step="0.01"
              inputMode="decimal"
              value={product.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>
        </div>
        
        {/* Size per pack */}
        <div className="input-cell size-cell">
          <label className="cell-label">Size</label>
          <input 
            type="number"
            className="size-input"
            placeholder="0"
            step="0.01"
            inputMode="decimal"
            value={product.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />
        </div>
        
        {/* Unit */}
        <div className="input-cell unit-cell">
          <label className="cell-label">Unit</label>
          <select 
            className={`unit-select ${!product.unit ? 'placeholder' : ''}`}
            value={product.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
          >
            <option value="" disabled>Select</option>
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

        {/* Number of packs */}
        <div className="input-cell packs-cell">
          <label className="cell-label">Packs</label>
          <input 
            type="number"
            className="packs-input"
            placeholder="1"
            min="1"
            step="1"
            inputMode="numeric"
            value={product.packs || 1}
            onChange={(e) => handleChange('packs', e.target.value)}
          />
        </div>
        
        {/* Preview */}
        <div className="input-cell preview-cell">
          <label className="cell-label">Per Unit</label>
          <div className={`preview-value ${isWinner ? 'winner' : ''}`}>
            {isWinner && '✓ '}
            {preview}
            {savingsPercent > 0 && (
              <span className="savings-tag">{savingsPercent}% cheaper</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
