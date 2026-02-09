import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-container">
        {/* Headline */}
        <h1 className="hero-title">
          Stores use different units to confuse you
        </h1>
        <p className="hero-subtitle">
          We convert everything. You save money.
        </p>

        {/* Problem Illustration */}
        <div className="problem-demo">
          <div className="demo-shelf">
            <div className="shelf-label">Same Aisle, Same Product:</div>
            
            <div className="confusing-products">
              <div className="shelf-tag">
                <div className="product-name">🥤 Brand A Soda</div>
                <div className="product-price">$3.99</div>
                <div className="product-size">24 oz</div>
                <div className="unit-price confusing">Which is cheaper?</div>
              </div>
              
              <div className="shelf-tag">
                <div className="product-name">🥤 Brand B Soda</div>
                <div className="product-price">$5.49</div>
                <div className="product-size">2 Liter</div>
                <div className="unit-price confusing">Hard to tell!</div>
              </div>
            </div>
            
            <div className="confusion-indicator">
              <span className="emoji">🤯</span>
              <span className="text">24 oz vs 2 Liters? How do you compare?</span>
            </div>
          </div>

          {/* Solution Preview */}
          <div className="solution-arrow">↓</div>
          
          <div className="demo-solution">
            <div className="solution-label">✨ We convert to same unit:</div>
            <div className="clear-comparison">
              <div className="result-card">
                <div className="result-name">Brand A</div>
                <div className="result-price">$0.17 per oz</div>
              </div>
              <div className="result-card winner">
                <div className="winner-badge">✓ Cheaper</div>
                <div className="result-name">Brand B</div>
                <div className="result-price highlight">$0.08 per oz</div>
              </div>
            </div>
            <div className="savings-note">
              Brand B is 51% cheaper per oz!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
