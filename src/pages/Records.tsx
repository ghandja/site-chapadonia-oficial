import React from "react";
import { Trophy, Users, ShieldAlert, Sparkles, Sword, Flame, Star, Coins, Target, Award } from "lucide-react";

interface RecordItem {
  category: string;
  title: string;
  holder: string;
  value: string;
  date: string;
  icon: React.ReactNode;
}

export const Records: React.FC = () => {
  const records: RecordItem[] = [];

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER */}
      <div className="border-b border-sky-500/20 pb-3 mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
          🏆 RECORDES DO SERVIDOR
        </h2>
        <p className="text-xs text-sky-200/80 font-mono mt-1">
          Veja os recordes, conquistas eternas e marcos atingidos pelos heróis e pela comunidade do Chapadonia!
        </p>
      </div>

      {/* RECORDS GRID */}
      {records.length === 0 ? (
        <div className="bg-[#0c1930]/40 border border-sky-500/10 rounded-xl p-12 text-center text-sky-200/60 font-mono text-xs">
          Nenhum recorde registrado ainda. Os recordes serão atualizados automaticamente quando o servidor estiver online.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((record, index) => (
            <div 
              key={index} 
              className="bg-[#0c1930] border border-sky-500/20 rounded-xl p-4 shadow-lg hover:border-sky-400/40 transition-colors flex items-start gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-1.5 bg-[#080f1e] text-[#968369] font-mono text-[9px] uppercase rounded-bl border-l border-b border-sky-500/10">
                {record.category}
              </div>

              <div className="p-3 bg-sky-950/40 border border-sky-500/15 rounded-xl shrink-0">
                {record.icon}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block font-mono">Recorde Geral</span>
                <h3 className="text-sm font-extrabold text-white font-serif">{record.title}</h3>
                
                <div className="text-xs text-sky-200/90 font-serif pt-1">
                  Detentor: <strong className="text-amber-300 font-mono text-xs">{record.holder}</strong>
                </div>

                <div className="text-xs font-mono font-bold text-white pt-0.5">
                  Marca: <span className="text-cyan-300">{record.value}</span>
                </div>

                <div className="text-[10px] text-sky-300/60 font-mono pt-1">
                  Data do feito: {record.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER STATS INFO */}
      <div className="bg-sky-500/5 border border-sky-500/20 p-4 rounded-xl flex items-center gap-3 text-xs leading-relaxed text-sky-200">
        <div className="p-2 bg-sky-950/60 border border-sky-500/15 rounded-lg shrink-0 text-lg">🎖️</div>
        <p className="font-serif">
          Os recordes são atualizados automaticamente a cada manutenção semanal no banco de dados. Caso você acredite ter quebrado um recorde mundial de Chapadonia, envie uma captura de tela para a equipe no Discord!
        </p>
      </div>

    </div>
  );
};
