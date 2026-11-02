import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export function useSession() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Session is automatically rehydrated by Zustand persist middleware
  }, []);

  return { isAuthenticated, user };
}
