import React, { useEffect, useState } from "react";
import { Skull, Calendar, ShieldAlert, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { RecentDeath } from "../types";

export const LastKills: React.FC = () => {
  const [deaths, setDeaths] = useState<RecentDeath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    api.getRecentDeaths()
      .then((res) => {
        if (isMounted) {
          setDeaths(res.deaths || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load recent deaths:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      <div className="border-b border-sky-500/20 pb-3 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            💀 ÚLTIMAS MORTES
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-1">
            Acompanhe o histórico recente de baixas em Chapadonia.
          </p>
        </div>
        <div className="text-xs font-mono bg-sky-950/60 border border-sky-500/30 px-3 py-1.5 rounded-lg text-sky-300 self-start md:self-auto flex items-center gap-1.5">
          <Skull className="w-3.5 h-3.5 text-rose-400" />
          <span>Total de Registros: <strong>{deaths.length}</strong></span>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#0c1930] border border-sky-500/20 rounded-xl p-12 text-center text-sky-200/60 font-mono text-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span>Carregando histórico de mortes...</span>
        </div>
      ) : deaths.length === 0 ? (
        <div className="bg-[#0c1930] border border-sky-500/20 rounded-xl p-12 text-center text-sky-200/60 font-mono text-xs flex flex-col items-center justify-center gap-2">
          <ShieldAlert className="w-8 h-8 text-sky-400/50 mb-1" />
          <span>Nenhuma morte registrada recentemente. O servidor será populado em breve!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {deaths.map((death, idx) => (
            <div
              key={`${death.player_id}-${death.time}-${idx}`}
              className="bg-[#0e1c36]/80 hover:bg-[#122344] transition-all border border-sky-500/20 hover:border-sky-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-500/30 flex items-center justify-center shrink-0">
                  {death.looktype ? (
                    <img
                      src={`/api/proxy/sprite/Outfit_${death.looktype}.gif`}
                      alt="Outfit"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Skull className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/character?name=${encodeURIComponent(death.player_name)}`}
                      className="font-bold text-sky-300 hover:text-sky-100 hover:underline transition-colors text-sm"
                    >
                      {death.player_name}
                    </Link>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
                      Level {death.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Morto no level <strong className="text-rose-400 font-extrabold">{death.level}</strong> por{" "}
                    <strong className="text-amber-300">{death.killed_by}</strong>
                    {death.mostdamage_by && death.mostdamage_by !== death.killed_by && (
                      <span className="text-slate-400"> (maior dano por {death.mostdamage_by})</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sky-200/70 font-mono text-xs bg-sky-950/40 px-3 py-1.5 rounded-lg border border-sky-500/20 self-end sm:self-auto shrink-0">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>{new Date(death.time * 1000).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
