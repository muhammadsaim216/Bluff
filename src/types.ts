export type ScreenType = "home" | "lobby" | "table" | "victory" | "market" | "blacklist" | "strategy";

export interface Card {
  id: string;
  suit: "heart" | "diamond" | "club" | "spade";
  rank: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "O" | "Q" | "K" | "A";
  isSelected?: boolean;
}

export interface PlayerStats {
  bluffRate: string;
  chipsWon: string;
  winRate: string;
  totalPot: string;
  callAcc: string;
  weeklyGain: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  rank: string;
  stats: PlayerStats;
  chips: number;
  online?: boolean;
}

export interface LobbyTable {
  id: string;
  name: string;
  stakes: string;
  playerCount: number;
  maxPlayers: number;
  minBuyIn: number;
  avatars: string[];
  status: string;
}

export interface GameLog {
  id: string;
  time: string;
  text: string;
  isBluffCall?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe?: boolean;
  isSystem?: boolean;
}

export interface MarketItem {
  id: string;
  name: string;
  type: "card-back" | "table-felt";
  price: number;
  description: string;
  colorClass: string;
  borderPreview: string;
  bgPreview: string;
}

export interface RankInfo {
  badge: string;
  level: number;
  color: string;             // Text color classes
  bgGrad: string;            // Background gradient classes
  borderClass: string;       // Border classes
  icon: string;              // Material symbols icon
  nextRankXP: number | null; // XP needed for next milestone
  prevRankXP: number;        // XP starting of this rank
}

export function getRankInfo(xp: number): RankInfo {
  const level = Math.floor(xp / 1000) + 1;
  const currentXP = Math.max(0, xp);
  
  if (currentXP < 1000) {
    return {
      badge: "Novice Deceiver",
      level,
      color: "text-[#8b928f]",
      bgGrad: "from-[#0d1412] to-[#060a09]",
      borderClass: "border-zinc-800/40",
      icon: "person",
      nextRankXP: 1000,
      prevRankXP: 0
    };
  } else if (currentXP < 3000) {
    return {
      badge: "Shadow Bluffster",
      level,
      color: "text-emerald-400",
      bgGrad: "from-[#082017] to-[#04120d]",
      borderClass: "border-emerald-900/40",
      icon: "theater_comedy",
      nextRankXP: 3000,
      prevRankXP: 1000
    };
  } else if (currentXP < 6000) {
    return {
      badge: "Street Cardshark",
      level,
      color: "text-blue-400",
      bgGrad: "from-[#081829] to-[#030912]",
      borderClass: "border-blue-900/40",
      icon: "token",
      nextRankXP: 6000,
      prevRankXP: 3000
    };
  } else if (currentXP < 10000) {
    return {
      badge: "Velvet High Roller",
      level,
      color: "text-amber-400",
      bgGrad: "from-[#241a00] to-[#0d0900]",
      borderClass: "border-amber-900/40",
      icon: "workspace_premium",
      nextRankXP: 10000,
      prevRankXP: 6000
    };
  } else if (currentXP < 15000) {
    return {
      badge: "Underground Legend",
      level,
      color: "text-purple-400",
      bgGrad: "from-[#1d0a28] to-[#0a0310]",
      borderClass: "border-purple-900/45",
      icon: "military_tech",
      nextRankXP: 15000,
      prevRankXP: 10000
    };
  } else {
    return {
      badge: "Grandmaster Deceiver",
      level,
      color: "text-[#e9c349]",
      bgGrad: "from-[#291e00] to-[#0c0900]",
      borderClass: "border-[#e9c349]/35",
      icon: "diamond",
      nextRankXP: null,
      prevRankXP: 15000
    };
  }
}

