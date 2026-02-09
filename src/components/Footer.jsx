import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <p className="footer-text">
          PricePerSize — Stop letting stores confuse you with different units.
        </p>
        <p className="footer-copyright">
          © {new Date().getFullYear()} PricePerSize. Made with ❤️ for smart shoppers.
        </p>
      </div>
    </footer>
  );
}
