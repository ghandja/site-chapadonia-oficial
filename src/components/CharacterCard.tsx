import React from "react";
import { Eye, Shield, User } from "lucide-react";
import { getVocationName } from "../utils";

interface CharacterCardProps {
  name: string;
  level: number;
  vocation: number | string;
  sex?: number | string;
  online?: boolean;
  onInspect?: () => void;
  price?: number;
  onBuy?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  level,
  vocation,
  sex,
  online,
  onInspect,
  price,
  onBuy,
}) => {
  const vocName = typeof vocation === "number" ? getVocationName(vocation) : vocation;
  const genderName = sex === 0 || sex === "Feminino" ? "Feminino" : "Masculino";

  return (
    <div className="bg-[#faf1e1] border-2 border-[#d2bc9c] rounded-xl p-4 flex flex-col justify-between hover:border-[#cfa152] transition-colors shadow-sm">
      <div className="space-y-3">
        <div className="flex justify-between items-start border-b border-[#ebd9be] pb-2">
          <div>
            <h4 className="text-sm font-extrabold text-[#4c2a04] font-serif flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-700" />
              {name}
            </h4>
            <span className="text-[10px] text-amber-700 font-bold uppercase">{vocName}</span>
          </div>
          {price !== undefined && (
            <span className="bg-[#3e2610] text-amber-400 text-xs font-bold px-2 py-1 rounded font-mono">
              {price} Coins
            </span>
          )}
          {online !== undefined && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              online 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" 
                : "bg-slate-500/10 border-slate-500/30 text-slate-500"
            }`}>
              {online ? "ONLINE" : "OFFLINE"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-black">
          <div className="bg-[#f3e4c8] px-2 py-1.5 rounded">
            <span className="text-slate-500 block">Level:</span>
            <strong className="text-black">{level}</strong>
          </div>
          <div className="bg-[#f3e4c8] px-2 py-1.5 rounded">
            <span className="text-slate-500 block">Gênero:</span>
            <strong className="text-black">{genderName}</strong>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {onInspect && (
          <button
            onClick={onInspect}
            className="flex-1 bg-[#795221] hover:bg-[#5a3b1a] text-white font-extrabold text-xs py-2 rounded cursor-pointer transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> Olhar
          </button>
        )}
        {price !== undefined && onBuy && (
          <button
            onClick={onBuy}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs py-2 rounded cursor-pointer transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            Comprar
          </button>
        )}
      </div>
    </div>
  );
};
