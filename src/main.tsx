import React from 'react'
import ReactDOM from 'react-dom/client'
import {Elements} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import App from './App.tsx'
import './styles/global.css' // <--- MAKE SURE THIS LINE EXISTS!

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
console.log("VITE_STRIPE_PUBLISHABLE_KEY =", stripeKey);

const stripePromise = loadStripe(stripeKey);

//const stripePromise = loadStripe(
  //import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string
//);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>,
)