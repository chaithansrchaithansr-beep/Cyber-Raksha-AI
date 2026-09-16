import React, { useState } from 'react';
import { api } from '../services/api';
import { Bot, Send, User, ShieldAlert, PhoneCall, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  actions?: string[];
}

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: 'assistant',
      content: "Hello! I am your AI Cyber Safety Assistant. How can I help protect your digital accounts or assist with a suspicious scam message?",
      actions: ["I clicked a phishing link", "Is this SMS suspicious?", "How to spot a fake website", "What is two-factor authentication?"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMessages: ChatEntry[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.assistant.chat(query, messages);
      setMessages([...newMessages, {
        role: 'assistant',
        content: res.reply,
        category: res.category,
        actions: res.suggested_actions
      }]);
    } catch (e) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "I am experiencing high traffic on the secure node. In case of urgent digital financial fraud, please immediately dial the National Helpline 1930."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Bot className="w-4 h-4" />
          <span>Module 12 • Defensive Cyber Intelligence Assistant</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">AI Cyber Safety Assistant</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Specialized conversational defense engine for citizen incident guidance, digital hygiene, and containment protocols.
        </p>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden flex flex-col h-[600px]">
        {/* Chat History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.actions && m.actions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {m.actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(act)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 border border-slate-700 transition-colors"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                Evaluating defense knowledge base...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a cyber safety question (e.g. 'What should I do after clicking a phishing link?')..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
