import { createContext } from "react";
import { LoginResponse } from "@/types/login";

export interface AuthContextType {
  user: LoginResponse["user"] | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
