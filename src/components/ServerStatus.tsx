import React from "react";
import { Compass, Sparkles } from "lucide-react";
import { ServerInfo } from "../types";

interface ServerStatusProps {
  serverInfo: ServerInfo | null;
  experienceRate: number;
  onlineCountFallback: number;
}

export const ServerStatus: React.FC<ServerStatusProps> = ({
  serverInfo,
  experienceRate,
  onlineCountFallback,
}) => {
  return (
    <div className="bg-[#18110b] border-2 border-[#5d3f1a] p-4 rounded-xl shadow-xl space-y-2.5">
      <span className="text-xs font-bold text-[#cfa152] font-serif uppercase tracking-widest block border-b border-[#312213] pb-1.5 flex items-center gap-1.5">
        <Compass className="w-3.5 h-3.5" /> INFORMAÇÕES DO SERVIDOR
      </span>
      
      <div className="space-y-2 text-[11px] font-mono text-[#a39075]">
        <div className="flex justify-between border-b border-[#2d1d0c] pb-1.5">
          <span>Server Status:</span>
          {serverInfo ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
            </span>
          ) : (
            <span className="text-red-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Offline
            </span>
          )}
        </div>
        <div className="flex justify-between border-b border-[#2d1d0c] pb-1.5">
          <span>Online agora:</span>
          <span className={serverInfo ? "text-emerald-400 font-bold" : "text-red-500 font-bold"}>
            {serverInfo ? `${serverInfo.playersOnline} Players` : (onlineCountFallback > 0 ? `${onlineCountFallback} Players` : "Offline")}
          </span>
        </div>
        <div className="flex justify-between border-b border-[#2d1d0c] pb-1.5">
          <span>Recorde Online:</span>
          <span className={serverInfo ? "text-amber-400 font-bold" : "text-red-500 font-bold"}>
            {serverInfo ? `${serverInfo.playersRecord} Players` : "Offline"}
          </span>
        </div>
        <div className="flex justify-between border-b border-[#2d1d0c] pb-1.5">
          <span>Total de Contas:</span>
          <span className={serverInfo ? "text-amber-400 font-bold" : "text-red-500 font-bold"}>
            {serverInfo ? serverInfo.totalAccounts : "Offline"}
          </span>
        </div>
        <div className="flex justify-between border-b border-[#2d1d0c] pb-1.5">
          <span>Total Players:</span>
          <span className={serverInfo ? "text-amber-400 font-bold" : "text-red-500 font-bold"}>
            {serverInfo ? serverInfo.totalPlayers : "Offline"}
          </span>
        </div>
        <div className="flex justify-between border-b border-[#2d1d0c] pb-1.5">
          <span>Experiência:</span>
          <span className="text-amber-400 font-bold">{experienceRate}x Staged</span>
        </div>
        <div className="flex justify-between border-b border-[#2d1d0c] pb-1.5">
          <span>Skills:</span>
          <span className="text-amber-400 font-bold">25.0x</span>
        </div>
        <div className="flex justify-between border-b border-[#2d1d0c] pb-1.5">
          <span>Loot:</span>
          <span className="text-emerald-400 font-bold">3.0x</span>
        </div>
        <div className="flex justify-between">
          <span>Bestiary:</span>
          <span className="text-amber-400 font-bold">2.0x</span>
        </div>
      </div>
    </div>
  );
};
