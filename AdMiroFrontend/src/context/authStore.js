import { create } from "zustand";

export const useAuthStore = create(set => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: user =>
    set(() => ({
      user,
      isAuthenticated: !!user,
    })),
  setToken: token =>
    set(() => ({
      token,
    })),
  logout: () =>
    set(() => ({
      user: null,
      token: null,
      isAuthenticated: false,
    })),
}));
