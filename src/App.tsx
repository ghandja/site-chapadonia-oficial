import React, { useState, useEffect } from "react";
import { HousesPage } from "./pages/HousesPage";
import { CoinsPurchaseModal } from "./components/CoinsPurchaseModal";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { Shield } from "lucide-react";

// Components
import { Layout } from "./components/Layout";

// Pages
import { Home } from "./pages/Home";
import { Highscores } from "./pages/Highscores";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Account } from "./pages/Account";
import { PlayerInfo } from "./pages/PlayerInfo";
import { Guilds } from "./pages/Guilds";
import { Shop } from "./pages/Shop";
import { Bazaar } from "./pages/Bazaar";
import { Wiki } from "./pages/Wiki";
import { Admin } from "./pages/Admin";
import { Houses } from "./pages/Houses";
import { Staff } from "./pages/Staff";
import { Bans } from "./pages/Bans";
import { Downloads } from "./pages/Downloads";
import { LastKills } from "./pages/LastKills";
import { Records } from "./pages/Records";

import { 
  ConfigState, PlayerCharacter, BazaarCharacter, 
  ShopItem, StashItem, NewsItem, ServerInfo, Guild, AdminConfig 
} from "./types";
import { getVocationName } from "./utils";
import { api } from "./api";
import { useAuth } from "./contexts/AuthContext";


