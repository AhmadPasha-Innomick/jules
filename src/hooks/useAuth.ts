import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export function useAuth() {
  const { accessToken, status } = useSelector((state: RootState) => state.auth);
  return {
    isAuthenticated: !!accessToken,
    status,
    accessToken,
  };
}
