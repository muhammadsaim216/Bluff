import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Markdown from "react-markdown";

interface GuideTopic {
  id?: string;
  title: string;
  subtitle: string;
  icon: string;
  contentMarkdown?: string;
  content?: React.ReactNode;
}


const STRERGY_TOPICS: GuideTopic[] = [
  {
    title: "Syndicate Rules",
    subtitle: "Core game mechanics of Bluff",
    icon: "gavel",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          In the Velvet Shadow Underground, cards aren't just played; they're spoken. Master these absolute fundamentals before wager:
        </p>
        <ul className="space-y-3.5 list-none pl-0">
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">style</span>
            <div>
              <strong className="text-white">Invisible Hand Deals:</strong> Every player receives a starting hand. Cards remain completely hidden. Legitimate table progress moves rank-by-rank starting from <strong className="text-[#e9c349]">2</strong> up to <strong className="text-[#e9c349]">Ace (A)</strong>, then wrapping back to 2.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">ads_click</span>
            <div>
              <strong className="text-white">Face-Down Claims:</strong> During your turn, you must discard between 1 to 4 cards face down onto the center pile, declaring they are the <strong className="text-[#e9c349]">active target rank</strong>. You can lay actual matching cards (Truth), or throw card junk files (Bluff).
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">warning</span>
            <div>
              <strong className="text-white">The Interrogative Call:</strong> After high-value claims, any opponent can scream <strong className="text-red-500 font-bold font-headline">"BLUFF!"</strong>. If you lied, you must absorb the entire discarded pile into your hand. If you told the truth, your paranoid challenger takes the pile instead. First player to throw all cards wins.
            </div>
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "Pacing & Sizing",
    subtitle: "Manipulating opponents' timers",
    icon: "schedule",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          AI bots in our lobby don't just calculate what's in your hand—they track <strong className="text-white">how long</strong> you take to make custom claims.
        </p>
        <ul className="space-y-3.5 list-none pl-0">
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 text-base shrink-0 mt-0.5">bolt</span>
            <div>
              <strong className="text-white">Hyper-Fast Sizing (0.5s):</strong> Submitting an instant high-rank claim is highly suspicious for suspicious bots. They map instant clicks to "panic plays." Delay your submits by an extra 1-2 seconds to simulate strategic caution.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-500 text-base shrink-0 mt-0.5">heart_broken</span>
            <div>
              <strong className="text-white">Passive Piles Bleeding:</strong> Let opponents stack up cards in the center pile. The larger the center pile, the more dangerous calling a bluff becomes. Leverage massive pile wagers to force folds even when making obvious bluffs.
            </div>
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "Tells Decoder",
    subtitle: "Reading computerized metrics",
    icon: "psychology",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          The elite players listed on the Blacklist exhibit micro-eccentricities during tense rounds. Identify and decode them files:
        </p>
        <ul className="space-y-3.5 list-none pl-0">
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-400 text-base shrink-0 mt-0.5">visibility</span>
            <div>
              <strong className="text-white">Card Double-Checks:</strong> If <strong className="text-secondary">Marcus Vane (DoubleDown)</strong> opens his cards multiple times in sequence, he is bluffing 88% of the time. He is double-checking if his claimed lie fits original outlines.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-sky-400 text-base shrink-0 mt-0.5">analytics</span>
            <div>
              <strong className="text-white">The Slow Fold:</strong> When <strong className="text-secondary">Elena (VelvetQueen)</strong> hesitates, she is calculating standard deviation risk. If she raises immediately, she has the nuts—never call her bluff challenges.
            </div>
          </li>
        </ul>
      </div>
    )
  }
];

