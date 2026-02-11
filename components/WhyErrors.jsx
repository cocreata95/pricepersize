import './WhyErrors.css';

export default function WhyErrors() {
  return (
    <section className="why-section" id="why-errors">
      <div className="why-container">
        <h2 className="why-title">Why Shelf Tags Are Often Wrong</h2>
        
        <div className="reasons-grid">
          <div className="reason-card">
            <div className="reason-icon">🔄</div>
            <h3 className="reason-title">System Updates</h3>
            <p className="reason-text">
              When stores change total prices, the per-kg/per-L 
              calculation doesn't always update automatically.
            </p>
          </div>
          
          <div className="reason-card">
            <div className="reason-icon">🏷️</div>
            <h3 className="reason-title">Manual Entry Errors</h3>
            <p className="reason-text">
              Staff manually entering unit prices sometimes 
              make calculation mistakes.
            </p>
          </div>
          
          <div className="reason-card">
            <div className="reason-icon">📦</div>
            <h3 className="reason-title">Package Changes</h3>
            <p className="reason-text">
              Products shrink from 200g to 180g, but tags 
              still show old per-100g numbers.
            </p>
          </div>
          
          <div className="reason-card">
            <div className="reason-icon">🌐</div>
            <h3 className="reason-title">Different Units</h3>
            <p className="reason-text">
              Stores show oz, lb, L, kg differently — 
              making mental math nearly impossible.
            </p>
          </div>
        </div>
        
        <p className="why-conclusion">
          <strong>Bottom line:</strong> These are honest mistakes, but they cost you money.<br />
          Our tools catch them in 10 seconds.
        </p>
      </div>
    </section>
  );
}
