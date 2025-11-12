import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
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
import Confirmation from './pages/Confirmation';

// Import pages
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ShipperDashboard from './pages/ShipperDashboard';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Loyalty from './pages/Loyalty';
import PaymentResult from './pages/PaymentResult';

// Import components
import ProtectedRoute from './components/ProtectedRoute';

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
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm" element={<Confirmation />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shipper" 
            element={
              <ProtectedRoute shipperOnly={true}>
                <ShipperDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/loyalty" 
            element={
              <ProtectedRoute>
                <Loyalty />
              </ProtectedRoute>
            } 
          />
          <Route path="/payment-result" element={<PaymentResult />} />
        </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
