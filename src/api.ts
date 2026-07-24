import {
  ServerInfo,
  OnlinePlayer,
  HighscorePlayer,
  PlayerDetails,
  RecentDeath,
  AccountInfo,
  NewsItem,
  AdminConfig,
  Guild,
  BoostedCreatureInfo,
  BoostedBossInfo
} from "./types";

const API_BASE = "";

// Custom Event dispatchers for global notification/auth handling
export function triggerGlobalError(message: string, status?: number) {
  window.dispatchEvent(new CustomEvent("chapadonia_api_error", { detail: { message, status } }));
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Use sessionStorage token as primary auth (survives F5), cookie as fallback
  const token = sessionStorage.getItem("chapadonia_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        if (url.includes("/api/auth/login")) {
          let errorMessage = "E-mail ou senha incorretos!";
          try {
            const errData = await response.json();
            errorMessage = errData.message || errorMessage;
          } catch {
            // Fallback
          }
          throw new Error(errorMessage);
        }
        
        window.dispatchEvent(new CustomEvent("chapadonia_unauthorized"));
        throw new Error("Acesso não autorizado. Por favor, faça login novamente.");
      }
      
      let errorMessage = "Ocorreu um erro na requisição.";
      try {
        const errData = await response.json();
        errorMessage = errData.message || errorMessage;
      } catch {
        // Fallback to text or generic
      }

      if (response.status === 403) {
        triggerGlobalError("Acesso negado: você não tem permissão para realizar esta ação.", 403);
        throw new Error(errorMessage);
      }
      if (response.status === 404) {
        triggerGlobalError("Recurso não encontrado.", 404);
        throw new Error(errorMessage);
      }
      if (response.status === 429) {
        triggerGlobalError("Muitas requisições. Por favor, aguarde um momento.", 429);
        throw new Error(errorMessage);
      }
      
      triggerGlobalError(errorMessage, response.status);
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    return {} as T;
  } catch (error: any) {
    if (error.name === "TypeError" || error.message?.includes("Failed to fetch")) {
      triggerGlobalError("Servidor indisponível. Por favor, verifique sua conexão.", 503);
      throw new Error("Servidor indisponível. Por favor, verifique sua conexão.");
    }
    throw error;
  }
}

