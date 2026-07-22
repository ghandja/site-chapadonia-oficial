import React, { useEffect, useState } from "react";
import { Sword, RefreshCw } from "lucide-react";
import { HighscorePlayer, OnlinePlayer } from "../types";
import { api } from "../api";
import { getVocationName, VOCATIONS, getOutfitImage } from "../utils";

interface HighscoresProps {
  onInspectPlayerByName: (name: string) => void;
  onlinePlayersList: OnlinePlayer[];
  serverName: string;
}

export const Highscores: React.FC<HighscoresProps> = ({
  onInspectPlayerByName,
  onlinePlayersList = [],
  serverName = "Chapadonia",
}) => {
  const [vocationFilter, setVocationFilter] = useState<number>(0);
  const [sortField, setSortField] = useState<string>("level");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const [players, setPlayers] = useState<HighscorePlayer[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const loadRanking = async () => {
      setLoading(true);
      try {
        const result = await api.getHighscores(sortField, vocationFilter, page, limit);
        if (active) {
          setPlayers(result.players || []);
          setTotal(result.total || 0);
          setTotalPages(result.totalPages || 1);
        }
      } catch (err) {
        console.error("Highscores: falha ao carregar rankings", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadRanking();
    return () => {
      active = false;
    };
  }, [vocationFilter, sortField, page]);

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      <div className="border-b border-sky-500/20 pb-3 mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
          <Sword className="w-7 h-7 text-sky-400" />
          RANKING (HIGHSCORES)
        </h2>
        <p className="text-xs text-sky-200/80 font-mono mt-1">
          Os personagens mais poderosos do servidor {serverName} listados em tempo real.
        </p>
      </div>

      {/* FILTROS DO HIGHSCORE */}
      <div className="bg-[#0c1930] border border-sky-500/30 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sky-300 font-serif uppercase text-[10px]">Filtrar Vocação</span>
            <select
              value={vocationFilter}
              onChange={(e) => {
                setVocationFilter(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 font-bold font-serif text-white focus:outline-none focus:border-sky-400 cursor-pointer text-xs"
            >
              <option value={0}>Todas as Vocações</option>
              <option value={1}>Sorcerer / Master Sorcerer</option>
              <option value={2}>Druid / Elder Druid</option>
              <option value={3}>Paladin / Royal Paladin</option>
              <option value={4}>Knight / Elite Knight</option>
              <option value={5}>Monk / Exalted Monk</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-bold text-sky-300 font-serif uppercase text-[10px]">Ordenar Por</span>
            <select
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value);
                setPage(1);
              }}
              className="bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 font-bold font-serif text-white focus:outline-none focus:border-sky-400 cursor-pointer text-xs"
            >
              <option value="level">Level</option>
              <option value="magic">Magic Level</option>
              <option value="sword">Sword Fighting</option>
              <option value="axe">Axe Fighting</option>
              <option value="club">Club Fighting</option>
              <option value="dist">Distance Fighting</option>
              <option value="fist">Fist Fighting</option>
              <option value="shielding">Shielding</option>
              <option value="fishing">Fishing</option>
            </select>
          </div>
        </div>

        {/* Paginador Compacto */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-sky-950 disabled:text-sky-400/40 text-white text-[10px] font-bold py-1.5 px-3 rounded uppercase tracking-wider font-mono transition-colors cursor-pointer disabled:cursor-not-allowed border border-sky-500/30"
          >
            Anterior
          </button>
          <span className="font-mono text-[11px] font-bold text-sky-200 min-w-20 text-center">
            Pág. {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-sky-950 disabled:text-sky-400/40 text-white text-[10px] font-bold py-1.5 px-3 rounded uppercase tracking-wider font-mono transition-colors cursor-pointer disabled:cursor-not-allowed border border-sky-500/30"
          >
            Próxima
          </button>
        </div>
      </div>

      {/* TABELA DE RANKING */}
      <div className="bg-[#0c1930] border border-sky-500/25 rounded-xl overflow-hidden shadow-lg relative">
        {loading && (
          <div className="absolute inset-0 bg-[#080f1e]/80 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex items-center gap-2 bg-[#0c1930] border border-sky-500/30 text-white px-4 py-2 rounded-lg font-mono text-xs shadow-md animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              Carregando ranking...
            </div>
          </div>
        )}

        <div className="bg-sky-950 px-4 py-3 text-sky-200 border-b border-sky-500/10 flex items-center justify-between">
          <span className="text-xs font-bold font-serif uppercase tracking-widest text-white">Corrida pelo Topo</span>
          <span className="text-[10px] font-mono text-amber-300">Total de Registros: {total}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sky-950/60 text-sky-200 font-extrabold border-b border-sky-500/25">
                <th className="px-4 py-2.5 text-center w-12">Rank</th>
                <th className="px-4 py-2.5">Nome do Player</th>
                <th className="px-4 py-2.5">Vocação</th>
                <th className="px-4 py-2.5 text-center w-24">Level</th>
                <th className="px-4 py-2.5 text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-500/10 font-mono text-sky-100">
              {players.length > 0 ? (
                players.map((player, idx) => {
                  const rank = (page - 1) * limit + idx + 1;
                  const isOnline = onlinePlayersList.some(
                    (op) => op.name.toLowerCase() === player.name.toLowerCase()
                  );
                  return (
                    <tr key={player.id} className="hover:bg-sky-950/40 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-sky-300">{rank}</td>
                      <td className="px-4 py-1.5">
                        <button
                          onClick={() => onInspectPlayerByName(player.name)}
                          className="font-bold text-white hover:text-sky-300 hover:underline flex items-center gap-2 cursor-pointer text-left focus:outline-none"
                          title="Clique para olhar o personagem"
                        >
                          <img 
                            src={getOutfitImage(player.looktype)} 
                            alt="" 
                            className="w-12 h-12 object-contain shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <span>{player.name}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sky-200/80 text-[11px]">
                        {getVocationName(player.vocation)}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-white">{player.level}</td>
                      <td className="px-4 py-3 text-center">
                        {isOnline ? (
                          <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">ONLINE</span>
                        ) : (
                          <span className="bg-slate-500/20 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-500/30">OFFLINE</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sky-200/60 text-xs">
                    Nenhum jogador encontrado com as especificações atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
