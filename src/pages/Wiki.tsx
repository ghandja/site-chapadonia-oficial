import React, { useState } from "react";
import { 
  BookOpen, Search, Shield, Flame, Heart, Sparkles, Terminal, Award, 
  Compass, Zap, Download, HelpCircle, FileText, MessageSquare, 
  BarChart3, Plus, Send, ChevronDown, ChevronUp, Swords, ShieldAlert, Cpu,
  User, Calendar, Clock, ArrowRight, MessageCircle, HelpCircle as HelpIcon
} from "lucide-react";

interface Spell {
  name: string;
  formula: string;
  lvl: number;
  mana: number;
  vocation: string;
  type: "Ataque" | "Suporte" | "Cura";
  desc: string;
}

interface Creature {
  name: string;
  hp: number;
  exp: number;
  gold: string;
  drops: string[];
  gif: string;
}

interface QuestComment {
  id: string;
  author: string;
  vocation: string;
  level: number;
  content: string;
  createdAt: string;
}

interface Quest {
  id: string;
  name: string;
  icon: string;
  minLevel: number;
  difficulty: "Fácil" | "Média" | "Difícil" | "Extrema";
  location: string;
  reward: string;
  desc: string;
  gif: string;
  wikiContent: {
    history: string;
    requirements: string[];
    equipment: string[];
    walkthrough: string[];
  };
  comments: QuestComment[];
}

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  votedOptionId?: string;
}

