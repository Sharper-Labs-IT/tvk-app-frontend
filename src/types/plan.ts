export interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  features?: string[];
  billingNote?: string;
  duration_days: number;
  benefits: string[];
  status: number;
  created_at: string;
  updated_at: string;
}