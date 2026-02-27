export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    user_type: string;
  };
}
