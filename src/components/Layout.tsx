import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Flame, Compass, Sword, ShieldCheck, ShoppingBag, Users, BookOpen, 
  Search, Sparkles, ChevronRight, UserPlus, LockKeyhole, Home, HelpCircle, 
  UserCheck, Shield, AlertTriangle, HelpCircle as BanIcon, Info,
  Download, BarChart3, Skull, Award
} from "lucide-react";
import { ServerStatus } from "./ServerStatus";
import { AccountInfo, ServerInfo } from "../types";
import { getVocationName, getOutfitImage } from "../utils";
import { api } from "../api";

// @ts-ignore
import backgroundImage from "@/assets/background.png";
// @ts-ignore
import logotipoImage from "@/assets/logotipo.png";

interface LayoutProps {
  children: React.ReactNode;
  userAccount: AccountInfo["account"] | null;
  viewMode: "site" | "admin";
  setViewMode: (mode: "site" | "admin") => void;
  onLogout: () => void;
  serverInfo: ServerInfo | null;
  experienceRate: number;
  onInspectPlayer: (name: string) => void;
  searchPlayerLoading: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  userAccount,
  viewMode,
  setViewMode,
  onLogout,
  serverInfo,
  experienceRate,
  onInspectPlayer,
  searchPlayerLoading,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentSitePage = location.pathname === "/" || location.pathname === "" ? "news" : location.pathname.slice(1);
  const [localSearchName, setLocalSearchName] = useState("");
  const [boostedCreature, setBoostedCreature] = useState<{ name: string; looktype: number; type: string; bonusExp: string } | null>(null);

