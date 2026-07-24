import React, { useState } from "react";
import { KeyRound, Mail, ShieldAlert, X } from "lucide-react";

interface AccountRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export const AccountRecoveryModal: React.FC<AccountRecoveryModalProps> = ({
  isOpen,
  onClose,
  showNotification,
}) => {
  const [email, setEmail] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !recoveryKey || !newPassword) {
      showNotification("Por favor, preencha todos os campos!", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("As senhas não coincidem!", "error");
      return;
    }

    if (newPassword.length < 6) {
      showNotification("A nova senha deve ter pelo menos 6 caracteres!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/recover-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          recoveryKey: recoveryKey.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification(data.message || "Conta recuperada com sucesso!", "success");
        setEmail("");
        setRecoveryKey("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      } else {
        showNotification(data.message || "Erro ao recuperar conta.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Erro de conexão ao tentar recuperar conta.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-[#0c1930] border-2 border-sky-500/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl relative text-white">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sky-300 hover:text-white transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-sky-500/20 pb-3">
          <h3 className="text-xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-amber-400" />
            RECUPERAR CONTA (RECOVERY KEY)
          </h3>
          <p className="text-xs text-sky-200/80 font-mono mt-1">
            Informe seu e-mail, a chave de recuperação (RK) e defina sua nova senha.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Caso tenha esquecido sua senha, use a sua <strong>Recovery Key (RK)</strong> que foi enviada para o seu e-mail no ato da geração.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-sky-200/80 mb-1 font-serif font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              E-mail da Conta
            </label>
            <input
              type="email"
              required
              placeholder="seu_email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#080f1e] border border-sky-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner text-xs"
            />
          </div>

          <div>
            <label className="block text-sky-200/80 mb-1 font-serif font-bold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Chave de Recuperação (Recovery Key)
            </label>
            <input
              type="text"
              required
              placeholder="Ex: XXXX-XXXX-XXXX-XXXX"
              value={recoveryKey}
              onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
              className="w-full bg-[#080f1e] border border-sky-500/30 rounded-lg px-3 py-2 text-amber-300 font-extrabold focus:outline-none focus:border-sky-400 font-mono tracking-wider text-xs shadow-inner uppercase"
            />
          </div>

          <div>
            <label className="block text-sky-200/80 mb-1 font-serif font-bold">Nova Senha</label>
            <input
              type="password"
              required
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#080f1e] border border-sky-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner text-xs"
            />
          </div>

          <div>
            <label className="block text-sky-200/80 mb-1 font-serif font-bold">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#080f1e] border border-sky-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono shadow-inner text-xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-sky-500/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent hover:bg-white/5 text-sky-300 font-bold py-2 rounded-lg text-xs cursor-pointer border border-sky-500/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-lg text-xs cursor-pointer transition-colors shadow flex items-center justify-center gap-1.5 border border-sky-500/30 disabled:opacity-50"
            >
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
