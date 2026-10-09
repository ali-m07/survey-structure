import { useTranslation } from "react-i18next";
import {
  createContext,
  createElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import { apiClient, SURVEY_API } from "../services/api";
export type Membership = {
  tenant_id: string;
  role: "admin" | "editor" | "viewer";
};
type User = { id: number; username: string };
type Session = { user: User; tenants: Membership[]; token?: string };
type AuthState = {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  memberships: Membership[];
  tenant: string | null;
  role: Membership["role"] | null;
  canEdit: boolean;
  isAdmin: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; destination?: string; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  switchTenant: (tenant: string) => void;
};
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { t } = useTranslation("scene");
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [tenant, setTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const clear = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenant");
    setUser(null);
    setMemberships([]);
    setTenant(null);
  }, []);
  const apply = useCallback((data: Session) => {
    const valid = (data.tenants || []).filter(
      (member) =>
        member.tenant_id && ["admin", "editor", "viewer"].includes(member.role),
    );
    const saved = localStorage.getItem("tenant");
    const selected =
      valid.find((member) => member.tenant_id === saved) || valid[0];
    if (selected) localStorage.setItem("tenant", selected.tenant_id);
    else localStorage.removeItem("tenant");
    setUser(data.user);
    setMemberships(valid);
    setTenant(selected?.tenant_id || null);
  }, []);
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      if (!localStorage.getItem("token")) {
        clear();
        return;
      }
      apply(await apiClient.get<Session>(`${SURVEY_API}/auth/me/`));
    } catch {
      clear();
    } finally {
      setLoading(false);
    }
  }, [apply, clear]);
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);
  const login = async (username: string, password: string) => {
    try {
      clear();
      const data = await apiClient.post<Session>(`${SURVEY_API}/auth/login/`, {
        username,
        password,
      });
      if (!data.token) throw new Error(t("session.invalidResponse"));
      localStorage.setItem("token", data.token);
      apply(data);
      setLoading(false);
      return { success: true, destination: "/workspace" };
    } catch (error) {
      clear();
      return { success: false, error: String(error) };
    }
  };
  const logout = async () => {
    try {
      await apiClient.post(`${SURVEY_API}/auth/logout/`, {});
    } catch {
      /* Local sign-out remains available when the API is unreachable. */
    } finally {
      clear();
      await router.push("/login");
    }
  };
  const switchTenant = (next: string) => {
    if (!memberships.some((member) => member.tenant_id === next)) return;
    localStorage.setItem("tenant", next);
    setTenant(next);
  };
  const role =
    memberships.find((member) => member.tenant_id === tenant)?.role || null;
  return createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        authenticated: !!user,
        memberships,
        tenant,
        role,
        canEdit: role === "admin" || role === "editor",
        isAdmin: role === "admin",
        login,
        logout,
        checkAuth,
        switchTenant,
      },
    },
    children,
  );
}
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used within AuthProvider");
  return auth;
}
