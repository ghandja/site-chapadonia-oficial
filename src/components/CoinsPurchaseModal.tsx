import React, { useState } from "react";
import { X, Sparkles, Coins, QrCode, Copy, Check, ShieldCheck, Zap } from "lucide-react";

interface CoinsPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
  onSuccessAddCoins?: (amount: number) => void;
}

const PRESET_PACKAGES = [
  { coins: 250, price: 25, bonus: 0, tag: "Básico" },
  { coins: 500, price: 50, bonus: 25, tag: "+5% Bônus" },
  { coins: 1000, price: 100, bonus: 100, tag: "Mais Popular (+10%)", popular: true },
  { coins: 2500, price: 250, bonus: 350, tag: "Super Bônus (+14%)" },
  { coins: 5000, price: 500, bonus: 1000, tag: "Combo Supremo (+20%)" }
];

export const CoinsPurchaseModal: React.FC<CoinsPurchaseModalProps> = ({
  isOpen,
  onClose,
  showNotification,
  onSuccessAddCoins
}) => {
  const [selectedCoins, setSelectedCoins] = useState<number>(1000);
  const [customCoins, setCustomCoins] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [pixGenerated, setPixGenerated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Rate: R$ 1,00 = 10 Coins (R$ 0,10 por Coin)
  const COIN_PRICE_BRL = 0.10;

  const currentCoins = isCustomMode ? (parseInt(customCoins) || 0) : selectedCoins;
  const totalPriceBrl = (currentCoins * COIN_PRICE_BRL).toFixed(2);

  const handleSelectPreset = (coins: number) => {
    setIsCustomMode(false);
    setSelectedCoins(coins);
    setPixGenerated(false);
  };

  const handleCustomChange = (val: string) => {
    const num = val.replace(/\D/g, "");
    setCustomCoins(num);
    setIsCustomMode(true);
    setPixGenerated(false);
  };

  const handleGeneratePix = () => {
    if (currentCoins <= 0) {
      showNotification("Por favor, selecione ou digite uma quantidade de coins válida!", "error");
      return;
    }
    setPixGenerated(true);
    showNotification(`QR Code PIX gerado com sucesso para ${currentCoins} Coins (R$ ${totalPriceBrl})!`, "success");
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText("victorhgos@gmail.com");
    setCopied(true);
    showNotification("Chave PIX (victorhgos@gmail.com) copiada para a área de transferência!", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimulatePayment = () => {
    if (onSuccessAddCoins) {
      onSuccessAddCoins(currentCoins);
    }
    showNotification(`Pagamento Aprovado! +${currentCoins} Coins creditados na sua conta!`, "success");
    onClose();
    setPixGenerated(false);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c1930] border-2 border-sky-500/40 rounded-2xl max-w-xl w-full text-white shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Header Bar estilo RubinOT */}
        <div className="bg-gradient-to-r from-amber-700/80 via-amber-900/90 to-amber-700/80 p-4 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-300 animate-pulse" />
            <h3 className="text-base font-extrabold font-serif text-white uppercase tracking-wider">
              Adquirir Coins (Tibia Coins)
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-amber-200/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

          {/* 1. SELEÇÃO DE PACOTES DE COINS */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-sky-300 font-serif uppercase tracking-wider block">
              1. Selecione o Pacote de Coins
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_PACKAGES.map((pkg) => {
                const isSelected = !isCustomMode && selectedCoins === pkg.coins;
                return (
                  <button
                    key={pkg.coins}
                    onClick={() => handleSelectPreset(pkg.coins)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-sky-950/90 border-amber-400 shadow-lg shadow-sky-500/10 ring-2 ring-amber-400/40"
                        : "bg-[#080f1e] border-sky-500/20 hover:border-sky-400/60"
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow uppercase">
                        Popular
                      </span>
                    )}
                    <div>
                      <span className="text-base font-black text-amber-300 font-mono block">
                        🪙 {pkg.coins} <span className="text-[10px] text-amber-400 font-normal">Coins</span>
                      </span>
                      {pkg.bonus > 0 && (
                        <span className="text-[9px] text-emerald-400 font-mono font-bold block">
                          +{pkg.bonus} bônus grátis
                        </span>
                      )}
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-sky-500/10 flex justify-between items-center text-xs font-mono">
                      <span className="text-sky-300">Valor:</span>
                      <strong className="text-white font-extrabold">R$ {pkg.price},00</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. QUANTIDADE PERSONALIZADA (VALOR LIVRE) */}
          <div className="space-y-2 bg-[#080f1e] p-3.5 rounded-xl border border-sky-500/15">
            <span className="text-xs font-bold text-sky-300 font-serif uppercase tracking-wider block">
              Ou Digite a Quantidade Desejada (Valor Livre)
            </span>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customCoins}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="Ex: 750 Coins..."
                  className="w-full bg-[#0c1930] border border-sky-500/30 rounded-lg pl-3 pr-16 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400 placeholder:text-sky-200/30"
                />
                <span className="absolute right-3 top-2 text-xs text-sky-300 font-mono">Coins</span>
              </div>
              <div className="text-right text-xs font-mono shrink-0">
                <span className="text-sky-300 block text-[10px]">Total a Pagar:</span>
                <strong className="text-emerald-400 text-sm font-extrabold">R$ {totalPriceBrl}</strong>
              </div>
            </div>
          </div>

          {/* 3. RESUMO DA COMPRA & PIX GENERATION */}
          {!pixGenerated ? (
            <div className="space-y-4 pt-2">
              <div className="bg-[#0c1930] border border-amber-500/30 p-4 rounded-xl flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-sky-300 block text-[10px]">Resumo do Pedido:</span>
                  <strong className="text-white text-sm font-extrabold font-serif">
                    🪙 {currentCoins} Tibia Coins
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-sky-300 block text-[10px]">Pagamento via PIX:</span>
                  <strong className="text-emerald-400 text-base font-extrabold">
                    R$ {totalPriceBrl}
                  </strong>
                </div>
              </div>

              <button
                onClick={handleGeneratePix}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold py-3.5 rounded-xl shadow-lg cursor-pointer transition-all uppercase tracking-wider font-serif text-xs flex items-center justify-center gap-2 border border-emerald-400/30"
              >
                <Zap className="w-4 h-4 text-amber-300" /> Gerar QR Code PIX (R$ {totalPriceBrl})
              </button>
            </div>
          ) : (
            /* TELA DO PIX GERADO COM QR CODE & COPIA E COLA */
            <div className="space-y-4 pt-2 bg-[#080f1e] p-5 rounded-xl border border-emerald-500/30 animate-in fade-in">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> PIX Gerado com Sucesso!
                </span>
                <p className="text-[11px] text-sky-200/80 font-mono">
                  Escaneie o QR Code ou use a chave Copia e Cola para pagar <strong>R$ {totalPriceBrl}</strong> por <strong>{currentCoins} Coins</strong>.
                </p>
              </div>

              {/* QR Code Oficial da sua Chave */}
              <div className="bg-white p-3 rounded-xl max-w-[170px] mx-auto shadow-xl border-4 border-emerald-500/40 text-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=Chave%20PIX:%20victorhgos@gmail.com%20-%20Valor:%20R$%20${totalPriceBrl}`} 
                  alt="QR Code PIX victorhgos@gmail.com" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Exibição Clara da Chave PIX */}
              <div className="bg-[#0c1930] p-3 rounded-xl border border-sky-500/20 text-center space-y-1">
                <span className="text-[10px] text-sky-300 font-mono block">Chave PIX E-mail:</span>
                <strong className="text-amber-300 text-xs font-mono select-all font-bold">victorhgos@gmail.com</strong>
              </div>

              {/* Botões Copiar e Simular Aprovação */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCopyPix}
                  className="w-full bg-sky-950/80 hover:bg-sky-900 text-sky-200 font-mono font-bold py-2.5 px-3 rounded-lg border border-sky-500/30 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
                  <span>{copied ? "Chave PIX Copiada!" : "Copiar Chave: victorhgos@gmail.com"}</span>
                </button>

                <button
                  onClick={handleSimulatePayment}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3 rounded-lg shadow-md cursor-pointer transition-all uppercase tracking-wider font-serif text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-black" /> Simular Pagamento Aprovado (+{currentCoins} Coins)
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
