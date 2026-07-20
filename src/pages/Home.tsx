import React, { useEffect, useState } from "react";
import { Flame, Calendar, Trophy, Zap, Clock, ShieldAlert } from "lucide-react";
import { NewsItem, AccountInfo } from "../types";
import { api } from "../api";

interface HomeProps {
  userAccount: AccountInfo["account"] | null;
  setCurrentSitePage: (page: any) => void;
}

export const Home: React.FC<HomeProps> = ({ userAccount, setCurrentSitePage }) => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchNews = async () => {
      try {
        const data = await api.getNews();
        if (active) {
          setNewsList(data);
        }
      } catch (err) {
        console.error("Home: falha ao buscar notícias", err);
      } finally {
        if (active) {
          setNewsLoading(false);
        }
      }
    };
    fetchNews();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-[#0b1528]/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-5 md:p-6 text-white space-y-6 shadow-2xl -m-4 md:-m-6 min-h-[500px]">
      
      {/* HEADER SECTION */}
      <div className="border-b border-sky-500/20 pb-3 mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide flex items-center gap-2">
          <Flame className="w-7 h-7 text-sky-400 animate-pulse" />
          NOTÍCIAS & ATUALIZAÇÕES
        </h2>
        <p className="text-xs text-sky-200/80 font-mono mt-1">
          Acompanhe as últimas mudanças, eventos e estágios do Chapadonia Server!
        </p>
      </div>

      {/* NOTÍCIAS FEED */}
      <div className="space-y-5">
        {newsLoading ? (
          <div className="bg-[#0c1930] border border-sky-500/20 rounded-xl p-8 text-center text-sky-200/80 font-mono text-xs">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-sky-400 mr-2"></div>
            Carregando últimas notícias do servidor...
          </div>
        ) : newsList.length === 0 ? (
          <div className="bg-[#0c1930] border border-sky-500/20 rounded-xl p-8 text-center text-sky-200/60 font-mono text-xs">
            Nenhuma notícia publicada ainda.
          </div>
        ) : (
          newsList.map((news) => (
            <article key={news.id} className="bg-[#0c1930] border border-sky-500/25 rounded-xl p-5 shadow-lg space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-sky-400" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-sky-500/10 pb-2 gap-1.5">
                <h3 className="text-base font-extrabold text-white font-serif flex items-center gap-1.5">
                  <span className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    news.category === "HOT" ? "bg-red-600/30 border border-red-500/40 text-red-300" :
                    news.category === "EVENTO" ? "bg-amber-600/30 border border-amber-500/40 text-amber-300" :
                    news.category === "UPDATE" ? "bg-blue-600/30 border border-blue-500/40 text-blue-300" :
                    "bg-slate-600/30 border border-slate-500/40 text-slate-300"
                  }`}>{news.category}</span>
                  {news.title}
                </h3>
                <span className="text-[11px] font-mono text-sky-300/80 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" /> {news.date}
                </span>
              </div>

              <p className="text-xs text-sky-100/90 leading-relaxed whitespace-pre-line">
                {news.content}
              </p>

              {news.bullets && news.bullets.length > 0 && (
                <div className="bg-[#080f1e] p-3 rounded-lg border border-sky-500/15 text-xs space-y-1.5 text-sky-200">
                  <span className="font-bold block text-white">✨ Destaques da Atualização:</span>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] font-serif">
                    {news.bullets.map((bullet: string, idx: number) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-sky-300/80 font-mono">Autor: <span className="font-bold text-white">{news.author}</span></span>
                {userAccount ? (
                  <button 
                    onClick={() => setCurrentSitePage("shop")}
                    className="bg-[#080f1e] hover:bg-sky-950 text-white font-bold px-3 py-1.5 rounded border border-sky-500/30 transition-all text-xs cursor-pointer uppercase tracking-wider font-mono text-[10px]"
                  >
                    Ver Loja
                  </button>
                ) : (
                  <button 
                    onClick={() => setCurrentSitePage("register")}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded border border-sky-400/30 transition-all text-xs cursor-pointer uppercase tracking-wider font-mono text-[10px]"
                  >
                    Criar Conta
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
