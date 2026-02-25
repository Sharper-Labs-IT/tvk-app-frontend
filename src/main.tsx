import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import { AudioProvider } from "./context/AudioContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import App from './App';
import './styles/global.css';

// 1. Get the key (Clean: No console.log)
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

// 2. Load Stripe
const stripePromise = loadStripe(stripeKey);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AudioProvider>
          <CartProvider>
            <WishlistProvider>
              <Elements stripe={stripePromise}>
                <App />
              </Elements>
            </WishlistProvider>
          </CartProvider>
        </AudioProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);