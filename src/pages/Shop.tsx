import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  ShoppingBag, Coins, Sparkles, X, ShoppingCart, HelpCircle, Heart, Tag, 
  Trash2, Plus, Minus, Info, CheckCircle2, TrendingUp, Sparkle, ArrowRight, Clock,
  Search, ShieldCheck
} from "lucide-react";
import { PlayerCharacter, StashItem } from "../types";
import { shopItems, SHOP_CATEGORIES, VOCATION_NAMES, ShopItem } from "../data/shopItems";
import { VOCATIONS } from "../utils";

function proxySpriteUrl(url: string): string {
  if (!url || url.startsWith("/api/proxy/")) return url;
  const match = url.match(/Special:FilePath\/(.+)$/);
  if (match) {
    return `/api/proxy/sprite/${encodeURIComponent(match[1])}`;
  }
  return url;
}

interface ShopImageProps {
  name: string;
  src: string;
  className?: string;
}

export const ShopImage: React.FC<ShopImageProps> = ({ name, src, className = "w-12 h-12 object-contain" }) => {
  const [error, setError] = React.useState(false);
  const proxySrc = proxySpriteUrl(src);

  React.useEffect(() => {
    setError(false);
  }, [proxySrc]);

  if (error || !proxySrc) {
    const cleanName = name.replace(/[()]/g, "").trim();
    const words = cleanName.split(/\s+/).filter(w => w.length > 0);
    let initials = "";
    if (words.length > 0) {
      const startIdx = (/^\d/.test(words[0]) || words[0].toLowerCase().includes("x")) && words.length > 1 ? 1 : 0;
      initials = words.slice(startIdx, startIdx + 3).map(w => w[0]).join("").toUpperCase();
    }
    if (!initials) initials = name.slice(0, 2).toUpperCase();

    const isSmall = className.includes("w-6") || className.includes("h-6");
    const isLarge = className.includes("w-24") || className.includes("h-24") || className.includes("w-32") || className.includes("h-32");
    
    const sizeClasses = isSmall 
      ? "w-6 h-6 text-[8px]" 
      : isLarge 
      ? "w-24 h-24 text-xl" 
      : "w-12 h-12 text-xs";

    return (
      <div 
        className={`${sizeClasses} flex items-center justify-center rounded bg-[#3e2610] text-amber-400 font-bold font-mono border border-[#d2bc9c]/30 select-none shadow-md shrink-0`}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img 
      src={proxySrc} 
      alt={name} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
};

interface ShopProps {
  coins: number;
  myCharacters: PlayerCharacter[];
  stashItems: StashItem[];
  onBuyMarketItem: (item: StashItem) => void;
  onRemoveItemFromMarket: (itemId: string) => void;
  onSimulateSomeoneBuyingMyItem: (item: StashItem) => void;
  onAnnounceNewItem: (payload: {
    name: string;
    sprite: string;
    stats: string;
    sellerName: string;
    price: number;
  }) => void;
  userAccount: any | null;
  setShowLoginModal: (show: boolean) => void;
  setShowPixModal: (show: boolean) => void;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
  onUpdateCoins?: (amount: number) => void; // Callback to deduct coins on shop purchases
}

export const Shop: React.FC<ShopProps> = ({
  coins,
  myCharacters = [],
  stashItems,
  onBuyMarketItem,
  onRemoveItemFromMarket,
  onSimulateSomeoneBuyingMyItem,
  onAnnounceNewItem,
  userAccount,
  setShowLoginModal,
  setShowPixModal,
  showNotification,
  onUpdateCoins,
}) => {
  // Navigation & Search State
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedVocation, setSelectedVocation] = useState<number>(0); // 0 = Todas, 1 = Sorcerer, etc.

  // Cart Local State
  const [cart, setCart] = useState<Array<{ item: ShopItem; qty: number; character: string; world: string }>>([]);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [modalCharacter, setModalCharacter] = useState<string>(myCharacters[0]?.name || "");
  const [modalWorld, setModalWorld] = useState<string>("Chapadonia PvP-Global");

  // Local Purchase History
  const [purchaseHistory, setPurchaseHistory] = useState<Array<{ id: string; itemName: string; price: number; spriteUrl: string; date: string; character: string; world: string }>>([
    { id: "h1", itemName: "30 Dias Premium Account VIP", price: 250, spriteUrl: "/api/proxy/sprite/Gold_Token.gif", date: "18/07/2026", character: myCharacters[0]?.name || "Chapadonio", world: "Chapadonia PvP-Global" }
  ]);

  // Vocation ID mapping for filter check
  const VOCATION_ID_MAP: Record<string, number> = {
    "Sorcerer": 1, "Master Sorcerer": 1,
    "Druid": 2, "Elder Druid": 2,
    "Paladin": 3, "Royal Paladin": 3,
    "Knight": 4, "Elite Knight": 4,
    "Monk": 5, "Exalted Monk": 5
  };

  // Helper to convert character name to its vocation ID
  const getCharVocationId = (charName: string): number => {
    const char = myCharacters.find(c => c.name === charName);
    if (!char) return 0;
    return VOCATION_ID_MAP[char.vocation] || 0;
  };

  // Formats item sprite path from wiki name
  const getWikiSprite = (itemName: string) => {
    const formatted = itemName.replace(/\s+/g, "_");
    return `/api/proxy/sprite/${encodeURIComponent(formatted)}.gif`;
  };

  // Filter items
  const filteredItems = shopItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVocation = selectedVocation === 0 || item.vocation.length === 0 || item.vocation.some(v => {
      if (selectedVocation === 1) return v === 1 || v === 5;
      if (selectedVocation === 2) return v === 2 || v === 6;
      if (selectedVocation === 3) return v === 3 || v === 7;
      if (selectedVocation === 4) return v === 4 || v === 8;
      if (selectedVocation === 5) return v === 9 || v === 10 || v === 5;
      return v === selectedVocation;
    });
    return matchesCategory && matchesSearch && matchesVocation;
  });

  // Get Best Sellers (filtered by current category or global if category matches)
  const bestSellers = shopItems.filter(item => item.isBestSeller && (activeCategory === "all" || item.category === activeCategory));
  const newArrivals = shopItems.filter(item => item.isNew && (activeCategory === "all" || item.category === activeCategory));

  // Add to cart
  const handleAddToCart = (item: ShopItem, qty = 1, charName = "", worldName = "Chapadonia PvP-Global") => {
    if (!userAccount) {
      showNotification("Por favor, faça login para usar o carrinho de compras!", "error");
      setShowLoginModal(true);
      return;
    }

    const finalCharName = charName || modalCharacter || myCharacters[0]?.name || "Destinatário";
    
    // Check if already in cart
    const existingIndex = cart.findIndex(c => c.item.id === item.id && c.character === finalCharName && c.world === worldName);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].qty += qty;
      setCart(newCart);
    } else {
      setCart([...cart, { item, qty, character: finalCharName, world: worldName }]);
    }

    showNotification(`"${item.name}" adicionado ao carrinho para ${finalCharName}!`, "success");
    setSelectedItem(null);
  };

  // Quick Instant Purchase
  const handleInstantBuy = (item: ShopItem, charName = "", worldName = "Chapadonia PvP-Global") => {
    if (!userAccount) {
      showNotification("Por favor, faça login para realizar compras!", "error");
      setShowLoginModal(true);
      return;
    }

    const finalCharName = charName || modalCharacter || myCharacters[0]?.name || "Destinatário";
    if (!finalCharName.trim()) {
      showNotification("Por favor, informe o nome do personagem para entrega!", "error");
      return;
    }

    if (coins < item.priceCoins) {
      showNotification("Saldo insuficiente! Adquira mais coins via Pix.", "error");
      return;
    }

    if (onUpdateCoins) {
      onUpdateCoins(item.priceCoins);
    }

    const dateStr = new Date().toLocaleDateString("pt-BR");
    setPurchaseHistory([
      {
        id: Math.random().toString(),
        itemName: item.name,
        price: item.priceCoins,
        spriteUrl: item.spriteUrl,
        date: dateStr,
        character: finalCharName,
        world: worldName
      },
      ...purchaseHistory
    ]);

    showNotification(`Sucesso! "${item.name}" foi entregue ao Depot de ${finalCharName} no mundo ${worldName}!`, "success");
    setSelectedItem(null);
  };

  // Remove from cart
  const handleRemoveFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // Update Cart Quantity
  const handleUpdateCartQty = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].qty = Math.max(1, newCart[index].qty + delta);
    setCart(newCart);
  };

  // Checkout Cart
  const handleCheckoutCart = () => {
    if (cart.length === 0) return;
    
    const totalCost = cart.reduce((sum, c) => sum + (c.item.priceCoins * c.qty), 0);
    if (coins < totalCost) {
      showNotification("Saldo de coins insuficiente para fechar o carrinho!", "error");
      return;
    }

    if (onUpdateCoins) {
      onUpdateCoins(totalCost);
    }

    const dateStr = new Date().toLocaleDateString("pt-BR");
    const newHistory = cart.map(c => ({
      id: Math.random().toString(),
      itemName: `${c.item.name} (x${c.qty})`,
      price: c.item.priceCoins * c.qty,
      spriteUrl: c.item.spriteUrl,
      date: dateStr,
      character: c.character,
      world: c.world
    }));

    setPurchaseHistory([...newHistory, ...purchaseHistory]);
    setCart([]);
    showNotification("Excelente! Todos os itens do carrinho foram entregues com sucesso.", "success");
  };

  const totalCartPrice = cart.reduce((sum, c) => sum + (c.item.priceCoins * c.qty), 0);

  // Opens the modal details with correct values
  const handleOpenDetails = (item: ShopItem) => {
    setSelectedItem(item);
    setModalCharacter(myCharacters[0]?.name || "");
  };

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER DA PÁGINA */}
      <div className="border-b border-sky-500/20 pb-3 mb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-sky-400" /> LOJA
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-1">Itens, equipamentos e serviços para seu personagem.</p>
        </div>
        {userAccount && (
          <div className="bg-[#122240] text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-sky-500/50 flex items-center gap-1.5 shadow-md">
            <Coins className="w-4 h-4 text-amber-300 animate-pulse" /> Saldo: {coins} Coins
          </div>
        )}
      </div>

      {/* PIX QUICK BUY & TIBIAITENS P2P BANNER */}
      <div className="bg-gradient-to-r from-[#0c1930] via-[#112240] to-[#0c1930] border border-sky-500/30 rounded-xl p-5 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-sky-400 to-amber-500" />
        
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block font-serif flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" /> Marketplace TibiaItens — P2P & Loja Oficial
          </span>
          <p className="text-xs text-sky-200/90 font-mono max-w-xl">
            Compre e venda armas, armaduras, montarias e coins diretamente com outros jogadores do servidor ou adquira benefícios VIP na loja oficial!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setShowPixModal(true)}
            className="bg-gradient-to-b from-[#eacf9c] to-[#cba668] hover:from-[#f6dda6] hover:to-[#dbb576] text-black font-extrabold text-xs px-4 py-2.5 rounded-lg shadow-lg cursor-pointer uppercase tracking-wider transition-all border border-[#df9c3c]"
          >
            🪙 Adquirir Coins
          </button>
        </div>
      </div>

      {/* CATEGORIES BUTTONS GRID */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-sky-300 font-serif uppercase tracking-widest block">
          Categorias Disponíveis
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 p-1.5 bg-[#112240]/40 rounded-xl border border-sky-500/20 max-h-[195px] overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-2.5 py-2 text-[10px] md:text-xs font-bold font-serif uppercase tracking-wide rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "all"
                ? "bg-sky-600 text-white shadow border border-sky-400" 
                : "text-sky-200 hover:text-white hover:bg-sky-500/20"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center text-sm">🌐</span> Todos os Itens
          </button>
          {SHOP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-2 text-[10px] md:text-xs font-bold font-serif uppercase tracking-wide rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id 
                  ? "bg-sky-600 text-white shadow border border-sky-400" 
                  : "text-sky-200 hover:text-white hover:bg-sky-500/20"
              }`}
            >
              {cat.icon.startsWith("http") ? (
                <img 
                  src={cat.icon} 
                  alt={cat.label} 
                  className="w-5 h-5 object-contain shrink-0 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-5 h-5 flex items-center justify-center">{cat.icon}</span>
              )}
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH AND FILTERS ROW */}
      <div className="bg-[#0e1a30]/85 border-2 border-sky-500/30 p-3 rounded-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="Pesquisar itens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a1224] border-2 border-sky-500/30 rounded-lg pl-9 pr-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-400"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <span className="text-xs font-bold text-sky-300 font-mono whitespace-nowrap">Vocação:</span>
          <select
            value={selectedVocation}
            onChange={(e) => setSelectedVocation(Number(e.target.value))}
            className="w-full bg-[#0a1224] border-2 border-sky-500/30 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none cursor-pointer focus:border-sky-400"
          >
            <option value={0}>Todas as Vocações</option>
            <option value={1}>{VOCATIONS[1]} / {VOCATIONS[5]}</option>
            <option value={2}>{VOCATIONS[2]} / {VOCATIONS[6]}</option>
            <option value={3}>{VOCATIONS[3]} / {VOCATIONS[7]}</option>
            <option value={4}>{VOCATIONS[4]} / {VOCATIONS[8]}</option>
            <option value={5}>{VOCATIONS[9]} / {VOCATIONS[10]}</option>
          </select>
        </div>
      </div>

      {/* MAIN CONTENT WORKSPACE: LEFT IS STUFF, RIGHT IS CART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: LIST OF PRODUCTS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SELEÇÃO: MAIS VENDIDOS */}
          {bestSellers.length > 0 && !searchQuery && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-sky-300 font-serif uppercase tracking-widest flex items-center gap-1.5 border-b border-sky-500/20 pb-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> 🔥 Mais Vendidos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bestSellers.slice(0, 4).map((item) => (
                  <div key={`hot-${item.id}`} className="bg-[#0f1d3a]/80 border border-sky-500/30 rounded-xl p-4 hover:border-sky-400 transition-all flex flex-col relative overflow-hidden group shadow-lg">
                    <span className="absolute top-2 right-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[9px] px-2.5 py-0.5 font-bold uppercase tracking-wider shadow-inner">
                      ★ BESTSELLER
                    </span>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-16 h-16 bg-[#0d1b32] rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-sky-500/20">
                        <ShopImage name={item.name} src={item.spriteUrl} className="w-12 h-12 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-white font-serif truncate">{item.name}</h4>
                        <p className="text-[10px] text-sky-200/70 font-mono truncate">{item.attributes.slice(0,2).join(' | ')}</p>
                      </div>
                    </div>
                    {item.level > 0 && (
                      <p className="text-[10px] text-amber-300 font-mono mb-2 bg-[#080f1e] px-2 py-0.5 rounded border border-amber-500/20 w-fit">
                        Req: {item.vocation.map(v => VOCATION_NAMES[v]).join('/') || "Qualquer"} Lvl {item.level}+
                      </p>
                    )}
                    <div className="mt-auto pt-3 border-t border-sky-500/10 flex items-center justify-between">
                      <span className="bg-[#080f1e] text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-amber-500/20 shadow-inner">
                        🪙 {item.priceCoins} Coins
                      </span>
                      <button 
                        onClick={() => handleOpenDetails(item)}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded transition-colors cursor-pointer"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SELEÇÃO: NOVIDADES */}
          {newArrivals.length > 0 && !searchQuery && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-sky-300 font-serif uppercase tracking-widest flex items-center gap-1.5 border-b border-sky-500/20 pb-1.5">
                <Sparkle className="w-4 h-4 text-cyan-400 animate-spin-slow" /> 🆕 Novidades
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {newArrivals.slice(0, 4).map((item) => (
                  <div key={`new-${item.id}`} className="bg-[#0f1d3a]/80 border border-sky-500/30 rounded-xl p-4 hover:border-sky-400 transition-all flex flex-col relative overflow-hidden group shadow-lg">
                    <span className="absolute top-2 right-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-[9px] px-2.5 py-0.5 font-bold uppercase tracking-wider shadow-inner">
                      ✨ NOVO
                    </span>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-16 h-16 bg-[#0d1b32] rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-sky-500/20">
                        <ShopImage name={item.name} src={item.spriteUrl} className="w-12 h-12 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-white font-serif truncate">{item.name}</h4>
                        <p className="text-[10px] text-sky-200/70 font-mono truncate">{item.attributes.slice(0,2).join(' | ')}</p>
                      </div>
                    </div>
                    {item.level > 0 && (
                      <p className="text-[10px] text-amber-300 font-mono mb-2 bg-[#080f1e] px-2 py-0.5 rounded border border-amber-500/20 w-fit">
                        Req: {item.vocation.map(v => VOCATION_NAMES[v]).join('/') || "Qualquer"} Lvl {item.level}+
                      </p>
                    )}
                    <div className="mt-auto pt-3 border-t border-sky-500/10 flex items-center justify-between">
                      <span className="bg-[#080f1e] text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-amber-500/20 shadow-inner">
                        🪙 {item.priceCoins} Coins
                      </span>
                      <button 
                        onClick={() => handleOpenDetails(item)}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded transition-colors cursor-pointer"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GRID GERAL DE ITENS FILTRADOS */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-sky-300 font-serif uppercase tracking-widest border-b border-sky-500/20 pb-1.5 flex justify-between items-center">
              <span>🎒 Catálogo de Itens ({filteredItems.length})</span>
              <span className="text-[10px] text-sky-300 font-mono flex items-center gap-1">
                Categoria: {
                  activeCategory === "all" 
                    ? "✨ Todas" 
                    : (
                      <span className="inline-flex items-center gap-1.5 bg-[#0a1224] px-2 py-0.5 rounded border border-sky-500/20">
                        {(() => {
                          const cat = SHOP_CATEGORIES.find(c => c.id === activeCategory);
                          if (!cat) return activeCategory;
                          return (
                            <>
                              {cat.icon.startsWith("http") ? (
                                <img 
                                  src={cat.icon} 
                                  alt={cat.label} 
                                  className="w-4 h-4 object-contain" 
                                  referrerPolicy="no-referrer" 
                                />
                              ) : (
                                <span>{cat.icon}</span>
                              )}
                              <span>{cat.label}</span>
                            </>
                          );
                        })()}
                      </span>
                    )
                }
              </span>
            </h3>

            {filteredItems.length === 0 ? (
              <div className="bg-[#0f1d3a]/60 border border-sky-500/20 rounded-2xl p-8 text-center text-sky-200/60 font-mono text-xs">
                Nenhum item localizado com os filtros selecionados. Experimente limpar os filtros.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-[#0f1d3a]/80 border border-sky-500/20 rounded-xl p-4 hover:border-sky-400 transition-all flex flex-col shadow-lg group">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-16 h-16 bg-[#0d1b32] rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-sky-500/20">
                        <ShopImage name={item.name} src={item.spriteUrl} className="w-12 h-12 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-white font-serif truncate">{item.name}</h4>
                        <p className="text-[10px] text-sky-200/70 font-mono truncate">{item.attributes.slice(0,2).join(' | ')}</p>
                      </div>
                    </div>
                    {item.level > 0 && (
                      <p className="text-[10px] text-amber-300 font-mono mb-2 bg-[#080f1e] px-2 py-0.5 rounded border border-amber-500/20 w-fit">
                        Req: {item.vocation.map(v => VOCATION_NAMES[v]).join('/') || "Qualquer"} Lvl {item.level}+
                      </p>
                    )}
                    <div className="mt-auto pt-3 border-t border-sky-500/10 flex items-center justify-between">
                      <span className="bg-[#080f1e] text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-amber-500/20 shadow-inner">
                        🪙 {item.priceCoins} Coins
                      </span>
                      <button 
                        onClick={() => handleOpenDetails(item)}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded transition-colors cursor-pointer"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: SHOPPING CART SIDEBAR & HISTORY */}
        <div className="space-y-6">
          
          {/* CART VIEW */}
          <div className="bg-[#0c1930] border-2 border-sky-500/40 rounded-2xl p-4 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold text-white font-serif uppercase tracking-wide border-b border-sky-500/20 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-sky-400" /> Carrinho de Compras
              </span>
              {cart.length > 0 && (
                <span className="bg-sky-600 text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {cart.length}
                </span>
              )}
            </h3>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-sky-200/50 font-mono text-xs space-y-1">
                <p>Seu carrinho está vazio.</p>
                <p className="text-[10px] text-sky-300/40">Adicione vantagens e equipamentos para resgatar!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 divide-y divide-sky-500/10">
                  {cart.map((c, idx) => (
                    <div key={`${c.item.id}-${idx}`} className="pt-2.5 text-xs font-mono space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <ShopImage name={c.item.name} src={c.item.spriteUrl} className="w-6 h-6 object-contain" />
                          <span className="font-extrabold text-white line-clamp-1">{c.item.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-rose-400 hover:text-rose-300 p-0.5"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-sky-200 bg-[#080f1e] p-1.5 rounded border border-sky-500/20">
                        <div className="flex flex-col">
                          <span>Destino: <strong className="text-amber-300">{c.character}</strong></span>
                          <span className="text-[8px] text-sky-400/70">{c.world}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleUpdateCartQty(idx, -1)}
                            className="bg-sky-950 text-white font-bold px-1.5 py-0.5 rounded border border-sky-500/30 hover:bg-sky-900 text-xs"
                          >
                            -
                          </button>
                          <span className="font-bold text-white min-w-[12px] text-center">{c.qty}</span>
                          <button
                            onClick={() => handleUpdateCartQty(idx, 1)}
                            className="bg-sky-950 text-white font-bold px-1.5 py-0.5 rounded border border-sky-500/30 hover:bg-sky-900 text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-amber-300 font-bold pt-1">
                        <span>Preço Unitário: {c.item.priceCoins} Coins</span>
                        <span>Total: {c.item.priceCoins * c.qty} Coins</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Total & Checkout buttons */}
                <div className="border-t border-sky-500/20 pt-3.5 space-y-2.5 font-mono">
                  <div className="flex justify-between text-xs font-bold text-sky-200">
                    <span>Total do Carrinho:</span>
                    <span className="text-amber-300">🪙 {totalCartPrice} Coins</span>
                  </div>

                  <button
                    onClick={handleCheckoutCart}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider border border-emerald-500/30 shadow flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" /> Finalizar Compra
                  </button>

                  <button
                    onClick={() => setCart([])}
                    className="w-full bg-transparent hover:bg-sky-500/10 text-sky-300 font-bold text-[10px] py-1.5 rounded uppercase tracking-wider cursor-pointer"
                  >
                    Esvaziar Carrinho
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PURCHASE HISTORY */}
          <div className="bg-[#0c1930] border-2 border-sky-500/40 rounded-2xl p-4 shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-sky-300 font-serif uppercase tracking-wider border-b border-sky-500/20 pb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" /> Histórico
            </h3>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {purchaseHistory.length === 0 ? (
                <p className="text-center py-6 text-sky-300/40 font-mono text-xs">Nenhum resgate registrado nesta sessão.</p>
              ) : (
                purchaseHistory.map((hist) => (
                  <div key={hist.id} className="text-xs font-mono bg-[#080f1e] border border-sky-500/15 p-3 rounded-lg flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 bg-[#0a1224] rounded-md border border-sky-500/25 flex items-center justify-center shrink-0 shadow-inner">
                      <ShopImage name={hist.itemName} src={hist.spriteUrl} className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <strong className="text-white text-xs block leading-snug">{hist.itemName}</strong>
                      <div className="flex flex-wrap justify-between text-sky-200/60 gap-1 text-[11px]">
                        <span>Destino: <strong className="text-sky-300 font-mono">{hist.character}</strong></span>
                        <span className="shrink-0 text-[10px]">{hist.date}</span>
                      </div>
                      <div className="flex flex-wrap justify-between items-center pt-0.5 text-[11px]">
                        <span className="text-[10px] text-sky-400/50">{hist.world}</span>
                        <span className="text-amber-300 font-bold">Resgatado: {hist.price} Coins</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* DETALHES DO ITEM MODAL */}
      {selectedItem && createPortal(
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1224] border-2 border-sky-500/50 w-full max-w-lg rounded-2xl shadow-2xl relative text-white overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#112240] to-[#0d1b32] px-5 py-4 border-b border-sky-500/30 text-sky-100 flex items-center justify-between">
              <span className="font-extrabold text-sm font-serif tracking-wider uppercase flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-400" /> Detalhes do Produto
              </span>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-sky-300 hover:text-white bg-[#080f1e] border border-sky-500/30 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corpo Modal */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              <div className="flex flex-col sm:flex-row gap-5 items-center bg-[#0d1b32] border border-sky-500/20 p-4 rounded-xl">
                {/* Big Sprite Image */}
                <div className="w-32 h-32 bg-[#080f1e] border-2 border-sky-500/30 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <ShopImage name={selectedItem.name} src={selectedItem.spriteUrl} className="w-24 h-24 object-contain" />
                </div>
                
                {/* Core description & Name */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <span className="text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 font-bold px-2.5 py-0.5 rounded-full border border-sky-500/30">
                    {selectedItem.category.toUpperCase()}
                  </span>
                  <h4 className="text-xl font-extrabold text-white font-serif leading-tight">{selectedItem.name}</h4>
                  <p className="text-xs text-sky-200/80 font-serif leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              </div>

              {/* Informações técnicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#0d1b32] border border-sky-500/20 p-3 rounded-lg space-y-2">
                  <h5 className="font-bold font-serif text-sky-300 border-b border-sky-500/10 pb-1 uppercase tracking-wide text-[10px]">
                    Atributos Reais
                  </h5>
                  <ul className="space-y-1 text-sky-200/80">
                    {selectedItem.attributes.map((attr, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✦</span> {attr}
                      </li>
                    ))}
                    {selectedItem.weight > 0 && (
                      <li><span className="text-amber-300">✦</span> Peso: {selectedItem.weight} oz</li>
                    )}
                    {selectedItem.imbuementSlots > 0 && (
                      <li><span className="text-amber-300">✦</span> Slots de Imbuement: {selectedItem.imbuementSlots}</li>
                    )}
                    {selectedItem.hands && (
                      <li><span className="text-amber-300">✦</span> Tipo: {selectedItem.hands}</li>
                    )}
                  </ul>
                </div>

                <div className="bg-[#0d1b32] border border-sky-500/20 p-3 rounded-lg space-y-2">
                  <h5 className="font-bold font-serif text-sky-300 border-b border-sky-500/10 pb-1 uppercase tracking-wide text-[10px]">
                    Requisitos e Restrições
                  </h5>
                  <ul className="space-y-1 text-sky-200/80">
                    <li>
                      <span className="font-bold text-white">Nível Mínimo:</span>{" "}
                      {selectedItem.level > 0 ? `Level ${selectedItem.level}+` : "Sem requerimento"}
                    </li>
                    <li>
                      <span className="font-bold text-white">Vocação:</span>{" "}
                      {selectedItem.vocation.length > 0 
                        ? selectedItem.vocation.map(v => VOCATION_NAMES[v]).join(" / ") 
                        : "Todas as vocações"}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Destinatário da Entrega Form */}
              <div className="bg-[#0d1b32] border-2 border-sky-500/30 p-4 rounded-xl space-y-3">
                <h5 className="font-bold font-serif text-sky-300 border-b border-sky-500/10 pb-1 uppercase tracking-wider text-xs">
                  Informações de Destinatário
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block font-mono">Mundo do Personagem</label>
                    <select
                      value={modalWorld}
                      onChange={(e) => setModalWorld(e.target.value)}
                      className="w-full bg-[#0a1224] border-2 border-sky-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-400 font-mono cursor-pointer"
                    >
                      <option value="Chapadonia PvP-Global">Chapadonia PvP-Global</option>
                      <option value="Chapadonia Non-PvP">Chapadonia Non-PvP</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block font-mono">Nome do Personagem</label>
                    {myCharacters.length > 0 ? (
                      <select
                        value={modalCharacter}
                        onChange={(e) => setModalCharacter(e.target.value)}
                        className="w-full bg-[#0a1224] border-2 border-sky-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-400 font-mono cursor-pointer"
                      >
                        {myCharacters.map((char) => (
                          <option key={char.name} value={char.name}>
                            🛡️ {char.name} (Lvl {char.level})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nome do personagem..."
                        value={modalCharacter}
                        onChange={(e) => setModalCharacter(e.target.value)}
                        className="w-full bg-[#0a1224] border-2 border-sky-500/30 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sky-400 font-serif"
                      />
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="bg-[#112240] px-5 py-4 border-t border-sky-500/30 flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
              <div className="text-xs font-mono font-bold text-sky-200">
                Preço: <span className="text-amber-300 text-sm font-extrabold bg-[#080f1e] border border-amber-500/30 px-2.5 py-1 rounded">🪙 {selectedItem.priceCoins} Coins</span>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => handleAddToCart(selectedItem, 1, modalCharacter, modalWorld)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-sky-900/60 hover:bg-sky-800 text-white font-serif font-extrabold rounded-lg transition-colors text-xs border border-sky-500/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> +Carrinho
                </button>
                <button 
                  onClick={() => handleInstantBuy(selectedItem, modalCharacter, modalWorld)}
                  disabled={coins < selectedItem.priceCoins}
                  className={`flex-1 sm:flex-initial px-5 py-2.5 font-serif font-extrabold rounded-lg transition-colors text-xs cursor-pointer uppercase tracking-wide flex items-center justify-center gap-1.5 shadow ${
                    coins >= selectedItem.priceCoins
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Comprar Já
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
