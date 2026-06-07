/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ScreenType, LobbyTable, getRankInfo } from "./types";
import { HomeView } from "./components/HomeView";
import { LobbyView } from "./components/LobbyView";
import { TableView } from "./components/TableView";
import { SummaryView } from "./components/SummaryView";
import { BuyChipsModal } from "./components/BuyChipsModal";
import { BlackMarketView } from "./components/BlackMarketView";
import { BlacklistView } from "./components/BlacklistView";
import { StrategyVaultView } from "./components/StrategyVaultView";
import { useAuth } from "./AuthContext";
import { seedDatabaseIfNeeded } from "./dbSeeder";
import { AnimatedCounter } from "./components/AnimatedCounter";
import { AuthGate } from "./components/AuthGate";

export default function App() {
  const [screen, setScreen] = useState<ScreenType>("home");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  
  // Real Firestore backend and Authentication state managers
  const { user, userData, isLoggingIn, showBonusModal, setShowBonusModal, signIn, logOut, updateChips, updateXP, unlockItem, equipItem } = useAuth();

  // Close Auth Modal if user has successfully logged in
  useEffect(() => {
    if (user) {
      setShowAuthModal(false);
    }
  }, [user]);

  // Run dynamic DB synchronization seeder
  useEffect(() => {
    if (user) {
      seedDatabaseIfNeeded();
    }
  }, [user]);

  // Guest-mode local persistence fallback
  const [guestChips, setGuestChips] = useState<number>(() => {
    const saved = localStorage.getItem("bluff_chips");
    return saved ? parseInt(saved, 10) : 42850;
  });
  const [guestCardBack, setGuestCardBack] = useState<string>(() => {
    return localStorage.getItem("equipped_card_back") || "default";
  });
  const [guestTableFelt, setGuestTableFelt] = useState<string>(() => {
    return localStorage.getItem("equipped_table_felt") || "default-felt";
  });
  const [guestUnlockedItems, setGuestUnlockedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem("unlocked_items");
    return saved ? JSON.parse(saved) : ["default", "default-felt"];
  });

  // Dual-mode state resolvers: seamlessly bridge cloud-database versus standard local savings
  const activeChips = user ? (userData?.chips ?? 0) : guestChips;
  const activeCardBack = user ? (userData?.equippedCardBack ?? "default") : guestCardBack;
  const activeTableFelt = user ? (userData?.equippedTableFelt ?? "default-felt") : guestTableFelt;
  const activeUnlockedItems = user ? (userData?.unlockedItems ?? ["default", "default-felt"]) : guestUnlockedItems;

  const [selectedTable, setSelectedTable] = useState<LobbyTable | null>(null);
  const [customPlayerName, setCustomPlayerName] = useState<string>("You");
  const [isRefillOpen, setIsRefillOpen] = useState<boolean>(false);

  const handleEquipItem = async (type: "card-back" | "table-felt", id: string) => {
    if (user) {
      await equipItem(type, id);
    } else {
      if (type === "card-back") {
        setGuestCardBack(id);
        localStorage.setItem("equipped_card_back", id);
      } else {
        setGuestTableFelt(id);
        localStorage.setItem("equipped_table_felt", id);
      }
    }
  };

  const handleBuyItem = async (id: string, price: number) => {
    if (user) {
      await unlockItem(id, price);
    } else {
      setGuestChips((prev) => {
        const updated = Math.max(0, prev - price);
        localStorage.setItem("bluff_chips", updated.toString());
        return updated;
      });
      setGuestUnlockedItems((prev) => {
        const updated = [...prev, id];
        localStorage.setItem("unlocked_items", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Game results
  const [winnerName, setWinnerName] = useState<string>("You");
  const [rewardChips, setRewardChips] = useState<number>(12500);
  const [xpGained, setXpGained] = useState<number>(450);

  // Messenger buddy chat simulations
  const [activeChatFriend, setActiveChatFriend] = useState<string | null>(null);
  const [directMessages, setDirectMessages] = useState<{sender: string; text: string}[]>([
    { sender: "System", text: "End-to-end sandbox chat initiated." }
  ]);
  const [directInput, setDirectInput] = useState<string>("");

  const handleOpenChat = (friendName: string) => {
    setActiveChatFriend(friendName);
    setDirectMessages([
      { sender: "System", text: `Private chat with ${friendName} active.` },
      { sender: friendName, text: `Hey! Are you aiming to play at the high stakes table? Challenge me in Chess or Bluff!`, }
    ]);
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInput.trim()) return;

    setDirectMessages((prev) => [...prev, { sender: "You", text: directInput.trim() }]);
    const currentInput = directInput.trim();
    setDirectInput("");

    // Simulate instant reaction delay
    setTimeout(() => {
      setDirectMessages((prev) => [
        ...prev,
        { sender: activeChatFriend || "Friend", text: `Haha, fair enough! Let's see you try inside the room!` }
      ]);
    }, 1500);
  };

  const handleJoinTable = (table: LobbyTable, playerCustomName: string) => {
    setCustomPlayerName(playerCustomName || "You");
    setSelectedTable(table);
    setScreen("table");
  };

  const handleFinishGame = async (winner: string, reward: number, xp: number) => {
    setWinnerName(winner);
    setRewardChips(reward);
    setXpGained(xp);
    if (winner === "You") {
      if (user) {
        await updateChips(reward);
        await updateXP(xp);
      } else {
        setGuestChips((prev) => {
          const updated = prev + reward;
          localStorage.setItem("bluff_chips", updated.toString());
          return updated;
        });
      }
    }
    setScreen("victory");
  };

  const handleChangeChipsOnAction = async (diff: number) => {
    if (user) {
      await updateChips(diff);
    } else {
      setGuestChips((prev) => {
        const updated = Math.max(0, prev + diff);
        localStorage.setItem("bluff_chips", updated.toString());
        return updated;
      });
    }
  };

  const handlePurchaseRefill = async (qty: number) => {
    if (user) {
      await updateChips(qty);
    } else {
      setGuestChips((prev) => {
        const updated = prev + qty;
        localStorage.setItem("bluff_chips", updated.toString());
        return updated;
      });
    }
  };

  if (isLoggingIn) {
    return (
      <div className="min-h-screen bg-[#050c0a] text-[#d7e6df] font-sans flex flex-col items-center justify-center relative overflow-hidden">
        {/* Soft emerald pulse glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-secondary/5 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full border-4 border-secondary/10 border-t-secondary animate-spin mb-5"></div>
          <h2 className="font-headline font-black text-xl text-white tracking-widest leading-none mb-2">Establishing Secure Connection...</h2>
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-secondary font-black animate-pulse">Decrypting clearance tokens...</p>
        </div>
      </div>
    );
  }

  // Render main screen directly for visitors or authenticated users alike
  return (
    <div className="min-h-screen bg-[#091612] text-[#d7e6df] font-sans flex flex-col selection:bg-secondary/30 selection:text-secondary selection:outline-none">
      
      {/* Global Underground Header elements */}
      <header className="bg-surface-container-low/95 border-b border-outline/10 h-20 px-6 shrink-0 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen("home")}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-[#af8d11] flex items-center justify-center font-headline font-black text-[#241a00] text-xl tracking-tighter shadow-[0_0_15px_rgba(233,195,73,0.3)]">
            B
          </div>
          <div>
            <h1 className="font-headline font-black text-xl text-white tracking-widest leading-none">BLUFF</h1>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#e9c349] font-black flex items-center gap-1.5 mt-0.5 select-none leading-none">
              <span className="w-1.5 h-1.5 bg-[#e9c349] rounded-full animate-pulse"></span> Shadow Underground
            </span>
          </div>
        </div>

        {/* Dynamic Route Nav-links - Simple interactive active check */}
        <nav className="hidden lg:flex items-center gap-6 text-[11px] uppercase tracking-wider font-extrabold select-none">
          <button 
            onClick={() => setScreen("home")}
            className={`cursor-pointer transition-colors py-1 ${screen === "home" ? "text-secondary border-b-2 border-secondary font-black" : "text-[#8b928f] hover:text-white"}`}
          >
            Home
          </button>
          <button 
            onClick={() => setScreen("lobby")}
            className={`cursor-pointer transition-colors py-1 ${screen === "lobby" || screen === "table" ? "text-secondary border-b-2 border-secondary font-black" : "text-[#8b928f] hover:text-white"}`}
          >
            Lobby
          </button>
          <button 
            onClick={() => setScreen("market")}
            className={`cursor-pointer transition-colors py-1 ${screen === "market" ? "text-secondary border-b-2 border-secondary font-black" : "text-[#8b928f] hover:text-white"}`}
          >
            Black Market
          </button>
          <button 
            onClick={() => setScreen("blacklist")}
            className={`cursor-pointer transition-colors py-1 ${screen === "blacklist" ? "text-secondary border-b-2 border-secondary font-black" : "text-[#8b928f] hover:text-white"}`}
          >
            Blacklist Intel
          </button>
          <button 
            onClick={() => setScreen("strategy")}
            className={`cursor-pointer transition-colors py-1 ${screen === "strategy" ? "text-secondary border-b-2 border-secondary font-black" : "text-[#8b928f] hover:text-white"}`}
          >
            Strategy Vault
          </button>
          <button 
            onClick={() => {
              setWinnerName("You");
              setRewardChips(12500);
              setXpGained(450);
              setScreen("victory");
            }}
            className={`cursor-pointer transition-colors py-1 ${screen === "victory" ? "text-secondary border-b-2 border-secondary font-black" : "text-[#8b928f] hover:text-white"}`}
          >
            Win Stats
          </button>
        </nav>

        {/* User Balance Chips & Unified Header Auth Badge */}
        <div className="flex items-center gap-4">
          
          {/* User Profile Info Badge if Logged In */}
          {user ? (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#0e1d19] border border-secondary/15 rounded-full shadow-inner select-none">
              <img 
                src={userData?.avatar || user.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDTgL14DiKZ-tm2YYrHOw_fomgLJRrF2ejbWQHyYOTG1oTxztFYerbHe_o7mbhs4gtYPpEtCcW26Vqldm3gKuMR0ulxn1ogximUg6uftX7fqhG9WtUt80WKRKlw8QD9zK5VgeuIZmMAYWsu0Z2hDcMfL5lr7yMwjpkdzp3fml3220_Y6ZubRjJX4GaaSQUIW0ln_1KgDg_MjEKDUAmHZcY8bK527-uh6HhmsjJO2M4TnZZD_4C3x8BxXoN4FWWoc6Yz3IF6S9lQH6I"} 
                alt="Account profile picture" 
                className="w-7 h-7 rounded-full border border-secondary/20 object-cover shadow"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-white font-bold text-xs leading-none">{userData?.name || user.displayName || "Unknown User"}</span>
                {(() => {
                  const rankInfo = getRankInfo(userData?.xp ?? 0);
                  return (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`material-symbols-outlined text-[10px] ${rankInfo.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {rankInfo.icon}
                      </span>
                      <span className={`text-[8px] font-mono font-black ${rankInfo.color} tracking-widest uppercase`}>
                        {rankInfo.badge} (Lvl {rankInfo.level})
                      </span>
                    </div>
                  );
                })()}
              </div>
              <button 
                onClick={logOut}
                className="text-zinc-500 hover:text-red-400 p-1 duration-150 rounded cursor-pointer ml-1"
                title="Log Out of Underground"
              >
                <span className="material-symbols-outlined text-[16px] leading-none">logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-secondary to-[#af8d11] text-[#241a00] font-headline font-black text-xs uppercase tracking-wider rounded border border-[#cdaa2c] shadow-[0_4px_12px_rgba(233,195,73,0.15)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-black">login</span>
              <span>Login / Sign Up</span>
            </button>
          )}

          <div 
            onClick={() => setIsRefillOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#12221d] rounded-full border border-secondary/25 shadow-lg cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all text-sm group"
            title="Refill bank of chips"
          >
            <span className="material-symbols-outlined text-secondary text-lg group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
            <span className="font-headline font-black text-white font-mono">
              <AnimatedCounter value={activeChips} />
            </span>
          </div>

          <button 
            onClick={() => setIsRefillOpen(true)} 
            className="hidden sm:flex items-center justify-center p-2 rounded-full border border-outline/10 text-[#8b928f] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Add chips"
          >
            <span className="material-symbols-outlined text-base">add</span>
          </button>
        </div>
      </header>

      {/* Primary Route Container Render switcher */}
      <div className="flex-1 flex flex-col">
        {screen === "home" && (
          <HomeView 
            onPlayNow={() => setScreen("lobby")} 
            onViewLobby={() => setScreen("lobby")}
            userChips={activeChips}
          />
        )}

        {screen === "lobby" && (
          <LobbyView 
            onJoinTable={handleJoinTable}
            userChips={activeChips}
            onOpenRefill={() => setIsRefillOpen(true)}
            onOpenChat={handleOpenChat}
            userData={userData}
          />
        )}

        {screen === "table" && selectedTable && (
          <TableView 
            selectedTable={selectedTable}
            userChips={activeChips}
            onLeaveTable={() => {
              setSelectedTable(null);
              setScreen("lobby");
            }}
            onFinishGame={handleFinishGame}
            onChangeChips={handleChangeChipsOnAction}
            equippedCardBack={activeCardBack}
            equippedTableFelt={activeTableFelt}
            customPlayerName={customPlayerName}
          />
        )}

        {screen === "market" && (
          <BlackMarketView 
            userChips={activeChips}
            equippedCardBack={activeCardBack}
            equippedTableFelt={activeTableFelt}
            unlockedItems={activeUnlockedItems}
            onEquipItem={handleEquipItem}
            onBuyItem={handleBuyItem}
            onOpenRefill={() => setIsRefillOpen(true)}
          />
        )}

        {screen === "blacklist" && (
          <BlacklistView />
        )}

        {screen === "strategy" && (
          <StrategyVaultView />
        )}

        {screen === "victory" && (
          <SummaryView 
            winnerName={winnerName}
            rewardChips={rewardChips}
            xpGained={xpGained}
            userXP={userData?.xp ?? 0}
            onPlayAgain={() => {
              if (selectedTable) {
                setScreen("table");
              } else {
                setScreen("lobby");
              }
            }}
            onGoLobby={() => {
              setSelectedTable(null);
              setScreen("lobby");
            }}
          />
        )}
      </div>

      {/* Global Buy chips modal panel */}
      <BuyChipsModal 
        isOpen={isRefillOpen}
        onClose={() => setIsRefillOpen(false)}
        onPurchase={handlePurchaseRefill}
      />

      {/* Real-Time Database Sign Up Bonus Celebration Popup */}
      {showBonusModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div 
            className="bg-[#0b1713] border border-secondary/30 w-full max-w-lg p-8 sm:p-10 rounded-2xl shadow-3xl text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient gold glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-secondary/20 blur-[60px] pointer-events-none" />
            
            <div className="relative z-10">
              <span className="material-symbols-outlined text-6xl text-secondary animate-bounce mb-4 block animate-duration-1000" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              
              <h3 className="font-headline text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
                Underground Welcome!
              </h3>
              
              <p className="text-secondary font-headline font-black text-xs uppercase tracking-[0.25em] mb-6">
                Claim Your Ultimate Signup Bonus
              </p>

              <div className="bg-[#12221d] border border-secondary/25 py-6 px-4 rounded-xl shadow-inner mb-8 flex flex-col items-center justify-center max-w-sm mx-auto">
                <span className="material-symbols-outlined text-5xl text-secondary animate-pulse mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                <span className="text-white text-3xl font-mono font-black tracking-tight">+207,150 Chips</span>
                <span className="text-[10px] text-[#8b928f] uppercase tracking-widest mt-1.5 font-bold">Total Balance: 250,000 Coins</span>
              </div>

              <p className="text-[#8b928f] text-sm leading-relaxed max-w-md mx-auto mb-8">
                Welcome to the Velvet Shadow Underground, <span className="text-white font-bold">{userData?.name || user?.displayName || "Agent"}</span>! 
                We have credited your account with an elite welcome package so you can play immediately on any high stakes tables.
              </p>

              <button
                onClick={() => {
                  setShowBonusModal(false);
                  setScreen("lobby");
                }}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-secondary to-[#af8d11] text-[#241a00] font-headline font-black text-xs uppercase tracking-widest rounded shadow-[0_10px_20px_rgba(233,195,73,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Claim & Play Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Direct Messaging Drawer Chat Overlay */}
      {activeChatFriend && (
        <div className="fixed bottom-4 left-4 z-[99] w-80 shadow-2xl rounded-2xl overflow-hidden border border-secondary/35 glass-panel animate-fade-in">
          <div className="bg-[#15221e] px-4 py-3 border-b border-outline/15 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-white">{activeChatFriend}</span>
            </div>
            <button 
              onClick={() => setActiveChatFriend(null)}
              className="text-outline hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <div className="p-4 h-64 overflow-y-auto space-y-3 custom-scrollbar flex flex-col justify-end bg-black/20">
            {directMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`text-[11px] p-2 rounded-lg max-w-[85%] ${
                  msg.sender === "System" 
                    ? "bg-[#111e1a]/80 text-[#8b928f] mx-auto text-center font-mono w-full"
                    : msg.sender === "You"
                      ? "bg-secondary text-[#241a00] ml-auto font-bold"
                      : "bg-[#15221e] text-[#d7e6df] mr-auto"
                }`}
              >
                {msg.sender !== "System" && (
                  <p className="text-[8px] font-black uppercase tracking-wider mb-0.5 text-outline/75">{msg.sender}</p>
                )}
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendDirectMessage} className="bg-surface-container border-t border-outline/10 p-2 flex items-center gap-2">
            <input 
              type="text" 
              value={directInput}
              onChange={(e) => setDirectInput(e.target.value)}
              placeholder="Send message..."
              className="flex-1 bg-black/25 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-outline/40 focus:outline-none"
            />
            <button type="submit" className="text-secondary hover:text-white py-1 px-2 cursor-pointer">
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </form>
        </div>
      )}

      {showAuthModal && !user && (
        <AuthGate onClose={() => setShowAuthModal(false)} />
      )}

    </div>
  );
}

