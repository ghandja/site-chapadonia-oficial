import React from "react";
import { AccountInfo } from "../types";

interface NavbarProps {
  userAccount: AccountInfo["account"] | null;
  viewMode: "site" | "admin";
  setViewMode: (mode: "site" | "admin") => void;
  currentSitePage: string;
  setCurrentSitePage: (page: any) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  return null;
};
