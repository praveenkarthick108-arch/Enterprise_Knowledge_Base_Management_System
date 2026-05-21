import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      updateUser: (user) => set({ user }),

      updateToken: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => !!get().accessToken && !!get().user,

      hasRole: (...roles) => {
        const user = get().user;
        return user && roles.includes(user.role?.name);
      },

      isAdmin: () => get().user?.role?.name === 'admin',
      isAuthor: () => ['admin', 'author'].includes(get().user?.role?.name),
      isReviewer: () => ['admin', 'reviewer'].includes(get().user?.role?.name),
    }),
    { name: 'ekbms-auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
);

export default useAuthStore;
