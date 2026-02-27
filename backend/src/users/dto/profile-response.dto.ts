export class ProfileResponseDto {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  user_type: string;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}
