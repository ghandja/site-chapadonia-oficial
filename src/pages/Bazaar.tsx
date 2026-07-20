import React, { useState } from "react";
import { Users, Info, Eye, Sparkles, Clock, X, Coins, ShieldCheck, HelpCircle, History, ArrowRight } from "lucide-react";
import { BazaarCharacter } from "../types";
import { getOutfitImage, generateCharacterDetails } from "../utils";

interface BazaarProps {
  coins: number;
  bazaarListings: BazaarCharacter[];
  onBuyCharacter: (char: BazaarCharacter) => void;
  userAccount: any | null;
  onInspectPlayer: (name: string) => void;
  setCurrentSitePage: (page: string) => void;
}

export const Bazaar: React.FC<BazaarProps> = ({
  coins,
  bazaarListings,
  onBuyCharacter,
  userAccount,
  onInspectPlayer,
  setCurrentSitePage,
}) => {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [selectedCharForModal, setSelectedCharForModal] = useState<BazaarCharacter | null>(null);
  const [modalTab, setModalTab] = useState<"eq" | "skills" | "outfit" | "mounts" | "depot">("eq");



  // Map gender values properly
  const getGenderLabel = (g: string) => g === "Masculino" ? "Masculino" : "Feminino";

  const handleOpenInspector = (char: BazaarCharacter) => {
    setSelectedCharForModal(char);
    setModalTab("eq");
  };

  const handleCloseInspector = () => {
    setSelectedCharForModal(null);
  };

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER DA PÁGINA */}
      <div className="border-b border-sky-500/20 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            <Users className="w-7 h-7 text-sky-400" />
            BAZAR DE PERSONAGENS
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-1">
            Transfira e negocie personagens diretamente entre jogadores com segurança completa de banco de dados do Chapadonia.
          </p>
        </div>
        {userAccount && (
          <div className="bg-[#122240] text-amber-300 font-mono text-xs font-extrabold px-3.5 py-1.5 rounded-xl border border-sky-500/50 flex items-center gap-1.5 shadow-md self-start sm:self-center shrink-0">
            <Coins className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>SALDO: {coins} Coins</span>
          </div>
        )}
      </div>

      {/* Como funciona */}
      <div className="bg-[#0c1930] border border-sky-500/30 p-4 rounded-xl text-xs text-sky-200 space-y-2.5 shadow-lg">
        <span className="font-extrabold text-white uppercase flex items-center gap-1.5 font-serif">
          <Info className="w-4 h-4 text-sky-400" /> Como funciona a negociação do Bazar?
        </span>
        <p className="leading-relaxed text-sky-200/80">
          Os personagens listados no Bazar são removidos da conta de origem e congelados. Ao comprar, as moedas correspondentes são debitadas de seu saldo e o personagem é limpo e transferido para sua conta instantaneamente. 100% seguro contra fraudes!
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button 
            onClick={() => setCurrentSitePage("account")}
            className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold font-mono py-1 px-3 rounded uppercase tracking-wider transition-colors cursor-pointer border border-sky-400/25"
          >
            Anunciar Meu Personagem
          </button>
          <a 
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              setCurrentSitePage("wiki");
            }}
            className="text-sky-300 hover:text-white font-bold text-[10px] uppercase tracking-wider font-mono flex items-center gap-1 mt-1 pl-1"
          >
            Regras de Leilão <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* SELETOR DE ABAS PRINCIPAIS */}
      <div className="border-b border-sky-500/20 flex gap-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-xs font-bold font-serif whitespace-nowrap transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "active" 
              ? "border-sky-400 text-white font-extrabold bg-sky-500/10 rounded-t-lg" 
              : "border-transparent text-sky-200/60 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Leilões Ativos
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-xs font-bold font-serif whitespace-nowrap transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "history" 
              ? "border-sky-400 text-white font-extrabold bg-sky-500/10 rounded-t-lg" 
              : "border-transparent text-sky-200/60 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" /> Histórico de Vendas
        </button>
      </div>

      {/* LEILÕES ATIVOS */}
      {activeTab === "active" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider font-serif">
              Personagens Disponíveis no Servidor:
            </span>
            <span className="text-[10px] font-mono text-sky-400">
              Resultados: {bazaarListings.length}
            </span>
          </div>
          
          {bazaarListings.length === 0 ? (
            <div className="bg-[#0f1d3a]/60 border border-sky-500/20 p-12 rounded-xl text-center text-sky-200/60 text-xs font-mono">
              Não há nenhum personagem anunciado no momento. Que tal colocar um dos seus à venda no painel da conta?
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bazaarListings.map((char) => {
                const isOwnedByMe = userAccount && char.ownerAccount === userAccount.name;
                const looktype = char.looktype || 128;
                
                // Auction remaining timer simulation
                const remainingTime = "7d restante";

                return (
                  <div key={char.id} className="bg-[#0f1d3a]/80 border border-sky-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-sky-400 transition-all relative overflow-hidden shadow-lg">
                    
                    <div className="space-y-3">
                      {/* Name, Vocation, Price Row */}
                      <div className="flex justify-between items-start border-b border-sky-500/10 pb-2 gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {/* Animated/static outfit preview */}
                          <div className="w-12 h-12 shrink-0 bg-[#0d1b32] border border-sky-500/20 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                            <img 
                              src={getOutfitImage(looktype)} 
                              alt="" 
                              className="w-16 h-16 object-contain max-w-none -translate-y-2.5" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-extrabold text-white font-serif truncate" title={char.name}>{char.name}</h4>
                            <span className="text-[10px] text-sky-300 font-bold font-mono">{char.vocation}</span>
                          </div>
                        </div>
                        <span className="bg-[#080f1e] text-amber-300 text-xs font-mono font-extrabold px-2.5 py-1.5 rounded border border-amber-500/30 shadow-inner shrink-0 text-center">
                          {char.price} <span className="text-[8px] block text-amber-400/80">Coins</span>
                        </span>
                      </div>

                      {/* Timer Bar */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-sky-200 bg-sky-500/10 border border-sky-500/20 rounded-md px-2 py-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>Fim do Leilão: <strong className="text-sky-300 font-bold">{remainingTime}</strong></span>
                      </div>

                      {/* Grid of basic stats */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white">
                        <div className="bg-[#0d1b32]/80 px-2.5 py-1.5 rounded border border-sky-500/10 flex justify-between">
                          <span className="text-sky-200/70">Level:</span>
                          <strong className="text-white font-extrabold">{char.level}</strong>
                        </div>
                        <div className="bg-[#0d1b32]/80 px-2.5 py-1.5 rounded border border-sky-500/10 flex justify-between">
                          <span className="text-sky-200/70">Sexo:</span>
                          <strong className="text-white font-extrabold">{getGenderLabel(char.gender)}</strong>
                        </div>
                        <div className="bg-[#0d1b32]/80 px-2.5 py-1.5 rounded border border-sky-500/10 flex justify-between">
                          <span className="text-sky-200/70">Skill Arma:</span>
                          <strong className="text-sky-300 font-extrabold">{char.skills.main}</strong>
                        </div>
                        <div className="bg-[#0d1b32]/80 px-2.5 py-1.5 rounded border border-sky-500/10 flex justify-between">
                          <span className="text-sky-200/70">Shielding:</span>
                          <strong className="text-sky-300 font-extrabold">{char.skills.shield}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-1.5">
                      <button
                        onClick={() => handleOpenInspector(char)}
                        className="bg-sky-950/60 hover:bg-sky-900 text-sky-200 font-extrabold py-2 rounded-lg border border-sky-500/30 cursor-pointer transition-all flex items-center justify-center gap-1 uppercase tracking-wider font-mono text-[10px]"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" /> Ficha Completa
                      </button>
                      
                      {isOwnedByMe ? (
                        <span className="bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider rounded-lg border border-emerald-500/30 py-2 flex items-center justify-center text-[10px] font-mono">
                          ✓ Seu Anúncio
                        </span>
                      ) : userAccount ? (
                        <button
                          onClick={() => onBuyCharacter(char)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 rounded-lg cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1 font-serif text-[11px] border border-emerald-500/30 shadow-md"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-200" /> Comprar
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentSitePage("login")}
                          className="bg-sky-950/60 hover:bg-sky-900 text-sky-300 font-extrabold py-2 rounded-lg cursor-pointer transition-all uppercase tracking-wider text-[11px] font-serif border border-sky-500/30"
                        >
                          Login para Comprar
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HISTÓRICO DE VENDAS */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block font-serif">
            Últimos Personagens Vendidos no Bazar:
          </span>
          <div className="bg-[#0c1930]/40 border border-sky-500/10 rounded-xl p-12 text-center text-sky-200/60 font-mono text-xs">
            Nenhuma venda registrada ainda. Quando alguém comprar um personagem, o histórico aparecerá aqui.
          </div>
        </div>
      )}

      {/* INSPECTOR MODAL CIPSOFT LEVEL */}
      {selectedCharForModal && (() => {
        const char = selectedCharForModal;
        const details = generateCharacterDetails(char.name, char.vocation, char.level, char.skills.main, char.skills.shield);
        
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0a1224] border-2 border-sky-500/50 w-full max-w-2xl rounded-2xl shadow-2xl relative text-white overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Header Modal */}
              <div className="bg-gradient-to-r from-[#112240] to-[#0d1b32] px-5 py-3 border-b border-sky-500/30 text-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-400" />
                  <div>
                    <h3 className="font-extrabold text-sm font-serif tracking-wider uppercase">Inspetor de Personagem — {char.name}</h3>
                    <p className="text-[10px] text-sky-200/60 font-mono">Verificação mística de integridade de banco de dados do Chapadonia</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseInspector}
                  className="text-sky-300 hover:text-white bg-[#080f1e] border border-sky-500/30 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Banner */}
              <div className="bg-[#080f1e] p-4 flex flex-col sm:flex-row gap-4 items-center border-b border-sky-500/30 text-sky-200">
                <div className="w-16 h-16 shrink-0 bg-[#0d1b32] rounded-xl border border-sky-500/30 flex items-center justify-center overflow-hidden shadow-inner">
                  <img 
                    src={getOutfitImage(char.looktype || 128)} 
                    alt="" 
                    className="w-24 h-24 object-contain max-w-none -translate-y-4" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center sm:text-left space-y-1 overflow-hidden">
                  <h4 className="text-white text-base font-serif font-extrabold truncate">{char.name}</h4>
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start font-mono text-[10px]">
                    <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/35 font-bold">LVL {char.level}</span>
                    <span className="bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">{char.vocation}</span>
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">{getGenderLabel(char.gender)}</span>
                  </div>
                </div>
                <div className="sm:ml-auto text-center sm:text-right shrink-0">
                  <span className="text-[10px] text-sky-400 font-mono block">Preço do Lote:</span>
                  <span className="text-amber-300 text-lg font-bold font-mono">🪙 {char.price} Coins</span>
                </div>
              </div>

              {/* Modal Tabs Selector */}
              <div className="bg-[#0d1b32] border-b border-sky-500/20 px-4 py-1 flex gap-1 overflow-x-auto custom-scrollbar shrink-0">
                {[
                  { id: "eq", label: "Equipamento" },
                  { id: "skills", label: "Skills" },
                  { id: "outfit", label: "Outfit" },
                  { id: "mounts", label: "Montarias" },
                  { id: "depot", label: "Depósito" }
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setModalTab(tb.id as any)}
                    className={`px-3 py-1.5 text-[10px] font-extrabold uppercase font-serif whitespace-nowrap transition-all rounded-t cursor-pointer border-t border-x ${
                      modalTab === tb.id 
                        ? "bg-[#0a1224] text-white border-b-2 border-sky-500" 
                        : "text-sky-200/70 hover:text-white hover:bg-[#0a1224]/50"
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                
                {/* EQ TAB */}
                {modalTab === "eq" && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-mono text-sky-200/70 leading-relaxed text-center">
                      Visualização de equipamentos atualmente equipados no inventário do personagem. Todos os itens estão inclusos no lote do leilão.
                    </p>

                    {/* Inventory grid simulation */}
                    <div className="flex justify-center py-2">
                      <div className="bg-[#080f1e] border-2 border-sky-500/30 p-3 rounded-2xl shadow-xl w-fit flex flex-col gap-2 relative">
                        {/* 3x3 Grid of Inventory Slots */}
                        <div className="grid grid-cols-3 gap-2">
                          
                          {/* Top row */}
                          <div className="w-14 h-14 bg-[#040914] border border-sky-500/20 rounded-lg flex items-center justify-center relative cursor-help group" title={details.equipment.amulet.name}>
                            <span className="text-xl" role="img" aria-label="Amulet">{details.equipment.amulet.sprite}</span>
                            <span className="absolute bottom-0 text-[6px] text-sky-300 bg-black/60 px-0.5 rounded font-mono">AMUL</span>
                            <div className="hidden group-hover:block absolute z-50 bg-[#040914] border border-sky-500/30 text-[9px] text-sky-100 font-mono p-1.5 rounded shadow-xl w-32 -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                              <strong>{details.equipment.amulet.name}</strong>
                              <span className="block text-[8px] text-sky-300/60 mt-0.5">{details.equipment.amulet.desc}</span>
                            </div>
                          </div>

                          <div className="w-14 h-14 bg-[#040914] border border-sky-500/20 rounded-lg flex items-center justify-center relative cursor-help group" title={details.equipment.helmet.name}>
                            <span className="text-xl" role="img" aria-label="Helmet">{details.equipment.helmet.sprite}</span>
                            <span className="absolute bottom-0 text-[6px] text-sky-300 bg-black/60 px-0.5 rounded font-mono">HEAD</span>
                            <div className="hidden group-hover:block absolute z-50 bg-[#040914] border border-sky-500/30 text-[9px] text-sky-100 font-mono p-1.5 rounded shadow-xl w-32 -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                              <strong>{details.equipment.helmet.name}</strong>
                              <span className="block text-[8px] text-sky-300/60 mt-0.5">{details.equipment.helmet.desc}</span>
                            </div>
                          </div>

                          <div className="w-14 h-14 bg-[#040914] border border-sky-500/20 rounded-lg flex items-center justify-center relative cursor-help group" title={details.equipment.backpack.name}>
                            <span className="text-xl" role="img" aria-label="Backpack">{details.equipment.backpack.sprite}</span>
                            <span className="absolute bottom-0 text-[6px] text-sky-300 bg-black/60 px-0.5 rounded font-mono">BACK</span>
                            <div className="hidden group-hover:block absolute z-50 bg-[#040914] border border-sky-500/30 text-[9px] text-sky-100 font-mono p-1.5 rounded shadow-xl w-32 -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                              <strong>{details.equipment.backpack.name}</strong>
                              <span className="block text-[8px] text-sky-300/60 mt-0.5">{details.equipment.backpack.desc}</span>
                            </div>
                          </div>

                          {/* Middle row */}
                          <div className="w-14 h-14 bg-[#040914] border border-sky-500/20 rounded-lg flex items-center justify-center relative cursor-help group" title={details.equipment.weapon.name}>
                            <span className="text-xl" role="img" aria-label="Weapon">{details.equipment.weapon.sprite}</span>
                            <span className="absolute bottom-0 text-[6px] text-sky-300 bg-black/60 px-0.5 rounded font-mono">WEAP</span>
                            <div className="hidden group-hover:block absolute z-50 bg-[#040914] border border-sky-500/30 text-[9px] text-sky-100 font-mono p-1.5 rounded shadow-xl w-32 -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                              <strong>{details.equipment.weapon.name}</strong>
                              <span className="block text-[8px] text-sky-300/60 mt-0.5">{details.equipment.weapon.desc}</span>
                            </div>
                          </div>

                          <div className="w-14 h-14 bg-[#040914] border border-sky-500/20 rounded-lg flex items-center justify-center relative cursor-help group" title={details.equipment.armor.name}>
                            <span className="text-xl" role="img" aria-label="Armor">{details.equipment.armor.sprite}</span>
                            <span className="absolute bottom-0 text-[6px] text-sky-300 bg-black/60 px-0.5 rounded font-mono">BODY</span>
                            <div className="hidden group-hover:block absolute z-50 bg-[#040914] border border-sky-500/30 text-[9px] text-sky-100 font-mono p-1.5 rounded shadow-xl w-32 -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                              <strong>{details.equipment.armor.name}</strong>
                              <span className="block text-[8px] text-sky-300/60 mt-0.5">{details.equipment.armor.desc}</span>
                            </div>
                          </div>

                          <div className="w-14 h-14 bg-[#040914] border border-sky-500/20 rounded-lg flex items-center justify-center relative cursor-help group" title={details.equipment.shield.name}>
                            <span className="text-xl" role="img" aria-label="Shield">{details.equipment.shield.sprite}</span>
                            <span className="absolute bottom-0 text-[6px] text-sky-300 bg-black/60 px-0.5 rounded font-mono">SHLD</span>
                            <div className="hidden group-hover:block absolute z-50 bg-[#040914] border border-sky-500/30 text-[9px] text-sky-100 font-mono p-1.5 rounded shadow-xl w-32 -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                              <strong>{details.equipment.shield.name}</strong>
                              <span className="block text-[8px] text-sky-300/60 mt-0.5">{details.equipment.shield.desc}</span>
                            </div>
                          </div>

                          {/* Bottom row */}
                          <div className="w-14 h-14 bg-[#040914] border border-sky-500/20 rounded-lg flex items-center justify-center relative cursor-help group" title={details.equipment.ring.name}>
                            <span className="text-xl" role="img" aria-label="Ring">{details.equipment.ring.sprite}</span>
                            <span className="absolute bottom-0 text-[6px] text-sky-300 bg-black/60 px-0.5 rounded font-mono">RING</span>
                            <div className="hidden group-hover:block absolute z-50 bg-[#040914] border border-sky-500/30 text-[9px] text-sky-100 font-mono p-1.5 rounded shadow-xl w-32 -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                              <strong>{details.equipment.ring.name}</strong>
                              <span className="block text-[8px] text-sky-300/60 mt-0.5">{details.equipment.ring.desc}</span>
                            </div>
                          </div>

                          <div className="w-14 h-14 bg-[#040914] border border-sky-500/20 rounded-lg flex items-center justify-center relative cursor-help group" title={details.equipment.legs.name}>
                            <span className="text-xl" role="img" aria-label="Legs">{details.equipment.legs.sprite}</span>
                            <span className="absolute bottom-0 text-[6px] text-sky-300 bg-black/60 px-0.5 rounded font-mono">LEGS</span>
                            <div className="hidden group-hover:block absolute z-50 bg-[#040914] border border-sky-500/30 text-[9px] text-sky-100 font-mono p-1.5 rounded shadow-xl w-32 -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                              <strong>{details.equipment.legs.name}</strong>
                              <span className="block text-[8px] text-sky-300/60 mt-0.5">{details.equipment.legs.desc}</span>
                            </div>
                          </div>

                          <div className="w-14 h-14 bg-[#040914] border border-sky-500/20 rounded-lg flex items-center justify-center relative cursor-help group" title={details.equipment.boots.name}>
                            <span className="text-xl" role="img" aria-label="Boots">{details.equipment.boots.sprite}</span>
                            <span className="absolute bottom-0 text-[6px] text-sky-300 bg-black/60 px-0.5 rounded font-mono">FEET</span>
                            <div className="hidden group-hover:block absolute z-50 bg-[#040914] border border-sky-500/30 text-[9px] text-sky-100 font-mono p-1.5 rounded shadow-xl w-32 -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                              <strong>{details.equipment.boots.name}</strong>
                              <span className="block text-[8px] text-sky-300/60 mt-0.5">{details.equipment.boots.desc}</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SKILLS TAB */}
                {modalTab === "skills" && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-mono text-sky-200/70 leading-relaxed text-center">
                      Informações de skills de combate e magias sincronizadas diretamente do banco de dados MySQL do servidor.
                    </p>

                    <div className="grid grid-cols-2 gap-3 font-mono text-xs text-white">
                      {[
                        { label: "Magic Level", val: details.skills.magicLevel, color: "text-purple-400" },
                        { label: "Sword Fighting", val: details.skills.sword, color: "text-amber-300" },
                        { label: "Axe Fighting", val: details.skills.axe, color: "text-red-400" },
                        { label: "Club Fighting", val: details.skills.club, color: "text-yellow-300" },
                        { label: "Distance Fighting", val: details.skills.distance, color: "text-emerald-400" },
                        { label: "Shielding", val: details.skills.shielding, color: "text-blue-400" },
                        { label: "Fist Fighting", val: details.skills.fist, color: "text-slate-300" },
                        { label: "Fishing", val: details.skills.fishing, color: "text-sky-400" }
                      ].map((sk) => (
                        <div key={sk.label} className="bg-[#0d1b32] p-2.5 rounded-lg border border-sky-500/20 flex justify-between items-center hover:border-sky-400/40 transition-all">
                          <span className="text-sky-200/70">{sk.label}:</span>
                          <strong className={`font-bold ${sk.color} text-sm`}>{sk.val}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* OUTFIT TAB */}
                {modalTab === "outfit" && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-mono text-sky-200/70 leading-relaxed text-center">
                      Especificação visual de addon e roupas ativos no inventário do personagem.
                    </p>

                    <div className="bg-[#0d1b32] border border-sky-500/20 rounded-xl p-4 flex flex-col items-center gap-3">
                      <div className="w-24 h-24 bg-[#080f1e] border border-sky-500/30 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                        <img 
                          src={getOutfitImage(char.looktype || 128)} 
                          alt="" 
                          className="w-32 h-32 object-contain max-w-none -translate-y-4 scale-110" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <h5 className="font-serif font-extrabold text-white text-sm">{details.outfit.name}</h5>
                        <p className="text-[11px] text-sky-200/80 font-mono leading-relaxed">{details.outfit.description}</p>
                        <p className="text-[10px] text-sky-400 font-mono italic">Looktype do Core C++: {char.looktype || 128}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* MOUNTS TAB */}
                {modalTab === "mounts" && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-mono text-sky-200/70 leading-relaxed text-center">
                      Montarias destravadas na conta por este personagem através de hunts ou eventos de servidor.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                      {details.mounts.map((mnt) => (
                        <div key={mnt.name} className="bg-[#0d1b32] p-3 rounded-lg border border-sky-500/20 flex items-center gap-3 hover:border-sky-400/30 transition-all">
                          <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-lg flex items-center justify-center text-xl shrink-0">
                            {mnt.sprite}
                          </div>
                          <div>
                            <strong className="text-white block">{mnt.name}</strong>
                            <span className="text-[10px] text-emerald-400 font-bold block">Bônus: {mnt.speedBonus} Velocidade</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DEPOT TAB */}
                {modalTab === "depot" && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-mono text-sky-200/70 leading-relaxed text-center">
                      Visão mística de itens guardados de alto valor no Depot do personagem.
                    </p>

                    <div className="bg-[#0d1b32] border border-sky-500/20 rounded-xl p-3 max-h-[220px] overflow-y-auto custom-scrollbar">
                      <div className="divide-y divide-sky-500/10">
                        {details.depotItems.map((itm) => (
                          <div key={itm.name} className="py-2.5 flex items-center gap-3 font-mono text-xs hover:bg-[#0a1224] px-1 rounded transition-colors">
                            <div className="w-9 h-9 bg-[#080f1e] border border-sky-500/20 rounded flex items-center justify-center text-lg shrink-0">
                              {itm.sprite}
                            </div>
                            <div className="overflow-hidden">
                              <span className="font-extrabold text-white block truncate">{itm.name}</span>
                              <span className="text-[10px] text-sky-300 block truncate">{itm.desc}</span>
                            </div>
                            <div className="ml-auto shrink-0 bg-sky-900 text-sky-100 font-extrabold font-mono text-[10px] px-2 py-0.5 rounded border border-sky-500/30">
                              Qt: {itm.qty}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="bg-[#0d1b32] px-5 py-3 border-t border-sky-500/30 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                <span className="text-[10px] font-mono text-sky-300/80 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transação coberta por Banco de Dados MySQL
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleCloseInspector}
                    className="flex-1 sm:flex-none px-4 py-2 bg-sky-900 hover:bg-sky-800 text-white font-extrabold rounded-lg font-serif transition-colors text-xs cursor-pointer border border-sky-500/30"
                  >
                    Fechar
                  </button>
                  {!userAccount ? (
                    <button 
                      onClick={() => {
                        handleCloseInspector();
                        setCurrentSitePage("login");
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-lg font-serif transition-colors text-xs cursor-pointer uppercase tracking-wider shadow"
                    >
                      Login para Comprar
                    </button>
                  ) : char.ownerAccount !== userAccount.name ? (
                    <button 
                      onClick={() => {
                        handleCloseInspector();
                        onBuyCharacter(char);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg font-serif transition-colors text-xs cursor-pointer uppercase tracking-wider shadow border border-emerald-500/30"
                    >
                      Confirmar Compra ({char.price}c)
                    </button>
                  ) : null}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
