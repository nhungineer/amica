/// <reference types="vite/client" />
import React, { createContext, useContext, useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// User data structure
interface User {
  id: string;
  email: string;
  name: string;
}

// What the AuthContext provides
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context (initially undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component - wraps your app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load auth from localStorage on mount (when app starts)
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []); // Empty dependency array = run once on mount

  // Login function - save to state AND localStorage
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  // Logout function - clear everything
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token, // !! converts to boolean (token exists = true)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth in components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// Helper function for authenticated API calls
export async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}
