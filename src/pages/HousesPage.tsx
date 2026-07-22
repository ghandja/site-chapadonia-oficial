import React, { useState, useEffect } from "react";
import { Home, Search, Shield, Coins, MapPin, Building, Award, CheckCircle, Clock, User, Filter } from "lucide-react";
import { api } from "../api";

interface House {
  id: number;
  name: string;
  town_id: number;
  townName: string;
  size: number;
  rent: number;
  beds: number;
  owner_id: number | null;
  ownerName: string | null;
  status: "rented" | "auction" | "free";
  bid?: number;
  bidder?: string;
}

const TOWNS = [
  { id: 0, name: "Todas as Cidades" },
  { id: 1, name: "Thais" },
  { id: 2, name: "Venore" },
  { id: 3, name: "Carlin" },
  { id: 4, name: "Edron" },
  { id: 5, name: "Darashia" },
  { id: 6, name: "Ankrahmun" },
  { id: 7, name: "Liberty Bay" },
  { id: 8, name: "Yalahar" }
];

export const HousesPage: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTown, setSelectedTown] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "rented" | "auction" | "free">("all");
  const [selectedType, setSelectedType] = useState<"all" | "house" | "guildhall">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch houses from API (or generate standard Tibia house set if empty)
    api.getHouses()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setHouses(data);
        } else {
          // Default Tibia House set
          setHouses(DEFAULT_HOUSES);
        }
      })
      .catch(() => {
        setHouses(DEFAULT_HOUSES);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredHouses = houses.filter((h) => {
    if (selectedTown !== 0 && h.town_id !== selectedTown) return false;
    if (selectedStatus !== "all" && h.status !== selectedStatus) return false;
    if (selectedType === "guildhall" && !h.name.toLowerCase().includes("guildhall")) return false;
    if (selectedType === "house" && h.name.toLowerCase().includes("guildhall")) return false;
    if (searchQuery.trim() && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER TIBIA.COM HOUSES */}
      <div className="border-b border-sky-500/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-sky-300 font-mono tracking-wider block flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-amber-400" /> Imóveis & Sede de Guildas (Tibia.com Format)
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide">
            Casas do Servidor
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-0.5">
            Consulte disponibilidade, leilões ativos, tamanho (SQM) e aluguel mensal de cada propriedade.
          </p>
        </div>
      </div>

      {/* FILTROS TIPO TIBIA.COM */}
      <div className="bg-[#0c1930] border border-sky-500/20 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          
          {/* Cidade */}
          <div>
            <label className="text-[10px] text-sky-300 uppercase font-bold block mb-1">Cidade / Town:</label>
            <select
              value={selectedTown}
              onChange={(e) => setSelectedTown(Number(e.target.value))}
              className="w-full bg-[#080f1e] border border-sky-500/20 text-white rounded-lg p-2 focus:border-sky-400 outline-none"
            >
              {TOWNS.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] text-sky-300 uppercase font-bold block mb-1">Status do Imóvel:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full bg-[#080f1e] border border-sky-500/20 text-white rounded-lg p-2 focus:border-sky-400 outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="auction">Em Leilão (Auctions)</option>
              <option value="rented">Alugadas (Rented)</option>
              <option value="free">Livres (Free)</option>
            </select>
          </div>

          {/* Tipo (Casa x Guildhall) */}
          <div>
            <label className="text-[10px] text-sky-300 uppercase font-bold block mb-1">Tipo de Propriedade:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-[#080f1e] border border-sky-500/20 text-white rounded-lg p-2 focus:border-sky-400 outline-none"
            >
              <option value="all">Todas as Propriedades</option>
              <option value="house">Apenas Casas</option>
              <option value="guildhall">Sedes de Guildas (Guildhalls)</option>
            </select>
          </div>

          {/* Busca por nome */}
          <div>
            <label className="text-[10px] text-sky-300 uppercase font-bold block mb-1">Buscar por Nome:</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Amber House..."
                className="w-full bg-[#080f1e] border border-sky-500/20 text-white rounded-lg p-2 pl-8 focus:border-sky-400 outline-none placeholder:text-sky-200/40"
              />
              <Search className="w-3.5 h-3.5 text-sky-400 absolute left-2.5 top-3" />
            </div>
          </div>

        </div>
      </div>

      {/* RESULTADOS LISTA TIBIA.COM */}
      <div className="bg-[#0c1930] border border-sky-500/30 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-3 bg-sky-950/80 border-b border-sky-500/20 flex justify-between items-center text-xs font-mono">
          <span className="text-sky-300 font-bold uppercase tracking-wider">
            Propriedades Encontradas ({filteredHouses.length})
          </span>
          <span className="text-[10px] text-sky-400">
            Imóveis exclusivos para Premium Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#080f1e] text-sky-200 font-serif font-extrabold border-b border-sky-500/20">
                <th className="px-4 py-3">Nome do Imóvel</th>
                <th className="px-4 py-3 text-center">Cidade</th>
                <th className="px-4 py-3 text-center">Tamanho (SQM)</th>
                <th className="px-4 py-3 text-center">Camas</th>
                <th className="px-4 py-3 text-center">Aluguel Mensal</th>
                <th className="px-4 py-3 text-center">Status / Proprietário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-500/10 text-sky-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sky-300/60">
                    Carregando lista oficial de imóveis...
                  </td>
                </tr>
              ) : filteredHouses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sky-300/60">
                    Nenhum imóvel encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredHouses.map((h) => (
                  <tr key={h.id} className="hover:bg-sky-950/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                      <Home className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{h.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sky-200">{h.townName}</td>
                    <td className="px-4 py-3 text-center font-bold text-amber-300">{h.size} sqm</td>
                    <td className="px-4 py-3 text-center text-sky-200">{h.beds} beds</td>
                    <td className="px-4 py-3 text-center font-bold text-amber-400">{h.rent.toLocaleString()} gp</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center">
                        {h.status === "rented" && h.ownerName ? (
                          <span className="inline-flex items-center justify-center text-center text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                            Alugada por {h.ownerName}
                          </span>
                        ) : h.status === "auction" ? (
                          <span className="inline-flex items-center justify-center text-center text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                            Em Leilão ({h.bid || 10000} gp)
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-center text-sky-300 font-bold bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                            Livre para !buyhouse
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const DEFAULT_HOUSES: House[] = [
  { id: 1, name: "Thais Central Flat 1", town_id: 1, townName: "Thais", size: 45, rent: 15000, beds: 2, owner_id: 10, ownerName: "Sir Chapadonia", status: "rented" },
  { id: 2, name: "Thais Harbor Street 4", town_id: 1, townName: "Thais", size: 60, rent: 25000, beds: 3, owner_id: null, ownerName: null, status: "auction", bid: 15000, bidder: "Knight Loko" },
  { id: 3, name: "Thais Guildhall Hall of Honor", town_id: 1, townName: "Thais", size: 180, rent: 100000, beds: 10, owner_id: 99, ownerName: "Chapadonia Legends", status: "rented" },
  { id: 4, name: "Venore South Street 2", town_id: 2, townName: "Venore", size: 55, rent: 20000, beds: 3, owner_id: null, ownerName: null, status: "free" },
  { id: 5, name: "Carlin Park Lane 3", town_id: 3, townName: "Carlin", size: 38, rent: 12000, beds: 2, owner_id: 14, ownerName: "Druida Supremo", status: "rented" },
  { id: 6, name: "Edron Castle Street 1", town_id: 4, townName: "Edron", size: 90, rent: 45000, beds: 4, owner_id: null, ownerName: null, status: "auction", bid: 30000 },
  { id: 7, name: "Darashia Villa 5", town_id: 5, townName: "Darashia", size: 75, rent: 35000, beds: 4, owner_id: null, ownerName: null, status: "free" },
  { id: 8, name: "Liberty Bay Beach House 2", town_id: 7, townName: "Liberty Bay", size: 110, rent: 60000, beds: 5, owner_id: 22, ownerName: "Pirata Rey", status: "rented" }
];
