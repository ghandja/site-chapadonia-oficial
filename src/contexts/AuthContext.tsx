import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "../api";
import { getVocationName } from "../utils";
import { AccountInfo, PlayerCharacter } from "../types";

interface AuthState {
  userAccount: AccountInfo["account"] | null;
  coins: number;
  myCharacters: PlayerCharacter[];
  isAuthenticated: boolean;
}

type AccountData = AccountInfo["account"];

interface AuthContextType extends AuthState {
  fetchAuthMe: () => Promise<void>;
  setUserAccount: React.Dispatch<React.SetStateAction<AccountData | null>>;
  setMyCharacters: React.Dispatch<React.SetStateAction<PlayerCharacter[]>>;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userAccount, setUserAccount] = useState<AccountInfo["account"] | null>(null);
  const [coins, setCoins] = useState(0);
  const [myCharacters, setMyCharacters] = useState<PlayerCharacter[]>([]);

  useEffect(() => {
    if (userAccount) {
      setCoins(userAccount.coins);
    } else {
      setCoins(0);
    }
  }, [userAccount]);

  const fetchAuthMe = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("chapadonia_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/auth/me", { headers, credentials: "include" });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.account) {
            setUserAccount(data.account);
            // Sync token back to sessionStorage if found via cookie (F5 recovery)
            if (data.token) sessionStorage.setItem("chapadonia_token", data.token);
            const mapped = (data.characters || []).map((c: any) => ({
              name: c.name,
              vocation: getVocationName(c.vocation),
              level: c.level,
              gender: (c.sex === 1 ? "Masculino" : "Feminino") as any,
              skills: { main: 50, shield: 50 },
              online: false,
              premium: true,
            }));
            setMyCharacters(mapped);
          } else {
            setUserAccount(null);
            setMyCharacters([]);
          }
        }
      }
    } catch (e) {
      console.error("Auth fetch error:", e);
    }
  }, []);

  const isAuthenticated = userAccount !== null;

  return (
    <AuthContext.Provider value={{
      userAccount, coins, myCharacters, isAuthenticated,
      fetchAuthMe, setUserAccount, setMyCharacters, setCoins,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
