const TOKEN_KEY = "p3_jwt_token";

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  return token && token.length > 0 ? token : null;
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

