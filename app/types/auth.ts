import type { ReactNode } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface AuthProviderProps {
    children: ReactNode;
}