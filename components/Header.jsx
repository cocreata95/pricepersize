import './Header.css';

export default function Header({ user, onSignInClick }) {
  return (
    <header className="site-header">
      <div className="header-container">
        <a href="#" className="logo">
          <span className="logo-icon">🧾</span>
          <span className="logo-text">PricePerSize</span>
        </a>
        <nav className="header-nav">
          <a href="#receipt-scanner" className="nav-button">
            <span className="nav-icon">📷</span>
            <span className="nav-label">Scan</span>
          </a>
          <a href="#pantry" className="nav-button">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Pantry</span>
          </a>
          <a href="#quick-tag-check" className="nav-button">
            <span className="nav-icon">🏷️</span>
            <span className="nav-label">Tag Check</span>
          </a>
          <a href="#calculator" className="nav-button">
            <span className="nav-icon">📊</span>
            <span className="nav-label">Calculator</span>
          </a>
          {user ? (
            <div className="user-avatar" title={user.email}>
              {user.email?.[0]?.toUpperCase() || '?'}
            </div>
          ) : (
            <button className="sign-in-btn" onClick={onSignInClick}>
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