export const Wiki: React.FC = () => {
  const [activeWikiTab, setActiveWikiTab] = useState<"home" | "quests" | "spells" | "creatures" | "exptable" | "polls">("home");
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Spell filters
  const [selectedVocationFilter, setSelectedVocationFilter] = useState<string>("All");

  // Exp Calculator States
  const [calcLevel, setCalcLevel] = useState<number>(100);

  // New Comment Form States (for quests forum)
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentVocation, setCommentVocation] = useState("Knight");
  const [commentLevel, setCommentLevel] = useState<number>(100);
  const [commentText, setCommentText] = useState("");

  // QUESTS DATA WITH COMPREHENSIVE GUIDES AND INTEGRATED FORUMS
  const [quests, setQuests] = useState<Quest[]>([]);

  // POLLS STATE
  const [polls, setPolls] = useState<Poll[]>([]);

  // SPELLS LIST
  const spells: Spell[] = [
    { name: "Fierce Berserk (Fúria Circular)", formula: "exori gran", lvl: 35, mana: 115, vocation: "Knight", type: "Ataque", desc: "Causa um ataque físico circular massivo em todas as 8 direções ao redor do Cavaleiro." },
    { name: "Infliction Strike (Ataque Guiado)", formula: "exori hur", lvl: 28, mana: 40, vocation: "Knight", type: "Ataque", desc: "Arremessa sua arma espiritualmente no alvo selecionado à distância." },
    { name: "Wound Cleansing", formula: "exura ico", lvl: 8, mana: 40, vocation: "Knight", type: "Cura", desc: "Habilidade básica de cura instantânea para Knights controlarem o HP." },
    { name: "Rage of the Skies", formula: "exevo gran mas vis", lvl: 55, mana: 600, vocation: "Sorcerer", type: "Ataque", desc: "Invoca uma chuva colossal de relâmpagos e raios em quase toda a tela visível." },
    { name: "Energy Strike", formula: "exori vis", lvl: 12, mana: 20, vocation: "Sorcerer", type: "Ataque", desc: "Dispara uma faísca curta de energia destrutiva no alvo." },
    { name: "Magic Shield (Escudo de Mana)", formula: "utamo vita", lvl: 14, mana: 50, vocation: "Sorcerer", type: "Suporte", desc: "Redireciona todo o dano recebido diretamente para a sua barra de mana." },
    { name: "Eternal Winter (Nevasca)", formula: "exevo gran mas frigo", lvl: 55, mana: 650, vocation: "Druid", type: "Ataque", desc: "Nevasca de gelo implacável que reduz a velocidade dos alvos e causa dano extremo." },
    { name: "Heal Friend (Cura Alheia)", formula: "exura sio \"name", lvl: 18, mana: 140, vocation: "Druid", type: "Cura", desc: "Cura intensamente o aliado nomeado. Essencial para caçadas em grupo (Party)." },
    { name: "Earth Wave", formula: "exevo tera hur", lvl: 38, mana: 210, vocation: "Druid", type: "Ataque", desc: "Libera uma onda de terra de formato triangular na sua frente." },
    { name: "Divine Caldera", formula: "exevo mas san", lvl: 50, mana: 160, vocation: "Paladin", type: "Ataque", desc: "Gera uma explosão purificadora de energia sagrada ao redor do Arqueiro." },
    { name: "Divine Strike", formula: "exori san", lvl: 40, mana: 20, vocation: "Paladin", type: "Ataque", desc: "Canaliza um feixe de luz sagrada no alvo único." },
    { name: "Sharpshooter", formula: "utito tempo san", lvl: 60, mana: 450, vocation: "Paladin", type: "Suporte", desc: "Aumenta drasticamente sua habilidade com armas de distância por 10 segundos." },
    { name: "Ki Blast (Ataque Mental)", formula: "exevo gran mas ki", lvl: 50, mana: 300, vocation: "Monk", type: "Ataque", desc: "Onda de choque espiritual purificadora liberada de suas mãos, causando dano físico e Ki." },
    { name: "Ki Meditation (Respiração)", formula: "exura sio ki", lvl: 25, mana: 80, vocation: "Monk", type: "Cura", desc: "Respiração profunda que regenera HP e purifica venenos instantaneamente." },
    { name: "Ascension Of Ki", formula: "utito tempo ki", lvl: 45, mana: 200, vocation: "Monk", type: "Suporte", desc: "Dobra temporariamente sua agilidade física, velocidade de ataque desarmado e taxa de esquiva passiva." }
  ];

  // CREATURES LIST
  const creatures: Creature[] = [
    { name: "Demon", hp: 8200, exp: 6000, gold: "200 - 900 GP", drops: ["Fire Axe", "Demon Shield", "Golden Sickle", "Purple Tome"], gif: "https://tibia.fandom.com/wiki/Special:FilePath/Demon.gif" },
    { name: "Dragon Lord", hp: 1900, exp: 2100, gold: "100 - 450 GP", drops: ["Dragon Slayer", "Royal Helmet", "Dragon Ham", "Fire Sword"], gif: "https://tibia.fandom.com/wiki/Special:FilePath/Dragon_Lord.gif" },
    { name: "Hydra", hp: 2350, exp: 2100, gold: "50 - 300 GP", drops: ["Hydra Egg", "Boots of Haste", "Medusa Shield", "Ring of Healing"], gif: "https://tibia.fandom.com/wiki/Special:FilePath/Hydra.gif" },
    { name: "Behemoth", hp: 4000, exp: 2500, gold: "150 - 600 GP", drops: ["Steel Boots", "Behemoth Fang", "Giant Sword", "War Hammer"], gif: "https://tibia.fandom.com/wiki/Special:FilePath/Behemoth.gif" },
    { name: "Black Knight", hp: 1800, exp: 1600, gold: "100 - 500 GP", drops: ["Knight Armor", "Knight Legs", "Halberd", "Dark Helmet"], gif: "https://tibia.fandom.com/wiki/Special:FilePath/Black_Knight.gif" },
    { name: "Orshabaal (Raid Boss)", hp: 22500, exp: 18000, gold: "2k - 8k GP", drops: ["Thunder Hammer", "Demon Legs", "Golden Armor", "Mastermind Shield"], gif: "https://tibia.fandom.com/wiki/Special:FilePath/Orshabaal.gif" }
  ];

  const commands = [
    { cmd: "!buyhouse", desc: "Compra a casa em frente à qual você está posicionado (precisa ser VIP ou Lvl 50+)." },
    { cmd: "!sellhouse <nome>", desc: "Vende sua casa para outro herói no jogo." },
    { cmd: "!leave", desc: "Abandona sua casa atual, deixando-a vaga." },
    { cmd: "!online", desc: "Mostra todos os guerreiros conectados no momento com seus respectivos níveis." },
    { cmd: "!uptime", desc: "Mostra há quanto tempo o servidor Chapadonia está ativo sem quedas." },
    { cmd: "!cast start", desc: "Inicia uma transmissão ao vivo de sua tela para outros jogadores assistirem do site." },
    { cmd: "!spells", desc: "Lista todas as magias disponíveis que sua vocação pode lançar." }
  ];

  // Exp calculation formula
  const getExperienceForLevel = (lvl: number) => {
    if (lvl <= 1) return 0;
    return Math.floor(((50 * Math.pow(lvl, 3)) - (150 * Math.pow(lvl, 2)) + (400 * lvl)) / 3);
  };

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      if (p.votedOptionId) return p; // prevent double voting
      return {
        ...p,
        votedOptionId: optionId,
        options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o)
      };
    }));
  };

  // Submit comment to quest forum
  const handleQuestCommentSubmit = (e: React.FormEvent, questId: string) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim()) return;

    const newComment: QuestComment = {
      id: `comment-${Date.now()}`,
      author: commentAuthor,
      vocation: commentVocation,
      level: commentLevel,
      content: commentText,
      createdAt: "Agora mesmo"
    };

    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return {
          ...q,
          comments: [...q.comments, newComment]
        };
      }
      return q;
    }));

    setCommentText("");
    setCommentAuthor("");
  };

  // FILTERED QUESTS FOR SEARCH BAR
  const filteredQuests = quests.filter(q => 
    q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.reward.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-4 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER WIKI BANNER (Mimicking tibiawiki.com.br yellow/beige theme combined with transparent blue) */}
      <div className="bg-[#112240]/60 border border-sky-500/30 rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <BookOpen className="w-8 h-8 text-amber-400 animate-pulse shrink-0" />
            <h2 className="text-2xl md:text-3xl font-black font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-sky-200">
              Chapadonia Wiki
            </h2>
          </div>
          <p className="text-xs text-sky-200/80 font-mono">
            A enciclopédia livre e fórum de discussões de Chapadonia OTServ.
          </p>
        </div>

        {/* QUICK WIKI SEARCH */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="Pesquisar quests, recompensas, locais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080f1e] border-2 border-sky-500/30 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* WIKI NAVIGATION SYSTEM (Horizontal beige tabs mimicking the classic wiki article tabs) */}
      <div className="flex flex-wrap gap-1.5 bg-[#080f1e]/80 p-1.5 rounded-lg border border-sky-500/20 overflow-x-auto scrollbar-none">
        {[
          { id: "home", label: "Página Principal", icon: BookOpen },
          { id: "quests", label: "Quests & Missões", icon: Compass },
          { id: "spells", label: "Magias do Servidor", icon: Zap },
          { id: "creatures", label: "Monstros & Loot", icon: Swords },
          { id: "exptable", label: "Calculadora de Exp", icon: Cpu },
          { id: "polls", label: "Enquetes Ativas", icon: BarChart3 }
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeWikiTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveWikiTab(tab.id as any);
                setSelectedQuestId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-serif font-bold cursor-pointer transition-all ${
                isActive
                  ? "bg-[#d3c2a3] text-stone-900 border border-amber-300/40 font-extrabold shadow-md"
                  : "bg-transparent text-sky-200 hover:text-white hover:bg-sky-500/10"
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-amber-800" : "text-sky-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SEARCH OVERLAY (If user is typing in the global search box, override and show search results) */}
      {searchQuery && (
        <div className="bg-[#0c1930] border-2 border-amber-500/30 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-sky-500/10 pb-2">
            <h3 className="text-sm font-extrabold font-serif text-amber-300">
              🔍 Resultados da pesquisa para: "{searchQuery}"
            </h3>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-sky-400 hover:text-white font-mono"
            >
              Limpar Pesquisa
            </button>
          </div>

          {filteredQuests.length === 0 ? (
            <p className="text-xs text-sky-200/60 font-mono">Nenhum artigo ou quest localizado com este termo.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuests.map((q) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestId(q.id);
                    setActiveWikiTab("quests");
                    setSearchQuery("");
                  }}
                  className="bg-[#080f1e] border border-sky-500/20 p-4 rounded-xl cursor-pointer hover:border-amber-500/40 transition-colors flex gap-3"
                >
                  <span className="text-3xl">{q.icon}</span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold font-serif text-white">{q.name}</h4>
                    <p className="text-[10px] text-sky-200/70 font-mono truncate">Local: {q.location}</p>
                    <p className="text-[10px] text-amber-300 font-mono truncate">Recompensas: {q.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= 1. PORTAL WIKI HOME (https://tibiawiki.com.br clone style) ======================= */}
      {activeWikiTab === "home" && !searchQuery && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT DOUBLE-COLUMN: MAIN WIKI SECTIONS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* WELCOME PORTAL CARD */}
            <div className="bg-[#112240]/40 border border-[#d2bc9c]/30 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none font-serif text-8xl text-white">
                W
              </div>
              <h3 className="text-lg font-black font-serif text-[#e4d3b6] border-b border-[#d2bc9c]/20 pb-2 mb-3">
                Boas-vindas à Enciclopédia de Chapadonia!
              </h3>
              <p className="text-xs text-sky-100/90 leading-relaxed font-serif">
                O <strong>Chapadonia Wiki</strong> é o maior repositório colaborativo de guias, tabelas de experiência, estatísticas de monstros, fórmulas de magias e fóruns de discussão. Aqui você pode tirar dúvidas, consultar informações oficiais e encontrar aliados para completar as missões mais perigosas do jogo!
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                <button 
                  onClick={() => setActiveWikiTab("quests")}
                  className="bg-[#0c1930] border border-sky-500/20 p-3 rounded-lg text-center hover:border-amber-500/40 cursor-pointer transition-all"
                >
                  <span className="text-xl block mb-1">🧭</span>
                  <span className="text-[10px] font-bold font-serif text-white block uppercase">Quests</span>
                </button>
                <button 
                  onClick={() => setActiveWikiTab("spells")}
                  className="bg-[#0c1930] border border-sky-500/20 p-3 rounded-lg text-center hover:border-amber-500/40 cursor-pointer transition-all"
                >
                  <span className="text-xl block mb-1">⚡</span>
                  <span className="text-[10px] font-bold font-serif text-white block uppercase">Magias</span>
                </button>
                <button 
                  onClick={() => setActiveWikiTab("creatures")}
                  className="bg-[#0c1930] border border-sky-500/20 p-3 rounded-lg text-center hover:border-amber-500/40 cursor-pointer transition-all"
                >
                  <span className="text-xl block mb-1">👾</span>
                  <span className="text-[10px] font-bold font-serif text-white block uppercase">Criaturas</span>
                </button>
              </div>
            </div>

            {/* EXPEDITION / QUESTS PORTAL CATEGORY */}
            <div className="space-y-3">
              <div className="border-b-2 border-[#d3c2a3] pb-1 flex justify-between items-center">
                <h3 className="text-sm font-black text-[#e4d3b6] font-serif uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-300" /> Quests & Desafios Principais
                </h3>
                <button
                  onClick={() => setActiveWikiTab("quests")}
                  className="text-[10px] font-mono text-sky-400 hover:text-white flex items-center gap-0.5"
                >
                  Ver todas <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quests.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestId(q.id);
                      setActiveWikiTab("quests");
                    }}
                    className="bg-[#0c1930]/90 border border-sky-500/20 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer hover:bg-sky-950/20 transition-all flex flex-col justify-between group shadow"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-2xl">{q.icon}</span>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          q.difficulty === "Fácil" 
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : q.difficulty === "Média"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-red-500/10 text-red-300 border-red-500/20"
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white font-serif group-hover:text-amber-300 transition-colors">
                        {q.name}
                      </h4>
                      <p className="text-[10px] text-sky-200/70 font-serif leading-relaxed mt-1 line-clamp-2">
                        {q.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-sky-500/10 flex justify-between items-center text-[9px] font-mono text-[#d2bc9c]">
                      <span>Level Mínimo: <strong>Lvl {q.minLevel}+</strong></span>
                      <span className="text-sky-400 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {q.comments.length} posts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GAME SYSTEMS PORTAL CATEGORY */}
            <div className="bg-[#0c1930] border border-sky-500/15 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-black font-serif text-sky-300 uppercase tracking-widest flex items-center gap-1">
                <Terminal className="w-4 h-4 text-sky-400" /> Sistemas e Comandos Globais
              </h4>
              <p className="text-[11px] text-sky-200/80 leading-relaxed font-serif">
                Chapadonia OTServ utiliza comandos modernos integrados no chat do jogo para facilitar o gerenciamento de casas, streaming de cast e visualizações in-game. Veja os principais:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {commands.slice(0, 4).map((c) => (
                  <div key={c.cmd} className="bg-[#080f1e] p-2.5 rounded border border-sky-500/10 space-y-0.5">
                    <strong className="text-amber-300 text-[11px]">{c.cmd}</strong>
                    <p className="text-[10px] text-sky-200/70 leading-relaxed font-serif">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: WIKI SIDEBAR & STATISTICS & ENQUETE */}
          <div className="space-y-6">
            
            {/* ENQUETE DESTAQUE CARD */}
            <div className="bg-[#0c1930] border-2 border-[#d2bc9c]/20 p-4 rounded-xl space-y-4 shadow-lg">
              <h4 className="text-xs font-black font-serif text-amber-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-sky-500/10 pb-2">
                🗳️ Enquete em Destaque
              </h4>

              {polls.slice(0, 1).map((poll) => {
                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
                return (
                  <div key={poll.id} className="space-y-3">
                    <p className="text-xs text-sky-100 font-serif leading-relaxed font-bold">
                      {poll.question}
                    </p>

                    <div className="space-y-2.5">
                      {poll.options.map((option) => {
                        const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(0) : "0";
                        const isVoted = poll.votedOptionId === option.id;
                        return (
                          <div key={option.id} className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleVote(poll.id, option.id)}
                              disabled={poll.votedOptionId !== undefined}
                              className={`w-full flex justify-between items-center p-2 rounded border text-left font-serif text-[10px] transition-all ${
                                isVoted
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-200 font-bold"
                                  : poll.votedOptionId
                                  ? "bg-transparent border-sky-500/5 text-sky-200/40 cursor-not-allowed"
                                  : "bg-[#080f1e] border-sky-500/10 text-sky-200 hover:border-sky-500/30 cursor-pointer"
                              }`}
                            >
                              <span>{option.text}</span>
                              <span className="font-mono text-[9px]">{percentage}%</span>
                            </button>

                            {/* Mini progress bar */}
                            <div className="w-full bg-[#080f1e] h-1 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isVoted ? "bg-amber-500" : "bg-sky-500/60"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[9px] font-mono text-[#968369] flex justify-between items-center pt-1 border-t border-sky-500/5">
                      <span>Votos: <strong>{totalVotes}</strong></span>
                      <button 
                        onClick={() => setActiveWikiTab("polls")}
                        className="text-sky-400 hover:underline"
                      >
                        Ver histórico
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CREATURE OF THE WEEK CARD */}
            <div className="bg-[#0c1930] border border-sky-500/20 p-4 rounded-xl text-center space-y-3">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[8px] px-2 py-0.5 font-bold uppercase tracking-wider">
                👾 Criatura da Semana
              </span>
              <div className="w-20 h-20 bg-[#080f1e] rounded-lg border border-sky-500/10 mx-auto flex items-center justify-center">
                <img 
                  src="https://tibia.fandom.com/wiki/Special:FilePath/Demon.gif" 
                  alt="Demon" 
                  className="w-16 h-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-serif font-extrabold text-white text-sm">Demon</h4>
                <p className="text-[10px] text-red-400 font-mono font-bold mt-0.5">8200 HP | +6000 XP</p>
              </div>
              <p className="text-[10px] text-sky-200/70 font-serif leading-relaxed px-1">
                Lorde das chamas do submundo de Edron e PoH. Guardião das armas mais poderosas do servidor!
              </p>
              <button
                onClick={() => setActiveWikiTab("creatures")}
                className="text-[10px] font-mono text-sky-400 hover:text-white"
              >
                Consultar drops do Bestiário →
              </button>
            </div>

            {/* WIKI HELP INFO BOX */}
            <div className="bg-sky-500/5 border border-sky-500/20 p-3.5 rounded-xl text-xs space-y-2">
              <span className="font-serif font-extrabold text-white block">📖 Ajude a Construir!</span>
              <p className="text-[11px] text-sky-200/80 leading-relaxed font-serif">
                A wiki é moldada pela comunidade de Chapadonia. Para enviar um novo guia ou corrigir alguma informação, abra um ticket no Discord.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ======================= 2. WIKI QUESTS SECTION WITH DEDICATED ARTICLE PAGES & FORUMS ======================= */}
      {activeWikiTab === "quests" && !searchQuery && (
        <div className="space-y-6">
          
          {/* QUEST DIRECTORY VIEW (If no quest is selected) */}
          {!selectedQuestId ? (
            <div className="space-y-4">
              <div className="border-b border-sky-500/10 pb-2">
                <h3 className="text-sm font-black text-sky-300 font-serif uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-400" /> Diretório de Quests Oficiais
                </h3>
                <p className="text-xs text-sky-200/70 font-mono mt-1">
                  Selecione uma quest abaixo para abrir o seu artigo completo na wiki e interagir no fórum de discussão de estratégias.
                </p>
              </div>

              {quests.length === 0 ? (
                <div className="bg-[#0c1930]/40 border border-sky-500/10 rounded-xl p-12 text-center text-sky-200/60 font-mono text-xs col-span-full">
                  Nenhuma quest cadastrada na wiki ainda. Guias serão adicionados em breve pela equipe.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quests.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuestId(q.id)}
                      className="bg-[#0c1930] border border-sky-500/25 rounded-xl p-5 hover:border-amber-500/40 cursor-pointer hover:bg-[#112240]/40 transition-all flex justify-between items-start gap-4 group"
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{q.icon}</span>
                          <div>
                            <h4 className="text-sm font-extrabold text-white font-serif group-hover:text-amber-300 transition-colors">
                              {q.name}
                            </h4>
                            <span className="text-[10px] text-sky-200/60 font-mono">{q.location}</span>
                          </div>
                        </div>
                        <p className="text-xs text-sky-200/80 leading-relaxed font-serif line-clamp-2">
                          {q.desc}
                        </p>
                        
                        <div className="flex gap-2 text-[9px] font-mono">
                          <span className="bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded">
                            Lvl {q.minLevel}+
                          </span>
                          <span className="bg-[#080f1e] text-[#d2bc9c] border border-sky-500/10 px-2 py-0.5 rounded font-bold">
                            Dificuldade: {q.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-center space-y-1 bg-[#080f1e] p-2.5 rounded border border-sky-500/10 font-mono">
                        <MessageCircle className="w-5 h-5 text-sky-400 mx-auto" />
                        <span className="text-[10px] text-white font-bold block">{q.comments.length}</span>
                        <span className="text-[8px] text-[#968369] uppercase block font-bold">Comentários</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            
            /* ======================= DETAILED WIKI ARTICLE LAYOUT (Mimics tibiawiki.com.br/wiki/Home) ======================= */
            (() => {
              const quest = quests.find(q => q.id === selectedQuestId);
              if (!quest) return null;
              return (
                <div className="space-y-6">
                  
                  {/* BREADCRUMBS */}
                  <button
                    onClick={() => setSelectedQuestId(null)}
                    className="text-xs text-sky-400 hover:text-white font-mono flex items-center gap-1 cursor-pointer bg-[#080f1e] px-3 py-1.5 rounded border border-sky-500/20 w-fit"
                  >
                    ← Voltar ao Diretório de Quests
                  </button>

                  {/* WIKI PAGE CONTAINER */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* LEFT COLUMN: WIKI CONTENT WORKSPACE */}
                    <div className="lg:col-span-2 space-y-6 bg-[#112240]/20 border border-sky-500/15 rounded-xl p-5 md:p-6 shadow-inner">
                      
                      {/* ARTICLE HEADER */}
                      <div className="border-b-2 border-amber-500/30 pb-2">
                        <h2 className="text-2xl md:text-3xl font-black font-serif text-white flex items-center gap-2">
                          <span className="text-3xl">{quest.icon}</span> {quest.name}
                        </h2>
                        <p className="text-[11px] text-sky-200/60 font-mono mt-1">
                          Origem: Chapadonia Wiki • Editado por jogadores há 2 dias.
                        </p>
                      </div>

                      {/* lore / history */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-extrabold font-serif text-[#e4d3b6] border-b border-sky-500/10 pb-1 uppercase">
                          1. História / Visão Geral
                        </h3>
                        <p className="text-xs text-sky-100/95 leading-relaxed font-serif text-justify">
                          {quest.wikiContent.history}
                        </p>
                      </div>

                      {/* requirements */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-extrabold font-serif text-[#e4d3b6] border-b border-sky-500/10 pb-1 uppercase">
                          2. Requisitos Obrigatórios
                        </h3>
                        <ul className="list-disc pl-5 text-xs text-sky-200/90 space-y-1 font-serif">
                          {quest.wikiContent.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      {/* equipment */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-extrabold font-serif text-[#e4d3b6] border-b border-sky-500/10 pb-1 uppercase">
                          3. Suprimentos & Equipamentos Recomendados
                        </h3>
                        <ul className="list-disc pl-5 text-xs text-sky-200/90 space-y-1 font-serif">
                          {quest.wikiContent.equipment.map((eq, i) => (
                            <li key={i}>{eq}</li>
                          ))}
                        </ul>
                      </div>

                      {/* walkthrough / guide */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-extrabold font-serif text-[#e4d3b6] border-b border-sky-500/10 pb-1 uppercase">
                          4. Método / Passo a Passo (Walkthrough)
                        </h3>
                        <div className="space-y-3">
                          {quest.wikiContent.walkthrough.map((step, i) => (
                            <div key={i} className="flex gap-2.5 items-start text-xs leading-relaxed font-serif text-sky-100">
                              <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <p className="flex-1 text-justify">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: CLASSIC WIKI INFOBOX CARD */}
                    <div className="bg-[#0c1930] border-2 border-[#d2bc9c]/40 rounded-xl overflow-hidden shadow-2xl shrink-0">
                      
                      {/* infobox title */}
                      <div className="bg-gradient-to-r from-amber-700/80 to-amber-900/80 p-3 text-center border-b border-[#d2bc9c]/30">
                        <h4 className="font-serif font-black text-white text-xs uppercase tracking-wider">
                          {quest.name}
                        </h4>
                        <span className="text-[9px] text-amber-200 font-mono">Infobox do Artigo</span>
                      </div>

                      {/* infobox sprite icon */}
                      <div className="bg-[#080f1e] p-6 flex justify-center items-center border-b border-[#d2bc9c]/10">
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-sky-500 rounded-lg blur opacity-15" />
                          <div className="w-16 h-16 bg-[#0c1930] border border-[#d2bc9c]/20 rounded-lg flex items-center justify-center p-1 relative shadow-inner">
                            <img 
                              src={quest.gif} 
                              alt={quest.name} 
                              className="w-12 h-12 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* infobox key-values table */}
                      <div className="divide-y divide-[#d2bc9c]/10 text-xs font-mono">
                        
                        <div className="p-3 grid grid-cols-3 gap-2">
                          <span className="text-[#968369] font-serif font-bold text-[11px]">Level Mínimo:</span>
                          <span className="col-span-2 text-white font-bold">Level {quest.minLevel}+</span>
                        </div>

                        <div className="p-3 grid grid-cols-3 gap-2">
                          <span className="text-[#968369] font-serif font-bold text-[11px]">Dificuldade:</span>
                          <span className={`col-span-2 font-bold ${
                            quest.difficulty === "Fácil" ? "text-emerald-400" : quest.difficulty === "Média" ? "text-amber-400" : "text-red-400"
                          }`}>{quest.difficulty}</span>
                        </div>

                        <div className="p-3 grid grid-cols-3 gap-2">
                          <span className="text-[#968369] font-serif font-bold text-[11px]">Localização:</span>
                          <span className="col-span-2 text-sky-200">{quest.location}</span>
                        </div>

                        <div className="p-3 grid grid-cols-3 gap-2">
                          <span className="text-[#968369] font-serif font-bold text-[11px]">Recompensas:</span>
                          <span className="col-span-2 text-amber-300 text-[10px] leading-relaxed font-serif">{quest.reward}</span>
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* ======================= DEDICATED QUEST FORUM SECTION ======================= */}
                  <div className="bg-[#0c1930] border border-sky-500/25 rounded-xl p-5 md:p-6 space-y-6 shadow-xl">
                    
                    {/* forum header */}
                    <div className="border-b border-sky-500/15 pb-3">
                      <h3 className="text-md font-black font-serif text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-sky-400" /> Fórum de Discussão: {quest.name}
                      </h3>
                      <p className="text-xs text-sky-200/80 font-mono mt-1">
                        Use este espaço exclusivo para recrutar heróis, marcar horários, discutir táticas ou contratar blockers para a {quest.name}!
                      </p>
                    </div>

                    {/* forum list */}
                    <div className="space-y-3">
                      {quest.comments.length === 0 ? (
                        <div className="bg-[#080f1e] border border-dashed border-sky-500/10 rounded-lg p-6 text-center text-sky-200/40 font-mono text-xs">
                          Nenhuma postagem ativa sobre esta quest. Seja o primeiro a iniciar a discussão!
                        </div>
                      ) : (
                        quest.comments.map((c) => (
                          <div 
                            key={c.id} 
                            className="bg-[#080f1e]/80 border border-sky-500/15 p-4 rounded-xl flex gap-3.5 hover:border-sky-500/30 transition-all shadow"
                          >
                            {/* character avatar details */}
                            <div className="w-12 text-center shrink-0">
                              <div className="w-10 h-10 bg-[#0c1930] border border-sky-500/20 rounded-full flex items-center justify-center text-lg mx-auto font-bold text-sky-300">
                                👤
                              </div>
                              <span className="text-[8px] font-mono font-bold text-sky-400 block mt-1 uppercase leading-none truncate">
                                {c.vocation}
                              </span>
                              <span className="text-[8px] text-[#968369] font-mono font-bold block leading-none mt-0.5">
                                Lvl {c.level}
                              </span>
                            </div>

                            {/* comment content bubble */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex justify-between items-center border-b border-sky-500/5 pb-1">
                                <span className="font-extrabold text-white text-xs font-serif truncate">{c.author}</span>
                                <span className="text-[9px] text-[#968369] font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#968369]/75" /> {c.createdAt}
                                </span>
                              </div>
                              <p className="text-xs text-sky-100 font-serif leading-relaxed whitespace-pre-wrap">
                                {c.content}
                              </p>
                            </div>

                          </div>
                        ))
                      )}
                    </div>

                    {/* add post form */}
                    <form onSubmit={(e) => handleQuestCommentSubmit(e, quest.id)} className="bg-[#080f1e]/60 border border-sky-500/15 p-4 rounded-xl space-y-4 shadow-inner">
                      <h4 className="font-serif text-xs font-black text-[#e4d3b6] uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-sky-400" /> Publicar Nova Mensagem / Recrutamento
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                        
                        <div>
                          <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Seu Nome de Personagem</label>
                          <input
                            type="text"
                            placeholder="Ex: Eternal Knight"
                            value={commentAuthor}
                            onChange={(e) => setCommentAuthor(e.target.value)}
                            required
                            className="w-full bg-[#0c1930] border border-sky-500/20 rounded-lg px-3 py-1.5 text-sky-200 focus:outline-none focus:border-amber-500/40"
                          />
                        </div>

                        <div>
                          <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Sua Vocação</label>
                          <select
                            value={commentVocation}
                            onChange={(e) => setCommentVocation(e.target.value)}
                            className="w-full bg-[#0c1930] border border-sky-500/20 rounded-lg px-3 py-1.5 text-sky-300 focus:outline-none focus:border-amber-500/40"
                          >
                    <option value="Knight">Knight</option>
                    <option value="Sorcerer">Sorcerer</option>
                    <option value="Druid">Druid</option>
                    <option value="Paladin">Paladin</option>
                    <option value="Monk">Monk</option>
                            <option value="Monk">Monk</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Seu Level</label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={commentLevel}
                            onChange={(e) => setCommentLevel(Math.max(1, parseInt(e.target.value) || 1))}
                            required
                            className="w-full bg-[#0c1930] border border-sky-500/20 rounded-lg px-3 py-1.5 text-sky-200 focus:outline-none focus:border-amber-500/40"
                          />
                        </div>

                      </div>

                      <div>
                        <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Mensagem do Post</label>
                        <textarea
                          placeholder="Ex: Procuro mais um Druid e um Blocker para ir POI sábado à tarde. Tenho suprimentos prontos..."
                          rows={3}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          required
                          className="w-full bg-[#0c1930] border border-sky-500/20 rounded-lg p-3 text-xs text-sky-200 focus:outline-none focus:border-amber-500/40 font-serif leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black text-xs py-2 px-5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors font-serif"
                        >
                          <Send className="w-3.5 h-3.5" /> Enviar para o Fórum
                        </button>
                      </div>

                    </form>

                  </div>

                </div>
              );
            })()
          )}

        </div>
      )}

      {/* ======================= 3. SPELLS SECTION ======================= */}
      {activeWikiTab === "spells" && !searchQuery && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-500/10 pb-3">
            <h3 className="text-sm font-extrabold text-[#e4d3b6] uppercase tracking-wider font-serif flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300" /> Livro de Magias do Servidor
            </h3>
            {/* Vocation Selector */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
              {["All", "Knight", "Sorcerer", "Druid", "Paladin", "Monk"].map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVocationFilter(v)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                    selectedVocationFilter === v
                      ? "bg-amber-500 text-stone-900 font-extrabold"
                      : "bg-[#0c1930] border border-sky-500/25 text-sky-300 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spells
              .filter(s => selectedVocationFilter === "All" || s.vocation === selectedVocationFilter)
              .map((spell, i) => (
                <div key={i} className="bg-[#0c1930] border border-sky-500/20 p-4 rounded-xl space-y-3 hover:border-amber-500/30 transition-all shadow-md">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-white font-mono uppercase tracking-wide flex items-center gap-1.5">
                        <span className="text-amber-300">⚡</span> {spell.name}
                      </h4>
                      <span className="text-[10px] font-mono text-sky-200/60 font-semibold">{spell.vocation} — Nível {spell.lvl}+</span>
                    </div>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
                      spell.type === "Ataque" 
                        ? "bg-red-500/10 text-red-400 border border-red-500/30" 
                        : spell.type === "Cura" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                        : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                    }`}>
                      {spell.type}
                    </span>
                  </div>

                  <div className="bg-[#080f1e] p-2 rounded border border-sky-500/10 font-mono text-[10px] flex justify-between">
                    <div><span className="text-[#968369]">Fórmula:</span> <strong className="text-sky-300">{spell.formula}</strong></div>
                    <div><span className="text-[#968369]">Mana:</span> <strong className="text-white">{spell.mana}</strong></div>
                  </div>

                  <p className="text-[11px] text-sky-200/80 leading-relaxed font-serif text-justify">
                    {spell.desc}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ======================= 4. CREATURES SECTION ======================= */}
      {activeWikiTab === "creatures" && !searchQuery && (
        <div className="space-y-4">
          <div className="border-b border-[#d2bc9c]/20 pb-2">
            <h3 className="text-sm font-extrabold text-[#e4d3b6] uppercase tracking-wider font-serif flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-amber-300" /> Bestiário Oficial e Drops de Criaturas
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {creatures.map((creature, i) => (
              <div key={i} className="bg-[#0c1930] border border-sky-500/20 p-4 rounded-xl space-y-3 flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-md">
                <div>
                  <div className="flex justify-between items-center border-b border-sky-500/10 pb-1.5 mb-2.5">
                    <h4 className="font-extrabold text-white text-xs uppercase font-mono tracking-wide flex items-center gap-1.5">
                      💀 {creature.name}
                    </h4>
                  </div>
                  
                  {/* creature image */}
                  <div className="w-12 h-12 bg-[#080f1e] rounded border border-sky-500/10 flex items-center justify-center p-1.5 mb-3">
                    <img 
                      src={creature.gif} 
                      alt={creature.name} 
                      className="w-10 h-10 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-sky-200/70">
                    <div>
                      <span className="text-[#968369]">Vida (HP):</span>
                      <p className="text-red-400 font-bold">{creature.hp}</p>
                    </div>
                    <div>
                      <span className="text-[#968369]">Experiência:</span>
                      <p className="text-emerald-400 font-bold">+{creature.exp} XP</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#968369]">Média de Gold:</span>
                      <p className="text-amber-400 font-bold">{creature.gold}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[9px] uppercase font-bold text-[#968369] font-mono block mb-1">Drops Comuns / Raros:</span>
                  <div className="flex flex-wrap gap-1">
                    {creature.drops.map((drop, idx) => (
                      <span key={idx} className="bg-[#080f1e] text-[9px] font-mono text-sky-300 border border-sky-500/10 px-1.5 py-0.5 rounded">
                        {drop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= 5. EXP TABLE CALCULATOR ======================= */}
      {activeWikiTab === "exptable" && !searchQuery && (
        <div className="space-y-4 max-w-xl mx-auto">
          <div className="border-b border-[#d2bc9c]/20 pb-2 text-center">
            <h3 className="text-sm font-extrabold text-[#e4d3b6] uppercase tracking-wider font-serif flex items-center justify-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-300 animate-spin-slow" /> Calculadora de Experiência em Tempo Real
            </h3>
          </div>

          <div className="bg-[#0c1930] border-2 border-sky-500/25 p-5 rounded-xl space-y-4 shadow-2xl">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-sky-200 font-serif uppercase">Insira o Level desejado:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={calcLevel}
                  onChange={(e) => setCalcLevel(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#080f1e] border border-sky-500/30 rounded-lg px-3 py-2 text-sm text-sky-300 font-mono focus:outline-none focus:border-amber-500 shadow-inner"
                />
              </div>
            </div>

            <div className="divide-y divide-sky-500/10 text-xs font-mono space-y-2 pt-2">
              <div className="flex justify-between py-1.5">
                <span className="text-[#968369]">XP total requerida para Level {calcLevel}:</span>
                <strong className="text-sky-300 text-[13px]">{getExperienceForLevel(calcLevel).toLocaleString()} XP</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#968369]">XP total requerida para Level {calcLevel + 1}:</span>
                <strong className="text-white text-[13px]">{getExperienceForLevel(calcLevel + 1).toLocaleString()} XP</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#968369]">XP líquida do Level {calcLevel} para o {calcLevel + 1}:</span>
                <strong className="text-amber-400 text-[13px]">
                  {(getExperienceForLevel(calcLevel + 1) - getExperienceForLevel(calcLevel)).toLocaleString()} XP
                </strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#968369]">Tempo estimado de Hunt solo (a 500k/h):</span>
                <strong className="text-emerald-400 font-bold">
                  {((getExperienceForLevel(calcLevel + 1) - getExperienceForLevel(calcLevel)) / 500000).toFixed(2)} horas
                </strong>
              </div>
            </div>

            <div className="bg-[#080f1e] rounded-lg p-3 text-[10px] text-sky-200/70 font-mono leading-relaxed border border-sky-500/10">
              <span className="font-extrabold text-amber-300 block mb-1">⚡ NOTA SOBRE STAGED EXPERIENCE RATE:</span>
              O rate de XP em Chapadonia começa em <strong className="text-white">350x</strong> (Lvl 1 - 50) e cai suavemente em estágios até <strong className="text-white">3x</strong> ao alcançar o nível 300+. O bônus VIP adiciona +15% de XP sobre qualquer estágio!
            </div>
          </div>
        </div>
      )}

      {/* ======================= 6. ACTIVE POLLS ======================= */}
      {activeWikiTab === "polls" && !searchQuery && (
        <div className="space-y-4 max-w-xl mx-auto">
          <div className="border-b border-[#d2bc9c]/20 pb-2">
            <h3 className="text-sm font-extrabold text-[#e4d3b6] uppercase tracking-wider font-serif flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-300 animate-pulse" /> Enquetes Ativas de Chapadonia
            </h3>
            <p className="text-xs text-sky-200/70 font-mono mt-1">
              Participe da tomada de decisões da Staff votando nas enquetes ativas sobre novos patches e ajustes.
            </p>
          </div>

          <div className="space-y-4">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
              return (
                <div key={poll.id} className="bg-[#0c1930] border border-sky-500/20 p-5 rounded-xl space-y-4 shadow-lg">
                  <h4 className="text-xs font-extrabold text-white font-mono uppercase tracking-wide leading-relaxed border-b border-sky-500/10 pb-2 flex items-center gap-1">
                    🗳️ {poll.question}
                  </h4>

                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(0) : "0";
                      const isVoted = poll.votedOptionId === option.id;
                      return (
                        <div key={option.id} className="space-y-1">
                          <button
                            type="button"
                            onClick={() => handleVote(poll.id, option.id)}
                            disabled={poll.votedOptionId !== undefined}
                            className={`w-full flex justify-between items-center p-2.5 rounded-lg border text-left font-serif text-xs transition-all ${
                              isVoted
                                ? "bg-amber-500/10 border-amber-400 text-amber-300 font-extrabold shadow"
                                : poll.votedOptionId
                                ? "bg-transparent border-sky-500/10 text-sky-200/50 cursor-not-allowed"
                                : "bg-[#080f1e] border-sky-500/15 text-sky-200 hover:border-sky-500/40 cursor-pointer"
                            }`}
                          >
                            <span>{option.text}</span>
                            <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold">
                              <span>{option.votes} votos ({percentage}%)</span>
                              {isVoted && <span className="text-emerald-400 font-bold">✓</span>}
                            </div>
                          </button>

                          {/* Progress Bar Chart */}
                          <div className="w-full bg-[#080f1e] h-2.5 rounded-full overflow-hidden border border-sky-500/5">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isVoted ? "bg-emerald-500" : "bg-sky-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-[#968369] pt-2 border-t border-sky-500/5">
                    <span>Total de votos: <strong className="text-white">{totalVotes}</strong></span>
                    <span>Status: <strong className="text-emerald-400">Em Aberto</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
