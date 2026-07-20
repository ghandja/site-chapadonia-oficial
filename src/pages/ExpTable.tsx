import React, { useState } from "react";
import { Zap, HelpCircle, Search, Info, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

export const ExpTable: React.FC = () => {
  const [searchLevel, setSearchLevel] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Experiência necessária para ir de L para L+1
  const getNeededExpForLevel = (level: number): number => {
    return 50 * (level * level - level + 2);
  };

  // Experiência acumulada para chegar no level L
  const getAccumulatedExp = (level: number): number => {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += 50 * (i * i - i + 2);
    }
    return total;
  };

  // Retorna a taxa multiplicadora correspondente com base no level
  const getExpRateForLevel = (level: number): string => {
    if (level >= 1 && level <= 50) return "350x";
    if (level >= 51 && level <= 100) return "200x";
    if (level >= 101 && level <= 150) return "100x";
    if (level >= 151 && level <= 200) return "50x";
    if (level >= 201 && level <= 250) return "25x";
    if (level >= 251 && level <= 300) return "10x";
    return "5x";
  };

  // Criar dados para os níveis
  const totalLevels = 2000;
  const generateLevelData = (page: number) => {
    const data = [];
    const start = (page - 1) * itemsPerPage + 1;
    const end = Math.min(start + itemsPerPage - 1, totalLevels);
    for (let l = start; l <= end; l++) {
      data.push({
        level: l,
        needed: getNeededExpForLevel(l),
        accumulated: getAccumulatedExp(l),
        rate: getExpRateForLevel(l),
      });
    }
    return data;
  };

  const currentLevelData = generateLevelData(currentPage);
  const totalPages = Math.ceil(totalLevels / itemsPerPage);

  // Busca de nível específica
  let searchedRecord = null;
  const levelNum = parseInt(searchLevel);
  if (!isNaN(levelNum) && levelNum >= 1 && levelNum <= 2000) {
    searchedRecord = {
      level: levelNum,
      needed: getNeededExpForLevel(levelNum),
      accumulated: getAccumulatedExp(levelNum),
      rate: getExpRateForLevel(levelNum)
    };
  }

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER */}
      <div className="border-b border-sky-500/20 pb-3 mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
          📊 TABELA DE EXPERIÊNCIA
        </h2>
        <p className="text-xs text-sky-200/80 font-mono mt-1">
          Confira o multiplicador de rates, experiência acumulada e progresso necessário por nível (1 a 2000).
        </p>
      </div>

      {/* ESTÁGIOS DE EXPERIÊNCIA (RATES) */}
      <div className="bg-[#0c1930] border border-sky-500/25 rounded-xl p-4 space-y-3 shadow-lg">
        <h3 className="text-xs font-extrabold text-white font-serif uppercase tracking-wider flex items-center gap-2 border-b border-sky-500/10 pb-1.5">
          <TrendingUp className="w-4 h-4 text-cyan-400" /> ESTÁGIOS DE EXPERIÊNCIA (RATES)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-[#080f1e] p-2.5 rounded border border-sky-500/10 flex flex-col justify-between">
            <span className="text-sky-300">Nível 1 - 50</span>
            <span className="text-cyan-400 font-extrabold text-sm text-right mt-1">350x</span>
          </div>
          <div className="bg-[#080f1e] p-2.5 rounded border border-sky-500/10 flex flex-col justify-between">
            <span className="text-sky-300">Nível 51 - 100</span>
            <span className="text-cyan-400 font-extrabold text-sm text-right mt-1">200x</span>
          </div>
          <div className="bg-[#080f1e] p-2.5 rounded border border-sky-500/10 flex flex-col justify-between">
            <span className="text-sky-300">Nível 101 - 150</span>
            <span className="text-cyan-400 font-extrabold text-sm text-right mt-1">100x</span>
          </div>
          <div className="bg-[#080f1e] p-2.5 rounded border border-sky-500/10 flex flex-col justify-between">
            <span className="text-sky-300">Nível 151 - 200</span>
            <span className="text-cyan-400 font-extrabold text-sm text-right mt-1">50x</span>
          </div>
          <div className="bg-[#080f1e] p-2.5 rounded border border-sky-500/10 flex flex-col justify-between">
            <span className="text-sky-300">Nível 201 - 250</span>
            <span className="text-cyan-400 font-extrabold text-sm text-right mt-1">25x</span>
          </div>
          <div className="bg-[#080f1e] p-2.5 rounded border border-sky-500/10 flex flex-col justify-between">
            <span className="text-sky-300">Nível 251 - 300</span>
            <span className="text-cyan-400 font-extrabold text-sm text-right mt-1">10x</span>
          </div>
          <div className="bg-[#080f1e] p-2.5 rounded border border-sky-500/10 col-span-2 flex flex-col justify-between">
            <span className="text-sky-300">Nível 301+</span>
            <span className="text-amber-400 font-extrabold text-sm text-right mt-1">5x (Mínimo Estável)</span>
          </div>
        </div>
      </div>

      {/* CALCULATOR & LOOKUP */}
      <div className="bg-[#0c1930] border border-sky-500/25 rounded-xl p-4 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-500/10 pb-2">
          <h3 className="text-xs font-extrabold text-white font-serif uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" /> CONSULTAR NÍVEL ESPECÍFICO
          </h3>
          <div className="text-[10px] text-sky-200 font-mono">Suporta níveis de 1 a 2000</div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="2000"
            placeholder="Digite o nível (ex: 150)..."
            value={searchLevel}
            onChange={(e) => setSearchLevel(e.target.value)}
            className="bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-xs text-[#eadac2] placeholder-sky-300/50 font-mono focus:outline-none focus:border-cyan-400 w-full sm:w-64"
          />
        </div>

        {searchedRecord && (
          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-3.5 space-y-2 text-xs font-mono">
            <div className="text-cyan-300 font-bold">Resultado para o Nível {searchedRecord.level}:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>XP para Próximo Level: <span className="text-white font-bold">{searchedRecord.needed.toLocaleString()}</span></div>
              <div>XP Acumulado Total: <span className="text-white font-bold">{searchedRecord.accumulated.toLocaleString()}</span></div>
              <div>Estágio Ativo: <span className="text-amber-300 font-bold">{searchedRecord.rate}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* EXP TABLE VIEW */}
      <div className="bg-[#0c1930] border border-sky-500/25 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-xs font-mono text-left">
          <thead className="bg-[#080f1e] text-sky-200 border-b border-sky-500/20">
            <tr>
              <th className="p-3">Nível</th>
              <th className="p-3">XP Necessário (Lvl Up)</th>
              <th className="p-3">XP Acumulado Total</th>
              <th className="p-3 text-right">Taxa (Rate)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-500/10 text-slate-100">
            {currentLevelData.map((row) => (
              <tr key={row.level} className="hover:bg-sky-950/20 transition-colors">
                <td className="p-3 font-bold text-cyan-400">#{row.level}</td>
                <td className="p-3">{row.needed.toLocaleString()} XP</td>
                <td className="p-3">{row.accumulated.toLocaleString()} XP</td>
                <td className="p-3 text-right text-amber-300 font-bold">{row.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION PANEL */}
        <div className="bg-[#080f1e] p-3.5 border-t border-sky-500/20 flex items-center justify-between text-xs">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 bg-[#0c1930] hover:bg-sky-950 border border-sky-500/30 rounded px-2.5 py-1 text-sky-200 transition-colors disabled:opacity-50 font-mono text-[11px] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <span className="font-mono text-sky-300">
            Página <strong className="text-white">{currentPage}</strong> de <strong className="text-white">{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 bg-[#0c1930] hover:bg-sky-950 border border-sky-500/30 rounded px-2.5 py-1 text-sky-200 transition-colors disabled:opacity-50 font-mono text-[11px] cursor-pointer"
          >
            Próxima <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
