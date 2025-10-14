import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ScrollToTop from './components/ScrollToTop';

// Import pages
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Home component
const Home = () => {
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
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
