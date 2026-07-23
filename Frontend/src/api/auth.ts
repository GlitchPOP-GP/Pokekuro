import { api, setToken } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  user_name?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function registerRequest(
  email: string,
  password: string,
  user_name: string
): Promise<AuthUser> {
  const res = await api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { email, password, user_name },
  });
  setToken(res.token);
  return res.user;
}

export async function loginRequest(email: string, password: string): Promise<AuthUser> {
  const res = await api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setToken(res.token);
  return res.user;
}