export const api = {
  // --- PUBLIC ENDPOINTS ---
  getNews: (): Promise<NewsItem[]> => {
    return apiFetch<NewsItem[]>("/api/news");
  },

  getBoostedCreature: (): Promise<BoostedCreatureInfo> => {
    return apiFetch<BoostedCreatureInfo>("/api/server/boosted-creature");
  },

  getBoostedBoss: (): Promise<BoostedBossInfo> => {
    return apiFetch<BoostedBossInfo>("/api/server/boosted-boss");
  },

  getServerInfo: (): Promise<ServerInfo> => {
    return apiFetch<ServerInfo>("/api/server/info");
  },

  getOnlinePlayers: (): Promise<{ online: OnlinePlayer[] }> => {
    return apiFetch<{ online: OnlinePlayer[] }>("/api/server/online");
  },

  getHighscores: (
    sort: string = "level",
    vocation: number = 0,
    page: number = 1,
    limit: number = 20
  ): Promise<{ players: HighscorePlayer[]; total: number; page: number; totalPages: number }> => {
    return apiFetch<{ players: HighscorePlayer[]; total: number; page: number; totalPages: number }>(
      `/api/highscores?sort=${sort}&vocation=${vocation}&page=${page}&limit=${limit}`
    );
  },

  getPlayerDetails: (name: string): Promise<{ player: PlayerDetails }> => {
    return apiFetch<{ player: PlayerDetails }>(`/api/players/${encodeURIComponent(name.trim())}`);
  },

  getRecentDeaths: (): Promise<{ deaths: RecentDeath[] }> => {
    return apiFetch<{ deaths: RecentDeath[] }>("/api/deaths");
  },

  // --- GUILDS ENDPOINTS ---
  getGuilds: (): Promise<{ guilds: Guild[] }> => {
    return apiFetch<{ guilds: Guild[] }>("/api/server/guilds");
  },

  joinGuild: (guildId: number, characterName: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>("/api/server/guilds/join", {
      method: "POST",
      body: JSON.stringify({ guildId, characterName }),
    });
  },

  leaveGuild: (guildId: number, characterName: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>("/api/server/guilds/leave", {
      method: "POST",
      body: JSON.stringify({ guildId, characterName }),
    });
  },

  createGuild: (payload: {
    name: string;
    description: string;
    logoChar: string;
    logoColor: string;
    leaderName: string;
    guildHall: string;
  }): Promise<{ message: string; guild: Guild }> => {
    return apiFetch<{ message: string; guild: Guild }>("/api/server/guilds/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // --- AUTH ENDPOINTS ---
  login: (email: string, password: string): Promise<{ token: string; account: AccountInfo["account"]; characters: AccountInfo["characters"] }> => {
    return apiFetch<{ token: string; account: AccountInfo["account"]; characters: AccountInfo["characters"] }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then(res => {
      sessionStorage.setItem("chapadonia_token", res.token);
      return res;
    });
  },

  register: (email: string, password: string, confirmPassword: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, confirmPassword }),
    });
  },

  getMe: (): Promise<AccountInfo> => {
    return apiFetch<AccountInfo>("/api/auth/me");
  },

  logout: () => {
    sessionStorage.removeItem("chapadonia_token");
    window.dispatchEvent(new CustomEvent("chapadonia_unauthorized"));
  },

  // --- ADMIN ENDPOINTS ---
  getAdminPlayers: (): Promise<{ players: any[] }> => {
    return apiFetch<{ players: any[] }>("/api/admin/players");
  },

  getAdminConfig: (): Promise<AdminConfig> => {
    return apiFetch<AdminConfig>("/api/admin/config");
  },

  saveAdminConfig: (config: AdminConfig): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>("/api/admin/config", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  saveNews: (news: any): Promise<{ message: string; news: NewsItem }> => {
    const isEdit = !!news.id;
    const url = isEdit ? `/api/admin/news/${news.id}` : "/api/admin/news";
    return apiFetch<{ message: string; news: NewsItem }>(url, {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify(news),
    });
  },

  deleteNews: (id: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/admin/news/${id}`, {
      method: "DELETE",
    });
  },

  savePlayer: (id: number, player: any): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/admin/players/${id}`, {
      method: "PUT",
      body: JSON.stringify(player),
    });
  },

  deletePlayer: (id: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/admin/players/${id}`, {
      method: "DELETE",
    });
  },

  addCoinsToAccount: (accountId: number, amount: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/admin/accounts/${accountId}/add-coins`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  saveAdminGuild: (id: number, guild: any): Promise<{ message: string; guild: Guild }> => {
    return apiFetch<{ message: string; guild: Guild }>(`/api/admin/guilds/${id}`, {
      method: "PUT",
      body: JSON.stringify(guild),
    });
  },

  deleteAdminGuild: (id: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/admin/guilds/${id}`, {
      method: "DELETE",
    });
  },

  // --- TRANSCONAL HOUSES, BAZAAR, P2P MARKET API ---
  getHouses: (): Promise<any[]> => {
    return apiFetch<any[]>("/api/houses");
  },

  bidHouse: (houseId: number, characterName: string, amount: number): Promise<{ message: string; coins: number; house: any }> => {
    return apiFetch<{ message: string; coins: number; house: any }>(`/api/houses/${houseId}/bid`, {
      method: "POST",
      body: JSON.stringify({ characterName, amount }),
    });
  },

  getBazaar: (): Promise<any[]> => {
    return apiFetch<any[]>("/api/bazaar");
  },

  listBazaar: (
    characterName: string, 
    price: number, 
    recoveryKey?: string, 
    isEmailConfirmed?: boolean, 
    isPhoneConfirmed?: boolean
  ): Promise<{ message: string; coins: number; characters: any[]; bazaarListings: any[] }> => {
    return apiFetch<{ message: string; coins: number; characters: any[]; bazaarListings: any[] }>("/api/bazaar/list", {
      method: "POST",
      body: JSON.stringify({ characterName, price, recoveryKey, isEmailConfirmed, isPhoneConfirmed }),
    });
  },

  buyBazaar: (listingId: string): Promise<{ message: string; coins: number; characters: any[]; bazaarListings: any[] }> => {
    return apiFetch<{ message: string; coins: number; characters: any[]; bazaarListings: any[] }>("/api/bazaar/buy", {
      method: "POST",
      body: JSON.stringify({ listingId }),
    });
  },

  getMarket: (): Promise<any[]> => {
    return apiFetch<any[]>("/api/market");
  },

  listMarket: (itemId: string, price: number, characterName: string): Promise<{ message: string; coins: number; marketItems: any[] }> => {
    return apiFetch<{ message: string; coins: number; marketItems: any[] }>("/api/market/list", {
      method: "POST",
      body: JSON.stringify({ itemId, price, characterName }),
    });
  },

  buyMarket: (itemId: string, activeChar: string): Promise<{ message: string; coins: number; marketItems: any[] }> => {
    return apiFetch<{ message: string; coins: number; marketItems: any[] }>("/api/market/buy", {
      method: "POST",
      body: JSON.stringify({ itemId, activeChar }),
    });
  },

  unlistMarket: (itemId: string): Promise<{ message: string; marketItems: any[] }> => {
    return apiFetch<{ message: string; marketItems: any[] }>("/api/market/unlist", {
      method: "POST",
      body: JSON.stringify({ itemId }),
    });
  },


  seedStashPackage: (characterName: string): Promise<{ message: string; marketItems: any[] }> => {
    return apiFetch<{ message: string; marketItems: any[] }>("/api/market/seed", {
      method: "POST",
      body: JSON.stringify({ characterName }),
    });
  },

  updateCoins: (coins: number): Promise<{ message: string; coins: number }> => {
    return apiFetch<{ message: string; coins: number }>("/api/account/coins", {
      method: "POST",
      body: JSON.stringify({ coins }),
    });
  },
};
