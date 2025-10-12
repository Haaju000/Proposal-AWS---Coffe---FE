import React from 'react';
import './css/globals.css';
import './App.css';

// Import components
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import CustomerFavorites from './components/CustomerFavorites';
import LoyaltyProgram from './components/LoyaltyProgram';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Features />
        <CustomerFavorites />
        <LoyaltyProgram />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

export default App;
