export interface MembershipPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  benefits: string[] | null; // The controller casts this to array
  status: number;
  created_at: string;
}
