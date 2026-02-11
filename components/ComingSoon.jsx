import './ComingSoon.css';

export default function ComingSoon() {
  return (
    <section className="coming-soon" id="coming-soon">
      <div className="coming-container">
        <div className="coming-badge">
          <span className="badge-icon">🚀</span>
          <span className="badge-text">Coming Soon</span>
        </div>
        
        <h2 className="coming-title">📊 Price Intelligence for Stores</h2>
        
        <p className="coming-intro">
          We're building analytics tools to help grocery retailers:
        </p>
        
        <ul className="coming-features">
          <li>
            <span className="feature-check">✓</span>
            <span className="feature-text">Identify and fix pricing errors automatically</span>
          </li>
          <li>
            <span className="feature-check">✓</span>
            <span className="feature-text">Monitor competitor pricing in real-time</span>
          </li>
          <li>
            <span className="feature-check">✓</span>
            <span className="feature-text">Optimize per-unit pricing for better conversions</span>
          </li>
        </ul>
        
        <div className="coming-cta">
          <p className="cta-text">
            <strong>Store owners & managers:</strong>
          </p>
          <a href="mailto:hello@pricepersize.site?subject=Store%20Analytics%20Early%20Access" className="cta-link">
            Join our early access program →
          </a>
        </div>
      </div>
    </section>
  );
}