  useEffect(() => {
    let active = true;
    api.getBoostedCreature()
      .then((data) => {
        if (active) setBoostedCreature(data);
      })
      .catch((err) => {
        console.error("Layout: falha ao buscar criatura boostada", err);
        if (active) {
          setBoostedCreature({
            name: "Dragon Lord",
            looktype: 39,
            type: "Draconiano",
            bonusExp: "Dobro de Experiência e +50% Gold Drop Rate"
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchName.trim()) {
      onInspectPlayer(localSearchName);
    }
  };

  const menuItems = [
    ...(userAccount ? [{ id: "account", label: "Painel da Conta", desc: "Gerenciar Personagens", page: "account", icon: LockKeyhole }] : []),
    { id: "news", label: "Últimas Notícias", desc: "Novidades e Updates", page: "news", icon: Flame },
    ...(!userAccount ? [{ id: "register", label: "Criar Conta / Cadastro", desc: "Instalação & Config", page: "register", icon: UserPlus }] : []),
    { id: "downloads", label: "Downloads", desc: "Cliente & Launcher", page: "downloads", icon: Download },
    { id: "highscores", label: "Ranking (Highscores)", desc: "Lendários do Servidor", page: "highscores", icon: Sword },
    { id: "lastkills", label: "Últimas Mortes", desc: "Histórico de Combates PVP", page: "lastkills", icon: Skull },
    { id: "records", label: "Recordes Online", desc: "Picos de Jogadores Ativos", page: "records", icon: Award },
    { id: "guilds", label: "Guilds do Servidor", desc: "Alianças & Guildas Ativas", page: "guilds", icon: ShieldCheck },
    { id: "shop", label: "Loja", desc: "Mercado de Itens & Moedas", page: "shop", icon: ShoppingBag },
    { id: "bazaar", label: "Bazar de Personagens", desc: "Compra e Venda Segura", page: "bazaar", icon: Users },
    { id: "wiki", label: "Wiki do Servidor", desc: "Quests, Hunts & Estágios", page: "wiki", icon: BookOpen },
    { id: "houses", label: "Casas", desc: "Mapa de Imóveis e Aluguel", page: "houses", icon: Home },
    { id: "staff", label: "Equipe", desc: "Administração do Jogo", page: "staff", icon: UserCheck },
    { id: "bans", label: "Histórico de Bans", desc: "Fictício Informativo", page: "bans", icon: AlertTriangle },
  ];

  return (
    <div 
      className="min-h-screen text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-12 overflow-x-hidden relative"
      style={{
        backgroundColor: "#030712",
        backgroundImage: `
          radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(3, 7, 18, 0.99) 100%),
          linear-gradient(rgba(255, 255, 255, 0.008) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.008) 1px, transparent 1px),
          url('${backgroundImage}')
        `,
        backgroundSize: "100% 100%, 40px 40px, 40px 40px, cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center top"
      }}
    >
      {/* Background glowing cyber auroras */}
      <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] bg-blue-500/8 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: "18s" }} />
      <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-2 md:px-8 pt-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LOGO: Row 1, Center Column */}
          <div className="col-span-1 lg:col-span-12 mb-2 flex justify-center relative z-20">
            <img 
              src={logotipoImage} 
              alt="Chapadonia Logo" 
              className="w-[540px] lg:w-[720px] max-w-none h-auto filter drop-shadow-[0_0_20px_rgba(59,130,246,0.45)] transition-transform hover:scale-105 duration-300 cursor-pointer"
              referrerPolicy="no-referrer"
              onClick={() => navigate("/news")}
            />
          </div>

          {/* COLUNA ESQUERDA: MENU CLÁSSICO TIBIA */}
          <aside className="col-span-1 lg:col-span-3 space-y-5 lg:sticky lg:top-16">
            
            {/* Account Panel Widget */}
            {userAccount ? (
              <div className="bg-[#18110b] border-2 border-[#5d3f1a] rounded-xl py-2.5 px-5 shadow-xl relative overflow-hidden font-mono text-xs text-slate-300 w-fit mx-auto flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                  <span className="text-white font-bold text-center text-sm" title={userAccount.name}>{userAccount.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-amber-500 text-[10px] font-bold bg-[#3a220e] px-2 py-0.5 rounded border border-[#523317]">VIP</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#18110b] border-2 border-[#5d3f1a] p-4 rounded-xl shadow-xl flex flex-col items-center justify-center space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full px-5 py-3 bg-gradient-to-b from-[#eacf9c] to-[#cba668] hover:from-[#f6dda6] hover:to-[#dbb576] text-black font-extrabold text-sm rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-95 duration-150 uppercase tracking-wider font-serif border border-[#ebd9b4]/20"
                >
                  <LockKeyhole className="w-4 h-4 text-black" /> Acessar Conta
                </button>
                <button 
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-[#cfa152] hover:text-amber-400 font-bold hover:underline transition-colors text-xs text-center"
                >
                  ✨ Não tem conta? Cadastrar-se Grátis!
                </button>
              </div>
            )}

            {/* Busca de Personagens Clássica (Moved above navigation menu) */}
            <div className="bg-[#18110b] border-2 border-[#5d3f1a] p-4 rounded-xl shadow-xl space-y-3">
              <span className="text-sm font-bold text-[#cfa152] font-serif uppercase tracking-widest block border-b border-[#312213] pb-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-500" />
                BUSCAR JOGADOR
              </span>
              
              <form onSubmit={handleSearchSubmit} className="space-y-2.5">
                <input
                  type="text"
                  value={localSearchName}
                  onChange={(e) => setLocalSearchName(e.target.value)}
                  placeholder="Nome do personagem..."
                  className="w-full bg-[#110c07] border border-[#5d3f1a] text-sm text-[#eadac2] rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={searchPlayerLoading}
                  className="w-full bg-gradient-to-b from-[#795221] to-[#5d3f1a] hover:from-[#8d6229] hover:to-[#6d4c20] text-[#ebd9b4] text-xs font-bold py-2 rounded uppercase tracking-wider font-mono shadow-md cursor-pointer transition-colors disabled:opacity-50"
                >
                  {searchPlayerLoading ? "Buscando..." : "Pesquisar"}
                </button>
              </form>
            </div>

            {/* Painel de Navegação Clássico */}
            <div className="bg-[#18110b] border-2 border-[#5d3f1a] rounded-xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-[#3e2610] to-[#25170a] px-4 py-3 border-b border-[#5d3f1a]">
                <span className="text-sm font-bold text-[#cfa152] font-serif uppercase tracking-widest flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-500" />
                  Menu
                </span>
              </div>

              {/* Navigation expanded to show all items without scrollbar */}
              <nav className="divide-y divide-[#322314]">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSitePage === item.page;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate("/" + (item.page as any))}
                      className={`w-full text-left px-5 py-3 flex items-center justify-between transition-all group ${
                        isActive 
                          ? "bg-[#3e2610]/60 text-white font-bold border-l-4 border-[#cfa152]" 
                          : "text-[#eadac2] hover:bg-[#20160e]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? "text-amber-400 animate-pulse" : "text-[#968369] group-hover:text-amber-400"}`} />
                        <div>
                          <div className="text-sm font-extrabold font-serif tracking-wide">{item.label}</div>
                          <div className="text-[11px] text-[#968369] mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "text-amber-400 translate-x-1" : "text-[#402e1c]"}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Status de Conexão Segura */}
            <div className="bg-[#0e0a05] border border-[#2d1d0c] rounded-xl p-3 text-[10px] font-mono text-[#a39075] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Site Oficial Chapadonia
              </div>
              <p className="leading-relaxed">
                Você está navegando com segurança. Suas credenciais e dados estão protegidos.
              </p>
            </div>

          </aside>

          {/* COLUNA CENTRAL: O PERGAMINHO CLÁSSICO DE TIBIA DO CHAPADONIA */}
          <main className="col-span-1 lg:col-span-6 space-y-6">
            <div className="bg-[#ebd9b4] border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl relative text-black min-h-[500px]">
              <div>
                {children}
              </div>
            </div>
          </main>

          {/* COLUNA DIREITA: WIDGETS LATERAIS DO CHAPADONIA */}
          <aside className="col-span-1 lg:col-span-3 space-y-5 lg:sticky lg:top-16">
            
            {/* Centered Online Counter */}
            <div className="bg-[#110c07] border-2 border-[#5d3f1a] px-4 py-2.5 rounded-xl flex items-center justify-between font-mono text-[11px] shadow-lg">
              <div className="flex items-center gap-1.5">
                {serverInfo ? (
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.7)] shrink-0" />
                ) : (
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)] shrink-0" />
                )}
                <span className="text-[#cbd5e1] font-bold uppercase">STATUS:</span>
              </div>
              {serverInfo ? (
                <span className="text-emerald-400 font-extrabold text-xs">
                  {serverInfo.playersOnline} Players
                </span>
              ) : (
                <span className="text-red-400 font-extrabold text-xs">
                  Offline
                </span>
              )}
            </div>

            {/* Promoção de moedas */}
            <div className="bg-gradient-to-b from-[#795221] to-[#3e2610] border-2 border-[#cfa152] rounded-xl p-4 text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500 rotate-45 translate-x-8 -translate-y-8 flex items-center justify-center font-bold text-black text-[9px] shadow-lg font-mono">
                PROMO
              </div>
              
              <span className="text-[10px] uppercase tracking-wider text-amber-200 block font-mono font-bold mb-1">CONTEÚDO EXCLUSIVO</span>
              <h4 className="text-sm font-extrabold text-white font-serif uppercase tracking-wide">Doações</h4>
              
              <div className="my-3 flex justify-center">
                <span className="text-4xl animate-bounce">💎</span>
              </div>

              <p className="text-xs text-amber-100 leading-normal mb-3">
                Nós ajude a continuar proporcionando o entretenimento tibiano!
              </p>

              <button 
                onClick={() => navigate("/shop")}
                className="w-full bg-[#f1e0c5] hover:bg-white text-black font-extrabold text-xs py-2 rounded-lg cursor-pointer transition-all shadow-md uppercase tracking-wider font-serif"
              >
                DOAR PARA O SERVIDOR
              </button>
            </div>

            {/* Criatura do dia (Boosted Boss / Creature) */}
            <div className="bg-[#18110b] border-2 border-[#5d3f1a] rounded-xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-[#3e2610] to-[#25170a] px-4 py-2 border-b border-[#5d3f1a]">
                <span className="text-xs font-bold text-[#cfa152] font-serif uppercase tracking-widest flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  BOOSTED CREATURE
                </span>
              </div>
              
              <div className="p-4 text-center space-y-3 flex flex-col items-center">
                {boostedCreature ? (
                  <>
                    <div className="w-16 h-16 bg-[#080f1e] rounded-xl border border-[#795221]/40 flex items-center justify-center overflow-hidden shadow-inner relative shrink-0">
                      <img 
                        src={`https://tibia.fandom.com/wiki/Special:FilePath/${boostedCreature.name.replace(/\s+/g, "_")}.gif`} 
                        alt={boostedCreature.name} 
                        className="w-12 h-12 object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#ebd9b4] font-serif uppercase tracking-wider">{boostedCreature.name}</h4>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-4xl block animate-pulse">🐉</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#ebd9b4] font-serif uppercase">Carregando...</h4>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Discord Community */}
            <div className="bg-[#18110b] border-2 border-[#5d3f1a] rounded-xl overflow-hidden shadow-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-[#cfa152] font-serif uppercase border-b border-[#312213] pb-1.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#cfa152]" /> DISCORD COMUNIDADE
              </h3>
              <p className="text-[11px] text-[#a39075] leading-relaxed">
                Entre na nossa comunidade para conversar com outros jogadores, receber moedas de presente e participar de sorteios semanais!
              </p>
              <a 
                href="https://discord.gg/MRE5Rndbha" 
                target="_blank" 
                referrerPolicy="no-referrer"
                className="block text-center bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs py-2 rounded transition-colors uppercase tracking-wider cursor-pointer font-mono"
              >
                🚀 Entrar no Discord
              </a>
            </div>

            {/* Server Info / Status widget (Placed below Discord box on the right sidebar) */}
            <ServerStatus
              serverInfo={serverInfo}
              experienceRate={experienceRate}
              onlineCountFallback={serverInfo?.playersOnline || 0}
            />



          </aside>

        </div>

        {/* FOOTER */}
        <footer className="mt-12 text-center border-t border-[#3e2610] pt-6 pb-4">
          <p className="text-xs text-[#968369] font-mono">
            © 2026 Chapadonia Otserver. Todos os direitos reservados.
          </p>
          <p className="text-[10px] text-[#5c4a35] font-mono mt-1">
            Chapadonia is an alternative Tibia Server and is not affiliated with CipSoft GmbH.
          </p>
        </footer>
      </div>
    </div>
  );
};
