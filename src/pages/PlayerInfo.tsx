import React, { useState } from "react";
import { User, Shield, Trophy, Activity, Award, Skull, Calendar, Heart, Zap, MapPin, Coins } from "lucide-react";
import { PlayerDetails, OnlinePlayer } from "../types";
import { getVocationName, getOutfitImage } from "../utils";

interface PlayerInfoProps {
  player: PlayerDetails | null;
  onlinePlayersList: OnlinePlayer[];
  onBack: () => void;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  player,
  onlinePlayersList = [],
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "skills" | "deaths">("info");

  if (!player) {
    return (
      <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-center py-12 text-sky-200/80 font-mono space-y-4 -m-4 md:-m-6 min-h-[500px]">
        <Shield className="w-12 h-12 text-sky-400 mx-auto animate-pulse" />
        <p>Nenhum personagem selecionado para inspeção.</p>
        <button 
          onClick={onBack}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-lg border border-sky-400/30 transition-all text-xs cursor-pointer uppercase tracking-wider font-mono text-[10px]"
        >
          Voltar para Notícias
        </button>
      </div>
    );
  }

  const isOnline = onlinePlayersList.some(
    (op) => op.name.toLowerCase() === player.name.toLowerCase()
  );

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER DO PERSONAGEM */}
      <div className="border-b border-sky-500/20 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-sky-300 font-mono tracking-wider block">
            🔍 Inspeção de Personagem
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            {player.name}
            {isOnline ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full animate-pulse shrink-0">
                ● ONLINE
              </span>
            ) : (
              <span className="bg-slate-500/20 text-slate-300 border border-slate-500/30 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full shrink-0">
                OFFLINE
              </span>
            )}
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-0.5">
            Level {player.level} — <span className="font-sans font-bold text-sky-400">{getVocationName(player.vocation)}</span>
          </p>
        </div>
        <button 
          onClick={onBack}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-xl border border-sky-400/30 transition-all text-xs cursor-pointer self-start sm:self-center font-serif uppercase tracking-wider font-mono text-[10px]"
        >
          Voltar
        </button>
      </div>

      {/* TABS DE INSPEÇÃO */}
      <div className="border-b border-sky-500/10 flex gap-2">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 text-xs font-bold font-serif whitespace-nowrap transition-colors flex items-center gap-1 border-b-2 ${
            activeTab === "info" 
              ? "border-sky-400 text-sky-300 font-extrabold" 
              : "border-transparent text-sky-200/60 hover:text-sky-300"
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Estatísticas Básicas
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`px-4 py-2 text-xs font-bold font-serif whitespace-nowrap transition-colors flex items-center gap-1 border-b-2 ${
            activeTab === "skills" 
              ? "border-sky-400 text-sky-300 font-extrabold" 
              : "border-transparent text-sky-200/60 hover:text-sky-300"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Atributos & Skills
        </button>
        <button
          onClick={() => setActiveTab("deaths")}
          className={`px-4 py-2 text-xs font-bold font-serif whitespace-nowrap transition-colors flex items-center gap-1 border-b-2 ${
            activeTab === "deaths" 
              ? "border-sky-400 text-sky-300 font-extrabold" 
              : "border-transparent text-sky-200/60 hover:text-sky-300"
          }`}
        >
          <Skull className="w-3.5 h-3.5" /> Mortes Recentes
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-4">
        
        {/* TAB 1: INFORMACÕES */}
        {activeTab === "info" && (
          <div className="space-y-4">
            
      {/* RubinOT Style Header Card */}
      <div className="bg-[#0c1930] border border-sky-500/30 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-sky-400 to-amber-500" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Box (Estilo RubinOT / Boosted Creature) */}
          <div className="w-28 h-28 bg-[#080f1e] rounded-xl border border-[#795221]/50 flex items-center justify-center overflow-hidden shadow-inner shrink-0 relative">
            <img 
              src={getOutfitImage(player.looktype)} 
              alt={player.name} 
              className="w-24 h-24 object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Player Main Bio Table */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between border-b border-sky-500/15 pb-2">
              <h3 className="text-xl md:text-2xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
                {player.name}
              </h3>
              {isOnline ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[10px] px-2.5 py-1 rounded-full animate-pulse">
                  ● ONLINE
                </span>
              ) : (
                <span className="bg-slate-500/20 text-slate-300 border border-slate-500/30 font-mono font-bold text-[10px] px-2.5 py-1 rounded-full">
                  OFFLINE
                </span>
              )}
            </div>

            {/* Structured Info Grid (RubinOT format) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#080f1e]/80 px-3 py-2 rounded border border-sky-500/10 flex justify-between">
                <span className="text-sky-300">Vocação:</span>
                <span className="font-bold text-white">{getVocationName(player.vocation)}</span>
              </div>
              <div className="bg-[#080f1e]/80 px-3 py-2 rounded border border-sky-500/10 flex justify-between">
                <span className="text-sky-300">Level:</span>
                <span className="font-bold text-amber-300">{player.level}</span>
              </div>
              <div className="bg-[#080f1e]/80 px-3 py-2 rounded border border-sky-500/10 flex justify-between">
                <span className="text-sky-300">Sexo / Gênero:</span>
                <span className="font-bold text-white">{player.sex === 1 ? "Masculino" : "Feminino"}</span>
              </div>
              <div className="bg-[#080f1e]/80 px-3 py-2 rounded border border-sky-500/10 flex justify-between">
                <span className="text-sky-300">Cidade Natal:</span>
                <span className="font-bold text-white">{player.townName || "Thais"}</span>
              </div>
              <div className="bg-[#080f1e]/80 px-3 py-2 rounded border border-sky-500/10 flex justify-between">
                <span className="text-sky-300">Status da Conta:</span>
                <span className="font-bold text-emerald-400">VIP / Premium Account</span>
              </div>
              <div className="bg-[#080f1e]/80 px-3 py-2 rounded border border-sky-500/10 flex justify-between">
                <span className="text-sky-300">Tempo de Jogo:</span>
                <span className="font-bold text-white">{(player.onlinetime / 3600).toFixed(1)} Horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* HP and Mana bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* HP */}
              <div className="bg-[#0c1930] border border-sky-500/20 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-rose-300 font-mono">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> HEALTH (HP)</span>
                  <span>{player.health} / {player.healthmax}</span>
                </div>
                <div className="w-full bg-rose-950/40 h-3 rounded-full overflow-hidden border border-rose-500/20">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-red-600 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (player.health / player.healthmax) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Mana */}
              <div className="bg-[#0c1930] border border-sky-500/20 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-sky-300 font-mono">
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> MANA (MP)</span>
                  <span>{player.mana} / {player.manamax}</span>
                </div>
                <div className="w-full bg-sky-950/40 h-3 rounded-full overflow-hidden border border-sky-500/20">
                  <div 
                    className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (player.mana / player.manamax) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ATRIBUTOS & SKILLS */}
        {activeTab === "skills" && (
          <div className="space-y-3">
            <p className="text-[10px] text-sky-300 font-bold bg-[#080f1e] border border-sky-500/15 p-2.5 rounded-lg font-mono text-center">
              ⚔️ Proficiências e Skills sincronizados diretamente do banco de dados:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Magic Level", val: player.maglevel, max: 120, color: "bg-purple-600" },
                { label: "Sword Fighting", val: player.skill_sword, max: 130, color: "bg-rose-600" },
                { label: "Axe Fighting", val: player.skill_axe, max: 130, color: "bg-red-600" },
                { label: "Club Fighting", val: player.skill_club, max: 130, color: "bg-amber-800" },
                { label: "Distance Fighting", val: player.skill_dist, max: 130, color: "bg-emerald-600" },
                { label: "Shielding", val: player.skill_shielding, max: 130, color: "bg-blue-600" },
                { label: "Fist Fighting", val: player.skill_fist, max: 100, color: "bg-orange-600" },
                { label: "Fishing", val: player.skill_fishing, max: 100, color: "bg-cyan-600" }
              ].map((sk) => (
                <div key={sk.label} className="bg-[#0c1930] border border-sky-500/20 p-3 rounded-xl font-mono text-xs text-sky-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sky-200">{sk.label}</span>
                    <span className="font-extrabold text-white">{sk.val}</span>
                  </div>
                  <div className="w-full bg-[#080f1e] h-2 rounded-full overflow-hidden border border-sky-500/15">
                    <div className={`${sk.color} h-full`} style={{ width: `${Math.min(100, (sk.val / sk.max) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MORTES */}
        {activeTab === "deaths" && (
          <div className="space-y-4">
            <p className="text-[10px] text-sky-300 font-bold bg-[#080f1e] border border-sky-500/15 p-2.5 rounded-lg font-mono text-center">
              💀 Histórico de mortes registrado na tabela `player_deaths`:
            </p>

            <div className="space-y-2.5">
              {player.deaths && player.deaths.length > 0 ? (
                player.deaths.map((death, idx) => (
                  <div key={idx} className="bg-[#0c1930] border border-sky-500/20 p-3.5 rounded-xl font-mono text-xs flex items-start gap-3 shadow-sm text-sky-100">
                    <span className="text-xl shrink-0 mt-0.5">💀</span>
                    <div>
                      <p>
                        Morreu no level <strong className="text-rose-400 font-extrabold">{death.level}</strong> para{" "}
                        <strong className="text-white font-extrabold">{death.killed_by}</strong>.
                      </p>
                      <span className="text-[10px] text-sky-300/60 mt-1 block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-sky-400" /> {new Date(death.time * 1000).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#0c1930] border border-sky-500/20 p-8 rounded-xl text-center font-mono text-xs text-sky-200/50">
                  <span className="text-3xl block mb-2">⭐</span>
                  Nenhuma morte registrada! Este guerreiro é invicto e implacável!
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
