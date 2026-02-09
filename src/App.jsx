import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Calculator from './components/Calculator';
import QuickTagCheck from './components/QuickTagCheck';
import Results from './components/Results';
import Footer from './components/Footer';
import './styles/global.css';
import './App.css';

function App() {
  const [results, setResults] = useState(null);

  const handleResults = (result) => {
    setResults(result);
  };

  const handleReset = () => {
    setResults(null);
    // Scroll back to calculator
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Calculator onResults={handleResults} />
        <QuickTagCheck />
        <Results result={results} onReset={handleReset} />
        <Hero />
      </main>
      <Footer />
    </div>
  );
}

export default App;
