import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, KeyRound, User, Sparkles, ShieldCheck } from "lucide-react";
import { api } from "../api";
import { getVocationName, VOCATIONS } from "../utils";

interface RegisterProps {
  onRegisterSuccess: (account: any, characters: any[]) => void;
  setCurrentSitePage?: (page: any) => void;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
  serverName: string;
}

export const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  setCurrentSitePage,
  showNotification,
  serverName,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accName, setAccName] = useState("");
  const [charName, setCharName] = useState("");
  const [vocation, setVocation] = useState("Knight");
  const [gender, setGender] = useState<"Masculino" | "Feminino">("Masculino");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification("Por favor, preencha todos os campos do formulário de cadastro!", "error");
      return;
    }
    if (password !== confirmPassword) {
      showNotification("As senhas inseridas não coincidem!", "error");
      return;
    }
    if (password.length < 6) {
      showNotification("A senha deve conter pelo menos 6 caracteres!", "error");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Register Account
      const regRes = await api.register(email, password, confirmPassword);
      showNotification(regRes.message || "Conta criada com sucesso!", "success");

      // Step 2: Auto Login
      const loginData = await api.login(email, password);
      
      const mappedMyChars = (loginData.characters || []).map((c: any) => ({
        name: c.name,
        vocation: getVocationName(c.vocation),
        level: c.level,
        gender: c.sex === 1 ? "Masculino" : "Feminino",
        skills: { main: 50, shield: 50 },
        online: false,
        premium: true
      }));

      onRegisterSuccess(loginData.account, loginData.token, mappedMyChars);
      if (setCurrentSitePage) {
        setCurrentSitePage("account");
      } else {
        navigate("/account");
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Erro ao conectar ao servidor de cadastro!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      <div className="border-b border-sky-500/20 pb-3 mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-sky-400" />
          CRIAR NOVA CONTA
        </h2>
        <p className="text-xs text-sky-200/80 font-mono mt-1">
          Crie sua conta de acesso ao Chapadonia. Seus personagens poderão ser criados após o login.
        </p>
      </div>

      <div className="bg-[#0c1930] border border-sky-500/30 rounded-xl p-5 md:p-6 shadow-lg space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block text-[11px] font-bold text-sky-200 mb-1 flex items-center gap-1">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-sky-200 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                Senha Secreta
              </label>
              <input 
                type="password" 
                required
                placeholder="No mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-sky-200 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                Confirmar Senha
              </label>
              <input 
                type="password" 
                required
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono text-xs"
              />
            </div>
          </div>

          <div className="bg-[#080f1e] border border-sky-500/15 p-3 rounded text-[11px] text-sky-200/80 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Ao criar a conta, você terá acesso imediato ao painel onde poderá criar seus personagens de qualquer vocação (Knight, Paladin, Sorcerer, Druid, Monk).
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-extrabold py-3 rounded-lg shadow-md cursor-pointer transition-all uppercase text-xs tracking-wider border border-sky-400/20 font-serif"
          >
            {loading ? "Criando Conta..." : "Criar Minha Conta no Chapadonia"}
          </button>
        </form>

        <div className="border-t border-sky-500/10 pt-4 text-center">
          <p className="text-[11px] text-sky-200/60">
            Já possui uma conta cadastrada?
          </p>
          <button 
            onClick={() => setCurrentSitePage ? setCurrentSitePage("login") : navigate("/login")}
            className="mt-1 text-sky-300 hover:text-sky-100 hover:underline font-bold text-xs cursor-pointer"
          >
            Acessar Conta Existente
          </button>
        </div>
      </div>

    </div>
  );
};