export const StrategyVaultView: React.FC = () => {
  const [activeTopicIndex, setActiveTopicIndex] = useState<number>(0);
  const [topics, setTopics] = useState<GuideTopic[]>([]);

  // Subscribe to strategy topics collection in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "strategy_topics"), (snapshot) => {
      const list: GuideTopic[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as GuideTopic);
      });
      if (list.length > 0) {
        setTopics(list);
      }
    }, (error) => {
      console.error("Error loading strategy topics:", error);
    });
    return () => unsubscribe();
  }, []);

  const finalTopics = topics.length > 0 ? topics : STRERGY_TOPICS;
  
  // Simulator states
  const [handSize, setHandSize] = useState<number>(6);
  const [layDownCount, setLayDownCount] = useState<number>(2);
  const [isBluffing, setIsBluffing] = useState<boolean>(true);
  const [personality, setPersonality] = useState<"passive" | "suspicious" | "pro" | "insane">("suspicious");

  // Telemetry computation
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [currentRiskValue, setCurrentRiskValue] = useState<number | null>(null);
  const [adviceText, setAdviceText] = useState<string>("");

  const handleRunSimulator = () => {
    setIsScanning(true);
    setCurrentRiskValue(null);

    // Dynamic AI prediction formula
    setTimeout(() => {
      let risk = 0;
      let advice = "";

      if (!isBluffing) {
        risk = Math.max(5, Math.min(35, Math.ceil(layDownCount * 8 + (10 - handSize) * 2)));
        advice = `Since you are telling the absolute TRUTH, there's zero chance of getting 'caught'. However, opponents have a ${risk}% simulated likelihood to falsely challenge you because you laid down ${layDownCount} cards. Let them challenge you to dump the center pile on them!`;
      } else {
        // High risk variables
        let multiplier = 1;
        if (personality === "passive") multiplier = 0.5;
        if (personality === "suspicious") multiplier = 1.35;
        if (personality === "pro") multiplier = 1.15;
        if (personality === "insane") multiplier = 1.6;

        risk = Math.ceil(((layDownCount * 22) + (10 - handSize) * 3) * multiplier);
        risk = Math.max(10, Math.min(98, risk));

        if (risk < 40) {
          advice = `SAFE BLUFF STRATEGY: Laying down ${layDownCount} card(s) when holding a healthy hand of ${handSize} is highly disguised. Perfect choice against ${personality} opponents. Proceed.`;
        } else if (risk < 70) {
          advice = `CRITICAL WARNING: Opponent has a suspicious eye on you. The lay down size of ${layDownCount} represents a massive portion of standard claim probability. Be ready to pick up the pile.`;
        } else {
          advice = `DANGER LEVEL MAX: Do not execute. Laying down a high volume of ${layDownCount} bluff card(s) under low-hand tension (${handSize} cards left) against an ${personality} bot is near suicide. Adapt sizing.`;
        }
      }

      setCurrentRiskValue(risk);
      setAdviceText(advice);
      setIsScanning(false);
    }, 1800);
  };

  return (
    <div className="bg-[#091612] min-h-[90vh] text-[#d7e6df] font-sans px-4 py-12 md:px-12 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 border-b border-outline/10 pb-6 relative z-10">
        <span className="text-secondary font-headline tracking-[0.25em] font-black text-xs uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-sm leading-none">menu_book</span> Strategy Portal
        </span>
        <h1 className="font-headline text-4xl md:text-5xl font-black text-white uppercase tracking-tight mt-1">
          Guiles & Tells Strategy Vault
        </h1>
        <p className="text-[#8b928f] text-sm md:text-base mt-2">
          Master probabilities with the Interactive Deception Risk Simulator and read confidential telemetry briefs compiled by syndicate grandmasters.
        </p>
      </div>

      {/* Split Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left: Deception Guides (5 cols) */}
        <div className="lg:col-span-5 bg-[#0e1d19]/80 rounded-2xl border border-outline/10 p-6 shadow-2xl space-y-6">
          <h3 className="font-headline text-xl font-bold text-white border-b border-outline/5 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">local_library</span> Tactician Blueprint
          </h3>

          <div className="flex flex-col gap-2.5">
            {finalTopics.map((topic, idx) => {
              const isSelected = idx === activeTopicIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTopicIndex(idx)}
                  className={`w-full text-left p-4 rounded-xl border flex gap-4 items-center transition-all cursor-pointer ${
                    isSelected
                      ? "border-secondary bg-secondary/5"
                      : "border-outline/5 bg-black/20 hover:border-outline/25 hover:bg-[#15221e]"
                  }`}
                >
                  <span className={`material-symbols-outlined p-2.5 rounded-lg text-lg ${
                    isSelected ? "bg-secondary text-[#241a00]" : "bg-[#162722] text-[#8b928f]"
                  }`}>
                    {topic.icon}
                  </span>
                  <div>
                    <h4 className={`font-headline font-semibold text-sm ${isSelected ? "text-secondary" : "text-white"}`}>
                      {topic.title}
                    </h4>
                    <p className="text-[#8b928f] text-[11px] mt-0.5 truncate">{topic.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Guide topic content panel */}
          <div className="bg-[#101c18] rounded-xl border border-outline/5 p-5 mt-4 min-h-[220px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTopicIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-secondary block font-mono">
                    CONFIDENTIAL MEMO BRIEF
                  </span>
                  <h4 className="font-headline font-bold text-white text-base mt-0.5 font-headline-bold">
                    {finalTopics[activeTopicIndex]?.title} Overview
                  </h4>
                </div>
                {finalTopics[activeTopicIndex]?.contentMarkdown ? (
                  <div className="space-y-4 text-sm leading-relaxed text-zinc-300 markdown-body prose prose-invert max-w-none prose-p:my-1 prose-ul:my-1">
                    <Markdown>{finalTopics[activeTopicIndex].contentMarkdown}</Markdown>
                  </div>
                ) : (
                  finalTopics[activeTopicIndex]?.content
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Interactive Deception Risk Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-[#0a1815] rounded-2xl border border-outline/10 p-6 md:p-8 shadow-2xl space-y-6">
          <div className="border-b border-outline/10 pb-4">
            <span className="text-secondary font-headline tracking-[0.2em] font-black text-[10px] uppercase">
              Predictive AI Models
            </span>
            <h3 className="font-headline text-2xl font-black text-white uppercase italic tracking-tight mt-0.5">
              Deception Risk Simulator
            </h3>
            <p className="text-[#8b928f] text-xs mt-1">
              Test claims in sandbox conditions to determine probability of automated bluff challenges from standard room personas.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Row 1: Hand Size & Cards placing down */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/20 p-5 rounded-xl border border-outline/5">
              
              {/* Hand size slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <span className="text-[#8b928f] uppercase">Your Remaining Hand Size</span>
                  <span className="text-white font-bold font-mono">{handSize} Cards</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={handSize}
                  onChange={(e) => setHandSize(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[#111e1a] rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <span className="text-[10px] text-zinc-500 block">Fewer cards = higher suspicion from standard AI opponents.</span>
              </div>

              {/* Laying down count slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <span className="text-[#8b928f] uppercase">Cards you lay down</span>
                  <span className="text-white font-bold font-mono">{layDownCount} Card(s)</span>
                </div>
                <input 
                  type="range"
                  min="1" 
                  max="4"
                  step="1"
                  value={layDownCount}
                  onChange={(e) => setLayDownCount(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[#111e1a] rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <span className="text-[10px] text-zinc-500 block">Laying down multiple cards (3 or 4) triggers extreme call ratings.</span>
              </div>

            </div>

            {/* Row 2: Personality and bluff toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/20 p-5 rounded-xl border border-outline/5">
              
              {/* Is it a bluff? */}
              <div className="space-y-2">
                <label className="text-xs uppercase text-[#8b928f] font-mono block">Is your claim a Bluff?</label>
                <div className="flex bg-[#111e1a] p-1 rounded-lg border border-outline/5">
                  <button
                    onClick={() => setIsBluffing(false)}
                    className={`flex-1 py-1.5 rounded text-xs tracking-wider uppercase font-bold transition-all ${
                      !isBluffing 
                        ? "bg-emerald-600 text-white font-black" 
                        : "text-[#8b928f] hover:text-white"
                    }`}
                  >
                    No (Truth)
                  </button>
                  <button
                    onClick={() => setIsBluffing(true)}
                    className={`flex-1 py-1.5 rounded text-xs tracking-wider uppercase font-bold transition-all ${
                      isBluffing 
                        ? "bg-red-650 text-white font-black" 
                        : "text-[#8b928f] hover:text-white"
                    }`}
                  >
                    Yes (Bluff)
                  </button>
                </div>
              </div>

              {/* Bot Personality Profile */}
              <div className="space-y-2">
                <label className="text-xs uppercase text-[#8b928f] font-mono block">Target Opponent Personality</label>
                <select
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value as any)}
                  className="w-full bg-[#111e1a] border border-outline/10 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-secondary"
                >
                  <option value="passive">Passive (Prone to fold, cautious)</option>
                  <option value="suspicious">Suspicious (Prone to call back)</option>
                  <option value="pro">Pro (Dynamic game-theory calculations)</option>
                  <option value="insane">Maniac (Chaotic calling patterns)</option>
                </select>
              </div>

            </div>

            {/* Run Button */}
            <button
              onClick={handleRunSimulator}
              disabled={isScanning}
              className={`w-full py-4 bg-gradient-to-br from-secondary to-[#af8d11] text-[#241a00] font-headline font-black text-sm uppercase tracking-widest rounded shadow-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isScanning ? "brightness-70 cursor-wait" : ""
              }`}
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#241a00] border-t-transparent rounded-full animate-spin" />
                  Running Predictive Models...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">radar</span>
                  Estimate Challenge Rate
                </>
              )}
            </button>

            {/* Simulated Analyzer Results Output Area */}
            <AnimatePresence mode="wait">
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border border-[#abcec2]/10 bg-black/45 rounded-xl h-44 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  {/* Glowing Radar Sweep lines using purely motion and CSS */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute w-60 h-60 border-r border-[#e9c349]/15 rounded-full pointer-events-none origin-center"
                    style={{ background: "conic-gradient(from 0deg, transparent 50%, rgba(233, 195, 73, 0.08) 100%)" }}
                  />
                  <div className="absolute w-32 h-32 border border-[#e9c349]/10 rounded-full flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 border border-[#e9c349]/10 rounded-full" />
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-secondary mt-4 animate-pulse">
                    Scanning biometric telemetry...
                  </span>
                </motion.div>
              )}

              {!isScanning && currentRiskValue !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/45 border rounded-xl p-5 flex flex-col md:flex-row items-center gap-6"
                  style={{
                    borderColor: currentRiskValue < 40 
                      ? "rgba(16, 185, 129, 0.25)" 
                      : currentRiskValue < 70 
                        ? "rgba(245, 158, 11, 0.25)" 
                        : "rgba(239, 68, 68, 0.25)"
                  }}
                >
                  {/* Gauge representation */}
                  <div className="relative shrink-0 w-28 h-28 flex items-center justify-center select-none text-center">
                    
                    {/* Ring background */}
                    <div className="absolute inset-0 rounded-full border-[6px] border-zinc-900 border-t-transparent -rotate-45" />
                    
                    {/* Glowing color background depending on risk */}
                    <div className={`absolute inset-0.5 rounded-full filter blur-xl opacity-20 ${
                      currentRiskValue < 40 ? "bg-emerald-500" : currentRiskValue < 70 ? "bg-amber-500" : "bg-red-500"
                    }`} />

                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-3xl font-headline font-black font-mono leading-none ${
                        currentRiskValue < 40 ? "text-emerald-400" : currentRiskValue < 70 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {currentRiskValue}%
                      </span>
                      <span className="text-[8px] uppercase font-bold text-[#8b928f] tracking-wider mt-1 block">
                        CHALLENGE RATE
                      </span>
                    </div>

                    {/* Small pointer overlay */}
                    <motion.div 
                      className="absolute inset-3 rounded-full border-t-4 border-white/50"
                      animate={{ rotate: (currentRiskValue / 100) * 180 - 90 }}
                      transition={{ type: "spring", stiffness: 80 }}
                    />
                  </div>

                  <div className="space-y-2 mt-4 md:mt-0 text-center md:text-left">
                    <span className={`font-headline text-xs font-black tracking-widest uppercase block ${
                      currentRiskValue < 40 ? "text-emerald-400" : currentRiskValue < 70 ? "text-amber-400" : "text-red-400"
                    }`}>
                      {currentRiskValue < 40 
                        ? "■ LOW ACTION THREAT (GREEN)" 
                        : currentRiskValue < 70 
                          ? "■ WARNING: SUSPICION TRIGGERED (ORANGE)" 
                          : "■ MAXIMUM CHANCE OF DETECTION (RED)"}
                    </span>
                    <p className="text-zinc-300 text-xs leading-relaxed max-w-sm">
                      {adviceText}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </div>
  );
};
