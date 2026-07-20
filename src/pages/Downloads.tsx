import React from "react";
import { Download, Monitor, ShieldCheck, ArrowRight, Laptop, Cpu, CheckCircle } from "lucide-react";

export const Downloads: React.FC = () => {
  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER */}
      <div className="border-b border-sky-500/20 pb-3 mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
          📥 DOWNLOADS
        </h2>
        <p className="text-xs text-sky-200/80 font-mono mt-1">
          Baixe o cliente oficial do Chapadonia Server e prepare-se para a sua maior jornada Tibiana!
        </p>
      </div>

      {/* CLIENT OPTIONS GRID */}
      <div className="max-w-xl mx-auto">
        
        {/* OPTION 1: OTClient renamed to Cliente Chapadonia 15.25 */}
        <div className="bg-[#0c1930] border-2 border-sky-500/40 rounded-xl p-6 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-400" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
                <Laptop className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white font-serif tracking-wide">Cliente Chapadonia 15.25</h3>
                <span className="text-[10px] bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Altamente Recomendado (OTClient v3.5)</span>
              </div>
            </div>
            
            <p className="text-xs text-sky-200/90 leading-relaxed font-serif">
              O cliente oficial e definitivo para se conectar ao Chapadonia Server. Desfrute de áudio imersivo, luzes dinâmicas avançadas, interface totalmente customizada, shaders de última geração e performance de FPS otimizada de forma transparente.
            </p>

            <ul className="text-[11px] space-y-2 text-sky-300/80 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" /> Suporte completo a Som & Trilha Sonora do Jogo
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" /> Auto-loot Inteligente & HUD Customizável
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" /> Shaders Especiais e Renderização Ultra Rápida
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-sky-500/10">
            <a 
              href="https://github.com/edubart/otclient/releases" 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-3 rounded-lg shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 font-mono text-xs border border-cyan-400/35 uppercase tracking-wide"
            >
              <Download className="w-4 h-4" /> BAIXAR CLIENTE CHAPADONIA 15.25 (.ZIP)
            </a>
          </div>
        </div>

      </div>

      {/* INSTALLATION INSTRUCTIONS */}
      <div className="bg-[#0c1930] border border-sky-500/25 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-extrabold text-white font-serif uppercase tracking-wide flex items-center gap-2 border-b border-sky-500/10 pb-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" /> INSTRUÇÕES DE INSTALAÇÃO
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-serif leading-relaxed">
          <div className="space-y-1.5">
            <span className="font-mono font-bold text-cyan-400 block text-sm">Passo 1</span>
            <p className="text-sky-200">
              Faça o download do Cliente Chapadonia 15.25 clicando no botão acima.
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="font-mono font-bold text-cyan-400 block text-sm">Passo 2</span>
            <p className="text-sky-200">
              Extraia os arquivos compactados para uma pasta segura no seu computador (Ex: <code className="bg-[#080f1e] px-1.5 py-0.5 rounded font-mono text-[10px]">C:/ChapadoniaClient</code>).
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="font-mono font-bold text-cyan-400 block text-sm">Passo 3</span>
            <p className="text-sky-200">
              Execute o arquivo executável (<code className="bg-[#080f1e] px-1.5 py-0.5 rounded font-mono text-[10px]">otclient.exe</code> ou <code className="bg-[#080f1e] px-1.5 py-0.5 rounded font-mono text-[10px]">Chapadonia.exe</code>), entre com suas credenciais e divirta-se!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
