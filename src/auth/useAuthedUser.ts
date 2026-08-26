import {useAuth} from "./AuthContext.tsx";

export function useAuthedUser() {
  const { user } = useAuth();
  if (!user) {
    throw new Error('useAuthedUser must be used within a <RequireAuth> route');
  }
  return user;
}
