"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { members as memberSeed, type MemberProfile } from "@/data/mock-data";
import { type SupportedLocale } from "@/i18n/translations";
import { PREFERRED_LOCALE_EVENT } from "@/providers/i18n-provider";
import { useTeams } from "@/providers/teams-provider";

type InternalMember = MemberProfile;
type PublicMember = Omit<MemberProfile, "password">;

type AuthState = {
  members: InternalMember[];
  currentUser?: InternalMember;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  city?: string;
  about?: string;
  favoriteDiveSite?: string;
  preferredLocale: SupportedLocale;
};

type AuthAction =
  | { type: "LOGIN"; payload: InternalMember }
  | { type: "LOGOUT" }
  | { type: "REGISTER"; payload: InternalMember }
  | { type: "UPDATE_MEMBER"; payload: UpdateMemberPayload }
  | { type: "RESET_MEMBER_PASSWORD"; payload: ResetMemberPasswordPayload }
  | { type: "REMOVE_MEMBER"; payload: { id: string } };

type UpdateMemberPayload = {
  id: string;
  data: Partial<Omit<InternalMember, "id" | "password">>;
};

type ResetMemberPasswordPayload = {
  id: string;
  newPassword: string;
};

type AuthContextValue = {
  members: PublicMember[];
  currentUser?: PublicMember;
  isTeamsAuth: boolean;
  login: (payload: LoginPayload) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoMember: () => Promise<{ success: boolean; error?: string }>;
  loginAsDemoAdmin: () => Promise<{ success: boolean; error?: string }>;
  loginAsDemoLocale: (locale: SupportedLocale) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  updateMember: (payload: UpdateMemberPayload) => Promise<{ success: boolean; error?: string }>;
  resetMemberPassword: (
    payload: ResetMemberPasswordPayload
  ) => Promise<{ success: boolean; error?: string }>;
  removeMember: (payload: { id: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN": {
      return {
        ...state,
        currentUser: action.payload
      };
    }
    case "LOGOUT": {
      return {
        ...state,
        currentUser: undefined
      };
    }
    case "REGISTER": {
      return {
        ...state,
        members: [action.payload, ...state.members],
        currentUser: action.payload
      };
    }
    case "UPDATE_MEMBER": {
      const members = state.members.map((member) =>
        member.id === action.payload.id
          ? {
              ...member,
              ...action.payload.data
            }
          : member
      );

      const currentUser = state.currentUser?.id === action.payload.id
        ? {
            ...state.currentUser,
            ...action.payload.data
          }
        : state.currentUser;

      return {
        ...state,
        members,
        currentUser
      };
    }
    case "RESET_MEMBER_PASSWORD": {
      const members = state.members.map((member) =>
        member.id === action.payload.id
          ? {
              ...member,
              password: action.payload.newPassword
            }
          : member
      );

      const currentUser = state.currentUser?.id === action.payload.id
        ? {
            ...state.currentUser,
            password: action.payload.newPassword
          }
        : state.currentUser;

      return {
        ...state,
        members,
        currentUser
      };
    }
    case "REMOVE_MEMBER": {
      const members = state.members.filter((member) => member.id !== action.payload.id);
      const currentUser = state.currentUser?.id === action.payload.id ? undefined : state.currentUser;

      return {
        ...state,
        members,
        currentUser
      };
    }
    default:
      return state;
  }
}

function sanitize(member: InternalMember): PublicMember {
  const { password, ...rest } = member;
  return rest;
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `user-${Math.random().toString(16).slice(2)}`;
}

const initialState: AuthState = {
  members: memberSeed.map((member) => ({ ...member })),
  currentUser: undefined
};

