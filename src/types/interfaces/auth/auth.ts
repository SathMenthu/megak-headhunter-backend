export interface AuthLoginData {
  email: string;
  password: string;
}

export interface TokenPayload {
  accessToken: string;
  expiresIn: number;
}
