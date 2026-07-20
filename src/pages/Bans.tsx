import React, { useState } from "react";
import { AlertTriangle, Shield, Search, Calendar, User, Clock, CheckCircle } from "lucide-react";

interface BanRecord {
  id: number;
  player: string;
  reason: string;
  bannedBy: string;
  banDate: string;
  duration: string;
  status: "Ativo" | "Expirado";
}

export const Bans: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [banList] = useState<BanRecord[]>([]);

  const filteredBans = banList.filter(b => 
    b.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER */}
      <div className="border-b border-sky-500/20 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-sky-400" />
            HISTÓRICO DE BANS
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-1">
            Lista informativa de punições e banimentos recentes aplicados para manter o jogo honesto.
          </p>
        </div>
      </div>

      {/* SEARCH FIELD */}
      <div className="bg-[#0c1930] border border-sky-500/20 p-3 rounded-xl flex items-center justify-between gap-4 flex-wrap">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-sky-300 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Buscar por jogador ou motivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080f1e] border border-sky-500/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-sky-300/60 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 shadow-inner font-mono"
          />
        </div>

        <div className="text-[10px] text-sky-200/80 font-mono">
          Mostrando {filteredBans.length} de {banList.length} registros totais.
        </div>
      </div>

      {/* BANS LIST */}
      <div className="space-y-3">
        {filteredBans.length === 0 ? (
          <div className="py-12 bg-[#0c1930]/40 border border-sky-500/10 rounded-xl text-center text-xs text-sky-200/60 font-mono">
            Nenhuma punição encontrada para sua pesquisa.
          </div>
        ) : (
          filteredBans.map(ban => (
            <div 
              key={ban.id} 
              className="bg-[#0c1930] border border-sky-500/25 rounded-xl p-4 space-y-3 hover:border-sky-400/50 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-sky-500/10 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-sky-300" />
                  <span className="font-extrabold text-sm text-white font-serif">{ban.player}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                  {ban.status === "Ativo" ? (
                    <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded uppercase">
                      ⚠️ Ban Ativo
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded uppercase flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Expirado
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-sky-100 leading-relaxed italic bg-[#080f1e] p-2.5 rounded border border-sky-500/15">
                &ldquo;{ban.reason}&rdquo;
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[10px] font-mono text-sky-200/80 pt-1">
                <div>
                  <span className="text-sky-300/60 block">GM Responsável</span>
                  <strong className="text-white">{ban.bannedBy}</strong>
                </div>
                <div>
                  <span className="text-sky-300/60 block">Data de Aplicação</span>
                  <strong className="text-white">{ban.banDate}</strong>
                </div>
                <div>
                  <span className="text-sky-300/60 block">Duração total</span>
                  <strong className="text-white">{ban.duration}</strong>
                </div>
                <div>
                  <span className="text-sky-300/60 block">Poderia recorrer?</span>
                  <strong className="text-sky-300">Sim (Via Ticket)</strong>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