function broadcastPreferredLocale(locale: SupportedLocale) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<SupportedLocale>(PREFERRED_LOCALE_EVENT, { detail: locale }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const teams = useTeams();

  // Auto-login via Teams SSO when in Teams context
  useEffect(() => {
    const attemptTeamsLogin = async () => {
      if (!teams.isInitialized || !teams.isInTeams || state.currentUser) {
        return;
      }

      try {
        const token = await teams.getAuthToken();
        if (!token) {
          console.log('[Auth] Teams SSO token not available, using web auth');
          return;
        }

        // In production: validate token with backend and get user profile
        // For demo: auto-login as demo member when Teams context detected
        const demoMember = state.members.find((m) => m.role === 'member');
        if (demoMember) {
          dispatch({ type: 'LOGIN', payload: demoMember });
          broadcastPreferredLocale(demoMember.preferredLocale);
          console.log('[Auth] Auto-logged in via Teams SSO');
        }
      } catch (error) {
        console.error('[Auth] Teams SSO login failed:', error);
      }
    };

    attemptTeamsLogin();
  }, [teams.isInitialized, teams.isInTeams, state.currentUser, state.members, teams]);

  const value = useMemo<AuthContextValue>(() => {
    const publicMembers = state.members.map(sanitize);
    const publicCurrent = state.currentUser ? sanitize(state.currentUser) : undefined;

    const login = async (payload: LoginPayload) => {
      const email = payload.email.trim().toLowerCase();
      const candidate = state.members.find(
        (member) => member.email.toLowerCase() === email && member.password === payload.password
      );

      if (!candidate) {
        return { success: false, error: "Zugangsdaten sind nicht korrekt." };
      }

      dispatch({ type: "LOGIN", payload: candidate });
      broadcastPreferredLocale(candidate.preferredLocale);
      return { success: true };
    };

    const loginByRole = async (role: InternalMember["role"]) => {
      const candidate = state.members.find((member) => member.role === role);
      if (!candidate) {
        return { success: false, error: "Demozugang wurde nicht gefunden." };
      }
      dispatch({ type: "LOGIN", payload: candidate });
      broadcastPreferredLocale(candidate.preferredLocale);
      return { success: true };
    };

    const loginByPreferredLocale = async (preferredLocale: SupportedLocale) => {
      const candidate = state.members.find(
        (member) => member.preferredLocale === preferredLocale && member.role === "member"
      );
      if (!candidate) {
        return { success: false, error: "Demozugang wurde nicht gefunden." };
      }
      dispatch({ type: "LOGIN", payload: candidate });
      broadcastPreferredLocale(candidate.preferredLocale);
      return { success: true };
    };

    const register = async (payload: RegisterPayload) => {
      const email = payload.email.trim().toLowerCase();
      const exists = state.members.some((member) => member.email.toLowerCase() === email);

      if (exists) {
        return { success: false, error: "Es existiert bereits ein Account mit dieser E-Mail." };
      }

      const now = new Date().toISOString();
      const preferredLocale = payload.preferredLocale ?? "de";
      const newMember: InternalMember = {
        id: generateId(),
        name: payload.name.trim(),
        email,
        password: payload.password,
        role: "member",
        joinedAt: now,
        city: payload.city?.trim() ?? "",
        about:
          payload.about?.trim() ??
          "Neu in der Community und bereit für den nächsten gemeinsamen Tauchgang.",
        certifications: [],
        favoriteDiveSite: payload.favoriteDiveSite?.trim() ?? "",
        completedDives: 0,
        preferredLocale
      };

      dispatch({ type: "REGISTER", payload: newMember });
      broadcastPreferredLocale(newMember.preferredLocale);
      return { success: true };
    };

    const updateMember = async (payload: UpdateMemberPayload) => {
      const target = state.members.find((member) => member.id === payload.id);
      if (!target) {
        return { success: false, error: "Mitglied wurde nicht gefunden." };
      }

      if ("name" in payload.data && typeof payload.data.name === "string") {
        if (payload.data.name.trim().length < 2) {
          return { success: false, error: "Name benötigt mindestens 2 Zeichen." };
        }
      }

      const nextEmail = payload.data.email?.trim().toLowerCase();
      if (payload.data.email !== undefined && !nextEmail) {
        return { success: false, error: "E-Mail darf nicht leer sein." };
      }

      if (nextEmail && nextEmail !== target.email.toLowerCase()) {
        const exists = state.members.some(
          (member) => member.id !== payload.id && member.email.toLowerCase() === nextEmail
        );
        if (exists) {
          return { success: false, error: "E-Mail wird bereits von einem anderen Mitglied genutzt." };
        }
      }

      if (
        "completedDives" in payload.data &&
        payload.data.completedDives !== undefined &&
        Number.isNaN(Number(payload.data.completedDives))
      ) {
        return { success: false, error: "Tauchgänge müssen eine Zahl sein." };
      }

  const sanitized: Partial<Omit<InternalMember, "id" | "password">> = { ...payload.data };

      if ("name" in sanitized && typeof sanitized.name === "string") {
        sanitized.name = sanitized.name.trim();
      }

      if ("email" in sanitized && typeof sanitized.email === "string") {
        sanitized.email = sanitized.email.trim().toLowerCase();
      }

      if ("city" in sanitized && typeof sanitized.city === "string") {
        sanitized.city = sanitized.city.trim();
      }

      if ("about" in sanitized && typeof sanitized.about === "string") {
        sanitized.about = sanitized.about.trim();
      }

      if ("favoriteDiveSite" in sanitized && typeof sanitized.favoriteDiveSite === "string") {
        sanitized.favoriteDiveSite = sanitized.favoriteDiveSite.trim();
      }

      if ("certifications" in sanitized && Array.isArray(sanitized.certifications)) {
        sanitized.certifications = sanitized.certifications.map((cert) => cert.trim()).filter(Boolean);
      }

      if ("completedDives" in sanitized && typeof sanitized.completedDives === "number") {
        sanitized.completedDives = Math.max(0, Math.floor(sanitized.completedDives));
      }

      if ("role" in sanitized && sanitized.role !== "member" && sanitized.role !== "admin") {
        delete sanitized.role;
      }

      if ("preferredLocale" in sanitized && sanitized.preferredLocale !== undefined) {
        const candidateLocale = sanitized.preferredLocale as SupportedLocale;
        if (candidateLocale !== "de" && candidateLocale !== "en") {
          delete sanitized.preferredLocale;
        } else {
          sanitized.preferredLocale = candidateLocale;
        }
      }

      const nextPreferredLocale = sanitized.preferredLocale as SupportedLocale | undefined;

      dispatch({
        type: "UPDATE_MEMBER",
        payload: {
          id: payload.id,
          data: sanitized
        }
      });

      if (nextPreferredLocale && nextPreferredLocale !== target.preferredLocale) {
        broadcastPreferredLocale(nextPreferredLocale);
      }

      return { success: true };
    };

    const resetMemberPassword = async (payload: ResetMemberPasswordPayload) => {
      const trimmed = payload.newPassword.trim();
      if (trimmed.length < 6) {
        return { success: false, error: "Passwort benötigt mindestens 6 Zeichen." };
      }

      const target = state.members.find((member) => member.id === payload.id);
      if (!target) {
        return { success: false, error: "Mitglied wurde nicht gefunden." };
      }

      dispatch({ type: "RESET_MEMBER_PASSWORD", payload: { id: payload.id, newPassword: trimmed } });
      return { success: true };
    };

    const removeMember = async (payload: { id: string }) => {
      const target = state.members.find((member) => member.id === payload.id);
      if (!target) {
        return { success: false, error: "Mitglied wurde nicht gefunden." };
      }

      dispatch({ type: "REMOVE_MEMBER", payload: { id: payload.id } });
      return { success: true };
    };

    const logout = () => {
      dispatch({ type: "LOGOUT" });
    };

    return {
      members: publicMembers,
      currentUser: publicCurrent,
      isTeamsAuth: teams.isInTeams && !!publicCurrent,
      login,
      loginAsDemoMember: () => loginByRole("member"),
      loginAsDemoAdmin: () => loginByRole("admin"),
  loginAsDemoLocale: (preferredLocale) => loginByPreferredLocale(preferredLocale),
      register,
      updateMember,
      resetMemberPassword,
      removeMember,
      logout
    };
  }, [state, teams.isInTeams]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
