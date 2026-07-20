import React from "react";

export const LastKills: React.FC = () => {
  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      <div className="border-b border-sky-500/20 pb-3 mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
          💀 ÚLTIMAS MORTES
        </h2>
        <p className="text-xs text-sky-200/80 font-mono mt-1">
          Acompanhe o histórico recente de baixas em Chapadonia.
        </p>
      </div>
      <div className="bg-[#0c1930] border border-sky-500/20 rounded-xl p-12 text-center text-sky-200/60 font-mono text-xs">
        Nenhuma morte registrada recentemente. O servidor será populado em breve!
      </div>
    </div>
  );
};
