export class BarberStatsDto {
  total_revenue: number;
  appointments_completed: number;
  appointments_total: number;
  average_rating: number;
  repeat_customer_rate: number;
  no_show_rate: number;
  total_customers: number;
}

export class BarberResponseDto {
  id: string;
  tenant_id: string;
  user_id: string;
  bio: string | null;
  rating: number;
  commission_percentage: number | null;
  working_hours: Record<string, any> | null;
  created_at: string;
  updated_at: string;

  // Joined user data
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };

  // Optional stats
  stats?: BarberStatsDto;
}
