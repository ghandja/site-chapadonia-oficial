import React, { useState } from "react";
import { 
  LockKeyhole, LogOut, Users, Coins, CheckCircle2, Copy, Trash, Sparkles, 
  KeyRound, Gift, ArrowRight, ShieldAlert, BadgeCheck
} from "lucide-react";
import { AccountInfo, PlayerCharacter } from "../types";
import { getOutfitImage } from "../utils";

interface AccountProps {
  userAccount: AccountInfo["account"] | null;
  myCharacters: PlayerCharacter[];
  onLogout: () => void;
  coins: number;
  confirmedEmails: Record<string, boolean>;
  onConfirmEmail: () => void;
  recoveryKeys: Record<string, boolean>;
  sessionGeneratedKeys: Record<string, string>;
  onGenerateRK: () => void;
  onListCharacterOnBazaar: (char: PlayerCharacter, price: number) => void;
  onCreateSecondaryChar: (name: string, vocation: string, gender: string) => Promise<boolean>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
  setShowPassModal?: (show: boolean) => void;
  giftCode?: string;
  setGiftCode?: (code: string) => void;
  onRedeemGiftCode?: () => void;
}

export const Account: React.FC<AccountProps> = ({
  userAccount,
  myCharacters,
  onLogout,
  coins,
  confirmedEmails,
  onConfirmEmail,
  recoveryKeys,
  sessionGeneratedKeys,
  onGenerateRK,
  onListCharacterOnBazaar,
  onCreateSecondaryChar,
  showNotification,
  setShowPassModal,
  giftCode: propGiftCode,
  setGiftCode: propSetGiftCode,
  onRedeemGiftCode,
}) => {
  // Local state for password change
  const [showPassModalLocal, setShowPassModalLocal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Local state for gift code fallback
  const [localGiftCode, setLocalGiftCode] = useState("");
  const giftCode = propGiftCode !== undefined ? propGiftCode : localGiftCode;
  const setGiftCode = propSetGiftCode !== undefined ? propSetGiftCode : setLocalGiftCode;

  // Local state for secondary character creation
  const [newCharName, setNewCharName] = useState("");
  const [newCharVoc, setNewCharVoc] = useState("Elite Knight");
  const [newCharGen, setNewCharGen] = useState<"Masculino" | "Feminino">("Masculino");

  // Local state for character sell prices
  const [sellPrices, setSellPrices] = useState<Record<string, number>>({});

  const handleChangePasswordSubmit = async () => {
    if (!newPassword) {
      showNotification("Nova senha é obrigatória!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification("As senhas não coincidem!", "error");
      return;
    }

    setPassLoading(true);
    try {
      const token = localStorage.getItem("chapadonia_token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification("Senha alterada com sucesso!", "success");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPassModalLocal(false);
      } else {
        showNotification(data.message || "Erro ao alterar senha.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Erro de rede ao alterar senha.", "error");
    } finally {
      setPassLoading(false);
    }
  };

  const handleLocalRedeemGiftCode = () => {
    if (onRedeemGiftCode) {
      onRedeemGiftCode();
    } else {
      if (!giftCode.trim()) {
        showNotification("Por favor, insira um código!", "error");
        return;
      }
      showNotification(`Código promocional "${giftCode}" resgatado com sucesso!`, "success");
      setGiftCode("");
    }
  };

  const handleSellPriceChange = (charName: string, delta: number) => {
    const currentPrice = sellPrices[charName] || 100;
    const nextPrice = Math.max(50, currentPrice + delta);
    setSellPrices({ ...sellPrices, [charName]: nextPrice });
  };

  const handleCharacterSell = (char: PlayerCharacter) => {
    const price = sellPrices[char.name] || 100;
    onListCharacterOnBazaar(char, price);
  };

  const handleCreateCharSubmit = async () => {
    if (!newCharName.trim()) {
      showNotification("Por favor, digite o nome do personagem!", "error");
      return;
    }
    const success = await onCreateSecondaryChar(newCharName, newCharVoc, newCharGen);
    if (success) {
      setNewCharName("");
    }
  };

  const userKey = userAccount?.name.toLowerCase() || "";
  const isEmailConfirmed = confirmedEmails[userKey];
  const isRKActive = recoveryKeys[userKey];
  const activeRK = sessionGeneratedKeys[userKey];

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER DA PÁGINA */}
      <div className="border-b border-sky-500/20 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            <LockKeyhole className="w-7 h-7 text-sky-400" />
            MINHA CONTA
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-1">
            Bem-vindo, <strong className="text-sky-300 font-extrabold">{userAccount?.name}</strong>! Gerencie personagens, segurança e moedas.
          </p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-600/20 hover:bg-red-600/40 text-red-200 border border-red-500/30 hover:text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors self-start sm:self-center font-serif"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair da Conta
        </button>
      </div>

      {/* STATS DA CONTA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Email Widget */}
        <div className="bg-[#0c1930] border border-sky-500/20 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-sky-400/80 uppercase font-bold font-mono block">E-mail</span>
            <h4 className="text-xs font-extrabold text-white font-serif truncate" title={userAccount?.email}>
              {userAccount?.email}
            </h4>
            <div className="mt-1 flex items-center gap-1.5">
              {isEmailConfirmed ? (
                <span className="text-[9px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold font-mono uppercase flex items-center gap-0.5">
                  ✓ Confirmado
                </span>
              ) : (
                <button 
                  onClick={onConfirmEmail}
                  className="text-[8px] whitespace-nowrap text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600/30 border border-red-500/30 px-1.5 py-0.5 rounded font-bold font-mono uppercase cursor-pointer transition-colors"
                >
                  ⚠ Confirmar E-mail
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chapa Coins Widget */}
        <div className="bg-[#0c1930] border border-sky-500/20 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-sky-400/80 uppercase font-bold font-mono block">Saldo da Loja</span>
            <h4 className="text-xs font-extrabold text-amber-400 font-mono flex items-center gap-1 whitespace-nowrap">
              🪙 {coins} Coins
            </h4>
          </div>
        </div>

        {/* Security Widget */}
        <div className="bg-[#0c1930] border border-sky-500/20 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-sky-400/80 uppercase font-bold font-mono block">Segurança RK</span>
            <h4 className="text-xs font-extrabold font-serif mt-0.5">
              {isRKActive ? (
                <span className="text-emerald-400 font-bold">✓ RK Ativa</span>
              ) : (
                <span className="text-rose-400 font-bold">⚠ RK Pendente</span>
              )}
            </h4>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (GRID 2 COLUNAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COLUNA ESQUERDA: PERSONAGENS & CRIAÇÃO */}
        <div className="space-y-6">
          
          {/* Meus Personagens */}
          <div className="bg-[#0c1930] border border-sky-500/20 p-5 rounded-xl space-y-4 shadow-lg">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block font-serif border-b border-sky-500/10 pb-2 flex items-center gap-1.5">
              👥 Personagens da Conta
            </span>
            
            {userAccount && (!isEmailConfirmed || !isRKActive) && (
              <div className="bg-[#080f1e] border border-sky-500/20 rounded-lg p-3.5 text-[11px] text-sky-100 leading-relaxed space-y-1.5 shadow-inner">
                <p className="font-extrabold flex items-center gap-1.5 text-amber-300">
                  <span>🔒 Requisitos para Vender no Bazar:</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[10px]">
                  <li className={isEmailConfirmed ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {isEmailConfirmed ? "✓ E-mail confirmado" : "✗ Confirmar e-mail da conta (no topo)"}
                  </li>
                  <li className={isRKActive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {isRKActive ? "✓ Recovery Key ativa" : "✗ Gerar Recovery Key (no bloco ao lado)"}
                  </li>
                </ul>
              </div>
            )}
            
            <div className="space-y-3">
              {myCharacters.length === 0 ? (
                <p className="text-center text-xs text-sky-200/60 font-mono py-4">Nenhum personagem na conta.</p>
              ) : (
                myCharacters.map((char) => {
                  const currentPrice = sellPrices[char.name] || 100;
                  return (
                    <div key={char.name} className="bg-[#080f1e]/40 border border-sky-500/10 rounded-xl p-4 flex flex-col gap-3 hover:border-sky-500/30 transition-all duration-200">
                      {/* Info Básica */}
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-[#080f1e] rounded-xl border border-amber-500/40 flex items-center justify-center overflow-hidden shadow-inner relative shrink-0 p-1">
                          <img 
                            src={getOutfitImage(char.looktype || 128)} 
                            alt="" 
                            className="max-w-full max-h-full object-contain filter drop-shadow-md" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                            {char.name}
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          </h4>
                          <p className="text-[11px] text-sky-200/80 font-mono mt-0.5">
                            Level {char.level} — <span className="font-sans font-bold text-amber-300">{char.vocation}</span>
                          </p>
                        </div>
                      </div>

                      {/* Configuração de Venda do Bazar */}
                      <div className="flex flex-col gap-2 border-t border-sky-500/10 pt-3">
                        <div className="flex flex-col gap-1 w-full">
                          <span className="text-sky-300/80 uppercase font-bold text-[9px] font-mono block">Definir preço para o Bazar:</span>
                          <div className="w-full flex items-center justify-between bg-[#080f1e] border border-sky-500/30 rounded-lg p-1 h-9">
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSellPriceChange(char.name, -100)}
                                className="bg-[#0d1b32] hover:bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold w-8 h-7 rounded border border-sky-500/30 cursor-pointer"
                                title="Diminuir 100"
                              >
                                -100
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSellPriceChange(char.name, -25)}
                                className="bg-[#0d1b32] hover:bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold w-7 h-7 rounded border border-sky-500/30 cursor-pointer"
                                title="Diminuir 25"
                              >
                                -25
                              </button>
                            </div>

                            <div className="flex-1 flex items-center justify-center gap-1 font-mono font-extrabold text-[11px] text-amber-400">
                              <span>{currentPrice}</span>
                              <span className="text-[8px] text-amber-500 font-bold uppercase">Coins</span>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSellPriceChange(char.name, 25)}
                                className="bg-[#0d1b32] hover:bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold w-7 h-7 rounded border border-sky-500/30 cursor-pointer"
                                title="Aumentar 25"
                              >
                                +25
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSellPriceChange(char.name, 100)}
                                className="bg-[#0d1b32] hover:bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold w-8 h-7 rounded border border-sky-500/30 cursor-pointer"
                                title="Aumentar 100"
                              >
                                +100
                              </button>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleCharacterSell(char)}
                          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[10px] h-8 rounded-lg shadow cursor-pointer transition-all uppercase tracking-wider font-mono flex items-center justify-center border border-sky-500/30"
                        >
                          Anunciar no Bazar de Personagens
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Criar Personagem */}
          <div className="bg-[#0c1930] border border-sky-500/20 p-5 rounded-xl space-y-4 shadow-lg">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block font-serif border-b border-sky-500/10 pb-2 flex items-center gap-1.5">
              🧙‍♂️ Criar Novo Personagem
            </span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Nome do Personagem</label>
                <input 
                  type="text" 
                  placeholder="Ex: Chapadonia Knight"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Vocação</label>
                  <select 
                    value={newCharVoc}
                    onChange={(e) => setNewCharVoc(e.target.value)}
                    className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-xs text-sky-300 focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="Elite Knight">Knight</option>
                    <option value="Master Sorcerer">Sorcerer</option>
                    <option value="Royal Paladin">Paladin</option>
                    <option value="Elder Druid">Druid</option>
                    <option value="Exalted Monk">Monk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Gênero</label>
                  <select 
                    value={newCharGen}
                    onChange={(e) => setNewCharGen(e.target.value as any)}
                    className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-xs text-sky-300 focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="Masculino">Homem</option>
                    <option value="Feminino">Mulher</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateCharSubmit}
                className="w-full bg-gradient-to-b from-sky-400 to-sky-600 hover:from-sky-300 hover:to-sky-500 text-black font-extrabold text-xs py-2.5 px-4 rounded shadow-md cursor-pointer transition-all uppercase tracking-wider font-serif flex items-center justify-center border border-sky-500/30 h-10"
              >
                <Sparkles className="w-4 h-4 text-black mr-1.5 animate-pulse" />
                Criar Novo Personagem
              </button>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: MOEDAS & RECOVERY KEY */}
        <div className="space-y-6">
          
          {/* Resgatar Moedas */}
          <div className="bg-[#0c1930] border border-sky-500/20 p-5 rounded-xl space-y-4 shadow-lg">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block font-serif border-b border-sky-500/10 pb-2 flex items-center gap-1">
              <Gift className="w-4 h-4 text-amber-400 animate-pulse" />
              Resgatar Gift Code (Código Promocional)
            </span>
            
            <p className="text-[11px] text-sky-200/80 leading-relaxed font-serif">
              Resgate moedas extras de eventos inserindo cupons de presente ativos para gastar na Loja do site.
            </p>
 
            <div className="flex flex-col gap-2.5">
              <input 
                type="text" 
                placeholder="Ex: CHAPADONIA2026"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
                className="w-full h-9 bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 text-xs text-white font-mono uppercase focus:outline-none focus:border-sky-400 shadow-inner"
              />
              <button
                onClick={handleLocalRedeemGiftCode}
                className="w-full h-9 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-[11px] cursor-pointer transition-all flex items-center justify-center font-serif uppercase tracking-wider border border-sky-500/30 shadow-md"
              >
                Resgatar Código
              </button>
            </div>
          </div>
 
          {/* Segurança da Conta */}
          <div className="bg-[#0c1930] border border-sky-500/20 p-5 rounded-xl space-y-4 shadow-lg">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block font-serif border-b border-sky-500/10 pb-2 flex items-center gap-1.5">
              🗝️ Alteração de Senha
            </span>
            
            <p className="text-[11px] text-sky-200/80 leading-relaxed font-serif">
              Precisa alterar sua senha secreta do jogo? Atualize sua chave de segurança imediatamente.
            </p>
 
            <button
              onClick={() => setShowPassModalLocal(true)}
              className="w-full bg-[#080f1e] hover:bg-sky-500/10 text-sky-300 font-semibold text-xs py-2.5 rounded border border-sky-500/20 cursor-pointer transition-colors uppercase tracking-wider font-serif"
            >
              🔐 Modificar Senha da Conta
            </button>
          </div>
 
          {/* Recovery Key (RK) */}
          <div className="bg-[#0c1930] border border-sky-500/20 p-5 rounded-xl space-y-4 shadow-lg">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block font-serif border-b border-sky-500/10 pb-2 flex items-center gap-1.5">
              🗝️ Chave de Recuperação (Recovery Key)
            </span>
            
            <div className="space-y-3">
              {isRKActive ? (
                activeRK ? (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-sky-400 block font-mono">Sua Recovery Key Gerada:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#080f1e] border border-sky-500/30 py-2.5 px-3 rounded-lg font-mono text-center text-sm tracking-wider font-extrabold text-amber-400 select-all [text-shadow:1px_1px_0_#000]">
                        {activeRK}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeRK);
                          showNotification("Recovery Key copiada!", "success");
                        }}
                        className="h-9 w-9 bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0 border border-sky-500/30"
                        title="Copiar Key"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2 shadow-sm">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="font-serif">
                        Esta chave já foi gerada e está vinculada à sua conta. Guarde-a em um local seguro de sua casa. <strong className="text-white">Ela só pode ser gerada uma única vez!</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-[11px] text-emerald-200 font-bold leading-relaxed flex items-start gap-2 shadow-sm">
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                    <span className="font-serif">
                      Sua conta possui uma <strong className="text-emerald-300">Recovery Key</strong> ativa e protegida contra invasões. Por motivos de segurança, ela não pode ser exibida novamente.
                    </span>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-[11px] text-red-200 leading-relaxed flex items-start gap-2 shadow-sm">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="font-serif">
                      Sua conta ainda não possui uma <strong className="text-red-300">Recovery Key</strong> gerada. Recomendamos fortemente a criação desta chave agora para garantir a segurança da sua conta e poder vender no Bazar.
                    </span>
                  </div>
                  <button
                    onClick={onGenerateRK}
                    className="w-full bg-gradient-to-b from-sky-400 to-sky-600 hover:from-sky-300 hover:to-sky-500 text-black font-extrabold text-xs py-2.5 px-4 rounded shadow-md cursor-pointer transition-all uppercase tracking-wider font-serif flex items-center justify-center gap-1.5 border border-sky-500/30"
                  >
                    🗝️ Gerar Recovery Key (Única Vez)
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* LOCAL CHANGE PASSWORD MODAL */}
      {showPassModalLocal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0c1930] border-2 border-sky-500/40 p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl relative text-white">
            <h3 className="text-lg font-extrabold text-white font-serif border-b border-sky-500/20 pb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-sky-400" />
              ALTERAR SENHA
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Senha Atual</label>
                <input
                  type="password"
                  placeholder="Sua senha atual"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Nova Senha</label>
                <input
                  type="password"
                  placeholder="Nova senha secreta"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Confirmar Nova Senha</label>
                <input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPassModalLocal(false)}
                className="flex-1 bg-transparent hover:bg-white/5 text-sky-300 font-bold py-2 rounded-lg text-xs cursor-pointer border border-sky-500/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleChangePasswordSubmit}
                disabled={passLoading}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-lg text-xs cursor-pointer transition-colors shadow flex items-center justify-center gap-1.5 border border-sky-500/30"
              >
                {passLoading ? "Salvando..." : "Salvar Senha"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
