import React, { useState } from "react";
import { UserPlus, Mail, KeyRound, User, Sparkles, ShieldCheck } from "lucide-react";
import { api } from "../api";
import { getVocationName, VOCATIONS } from "../utils";

interface RegisterProps {
  onRegisterSuccess: (account: any, characters: any[]) => void;
  setCurrentSitePage: (page: any) => void;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
  serverName: string;
}

export const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  setCurrentSitePage,
  showNotification,
  serverName,
}) => {
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

      onRegisterSuccess(loginData.account, mappedMyChars);
      setCurrentSitePage("account");
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
          CRIAR CONTA & NOVO JOGADOR
        </h2>
        <p className="text-xs text-sky-200/80 font-mono mt-1">
          Suas credenciais serão criptografadas e salvas de forma segura.
        </p>
      </div>

      <div className="bg-[#0c1930] border border-sky-500/30 rounded-xl p-5 md:p-6 shadow-lg space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-sky-200 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Seu E-mail
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-sky-200 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-400" />
                Nome de Conta (Apenas Visual)
              </label>
              <input 
                type="text" 
                required
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono text-xs"
              />
            </div>
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono text-xs"
              />
            </div>
          </div>

          <p className="text-[10px] text-sky-300 bg-[#080f1e] border border-sky-500/15 p-2.5 rounded font-mono">
            Esta senha será gravada usando criptografia de nível sênior <strong>SHA-1 / bcrypt</strong> de acordo com a configuração ativa.
          </p>

          <div className="border-t border-sky-500/10 pt-4 mt-2">
            <span className="font-extrabold text-white uppercase tracking-wider block mb-3 text-[11px] flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              Criação de Personagem Inicial (Clonado do Sample)
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-sky-200 mb-1">Nome do Character (Apelido)</label>
                <input 
                  type="text" 
                  required
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-sky-200 mb-1">Vocação Inicial</label>
                <select
                  value={vocation}
                  onChange={(e) => setVocation(e.target.value)}
                  className="w-full bg-[#080f1e] border border-sky-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-serif text-xs cursor-pointer"
                >
                  {["Knight", "Sorcerer", "Paladin", "Druid"].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-bold text-sky-200 mb-1">Gênero do Personagem</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-sky-200 font-bold">
                  <input 
                    type="radio" 
                    name="gender_reg" 
                    checked={gender === "Masculino"}
                    onChange={() => setGender("Masculino")}
                    className="accent-sky-500"
                  /> Masculino
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-sky-200 font-bold">
                  <input 
                    type="radio" 
                    name="gender_reg" 
                    checked={gender === "Feminino"}
                    onChange={() => setGender("Feminino")}
                    className="accent-sky-500"
                  /> Feminino
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-extrabold py-2.5 rounded shadow-md cursor-pointer transition-all uppercase text-xs tracking-wider border border-sky-400/20"
          >
            {loading ? "Registrando no banco de dados..." : "Criar Conta & Personagem"}
          </button>
        </form>

        <div className="border-t border-sky-500/10 pt-4 text-center">
          <p className="text-[11px] text-sky-200/60">
            Já tem uma conta de jogo?
          </p>
          <button 
            onClick={() => setCurrentSitePage("login")}
            className="mt-1 text-sky-300 hover:text-sky-100 hover:underline font-bold text-xs cursor-pointer"
          >
            Acessar painel de conta existente
          </button>
        </div>
      </div>

    </div>
  );
};
