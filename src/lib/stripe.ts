import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe on the server
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', 
  {
    apiVersion: '2023-10-16',
  }
);

// Initialize Stripe on the client
export const getStripe = () => {
  return loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
  );
};

// Stripe Connect configuration
export const STRIPE_CONNECT_CONFIG = {
  // Platform application fee (5%)
  APPLICATION_FEE_PERCENT: 5,
  
  // Stripe Connect Express account type for creators
  ACCOUNT_TYPE: 'express' as const,
  
  // Required capabilities for creators
  CAPABILITIES: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  
  // Business type for fitness creators
  BUSINESS_TYPE: 'individual' as const,
};

// Helper function to calculate platform fee
export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * (STRIPE_CONNECT_CONFIG.APPLICATION_FEE_PERCENT / 100));
}

// Helper function to format price for display
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}