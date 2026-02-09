import { useEffect, useRef } from 'react';
import { formatCurrency, formatUnit, formatPercentage } from '../utils/formatting';
import CheckSmallPrint from './CheckSmallPrint';
import './Results.css';

export default function Results({ result, onReset }) {
  const resultsRef = useRef(null);

  // Scroll to results when they appear
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  if (!result) return null;

  const { winner, isTie, rankings, savings, baseUnit, productCount } = result;
  // Get currency from winner or first ranking, default to USD
  const currency = winner?.currency || rankings[0]?.currency || 'USD';

  const handleShare = async () => {
    const rankingText = rankings
      .map((p, i) => `${i + 1}. ${p.name}: ${formatCurrency(p.perUnitPrice, currency)}/${baseUnit}`)
      .join('\n');
    
    const shareText = `I compared ${productCount} products using PricePerSize:

${rankingText}

${winner ? `Winner: ${winner.name} saves ${formatPercentage(savings.percentage)}!` : "It's a tie!"}

Compare yours: pricepersize.com`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Results copied to clipboard!');
    });
  };

  // Get rank position for a product
  const getRank = (product) => {
    return rankings.findIndex(r => r.index === product.index) + 1;
  };

  return (
    <section className="results" ref={resultsRef}>
      <div className="results-container">
        <h2 className="results-title">Comparison Results</h2>
        <p className="results-subtitle">{productCount} products compared by {baseUnit}</p>
        
        {/* Rankings List */}
        <div className="rankings-list">
          {rankings.map((product, rankIndex) => {
            const isWinner = rankIndex === 0 && !isTie;
            const isWorst = rankIndex === rankings.length - 1 && rankings.length > 1;
            
            return (
              <div 
                key={product.index} 
                className={`ranking-card ${isWinner ? 'winner' : ''} ${isWorst ? 'worst' : ''}`}
              >
                <div className="rank-badge">
                  {isWinner ? '🏆' : `#${rankIndex + 1}`}
                </div>
                
                <div className="ranking-content">
                  <div className="ranking-header">
                    <span className="product-name">{product.name}</span>
                    {isWinner && <span className="winner-tag">Best Deal</span>}
                  </div>
                  
                  <div className="ranking-details">
                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value">
                        {formatCurrency(product.originalPrice, currency)}
                        {product.packs > 1 && ` × ${product.packs}`}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Size:</span>
                      <span className="detail-value">
                        {formatUnit(product.originalQuantity, product.originalUnit)}
                        {product.packs > 1 && ` × ${product.packs}`}
                      </span>
                    </div>
                    {product.packs > 1 && (
                      <div className="detail-item total">
                        <span className="detail-label">Total:</span>
                        <span className="detail-value">
                          {formatCurrency(product.totalPrice, currency)} / {formatUnit(product.totalQuantity, product.originalUnit)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="per-unit-price">
                    <span className={`price-value ${isWinner ? 'winner-price' : ''}`}>
                      {formatCurrency(product.perUnitPrice, currency)}
                    </span>
                    <span className="price-unit">/{baseUnit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Savings Card */}
        {!isTie && savings.percentage > 0 && (
          <div className="savings-card">
            <div className="savings-icon">💰</div>
            <div className="savings-content">
              <h3 className="savings-title">Maximum Savings</h3>
              
              <div className="savings-main">
                <span className="savings-amount">
                  {formatCurrency(savings.perUnit, currency)}
                </span>
                <span className="savings-unit">per {baseUnit}</span>
              </div>
              
              <div className="savings-percentage">
                {formatPercentage(savings.percentage)} cheaper than worst option
              </div>
              
              <div className="savings-scenarios">
                <div className="scenario">
                  <span className="scenario-label">If you buy 100 {baseUnit}:</span>
                  <span className="scenario-value">
                    Save {formatCurrency(savings.ifBuy100Units, currency)} total
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tie Result */}
        {isTie && (
          <div className="tie-card">
            <div className="tie-icon">🤝</div>
            <div className="tie-content">
              <h3 className="tie-title">It's a Tie!</h3>
              <p className="tie-text">
                Multiple products have the same per-unit price. 
                Choose based on other factors like brand preference or convenience.
              </p>
            </div>
          </div>
        )}
        
        {/* Check Small Print Feature */}
        {winner && (
          <CheckSmallPrint 
            winnerProduct={winner}
            baseUnit={baseUnit}
            currency={currency}
          />
        )}
        
        {/* Actions */}
        <div className="result-actions">
          <button className="action-button secondary" onClick={onReset}>
            Compare Again
          </button>
          <button className="action-button primary" onClick={handleShare}>
            Share Results
          </button>
        </div>
      </div>
    </section>
  );
}
