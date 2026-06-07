import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

interface AgentDossier {
  id: string;
  codename: string;
  fullName: string;
  status: "ACTIVE BOUNTY" | "WANTED" | "MONITORED" | "UNDERCOVER";
  bountyValue: string;
  avatar: string;
  psychologicalProfile: string;
  physicalTells: string;
  recommendedCounterStrategy: string;
  metrics: {
    bluffFrequency: number;
    tiltFactor: number;
    patienceLevel: number;
    callingThreshold: number;
  };
}

const DEFAULT_DOSSIERS: AgentDossier[] = [
  {
    id: "the_ghost",
    codename: "The Ghost",
    fullName: "Arthur Pendelton (Deceased-Alas)",
    status: "ACTIVE BOUNTY",
    bountyValue: "75,000 Chips",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDk1o8jgjRBbUG_H_5BECDL2s0DavOaJhJ0a5rz949BlzofYuEZXNH1jjHqHipsI8x4UbtfWmTK2XJq9HxM0Kd5HDHVS8TQsVXo_GRVO4GWQNkIF5Ki0vZVVQnOHBsqmzS7Mg7tUbDyMNlZoS4nk3lmBwIg58-1EBGarpn-i7FuGnSnjcQ5YVFTwJZ1NQwtYv7Mkc80JjTXE6ds0sCeTbvOSMbn1eViq9_icBGg-xHATEb9--bM1ZFtLZ0f2toFrysOXpdyODrvdR0",
    psychologicalProfile: "Highly elusive, completely lacks standard physiological stress markers. Functions with absolute mechanical coldness under intense sizing. Lies with effortless confidence, specifically favoring high-value claims early in game sequences to clear out cautious players.",
    physicalTells: "Tells are reversed. He double-checks his hand only when he holds absolute monsters. When bluffing, he places chips with a rapid, crisp snapping action to assert immediate dominance over vulnerable opponents.",
    recommendedCounterStrategy: "Do not attempt to push him off medium pots with passive sizing. Trap him by showing structural weakness; let him build his bluff size to the climax, then call him with mid-pair holdings.",
    metrics: {
      bluffFrequency: 82,
      tiltFactor: 24,
      patienceLevel: 78,
      callingThreshold: 58
    }
  },
  {
    id: "velvet_queen",
    codename: "VelvetQueen",
    fullName: "Elena Rostova",
    status: "MONITORED",
    bountyValue: "150,000 Chips",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuANL92OAxCfnKbTYf7QxrKDQmDN63mneeL47wGwQ5LcmlJRKRyEFQv8N4OEV2Z8QkwshiQqKYnftE6iRpc3LpvsRKoL7tnGSNiZkHqCoyT9puT5KUHDoUYarI400vbG8RYiYq5aJOE0PUYm3Pj0PZ5U0DZcjggTN44o00ARJoliJQH1f3jJbiZV6eJMpuurznhfL8jWVTg7p_fb66ZezYgBIRcObO9bNkQ7YEuwA1KWc5lHXKD6tRWtnjE4FS0_Ho3dVqpUN8JRIQA",
    psychologicalProfile: "The supreme matriarch of the Underground syndicate. Operates on hyper-rational game theory. She recalculates probabilities dynamically on every card deal, exhibiting near-zero standard tells. Avoids foolish visual theatrics.",
    physicalTells: "Pauses exactly 1.8 seconds longer than usual before submitting a high-value bluff. When she has a premium legitimate structure, she submits her sizing choice instantly to project simulated bravado.",
    recommendedCounterStrategy: "Exploit her strict adherence to system-probability logic. Introduce chaotic sizing structures that represent complete tactical madness (over-bets or minimum-click raises) to break her algorithmic calculators.",
    metrics: {
      bluffFrequency: 65,
      tiltFactor: 12,
      patienceLevel: 94,
      callingThreshold: 88
    }
  },
  {
    id: "double_down",
    codename: "DoubleDown",
    fullName: "Marcus Vane",
    status: "WANTED",
    bountyValue: "50,000 Chips",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5Nnl39aLq6CslDOjGqADcucE6rNDmf1jFafwv61Hd1Yb5v3WNK1ei7UiFhZdNteNQPMk-Ncyk7d5H1-Y_radx_RF6k63FAyh0NypgPrDe324vOYqEIdqgnD1spCMKHXbEfoQa8IF9g1qvcoEJwXAWpCAaMBICzCbLX0tnuy-xRAwuBdwwSlHvQAuz2yzDt0donDhUMdzTSqEaoN7q0xiPuG1hNhBIAW6qKzCj8gxsKEbn-n6sEDE39ptEuv6VcXnPa52cGOMOhZU",
    psychologicalProfile: "A legendary gambler prone to high manic swings. Extremely volatile. He lives for the pure neurological thrill of the bluff, often playing with extreme aggression to force folds. However, he tilts catastrophically if caught red-handed.",
    physicalTells: "Exhibits a subtle rapid pacing check. His mouse cursor or chip stacking speed increases substantially when he lacks any structural holdings. He clears his throat or shifts seating posture whenever a heavy bluff-call is pending.",
    recommendedCounterStrategy: "Catch him bluffing once early. This will crack his emotional shell, increasing his tilt factor. Once tilted, he will bluff fold-equity structures indiscriminately. Call him down mercilessly on later streets.",
    metrics: {
      bluffFrequency: 59,
      tiltFactor: 85,
      patienceLevel: 35,
      callingThreshold: 65
    }
  }
];

