import { useMemo } from 'react';
import { CURRENCIES, UNIT_OPTIONS } from '../constants/units';
import { convertToBaseUnit, getUnitCategory, getBaseUnitName } from '../utils/conversions';
import { formatCurrency } from '../utils/formatting';
import './ProductInput.css';

export default function ProductInput({ 
  productNumber, 
  product, 
  onChange 
}) {
  // Calculate live preview
  const preview = useMemo(() => {
    const { price, quantity, unit, currency } = product;
    
    if (price > 0 && quantity > 0 && unit) {
      try {
        const baseQuantity = convertToBaseUnit(quantity, unit);
        const perUnitPrice = price / baseQuantity;
        const category = getUnitCategory(unit);
        const baseUnit = getBaseUnitName(category);
        
        return `${formatCurrency(perUnitPrice, currency)}/${baseUnit}`;
      } catch {
        return '—';
      }
    }
    return '—';
  }, [product]);

  const handleChange = (field, value) => {
    onChange({
      ...product,
      [field]: field === 'price' || field === 'quantity' 
        ? parseFloat(value) || '' 
        : value,
    });
  };

  return (
    <div className="product-input-card">
      <label className="product-label">Product {productNumber}</label>
      
      {/* Price Input */}
      <div className="input-group">
        <label className="input-label">Price</label>
        <div className="price-input-wrapper">
          <select 
            className="currency-select"
            value={product.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code}
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
      
      {/* Quantity Input */}
      <div className="input-group">
        <label className="input-label">Size / Quantity</label>
        <div className="quantity-input-wrapper">
          <input 
            type="number"
            className="quantity-input"
            placeholder="0"
            step="0.01"
            inputMode="decimal"
            value={product.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />
          <select 
            className="unit-select"
            value={product.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
          >
            {UNIT_OPTIONS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
      
      {/* Live Preview */}
      <div className="per-unit-preview">
        <span className="preview-label">Per unit:</span>
        <span className="preview-value">{preview}</span>
      </div>
    </div>
  );
}
