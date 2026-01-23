export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: {
    id: string;
    email: string;
  } | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  } | null;
  error?: string | null;
}

export interface UserResponse {
  user: {
    id: string;
    email: string;
  } | null;
  error?: string | null;
}
