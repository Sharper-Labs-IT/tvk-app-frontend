import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext.tsx";
import { AudioProvider } from "./context/AudioContext.tsx";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import App from './App.tsx';
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
          <Elements stripe={stripePromise}>
            <App />
          </Elements>
        </AudioProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);