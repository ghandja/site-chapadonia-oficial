import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, KeyRound, AlertCircle, ShieldAlert } from "lucide-react";
import { api } from "../api";
import { getVocationName } from "../utils";
import { AccountRecoveryModal } from "../components/AccountRecoveryModal";

interface LoginProps {
  onLoginSuccess: (account: any, token: string, characters: any[]) => void;
  setCurrentSitePage?: (page: any) => void;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  setCurrentSitePage,
  showNotification,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification("Por favor, digite o e-mail e a senha!", "error");
      return;
    }
    if (!email.includes("@")) {
      showNotification("Por favor, digite um e-mail válido!", "error");
      return;
    }
    if (password.length < 6) {
      showNotification("A senha deve conter pelo menos 6 caracteres!", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(email, password);
      
      const mappedMyChars = (data.characters || []).map((c: any) => ({
        name: c.name,
        vocation: getVocationName(c.vocation),
        level: c.level,
        gender: c.sex === 1 ? "Masculino" : "Feminino",
        skills: { main: 50, shield: 50 },
        online: false,
        premium: true
      }));

      onLoginSuccess(data.account, data.token, mappedMyChars);
      showNotification("Bem-vindo de volta! Acesso concedido!", "success");
      navigate("/account");
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Erro ao conectar ao servidor de autenticação!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    if (setCurrentSitePage) {
      setCurrentSitePage("register");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px] flex flex-col justify-center items-center">
      <div className="w-full max-w-md space-y-6 py-6">
        
        <div className="border-b border-sky-500/20 pb-4 mb-4 text-center">
          <span className="text-4xl block mb-2">🔐</span>
          <h2 className="text-2xl font-extrabold text-white font-serif tracking-wide uppercase">
            Acessar Conta
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-1">
            Insira suas credenciais cadastradas no Chapadonia para gerenciar seus personagens e coins.
          </p>
        </div>

        <div className="bg-[#0c1930] border border-sky-500/30 rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-sky-200 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                E-mail da Conta
              </label>
              <input 
                type="email" 
                required
                placeholder="seu_email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-sky-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
              <input 
                type="password" 
                required
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono text-xs"
              />
            </div>

            <div className="bg-[#080f1e] p-3 rounded-lg border border-sky-500/15 flex gap-2 text-[10px] text-sky-200/80">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Dica de Segurança:</strong> Nunca compartilhe seus dados de login com ninguém. Nossa equipe nunca solicitará sua senha.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-extrabold py-2.5 rounded shadow-md cursor-pointer transition-colors uppercase text-xs tracking-wider border border-sky-400/20"
            >
              {loading ? "Verificando..." : "Entrar no Chapadonia"}
            </button>
          </form>

          <div className="border-t border-sky-500/10 pt-4 mt-4 text-center space-y-2">
            <div>
              <p className="text-[11px] text-sky-200/60">
                Perdeu o acesso à sua senha?
              </p>
              <button 
                onClick={() => setShowRecoveryModal(true)}
                className="mt-0.5 text-amber-400 hover:text-amber-200 hover:underline font-bold text-xs cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Recuperar Conta com Recovery Key (RK)
              </button>
            </div>

            <div className="pt-2 border-t border-sky-500/10">
              <p className="text-[11px] text-sky-200/60">
                Ainda não possui uma conta de jogo?
              </p>
              <button 
                onClick={handleGoToRegister}
                className="mt-1 text-sky-300 hover:text-sky-100 hover:underline font-bold text-xs cursor-pointer"
              >
                Registrar nova conta grátis agora!
              </button>
            </div>
          </div>
        </div>

      </div>

      <AccountRecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        showNotification={showNotification}
      />
    </div>
  );
};
