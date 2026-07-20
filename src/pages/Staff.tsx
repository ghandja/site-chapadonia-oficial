import React from "react";
import { UserCheck, Shield, HelpCircle, Star, MessageCircle, AlertCircle } from "lucide-react";

interface StaffMember {
  name: string;
  role: "Administrador" | "Administrador Supremo" | "GameMaster" | "Community Manager" | "Tutor Principal";
  avatar: string;
  status: "Online" | "Offline";
  description: string;
}

export const Staff: React.FC = () => {
  const staffList: StaffMember[] = [];

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER */}
      <div className="border-b border-sky-500/20 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-sky-400" />
            EQUIPE DO SERVIDOR
          </h2>
          <p className="text-xs text-sky-200/80 font-mono mt-1">
            Membros oficiais encarregados da manutenção, ordem e comunidade do Chapadonia OTServ.
          </p>
        </div>
      </div>

      {/* WARNING INFO BOX */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white font-serif block text-sm mb-0.5">⚠️ Segurança da Conta - Regra de Ouro</strong>
          Membros da Staff **NUNCA** pedirão suas credenciais de acesso, conta ou senha em nenhuma hipótese. Não divulgue seus dados pessoais nem links suspeitos recebidos por terceiros.
        </div>
      </div>

      {/* STAFF LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffList.length === 0 ? (
          <div className="bg-[#0c1930]/40 border border-sky-500/10 rounded-xl p-12 text-center text-sky-200/60 font-mono text-xs col-span-full">
            A equipe do servidor será anunciada em breve.
          </div>
        ) : staffList.map((member, idx) => (
            <div 
              key={idx}
              className="bg-[#0c1930] border border-sky-500/25 rounded-xl p-4 flex gap-4 hover:border-sky-400/50 transition-all shadow-lg"
            >
              <div className="w-14 h-14 bg-[#080f1e] border border-sky-500/30 rounded-lg flex items-center justify-center text-3xl shadow-sm shrink-0 select-none">
                {member.avatar}
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-white font-serif truncate">{member.name}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    member.status === "Online"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                  }`}>
                    {member.status}
                  </span>
                </div>

                <div className="text-[10px] text-amber-300 font-mono font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> {member.role}
                </div>

                <p className="text-[11px] text-sky-100/90 leading-relaxed">{member.description}</p>
              </div>
            </div>
          ))
        }
      </div>

        {/* TUTORS CARD */}
        <div className="bg-[#0c1930]/40 border border-dashed border-sky-500/20 rounded-xl p-4 flex gap-4 hover:border-sky-500/40 transition-all shadow-md">
          <div className="w-14 h-14 bg-[#080f1e]/60 border border-dashed border-sky-500/20 rounded-lg flex items-center justify-center text-3xl shrink-0 select-none text-sky-400/70">
            📜
          </div>
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-sky-300/80 font-serif truncate">Tutores Oficiais</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border bg-sky-500/10 text-sky-300/80 border-sky-500/20">
                Aberto
              </span>
            </div>
            <div className="text-[10px] text-sky-400/80 font-mono font-bold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Ainda não temos tutores
            </div>
            <p className="text-[11px] text-sky-200/60 leading-relaxed">
              Gosta de ajudar outros aventureiros, tirar dúvidas e manter o help-channel limpo? Inscrições serão abertas em breve no nosso novo Fórum de Quests!
            </p>
          </div>
        </div>

      {/* CUSTOM FEEDBACK / TICKET */}
      <div className="bg-[#0c1930]/60 border border-sky-500/20 p-4 rounded-xl space-y-3 shadow-inner">
        <h4 className="font-serif text-sm font-extrabold text-white flex items-center gap-1.5 border-b border-sky-500/10 pb-2">
          <MessageCircle className="w-4.5 h-4.5 text-sky-400" />
          Precisa de Ajuda ou Suporte?
        </h4>
        <p className="text-xs text-sky-200/80 leading-relaxed">
          Nossa equipe trabalha de forma proativa no canal de <strong className="text-white">Help-Channel</strong> dentro do jogo e no Discord.
          Para reclamações, denúncias ou problemas de cobrança, abra um ticket no Discord Oficial para atendimento privado.
        </p>
      </div>

    </div>
  );
};
