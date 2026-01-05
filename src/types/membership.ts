export interface MembershipPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stripe_price_id: string | null; // <--- Added this
  duration_days: number;
  benefits: string[] | null;
  status: number;
  created_at: string;
}
