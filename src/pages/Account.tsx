import React, { useState } from "react";
import { 
  LockKeyhole, LogOut, Users, Coins, CheckCircle2, Copy, Trash, Sparkles, 
  KeyRound, Gift, ArrowRight, ShieldAlert, BadgeCheck, Smartphone, X, AlertTriangle, Mail
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
  onListCharacterOnBazaar: (char: PlayerCharacter, price: number, recoveryKey?: string, isEmailConfirmed?: boolean, isPhoneConfirmed?: boolean) => void;
  onCreateSecondaryChar: (name: string, vocation: string, gender: string) => Promise<boolean>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
  setShowPassModal?: (show: boolean) => void;
  giftCode?: string;
  setGiftCode?: (code: string) => void;
  onRedeemGiftCode?: () => void;
  onDeleteCharacterSuccess?: (updatedCharacters: any[]) => void;
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
  onDeleteCharacterSuccess,
}) => {
  // Local state for password change
  const [showPassModalLocal, setShowPassModalLocal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Local state for Gift Code
  const [localGiftCode, setLocalGiftCode] = useState("");
  const giftCode = propGiftCode !== undefined ? propGiftCode : localGiftCode;
  const setGiftCode = propSetGiftCode !== undefined ? propSetGiftCode : setLocalGiftCode;

  // Local state for secondary character creation
  const [newCharName, setNewCharName] = useState("");
  const [newCharVoc, setNewCharVoc] = useState("Knight");
  const [newCharGen, setNewCharGen] = useState<"Masculino" | "Feminino">("Masculino");

  // Local state for character sell prices
  const [sellPrices, setSellPrices] = useState<Record<string, number>>({});

  // E-mail Confirmation state & modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailCodeInput, setEmailCodeInput] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Phone Confirmation state
  const [confirmedPhones, setConfirmedPhones] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("chapadonia_confirmed_phones");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [phoneInput, setPhoneInput] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Delete Character modal state
  const [deleteCharModal, setDeleteCharModal] = useState<PlayerCharacter | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bazaar Listing Modal state
  const [bazaarModalChar, setBazaarModalChar] = useState<PlayerCharacter | null>(null);
  const [bazaarRkInput, setBazaarRkInput] = useState("");
  const [modalPrice, setModalPrice] = useState(100);

  const userKey = userAccount?.name.toLowerCase() || "";
  const isEmailConfirmed = !!userAccount?.isEmailConfirmed || !!confirmedEmails[userKey];
  const isPhoneConfirmed = !!userAccount?.isPhoneConfirmed || !!confirmedPhones[userKey];
  const isRKActive = !!userAccount?.hasRecoveryKey || !!recoveryKeys[userKey];
  const activeRK = sessionGeneratedKeys[userKey];

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showNotification("Por favor, preencha todos os campos!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification("A nova senha e a confirmação não coincidem!", "error");
      return;
    }

    setPassLoading(true);
    try {
      const token = localStorage.getItem("chapadonia_token") || sessionStorage.getItem("chapadonia_token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || "Erro ao alterar senha.", "error");
      } else {
        showNotification("Senha alterada com sucesso!", "success");
        setShowPassModalLocal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      showNotification("Erro de rede ao alterar senha.", "error");
    } finally {
      setPassLoading(false);
    }
  };

  const handleSendConfirmEmail = async () => {
    setEmailLoading(true);
    try {
      const token = localStorage.getItem("chapadonia_token") || sessionStorage.getItem("chapadonia_token");
      const res = await fetch("/api/auth/send-confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || "Erro ao enviar e-mail de confirmação.", "error");
      } else {
        showNotification(data.message, "success");
      }
    } catch {
      showNotification("Erro de rede ao enviar e-mail.", "error");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailCodeSubmit = async () => {
    if (!emailCodeInput.trim() || emailCodeInput.trim().length !== 6) {
      showNotification("Digite o código de 6 dígitos enviado para seu e-mail!", "error");
      return;
    }
    setEmailLoading(true);
    try {
      const token = localStorage.getItem("chapadonia_token") || sessionStorage.getItem("chapadonia_token");
      const res = await fetch("/api/auth/confirm-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: emailCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || "Erro ao verificar código.", "error");
      } else {
        showNotification("E-mail verificado e confirmado com sucesso!", "success");
        setShowEmailModal(false);
        setEmailCodeInput("");
        onConfirmEmail();
      }
    } catch {
      showNotification("Erro de rede ao verificar e-mail.", "error");
    } finally {
      setEmailLoading(false);
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

  const handleConfirmPhoneSubmit = async () => {
    if (!phoneInput.trim() || phoneInput.trim().length < 8) {
      showNotification("Por favor, digite um número de celular válido com DDD!", "error");
      return;
    }
    setPhoneLoading(true);
    try {
      const token = localStorage.getItem("chapadonia_token") || sessionStorage.getItem("chapadonia_token");
      const res = await fetch("/api/auth/confirm-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: phoneInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || "Erro ao confirmar celular.", "error");
      } else {
        showNotification("Celular confirmado com sucesso!", "success");
        const updated = { ...confirmedPhones, [userKey]: true };
        setConfirmedPhones(updated);
        localStorage.setItem("chapadonia_confirmed_phones", JSON.stringify(updated));
        setShowPhoneModal(false);
        setPhoneInput("");
      }
    } catch {
      showNotification("Erro de rede ao confirmar celular.", "error");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSellPriceChange = (charName: string, delta: number) => {
    const currentPrice = sellPrices[charName] || 100;
    const nextPrice = Math.max(50, currentPrice + delta);
    setSellPrices({ ...sellPrices, [charName]: nextPrice });
  };

  const handleOpenBazaarModal = (char: PlayerCharacter) => {
    const price = sellPrices[char.name] || 100;
    setModalPrice(price);
    setBazaarModalChar(char);
    setBazaarRkInput("");
  };

  const handleBazaarSubmit = () => {
    if (!bazaarModalChar) return;
    if (!isEmailConfirmed) {
      showNotification("Você precisa confirmar seu E-mail antes de anunciar um personagem no Bazar!", "error");
      return;
    }
    if (!isPhoneConfirmed) {
      showNotification("Você precisa confirmar seu Celular antes de anunciar um personagem no Bazar!", "error");
      return;
    }
    if (!isRKActive || !bazaarRkInput.trim()) {
      showNotification("Você precisa digitar sua Recovery Key (RK) para autorizar o anúncio!", "error");
      return;
    }

    onListCharacterOnBazaar(bazaarModalChar, modalPrice, bazaarRkInput, isEmailConfirmed, isPhoneConfirmed);
    setBazaarModalChar(null);
    setBazaarRkInput("");
  };

  const handleDeleteCharSubmit = async () => {
    if (!deleteCharModal) return;
    if (confirmDeleteName !== deleteCharModal.name) {
      showNotification("O nome digitado não coincide com o nome do personagem!", "error");
      return;
    }

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("chapadonia_token") || sessionStorage.getItem("chapadonia_token");
      const res = await fetch("/api/auth/delete-character", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ characterId: (deleteCharModal as any).id, characterName: deleteCharModal.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || "Erro ao deletar personagem.", "error");
      } else {
        showNotification(data.message, "success");
        setDeleteCharModal(null);
        setConfirmDeleteName("");
        if (onDeleteCharacterSuccess) {
          onDeleteCharacterSuccess(data.characters);
        }
      }
    } catch {
      showNotification("Erro de rede ao deletar personagem.", "error");
    } finally {
      setDeleteLoading(false);
    }
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

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl min-h-[500px]">
      
      {/* HEADER DA PÁGINA */}
      <div className="border-b border-sky-500/20 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            <LockKeyhole className="w-7 h-7 text-sky-400" />
            MINHA CONTA
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-1">
            Bem-vindo, <strong className="text-sky-300 font-extrabold">{userAccount?.name}</strong>! Gerencie seus personagens, moedas e segurança.
          </p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-600/20 hover:bg-red-600/40 text-red-200 border border-red-500/30 hover:text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors self-start sm:self-center font-serif"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair da Conta
        </button>
      </div>

      {/* STATS DA CONTA (2 COLUNAS ESPAÇOSAS - SEM CORTES OU VAZAMENTOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Email Card */}
        <div className="bg-gradient-to-b from-[#0e1d38] to-[#081224] border border-sky-500/25 hover:border-sky-400/50 p-4 rounded-xl shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all min-h-[105px]">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            {isEmailConfirmed ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Confirmado
              </span>
            ) : (
              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold font-mono px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 hover:text-white cursor-pointer transition-all shadow shrink-0"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Confirmar E-mail
              </button>
            )}
          </div>
          <div className="mt-3 min-w-0">
            <span className="text-[10px] text-sky-400/70 font-mono uppercase tracking-wider font-bold block mb-0.5">E-mail Cadastrado</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-white font-mono truncate" title={userAccount?.email}>
              {userAccount?.email || "—"}
            </h4>
          </div>
        </div>

        {/* Celular Card */}
        <div className="bg-gradient-to-b from-[#0e1d38] to-[#081224] border border-sky-500/25 hover:border-sky-400/50 p-4 rounded-xl shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all min-h-[105px]">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            {isPhoneConfirmed ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Confirmado
              </span>
            ) : (
              <button
                onClick={() => setShowPhoneModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold font-mono px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 hover:text-white cursor-pointer transition-all shadow shrink-0"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Cadastrar Celular
              </button>
            )}
          </div>
          <div className="mt-3 min-w-0">
            <span className="text-[10px] text-sky-400/70 font-mono uppercase tracking-wider font-bold block mb-0.5">Celular de Segurança</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-white font-mono truncate" title={userAccount?.phone || "Não Cadastrado"}>
              {userAccount?.phone || "Não Cadastrado"}
            </h4>
          </div>
        </div>

        {/* Chapa Coins Card */}
        <div className="bg-gradient-to-b from-[#0e1d38] to-[#081224] border border-amber-500/25 hover:border-amber-400/50 p-4 rounded-xl shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all min-h-[105px]">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
              🪙 Loja do Site
            </span>
          </div>
          <div className="mt-3 min-w-0">
            <span className="text-[10px] text-amber-400/70 font-mono uppercase tracking-wider font-bold block mb-0.5">Saldo em Coins</span>
            <h4 className="text-base sm:text-lg font-extrabold text-amber-400 font-mono truncate">
              {coins.toLocaleString("pt-BR")} <span className="text-xs text-amber-400/80 uppercase font-sans font-bold">Coins</span>
            </h4>
          </div>
        </div>

        {/* RK Card */}
        <div className="bg-gradient-to-b from-[#0e1d38] to-[#081224] border border-sky-500/25 hover:border-sky-400/50 p-4 rounded-xl shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all min-h-[105px]">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            {isRKActive ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> RK Protegida
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
                ⚠ RK Pendente
              </span>
            )}
          </div>
          <div className="mt-3 min-w-0">
            <span className="text-[10px] text-sky-400/70 font-mono uppercase tracking-wider font-bold block mb-0.5">Recovery Key (RK)</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-white font-mono truncate">
              {isRKActive ? "✓ Chave Ativada" : "⚠ Requer E-mail Confirmado"}
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
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block font-serif border-b border-sky-500/10 pb-2 flex items-center justify-between">
              <span>🗡️ Meus Personagens ({myCharacters.length})</span>
            </span>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {myCharacters.length === 0 ? (
                <p className="text-xs text-sky-200/60 font-serif italic py-4 text-center">
                  Você ainda não possui personagens nesta conta. Crie o seu primeiro herói abaixo!
                </p>
              ) : (
                myCharacters.map((char) => {
                  const currentPrice = sellPrices[char.name] || 100;
                  return (
                    <div 
                      key={char.name}
                      className="bg-[#080f1e] border border-sky-500/20 p-3.5 rounded-xl flex flex-col gap-3 shadow-inner hover:border-sky-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0d1b32] rounded-lg border border-sky-500/20 flex items-center justify-center p-1 shrink-0">
                            <img 
                              src={getOutfitImage(char.looktype || 128)} 
                              alt={char.name} 
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

                        {/* Botão de Excluir Personagem */}
                        <button
                          onClick={() => { setDeleteCharModal(char); setConfirmDeleteName(""); }}
                          className="bg-red-500/10 hover:bg-red-600/30 text-red-400 hover:text-white p-2 rounded-lg border border-red-500/20 cursor-pointer transition-colors"
                          title="Deletar Personagem"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
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
                          onClick={() => handleOpenBazaarModal(char)}
                          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[10px] h-8 rounded-lg shadow cursor-pointer transition-all uppercase tracking-wider font-mono flex items-center justify-center border border-sky-500/30 gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
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
                    <option value="Knight">Knight</option>
                    <option value="Sorcerer">Sorcerer</option>
                    <option value="Paladin">Paladin</option>
                    <option value="Druid">Druid</option>
                    <option value="Monk">Monk</option>
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
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-sky-400 block font-mono">Sua Recovery Key Gerada:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#080f1e] border border-amber-500/50 py-2.5 px-3 rounded-lg font-mono text-center text-sm tracking-wider font-extrabold text-amber-400 select-all shadow-inner">
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
                    <div className="bg-amber-500/15 border border-amber-500/30 rounded-lg p-3 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2 shadow-sm">
                      <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-serif font-bold text-amber-300">
                          ⚠️ ATENÇÃO: ENVIADA PARA SEU E-MAIL!
                        </p>
                        <p className="text-[10px] text-amber-200/90 font-sans">
                          Sua RK foi exibida na tela e também enviada com segurança para o e-mail cadastrado (<strong className="text-white">{userAccount?.email}</strong>).
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3.5 text-xs text-emerald-200 font-medium leading-relaxed flex items-start gap-2.5 shadow-sm">
                    <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1">
                      <p className="font-serif font-bold text-emerald-300">
                        ✓ Recovery Key (RK) Ativa e Protegida
                      </p>
                      <p className="text-[11px] font-sans text-emerald-200/90">
                        Sua conta possui uma Recovery Key ativa. Ela foi enviada para o seu e-mail de cadastro verificado e não fica visível publicamente.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {!isEmailConfirmed ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2 shadow-sm">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="font-serif">
                        Você precisa <strong className="text-amber-300">confirmar seu e-mail</strong> antes de poder gerar a sua Recovery Key (RK)!
                      </span>
                    </div>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-[11px] text-red-200 leading-relaxed flex items-start gap-2 shadow-sm">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span className="font-serif">
                        Sua conta ainda não possui uma <strong className="text-red-300">Recovery Key</strong> gerada. Gere sua chave para poder vender personagens no Bazar.
                      </span>
                    </div>
                  )}
                  <button
                    onClick={onGenerateRK}
                    disabled={!isEmailConfirmed}
                    className="w-full bg-gradient-to-b from-sky-400 to-sky-600 hover:from-sky-300 hover:to-sky-500 disabled:opacity-50 text-black font-extrabold text-xs py-2.5 px-4 rounded shadow-md cursor-pointer disabled:cursor-not-allowed transition-all uppercase tracking-wider font-serif flex items-center justify-center gap-1.5 border border-sky-500/30"
                  >
                    🗝️ Gerar Recovery Key (Envia para E-mail)
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL CONFIRMAR E-MAIL (COM CÓDIGO DE 6 DÍGITOS VIA SMTP) */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0c1930] border-2 border-sky-500/40 p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl relative text-white">
            <h3 className="text-lg font-extrabold text-white font-serif border-b border-sky-500/20 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-sky-400" />
                CONFIRMAÇÃO DE E-MAIL
              </span>
              <button onClick={() => setShowEmailModal(false)} className="text-sky-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </h3>

            <p className="text-xs text-sky-200/80 leading-relaxed font-serif">
              Enviaremos um código de verificação de 6 dígitos para o e-mail: <strong className="text-white font-mono">{userAccount?.email}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <button
                type="button"
                onClick={handleSendConfirmEmail}
                disabled={emailLoading}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 px-3 rounded-lg border border-sky-500/30 cursor-pointer uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {emailLoading ? "Enviando E-mail..." : "Enviar Código para meu E-mail"}
              </button>

              <div className="border-t border-sky-500/10 pt-3 space-y-2">
                <label className="block text-sky-200/80 font-serif text-[11px] font-bold">Digite o Código de 6 Dígitos recebido:</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Ex: 123456"
                  value={emailCodeInput}
                  onChange={(e) => setEmailCodeInput(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/30 rounded-lg px-3 py-2 text-center text-sm font-mono tracking-widest text-amber-400 font-extrabold focus:outline-none focus:border-sky-400 shadow-inner"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 bg-[#080f1e] hover:bg-sky-500/10 text-sky-300 font-bold text-xs py-2.5 rounded-lg border border-sky-500/20 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleVerifyEmailCodeSubmit}
                  disabled={emailLoading || emailCodeInput.length !== 6}
                  className="flex-1 bg-gradient-to-b from-sky-400 to-sky-600 hover:from-sky-300 hover:to-sky-500 disabled:opacity-50 text-black font-extrabold text-xs py-2.5 rounded-lg border border-sky-500/30 cursor-pointer uppercase tracking-wider"
                >
                  Confirmar E-mail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ALTERAR SENHA */}
      {showPassModalLocal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0c1930] border-2 border-sky-500/40 p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl relative text-white">
            <h3 className="text-lg font-extrabold text-white font-serif border-b border-sky-500/20 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-sky-400" />
                ALTERAR SENHA
              </span>
              <button onClick={() => setShowPassModalLocal(false)} className="text-sky-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </h3>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3 text-xs">
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
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Confirmar Nova Senha</label>
                <input
                  type="password"
                  placeholder="Digite a nova senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassModalLocal(false)}
                  className="flex-1 bg-[#080f1e] hover:bg-sky-500/10 text-sky-300 font-bold text-xs py-2.5 rounded-lg border border-sky-500/20 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs py-2.5 rounded-lg border border-sky-500/30 cursor-pointer uppercase tracking-wider"
                >
                  {passLoading ? "Salvando..." : "Salvar Senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR CELULAR */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0c1930] border-2 border-sky-500/40 p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl relative text-white">
            <h3 className="text-lg font-extrabold text-white font-serif border-b border-sky-500/20 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-sky-400" />
                CONFIRMAR CELULAR
              </span>
              <button onClick={() => setShowPhoneModal(false)} className="text-sky-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </h3>

            <p className="text-xs text-sky-200/80 leading-relaxed font-serif">
              Insira o número do seu celular com DDD para vinculá-lo e confirmá-lo na sua conta. Esta confirmação é obrigatória para realizar vendas no Bazar.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-sky-200/80 mb-1 font-serif text-[11px] font-bold">Número de Celular com DDD</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="flex-1 bg-[#080f1e] hover:bg-sky-500/10 text-sky-300 font-bold text-xs py-2.5 rounded-lg border border-sky-500/20 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoneSubmit}
                  disabled={phoneLoading}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs py-2.5 rounded-lg border border-sky-500/30 cursor-pointer uppercase tracking-wider"
                >
                  {phoneLoading ? "Salvando..." : "Confirmar Celular"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETAR PERSONAGEM */}
      {deleteCharModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0c1930] border-2 border-red-500/40 p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl relative text-white">
            <h3 className="text-lg font-extrabold text-red-400 font-serif border-b border-red-500/20 pb-2 flex items-center gap-2">
              <Trash className="w-5 h-5 text-red-500" />
              DELETAR PERSONAGEM
            </h3>

            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-red-200 space-y-1">
              <p className="font-serif font-bold text-red-300">⚠️ ATENÇÃO: Esta ação é irreversível!</p>
              <p className="text-[11px] text-red-200/80 leading-relaxed">
                Você está prestes a apagar permanentemente o personagem <strong className="text-white font-bold">{deleteCharModal.name}</strong> (Level {deleteCharModal.level}).
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sky-200/80 font-serif text-xs font-bold">
                Digite "<span className="text-white font-mono">{deleteCharModal.name}</span>" para confirmar:
              </label>
              <input 
                type="text"
                placeholder={deleteCharModal.name}
                value={confirmDeleteName}
                onChange={(e) => setConfirmDeleteName(e.target.value)}
                className="w-full bg-[#080f1e] border border-red-500/30 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setDeleteCharModal(null); setConfirmDeleteName(""); }}
                className="flex-1 bg-[#080f1e] hover:bg-sky-500/10 text-sky-300 font-bold text-xs py-2.5 rounded-lg border border-sky-500/20 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCharSubmit}
                disabled={confirmDeleteName !== deleteCharModal.name || deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 rounded-lg border border-red-500/30 cursor-pointer uppercase tracking-wider"
              >
                {deleteLoading ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ANUNCIAR NO BAZAR (COM REQUISITOS E RECOVERY KEY) */}
      {bazaarModalChar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0c1930] border-2 border-sky-500/40 p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl relative text-white">
            <h3 className="text-lg font-extrabold text-white font-serif border-b border-sky-500/20 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                ANUNCIAR NO BAZAR DE PERSONAGENS
              </span>
              <button onClick={() => setBazaarModalChar(null)} className="text-sky-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </h3>

            <div className="bg-[#080f1e] p-3 rounded-lg border border-sky-500/20 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0d1b32] rounded-lg border border-sky-500/20 flex items-center justify-center p-1 shrink-0">
                <img src={getOutfitImage(bazaarModalChar.looktype || 128)} alt="" className="max-w-full max-h-full object-contain" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">{bazaarModalChar.name}</h4>
                <p className="text-xs text-sky-300 font-mono">Level {bazaarModalChar.level} — {bazaarModalChar.vocation}</p>
              </div>
            </div>

            {/* CHECKLIST DE REQUISITOS OBRIGATÓRIOS */}
            <div className="space-y-2 bg-[#080f1e]/80 p-3 rounded-lg border border-sky-500/10 text-xs">
              <span className="font-serif font-bold text-sky-300 block mb-1 uppercase tracking-wider text-[10px]">Requisitos de Segurança Obrigatórios:</span>
              <div className="flex items-center justify-between text-[11px]">
                <span>1. E-mail de cadastro confirmado:</span>
                {isEmailConfirmed ? (
                  <span className="text-emerald-400 font-bold font-mono">✓ Confirmado</span>
                ) : (
                  <span className="text-red-400 font-bold font-mono">⚠ Não Confirmado</span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>2. Celular com DDD confirmado:</span>
                {isPhoneConfirmed ? (
                  <span className="text-emerald-400 font-bold font-mono">✓ Confirmado</span>
                ) : (
                  <span className="text-red-400 font-bold font-mono">⚠ Não Confirmado</span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>3. Chave de Recuperação (RK) ativa:</span>
                {isRKActive ? (
                  <span className="text-emerald-400 font-bold font-mono">✓ RK Ativa</span>
                ) : (
                  <span className="text-red-400 font-bold font-mono">⚠ RK Pendente</span>
                )}
              </div>
            </div>

            {/* PREÇO E AVISO DA TAXA DE 10% */}
            <div className="space-y-2">
              <label className="block text-sky-200/80 font-serif text-xs font-bold">Preço de Venda (Mínimo: 50 Coins)</label>
              <input 
                type="number"
                min="50"
                value={modalPrice}
                onChange={(e) => setModalPrice(Math.max(50, parseInt(e.target.value) || 50))}
                className="w-full bg-[#080f1e] border border-sky-500/20 rounded-lg px-3 py-2 text-sm text-amber-400 font-mono font-extrabold focus:outline-none focus:border-sky-400"
              />

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-[11px] text-amber-200 space-y-1">
                <p className="font-serif font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  Taxa de Anúncio do Bazar (10%): {Math.ceil(modalPrice * 0.1)} Coins
                </p>
                <p className="text-[10px] text-amber-200/90 leading-relaxed font-sans">
                  É cobrada uma taxa administrativa de <strong>10% ({Math.ceil(modalPrice * 0.1)} Coins)</strong> debitada do seu saldo no momento do anúncio.
                </p>
              </div>
            </div>

            {/* AUTENTICAÇÃO COM RECOVERY KEY */}
            <div className="space-y-1">
              <label className="block text-sky-200/80 font-serif text-xs font-bold">Digite sua Recovery Key (RK) para autorizar:</label>
              <input 
                type="text"
                placeholder="Ex: XXXX-YYYY-ZZZZ-WWWW"
                value={bazaarRkInput}
                onChange={(e) => setBazaarRkInput(e.target.value)}
                className="w-full bg-[#080f1e] border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono uppercase focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBazaarModalChar(null)}
                className="flex-1 bg-[#080f1e] hover:bg-sky-500/10 text-sky-300 font-bold text-xs py-2.5 rounded-lg border border-sky-500/20 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleBazaarSubmit}
                disabled={!isEmailConfirmed || !isPhoneConfirmed || !isRKActive || !bazaarRkInput.trim()}
                className="flex-1 bg-gradient-to-b from-sky-400 to-sky-600 hover:from-sky-300 hover:to-sky-500 disabled:opacity-50 text-black font-extrabold text-xs py-2.5 rounded-lg border border-sky-500/30 cursor-pointer uppercase tracking-wider"
              >
                Confirmar Anúncio
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
