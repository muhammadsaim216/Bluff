import React from "react";
import { getRankInfo } from "../types";

interface SummaryViewProps {
  winnerName: string; // "You" | other player names
  rewardChips: number;
  xpGained: number;
  onPlayAgain: () => void;
  onGoLobby: () => void;
  userXP?: number;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  winnerName,
  rewardChips,
  xpGained,
  onPlayAgain,
  onGoLobby,
  userXP
}) => {
  const isMeWinner = winnerName === "You";
  const currentXP = userXP !== undefined ? userXP : (isMeWinner ? 2450 : 1820);
  const rank = getRankInfo(currentXP);

  // Calculate progress level bar to next rank
  let percent = 100;
  let xpProgressText = "MAX LEVEL";
  if (rank.nextRankXP !== null) {
    const range = rank.nextRankXP - rank.prevRankXP;
    const earned = currentXP - rank.prevRankXP;
    percent = Math.max(0, Math.min(100, (earned / range) * 100));
    xpProgressText = `${(currentXP - rank.prevRankXP).toLocaleString()} / ${range.toLocaleString()} XP`;
  }

  const standings = [
    { pos: "01", name: isMeWinner ? "Alex_Shadow" : winnerName, change: `+${rewardChips.toLocaleString()}`, xp: `+${xpGained}`, isMe: isMeWinner, code: "AS" },
    { pos: "02", name: !isMeWinner ? "Alex_Shadow" : "VelvetViper", change: "-4,200", xp: "+220", isMe: !isMeWinner, code: !isMeWinner ? "AS" : "VV" },
    { pos: "03", name: "BluffKing77", change: "-6,800", xp: "+180", isMe: false, code: "BK" },
    { pos: "04", name: "NightCard", change: "-1,500", xp: "+95", isMe: false, code: "NC" }
  ];

  return (
    <div className="bg-[#091612] min-h-screen text-[#d7e6df] font-sans pt-12 pb-24 px-6 flex flex-col items-center">
      {/* Victory Highlight Section */}
      <section className="w-full max-w-5xl mt-8 mb-14 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/15 to-transparent blur-[120px] rounded-full opacity-40 -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Winner Text Spotlight */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-35 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <span className="material-symbols-outlined text-secondary text-sm">stars</span>
              <span className="text-secondary font-headline font-black uppercase tracking-widest text-[9px]">Round Conclusion</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-headline font-black text-white leading-none mb-6">
              {isMeWinner ? "VICTORY" : "ROUND"}<br />
              <span className="text-secondary drop-shadow-[0_0_15px_rgba(233,195,73,0.3)]">
                {isMeWinner ? "SECURED" : "FINISHED"}
              </span>
            </h1>

            <p className="text-[#8b928f] max-w-md text-base sm:text-lg leading-relaxed mb-8">
              {isMeWinner 
                ? "The table has spoken. Shadows retreat as the Grandmaster claims the velvet throne with a final daring bluff."
                : "A tough matchup in the underground shadow tables. Read your opponents turns closer to master the deceit."}
            </p>

            {/* Quick Rewards statistics displays */}
            <div className="flex gap-4 w-full md:w-auto">
              <div className="px-5 py-3 bg-surface-container-high/60 border border-outline/10 rounded-xl flex-1 md:flex-none">
                <span className="block text-[9px] text-[#8b928f] uppercase font-black tracking-widest mb-1 leading-none">Total Reward</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-secondary">monetization_on</span>
                  <span className="text-secondary font-headline text-2xl font-black">
                    {isMeWinner ? rewardChips.toLocaleString() : "0"}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 bg-surface-container-high/60 border border-outline/10 rounded-xl flex-1 md:flex-none">
                <span className="block text-[9px] text-[#8b928f] uppercase font-black tracking-widest mb-1 leading-none">XP Gained</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-primary">bolt</span>
                  <span className="text-primary font-headline text-2xl font-black">
                    +{isMeWinner ? xpGained : 50}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Winner Profile Avatar Box */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-[#c9a900] rounded-xl blur-lg opacity-25 group-hover:opacity-60 transition duration-1000" />
            <div className="relative glass-panel rounded-xl p-8 border border-outline/25 flex flex-col items-center shadow-2xl overflow-hidden min-w-[280px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent animate-pulse" />
              
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary mb-5 ring-8 ring-secondary/5 relative">
                <img 
                  alt="Winner Avatar" 
                  className="w-full h-full object-cover" 
                  src={isMeWinner 
                    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCNB36cm-sVqvrwdOgA6oJBkL7bHS9ZVEWDvBMFwhHfMMyum4ztwW2QRqiig3edpZjYzWsiTG9GQ6Qb4ZaFr7BtcrZ5XHq9ICRjZguxV7UilUIH1qs3iWazqYhEZgdVVxKk7CVKn5yqUyspo3N94V5sRmMWmORX6u4E9kxYnEGYKye1zFSIoBbn2u3MxY37sx9ms_ITusvJTqHkJtZos9VPXo5aSwQB-yJxOAbEQ3EIN4Fyo9GbeEJrEFl743KVH6FvSW1tQFW9xVQ"
                    : "https://lh3.googleusercontent.com/aida-public/AB6AXuBAMLhBeTkn3zYgA9GKQkXF2KsIQ8XuOwRIAI_gKqk-omTLkYfrMpVmuZCPnxrwua_Oy9ReCPVbMcnzA55SgxPdh8HsJkGxSNik5lCdFSP6LBAV0_o4oy22R4alv7RNVZcWVQ2SBmukC9gK2gmcGQkPENHNQeUxLG5VRMJ8NhY2ur9-1R8LX3Jt8OTZ34SCfeVmXYPCe32swtenvg3CEPnm3grDbT3X43_oYe9MuCQBqvyO9DCBJwUR_raySk5e60uSHRCeAT0TlxU"
                  } 
                />
              </div>

              <h2 className="font-headline text-2xl font-bold text-white">{isMeWinner ? "Alex_Shadow" : winnerName}</h2>
              <span className={`font-black tracking-widest text-[10px] uppercase mt-1 mb-6 flex items-center gap-1.5 justify-center ${rank.color}`}>
                <span className="material-symbols-outlined text-[12px] leading-none">{rank.icon}</span>
                <span>{rank.badge}</span>
              </span>

              {/* Progress level bar */}
              <div className="w-full space-y-1.5 text-left">
                <div className="flex justify-between text-[9px] uppercase font-black tracking-widest leading-none">
                  <span className={`font-bold ${rank.color}`}>Level {rank.level}</span>
                  <span className="text-[#8b928f]">
                    {xpProgressText}
                  </span>
                </div>
                <div className="w-full bg-[#111e1a] rounded-full h-1.5 overflow-hidden relative border border-white/[0.03]">
                  {/* Progress bar gradient aligned with rank theme */}
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                      rank.color.includes("emerald") ? "from-emerald-600 to-emerald-400" :
                      rank.color.includes("blue") ? "from-blue-600 to-blue-400" :
                      rank.color.includes("amber") ? "from-amber-600 to-[#e9c349]" :
                      rank.color.includes("purple") ? "from-purple-600 to-purple-400" :
                      rank.color.includes("e9c349") ? "from-amber-600 to-[#e9c349]" :
                      "from-zinc-600 to-zinc-400"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Standings & Sessions performance stats */}
      <section className="w-full max-w-5xl space-y-6">
        <h3 className="font-headline text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
          <span>Final Standings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main position list table (8 cols) */}
          <div className="md:col-span-8 overflow-hidden rounded-xl bg-[#111e1a]/50 border border-outline/10 backdrop-blur-sm">
            <div className="grid grid-cols-12 bg-surface-container-high/80 p-4 text-[9px] font-black uppercase tracking-wider text-[#8b928f] border-b border-outline/5 leading-none">
              <div className="col-span-2">Pos</div>
              <div className="col-span-5">Player Identity</div>
              <div className="col-span-3 text-right">Balance Change</div>
              <div className="col-span-2 text-right">XP</div>
            </div>

            <div className="divide-y divide-outline/5">
              {standings.map((std, i) => (
                <div 
                  key={i} 
                  className={`grid grid-cols-12 items-center p-4 transition-all ${
                    std.isMe 
                      ? "bg-[#e9c349]/5 hover:bg-[#e9c349]/10" 
                      : "hover:bg-surface-container"
                  }`}
                >
                  <div className={`col-span-2 font-headline font-black text-base ${std.isMe ? "text-secondary text-lg" : "text-[#8b928f]"}`}>
                    {std.pos}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-9 h-9 rounded bg-surface-container-highest border flex items-center justify-center text-xs font-bold ${
                        std.isMe ? "border-secondary/40 text-secondary" : "border-outline/10 text-white"
                      }`}>
                        {std.code}
                      </div>
                      {std.isMe && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-secondary rounded-full border border-surface flex items-center justify-center">
                          <span className="material-symbols-outlined text-[8px] font-bold text-[#241a00]">check</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-sm ${std.isMe ? "text-white font-bold" : "text-[#8b928f]"}`}>{std.name}</span>
                  </div>
                  <div className={`col-span-3 text-right font-headline font-bold ${
                    std.change.startsWith("+") ? "text-secondary font-black" : "text-[#ffb4ab]"
                  }`}>
                    {std.change}
                  </div>
                  <div className="col-span-2 text-right text-primary font-semibold">
                    {std.xp}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Stats Metrics (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-xl border border-outline/10 flex-grow">
              
              <div className="flex items-center gap-2 mb-6 border-b border-outline/5 pb-3">
                <span className="material-symbols-outlined text-secondary text-xl">analytics</span>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary">Session Performance</h4>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#8b928f] text-[10px] font-black uppercase tracking-widest">Bluff Success</span>
                    <span className="font-headline font-black text-white text-sm">{isMeWinner ? "82%" : "44%"}</span>
                  </div>
                  <div className="w-full bg-[#111e1a] rounded-full h-1">
                    <div className="bg-secondary h-full rounded-full" style={{ width: isMeWinner ? "82%" : "44%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#8b928f] text-[10px] font-black uppercase tracking-widest">Confidence Index</span>
                    <span className="font-headline font-black text-white text-sm">{isMeWinner ? "64%" : "30%"}</span>
                  </div>
                  <div className="w-full bg-[#111e1a] rounded-full h-1">
                    <div className="bg-primary h-full rounded-full" style={{ width: isMeWinner ? "64%" : "30%" }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-outline/10">
                <p className="text-[9px] font-black uppercase text-[#8b928f] tracking-widest mb-3">Milestone Achieved</p>
                <div className={`flex items-center gap-3 p-3 bg-gradient-to-r ${rank.bgGrad} rounded border ${rank.borderClass}`}>
                  <div className={`w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center ${rank.color} border ${rank.borderClass} shadow-md`}>
                    <span className="material-symbols-outlined text-xl">{rank.icon}</span>
                  </div>
                  <div className="text-left">
                    <p className={`text-[10px] font-black uppercase leading-none ${rank.color}`}>{rank.badge}</p>
                    <p className="text-[11px] font-bold text-white mt-1 leading-none">Level {rank.level} Reputation</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Action Buttons underneath */}
      <section className="w-full max-w-5xl mt-12 mb-10 flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
          
          {/* Main play action */}
          <button 
            onClick={onPlayAgain}
            className="w-full md:w-auto hover:scale-105 active:scale-95 transition-all text-[#241a00] bg-gradient-to-br from-[#e9c349] to-[#af8d11] px-14 py-4.5 rounded font-headline font-black tracking-widest uppercase text-base shadow-[0_5px_20px_rgba(233,195,73,0.3)] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span className="material-symbols-outlined font-bold text-lg">replay</span>
            <span>Play Again</span>
          </button>

          {/* Aux action triggers */}
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => alert("Copied invitation link to clipboard!")}
              className="flex-1 md:flex-none hover:bg-white/5 border border-outline/20 hover:border-white transition-all text-[#d7e6df] px-8 py-4.5 rounded font-headline font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">share</span>
              <span>Share</span>
            </button>
            <button 
              onClick={onGoLobby}
              className="flex-1 md:flex-none hover:bg-white/5 border border-outline/20 hover:border-white transition-all text-[#8b928f] hover:text-white px-8 py-4.5 rounded font-headline font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Lobby</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
