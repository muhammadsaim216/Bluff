import React, { useState, useEffect } from "react";
import { LOBBY_TABLES, ONLINE_FRIENDS } from "../data";
import { LobbyTable, Player, getRankInfo } from "../types";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfileData } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";

interface LobbyViewProps {
  onJoinTable: (table: LobbyTable, customName: string) => void;
  userChips: number;
  onOpenRefill: () => void;
  onOpenChat: (friendName: string) => void;
  userData: UserProfileData | null;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ 
  onJoinTable, 
  userChips, 
  onOpenRefill,
  onOpenChat,
  userData
}) => {
  const [stakeFilter, setStakeFilter] = useState("All Stakes");
  const [playerFilter, setPlayerFilter] = useState("All Players");
  const [tables, setTables] = useState<LobbyTable[]>([]);
  const [friends, setFriends] = useState<Player[]>([]);

  // Modals States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [joiningTable, setJoiningTable] = useState<LobbyTable | null>(null);

  // Form Inputs
  const [customName, setCustomName] = useState(userData?.name || "Deceiver");
  const [minPlayers, setMinPlayers] = useState(4); // default is 4 as requested
  const [roomName, setRoomName] = useState("Private Suite");
  const [creationStakes, setCreationStakes] = useState("Mid (500-2K)");

  // Sync inputs with user profile if loaded later
  useEffect(() => {
    if (userData?.name) {
      setCustomName(userData.name);
    }
  }, [userData]);

  // Subscribe to lobby tables and friends collections in real-time
  useEffect(() => {
    const unsubTables = onSnapshot(collection(db, "tables"), (snapshot) => {
      const dbTables: LobbyTable[] = [];
      snapshot.forEach((doc) => {
        dbTables.push({ id: doc.id, ...doc.data() } as LobbyTable);
      });
      dbTables.sort((a, b) => a.minBuyIn - b.minBuyIn);
      setTables(dbTables);
    }, (error) => {
      console.warn("Firestore lobby stream disrupted; reverting to built-in datasets.", error);
    });

    const unsubFriends = onSnapshot(collection(db, "friends"), (snapshot) => {
      const dbFriends: Player[] = [];
      snapshot.forEach((doc) => {
        dbFriends.push({ id: doc.id, ...doc.data() } as Player);
      });
      setFriends(dbFriends);
    }, (error) => {
      console.warn("Firestore friends stream disrupted.", error);
    });

    return () => {
      unsubTables();
      unsubFriends();
    };
  }, []);

  const handleResetFilters = () => {
    setStakeFilter("All Stakes");
    setPlayerFilter("All Players");
  };

  const activeTablesList = tables.length > 0 ? tables : LOBBY_TABLES;
  const activeFriendsList = friends.length > 0 ? friends : ONLINE_FRIENDS;

  const filteredTables = activeTablesList.filter((table) => {
    // Stake filter logic
    if (stakeFilter === "Low (100-500)") {
      return table.id === "table_velvet_lounge" || table.id === "table_shadow_suite";
    }
    if (stakeFilter === "Mid (500-2K)") {
      return table.id === "table_shadow_suite" || table.id === "table_emerald_den";
    }
    if (stakeFilter === "High (5K+)") {
      return table.id === "table_high_roller";
    }

    // Player filter logic
    if (playerFilter === "Available Seats") {
      return table.playerCount < table.maxPlayers;
    }
    if (playerFilter === "Full Tables") {
      return table.playerCount === table.maxPlayers;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col xl:flex-row overflow-hidden bg-[#091612]">
      {/* Table List Section - Takes center space */}
      <section className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <span className="text-[#8b928f] uppercase text-[10px] tracking-[0.25em] font-black">Velocity Clubs</span>
            <h1 className="font-headline text-4xl sm:text-5xl font-black text-white tracking-tight mt-1">Lobby</h1>
            <p className="text-[#8b928f] mt-1.5 text-sm sm:text-base max-w-sm">
              Select a high-stakes table and test your intuition. The shadow lounge awaits.
            </p>
          </div>
          <button 
            onClick={() => {
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#1a3a32] text-primary font-bold rounded border border-primary/25 hover:bg-[#1a3a32]/80 transition-all shadow-xl active:scale-95 cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Create Table</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mb-8 bg-[#111e1a]/80 p-4 rounded-xl border border-outline/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-sm">filter_alt</span>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#8b928f]">Filter By:</span>
          </div>
          
          {/* Stakes Filter */}
          <div className="relative">
            <select 
              value={stakeFilter}
              onChange={(e) => setStakeFilter(e.target.value)}
              className="appearance-none bg-surface-container-high text-xs font-semibold border border-outline/15 px-4 py-2.5 pr-9 rounded text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all cursor-pointer min-w-[130px]"
            >
              <option>All Stakes</option>
              <option>Low (100-500)</option>
              <option>Mid (500-2K)</option>
              <option>High (5K+)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b928f] pointer-events-none text-base">expand_more</span>
          </div>

          {/* Players Filter */}
          <div className="relative">
            <select 
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value)}
              className="appearance-none bg-surface-container-high text-xs font-semibold border border-outline/15 px-4 py-2.5 pr-9 rounded text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all cursor-pointer min-w-[130px]"
            >
              <option>All Players</option>
              <option>Available Seats</option>
              <option>Full Tables</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b928f] pointer-events-none text-base">expand_more</span>
          </div>

          <button 
            onClick={handleResetFilters}
            className="ml-auto text-xs font-bold text-secondary uppercase tracking-widest hover:underline transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {filteredTables.map((table) => {
            const isFull = table.playerCount === table.maxPlayers;
            const isEmerald = table.id === "table_emerald_den";
            return (
              <div 
                key={table.id} 
                className="relative bg-surface-container-high border border-outline/10 p-6 rounded-xl hover:border-secondary/40 transition-all duration-300 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-headline text-2xl font-bold text-white mb-2">{table.name}</h3>
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-1.5 bg-[#05110d] px-3 py-1 rounded-full border border-secondary/10">
                          <span className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white">{table.stakes}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#05110d] px-3 py-1 rounded-full border border-outline/10">
                          <span className="material-symbols-outlined text-[14px] text-primary">groups</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isFull || isEmerald ? "text-[#ffb4ab]" : "text-white"}`}>
                            {table.playerCount}/{table.maxPlayers} Players
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right bg-[#05110d]/80 px-4 py-2 rounded border border-outline/10 min-w-[90px]">
                      <p className="text-[9px] uppercase tracking-widest text-[#8b928f] font-bold mb-0.5">Min Buy-in</p>
                      <p className="font-headline text-lg font-black text-secondary">{table.minBuyIn.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-5 border-t border-outline/5 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {table.avatars.map((ava, ix) => (
                        <img 
                          key={ix} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full border-2 border-surface-container-high object-cover shadow" 
                          src={ava}
                        />
                      ))}
                      {table.playerCount > table.avatars.length && (
                        <div className="w-8 h-8 rounded-full border-2 border-[#1f2d28] bg-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-secondary">
                          +{table.playerCount - table.avatars.length}
                        </div>
                      )}
                    </div>
                    <span className={`text-[11px] font-medium italic ${isFull || isEmerald ? "text-[#ffb4ab]" : "text-[#8b928f]"}`}>
                      {table.status}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => setJoiningTable(table)}
                    disabled={userChips < table.minBuyIn}
                    className={`px-6 py-2.5 bg-secondary text-[#241a00] text-xs font-extrabold rounded hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer ${
                      userChips < table.minBuyIn ? "opacity-30 cursor-not-allowed filter grayscale" : ""
                    }`}
                  >
                    {userChips < table.minBuyIn ? "Low Buy-In" : "Join Table"}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTables.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-outline/10 rounded-2xl p-8 bg-[#111e1a]/25 text-[#8b928f]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#8b928f]/40">search_off</span>
              <p className="text-sm font-bold">No High Stakes Rooms Found</p>
              <p className="text-xs text-[#8b928f]/70 mt-1">Try resetting game stakes filters or players limit</p>
              <button 
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-surface-container-high text-secondary border border-secondary/20 rounded font-headline text-xs tracking-wider uppercase cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Side Information Panel (Profile & Friends) - Sticky right info bar */}
      <aside className="w-full xl:w-80 glass-panel border-l border-outline/10 p-6 md:p-8 flex flex-col gap-8 shrink-0">
        
        {/* Balance & Stats */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#8b928f] font-black mb-4">Player Portfolio</h4>
          
          {(() => {
            const currentXP = userData?.xp ?? 0;
            const rank = getRankInfo(currentXP);
            
            // Calculate progress to next rank
            let percent = 100;
            let xpProgressText = "MAX RANK REACHED";
            if (rank.nextRankXP !== null) {
              const range = rank.nextRankXP - rank.prevRankXP;
              const earned = currentXP - rank.prevRankXP;
              percent = Math.max(0, Math.min(100, (earned / range) * 100));
              xpProgressText = `${(currentXP - rank.prevRankXP).toLocaleString()} / ${range.toLocaleString()} XP to Next Tier`;
            }

            // Map color classes elegantly
            let barColor = "from-zinc-600 to-zinc-400";
            if (rank.color.includes("emerald")) barColor = "from-emerald-600 to-emerald-400";
            else if (rank.color.includes("blue")) barColor = "from-blue-600 to-blue-400";
            else if (rank.color.includes("amber")) barColor = "from-amber-600 to-[#e9c349]";
            else if (rank.color.includes("purple")) barColor = "from-purple-600 to-purple-400";
            else if (rank.color.includes("e9c349") || rank.color.includes("red")) barColor = "from-amber-600 to-[#e9c349]";

            return (
              <div className="space-y-4">
                {/* Visual Rank Badge Plaque */}
                <div className={`p-4 rounded-xl bg-gradient-to-br ${rank.bgGrad} border ${rank.borderClass} shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-300`}>
                  {/* Subtle particle glow in background */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center bg-black/40 border ${rank.borderClass}`}>
                      <span className={`material-symbols-outlined text-xl ${rank.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {rank.icon}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] uppercase tracking-widest font-black text-zinc-500">Underground Rank</p>
                      <h5 className={`font-headline font-black text-xs uppercase ${rank.color} tracking-wider leading-tight`}>
                        {rank.badge}
                      </h5>
                      <p className="text-[9px] font-mono text-zinc-400 mt-0.5">Level {rank.level} Recured</p>
                    </div>
                  </div>

                  {/* Level Progress Indicator */}
                  <div className="mt-4 pt-3.5 border-t border-white/[0.05] relative z-10 text-left">
                    <div className="flex justify-between items-center text-[8px] font-mono font-bold text-zinc-400 mb-1.5">
                      <span>MEMBER REPUTATION</span>
                      <span className={rank.color}>{percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.03]">
                      <div 
                        className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[8px] font-mono text-zinc-500 uppercase mt-1.5 text-right tracking-wider">
                      {xpProgressText}
                    </p>
                  </div>
                </div>

                {/* Stash & Stats Segment */}
                <div className="bg-surface-container-low p-5 rounded-xl border border-secondary/15 shadow-inner">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                    <span className="font-headline text-2.5xl font-black text-white tracking-tight leading-none">
                      {userChips.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b928f] font-medium text-left">Chips ready for cash-game action</p>
                  <div className="mt-4 pt-4 border-t border-outline/10 grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <p className="text-[9px] uppercase tracking-widest text-[#8b928f] mb-1 font-extrabold">Win Rate</p>
                      <p className="font-bold text-secondary text-sm">64%</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] uppercase tracking-widest text-[#8b928f] mb-1 font-extrabold">Reputation XP</p>
                      <p className="font-bold text-white text-sm font-mono">{currentXP.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Friends List */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#8b928f] font-black">Online Friends</h4>
            <span className="bg-primary-container text-[#abcec2] px-2 py-0.5 rounded text-[9px] font-bold border border-primary/10">
              {activeFriendsList.filter(f => f.online).length} Online
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {activeFriendsList.map((friend) => (
              <div 
                key={friend.id} 
                onClick={() => onOpenChat(friend.name)}
                className="flex items-center gap-3 group cursor-pointer p-2 hover:bg-[#1f2d28]/40 rounded-lg transition-all"
                title={`Chat with ${friend.name}`}
              >
                <div className="relative">
                  <img 
                    alt={friend.name} 
                    className="w-10 h-10 rounded-full object-cover border border-outline/10 shadow" 
                    src={friend.avatar}
                  />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${friend.online ? "bg-[#e9c349]" : "bg-zinc-500"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white group-hover:text-secondary transition-colors leading-tight">{friend.name}</p>
                  <p className="text-[10px] text-[#8b928f]">{friend.rank}</p>
                </div>
                <button className="p-1 text-[#8b928f] group-hover:text-secondary hover:bg-black/20 rounded duration-100 cursor-pointer">
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Refill Chips Area */}
        <div className="pt-4 border-t border-outline/10">
          <button 
            onClick={onOpenRefill}
            className="w-full py-4.5 bg-gradient-to-br from-[#e9c349] to-[#af8d11] text-[#241a00] font-headline font-black uppercase tracking-widest text-xs rounded hover:brightness-110 active:scale-95 transition-transform shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">payments</span>
            <span>Refill Chips Now</span>
          </button>
        </div>

      </aside>

      {/* CREATE CUSTOM TABLE MODAL POPUP - Styled in deep velvet charcoal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111e1a] border border-[#e9c349]/25 max-w-md w-full rounded-2xl overflow-hidden p-6 shadow-[0_10px_50px_rgba(0,0,0,0.9)] flex flex-col space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-2xl font-black">gavel</span>
                  <div>
                    <h3 className="font-headline text-base font-extrabold text-white uppercase tracking-wider">Configure Lounge Room</h3>
                    <p className="text-[9px] font-mono font-medium text-zinc-500 uppercase tracking-widest mt-0.5">ESTABLISH TABLE PARAMETERS</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/[0.05] hover:bg-white/5 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!customName.trim()) return;

                const newId = "custom_table_" + Date.now();
                let buyIn = 10000;
                let stakesLabel = "Stakes: 1K/2K";

                if (creationStakes === "Low (100-500)") {
                  buyIn = 1000;
                  stakesLabel = "Stakes: 100/200";
                } else if (creationStakes === "Mid (500-2K)") {
                  buyIn = 10000;
                  stakesLabel = "Stakes: 1K/2K";
                } else {
                  buyIn = 50000;
                  stakesLabel = "Stakes: 5K/10K";
                }

                const customTable: LobbyTable = {
                  id: newId,
                  name: roomName.trim() || "Private Suite",
                  stakes: stakesLabel,
                  playerCount: 1,
                  maxPlayers: minPlayers, // dynamic from user, default 4 as required by spec
                  minBuyIn: buyIn,
                  avatars: [userData?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCNB36cm-sVqvrwdOgA6oJBkL7bHS9ZVEWDvBMFwhHfMMyum4ztwW2QRqiig3edpZjYzWsiTG9GQ6Qb4ZaFr7BtcrZ5XHq9ICRjZguxV7UilUIH1qs3iWazqYhEZgdVVxKk7CVKn5yqUyspo3N94V5sRmMWmORX6u4E9kxYnEGYKye1zFSIoBbn2u3MxY37sx9ms_ITusvJTqHkJtZos9VPXo5aSwQB-yJxOAbEQ3EIN4Fyo9GbeEJrEFl743KVH6FvSW1tQFW9xVQ"],
                  status: "Lobby waiting"
                };

                try {
                  await setDoc(doc(db, "tables", newId), customTable);
                } catch (err) {
                  console.warn("Could not sync table to cloud database:", err);
                }

                setIsCreateOpen(false);
                onJoinTable(customTable, customName.trim());
              }} className="space-y-4">
                
                {/* Custom Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Your Display Name</label>
                  <input 
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your name inside the arena"
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 font-bold"
                  />
                </div>

                {/* Private Suite Room Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Room Name</label>
                  <input 
                    type="text"
                    required
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Secret Suite #2"
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Min/Max no of players setting */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Min Player Count</label>
                    <input 
                      type="number"
                      required
                      min={2}
                      max={6}
                      value={minPlayers}
                      onChange={(e) => setMinPlayers(Math.max(2, Math.min(6, parseInt(e.target.value, 10) || 4)))}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white text-center focus:outline-none focus:border-secondary font-bold"
                    />
                    <span className="text-[8px] text-zinc-500 block leading-tight">Default is 4. Range 2-6.</span>
                  </div>

                  {/* Room Stakes selection tier */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Room Buy-In Grade</label>
                    <select
                      value={creationStakes}
                      onChange={(e) => setCreationStakes(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-secondary font-bold"
                    >
                      <option>Low (100-500)</option>
                      <option>Mid (500-2K)</option>
                      <option>High (5K+)</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!customName.trim()}
                  className="w-full py-4.5 bg-gradient-to-r from-secondary to-[#cba028] text-black font-headline font-black uppercase text-xs tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_5px_20px_rgba(233,195,73,0.15)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">style</span>
                  Start & Enter Match table
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JOIN TABLE CONFIRMATION OVERLAY MODAL */}
      <AnimatePresence>
        {joiningTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111e1a] border border-[#e9c349]/25 max-w-sm w-full rounded-2xl overflow-hidden p-6 shadow-[0_10px_50px_rgba(0,0,0,0.9)] flex flex-col space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-2.5xl font-black">login</span>
                  <div>
                    <h3 className="font-headline text-base font-extrabold text-white uppercase tracking-wider">Verify Table Alias</h3>
                    <p className="text-[9px] font-mono font-medium text-zinc-500 uppercase tracking-widest mt-0.5">READY FOR CHALLENGE</p>
                  </div>
                </div>
                <button 
                  onClick={() => setJoiningTable(null)}
                  className="w-8 h-8 rounded-full border border-white/[0.05] hover:bg-white/5 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Table Preview info block */}
              <div className="bg-[#0b1311] border border-white/[0.03] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block">Selected Room Title</span>
                  <p className="font-bold text-white uppercase text-xs tracking-wide">{joiningTable.name}</p>
                  <span className="text-[10px] text-zinc-400 font-medium">{joiningTable.stakes}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-secondary font-mono block uppercase">Buy-In Cleared</span>
                  <p className="text-secondary font-black font-headline text-sm leading-none mt-1">PKR {joiningTable.minBuyIn.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!customName.trim() || !joiningTable) return;
                const tbl = joiningTable;
                setJoiningTable(null);
                onJoinTable(tbl, customName.trim());
              }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Your Display Name</label>
                  <input 
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your card shark alias"
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 font-bold"
                  />
                  <span className="text-[8px] text-zinc-500 block leading-tight">Must specify a name because other players will see this inside the lobby card deck logs and play turn markers.</span>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button 
                    type="button"
                    onClick={() => setJoiningTable(null)}
                    className="px-4 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-white/5 text-zinc-400 font-bold uppercase text-[10px] tracking-widest rounded-xl cursor-pointer"
                  >
                    Change Room
                  </button>
                  <button 
                    type="submit"
                    disabled={!customName.trim()}
                    className="flex-1 py-3.5 bg-secondary hover:brightness-110 text-black font-headline font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-[0_5px_15px_rgba(233,195,73,0.15)] cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">casino</span>
                    Secure Lounge Place
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