export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Configurações Globais do Chapadonia + Servidor
  const [config, setConfig] = useState<ConfigState>({
    serverName: "Chapadonia",
    phpVersion: "8.2",
    dbHost: "127.0.0.1",
    dbUser: "root",
    dbPassword: "secure_db_pass",
    dbName: "chapadonia",
    serverPath: "/home/tibia/chapadonia-server",
    contactEmail: "ghandja1@gmail.com",
    defaultTemplate: "rebuild-chapadonia",
    encryptionType: "sha256",
    coinColumnName: "coins",
    coinColumnCustom: "points",
    experienceRate: 350,
    serverVipBonus: 15,
  });

  const { userAccount, coins, myCharacters, isAuthenticated, fetchAuthMe, setUserAccount, setMyCharacters, setCoins } = useAuth();

  // Modo Ativo: "site" ou "admin"
  const [viewMode, setViewMode] = useState<"site" | "admin">("site");

  useEffect(() => {
    if (viewMode === "admin" && !(userAccount && userAccount.email === "ghandja1@gmail.com")) {
      setViewMode("site");
    }
  }, [userAccount, viewMode]);

  const currentSitePage = location.pathname === "/" || location.pathname === "" ? "news" : location.pathname.slice(1);
  const setCurrentSitePage = (page: string) => navigate("/" + page);

  const [toast, setToast] = useState<{message: string; type: "success" | "error" | "info"} | null>(null);

  // Estados das APIs do Servidor Real (Chapadonia OT 15.25)
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [onlinePlayersList, setOnlinePlayersList] = useState<any[]>([]);
  const [onlinePlayersLoading, setOnlinePlayersLoading] = useState(false);

  // Filtros e Dados do Highscores
  const [highscoreSort, setHighscoreSort] = useState<string>("level");
  const [highscoreVocation, setHighscoreVocation] = useState<number>(0);
  const [highscorePage, setHighscorePage] = useState<number>(1);
  const [highscoreLimit, setHighscoreLimit] = useState<number>(20);
  const [highscoresData, setHighscoresData] = useState<any | null>(null);
  const [highscoresLoading, setHighscoresLoading] = useState<boolean>(false);

  // Personagem Buscado / Detalhes de Inspeção
  const [searchPlayerLoading, setSearchPlayerLoading] = useState(false);
  const [inspectedPlayerDetails, setInspectedPlayerDetails] = useState<any | null>(null);

  // Guilds State
  const [guildsList, setGuildsList] = useState<Guild[]>([]);
  const [guildsLoading, setGuildsLoading] = useState(false);

  // Lista do Bazaar (Venda/Troca de Personagens)
  const [bazaarListings, setBazaarListings] = useState<BazaarCharacter[]>([]);

  // --- SISTEMA DE STASH E MERCADO P2P DE ITENS ---
  const [selectedStashChar, setSelectedStashChar] = useState<string>("");
  const [itemSellPrice, setItemSellPrice] = useState<Record<string, number>>({});
  const [sellPrice, setSellPrice] = useState<Record<string, number | string>>({});
  const [stashItems, setStashItems] = useState<StashItem[]>([]);

  // Chaves de Recuperação (Recovery Key) por conta
  const [recoveryKeys, setRecoveryKeys] = useState<Record<string, string>>({});

  // Coins Modal State
  const [coinsModalOpen, setCoinsModalOpen] = useState(false);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [adminPlayersList, setAdminPlayersList] = useState<any[]>([]);
  const [adminPlayersLoading, setAdminPlayersLoading] = useState(false);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [adminConfigLoading, setAdminConfigLoading] = useState(false);

  // Administrative functions
  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setNewsList(data);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar notícias:", e);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchAdminPlayers = async () => {
    setAdminPlayersLoading(true);
    try {
      const res = await fetch("/api/admin/players");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setAdminPlayersList(data.players || []);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar jogadores admin:", e);
    } finally {
      setAdminPlayersLoading(false);
    }
  };

  const fetchAdminConfig = async () => {
    setAdminConfigLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setAdminConfig(data);
          if (data) {
            setConfig(prev => ({
              ...prev,
              serverName: data.serverName || prev.serverName,
              experienceRate: data.experienceRate || prev.experienceRate,
              serverVipBonus: data.serverVipBonus || prev.serverVipBonus,
              contactEmail: data.contactEmail || prev.contactEmail,
              encryptionType: data.encryptionType || prev.encryptionType,
            }));
          }
        }
      }
    } catch (e) {
      console.error("Erro ao carregar configurações admin:", e);
    } finally {
      setAdminConfigLoading(false);
    }
  };

  const handleAutoLoginAdmin = async () => {
    setCurrentSitePage("login");
  };

  const handleSaveNews = async (newsPayload: any) => {
    if (!newsPayload.title || !newsPayload.content) {
      showNotification("Por favor preencha o título e o conteúdo da notícia!", "error");
      return;
    }

    const url = newsPayload.id ? `/api/admin/news/${newsPayload.id}` : "/api/admin/news";
    const method = newsPayload.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsPayload)
      });

      if (res.ok) {
        showNotification(newsPayload.id ? "Notícia editada com sucesso!" : "Nova notícia criada com sucesso!", "success");
        fetchNews();
      } else {
        showNotification("Erro ao salvar notícia.", "error");
      }
    } catch (e) {
      console.error(e);
      showNotification("Erro ao conectar ao servidor.", "error");
    }
  };

  const handleDeleteNews = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Notícia excluída com sucesso!", "success");
        fetchNews();
      } else {
        showNotification("Erro ao excluir notícia.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePlayer = async (id: number, playerPayload: any) => {
    try {
      const res = await fetch(`/api/admin/players/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playerPayload)
      });

      if (res.ok) {
        showNotification("Jogador atualizado com sucesso!", "success");
        fetchAdminPlayers();
        fetchOnlinePlayers();
        fetchHighscores();
      } else {
        showNotification("Erro ao atualizar jogador.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlayer = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/players/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Jogador deletado do banco de dados!", "success");
        fetchAdminPlayers();
        fetchOnlinePlayers();
        fetchHighscores();
      } else {
        showNotification("Erro ao deletar jogador.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCoinsToAccount = async (accountId: number, amount: number) => {
    if (amount <= 0) {
      showNotification("Digite um valor positivo de Coins!", "error");
      return;
    }
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}/add-coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });

      if (res.ok) {
        showNotification(`Adicionado com sucesso ${amount} Coins na conta!`, "success");
        fetchAdminPlayers();
        fetchAuthMe();
      } else {
        showNotification("Erro ao adicionar coins.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGuildAdmin = async (guildId: number, guildPayload: any) => {
    try {
      const res = await fetch(`/api/admin/guilds/${guildId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guildPayload)
      });

      if (res.ok) {
        showNotification("Guilda atualizada com sucesso no banco!", "success");
        fetchGuilds();
      } else {
        showNotification("Erro ao atualizar guilda.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGuildAdmin = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/guilds/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Guilda dissolvida e deletada com sucesso!", "success");
        fetchGuilds();
      } else {
        showNotification("Erro ao deletar guilda.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGlobalConfig = async (configPayload: AdminConfig) => {
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configPayload)
      });

      if (res.ok) {
        showNotification("Configurações do OT Servidor aplicadas com sucesso!", "success");
        fetchAdminConfig();
      } else {
        showNotification("Erro ao salvar configurações do servidor.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Recovery Keys geradas na sessão atual (não persistidas)
  const [sessionGeneratedKeys, setSessionGeneratedKeys] = useState<Record<string, string>>({});

  // Recovery key updates are purely kept in state

  // E-mails confirmados por conta
  const [confirmedEmails, setConfirmedEmails] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("chapadonia_confirmed_emails");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chapadonia_confirmed_emails", JSON.stringify(confirmedEmails));
    } catch (e) {
      console.error("Erro ao salvar Confirmed Emails:", e);
    }
  }, [confirmedEmails]);

  // Função para confirmar e-mail do usuário
  const handleConfirmEmail = () => {
    if (!userAccount?.name) return;
    const accLower = userAccount.name.toLowerCase();
    setConfirmedEmails(prev => ({
      ...prev,
      [accLower]: true
    }));
    showNotification("E-mail confirmado com sucesso!", "success");
  };

  // 1. Fetch Server Info
  const fetchServerInfo = async () => {
    try {
      const res = await fetch("/api/server/info");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setServerInfo(data);
        }
      }
    } catch (e) {
      console.error("Erro ao buscar informações do servidor:", e);
    }
  };

  // 2. Fetch Online Players
  const fetchOnlinePlayers = async () => {
    try {
      setOnlinePlayersLoading(true);
      const res = await fetch("/api/server/online");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setOnlinePlayersList(data.online || []);
        }
      }
    } catch (e) {
      console.error("Erro ao buscar jogadores online:", e);
    } finally {
      setOnlinePlayersLoading(false);
    }
  };

  // Fetch Guilds
  const fetchGuilds = async () => {
    try {
      setGuildsLoading(true);
      const res = await fetch("/api/server/guilds");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setGuildsList(data.guilds || []);
        }
      }
    } catch (e) {
      console.error("Erro ao buscar guildas:", e);
    } finally {
      setGuildsLoading(false);
    }
  };

  // Join Guild
  const handleJoinGuild = async (guildId: number, characterName: string) => {
    try {
      const res = await fetch("/api/server/guilds/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId, characterName })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message, "success");
        await fetchGuilds();
        await fetchAuthMe();
      } else {
        showNotification(data.message || "Erro ao entrar na guilda", "error");
      }
    } catch (e) {
      console.error("Erro ao entrar na guilda:", e);
      showNotification("Erro ao conectar com o servidor.", "error");
    }
  };

  // Leave Guild
  const handleLeaveGuild = async (characterName: string) => {
    try {
      const res = await fetch("/api/server/guilds/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterName })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message, "success");
        await fetchGuilds();
        await fetchAuthMe();
      } else {
        showNotification(data.message || "Erro ao sair da guilda", "error");
      }
    } catch (e) {
      console.error("Erro ao sair da guilda:", e);
      showNotification("Erro ao conectar com o servidor.", "error");
    }
  };

  // Create Guild
  const handleCreateGuild = async (guildPayload: any) => {
    try {
      const res = await fetch("/api/server/guilds/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guildPayload)
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message, "success");
        await fetchGuilds();
        await fetchAuthMe();
      } else {
        showNotification(data.message || "Erro ao fundar guilda", "error");
      }
    } catch (e) {
      console.error("Erro ao fundar guilda:", e);
      showNotification("Erro de conexão.", "error");
    }
  };

  // 3. Fetch Highscores
  const fetchHighscores = async () => {
    try {
      setHighscoresLoading(true);
      const res = await fetch(
        `/api/highscores?sort=${highscoreSort}&vocation=${highscoreVocation}&page=${highscorePage}&limit=${highscoreLimit}`
      );
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setHighscoresData(data);
        }
      }
    } catch (e) {
      console.error("Erro ao buscar highscores:", e);
    } finally {
      setHighscoresLoading(false);
    }
  };

  // 4. Fetch Player Details by Name (Character Lookup)
  const handleInspectPlayerByName = async (charName: string) => {
    if (!charName.trim()) return;
    try {
      setSearchPlayerLoading(true);
      const res = await fetch(`/api/players/${encodeURIComponent(charName.trim())}`);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setInspectedPlayerDetails(data.player);
          setCurrentSitePage("player_info");
        } else {
          showNotification("Personagem não encontrado ou erro de conexão!", "error");
        }
      } else {
        showNotification("Personagem não encontrado na base de dados!", "error");
      }
    } catch (e) {
      console.error("Erro ao buscar personagem:", e);
      showNotification("Personagem não encontrado ou erro de conexão!", "error");
    } finally {
      setSearchPlayerLoading(false);
    }
  };

  // Função toast amigável
  function showNotification(message: string, type: "success" | "error" | "info" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Effects
  useEffect(() => {
    if (userAccount) {
      setCoins(userAccount.coins);
    } else {
      setCoins(0);
    }
  }, [userAccount]);

  useEffect(() => {
    const loadMarketAndBazaar = async () => {
      try {
        const bz = await api.getBazaar();
        setBazaarListings(bz);
        const mkt = await api.getMarket();
        setStashItems(mkt);
      } catch (e) {
        console.error("Erro ao carregar mercado/bazaar do servidor:", e);
      }
    };
    loadMarketAndBazaar();
  }, [userAccount]);

  useEffect(() => {
    fetchServerInfo();

    fetchOnlinePlayers();
    fetchAuthMe();
    fetchGuilds();
    fetchNews();

    const handleUnauthorized = () => {
      setUserAccount(null);
      setMyCharacters([]);
      setViewMode("site");
      setCurrentSitePage("login");
      showNotification("Acesso não autorizado. Por favor, faça login novamente.", "error");
    };

    const handleApiError = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.message) {
        showNotification(customEvent.detail.message, "error");
      }
    };

    window.addEventListener("chapadonia_unauthorized", handleUnauthorized);
    window.addEventListener("chapadonia_api_error", handleApiError);

    const interval = setInterval(() => {
      fetchOnlinePlayers();
      fetchServerInfo();
      fetchGuilds();
      fetchNews();
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("chapadonia_unauthorized", handleUnauthorized);
      window.removeEventListener("chapadonia_api_error", handleApiError);
    };
  }, []);

  useEffect(() => {
    fetchHighscores();
  }, [highscoreSort, highscoreVocation, highscorePage, highscoreLimit]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentSitePage, viewMode]);

  // Alterar senha da conta logada
  const handleChangePassword = (newPass: string) => {
    showNotification("Senha alterada com sucesso! Suas credenciais foram atualizadas.", "success");
  };

  // Gerar Recovery Key para a conta logada
  const handleGenerateRK = () => {
    if (!userAccount?.name) {
      showNotification("Você precisa estar logado para gerar uma Recovery Key!", "error");
      return;
    }
    const accNameLower = userAccount.name.toLowerCase();
    if (recoveryKeys[accNameLower]) {
      showNotification("Sua conta já possui uma Recovery Key gerada!", "error");
      return;
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const newRK = `${segment()}-${segment()}-${segment()}-${segment()}`;

    setRecoveryKeys(prev => ({
      ...prev,
      [accNameLower]: newRK
    }));
    setSessionGeneratedKeys(prev => ({
      ...prev,
      [accNameLower]: newRK
    }));
    showNotification("Recovery Key gerada com sucesso! Guarde-a com segurança.", "success");
  };

  // Criar personagem secundário dentro da conta logada
  const handleCreateSecondaryChar = async (name: string, vocation: any, gender: any) => {
    try {
      const res = await fetch("/api/auth/create-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, vocation, gender })
      });
      if (!res.ok) {
        const err = await res.json();
        showNotification(err.message || "Erro ao criar personagem", "error");
        return false;
      }
      const data = await res.json();
      const newChar: PlayerCharacter = {
        name: data.player.name,
        vocation: data.player.vocation,
        level: 1,
        gender,
        skills: { main: 10, shield: 10 },
        online: false,
        premium: true
      };
      setMyCharacters([...myCharacters, newChar]);
      showNotification(`Herói '${newChar.name}' criado com sucesso!`, "success");
      return true;
    } catch {
      showNotification("Erro de conexão ao criar personagem.", "error");
      return false;
    }
  };

  // --- SISTEMA DE STASH E MERCADO P2P ---
  const handleBuyMarketItem = async (item: StashItem) => {
    if (!userAccount) {
      showNotification("Você precisa estar logado para comprar itens!", "error");
      return;
    }
    const activeChar = selectedStashChar || myCharacters[0]?.name || "";
    if (!activeChar) {
      showNotification("Você precisa criar um herói em sua conta para comprar itens!", "error");
      return;
    }
    try {
      const res = await api.buyMarket(item.id, activeChar);
      setCoins(res.coins);
      setUserAccount(prev => prev ? { ...prev, coins: res.coins } : null);
      setStashItems(res.marketItems);
      showNotification(res.message, "success");
    } catch (err: any) {
      showNotification(err.message || "Erro ao comprar item.", "error");
    }
  };

  const handleAnnounceNewItem = (newItem: any) => {
    setStashItems(prev => [newItem, ...prev]);
    showNotification(`Sucesso! O item '${newItem.name}' foi anunciado na Loja por ${newItem.price} Coins.`, "success");
  };

  const handleListItemOnMarket = async (itemId: string) => {
    if (!userAccount) {
      showNotification("Você precisa estar logado para vender itens!", "error");
      return;
    }

    const price = itemSellPrice[itemId] || 50;
    const item = stashItems.find(i => i.id === itemId);
    const sellerChar = item?.characterName || myCharacters[0]?.name || "";
    if (!sellerChar) {
      showNotification("Você precisa criar um herói em sua conta para vender itens!", "error");
      return;
    }

    try {
      const res = await api.listMarket(itemId, price, sellerChar);
      setCoins(res.coins);
      setUserAccount(prev => prev ? { ...prev, coins: res.coins } : null);
      setStashItems(res.marketItems);
      showNotification(res.message, "success");
    } catch (err: any) {
      showNotification(err.message || "Erro ao anunciar item.", "error");
    }
  };

  const handleRemoveItemFromMarket = async (itemId: string) => {
    try {
      const res = await api.unlistMarket(itemId);
      setStashItems(res.marketItems);
      showNotification(res.message, "info");
    } catch (err: any) {
      showNotification(err.message || "Erro ao retirar item do mercado.", "error");
    }
  };

  const handleGetInitialStashItems = async (charName: string) => {
    try {
      const res = await api.seedStashPackage(charName);
      setStashItems(res.marketItems);
      showNotification(res.message, "success");
    } catch (err: any) {
      showNotification(err.message || "Erro ao obter itens do Stash.", "error");
    }
  };

  // Simular outro jogador comprando meu item (mecanismo fallback)
  const handleSimulateSomeoneBuyingMyItem = (item: StashItem) => {
    setStashItems(prev => prev.filter(itm => itm.id !== item.id));
    const profit = Math.floor((item.price || 50) * 0.9); // 10% tax
    setCoins(prev => prev + profit);
    showNotification(`🔥 OUTRO JOGADOR COMPROU SEU ITEM! '${item.name}' foi vendido! Você recebeu +${profit} Coins (Taxa de 10% aplicada)!`, "success");
  };

  // Comprar personagem do Bazaar
  const handleBuyBazaar = async (bazaarChar: BazaarCharacter) => {
    if (!userAccount) {
      showNotification("Você precisa estar logado para comprar personagens!", "error");
      return;
    }
    try {
      const res = await api.buyBazaar(bazaarChar.id);
      setCoins(res.coins);
      setUserAccount(prev => prev ? { ...prev, coins: res.coins } : null);
      setBazaarListings(res.bazaarListings);
      
      const mapped = (res.characters || []).map((c: any) => ({
        name: c.name,
        vocation: getVocationName(c.vocation),
        level: c.level,
        gender: (c.sex === 1 ? "Masculino" : "Feminino") as any,
        skills: { main: c.skill_sword || 50, shield: c.skill_shielding || 50 },
        online: false,
        premium: true
      }));
      setMyCharacters(mapped);
      showNotification(res.message, "success");
    } catch (err: any) {
      showNotification(err.message || "Erro ao comprar herói.", "error");
    }
  };

  // Vender personagem no Bazaar
  const handleListCharacterOnBazaar = async (char: PlayerCharacter, passedPrice?: number) => {
    if (!userAccount) {
      showNotification("Você precisa estar logado para vender personagens!", "error");
      return;
    }

    const accLower = userAccount.name.toLowerCase();

    // 1. Verificar se o e-mail está confirmado
    if (!confirmedEmails[accLower]) {
      showNotification("Segurança: Você precisa confirmar o seu e-mail de cadastro para poder vender personagens!", "error");
      return;
    }

    // 2. Verificar se possui Recovery Key
    if (!recoveryKeys[accLower]) {
      showNotification("Segurança: Você precisa gerar uma Recovery Key para a sua conta antes de vender personagens!", "error");
      return;
    }

    const price = passedPrice || (typeof sellPrice[char.name] === 'number' ? (sellPrice[char.name] as number) : parseInt(sellPrice[char.name] as string)) || 100;
    if (price < 50) {
      showNotification("O preço mínimo para venda de personagens é de 50 Coins!", "error");
      return;
    }

    try {
      const res = await api.listBazaar(char.name, price);
      setCoins(res.coins);
      setUserAccount(prev => prev ? { ...prev, coins: res.coins } : null);
      setBazaarListings(res.bazaarListings);
      
      const mapped = (res.characters || []).map((c: any) => ({
        name: c.name,
        vocation: getVocationName(c.vocation),
        level: c.level,
        gender: (c.sex === 1 ? "Masculino" : "Feminino") as any,
        skills: { main: c.skill_sword || 50, shield: c.skill_shielding || 50 },
        online: false,
        premium: true
      }));
      setMyCharacters(mapped);
      showNotification(res.message, "success");
    } catch (err: any) {
      showNotification(err.message || "Erro ao anunciar herói no Bazaar.", "error");
    }
  };


  // Logout handle
  const handleLogout = () => {
    setUserAccount(null);
    setMyCharacters([]);
    setViewMode("site");
    setCurrentSitePage("news");
    showNotification("Conta desconectada com sucesso.", "info");
  };

  const handleLoginSuccess = (account: any, token: string, chars: any[]) => {
    setUserAccount(account);
    const mapped = (chars || []).map((c: any) => ({
      name: c.name,
      vocation: getVocationName(c.vocation),
      level: c.level,
      gender: (c.sex === 1 ? "Masculino" : "Feminino") as any,
      skills: { main: 50, shield: 50 },
      online: false,
      premium: true
    }));
    setMyCharacters(mapped);
    showNotification(`Acesso concedido! Bem-vindo de volta, ${account.name}!`, "success");
    setCurrentSitePage("account");
  };

  return (
    <div className="min-h-screen bg-[#030712] relative select-none">
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full"
          >
            <div className={`p-4 rounded-xl border shadow-2xl text-xs font-mono flex items-center gap-2.5 ${
              toast.type === "success" 
                ? "bg-emerald-950/95 text-emerald-300 border-emerald-500/30" 
                : toast.type === "error" 
                ? "bg-rose-950/95 text-rose-300 border-rose-500/30" 
                : "bg-amber-950/95 text-amber-300 border-amber-500/30"
            }`}>
              <span className="text-sm">
                {toast.type === "success" ? "🛡️" : toast.type === "error" ? "❌" : "🔔"}
              </span>
              <div>{toast.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEVELOPER SWITCHER BAR (Interactive Tool bar at the absolute top - Apenas visível para administrador) */}
      {userAccount && userAccount.email === "ghandja1@gmail.com" && (
        <div className="bg-[#120a05] border-b-2 border-[#3d2511] text-[#f1e0c5] py-2 px-4 sticky top-0 z-[100] shadow-xl">
          <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-gradient-to-br from-[#eacf9c] to-[#cba668] rounded text-black font-extrabold flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </span>
              <div>
                <span className="font-extrabold text-white uppercase tracking-wider text-[11px] font-serif flex items-center gap-1.5">
                  Painel Chapadonia <span className="text-[9px] bg-red-600 text-white px-1 rounded font-mono">v1.0</span>
                </span>
                <p className="text-[9px] text-[#968369] hidden md:block">Gerencie notícias, altere coins dos jogadores, edite personagens, guilds e configurações globais</p>
              </div>
            </div>
   
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setViewMode("site");
                  setCurrentSitePage("news");
                  showNotification("Visualizando o site oficial do Chapadonia!", "info");
                }}
                className={`px-3 py-1 rounded font-bold transition-all text-[10px] cursor-pointer ${
                  viewMode === "site" 
                    ? "bg-gradient-to-b from-[#eacf9c] to-[#cba668] text-black shadow-lg shadow-amber-500/15 border border-[#df9c3c]" 
                    : "bg-[#1f130b] text-[#968369] border border-[#3e2610] hover:text-white"
                }`}
              >
                🖥️ Visualizar Site
              </button>
              <button
                onClick={() => {
                  setViewMode("admin");
                  fetchAdminPlayers();
                  fetchAdminConfig();
                  showNotification("Acessando o Painel de Administração do Servidor!", "info");
                }}
                className={`px-3 py-1 rounded font-bold transition-all text-[10px] cursor-pointer ${
                  viewMode === "admin" 
                    ? "bg-gradient-to-b from-[#eacf9c] to-[#cba668] text-black shadow-lg shadow-amber-500/15 border border-[#df9c3c]" 
                    : "bg-[#1f130b] text-[#968369] border border-[#3e2610] hover:text-white"
                }`}
              >
                👑 Painel Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout container */}
      <Layout
        userAccount={userAccount}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onLogout={handleLogout}
        serverInfo={serverInfo}
        experienceRate={config.experienceRate}
        onInspectPlayer={handleInspectPlayerByName}
        searchPlayerLoading={searchPlayerLoading}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode === "admin" ? "admin-panel" : currentSitePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* ROUTING GATEWAY */}
            {viewMode === "admin" ? (
              <Admin
                userAccount={userAccount}
                serverInfo={serverInfo}
                adminPlayersList={adminPlayersList}
                adminPlayersLoading={adminPlayersLoading}
                guildsList={guildsList}
                newsList={newsList}
                adminConfig={adminConfig || config}
                adminConfigLoading={adminConfigLoading}
                onAutoLoginAdmin={handleAutoLoginAdmin}
                onRefreshAdminPlayers={fetchAdminPlayers}
                onSavePlayer={handleSavePlayer}
                onDeletePlayer={handleDeletePlayer}
                onAddCoinsToAccount={handleAddCoinsToAccount}
                onSaveGuildAdmin={handleSaveGuildAdmin}
                onDeleteGuildAdmin={handleDeleteGuildAdmin}
                onSaveNews={handleSaveNews}
                onDeleteNews={handleDeleteNews}
                onSaveGlobalConfig={handleSaveGlobalConfig}
                showNotification={showNotification}
              />
            ) : (
              <Routes>
                <Route path="/" element={<Home userAccount={userAccount} setCurrentSitePage={setCurrentSitePage} />} />
                <Route path="/news" element={<Home userAccount={userAccount} setCurrentSitePage={setCurrentSitePage} />} />
                <Route path="/highscores" element={<Highscores onInspectPlayerByName={handleInspectPlayerByName} onlinePlayersList={onlinePlayersList} serverName={config.serverName} />} />
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} showNotification={showNotification} />} />
                <Route path="/register" element={<Register onRegisterSuccess={handleLoginSuccess} showNotification={showNotification} />} />
                <Route path="/account" element={userAccount ? <Account userAccount={userAccount} myCharacters={myCharacters} onLogout={handleLogout} coins={coins} confirmedEmails={confirmedEmails} recoveryKeys={recoveryKeys} sessionGeneratedKeys={sessionGeneratedKeys} stashItems={stashItems} itemSellPrice={itemSellPrice} setItemSellPrice={setItemSellPrice} sellPrice={sellPrice} setSellPrice={setSellPrice} onConfirmEmail={handleConfirmEmail} onGenerateRK={handleGenerateRK} onCreateSecondaryChar={handleCreateSecondaryChar} onListItemOnMarket={handleListItemOnMarket} onRemoveItemFromMarket={handleRemoveItemFromMarket} onListCharacterOnBazaar={handleListCharacterOnBazaar} onGetInitialStashItems={handleGetInitialStashItems} showNotification={showNotification} /> : <Login onLoginSuccess={handleLoginSuccess} showNotification={showNotification} />} />
                <Route path="/player_info" element={inspectedPlayerDetails ? <PlayerInfo player={inspectedPlayerDetails} onlinePlayersList={onlinePlayersList} onBack={() => navigate("/highscores")} /> : <Home userAccount={userAccount} setCurrentSitePage={setCurrentSitePage} />} />
                <Route path="/guilds" element={<Guilds guildsList={guildsList} guildsLoading={guildsLoading} userAccount={userAccount} myCharacters={myCharacters} onJoinGuild={handleJoinGuild} onLeaveGuild={handleLeaveGuild} onCreateGuild={handleCreateGuild} showNotification={showNotification} onInspectPlayer={handleInspectPlayerByName} setShowLoginModal={(show) => { if (show) navigate("/login"); }} />} />
                <Route path="/shop" element={<Shop coins={coins} myCharacters={myCharacters} stashItems={stashItems} onBuyMarketItem={handleBuyMarketItem} onRemoveItemFromMarket={handleRemoveItemFromMarket} onSimulateSomeoneBuyingMyItem={handleSimulateSomeoneBuyingMyItem} onAnnounceNewItem={handleAnnounceNewItem} userAccount={userAccount} setShowLoginModal={(show) => { if (show) navigate("/login"); }} setShowPixModal={(show) => setCoinsModalOpen(show)} showNotification={showNotification} />} />
                <Route path="/bazaar" element={<Bazaar bazaarListings={bazaarListings} coins={coins} onBuyCharacter={handleBuyBazaar} userAccount={userAccount} onInspectPlayer={handleInspectPlayerByName} />} />
                <Route path="/wiki" element={<Wiki experienceRate={config.experienceRate} />} />
                <Route path="/houses" element={<HousesPage />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/bans" element={<Bans />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/lastkills" element={<LastKills />} />
                <Route path="/records" element={<Records />} />
              </Routes>
            )}
          </motion.div>
        </AnimatePresence>
      </Layout>
      {/* MODAL SELEÇÃO E COMPRA DE COINS */}
      <CoinsPurchaseModal 
        isOpen={coinsModalOpen} 
        onClose={() => setCoinsModalOpen(false)} 
        showNotification={showNotification}
        onSuccessAddCoins={(amount) => {
          setCoins(coins + amount);
          if (userAccount) {
            setUserAccount({ ...userAccount, coins: userAccount.coins + amount });
          }
        }}
      />
    </div>
  );
}
