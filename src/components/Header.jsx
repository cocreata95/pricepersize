import './Header.css';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo">PricePerSize</div>
        <nav className="header-nav">
          <button className="nav-button">
            <span className="nav-icon">📊</span>
            <span>Calculator</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
