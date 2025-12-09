import React, { useState } from 'react';
import { MessageCircleQuestion, Send, X } from 'lucide-react';
import { askMahjongRule } from '../../../services/geminiService';

const RuleAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAnswer(null);
    const result = await askMahjongRule(query);
    setAnswer(result);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
      
      {isOpen && (
        <div className="bg-slate-800 border border-slate-600 w-80 rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-5">
           <div className="flex justify-between items-center mb-3">
             <h4 className="font-bold text-slate-200">麻將規則 AI 裁判</h4>
             <button onClick={() => setIsOpen(false)}><X size={18} className="text-slate-400" /></button>
           </div>
           
           <div className="bg-slate-900 rounded-lg p-3 min-h-[100px] mb-3 text-sm text-slate-300 max-h-60 overflow-y-auto">
             {loading ? (
               <div className="flex items-center gap-2 text-yellow-500">
                 <span className="animate-spin">⟳</span> 查詢規則中...
               </div>
             ) : answer ? (
               <p>{answer}</p>
             ) : (
               <p className="text-slate-500 italic">請問我關於台數或規則的問題，例如：「大四喜幾台？」</p>
             )}
           </div>

           <form onSubmit={handleAsk} className="flex gap-2">
             <input 
               type="text" 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="輸入問題..."
               className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
             />
             <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 p-2 rounded text-white">
               <Send size={16} />
             </button>
           </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg border-2 border-indigo-400 transition-transform hover:scale-105"
      >
        <MessageCircleQuestion size={28} />
      </button>
    </div>
  );
};

export default RuleAssistant;