export const BlacklistView: React.FC = () => {
  const { user } = useAuth();
  const [dossiers, setDossiers] = useState<AgentDossier[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentDossier | null>(null);
  const [stampRevealed, setStampRevealed] = useState<boolean>(true);

  // Contribution Form Modal state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [codename, setCodename] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [bountyValue, setBountyValue] = useState<string>("60,000 Chips");
  const [psychProfile, setPsychProfile] = useState<string>("");
  const [physicalTells, setPhysicalTells] = useState<string>("");
  const [counterStrategy, setCounterStrategy] = useState<string>("");
  const [bluffFreq, setBluffFreq] = useState<number>(55);
  const [statusVal, setStatusVal] = useState<"ACTIVE BOUNTY" | "WANTED" | "MONITORED" | "UNDERCOVER">("WANTED");

  // Subscribe to persistent Firestore dossier indices
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "blacklist_dossiers"), (snapshot) => {
      const dbEntries: AgentDossier[] = [];
      snapshot.forEach((doc) => {
        dbEntries.push({ id: doc.id, ...doc.data() } as AgentDossier);
      });
      setDossiers(dbEntries);
    }, (error) => {
      console.warn("Could not retrieve real-time dossiers; falling back to memory arrays", error);
    });
    return () => unsubscribe();
  }, []);

  const activeDossiersList = dossiers.length > 0 ? dossiers : DEFAULT_DOSSIERS;

  // Track selection defaults
  useEffect(() => {
    if (activeDossiersList.length > 0) {
      if (!selectedAgent || !activeDossiersList.some(a => a.id === selectedAgent.id)) {
        setSelectedAgent(activeDossiersList[0]);
      }
    }
  }, [activeDossiersList, selectedAgent]);

  const handleSelectAgent = (agent: AgentDossier) => {
    setStampRevealed(false);
    setSelectedAgent(agent);
    setTimeout(() => {
      setStampRevealed(true);
    }, 150);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codename || !psychProfile || !physicalTells || !counterStrategy) {
      alert("Please specify all core dossier criteria.");
      return;
    }

    const uniqueId = "custom_dossier_" + Date.now();
    const newDossier: AgentDossier = {
      id: uniqueId,
      codename: codename.trim(),
      fullName: fullName.trim() || "Unclassified Associate",
      status: statusVal,
      bountyValue,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNB36cm-sVqvrwdOgA6oJBkL7bHS9ZVEWDvBMFwhHfMMyum4ztwW2QRqiig3edpZjYzWsiTG9GQ6Qb4ZaFr7BtcrZ5XHq9ICRjZguxV7UilUIH1qs3iWazqYhEZgdVVxKk7CVKn5yqUyspo3N94V5sRmMWmORX6u4E9kxYnEGYKye1zFSIoBbn2u3MxY37sx9ms_ITusvJTqHkJtZos9VPXo5aSwQB-yJxOAbEQ3EIN4Fyo9GbeEJrEFl743KVH6FvSW1tQFW9xVQ",
      psychologicalProfile: psychProfile.trim(),
      physicalTells: physicalTells.trim(),
      recommendedCounterStrategy: counterStrategy.trim(),
      metrics: {
        bluffFrequency: bluffFreq,
        tiltFactor: Math.min(100, Math.max(10, Math.floor(Math.random() * 50) + 20)),
        patienceLevel: Math.min(100, Math.max(10, Math.floor(Math.random() * 50) + 30)),
        callingThreshold: Math.min(100, Math.max(10, Math.floor(Math.random() * 40) + 40))
      }
    };

    try {
      // Save directly to global Firestore directory
      await setDoc(doc(db, "blacklist_dossiers", uniqueId), newDossier);
      setCodename("");
      setFullName("");
      setPsychProfile("");
      setPhysicalTells("");
      setCounterStrategy("");
      setIsFormOpen(false);
    } catch (err) {
      console.error("Dossier write failed:", err);
    }
  };

  return (
    <div className="bg-[#091612] min-h-[90vh] text-[#d7e6df] font-sans px-4 py-12 md:px-12 relative overflow-hidden">
      
      {/* Background accents */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#abcec2_1px,transparent_1px),linear-gradient(to_bottom,#abcec2_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header section */}
      <div className="max-w-7xl mx-auto mb-10 border-b border-outline/10 pb-6 relative z-10">
        <span className="text-red-500 font-headline tracking-[0.25em] font-black text-xs uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span> CONFIDENTIAL SYNDICATE HIGH INTELLIGENCE
        </span>
        <h1 className="font-headline text-4xl md:text-5xl font-black text-white uppercase tracking-tight mt-1">
          The Syndicate Blacklist
        </h1>
        <p className="text-[#8b928f] text-sm md:text-base mt-2">
          Psychological blueprints, physical tells, and real-time telemetry of the active lobby grandmasters. Use these files to crack their poker-faces.
        </p>
      </div>

      {/* Split Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Left Side: dossiers selector (4 cols) */}
        <div className="lg:col-span-4 bg-[#0e1d19]/80 rounded-2xl border border-outline/10 p-5 space-y-3 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="px-3 py-1.5 rounded bg-black/40 border border-outline/5 text-[10px] tracking-wider uppercase font-bold text-zinc-500 mb-4 font-mono flex justify-between items-center">
              <span>TARGET INDEX ({activeDossiersList.length})</span>
              <span className="text-red-500 font-extrabold flex items-center gap-1">LIVE FEED</span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
              {activeDossiersList.map((agent) => {
                const isSelected = selectedAgent && agent.id === selectedAgent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 group cursor-pointer ${
                      isSelected
                        ? "border-red-500 bg-red-500/5 shadow-[0_5px_20px_rgba(239,68,68,0.12)]"
                        : "border-outline/5 bg-[#111e1a]/50 hover:border-outline/25 hover:bg-[#15221e]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        className={`w-12 h-12 rounded-full object-cover border-2 shadow ${
                          isSelected 
                            ? "border-red-500" 
                            : "border-outline/10 group-hover:border-white/20"
                        }`}
                        alt={agent.codename}
                        src={agent.avatar}
                      />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#091612] flex items-center justify-center ${
                        agent.status === "ACTIVE BOUNTY" ? "bg-red-500" : "bg-[#e9c349]"
                      }`} />
                    </div>

                    <div className="flex-1 truncate">
                      <div className="flex justify-between items-start gap-1">
                        <span className={`font-headline font-bold text-sm tracking-tight ${isSelected ? "text-red-400" : "text-white"}`}>
                          {agent.codename}
                        </span>
                        {agent.status === "ACTIVE BOUNTY" && (
                          <span className="text-[7.5px] font-black bg-red-950 text-red-500 px-1 py-0.5 rounded tracking-wide leading-none select-none">
                            BOUNTY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mt-1">
                        STATUS: {agent.status}
                      </span>
                    </div>

                    <span className={`material-symbols-outlined text-sm transition-transform shrink-0 ${
                      isSelected ? "text-red-500 translate-x-1" : "text-outline/30 group-hover:text-white"
                    }`}>
                      arrow_forward_ios
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-outline/5 mt-4">
            
            {/* Intel submission button */}
            {user ? (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="w-full py-3 bg-red-950/40 hover:bg-red-900/30 text-red-400 text-xs font-headline font-black uppercase tracking-widest rounded border border-red-900/40 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">security_updates</span>
                <span>Submit Custom Intel</span>
              </button>
            ) : (
              <div className="bg-black/30 p-3 rounded border border-outline/5 text-[10px] text-center text-zinc-500">
                Sign in with Google to contribute agent dossiers.
              </div>
            )}

            <div className="bg-black/30 p-4 rounded-xl border border-outline/5 text-[11px] text-[#8b928f] space-y-1">
              <span className="text-red-500 font-black tracking-wider uppercase font-mono block">TACTICAL NOTICE</span>
              <p className="leading-normal">
                Telemetry models are synthesized from over 45,000 hand records across high-stakes corridors. Hand variables drift after high losses.
              </p>
            </div>

          </div>
        </div>

        {/* Right Side: Detailed Dossier Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-[#0a1815] rounded-2xl border border-outline/10 p-6 md:p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="absolute top-12 right-12 text-outline/3 pointer-events-none select-none font-mono text-7xl font-bold uppercase tracking-widest rotate-12">
            SYNDICATE
          </div>

          {selectedAgent ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAgent.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-outline/10 pb-6 relative">
                  
                  {stampRevealed && (
                    <motion.div
                      initial={{ scale: 2.5, rotate: 45, opacity: 0 }}
                      animate={{ scale: 1, rotate: -12, opacity: 0.75 }}
                      transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.15 }}
                      className="absolute top-1/2 left-1/2 sm:left-2/3 -translate-x-1/2 -translate-y-1/2 border-4 border-dashed border-red-500 bg-red-950/20 text-red-500 text-xl font-black uppercase tracking-[0.3em] py-2 px-6 rounded-lg pointer-events-none z-10 flex flex-col items-center select-none"
                    >
                      <span>CLASSIFIED</span>
                      <span className="text-[8px] tracking-[0.1em] mt-1 font-mono">EYES ONLY syndicate v2</span>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-5">
                    <img
                      className="w-20 h-20 rounded-xl object-cover border border-outline/20 bg-dark shadow-xl"
                      alt={selectedAgent.codename}
                      src={selectedAgent.avatar}
                    />
                    <div>
                      <h2 className="font-headline text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">
                        {selectedAgent.codename}
                      </h2>
                      <p className="text-[#8b928f] text-xs font-mono mt-1">
                        REAL NAME: <span className="text-white font-bold">{selectedAgent.fullName}</span>
                      </p>
                      <p className="text-zinc-500 text-xs font-mono mt-0.5">
                        IDENT INDEX: <span className="text-secondary select-all font-bold">UUID-{selectedAgent.id.toUpperCase()}-VS</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#1e0f10] text-red-400 border border-red-800/40 rounded px-4 py-2 flex flex-col items-center sm:items-end font-mono max-w-[200px]">
                    <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold">REWARD FOR CODENAME</span>
                    <span className="text-lg font-bold font-headline select-none">{selectedAgent.bountyValue}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> Psychological Profile
                      </span>
                      <p className="text-sm text-zinc-350 mt-2 leading-relaxed font-sans text-justify">
                        {selectedAgent.psychologicalProfile}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#e9c349] font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#e9c349] rounded-full"></span> Physical Tells & Habits
                      </span>
                      <p className="text-sm text-zinc-350 mt-2 leading-relaxed font-sans italic">
                        &ldquo;{selectedAgent.physicalTells}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/35 p-6 rounded-xl border border-outline/5 space-y-5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 font-mono">
                      STATISTICAL TELEMETRY
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-baseline text-xs mb-1.5 font-mono">
                          <span className="text-[#8b928f]">Bluff Propensity</span>
                          <span className="text-white font-bold">{selectedAgent.metrics?.bluffFrequency ?? 50}%</span>
                        </div>
                        <div className="h-2 bg-[#111e1a] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedAgent.metrics?.bluffFrequency ?? 50}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                            className="h-full bg-red-650 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline text-xs mb-1.5 font-mono">
                          <span className="text-[#8b928f]">Tilt Tendency</span>
                          <span className="text-white font-bold">{selectedAgent.metrics?.tiltFactor ?? 50}%</span>
                        </div>
                        <div className="h-2 bg-[#111e1a] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedAgent.metrics?.tiltFactor ?? 50}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                            className="h-full bg-amber-500 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline text-xs mb-1.5 font-mono">
                          <span className="text-[#8b928f]">Patience Threshold</span>
                          <span className="text-white font-bold">{selectedAgent.metrics?.patienceLevel ?? 50}%</span>
                        </div>
                        <div className="h-2 bg-[#111e1a] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedAgent.metrics?.patienceLevel ?? 50}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline text-xs mb-1.5 font-mono">
                          <span className="text-[#8b928f]">Calling Precision</span>
                          <span className="text-white font-bold">{selectedAgent.metrics?.callingThreshold ?? 50}%</span>
                        </div>
                        <div className="h-2 bg-[#111e1a] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedAgent.metrics?.callingThreshold ?? 50}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                            className="h-full bg-teal-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#101c18] border border-[#abcec2]/15 p-5 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-secondary font-mono flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm leading-none">military_tech</span> RECOMMENDATION FOR DEFEAT
                  </span>
                  <p className="text-xs text-secondary mt-2 leading-relaxed">
                    {selectedAgent.recommendedCounterStrategy}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-[#8b928f]">
              Gathering classified blueprints...
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-outline/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-650 font-mono gap-3">
            <span>VELVET SYS INTELLIGENCE DEPART CODE: 04-B32</span>
            <span>RESTRICTED TRANSMISSION DIRECT FROM CLOUD SYSTEM SERVER</span>
          </div>
        </div>

      </div>

      {/* Contribution Drawer Modal Pop-up */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a1815] border border-outline/20 p-6 md:p-8 rounded-2xl max-w-2xl w-full shadow-2xl relative custom-scrollbar max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <h2 className="font-headline text-2xl font-black text-white uppercase italic tracking-tight mb-2">
                Submit Syndicate Intel
              </h2>
              <p className="text-zinc-500 text-xs mb-6 leading-relaxed">
                Add profile configurations, tells, and psych studies on other high rollers in high stakes corridor tables.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#8b928f] block mb-1.5 font-bold font-mono">Agent Codename</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. AceOfHearts"
                      value={codename}
                      onChange={(e) => setCodename(e.target.value)}
                      className="w-full bg-[#111e1a] border border-outline/10 text-white rounded p-2.5 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#8b928f] block mb-1.5 font-bold font-mono">Full Official Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Liam Sterling"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#111e1a] border border-outline/10 text-white rounded p-2.5 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#8b928f] block mb-1.5 font-bold font-mono">Bounty Valuation</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 50,000 Chips"
                      value={bountyValue}
                      onChange={(e) => setBountyValue(e.target.value)}
                      className="w-full bg-[#111e1a] border border-outline/10 text-white rounded p-2.5 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#8b928f] block mb-1.5 font-bold font-mono">Syndicate Level Status</label>
                    <select
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value as any)}
                      className="w-full bg-[#111e1a] border border-outline/10 text-white rounded p-2.5 text-xs focus:outline-none focus:border-red-500"
                    >
                      <option value="WANTED">WANTED</option>
                      <option value="ACTIVE BOUNTY">ACTIVE BOUNTY</option>
                      <option value="MONITORED">MONITORED</option>
                      <option value="UNDERCOVER">UNDERCOVER</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#8b928f] block mb-1.5 font-bold font-mono">Psychological Blueprint</label>
                  <textarea 
                    rows={2.5}
                    required
                    placeholder="Analyze how they lie or their strategic thresholds under chips tension..."
                    value={psychProfile}
                    onChange={(e) => setPsychProfile(e.target.value)}
                    className="w-full bg-[#111e1a] border border-outline/10 text-white rounded p-2.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#8b928f] block mb-1.5 font-bold font-mono">Physical Tells & Behavioral Habits</label>
                  <textarea 
                    rows={2}
                    required
                    placeholder="Explain mouse click delays, double verification of lists, or rapid breathing signs..."
                    value={physicalTells}
                    onChange={(e) => setPhysicalTells(e.target.value)}
                    className="w-full bg-[#111e1a] border border-outline/10 text-white rounded p-2.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#8b928f] block mb-1.5 font-bold font-mono">Counter Strategy Plans</label>
                  <textarea 
                    rows={2}
                    required
                    placeholder="Provide bullet plans on how our lobby competitors should react to force an easy fold..."
                    value={counterStrategy}
                    onChange={(e) => setCounterStrategy(e.target.value)}
                    className="w-full bg-[#111e1a] border border-outline/10 text-white rounded p-2.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-[10px] font-mono">
                    <span className="text-[#8b928f] uppercase font-bold">Estimated Bluff Propensity</span>
                    <span className="text-white font-bold">{bluffFreq}%</span>
                  </div>
                  <input 
                    type="range"
                    min="15"
                    max="95"
                    value={bluffFreq}
                    onChange={(e) => setBluffFreq(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#111e1a] rounded appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-outline/5 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 text-zinc-400 hover:text-white cursor-pointer hover:bg-white/5 rounded text-xs uppercase text-center"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-7 py-2.5 bg-red-650 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded shadow-xl cursor-pointer"
                  >
                    Transmit Dossier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
