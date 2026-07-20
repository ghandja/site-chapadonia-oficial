import React, { useState } from "react";
import { 
  ShieldCheck, Plus, Sparkles, X, LayoutGrid, Search, Users, MapPin, 
  ChevronRight, LogOut, ArrowRight, UserPlus, Info
} from "lucide-react";
import { Guild, PlayerCharacter } from "../types";
import { getVocationName } from "../utils";

interface GuildsProps {
  guildsList: Guild[];
  guildsLoading: boolean;
  userAccount: any | null;
  myCharacters: PlayerCharacter[];
  onJoinGuild: (guildId: number, characterName: string) => Promise<void>;
  onLeaveGuild: (characterName: string) => Promise<void>;
  onCreateGuild: (payload: {
    name: string;
    description: string;
    logoChar: string;
    logoColor: string;
    leaderName: string;
    guildHall: string;
  }) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
  onInspectPlayer: (name: string) => void;
  setShowLoginModal: (show: boolean) => void;
}

export const Guilds: React.FC<GuildsProps> = ({
  guildsList = [],
  guildsLoading = false,
  userAccount,
  myCharacters = [],
  onJoinGuild,
  onLeaveGuild,
  onCreateGuild,
  showNotification = (msg, type = "success") => {},
  onInspectPlayer = (name) => {},
  setShowLoginModal,
}) => {
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<"power" | "members" | "avgLevel">("power");

  // Create Guild Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGuildName, setNewGuildName] = useState("");
  const [newGuildDesc, setNewGuildDesc] = useState("");
  const [newGuildLogoChar, setNewGuildLogoChar] = useState("🛡️");
  const [newGuildLogoColor, setNewGuildLogoColor] = useState("from-red-600 to-amber-600");
  const [newGuildLeader, setNewGuildLeader] = useState("");
  const [newGuildHall, setNewGuildHall] = useState("Nenhum");

  // Filter and sort guilds
  const filteredGuilds = guildsList
    .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 g.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortType === "power") return (b.totalPower || 0) - (a.totalPower || 0);
      if (sortType === "members") return (b.memberCount || 0) - (a.memberCount || 0);
      if (sortType === "avgLevel") return (b.averageLevel || 0) - (a.averageLevel || 0);
      return 0;
    });

  // Handle Join Submit
  const handleJoinSubmit = async (guildId: number) => {
    const selectEl = document.getElementById(`join-select-${guildId}`) as HTMLSelectElement;
    if (!selectEl || !selectEl.value) {
      showNotification("Selecione um personagem para ingressar!", "error");
      return;
    }
    await onJoinGuild(guildId, selectEl.value);
    
    // Refresh selected guild details
    const updated = guildsList.find(g => g.id === guildId);
    if (updated) {
      setSelectedGuild(updated);
    }
  };

  // Handle Leave Submit
  const handleLeaveSubmit = async (charName: string, guildId: number) => {
    if (confirm(`Tem certeza que deseja remover ${charName} da guilda?`)) {
      await onLeaveGuild(charName);
      
      // Refresh selected guild details
      const updated = guildsList.find(g => g.id === guildId);
      if (updated) {
        setSelectedGuild(updated);
      } else {
        setSelectedGuild(null);
      }
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuildName.trim() || !newGuildDesc.trim() || !newGuildLeader) {
      showNotification("Por favor, preencha todos os campos obrigatórios!", "error");
      return;
    }
    await onCreateGuild({
      name: newGuildName,
      description: newGuildDesc,
      logoChar: newGuildLogoChar,
      logoColor: newGuildLogoColor,
      leaderName: newGuildLeader,
      guildHall: newGuildHall
    });
    
    // Reset form and close
    setShowCreateModal(false);
    setNewGuildName("");
    setNewGuildDesc("");
    setNewGuildLogoChar("🛡️");
    setNewGuildLogoColor("from-red-600 to-amber-600");
    setNewGuildLeader("");
    setNewGuildHall("Nenhum");
  };

  // List of active character names owned by user that are not in ANY guild
  const availableCharsForGuild = myCharacters.filter(
    c => !guildsList.some(g => g.members.some(m => m.name.toLowerCase() === c.name.toLowerCase()))
  );

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER */}
      <div className="border-b border-sky-500/20 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-sky-400" />
            GUILDAS DO SERVIDOR
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-1">
            Dispute o topo de poder, forme alianças eternas ou declare guerra contra outras guildas de Chapadonia!
          </p>
        </div>
        {userAccount ? (
          <button
            onClick={() => {
              const qualified = myCharacters.find(c => c.level >= 80);
              if (qualified) {
                setNewGuildLeader(qualified.name);
              } else if (myCharacters.length > 0) {
                setNewGuildLeader(myCharacters[0].name);
              }
              setShowCreateModal(true);
            }}
            className="bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-extrabold px-3.5 py-2 rounded-xl border border-sky-400/25 flex items-center gap-1.5 shadow-md self-start sm:self-center shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Fundar Guilda
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-[#122240] hover:bg-sky-950 text-sky-300 font-mono text-xs font-extrabold px-3.5 py-2 rounded-xl border border-sky-500/50 flex items-center gap-1.5 shadow-md self-start sm:self-center shrink-0 cursor-pointer"
          >
            Acessar Conta para Fundar
          </button>
        )}
      </div>

      {/* SELECTED GUILD INNER VIEW */}
      {selectedGuild ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedGuild(null)}
            className="text-sky-300 hover:text-white font-extrabold text-xs flex items-center gap-1 transition-colors bg-[#122240] border border-sky-500/30 px-3 py-1.5 rounded-lg cursor-pointer shadow-sm font-mono"
          >
            ← Voltar para Diretório de Guilds
          </button>

          <div className="bg-[#0c1930] border border-sky-500/30 rounded-xl p-5 shadow-lg space-y-6">
            
            {/* Logo and Name Header */}
            <div className="flex flex-col md:flex-row items-center gap-5 border-b border-sky-500/20 pb-5">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedGuild.logoColor} border-2 border-sky-500/30 flex items-center justify-center text-4xl shadow-md shrink-0`}>
                {selectedGuild.logoChar}
              </div>
              <div className="text-center md:text-left flex-1 min-w-0">
                <h3 className="text-2xl font-black text-white font-serif uppercase tracking-wide">
                  {selectedGuild.name}
                </h3>
                <p className="text-xs text-sky-200/80 font-serif italic mt-1 leading-relaxed max-w-2xl">
                  "{selectedGuild.description}"
                </p>
              </div>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0d1b32] p-3 rounded-lg border border-sky-500/20 text-center w-full md:w-auto text-white">
                <div className="px-2">
                  <span className="text-[10px] text-sky-300 uppercase font-bold block">Poder</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedGuild.totalPower} lvls</span>
                </div>
                <div className="px-2 border-l border-sky-500/10">
                  <span className="text-[10px] text-sky-300 uppercase font-bold block">Média Level</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedGuild.averageLevel}</span>
                </div>
                <div className="px-2 border-l border-sky-500/10">
                  <span className="text-[10px] text-sky-300 uppercase font-bold block">Membros</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedGuild.memberCount}</span>
                </div>
                <div className="px-2 border-l border-sky-500/10">
                  <span className="text-[10px] text-sky-300 uppercase font-bold block">Fundada</span>
                  <span className="text-xs font-bold text-white font-serif">{selectedGuild.founded}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sede Info and Management */}
              <div className="space-y-4 lg:col-span-1">
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider font-serif border-b border-sky-500/20 pb-1 flex items-center gap-1.5">
                  🏢 Sede & Recrutamento
                </h4>
                <div className="bg-[#0d1b32]/80 p-4 rounded-xl border border-sky-500/15 space-y-3 text-xs text-sky-200">
                  <div>
                    <strong className="text-white font-bold">Líder:</strong> {selectedGuild.leaderName}
                  </div>
                  <div>
                    <strong className="text-white font-bold">Guild Hall:</strong> {selectedGuild.guildHall}
                  </div>
                  <div>
                    <strong className="text-white font-bold">Inscrição:</strong>{" "}
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                      Aberto
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider font-serif border-b border-sky-500/20 pb-1 pt-2 flex items-center gap-1.5">
                  🛡️ Gerenciar Membro
                </h4>
                <div className="bg-[#0d1b32]/80 p-4 rounded-xl border border-sky-500/15 space-y-4">
                  {userAccount ? (
                    <div className="space-y-3">
                      {/* Active members owned by user in this guild */}
                      {myCharacters.some(c => selectedGuild.members.some(m => m.name.toLowerCase() === c.name.toLowerCase())) ? (
                        <div className="space-y-2">
                          <p className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                            ✓ Você faz parte desta guilda!
                          </p>
                          {myCharacters
                            .filter(c => selectedGuild.members.some(m => m.name.toLowerCase() === c.name.toLowerCase()))
                            .map(c => {
                              const isLeader = selectedGuild.members.find(m => m.name.toLowerCase() === c.name.toLowerCase())?.rank === "Líder";
                              return (
                                <div key={c.name} className="flex items-center justify-between gap-2 p-2 bg-[#080f1e] border border-sky-500/20 rounded-lg text-xs font-mono">
                                  <span className="font-bold text-white">{c.name}</span>
                                  {isLeader ? (
                                    <span className="text-[9px] font-bold bg-[#122240] text-amber-300 px-1.5 py-0.5 rounded border border-sky-500/30 uppercase">Líder</span>
                                  ) : (
                                    <button
                                      onClick={() => handleLeaveSubmit(c.name, selectedGuild.id)}
                                      className="bg-red-900/80 hover:bg-red-800 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer border border-red-500/30"
                                    >
                                      Sair
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      ) : null}

                      {/* Characters available to join */}
                      {availableCharsForGuild.length > 0 ? (
                        <div className="space-y-2 text-xs">
                          <label className="text-[11px] font-bold text-sky-200 block">Participar com:</label>
                          <div className="flex gap-2">
                            <select
                              id={`join-select-${selectedGuild.id}`}
                              className="flex-1 bg-[#080f1e] border border-sky-500/30 rounded px-2 py-1.5 text-xs text-white"
                            >
                              {availableCharsForGuild.map(c => (
                                <option key={c.name} value={c.name} className="bg-[#0a1224]">
                                  {c.name} (Lvl {c.level})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleJoinSubmit(selectedGuild.id)}
                              className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs px-3 py-1.5 rounded cursor-pointer transition-colors uppercase font-mono"
                            >
                              Entrar
                            </button>
                          </div>
                        </div>
                      ) : (
                        !myCharacters.some(c => selectedGuild.members.some(m => m.name.toLowerCase() === c.name.toLowerCase())) && (
                          <p className="text-[10px] text-sky-300/60 font-mono text-center">
                            Todos os seus personagens já pertencem a uma guilda ou não possui personagens cadastrados.
                          </p>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs">
                      <p className="text-[10px] text-sky-300/60 font-mono mb-2">Faça login para gerenciar personagens nesta guilda!</p>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="px-3 py-1 bg-sky-600 text-white text-[10px] rounded font-bold uppercase cursor-pointer hover:bg-sky-500"
                      >
                        Acessar Conta
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Roster of Members */}
              <div className="lg:col-span-2 space-y-3">
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider font-serif border-b border-sky-500/20 pb-1 flex items-center justify-between">
                  <span>👥 Membros ({selectedGuild.members.length})</span>
                </h4>

                <div className="overflow-x-auto border border-sky-500/20 rounded-xl bg-[#0c1930] shadow-inner">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#0d1b32] text-sky-200 border-b border-sky-500/20 font-serif font-bold">
                        <th className="p-2.5">Nome do Guerreiro</th>
                        <th className="p-2.5">Cargo</th>
                        <th className="p-2.5">Vocação</th>
                        <th className="p-2.5">Nível</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-500/10 text-slate-100 font-mono text-[11px]">
                      {selectedGuild.members.map((member) => (
                        <tr key={member.name} className="hover:bg-sky-950/40">
                          <td className="p-2.5 font-bold">
                            <button 
                              onClick={() => onInspectPlayer(member.name)}
                              className="text-sky-300 hover:text-white hover:underline cursor-pointer text-left font-bold"
                            >
                              {member.name}
                            </button>
                          </td>
                          <td className="p-2.5 font-serif text-amber-300 font-bold">{member.rank}</td>
                          <td className="p-2.5">{getVocationName(member.vocation)}</td>
                          <td className="p-2.5 font-extrabold">{member.level}</td>
                          <td className="p-2.5 text-center">
                            {member.online ? (
                              <span className="text-emerald-400 font-bold">● Online</span>
                            ) : (
                              <span className="text-slate-400">Offline</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters and directory search */}
          <div className="bg-[#0c1930] border border-sky-500/30 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-sky-300 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Buscar guilda pelo nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080f1e] border border-sky-500/40 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-sky-300/60 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 shadow-inner font-mono"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto shrink-0">
              <button
                onClick={() => setSortType("power")}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer transition-colors font-serif ${
                  sortType === "power" 
                    ? "bg-sky-600 text-white border-sky-400" 
                    : "bg-[#080f1e]/80 text-sky-200 border-sky-500/20 hover:bg-sky-950/40"
                }`}
              >
                Poder Total
              </button>
              <button
                onClick={() => setSortType("members")}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer transition-colors font-serif ${
                  sortType === "members" 
                    ? "bg-sky-600 text-white border-sky-400" 
                    : "bg-[#080f1e]/80 text-sky-200 border-sky-500/20 hover:bg-sky-950/40"
                }`}
              >
                Nº Membros
              </button>
              <button
                onClick={() => setSortType("avgLevel")}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer transition-colors font-serif ${
                  sortType === "avgLevel" 
                    ? "bg-sky-600 text-white border-sky-400" 
                    : "bg-[#080f1e]/80 text-sky-200 border-sky-500/20 hover:bg-sky-950/40"
                }`}
              >
                Média de Level
              </button>
            </div>
          </div>

          {/* Directory Listings */}
          {guildsLoading ? (
            <div className="text-center py-10 text-sky-300 font-mono text-xs animate-pulse">
              Buscando guildas...
            </div>
          ) : filteredGuilds.length === 0 ? (
            <div className="text-center py-12 bg-[#0c1930]/40 border border-sky-500/20 rounded-xl text-xs text-sky-200/60 font-mono">
              Nenhuma guilda encontrada no diretório com os termos fornecidos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGuilds.map((g) => (
                <div 
                  key={g.id}
                  onClick={() => setSelectedGuild(g)}
                  className="bg-[#0f1d3a]/80 border border-sky-500/20 rounded-xl p-4 cursor-pointer hover:border-sky-400 transition-all duration-200 shadow-lg flex items-center gap-4 hover:translate-y-[-1px]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.logoColor} border border-sky-500/30 flex items-center justify-center text-2xl shadow shrink-0`}>
                    {g.logoChar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wide truncate">{g.name}</h4>
                    <p className="text-[11px] text-sky-300 italic truncate mt-0.5 font-serif">"{g.description}"</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-sky-200/70">
                      <span>👤 {g.memberCount} membros</span>
                      <span>⚔️ Lvl {g.averageLevel} méd.</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sky-300 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE GUILD WIZARD / MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
          <div className="bg-[#0b1528] border border-sky-500/30 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] text-white">
            
            {/* Modal Header */}
            <div className="bg-[#0c1930] text-white p-4 border-b border-sky-500/20 flex items-center justify-between">
              <h3 className="text-lg font-black font-serif uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" /> Fundar Nova Guilda
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-sky-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="overflow-y-auto p-5 space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-sky-200">Nome da Guilda *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Alliance of Thais"
                  value={newGuildName}
                  onChange={(e) => setNewGuildName(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-xs text-white font-serif focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-sky-200">Descrição / Lema *</label>
                <textarea 
                  required
                  placeholder="Ex: Unidos pela espada e pela magia contra as hordas do mal!"
                  value={newGuildDesc}
                  onChange={(e) => setNewGuildDesc(e.target.value)}
                  className="w-full h-20 bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-xs text-white font-serif resize-none focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-sky-200">Brasão (Logo Char)</label>
                  <select
                    value={newGuildLogoChar}
                    onChange={(e) => setNewGuildLogoChar(e.target.value)}
                    className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="🛡️" className="bg-[#0b1528]">🛡️ Escudo</option>
                    <option value="⚔️" className="bg-[#0b1528]">⚔️ Espadas</option>
                    <option value="🧙‍♂️" className="bg-[#0b1528]">🧙‍♂️ Mago</option>
                    <option value="🐉" className="bg-[#0b1528]">🐉 Dragão</option>
                    <option value="👑" className="bg-[#0b1528]">👑 Coroa</option>
                    <option value="💀" className="bg-[#0b1528]">💀 Caveira</option>
                    <option value="🔥" className="bg-[#0b1528]">🔥 Fogo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-sky-200">Cor de Fundo do Brasão</label>
                  <select
                    value={newGuildLogoColor}
                    onChange={(e) => setNewGuildLogoColor(e.target.value)}
                    className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="from-red-600 to-amber-600" className="bg-[#0b1528]">Fogo Vermelho/Laranja</option>
                    <option value="from-sky-700 to-blue-500" className="bg-[#0b1528]">Gelo Azul/Ciano</option>
                    <option value="from-emerald-700 to-teal-500" className="bg-[#0b1528]">Natureza Verde/Teal</option>
                    <option value="from-purple-800 to-pink-600" className="bg-[#0b1528]">Místico Roxo/Rosa</option>
                    <option value="from-slate-800 to-neutral-700" className="bg-[#0b1528]">Guerreiro Cinza/Preto</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-[#0d1b32]/60 border border-sky-500/20 rounded-lg p-3 flex items-center gap-3">
                <span className="text-[10px] text-sky-300 font-bold block uppercase font-mono">Preview do Brasão:</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${newGuildLogoColor} border border-sky-500/30 flex items-center justify-center text-2xl shadow`}>
                  {newGuildLogoChar}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-sky-200">Líder Escolhido *</label>
                  <select
                    value={newGuildLeader}
                    onChange={(e) => setNewGuildLeader(e.target.value)}
                    className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    {myCharacters.map(c => (
                      <option key={c.name} value={c.name} className="bg-[#0b1528]">
                        {c.name} (Lvl {c.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-sky-200">Sede (Guild Hall)</label>
                  <select
                    value={newGuildHall}
                    onChange={(e) => setNewGuildHall(e.target.value)}
                    className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Nenhum" className="bg-[#0b1528]">Nenhum (Sede provisória)</option>
                    <option value="Thais Guildhall" className="bg-[#0b1528]">Thais Guildhall</option>
                    <option value="Venore Manor" className="bg-[#0b1528]">Venore Manor</option>
                    <option value="Carlin Citadel" className="bg-[#0b1528]">Carlin Citadel</option>
                  </select>
                </div>
              </div>

              <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded text-[10px] text-sky-200 leading-relaxed flex items-start gap-1.5">
                <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Regra:</strong> O líder escolhido deve ter no mínimo level 80 para poder fundar uma guilda válida no Chapadonia.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-2.5 rounded shadow-lg cursor-pointer transition-colors uppercase tracking-wider font-mono text-xs mt-2 border border-sky-400/35"
              >
                Fundar Guilda na base de dados do Chapadonia
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
