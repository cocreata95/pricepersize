import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-container">
        {/* Badge */}
        <div className="hero-badge">
          <span className="badge-icon">🧾</span>
          <span className="badge-text">Grocery Intelligence Platform</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title">
          Scan Receipts. Track Prices.<br />
          Never Overpay Again.
        </h1>
        <p className="hero-subtitle">
          Snap your grocery receipt and we'll <strong>auto-extract every item</strong> with AI.
          Build your pantry, track price history, and always know the best deal.
        </p>

        {/* Feature Cards */}
        <div className="hero-features">
          <div className="feature-card feature-primary">
            <span className="feature-emoji">📷</span>
            <div className="feature-content">
              <h3 className="feature-name">Receipt Scanner</h3>
              <p className="feature-desc">AI extracts items, prices, and sizes instantly</p>
            </div>
          </div>
          <div className="feature-card">
            <span className="feature-emoji">🏠</span>
            <div className="feature-content">
              <h3 className="feature-name">Smart Pantry</h3>
              <p className="feature-desc">Know what you have before you shop</p>
            </div>
          </div>
          <div className="feature-card">
            <span className="feature-emoji">🏷️</span>
            <div className="feature-content">
              <h3 className="feature-name">Shelf Tag Check</h3>
              <p className="feature-desc">Catch pricing errors stores miss</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="hero-cta">
          <a href="#receipt-scanner" className="cta-button primary">
            Scan Your Receipt →
          </a>
          <a href="#quick-tag-check" className="cta-button secondary">
            Check Shelf Tags
          </a>
        </div>
      </div>
    </section>
  );
}
