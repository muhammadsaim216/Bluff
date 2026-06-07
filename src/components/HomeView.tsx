import React, { useState, useEffect } from "react";
import { TOP_PLAYERS } from "../data";
import { Player } from "../types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface HomeViewProps {
  onPlayNow: () => void;
  onViewLobby: () => void;
  userChips: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ onPlayNow, onViewLobby, userChips }) => {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  // Subscribe to real-time leaderboard stats
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "leaderboards"), (snapshot) => {
      const entries: Player[] = [];
      snapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as Player);
      });
      // Sort desc by chips count
      entries.sort((a, b) => b.chips - a.chips);
      setLeaderboard(entries);
    }, (error) => {
      console.warn("Could not synchronize leaderboards with cloud collection.", error);
    });
    return () => unsubscribe();
  }, []);

  const activeLeaderboard = leaderboard.length > 0 ? leaderboard : TOP_PLAYERS;

  return (
    <div className="bg-[#091612] text-[#d7e6df] font-sans pb-24 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden felt-texture-lite px-6 py-20">
        <div 
          className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-overlay bg-cover bg-center" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDyLaTAqDGHX4zb-i-ehZvZAKK1RrqC45MaiJnG29Yw-xZXZTyVIXBg4tPexUb02KGYVEEKLYdvxO35YJW_SxV7FDNjuM6bPcqRvOlgmVaADu-GFLL-vnBRWROZdYC5U2h3FqnxG47xJbizJUuLW0_NanK7h-As5btaCMEyYBLfW0Hdt3Qq9RqY9a_a1yTHSE4Cp1c6AuYAWWEA1uSp_ExNIclwYUul9Ol9mM4bmDzNckTMbIBJmhEZ_nUIU1l9WUdfz3jtPOtonAQ')" }}
        />
        <div className="absolute inset-0 velvet-shadow pointer-events-none" />
        
        {/* Ambient spotlight glowing effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl text-center">
          <h1 className="font-headline text-5xl sm:text-6xl md:text-8xl font-black text-secondary tracking-tighter mb-6 uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] leading-none">
            Master the <span className="text-white">Art</span> <br className="sm:hidden" />of Deception
          </h1>
          <p className="font-sans text-lg sm:text-xl md:text-2xl text-[#c1c8c4] max-w-2xl mx-auto mb-12 leading-relaxed opacity-95">
            Step into the Velvet Shadow Underground. High stakes, higher pressure. Can you lie your way to the top?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={onPlayNow}
              className="w-full sm:w-auto hover:scale-105 active:scale-95 transition-all text-[#241a00] font-headline font-black text-lg px-12 py-5 rounded bg-gradient-to-br from-[#e9c349] to-[#af8d11] shadow-[0_15px_30px_rgba(233,195,73,0.3)] flex items-center justify-center gap-3 cursor-pointer group"
            >
              Play Now
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">rocket_launch</span>
            </button>
            <button 
              onClick={onViewLobby}
              className="w-full sm:w-auto hover:bg-[#1a3a32]/40 hover:text-white transition-all text-secondary font-headline font-bold tracking-[0.2em] px-12 py-5 rounded border border-secondary/30 active:scale-95 cursor-pointer uppercase text-sm"
            >
              View Lobby
            </button>
          </div>
        </div>

        {/* Floating cards matching mocks */}
        <div className="absolute -bottom-10 left-[12%] transform -rotate-12 hidden lg:block animate-pulse duration-[5s]">
          <div className="w-48 h-72 bg-surface-container-highest rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-outline/25 p-4 relative overflow-hidden group hover:border-secondary transition-colors duration-300">
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_center,var(--color-secondary),transparent_70%)]" />
            <div className="text-secondary font-headline text-4xl font-extrabold">K</div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-secondary/15" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
            </div>
            <div className="absolute bottom-4 right-4 text-secondary/30 font-headline font-bold transform rotate-180">K</div>
          </div>
        </div>

        <div className="absolute bottom-16 right-[12%] transform rotate-6 hidden lg:block animate-pulse duration-[6s]">
          <div className="w-48 h-72 bg-surface-container-highest rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-outline/25 p-4 relative overflow-hidden group hover:border-white transition-colors duration-300">
            <div className="text-white font-headline text-4xl font-extrabold">A</div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-white/5" style={{ fontVariationSettings: "'FILL' 1" }}>playing_cards</span>
            </div>
            <div className="absolute bottom-4 right-4 text-white/10 font-headline font-bold transform rotate-180">A</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* How to Play Card (7 cols) */}
          <div className="md:col-span-7 bg-surface-container rounded-xl p-8 sm:p-10 flex flex-col justify-between group overflow-hidden relative border border-outline/5 hover:border-secondary/20 transition-all duration-300 shadow-xl">
            <div className="relative z-10 max-w-xl">
              <h2 className="font-headline text-3xl sm:text-4xl font-bold text-secondary mb-8">How to Play</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-[#1a3a32] border border-secondary/20 flex items-center justify-center text-secondary font-headline font-bold text-sm shadow-inner">01</span>
                  <div>
                    <p className="text-white font-semibold text-base">Dealt Invisible Hands</p>
                    <p className="text-[#8b928f] text-sm mt-0.5">Each player is dealt a hand of cards, completely hidden from others.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-[#1a3a32] border border-secondary/20 flex items-center justify-center text-secondary font-headline font-bold text-sm shadow-inner">02</span>
                  <div>
                    <p className="text-white font-semibold text-base">Claim High Value Ranks</p>
                    <p className="text-[#8b928f] text-sm mt-0.5">Play cards face down while claiming their rank. You can tell the truth or bluff to win.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-[#1a3a32] border border-secondary/20 flex items-center justify-center text-secondary font-headline font-bold text-sm shadow-inner">03</span>
                  <div>
                    <p className="text-white font-semibold text-base">Interrogate and Call Bluffs</p>
                    <p className="text-[#8b928f] text-sm mt-0.5">Call 'BLUFF' on opponents! If they lied, they pick up the pile. If they told the truth, they laugh as you take the pile.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="absolute bottom-[-15%] right-[-10%] w-[260px] opacity-[0.15] group-hover:opacity-40 group-hover:scale-105 transition-all duration-500 pointer-events-none hidden sm:block">
              <img 
                alt="Playing Cards fanned out deck" 
                className="rounded-tl-2xl shadow-2xl border-l border-t border-outline/30" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTgL14DiKZ-tm2YYrHOw_fomgLJRrF2ejbWQHyYOTG1oTxztFYerbHe_o7mbhs4gtYPpEtCcW26Vqldm3gKuMR0ulxn1ogximUg6uftX7fqhG9WtUt80WKRKlw8QD9zK5VgeuIZmMAYWsu0Z2hDcMfL5lr7yMwjpkdzp3fml3220_Y6ZubRjJX4GaaSQUIW0ln_1KgDg_MjEKDUAmHZcY8bK527-uh6HhmsjJO2M4TnZZD_4C3x8BxXoN4FWWoc6Yz3IF6S9lQH6I"
              />
            </div>
          </div>

          {/* Global Lobby Stat Panel (5 cols) */}
          <div className="md:col-span-12 lg:col-span-5 bg-surface-container-high rounded-xl p-8 flex flex-col justify-center border border-outline/10 hover:border-[#abcec2]/30 transition-all duration-300 shadow-xl">
            <span className="material-symbols-outlined text-secondary text-5xl mb-6">public</span>
            <h3 className="font-headline text-3xl font-bold text-white mb-3">Global Lobby</h3>
            <p className="text-[#8b928f] mb-8 leading-relaxed text-sm sm:text-base">
              Connect with master deceivers across the globe 24/7. High pressure matches, cash games, and legendary tournaments. Always an open seat at the table.
            </p>
            <div className="flex items-center gap-4 bg-[#091612]/70 p-4 rounded-xl border border-outline/15 shadow-inner">
              <div className="flex -space-x-3">
                <img 
                  className="w-10 h-10 rounded-full border-2 border-surface shadow-lg object-cover" 
                  alt="Avatar 1"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjavyRAEMq8vNyv0EGX_oaQ1jg10m6x6z8Fai8x9h7xUjvQj7RCAm_URnn0VRFNhXsHJ03s1ythXYPaAqG4wOEOD0zyzwM2EDTL-4VrvkKC3SpIWEDWIIw4_jbBxB-Xez_6CH1rMzGIHTzdEnSKzaPZ0QEDiG8pKJ0lklXvNuQalIXcXHsmJgfgZDCt9bM19rkqGobk9L8z_8lhp9vpJQWjMcR8EOQHXYByYnSUx_ZTWH7Ljz6ygmPQ6p1dR7luDtdwuFCqG8sof8"
                />
                <img 
                  className="w-10 h-10 rounded-full border-2 border-surface shadow-lg object-cover" 
                  alt="Avatar 2"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4eXKjzzppFL5Mpvtp_BnpOUYyZsGjfBa_giWQp6qG0hU1BNazAkHbZTGBn80rUvjhL3u8kDqKwXKBCaXQS8flhO13H4ksTPlUellI2XWDIB0tXkDdXUqSg0yKtBxCdLumFxlRCl-cXfmJKZO4mrEXNSOgUDQeU4anZ430kC1wMdfXg-eqmp8lsMjlnlZ6EOEMAe8PoMDuooatek25SwZnucPeeLJxgXDgttDhQu3ARyNezVbUvsC8LlR9ZY5D9JhvC_M_Fbx6aJI"
                />
                <img 
                  className="w-10 h-10 rounded-full border-2 border-surface shadow-lg object-cover" 
                  alt="Avatar 3"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2pJvkvnk0iiS7SUUuPU6fFa7SEu-8VyC2Z-Oj1pmHz3Me-YVK8p5PsxFxMjJNzhXaQTisT3nro1QAY2aw1kjOPQxFvIMsp-1wjWrF2EbG7B-PcaN61LOS0RPybs0J0aF2ZtpksINqdlWhYR5sLaqDmqsBSvvPa9BTS1Shd2tNz5rbWL1aqLtsq5lH3sCJRffyK_whK6oHT7q5el6zmQDlhzu-PQGPRR37SHJTmYpNrlnDLzkRi82sootNaj8GQHxKdy8rU4D77Bc"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#e9c349] font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#e9c349] rounded-full animate-ping"></span> Live Underground
                </span>
                <span className="text-xs font-bold text-white">1,248 Active Deceivers</span>
              </div>
            </div>
          </div>

          {/* Quick Rows */}
          <div className="md:col-span-4 bg-[#1a3a32]/10 rounded-xl p-8 border border-[#abcec2]/10 hover:border-[#abcec2]/30 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-secondary text-4xl mb-4 group-hover:scale-110 transition-transform">trophy</span>
              <h3 className="font-headline text-xl font-bold text-white mb-2">Tournament Play</h3>
              <p className="text-[#8b928f] text-sm leading-relaxed">Daily knock-outs and weekend grand slams for the elite deceivers.</p>
            </div>
            <span className="text-secondary text-[10px] font-black tracking-wider uppercase mt-4 block">Weekend Leagues &rarr;</span>
          </div>

          <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 border border-outline/5 hover:border-secondary/20 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-secondary text-4xl mb-4 group-hover:scale-110 transition-transform font-bold">leaderboard</span>
              <h3 className="font-headline text-xl font-bold text-white mb-2">Grandmaster Tier</h3>
              <p className="text-[#8b928f] text-sm leading-relaxed">Climb the ranks from Gold to Legendary Velvet Shadow. Claim your legacy.</p>
            </div>
            <span className="text-secondary text-[10px] font-black tracking-wider uppercase mt-4 block">Current Season #4 &rarr;</span>
          </div>

          <div className="md:col-span-4 bg-[#e9c349]/5 rounded-xl p-8 border border-secondary/10 hover:border-secondary/30 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-secondary text-4xl mb-4 group-hover:scale-110 transition-transform">payments</span>
              <h3 className="font-headline text-xl font-bold text-white mb-2">Refill Chips</h3>
              <p className="text-[#8b928f] text-sm leading-relaxed">Continuous banking support. Play tables of all size levels instantly.</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-secondary text-xs uppercase font-black tracking-widest">{userChips.toLocaleString()} Chips Available</span>
              <span className="text-secondary text-xs">&rarr;</span>
            </div>
          </div>

        </div>
      </section>

      {/* Leaderboard Section - The Inner Circle */}
      <section className="py-24 bg-surface-container-low relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat bg-contain"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0Tr61Mqlk68Fm7Iwtqs1lFFuFf_647S_v0_GOxyVcZFmYPSBnV2JT-D1u4bDIw6h0S5dYEO8nVDhjT9HzAHJS9Yhd12F4sCrSDLdwkM0M82rcz3fhtw1HxM-213mlQHfXRwQbVOlQATPopjEVzJuBGzXsE6JqvIewZRGWNI1GA-RhaVb0u5DxSDFXFa8ZtLpFv9djUthcZSuCC-1RAHfglzs74BinPDjrEI1AFaSUAHwuJB_VeATbqQUXbpM8DgOrbfEJTsfxRIw')" }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-16">
            <span className="text-secondary uppercase font-headline tracking-[0.2em] font-black text-xs">The Leaderboards</span>
            <h2 className="font-headline text-4xl md:text-5xl font-black text-white uppercase tracking-tight mt-2">The Inner Circle</h2>
            <div className="h-1 w-24 bg-secondary mx-auto mt-4 rounded-full shadow-[0_2px_10px_rgba(233,195,73,0.5)]" />
            <p className="text-[#8b928f] mt-4 font-semibold">Top performers of the current season</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6 lg:px-12">
            {activeLeaderboard.slice(0, 3).map((player) => {
              const isLead = player.id === "velvet_queen";
              return (
                <div 
                  key={player.id} 
                  className={`glass-panel p-8 rounded-xl flex flex-col justify-between transition-all duration-500 relative ${
                    isLead 
                      ? "border-secondary/40 md:scale-105 shadow-[0_15px_40px_rgba(233,195,73,0.15)] bg-gradient-to-tr from-surface-container-high via-surface-container to-[#1a3a32]/40" 
                      : "border-outline/10 hover:border-secondary/40 hover:bg-[#1a3a32]/10"
                  }`}
                >
                  {isLead && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-[#241a00] px-5 py-1 text-[10px] font-black uppercase tracking-[0.22em] rounded-full shadow-lg">
                      Season Leader
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <img 
                          className={`w-16 h-16 rounded-full object-cover shadow-lg border-2 ${isLead ? "border-secondary" : "border-[#8b928f]/30"}`} 
                          alt={player.name}
                          src={player.avatar}
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#091612] border-2 border-[#15221e] rounded-full flex items-center justify-center">
                          {isLead ? (
                            <span className="material-symbols-outlined text-secondary text-xs font-bold leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                          ) : (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-white text-lg leading-tight">{player.name}</h4>
                        <span className="text-[10px] font-black tracking-widest text-[#8b928f] uppercase block mt-1">{player.rank}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-black/20 p-4 rounded-lg text-center border border-outline/5 shadow-inner">
                        <span className={`block font-headline text-2xl font-black ${isLead ? "text-secondary" : "text-white"}`}>
                          {isLead ? player.stats.winRate : player.stats.bluffRate}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-[#8b928f] tracking-widest mt-1 block">
                          {isLead ? "Win Rate" : "Bluff Rate"}
                        </span>
                      </div>
                      <div className="bg-black/20 p-4 rounded-lg text-center border border-outline/5 shadow-inner">
                        <span className="block font-headline text-2xl font-black text-white">
                          {isLead ? player.stats.totalPot : player.stats.chipsWon}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-[#8b928f] tracking-widest mt-1 block">
                          {isLead ? "Total Bank" : "Chips Won"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-outline/5 flex items-center justify-between text-xs text-[#8b928f]">
                    <span>Weekly Gain</span>
                    <span className="text-secondary font-headline font-bold font-mono">{player.stats.weeklyGain}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA Section - The Table Awaits */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] pointer-events-none" />
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-secondary to-[#af8d11] p-[1.5px] rounded-xl shadow-[0_30px_70px_rgba(0,0,0,0.65)] group">
          <div className="bg-surface p-12 sm:p-16 rounded-xl text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-secondary group-hover:opacity-10 transition-opacity pointer-events-none" />
            <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 uppercase italic tracking-tighter leading-none">
              The Table Awaits
            </h2>
            <p className="text-[#8b928f] text-base sm:text-lg mb-10 max-w-xl mx-auto font-medium leading-relaxed">
              Don't let them read your tell. Join the most exclusive bluffing club in the digital world today. Refill chips or challenge the best.
            </p>
            <button 
              onClick={onPlayNow}
              className="hover:scale-105 active:scale-95 transition-all text-[#241a00] bg-gradient-to-b from-[#e9c349] to-[#af8d11] px-12 py-5 font-headline font-black text-xl rounded shadow-[0_15px_30px_rgba(233,195,73,0.3)] flex items-center justify-center gap-3 mx-auto cursor-pointer"
            >
              Enter the Underground
              <span className="material-symbols-outlined text-2xl">login</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
