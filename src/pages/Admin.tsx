import React, { useState } from "react";
import { 
  Settings, Lock, Sparkles, RefreshCw, Coins, Trash2, 
  Edit, Plus, Save, Server, Shield, MessageSquare, AlertCircle, LockKeyhole 
} from "lucide-react";
import { PlayerCharacter, Guild, NewsItem, AdminConfig } from "../types";
import { getVocationName } from "../utils";

interface AdminProps {
  userAccount: any | null;
  serverInfo: any;
  adminPlayersList: any[];
  adminPlayersLoading: boolean;
  guildsList: Guild[];
  newsList: NewsItem[];
  adminConfig: AdminConfig;
  adminConfigLoading: boolean;
  onAutoLoginAdmin: () => void;
  onRefreshAdminPlayers: () => void;
  onSavePlayer: (id: number, player: any) => Promise<void>;
  onDeletePlayer: (id: number) => Promise<void>;
  onAddCoinsToAccount: (accountId: number, amount: number) => Promise<void>;
  onSaveGuildAdmin: (id: number, guild: any) => Promise<void>;
  onDeleteGuildAdmin: (id: number) => Promise<void>;
  onSaveNews: (news: any) => Promise<void>;
  onDeleteNews: (id: number) => Promise<void>;
  onSaveGlobalConfig: (config: AdminConfig) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export const Admin: React.FC<AdminProps> = ({
  userAccount,
  serverInfo,
  adminPlayersList,
  adminPlayersLoading,
  guildsList,
  newsList,
  adminConfig,
  adminConfigLoading,
  onAutoLoginAdmin,
  onRefreshAdminPlayers,
  onSavePlayer,
  onDeletePlayer,
  onAddCoinsToAccount,
  onSaveGuildAdmin,
  onDeleteGuildAdmin,
  onSaveNews,
  onDeleteNews,
  onSaveGlobalConfig,
  showNotification,
}) => {
  const [activeTab, setActiveTab] = useState<"players" | "guilds" | "news" | "config">("players");

  // Editing Player state
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [playerEditForm, setPlayerEditForm] = useState<any>({
    name: "", level: 1, vocation: 1, balance: 0, health: 150, healthmax: 150, 
    mana: 50, manamax: 50, maglevel: 0, online: false, accountEmail: "", accountCoins: 0
  });

  // Adding Coins state
  const [coinTargetAccountId, setCoinTargetAccountId] = useState<number | null>(null);
  const [coinAmountToAdd, setCoinAmountToAdd] = useState(1000);

  // Editing Guild state
  const [editingGuildId, setEditingGuildId] = useState<number | null>(null);
  const [guildEditForm, setGuildEditForm] = useState<any>({
    name: "", logoColor: "", logoChar: "", description: "", guildHall: ""
  });

  // Editing News state
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [newsForm, setNewsForm] = useState<any>({
    title: "", category: "HOT", content: "", bulletsText: "", author: "Administrador"
  });

  // Config state
  const [configState, setConfigState] = useState<AdminConfig | null>(null);

  // Sync adminConfig state once loaded
  React.useEffect(() => {
    if (adminConfig) {
      setConfigState({ ...adminConfig });
    }
  }, [adminConfig]);

  const isAdmin = userAccount && userAccount.email === "ghandja1@gmail.com";

  // Actions
  const handlePlayerEditClick = (player: any) => {
    setEditingPlayerId(player.id);
    setPlayerEditForm({
      name: player.name,
      level: player.level,
      vocation: player.vocation,
      balance: player.balance || 0,
      health: player.health || 150,
      healthmax: player.healthmax || 150,
      mana: player.mana || 50,
      manamax: player.manamax || 50,
      maglevel: player.maglevel || 0,
      online: !!player.online,
      accountEmail: player.accountEmail || "",
      accountCoins: player.accountCoins || 0
    });
  };

  const handlePlayerSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayerId) return;
    try {
      await onSavePlayer(editingPlayerId, playerEditForm);
      setEditingPlayerId(null);
    } catch (e) {
      // Notification handled in fetch layer
    }
  };

  const handleAddCoinsClick = async () => {
    if (!coinTargetAccountId) return;
    try {
      await onAddCoinsToAccount(coinTargetAccountId, coinAmountToAdd);
      setCoinTargetAccountId(null);
    } catch (e) {}
  };

  const handleGuildEditClick = (guild: any) => {
    setEditingGuildId(guild.id);
    setGuildEditForm({
      name: guild.name,
      logoColor: guild.logoColor || "from-red-600 to-amber-600",
      logoChar: guild.logoChar || "🛡️",
      description: guild.description || "",
      guildHall: guild.guildHall || "Nenhum"
    });
  };

  const handleGuildSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuildId) return;
    try {
      await onSaveGuildAdmin(editingGuildId, guildEditForm);
      setEditingGuildId(null);
    } catch (e) {}
  };

  const handleNewsSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newsForm,
        id: editingNewsId || undefined,
        bullets: newsForm.bulletsText ? newsForm.bulletsText.split("\n").filter((l: string) => l.trim()) : []
      };
      await onSaveNews(payload);
      setEditingNewsId(null);
      setNewsForm({ title: "", category: "HOT", content: "", bulletsText: "", author: "Administrador" });
    } catch (e) {}
  };

  const handleNewsEditClick = (n: any) => {
    setEditingNewsId(n.id);
    setNewsForm({
      title: n.title,
      category: n.category,
      content: n.content,
      bulletsText: n.bullets ? n.bullets.join("\n") : "",
      author: n.author || "Administrador"
    });
  };

  const handleConfigSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configState) return;
    try {
      await onSaveGlobalConfig(configState);
    } catch (e) {}
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto bg-[#18110b] border-2 border-[#5d3f1a] rounded-xl p-6 shadow-2xl text-center space-y-5 my-6">
        <div className="w-16 h-16 bg-[#312213] rounded-full border border-[#cfa152] flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-7 h-7 text-[#cfa152]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#cfa152] font-serif uppercase tracking-wider">Acesso Administrativo</h2>
          <p className="text-[11px] text-[#968369] mt-1">Faça login com sua conta de administrador.</p>
        </div>
        <button
          onClick={onAutoLoginAdmin}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3 px-4 rounded-lg shadow-lg cursor-pointer transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <LockKeyhole className="w-4 h-4" /> Ir para Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#18110b] border-2 border-[#5d3f1a] rounded-xl p-5 md:p-6 shadow-2xl space-y-6 text-[#f1e0c5]">
      
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b-2 border-[#312213] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#cfa152] rounded-lg flex items-center justify-center text-black shadow-md shrink-0">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-[#cfa152] font-serif uppercase tracking-wider">PAINEL DO ADMINISTRADOR SUPREMO</h2>
            <p className="text-[10px] text-[#968369] font-mono">Logado como: <span className="text-white font-bold">{userAccount.email}</span></p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex gap-4 flex-wrap justify-end text-xs font-mono">
          <div className="bg-[#110904] px-3 py-1.5 rounded border border-[#3e2610] text-center min-w-[100px]">
            <span className="text-amber-500 font-bold block text-sm">{adminPlayersList?.length || 0}</span>
            <span className="text-[9px] text-[#968369]">Jogadores</span>
          </div>
          <div className="bg-[#110904] px-3 py-1.5 rounded border border-[#3e2610] text-center min-w-[100px]">
            <span className="text-green-500 font-bold block text-sm">{serverInfo?.playersOnline || 0}</span>
            <span className="text-[9px] text-[#968369]">Online</span>
          </div>
          <div className="bg-[#110904] px-3 py-1.5 rounded border border-[#3e2610] text-center min-w-[100px]">
            <span className="text-[#cfa152] font-bold block text-sm">{newsList?.length || 0}</span>
            <span className="text-[9px] text-[#968369]">Notícias</span>
          </div>
        </div>
      </div>

      {/* Menu de Abas Internas */}
      <div className="flex flex-wrap border-b border-[#312213] gap-1 text-xs font-serif font-bold">
        <button
          onClick={() => { setActiveTab("players"); onRefreshAdminPlayers(); }}
          className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === "players"
              ? "bg-[#3e2610] text-[#cfa152] border-t-2 border-l border-r border-[#5d3f1a]"
              : "text-[#968369] hover:text-[#f1e0c5]"
          }`}
        >
          👥 Personagens & Contas
        </button>
        <button
          onClick={() => { setActiveTab("guilds"); }}
          className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === "guilds"
              ? "bg-[#3e2610] text-[#cfa152] border-t-2 border-l border-r border-[#5d3f1a]"
              : "text-[#968369] hover:text-[#f1e0c5]"
          }`}
        >
          🛡️ Guildas do Servidor
        </button>
        <button
          onClick={() => { setActiveTab("news"); }}
          className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === "news"
              ? "bg-[#3e2610] text-[#cfa152] border-t-2 border-l border-r border-[#5d3f1a]"
              : "text-[#968369] hover:text-[#f1e0c5]"
          }`}
        >
          📢 Notícias & Updates
        </button>
        <button
          onClick={() => { setActiveTab("config"); }}
          className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === "config"
              ? "bg-[#3e2610] text-[#cfa152] border-t-2 border-l border-r border-[#5d3f1a]"
              : "text-[#968369] hover:text-[#f1e0c5]"
          }`}
        >
          ⚙️ Configuração Global
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-4">
        
        {/* PLAYERS & ACCOUNTS */}
        {activeTab === "players" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#110904] p-3 rounded-lg border border-[#3e2610]">
              <div className="text-xs">
                <span className="font-bold text-[#cfa152] block">Banco de Dados Ativo: MySQL</span>
                <p className="text-[10px] text-[#968369]">Todas as alterações editam diretamente o banco de dados em tempo real.</p>
              </div>
              <button
                onClick={onRefreshAdminPlayers}
                className="bg-[#3e2610] hover:bg-[#5a3b1a] border border-[#5d3f1a] text-[#eadac2] font-mono px-3 py-1 rounded text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Recarregar Dados
              </button>
            </div>

            {/* Editing Character form */}
            {editingPlayerId && (
              <form onSubmit={handlePlayerSaveSubmit} className="bg-[#1f130b] border border-amber-500/30 rounded-lg p-4 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-[#3e2610] pb-2">
                  <h4 className="font-bold text-[#cfa152] flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-500" />
                    Editando Personagem: <span className="text-white font-mono">{playerEditForm.name}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingPlayerId(null)}
                    className="text-red-400 hover:text-red-300 font-mono font-bold cursor-pointer"
                  >
                    [Cancelar]
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Nome do Personagem</label>
                    <input
                      type="text"
                      value={playerEditForm.name}
                      onChange={e => setPlayerEditForm({...playerEditForm, name: e.target.value})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Level</label>
                    <input
                      type="number"
                      value={playerEditForm.level}
                      onChange={e => setPlayerEditForm({...playerEditForm, level: Number(e.target.value)})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Vocação</label>
                    <select
                      value={playerEditForm.vocation}
                      onChange={e => setPlayerEditForm({...playerEditForm, vocation: Number(e.target.value)})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    >
                      <option value={0}>None</option>
                      <option value={1}>Sorcerer</option>
                      <option value={2}>Druid</option>
                      <option value={3}>Paladin</option>
                      <option value={4}>Knight</option>
                      <option value={5}>Master Sorcerer</option>
                      <option value={6}>Elder Druid</option>
                      <option value={7}>Royal Paladin</option>
                      <option value={8}>Elite Knight</option>
                      <option value={9}>Monk</option>
                      <option value={10}>Exalted Monk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Saldo do Banco (Gold)</label>
                    <input
                      type="number"
                      value={playerEditForm.balance}
                      onChange={e => setPlayerEditForm({...playerEditForm, balance: Number(e.target.value)})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">E-mail da Conta</label>
                    <input
                      type="email"
                      value={playerEditForm.accountEmail}
                      onChange={e => setPlayerEditForm({...playerEditForm, accountEmail: e.target.value})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Moedas Premium (Coins)</label>
                    <input
                      type="number"
                      value={playerEditForm.accountCoins}
                      onChange={e => setPlayerEditForm({...playerEditForm, accountCoins: Number(e.target.value)})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Conectividade</label>
                    <select
                      value={playerEditForm.online ? "true" : "false"}
                      onChange={e => setPlayerEditForm({...playerEditForm, online: e.target.value === "true"})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    >
                      <option value="false">🔴 Offline</option>
                      <option value="true">🟢 Online (Forçar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Magic Level</label>
                    <input
                      type="number"
                      value={playerEditForm.maglevel}
                      onChange={e => setPlayerEditForm({...playerEditForm, maglevel: Number(e.target.value)})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold px-5 py-2 rounded shadow-md cursor-pointer uppercase font-serif"
                >
                  Salvar Alterações
                </button>
              </form>
            )}

            {/* Add Coins block */}
            {coinTargetAccountId && (
              <div className="bg-[#1f130b] border border-amber-500/30 rounded-lg p-4 space-y-3 text-xs animate-fadeIn">
                <span className="font-bold text-[#cfa152] block">💳 Injetar Coins na Conta ID: {coinTargetAccountId}</span>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="number"
                    value={coinAmountToAdd}
                    onChange={e => setCoinAmountToAdd(Number(e.target.value))}
                    className="bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] w-32 focus:outline-none"
                    placeholder="Quantidade"
                  />
                  <button
                    onClick={handleAddCoinsClick}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3 py-2 rounded cursor-pointer"
                  >
                    Adicionar Coins
                  </button>
                  <button
                    onClick={() => setCoinTargetAccountId(null)}
                    className="text-slate-400 font-mono cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Players Table */}
            <div className="overflow-x-auto border border-[#3e2610] rounded-xl bg-[#110904]/40">
              {adminPlayersLoading ? (
                <div className="p-8 text-center text-[#968369] font-mono animate-pulse">
                  Carregando banco de dados de jogadores...
                </div>
              ) : adminPlayersList.length === 0 ? (
                <div className="p-8 text-center text-[#968369] font-mono">
                  Nenhum jogador cadastrado na base do Chapadonia.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#110904] text-[#cfa152] border-b border-[#3e2610] font-serif font-bold">
                      <th className="p-3">ID</th>
                      <th className="p-3">Nome</th>
                      <th className="p-3">Level</th>
                      <th className="p-3">Vocação</th>
                      <th className="p-3">Saldo Coins</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">E-mail da Conta</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#312213] font-mono text-[#d9c5a3]">
                    {adminPlayersList.map((player) => (
                      <tr key={player.id} className="hover:bg-[#1f130b]/35">
                        <td className="p-3 text-[#968369]">{player.id}</td>
                        <td className="p-3 font-bold text-white font-serif">{player.name}</td>
                        <td className="p-3 text-amber-100">{player.level}</td>
                        <td className="p-3 text-[11px]">{getVocationName(player.vocation)}</td>
                        <td className="p-3 font-bold text-amber-400">
                          <span className="flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            {player.accountCoins || 0}
                          </span>
                        </td>
                        <td className="p-3">
                          {player.online ? (
                            <span className="text-emerald-500">🟢 Online</span>
                          ) : (
                            <span className="text-rose-500">🔴 Offline</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 text-[10px] truncate max-w-[150px]">{player.accountEmail}</td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setCoinTargetAccountId(player.accountId || player.account_id);
                              setCoinAmountToAdd(1000);
                            }}
                            className="bg-[#3e2610] hover:bg-amber-500 hover:text-black border border-[#5d3f1a] text-amber-200 px-2.5 py-1 rounded text-[10px] cursor-pointer"
                          >
                            + Coins
                          </button>
                          <button
                            onClick={() => handlePlayerEditClick(player)}
                            className="bg-yellow-600/20 hover:bg-yellow-600 border border-yellow-600/40 text-yellow-300 hover:text-black px-2.5 py-1 rounded text-[10px] cursor-pointer font-bold"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deletar permanentemente o jogador ${player.name} e limpar sua tabela?`)) {
                                onDeletePlayer(player.id);
                              }
                            }}
                            className="bg-red-950 hover:bg-red-700 text-red-100 border border-red-900 px-2.5 py-1 rounded text-[10px] cursor-pointer font-bold"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* GUILDS MANAGEMENT */}
        {activeTab === "guilds" && (
          <div className="space-y-6">
            
            {editingGuildId && (
              <form onSubmit={handleGuildSaveSubmit} className="bg-[#1f130b] border border-amber-500/30 rounded-lg p-4 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-[#3e2610] pb-2">
                  <h4 className="font-bold text-[#cfa152]">Editando Guilda ID: {editingGuildId}</h4>
                  <button
                    type="button"
                    onClick={() => setEditingGuildId(null)}
                    className="text-red-400 hover:text-red-300 font-mono font-bold cursor-pointer"
                  >
                    [Cancelar]
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Nome da Guilda</label>
                    <input
                      type="text"
                      value={guildEditForm.name}
                      onChange={e => setGuildEditForm({...guildEditForm, name: e.target.value})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Emblema Logo (Emoji)</label>
                    <input
                      type="text"
                      value={guildEditForm.logoChar}
                      onChange={e => setGuildEditForm({...guildEditForm, logoChar: e.target.value})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Guild Hall</label>
                    <input
                      type="text"
                      value={guildEditForm.guildHall}
                      onChange={e => setGuildEditForm({...guildEditForm, guildHall: e.target.value})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Descrição</label>
                    <textarea
                      value={guildEditForm.description}
                      rows={2}
                      onChange={e => setGuildEditForm({...guildEditForm, description: e.target.value})}
                      className="w-full bg-[#110904] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-serif"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-1.5 rounded cursor-pointer"
                >
                  Salvar Guilda
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guildsList.length === 0 ? (
                <div className="col-span-full py-8 text-center text-[#968369] font-mono">Nenhuma guilda ativa no banco de dados.</div>
              ) : (
                guildsList.map((guild) => (
                  <div key={guild.id} className="bg-[#110904] border border-[#3e2610] rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded bg-gradient-to-br ${guild.logoColor} border border-[#5d3f1a] flex items-center justify-center text-2xl shadow-md shrink-0`}>
                        {guild.logoChar || "🛡️"}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-white font-serif truncate">{guild.name}</h4>
                        <p className="text-[10px] text-[#968369] leading-relaxed line-clamp-2">{guild.description}</p>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-[#8c672b] space-y-0.5 border-t border-[#312213] pt-2">
                      <p>Sede: <span className="text-white">{guild.guildHall || "Nenhuma"}</span></p>
                      <p>Poder total: <span className="text-amber-400 font-bold">{guild.totalPower || 0} lvls</span></p>
                      <p>Membros: <span className="text-white">{guild.memberCount || 0}</span></p>
                    </div>

                    <div className="flex justify-end gap-1.5 text-[10px] pt-1">
                      <button
                        onClick={() => handleGuildEditClick(guild)}
                        className="bg-yellow-600/20 hover:bg-yellow-600 border border-yellow-600/40 text-yellow-300 hover:text-black px-2.5 py-1 rounded cursor-pointer font-serif font-bold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja dissolver e excluir a guilda ${guild.name}?`)) {
                            onDeleteGuildAdmin(guild.id);
                          }
                        }}
                        className="bg-red-950 hover:bg-red-700 text-red-100 border border-red-900 px-2.5 py-1 rounded cursor-pointer font-serif font-bold"
                      >
                        Dissolver
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* NEWS & UPDATES */}
        {activeTab === "news" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form */}
            <form onSubmit={handleNewsSaveSubmit} className="lg:col-span-5 bg-[#110904] border border-[#3e2610] rounded-xl p-4 space-y-4 text-xs">
              <span className="font-extrabold text-[#cfa152] text-sm block border-b border-[#3e2610] pb-1.5 uppercase font-serif flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                {editingNewsId ? "📝 Editar Notícia" : "📢 Postar Notícia"}
              </span>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-[#968369] font-mono mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                    className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-serif"
                    placeholder="ex: Double XP Weekend!"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Categoria</label>
                    <select
                      value={newsForm.category}
                      onChange={e => setNewsForm({...newsForm, category: e.target.value})}
                      className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    >
                      <option value="HOT">HOT (Importante)</option>
                      <option value="EVENTO">EVENTO</option>
                      <option value="UPDATE">UPDATE</option>
                      <option value="AVISO">AVISO GERAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Autor</label>
                    <input
                      type="text"
                      value={newsForm.author}
                      onChange={e => setNewsForm({...newsForm, author: e.target.value})}
                      className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-serif"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#968369] font-mono mb-1">Conteúdo Principal</label>
                  <textarea
                    required
                    rows={5}
                    value={newsForm.content}
                    onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                    className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-serif leading-relaxed"
                    placeholder="Escreva a notícia em detalhes..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#968369] font-mono mb-1">Marcadores (Bullets) - 1 por linha (Opcional)</label>
                  <textarea
                    rows={3}
                    value={newsForm.bulletsText}
                    onChange={e => setNewsForm({...newsForm, bulletsText: e.target.value})}
                    className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-mono text-[11px]"
                    placeholder="ex: Upgrade de armas raras ativo.&#10;Inauguração às 18:00."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2 rounded cursor-pointer uppercase tracking-wider font-serif"
                >
                  {editingNewsId ? "Salvar Notícia" : "Publicar Notícia"}
                </button>
                {editingNewsId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNewsId(null);
                      setNewsForm({ title: "", category: "HOT", content: "", bulletsText: "", author: "Administrador" });
                    }}
                    className="text-slate-400 font-bold cursor-pointer hover:text-white"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* List */}
            <div className="lg:col-span-7 space-y-3">
              <span className="font-extrabold text-[#cfa152] text-sm block border-b border-[#312213] pb-1.5 uppercase font-serif">
                Notícias Cadastradas ({newsList.length})
              </span>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {newsList.map((n) => (
                  <div key={n.id} className="bg-[#110904] border border-[#3e2610] p-3 rounded-lg flex items-center justify-between gap-4 shadow">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-[#3e2610] text-[#cfa152] font-mono font-bold text-[9px] px-1 py-0.5 rounded">{n.category}</span>
                        <span className="font-extrabold text-xs text-white font-serif truncate">{n.title}</span>
                      </div>
                      <p className="text-[10px] text-[#968369] font-mono">Postado em {n.date} por {n.author}</p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleNewsEditClick(n)}
                        className="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-300 hover:text-black border border-yellow-600/40 px-2.5 py-1 rounded text-[10px] cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir a notícia '${n.title}'?`)) {
                            onDeleteNews(n.id);
                          }
                        }}
                        className="bg-red-950 hover:bg-red-700 text-red-200 border border-red-900 px-2.5 py-1 rounded text-[10px] cursor-pointer"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* GLOBAL SERVER CONFIGURATION */}
        {activeTab === "config" && (
          <div className="max-w-2xl">
            {adminConfigLoading || !configState ? (
              <div className="p-8 text-center text-[#968369] font-mono animate-pulse">
                Carregando parâmetros do OTServ...
              </div>
            ) : (
              <form onSubmit={handleConfigSaveSubmit} className="bg-[#110904] border border-[#3e2610] rounded-xl p-5 space-y-4 text-xs">
                <span className="font-extrabold text-[#cfa152] text-sm block border-b border-[#3e2610] pb-2 uppercase font-serif flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-[#cfa152]" />
                  Configurar OTServ Chapadonia
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1 font-bold">Nome do Servidor</label>
                    <input
                      type="text"
                      required
                      value={configState.serverName || "Chapadonia"}
                      onChange={e => setConfigState({...configState, serverName: e.target.value})}
                      className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Multiplicador Exp Rate</label>
                    <input
                      type="number"
                      required
                      value={configState.experienceRate || 350}
                      onChange={e => setConfigState({...configState, experienceRate: Number(e.target.value)})}
                      className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Bônus Experiência VIP %</label>
                    <input
                      type="number"
                      required
                      value={configState.serverVipBonus || 15}
                      onChange={e => setConfigState({...configState, serverVipBonus: Number(e.target.value)})}
                      className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">E-mail de Suporte / Contato</label>
                    <input
                      type="email"
                      required
                      value={configState.contactEmail || "ghandja1@gmail.com"}
                      onChange={e => setConfigState({...configState, contactEmail: e.target.value})}
                      className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Máximo de Players Conectados</label>
                    <input
                      type="number"
                      value={configState.maxPlayers || 1000}
                      onChange={e => setConfigState({...configState, maxPlayers: Number(e.target.value)})}
                      className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#968369] font-mono mb-1">Eventos Ativos no Rodapé</label>
                    <input
                      type="text"
                      value={configState.activeEvents || "Double XP Ativo!"}
                      onChange={e => setConfigState({...configState, activeEvents: e.target.value})}
                      className="w-full bg-[#18110b] border border-[#3e2610] rounded p-2 text-[#f1e0c5] focus:border-amber-500 outline-none font-serif"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#312213]">
                  <span className="font-bold text-[#cfa152] block text-[10px] font-mono">Modos e Eventos Especiais:</span>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!configState.maintenanceMode}
                        onChange={e => setConfigState({...configState, maintenanceMode: e.target.checked})}
                        className="rounded border-[#3e2610] bg-[#18110b] text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span>🔴 Modo de Manutenção</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!configState.eventDoubleXp}
                        onChange={e => setConfigState({...configState, eventDoubleXp: e.target.checked})}
                        className="rounded border-[#3e2610] bg-[#18110b] text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span>🔥 Double XP</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!configState.eventDoubleSkill}
                        onChange={e => setConfigState({...configState, eventDoubleSkill: e.target.checked})}
                        className="rounded border-[#3e2610] bg-[#18110b] text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span>⚔️ Double Skill</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-2.5 px-6 rounded shadow cursor-pointer uppercase tracking-wider font-serif mt-2"
                >
                  Aplicar Parâmetros do OTServ
                </button>
              </form>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
