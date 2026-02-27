export class ServiceResponseDto {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  category: string;
  icon_url?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}
