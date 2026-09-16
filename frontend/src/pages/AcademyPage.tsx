import React, { useState } from 'react';
import { GraduationCap, Award, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export const AcademyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracks' | 'quiz'>('tracks');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const tracks = [
    {
      level: "LEVEL 01",
      title: "Phishing Identification & URL Hygiene",
      desc: "Learn to spot lookalike domains, homoglyph characters, and fake login pages masquerading as national banks.",
      modules: 4,
      badge: "Phishing Hunter"
    },
    {
      level: "LEVEL 02",
      title: "UPI & Digital Payment Security",
      desc: "Master the golden rules of UPI: why PIN is only for sending money, recognizing fake QR codes, and payment receipt tampering.",
      modules: 5,
      badge: "UPI Sentinel"
    },
    {
      level: "LEVEL 03",
      title: "Social Engineering & Digital Arrest Defense",
      desc: "Examine urgency manipulation, fake electricity disconnection SMS, and simulated customs/police video calls.",
      modules: 4,
      badge: "Social Shield"
    },
    {
      level: "LEVEL 04",
      title: "Digital Privacy & MFA Architecture",
      desc: "Strengthen password hygiene, configure authenticator apps over SMS OTPs, and understand personal data leakage risks.",
      modules: 6,
      badge: "Privacy Guardian"
    }
  ];

  const quizQuestions = [
    {
      q: "When a merchant asks you to enter your UPI PIN to receive a cashback or lottery prize, what will happen?",
      options: [
        "The money will immediately credit into your bank account.",
        "Your account will be debited and money will be stolen.",
        "Your bank will ask for Aadhaar verification.",
        "You will receive double cashback points."
      ],
      correct: 1,
      explanation: "A UPI PIN is strictly used to AUTHORIZE DEBITS from your account. You NEVER need to enter a PIN to receive funds."
    },
    {
      q: "You receive an SMS: 'Your electricity will be disconnected at 9:30 PM tonight, call 9876543210 immediately'. What is the correct response?",
      options: [
        "Call the phone number in the SMS to explain your bill status.",
        "Download the APK link they send via WhatsApp.",
        "Ignore the SMS and verify your bill solely on the official DISCOM portal or electricity bill copy.",
        "Send Rs 10 to test if power stays connected."
      ],
      correct: 2,
      explanation: "Electricity boards never send personal mobile numbers threatening immediate disconnection. Verify only via official utility channels."
    },
    {
      q: "A part-time job offer on Telegram promises Rs 5,000 daily for subscribing to YouTube channels, but asks for an initial Rs 500 deposit. This is:",
      options: [
        "A legitimate remote digital marketing internship.",
        "A classic Task-Based / Advance-Fee Investment Scam.",
        "A government youth employment program.",
        "A YouTube partner verification reward."
      ],
      correct: 1,
      explanation: "Scammers initially return small amounts to build trust, then lock larger funds demanding escalating deposits."
    }
  ];

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
  };

  const calculateScore = () => {
    let correctCount = 0;
    quizQuestions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct) correctCount += 1;
    });
    return Math.round((correctCount / quizQuestions.length) * 100);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Module 26 • Gamified Cyber Hygiene</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Cyber Awareness Academy</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Interactive cybersecurity learning tracks, phishing quizzes, and digital defense badges designed for schools, colleges, and citizens.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tracks'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Learning Tracks
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quiz'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Interactive Phishing Challenge
        </button>
      </div>

      {activeTab === 'tracks' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track, i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase bg-slate-800 px-2.5 py-1 rounded text-cyan-400 border border-slate-700">
                  {track.level}
                </span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {track.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-snug">{track.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{track.desc}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
                <span className="text-slate-500">{track.modules} Interactive Modules</span>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Start Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-extrabold text-white">Interactive Citizen Cyber Challenge</h2>
              <p className="text-xs text-slate-400">Test your digital scam defense awareness against real Indian scam scenarios.</p>
            </div>
            {submitted && (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                Awareness Score: {calculateScore()}%
              </div>
            )}
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-white">{qIdx + 1}. {q.q}</h3>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isChosen = selectedAnswers[qIdx] === optIdx;
                    const isCorrect = q.correct === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between ${
                          isChosen
                            ? submitted
                              ? isCorrect
                                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-200'
                                : 'bg-red-500/20 border border-red-500 text-red-200'
                              : 'bg-cyan-500/20 border border-cyan-500 text-cyan-200'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{opt}</span>
                        {submitted && isChosen && (
                          isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all active:scale-95 disabled:opacity-50"
              >
                Submit Answers & Calculate Score
              </button>
            ) : (
              <button
                onClick={() => { setSubmitted(false); setSelectedAnswers({}); }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Retake Challenge
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
