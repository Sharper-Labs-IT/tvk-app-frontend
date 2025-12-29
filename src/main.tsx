import React from 'react';
import ReactDOM from 'react-dom/client';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import App from './App.tsx';
import './styles/global.css';

// 1. Get the key (No console.log here anymore)
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

// 2. Load Stripe
const stripePromise = loadStripe(stripeKey);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);
