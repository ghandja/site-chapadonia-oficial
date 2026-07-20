import React, { useState, useMemo, useEffect } from "react";
import { Building2, MapPin, Home, Lock, Gavel, Search, X, Loader2 } from "lucide-react";
import { House } from "../types";
import { api } from "../api";

interface HousesProps {
  userAccount: any | null;
  myCharacters: any[];
  coins: number;
  onBidSuccess: (updatedCoins: number) => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const Houses: React.FC<HousesProps> = ({
  userAccount,
  myCharacters,
  coins,
  onBidSuccess,
  showNotification,
}) => {
  const [housesList, setHousesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState("Todas");

  // Bidding modal/form state
  const [biddingHouse, setBiddingHouse] = useState<any | null>(null);
  const [bidCharacter, setBidCharacter] = useState("");
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [submittingBid, setSubmittingBid] = useState(false);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const data = await api.getHouses();
      setHousesList(data || []);
    } catch (e: any) {
      showNotification(e.message || "Erro ao carregar as casas.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  // Dynamic city list extracted from houses array
  const cities = useMemo(() => {
    const list = Array.from(new Set(housesList.map((h) => h.city)));
    return ["Todas", ...list.sort()];
  }, [housesList]);

  // Filter houses based on user selections
  const filteredHouses = useMemo(() => {
    return housesList.filter((house) => {
      const matchesSearch = house.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === "Todas" || house.city === selectedCity;
      const matchesStatus = selectedStatus === "Todas" || house.status === selectedStatus;
      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [housesList, searchQuery, selectedCity, selectedStatus]);

  // Group filtered houses by city
  const groupedHouses = useMemo(() => {
    return filteredHouses.reduce((acc, house) => {
      if (!acc[house.city]) acc[house.city] = [];
      acc[house.city].push(house);
      return acc;
    }, {} as Record<string, any[]>);
  }, [filteredHouses]);

  // Statistics for the header banner
  const stats = useMemo(() => {
    const total = housesList.length;
    const free = housesList.filter((h) => h.status === "Livre").length;
    const occupied = housesList.filter((h) => h.status === "Ocupada").length;
    const auction = housesList.filter((h) => h.status === "Leilão").length;
    return { total, free, occupied, auction };
  }, [housesList]);

  const handleOpenBidModal = (house: any) => {
    if (!userAccount) {
      showNotification("Você precisa estar logado para dar um lance!", "error");
      return;
    }
    if (myCharacters.length === 0) {
      showNotification("Você precisa criar um herói na sua conta para poder dar lances!", "error");
      return;
    }
    setBiddingHouse(house);
    setBidCharacter(myCharacters[0]?.name || "");
    const minBid = Math.max(house.price, (house.currentBid || 0) + 1, 25);
    setBidAmount(minBid);
  };

  const handleCloseBidModal = () => {
    setBiddingHouse(null);
    setBidCharacter("");
    setBidAmount(0);
    setSubmittingBid(false);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingHouse) return;

    const minBid = Math.max(biddingHouse.price, (biddingHouse.currentBid || 0) + 1, 25);
    if (bidAmount < minBid) {
      showNotification(`O lance mínimo para esta casa é de ${minBid} Coins!`, "error");
      return;
    }

    if (coins < bidAmount) {
      showNotification(`Saldo de Coins insuficiente! Seu saldo é de ${coins} Coins.`, "error");
      return;
    }

    try {
      setSubmittingBid(true);
      const res = await api.bidHouse(biddingHouse.id, bidCharacter, bidAmount);
      showNotification(res.message || "Lance registrado com sucesso!", "success");
      onBidSuccess(res.coins);
      
      // Update local house state with updated bid
      setHousesList(prev => prev.map(h => h.id === biddingHouse.id ? res.house : h));
      handleCloseBidModal();
    } catch (e: any) {
      showNotification(e.message || "Erro ao registrar o lance.", "error");
    } finally {
      setSubmittingBid(false);
    }
  };

  return (
    <div className="bg-[#ebd9b4] border border-white/10 rounded-2xl p-5 md:p-8 space-y-6 shadow-2xl relative">
      {/* HEADER */}
      <div className="border-b-2 border-[#795221] pb-3 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#3e2610] font-medieval tracking-wide flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#795221]" /> CASAS
          </h2>
          <p className="text-xs text-[#5c401b] font-mono mt-1">
            Todas as casas do servidor Chapadonia organizadas por cidade.
          </p>
        </div>

        {/* Statistics Widgets */}
        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
          <div className="bg-[#faf1e1] border border-[#d2bc9c] px-2.5 py-1 rounded-md text-[#3e2610]">
            <span className="opacity-70">Total:</span> <strong>{stats.total}</strong>
          </div>
          <div className="bg-[#faf1e1] border border-[#d2bc9c] px-2.5 py-1 rounded-md text-emerald-600 font-bold">
            <span className="opacity-70">Livres:</span> <strong>{stats.free}</strong>
          </div>
          <div className="bg-[#faf1e1] border border-[#d2bc9c] px-2.5 py-1 rounded-md text-red-600 font-bold">
            <span className="opacity-70">Ocupadas:</span> <strong>{stats.occupied}</strong>
          </div>
          <div className="bg-[#faf1e1] border border-[#d2bc9c] px-2.5 py-1 rounded-md text-amber-600 font-bold">
            <span className="opacity-70">Leilão:</span> <strong>{stats.auction}</strong>
          </div>
        </div>
      </div>

      {/* FILTROS (no topo da página) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#faf1e1]/40 border border-[#d2bc9c]/40 rounded-xl">
        {/* Busca por Nome */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#3e2610] font-mono flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-[#795221]" /> Buscar Casa
          </label>
          <input
            type="text"
            placeholder="Buscar pelo nome da casa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#faf1e1] border-2 border-[#d2bc9c] rounded-lg px-3 py-1.5 text-xs text-[#3e2610] placeholder-[#5c401b]/50 focus:outline-none w-full font-mono"
          />
        </div>

        {/* Filtro por Cidade */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#3e2610] font-mono flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#795221]" /> Cidade
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-[#faf1e1] border-2 border-[#d2bc9c] rounded-lg px-3 py-1.5 text-xs text-[#3e2610] focus:outline-none cursor-pointer w-full font-mono"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === "Todas" ? "Todas as Cidades" : city}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#3e2610] font-mono flex items-center gap-1">
            <Gavel className="w-3.5 h-3.5 text-[#795221]" /> Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#faf1e1] border-2 border-[#d2bc9c] rounded-lg px-3 py-1.5 text-xs text-[#3e2610] focus:outline-none cursor-pointer w-full font-mono"
          >
            <option value="Todas">Todas</option>
            <option value="Livre">Livres</option>
            <option value="Ocupada">Ocupadas</option>
            <option value="Leilão">Em Leilão</option>
          </select>
        </div>
      </div>

      {/* LISTA DAS CASAS GRUPADAS */}
      <div className="space-y-6 pt-2">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-xs text-[#5c401b] font-mono">
            <Loader2 className="w-6 h-6 animate-spin text-[#795221]" />
            Carregando casas...
          </div>
        ) : filteredHouses.length === 0 ? (
          <div className="p-12 text-center bg-[#faf1e1] border border-[#d2bc9c] rounded-xl text-xs text-[#5c401b]/70 font-mono">
            Nenhuma casa encontrada com os critérios selecionados.
          </div>
        ) : (
          (Object.entries(groupedHouses) as [string, any[]][]).map(([city, cityHouses]) => (
            <div key={city} className="mb-8 bg-[#faf1e1]/20 p-4 rounded-xl border border-[#d2bc9c]/20">
              <h3 className="text-lg font-extrabold text-[#3e2610] font-medieval border-b-2 border-[#cfa152] pb-1 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#795221]" /> {city}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#dfceab] text-[#3e2610] font-extrabold border-b border-[#d2bc9c]">
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2 text-center">Tamanho</th>
                      <th className="px-3 py-2 text-center">Camas</th>
                      <th className="px-3 py-2 text-center">Andares</th>
                      <th className="px-3 py-2 text-center">Salas</th>
                      <th className="px-3 py-2 text-right">Aluguel</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2">Proprietário / Leilão</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityHouses.map((house) => (
                      <tr key={house.id} className="hover:bg-[#f6eedf] transition-colors border-b border-[#ebd9be]">
                        <td className="px-3 py-2 font-bold text-[#4c2a04]">{house.name}</td>
                        <td className="px-3 py-2 text-center font-mono">{house.size} sqm</td>
                        <td className="px-3 py-2 text-center font-mono">{house.beds}</td>
                        <td className="px-3 py-2 text-center font-mono">{house.floors}</td>
                        <td className="px-3 py-2 text-center font-mono">{house.rooms}</td>
                        <td className="px-3 py-2 text-right font-mono">{house.rent.toLocaleString()} gps</td>
                        <td className="px-3 py-2 text-center">
                          {house.status === "Livre" && (
                            <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                              <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Livre
                            </span>
                          )}
                          {house.status === "Ocupada" && (
                            <span className="text-red-600 font-bold flex items-center justify-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-red-600 shrink-0" /> Ocupada
                            </span>
                          )}
                          {house.status === "Leilão" && (
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-amber-600 font-bold flex items-center justify-center gap-1">
                                <Gavel className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Em Leilão
                              </span>
                              {house.currentBid > 0 && (
                                <span className="text-[9px] text-amber-600 font-mono mt-0.5" title="Lance atual">
                                  ({house.currentBid.toLocaleString()} gp)
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-[#5c401b] font-medium">
                          {house.status === "Leilão" ? (
                            <div className="flex flex-col text-[10px] leading-tight font-mono">
                              <span>Maior Lance: <strong>{house.highestBidder || "Nenhum"}</strong></span>
                              <span>Fim: <strong className="text-amber-700">{new Date(house.auctionEnd).toLocaleDateString()}</strong></span>
                            </div>
                          ) : (
                            house.owner || "-"
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {house.status === "Leilão" ? (
                            <button
                              onClick={() => handleOpenBidModal(house)}
                              className="bg-[#795221] hover:bg-[#5c401b] text-[#faf1e1] font-bold px-3 py-1 rounded text-[10px] font-mono flex items-center gap-1 mx-auto transition-colors shadow-sm"
                            >
                              <Gavel className="w-3 h-3" /> Dar Lance
                            </button>
                          ) : (
                            <span className="text-gray-400 font-mono text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BIDDING MODAL */}
      {biddingHouse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#ebd9b4] border-2 border-[#5d3f1a] rounded-xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b-2 border-[#795221] pb-2">
              <h3 className="text-lg font-extrabold text-[#3e2610] font-medieval flex items-center gap-2">
                <Gavel className="w-5 h-5 text-[#795221]" /> DAR LANCE NO LEILÃO
              </h3>
              <button
                onClick={handleCloseBidModal}
                className="text-[#795221] hover:text-[#5c401b] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* House details summary */}
            <div className="bg-[#faf1e1] border border-[#d2bc9c] rounded-lg p-3 text-xs text-[#3e2610] space-y-1 font-mono">
              <p>📍 <strong>Casa:</strong> {biddingHouse.name}</p>
              <p>🏙️ <strong>Cidade:</strong> {biddingHouse.city}</p>
              <p>📐 <strong>Tamanho:</strong> {biddingHouse.size} sqm</p>
              <p>💰 <strong>Lance Atual:</strong> {biddingHouse.currentBid > 0 ? `${biddingHouse.currentBid} Coins` : "Nenhum"}</p>
              <p>🏆 <strong>Líder:</strong> {biddingHouse.highestBidder || "-"}</p>
              <p>⌛ <strong>Fim do Leilão:</strong> {new Date(biddingHouse.auctionEnd).toLocaleString("pt-BR")}</p>
            </div>

            {/* Bidding Form */}
            <form onSubmit={handleSubmitBid} className="space-y-4">
              {/* Select Character */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#3e2610] font-mono">
                  Escolha seu Herói
                </label>
                <select
                  value={bidCharacter}
                  onChange={(e) => setBidCharacter(e.target.value)}
                  className="bg-[#faf1e1] border-2 border-[#d2bc9c] rounded-lg px-3 py-2 text-xs text-[#3e2610] focus:outline-none cursor-pointer w-full font-mono"
                  required
                >
                  {myCharacters.map((char) => (
                    <option key={char.name} value={char.name}>
                      {char.name} (Lvl {char.level})
                    </option>
                  ))}
                </select>
                <span className="text-[9px] text-[#5c401b] font-mono">
                  Seu lance ficará associado a este herói.
                </span>
              </div>

              {/* Enter Bid Amount */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#3e2610] font-mono">
                    Valor do Lance (em Coins)
                  </label>
                  <span className="text-[10px] text-[#795221] font-mono font-bold">
                    Seu Saldo: {coins} Coins
                  </span>
                </div>
                <input
                  type="number"
                  min={Math.max(biddingHouse.price, (biddingHouse.currentBid || 0) + 1, 25)}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                  className="bg-[#faf1e1] border-2 border-[#d2bc9c] rounded-lg px-3 py-2 text-xs text-[#3e2610] focus:outline-none w-full font-mono"
                  required
                />
                <span className="text-[9px] text-[#5c401b] font-mono">
                  Lance mínimo necessário: <strong>{Math.max(biddingHouse.price, (biddingHouse.currentBid || 0) + 1, 25)} Coins</strong>
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCloseBidModal}
                  className="bg-[#faf1e1] hover:bg-[#f6eedf] border border-[#d2bc9c] text-[#3e2610] font-bold px-4 py-2 rounded-lg text-xs font-mono transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="bg-[#795221] hover:bg-[#5c401b] text-[#faf1e1] font-bold px-5 py-2 rounded-lg text-xs font-mono transition-colors shadow-md flex items-center gap-1 disabled:opacity-50"
                >
                  {submittingBid ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registrando...
                    </>
                  ) : (
                    <>
                      <Gavel className="w-3.5 h-3.5" /> Confirmar Lance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
