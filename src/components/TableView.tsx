import React, { useState, useEffect, useRef } from "react";
import { Card, GameLog, ChatMessage, LobbyTable } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface TableViewProps {
  selectedTable: LobbyTable;
  userChips: number;
  onLeaveTable: () => void;
  onFinishGame: (winnerName: string, rewardChips: number, xpGained: number) => void;
  onChangeChips: (change: number) => void;
  equippedCardBack?: string;
  equippedTableFelt?: string;
  customPlayerName?: string;
}

interface GamePlayer {
  id: string;
  name: string;
  avatar: string;
  cards: Card[];
  isBot: boolean;
  difficulty?: "Easy" | "Medium" | "Hard";
  state: "Waiting" | "Thinking..." | "Passed" | "Played" | "Challenged" | "Winner" | "Candidate";
}

interface HistoryStats {
  totalClaims: number;
  successfulBluffs: number;
  failedBluffs: number;
  totalChallenges: number;
  successfulChallenges: number;
}

const BOT_PRESETS = [
  { name: "SARA_V", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuApnEh8_pi4mHXXCMWo_vpshzu2ELEPS2NXUcaaK52Ksv2nPI5p6bm2K9ID_3tD2LledRcxqfKjIBnmsqXOmOp-8Tj6oQaGZkJPJfg1Pld-8uspAsa7dMt22fWtd24lULa7JoN6OwKwboHvCcg3gGW_Ib9WNOh94j-p8ucK5C1LqKaKwc2ZKy_5lsy4dqYFUPm3nyFWT4-unaDhEORoaM-3wi49a2UOqDa4gM23uHd7P0pI4hMAObaR1NvUKQg51j9TqSvKuoN4i_4", difficulty: "Easy" as const },
  { name: "VIKTOR_GRAND", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAMLhBeTkn3zYgA9GKQkXF2KsIQ8XuOwRIAI_gKqk-omTLkYfrMpVmuZCPnxrwua_Oy9ReCPVbMcnzA55SgxPdh8HsJkGxSNik5lCdFSP6LBAV0_o4oy22R4alv7RNVZcWVQ2SBmukC9gK2gmcGQkPENHNQeUxLG5VRMJ8NhY2ur9-1R8LX3Jt8OTZ34SCfeVmXYPCe32swtenvg3CEPnm3grDbT3X43_oYe9MuCQBqvyO9DCBJwUR_raySk5e60uSHRCeAT0TlxU", difficulty: "Hard" as const },
  { name: "LUNA_X", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8raQ4MJfZ83h3vzrNKzqfT6XDVLBakM4gR8NOBvecn0lpVGCev7rRkQVwHFEvkDEO5vVTVr3-wgKnlv-3oGxs2c95_rj-W2_Kbennx6Do1y4jfvDvMinzg2FXXIqJkAiJKto0jgxWpuorTga6KOoXulHZlWXAnl0YZK1ezi8H3fVzJ4iCPgnf_jSQ_YuHIL7qMW95a9PX1udBWHh1wa51fRJK9p88uEQF-L8aQ004dd2LJkN5ZW5lf5ZEsvlQQnRzKkravVNg54U", difficulty: "Hard" as const },
  { name: "JACK_HAWK", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120", difficulty: "Medium" as const },
  { name: "VIX_BLUFF", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120", difficulty: "Medium" as const }
];

const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export const TableView: React.FC<TableViewProps> = ({
  selectedTable,
  userChips,
  onLeaveTable,
  onFinishGame,
  onChangeChips,
  equippedCardBack = "default",
  equippedTableFelt = "default-felt",
  customPlayerName = "You"
}) => {
  // Felt customizers
  const isRedFelt = equippedTableFelt === "crimson-velvet-felt";
  const isBlueFelt = equippedTableFelt === "midnight-cobalt-felt";
  
  const feltBorderColor = isRedFelt
    ? "border-[#4a0d10]"
    : isBlueFelt
      ? "border-[#0d1633]"
      : "border-[#2a3833]";

  const feltRingGlow = isRedFelt
    ? "shadow-[0_0_80px_rgba(239,68,68,0.2)]"
    : isBlueFelt
      ? "shadow-[0_0_80px_rgba(59,130,246,0.2)]"
      : "table-glow";

  const cardBackGradient = equippedCardBack === "crimson-royale"
    ? "from-[#5a1215] to-[#2c090a] border-red-500/50 text-red-00"
    : equippedCardBack === "stealth-onyx"
      ? "from-[#1c1c1e] to-[#09090b] border-yellow-500/50 text-yellow-500"
      : equippedCardBack === "neon-jade"
        ? "from-[#062f21] to-[#031c11] border-green-400/50 text-green-400"
        : "from-[#1a3a32] to-[#0a1815] border-secondary/25 text-secondary";

  const totalPlayersCount = selectedTable.maxPlayers || 4;

  // Game Core States
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number>(0);
  const [currentRankIdx, setCurrentRankIdx] = useState<number>(0); // Starts with "A" (index 0)
  const [discardPileCards, setDiscardPileCards] = useState<Card[]>([]);
  
  // Last action states
  const [lastPlayerPlayedIdx, setLastPlayerPlayedIdx] = useState<number | null>(null);
  const [lastCardsPlayedReal, setLastCardsPlayedReal] = useState<Card[]>([]);
  const [isLastPlayLie, setIsLastPlayLie] = useState<boolean>(false);
  
  // Stats & Progress metrics
  const [totalTurns, setTotalTurns] = useState<number>(0);
  const [historyStatsMap, setHistoryStatsMap] = useState<Record<string, HistoryStats>>({});
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [inputChat, setInputChat] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<"playing" | "finished">("playing");
  const [feedTab, setFeedTab] = useState<"feed" | "chat">("feed");
  const [winnerDetails, setWinnerDetails] = useState<{ name: string; avatar: string } | null>(null);

  // Challenge Window triggers
  const [challengeActiveWindow, setChallengeActiveWindow] = useState<boolean>(false);
  const [challengeTimeoutLeft, setChallengeTimeoutLeft] = useState<number>(0);
  const [bluffIndicator, setBluffIndicator] = useState<{
    show: boolean;
    success: boolean;
    msg: string;
    revealCards?: Card[];
  }>({ show: false, success: false, msg: "" });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const challengeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch formatted time stamp
  const getFormattedTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  };

  // Turn tracking initializer helper
  const addPlayerStat = (playerId: string, actionType: keyof HistoryStats, value = 1) => {
    setHistoryStatsMap(prev => {
      const current = prev[playerId] || {
        totalClaims: 0,
        successfulBluffs: 0,
        failedBluffs: 0,
        totalChallenges: 0,
        successfulChallenges: 0
      };
      return {
        ...prev,
        [playerId]: {
          ...current,
          [actionType]: current[actionType] + value
        }
      };
    });
  };

  // Initialize new game session
  const initializeGame = () => {
    const list: GamePlayer[] = [];
    
    // Bottom user (0)
    list.push({
      id: "player",
      name: customPlayerName.trim() || "You",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNB36cm-sVqvrwdOgA6oJBkL7bHS9ZVEWDvBMFwhHfMMyum4ztwW2QRqiig3edpZjYzWsiTG9GQ6Qb4ZaFr7BtcrZ5XHq9ICRjZguxV7UilUIH1qs3iWazqYhEZgdVVxKk7CVKn5yqUyspo3N94V5sRmMWmORX6u4E9kxYnEGYKye1zFSIoBbn2u3MxY37sx9ms_ITusvJTqHkJtZos9VPXo5aSwQB-yJxOAbEQ3EIN4Fyo9GbeEJrEFl743KVH6FvSW1tQFW9xVQ",
      cards: [],
      isBot: false,
      state: "Waiting"
    });

    // Populate Bots slots for the remaining seats
    const botSlots = totalPlayersCount - 1;
    for (let i = 0; i < botSlots; i++) {
      const preset = BOT_PRESETS[i % BOT_PRESETS.length];
      list.push({
        id: `bot_${i}`,
        name: preset.name,
        avatar: preset.avatar,
        cards: [],
        isBot: true,
        difficulty: preset.difficulty,
        state: "Waiting"
      });
    }

    // Build perfect 52 card deck
    const suits: Card["suit"][] = ["heart", "diamond", "club", "spade"];
    const ranksList = RANKS;
    const deck: Card[] = [];

    suits.forEach(suit => {
      ranksList.forEach(rk => {
        deck.push({
          id: `${suit}_${rk}_${Math.random()}`,
          suit,
          rank: rk as Card["rank"],
          isSelected: false
        });
      });
    });

    // Secure Knuth-shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    // Deal cards evenly
    const cardsPerPlayer = Math.floor(52 / totalPlayersCount);
    for (let pIdx = 0; pIdx < totalPlayersCount; pIdx++) {
      list[pIdx].cards = deck.slice(pIdx * cardsPerPlayer, (pIdx + 1) * cardsPerPlayer);
    }

    // Assign starting player randomly
    const startIdx = Math.floor(Math.random() * totalPlayersCount);
    list[startIdx].state = "Thinking...";

    setPlayers(list);
    setActiveTurnIdx(startIdx);
    setCurrentRankIdx(0); // Starts on A as per spec
    setDiscardPileCards([]);
    setLastPlayerPlayedIdx(null);
    setLastCardsPlayedReal([]);
    setIsLastPlayLie(false);
    setTotalTurns(0);
    setGameStatus("playing");
    setWinnerDetails(null);

    // Initialize history map
    const initialStats: Record<string, HistoryStats> = {};
    list.forEach(p => {
      initialStats[p.id] = {
        totalClaims: 0,
        successfulBluffs: 0,
        failedBluffs: 0,
        totalChallenges: 0,
        successfulChallenges: 0
      };
    });
    setHistoryStatsMap(initialStats);

    const timeStr = getFormattedTime();
    setLogs([
      { id: `init_${Date.now()}_1`, time: timeStr, text: `Dealt ${cardsPerPlayer} standard cards to each player strictly evenly.` },
      { id: `init_${Date.now()}_2`, time: timeStr, text: `Current Rank rotation starts with [A]. Turn sequence moves ANTICLOCKWISE.` },
      { id: `init_${Date.now()}_3`, time: timeStr, text: `${list[startIdx].name} was dealt the starting hand priority!` }
    ]);
  };

  useEffect(() => {
    initializeGame();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (challengeTimerRef.current) clearInterval(challengeTimerRef.current);
    };
  }, [totalPlayersCount, customPlayerName]);

  // Turn rotation & sequential rank incrementer
  const advanceTurnAnticlockwise = (currentIdx: number, stepLogs?: string[], wasSkipped = false) => {
    if (gameStatus === "finished") return;

    // anticlockwise goes down (e.g. 0 -> 3 -> 2 -> 1 -> 0)
    const nextIdx = (currentIdx - 1 + totalPlayersCount) % totalPlayersCount;
    
    // Advance game Rank sequentially as requested:
    // A -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> J -> Q -> K -> A
    // Sequential increase index
    const nextRankIdx = (currentRankIdx + 1) % 13;

    setPlayers(prev => prev.map((p, ix) => {
      if (p.cards.length === 0) {
        return { ...p, state: "Winner" as const };
      }
      return { ...p, state: ix === nextIdx ? "Thinking..." : "Waiting" };
    }));

    if (stepLogs) {
      setLogs(prev => [
        ...stepLogs.map((txt, index) => ({ id: `adv_${Date.now()}_${index}`, time: getFormattedTime(), text: txt })),
        ...prev
      ]);
    }

    setTotalTurns(prev => prev + 1);
    setCurrentRankIdx(nextRankIdx);
    setActiveTurnIdx(nextIdx);
  };

  // Bot Thinking trigger
  useEffect(() => {
    if (players.length === 0 || gameStatus === "finished" || challengeActiveWindow || bluffIndicator.show) return;

    const currentPlayer = players[activeTurnIdx];
    if (!currentPlayer || !currentPlayer.isBot) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    // If candidate winner checks has been resolved
    if (currentPlayer.cards.length === 0) {
      declareOfficialWinner(currentPlayer.name, currentPlayer.avatar);
      return;
    }

    // bot thoughts delay
    timerRef.current = setTimeout(() => {
      executeBotTurn(activeTurnIdx);
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeTurnIdx, players, challengeActiveWindow, bluffIndicator.show, gameStatus]);

  // Bot intelligence logic
  const executeBotTurn = (botIdx: number) => {
    const bot = players[botIdx];
    const botHand = bot.cards;
    const currentClaimRank = RANKS[currentRankIdx];

    const matchingCards = botHand.filter(c => c.rank === currentClaimRank);
    const hasMatch = matchingCards.length > 0;

    let action: "play" | "pass" = "play";
    let cardsToPlay: Card[] = [];

    // Personality Decision Rules
    if (bot.difficulty === "Easy") {
      // 70% Truth play, 30% Bluff. Challenges rarely
      const randValue = Math.random();
      if (randValue < 0.70) {
        if (hasMatch) {
          cardsToPlay = matchingCards.slice(0, Math.min(matchingCards.length, 3));
        } else {
          // No match but is forced to choose or bluffs
          action = "pass";
        }
      } else {
        // Bluffing deliberately
        action = "play";
        const totalToPick = Math.min(botHand.length, Math.floor(Math.random() * 2) + 1);
        cardsToPlay = [...botHand].sort(() => Math.random() - 0.5).slice(0, totalToPick);
      }
    } else if (bot.difficulty === "Medium") {
      // 60% Truth, 40% Bluff. Moderate calling bluffs.
      const randValue = Math.random();
      if (randValue < 0.60) {
        if (hasMatch) {
          cardsToPlay = matchingCards.slice(0, Math.min(matchingCards.length, 3));
        } else {
          action = "pass";
        }
      } else {
        action = "play";
        const totalToPick = Math.min(botHand.length, Math.floor(Math.random() * 3) + 1);
        // Play lowest cards for a bluff
        cardsToPlay = [...botHand].sort((a, b) => a.rank.localeCompare(b.rank)).slice(0, totalToPick);
      }
    } else {
      // Hard Bot: Dynamic strategy.
      // Evaluates probability, opponent win tendency.
      const isOpponentAboutToWin = players.some(p => p.id !== bot.id && p.cards.length <= 2);
      
      if (hasMatch) {
        // High likelihood to play. Let's play 2 or 3 if opponent is close to empty hand!
        action = "play";
        const countToPlay = isOpponentAboutToWin 
          ? Math.min(matchingCards.length, 3)
          : Math.min(matchingCards.length, 2);
        cardsToPlay = matchingCards.slice(0, countToPlay);
      } else {
        // No match. Should we bluff or pass?
        if (isOpponentAboutToWin && botHand.length > 0) {
          // Desperately bluff to drop card load!
          action = "play";
          cardsToPlay = [botHand[0]];
        } else {
          // Dynamic calculation: bluff rate based on hand size
          const bluffProbability = botHand.length > 8 ? 0.50 : 0.25;
          if (Math.random() < bluffProbability && botHand.length > 0) {
            action = "play";
            cardsToPlay = [botHand[Math.floor(Math.random() * botHand.length)]];
          } else {
            action = "pass";
          }
        }
      }
    }

    // Safety fallback
    if (cardsToPlay.length === 0 && action === "play") {
      if (botHand.length > 0) {
        cardsToPlay = [botHand[0]];
      } else {
        action = "pass";
      }
    }

    if (action === "pass") {
      setPlayers(prev => prev.map((p, ix) => ix === botIdx ? { ...p, state: "Waiting" } : p));
      advanceTurnAnticlockwise(botIdx, [`${bot.name} decided to Pass [Current Rank remains: ${RANKS[(currentRankIdx + 1) % 13]}]`]);
    } else {
      // Play is true or bluff
      const playCount = cardsToPlay.length;
      const actualBluff = cardsToPlay.some(c => c.rank !== currentClaimRank);

      // Track history metrics
      addPlayerStat(bot.id, "totalClaims");
      if (actualBluff) {
        addPlayerStat(bot.id, "successfulBluffs"); // Assumed success until caught
      }

      // Slice cards out of hand
      setPlayers(prev => prev.map((p, ix) => {
        if (ix === botIdx) {
          const filt = p.cards.filter(c => !cardsToPlay.some(tc => tc.id === c.id));
          return { ...p, cards: filt, state: "Played" };
        }
        return p;
      }));

      setDiscardPileCards(prev => [...prev, ...cardsToPlay]);
      setLastPlayerPlayedIdx(botIdx);
      setLastCardsPlayedReal(cardsToPlay);
      setIsLastPlayLie(actualBluff);

      const logMsg = `${bot.name} played ${playCount} Card(s) declaring they are ${currentClaimRank}s.`;
      setLogs(prev => [
        { id: `play_${Date.now()}`, time: getFormattedTime(), text: logMsg },
        ...prev
      ]);

      // Set timed interactive user challenge interval
      setChallengeActiveWindow(true);
      setChallengeTimeoutLeft(6); // 6 seconds window

      if (challengeTimerRef.current) clearInterval(challengeTimerRef.current);
      
      let timerSeconds = 6;
      challengeTimerRef.current = setInterval(() => {
        timerSeconds--;
        setChallengeTimeoutLeft(timerSeconds);
        if (timerSeconds <= 0) {
          clearInterval(challengeTimerRef.current!);
          setChallengeActiveWindow(false);
          // Let alternate bots make calculated decision to challenge
          triggerOtherBotsReaction(botIdx, actualBluff, cardsToPlay, currentClaimRank);
        }
      }, 1000);
    }
  };

  // Bot decides whether to call a bluff based on difficulty metrics
  const triggerOtherBotsReaction = (playedIdx: number, realLie: boolean, targetCards: Card[], declaredRank: string) => {
    let challengerIdx = -1;

    for (let i = 0; i < totalPlayersCount; i++) {
      const activeBot = players[i];
      if (i !== playedIdx && activeBot && activeBot.isBot && activeBot.cards.length > 0) {
        // Calculate known instances of the claimed rank
        const botClaimRankCount = activeBot.cards.filter(c => c.rank === declaredRank).length;
        const totalAllegedCards = botClaimRankCount + targetCards.length;

        let callPercentage = 0.10;

        if (activeBot.difficulty === "Easy") {
          if (totalAllegedCards > 4) callPercentage = 0.95;
          else if (botClaimRankCount >= 3) callPercentage = 0.30;
        } else if (activeBot.difficulty === "Medium") {
          if (totalAllegedCards > 4) callPercentage = 1.0;
          else if (botClaimRankCount >= 3) callPercentage = 0.55;
          else if (players[playedIdx].cards.length <= 3) callPercentage = 0.40; // opponent low count
        } else {
          // Hard Bot
          const opponentStats = historyStatsMap[players[playedIdx].id];
          const calculatedBluffRatio = opponentStats 
            ? (opponentStats.failedBluffs / (opponentStats.totalClaims || 1)) 
            : 0.3;

          if (totalAllegedCards > 4) {
            callPercentage = 1.0;
          } else if (players[playedIdx].cards.length <= 3) {
            // Aggressive call for almost empty hands as per specify rules
            callPercentage = 0.85;
          } else if (calculatedBluffRatio > 0.45) {
            callPercentage = 0.70;
          } else if (botClaimRankCount >= 3) {
            callPercentage = 0.65;
          }
        }

        if (Math.random() < callPercentage) {
          challengerIdx = i;
          break;
        }
      }
    }

    if (challengerIdx !== -1) {
      executeBluffResolution(challengerIdx, playedIdx, realLie, targetCards);
    } else {
      // Bluff successfully went through uncaught! Check candidate win
      const actor = players[playedIdx];
      if (actor && actor.cards.length === 0) {
        declareOfficialWinner(actor.name, actor.avatar);
      } else {
        advanceTurnAnticlockwise(playedIdx, [`No opponents challenged ${players[playedIdx].name}'s play.`]);
      }
    }
  };

  // Bluff resolution check
  const executeBluffResolution = (challengerIdx: number, playingIdx: number, isLie: boolean, claimedCards: Card[]) => {
    const challenger = players[challengerIdx];
    const playerActor = players[playingIdx];
    const targetRankLabel = RANKS[currentRankIdx];
    const timeStr = getFormattedTime();

    addPlayerStat(challenger.id, "totalChallenges");

    if (isLie) {
      // CAUGHT RED-HANDED! Playing player must draw the absolute entire deck pile
      addPlayerStat(challenger.id, "successfulChallenges");
      addPlayerStat(playerActor.id, "failedBluffs");
      // Adjust metrics: they didn't succeed in bluffing
      setHistoryStatsMap(prev => {
        const statsObj = prev[playerActor.id];
        if (statsObj) {
          return {
            ...prev,
            [playerActor.id]: {
              ...statsObj,
              successfulBluffs: Math.max(0, statsObj.successfulBluffs - 1)
            }
          };
        }
        return prev;
      });

      setPlayers(prev => prev.map((p, ix) => {
        if (ix === playingIdx) {
          return { ...p, cards: [...p.cards, ...discardPileCards, ...claimedCards] };
        }
        return p;
      }));

      // Reward points / chips logic
      if (!challenger.isBot) {
        onChangeChips(selectedTable.minBuyIn / 2);
      }

      setBluffIndicator({
        show: true,
        success: true,
        msg: `BLUFF REVEALED! ${challenger.name} challenged ${playerActor.name} and was SUCCESSFUL! ${playerActor.name} was caught bluffing! ${playerActor.name} takes all ${discardPileCards.length + claimedCards.length} cards from the center.`,
        revealCards: claimedCards
      });

      setLogs(prev => [
        { id: `chal_${Date.now()}`, time: timeStr, text: `🚨 CHALLENGE ACCREDITED: {${challenger.name}} caught {${playerActor.name}} bluffing on claimed ${targetRankLabel}s!`, isBluffCall: true },
        ...prev
      ]);

      setDiscardPileCards([]);
      setLastPlayerPlayedIdx(null);
      setLastCardsPlayedReal([]);

      setTimeout(() => {
        setBluffIndicator({ show: false, success: false, msg: "" });
        // Caught person starting priority
        advanceTurnAnticlockwise(playingIdx);
      }, 5000);

    } else {
      // TRUTHFUL PLAYER! Challenger draws the pile of shame for false accusation
      addPlayerStat(challenger.id, "failedBluffs");

      setPlayers(prev => prev.map((p, ix) => {
        if (ix === challengerIdx) {
          return { ...p, cards: [...p.cards, ...discardPileCards, ...claimedCards] };
        }
        return p;
      }));

      // Penalty chips if user accused falsely
      if (!challenger.isBot) {
        onChangeChips(-(selectedTable.minBuyIn / 3));
      }

      setBluffIndicator({
        show: true,
        success: false,
        msg: `TRUTHFUL CLAIM! ${challenger.name} challenged ${playerActor.name} but FAILED! ${playerActor.name} played genuine ${targetRankLabel}s. ${challenger.name} scoops the entire heap of ${discardPileCards.length + claimedCards.length} cards!`,
        revealCards: claimedCards
      });

      setLogs(prev => [
        { id: `chal_${Date.now()}`, time: timeStr, text: `❌ FALSE ALARM: ${challenger.name} challenged ${playerActor.name} falsely. Claims match!`, isBluffCall: true },
        ...prev
      ]);

      setDiscardPileCards([]);
      setLastPlayerPlayedIdx(null);
      setLastCardsPlayedReal([]);

      setTimeout(() => {
        setBluffIndicator({ show: false, success: false, msg: "" });
        
        // Let's check candidate win status here
        if (playerActor.cards.length === 0) {
          declareOfficialWinner(playerActor.name, playerActor.avatar);
        } else {
          advanceTurnAnticlockwise(challengerIdx);
        }
      }, 5000);
    }
  };

  // Declare Official Winner Screen
  const declareOfficialWinner = (name: string, avatar: string) => {
    setWinnerDetails({ name, avatar });
    setGameStatus("finished");

    // Finished callbacks to populate level progression
    const winReward = name === (customPlayerName.trim() || "You") ? selectedTable.minBuyIn * 2 : 0;
    const winXp = name === (customPlayerName.trim() || "You") ? 750 : 100;
    // We display our own customized summary view first, then handleFinishGame on Click "Exit"
  };

  // User plays cards
  const handleUserPlayCards = () => {
    const user = players[0];
    const selected = user.cards.filter(c => c.isSelected);
    if (selected.length === 0) return;

    const currentClaimRank = RANKS[currentRankIdx];
    const playCount = selected.length;
    const actualBluff = selected.some(c => c.rank !== currentClaimRank);

    // Track user claim stats
    addPlayerStat(user.id, "totalClaims");
    if (actualBluff) {
      addPlayerStat(user.id, "successfulBluffs");
    }

    // Slice selected cards from player hand
    setPlayers(prev => prev.map((p, ix) => {
      if (ix === 0) {
        const remaining = p.cards.filter(c => !c.isSelected);
        return { ...p, cards: remaining, state: "Played" };
      }
      return p;
    }));

    setDiscardPileCards(prev => [...prev, ...selected]);
    setLastPlayerPlayedIdx(0);
    setLastCardsPlayedReal(selected);
    setIsLastPlayLie(actualBluff);

    const logText = `${user.name} played ${playCount} Card(s) claiming ${currentClaimRank}s.`;
    setLogs(prev => [
      { id: `user_p_${Date.now()}`, time: getFormattedTime(), text: logText },
      ...prev
    ]);

    // Give Bots 3 seconds to randomly trigger challenge algorithm
    setTimeout(() => {
      let botChallengerIdx = -1;
      for (let i = 1; i < totalPlayersCount; i++) {
        const activeBot = players[i];
        if (activeBot.cards.length > 0) {
          const matchingBotCount = activeBot.cards.filter(c => c.rank === currentClaimRank).length;
          const totalKnown = matchingBotCount + playCount;

          let prob = 0.12;
          if (totalKnown > 4) prob = 1.0;
          else if (matchingBotCount >= 3) prob = 0.65;
          else if (user.cards.length - playCount <= 2) prob = 0.75; // high challenge if user is on last turn empty candidate

          if (Math.random() < prob) {
            botChallengerIdx = i;
            break;
          }
        }
      }

      if (botChallengerIdx !== -1) {
        executeBluffResolution(botChallengerIdx, 0, actualBluff, selected);
      } else {
        // User told truth or bluff went unnoticed
        if (user.cards.length - playCount === 0) {
          declareOfficialWinner(user.name, user.avatar);
        } else {
          advanceTurnAnticlockwise(0, [`All bot opponents chose to let ${user.name}'s claim slide.`]);
        }
      }
    }, 2000);
  };

  const handleUserChallengeBluff = () => {
    if (challengeTimerRef.current) clearInterval(challengeTimerRef.current);
    setChallengeActiveWindow(false);

    if (lastPlayerPlayedIdx !== null) {
      executeBluffResolution(0, lastPlayerPlayedIdx, isLastPlayLie, lastCardsPlayedReal);
    }
  };

  const handleUserIgnoreBluff = () => {
    if (challengeTimerRef.current) clearInterval(challengeTimerRef.current);
    setChallengeActiveWindow(false);
    
    if (lastPlayerPlayedIdx !== null) {
      triggerOtherBotsReaction(lastPlayerPlayedIdx, isLastPlayLie, lastCardsPlayedReal, RANKS[currentRankIdx]);
    }
  };

  const handleUserPass = () => {
    const user = players[0];
    const logText = `${user.name} checked & passed their choice turn.`;
    setLogs(prev => [
      { id: `pass_${Date.now()}`, time: getFormattedTime(), text: logText },
      ...prev
    ]);
    advanceTurnAnticlockwise(0, undefined, true);
  };

  const handleToggleCardSelection = (cardId: string) => {
    setPlayers(prev => prev.map((p, ix) => {
      if (ix === 0) {
        const updatedCards = p.cards.map(c => c.id === cardId ? { ...c, isSelected: !c.isSelected } : c);
        return { ...p, cards: updatedCards };
      }
      return p;
    }));
  };

  // Chat message submit
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim() || players.length === 0) return;

    const timeStr = getFormattedTime();
    const user = players[0];

    setChats(prev => [
      ...prev,
      { id: `chat_${Date.now()}`, sender: user.name, text: inputChat.trim(), time: timeStr, isMe: true }
    ]);
    setInputChat("");

    // Simulate direct responses from medium or hard bots
    setTimeout(() => {
      const answers = [
        "Are you holding those ranks or bluffing?",
        "Don't lie to me, I'm watching your count!",
        "Hmm, anticlockwise suits my pace.",
        "Your stack sizes are looking dangerous.",
        "We'll see if anyone calls that!"
      ];
      const bot = players[Math.floor(Math.random() * (totalPlayersCount - 1)) + 1];
      if (bot) {
        setChats(prev => [
          ...prev,
          { id: `chat_bot_${Date.now()}`, sender: bot.name, text: answers[Math.floor(Math.random() * answers.length)], time: timeStr }
        ]);
      }
    }, 1500);
  };

  const isMyTurn = activeTurnIdx === 0 && !challengeActiveWindow;
  const userHand = players[0]?.cards || [];
  const currentClaimRank = RANKS[currentRankIdx];

  return (
    <main 
      className="flex-1 felt-texture overflow-hidden flex flex-col justify-between relative min-h-[calc(100vh-80px)] select-none transition-all duration-700"
      style={{
        backgroundImage: isRedFelt
          ? "radial-gradient(circle, #5b1014 20%, #1a0204 100%)"
          : isBlueFelt
            ? "radial-gradient(circle, #0e1e3f 20%, #020719 100%)"
            : "radial-gradient(circle, #0f2d22 20%, #051410 100%)"
      }}
    >
      {/* Table Lighting Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.65)_100%)] z-10" />

      {/* Main Table Layout */}
      <div className="relative w-full max-w-5xl mx-auto flex-1 flex flex-col items-center justify-center p-4">
        
        {/* Felt boundary container */}
        <div className={`absolute w-[95%] max-w-4xl aspect-[18/10] border-[16px] rounded-[100px] ring-1 ring-white/5 pointer-events-none transition-all duration-700 ${feltBorderColor} ${feltRingGlow}`} />

        <div className="relative w-full max-w-4xl aspect-[18/10] flex items-center justify-center z-20">
          
          {/* BOT SEATS */}
          {players.slice(1).map((bot, ix) => {
            const botSeatCount = players.length - 1;
            let visualStyles = "absolute ";
            if (botSeatCount === 1) {
              visualStyles += "top-4 left-1/2 -translate-x-1/2 flex flex-col items-center";
            } else if (botSeatCount === 2) {
              if (ix === 0) visualStyles += "top-10 left-1/4 -translate-x-1/2 flex flex-col items-center";
              else visualStyles += "top-10 right-1/4 translate-x-1/2 flex flex-col items-center";
            } else if (botSeatCount === 3) {
              if (ix === 0) visualStyles += "top-1/2 left-4 -translate-y-1/2 flex flex-col items-center";
              else if (ix === 1) visualStyles += "top-4 left-1/2 -translate-x-1/2 flex flex-col items-center";
              else visualStyles += "top-1/2 right-4 -translate-y-1/2 flex flex-col items-center";
            } else {
              // 4 or 5 bot spacing around top center of oval table
              if (ix === 0) visualStyles += "top-1/2 left-4 -translate-y-1/2 flex flex-col items-center";
              else if (ix === 1) visualStyles += "top-8 left-1/3 -translate-x-1/2 flex flex-col items-center";
              else if (ix === 2) visualStyles += "top-8 right-1/3 translate-x-1/2 flex flex-col items-center";
              else if (ix === 3) visualStyles += "top-1/2 right-4 -translate-y-1/2 flex flex-col items-center";
              else visualStyles += "top-4 left-1/2 -translate-x-1/2 flex flex-col items-center";
            }

            const isBotActive = activeTurnIdx === (ix + 1);

            return (
              <div key={bot.id} className={`${visualStyles} transition-transform`}>
                <div className="relative">
                  <div className={`w-14 h-14 rounded-full overflow-hidden bg-[#111e1a] border-2 transition-all duration-300 ${
                    isBotActive 
                      ? "border-secondary ring-4 ring-secondary/35 scale-105 shadow-[0_0_20px_rgba(233,195,73,0.5)]" 
                      : "border-zinc-800/60"
                  }`}>
                    <img alt={bot.name} className="w-full h-full object-cover" src={bot.avatar} />
                  </div>
                  
                  {/* bot cards count badges */}
                  <div className="absolute -bottom-1 -right-2 bg-neutral-900 px-2 py-0.5 rounded-full border border-secondary/45 shadow-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-[9px] text-secondary">style</span>
                    <span className="text-[10px] font-black text-secondary leading-none">{bot.cards.length}</span>
                  </div>

                  {bot.difficulty && (
                    <span className="absolute -top-2.5 right-1/2 translate-x-1/2 bg-black/80 text-zinc-400 px-1 rounded text-[7px] border border-white/5 font-mono tracking-widest font-bold">
                      {bot.difficulty}
                    </span>
                  )}

                  {isBotActive && (
                    <span className="absolute -top-2.5 -left-2 bg-secondary text-neutral-900 px-1 py-0.2 rounded text-[7px] font-black animate-pulse">
                      PLAYING
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-col items-center">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">{bot.name}</span>
                  <span className="text-[9px] font-medium text-zinc-500 italic leading-none mt-0.5">{bot.state}</span>
                </div>
              </div>
            );
          })}

          {/* CENTRAL CARD PILE */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="relative w-32 h-44 flex items-center justify-center">
              {discardPileCards.map((_, idx) => {
                const rotateAngle = (idx * 11) % 360;
                const sx = (idx * 2.5) % 8 - 4;
                const sy = (idx * 2) % 6 - 3;
                return (
                  <div 
                    key={idx}
                    style={{
                      transform: `rotate(${rotateAngle}deg) translate(${sx}px, ${sy}px)`
                    }}
                    className={`absolute w-22 h-30 rounded-lg bg-gradient-to-br ${cardBackGradient} shadow-md border border-white/5 pointer-events-none opacity-40 z-10`}
                  />
                );
              })}

              {discardPileCards.length > 0 ? (
                <div className="relative w-24 h-34 rounded-xl bg-gradient-to-br from-neutral-900 to-black border-2 border-white/10 flex flex-col items-center justify-center z-20 shadow-[0_10px_25px_rgba(0,0,0,0.85)]">
                  <span className="material-symbols-outlined text-4xl text-[#8b928f]">style</span>
                  <p className="font-headline text-lg font-black text-white mt-1 leading-none">{discardPileCards.length}</p>
                  <p className="text-[8px] font-medium text-[#8b928f] uppercase tracking-widest mt-0.5">Heap Pile</p>
                </div>
              ) : (
                <div className="absolute w-24 h-34 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center opacity-30">
                  <span className="material-symbols-outlined text-3xl">casino</span>
                  <span className="text-[8px] uppercase tracking-wider font-semibold mt-1">Empty Pool</span>
                </div>
              )}
            </div>

            {/* Target Card Indicator */}
            <div className="mt-4 bg-[#081311]/95 rounded-full border border-secondary/25 px-5 py-1.5 flex items-center gap-1.5 shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-[10px] font-black text-[#d7e6df] uppercase tracking-wider">
                Claim Target Required: <span className="text-secondary font-headline text-sm ml-1 font-black">{currentClaimRank}s</span>
              </span>
            </div>
            
            {/* Round info */}
            <span className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
              Anticlockwise Rotator • Loop turns
            </span>
          </div>

          {/* DYNAMIC BACKDROP RESOLUTION NOTIFIER BANNER */}
          <AnimatePresence>
            {bluffIndicator.show && (
              <div className="absolute inset-x-0 mx-auto w-11/12 max-w-md bg-black border border-[#e9c349]/35 rounded-2xl p-5 shadow-[0_20px_50px_black] z-40 text-center flex flex-col items-center">
                <span className={`material-symbols-outlined text-4xl mb-2 ${bluffIndicator.success ? "text-emerald-400 animate-bounce" : "text-rose-400"}`}>
                  {bluffIndicator.success ? "verified" : "error"}
                </span>
                <p className="text-xs font-bold font-headline text-white uppercase tracking-wider leading-relaxed">{bluffIndicator.msg}</p>
                
                {bluffIndicator.revealCards && (
                  <div className="flex gap-2.5 justify-center mt-3">
                    {bluffIndicator.revealCards.map((c, i) => (
                      <div key={i} className="bg-neutral-900 border border-white/10 rounded px-3 py-1.5 text-center shadow-lg">
                        <span className="text-[8px] font-mono text-zinc-500 block">{c.suit.toUpperCase()}</span>
                        <span className="text-sm font-black text-secondary leading-none">{c.rank}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>

          {/* USER INTERACTIVE TIMED BLUFF CALL POPUP PANEL */}
          <AnimatePresence>
            {challengeActiveWindow && lastPlayerPlayedIdx !== null && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-x-0 mx-auto w-11/12 max-w-sm bg-[#111e1a]/95 border-2 border-red-500/50 rounded-2xl p-4 shadow-[0_15px_45px_black] z-30 text-center flex flex-col space-y-3.5"
              >
                <div className="flex items-center justify-center gap-1 text-red-400">
                  <span className="material-symbols-outlined text-lg animate-spin">hourglass_top</span>
                  <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                    Interactive Challenge Clock: {challengeTimeoutLeft}s left
                  </span>
                </div>
                
                <p className="text-xs text-white">
                  Did <span className="font-bold text-secondary">{players[lastPlayerPlayedIdx]?.name}</span> lie about playing claimed <span className="text-secondary font-bold font-headline">{currentClaimRank}s</span>?
                </p>

                <div className="flex gap-2">
                  <button 
                    onClick={handleUserChallengeBluff}
                    className="flex-1 py-3 bg-red-400 hover:bg-red-500 text-black text-xs font-extrabold uppercase tracking-widest rounded-lg shadow cursor-pointer transition-colors"
                  >
                    🚨 Challenge Bluff!
                  </button>
                  <button 
                    onClick={handleUserIgnoreBluff}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase rounded-lg cursor-pointer transition-colors"
                  >
                    Pass
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* LOUNGE FEED LOG / LIVE CHATS SIDEBAR */}
      <div className="absolute right-4 bottom-56 w-76 h-56 z-20 flex flex-col bg-black/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Tab Buttons */}
        <div className="flex border-b border-white/[0.04] bg-[#0d1412]">
          <button 
            type="button"
            onClick={() => setFeedTab("feed")}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              feedTab === "feed" ? "text-secondary border-b border-secondary bg-black/40" : "text-zinc-500 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">analytics</span>
            Feed Log
          </button>
          
          <button 
            type="button"
            onClick={() => setFeedTab("chat")}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              feedTab === "chat" ? "text-secondary border-b border-secondary bg-black/40" : "text-zinc-500 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">chat</span>
            Table Chat
          </button>
        </div>

        {/* Tab Contents */}
        {feedTab === "feed" ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[10px] custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 items-start opacity-90 leading-relaxed">
                <span className="text-zinc-500 font-mono scale-90">{log.time}</span>
                <p className={`flex-1 ${log.isBluffCall ? "text-red-400 font-black" : "text-zinc-300"}`}>{log.text}</p>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-zinc-600 text-center py-6 font-mono">Feedback waiting first play...</p>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Chats list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[10px] custom-scrollbar">
              {chats.map((c) => (
                <div key={c.id} className="flex flex-col leading-snug">
                  <span className={`font-bold uppercase tracking-wider text-[8px] ${c.isMe ? "text-secondary" : "text-zinc-400"}`}>
                    {c.sender} <span className="text-zinc-600 font-normal ml-1 font-mono text-[7px]">{c.time}</span>
                  </span>
                  <p className="text-[#d7e6df] mt-0.5 max-w-full break-words bg-white/[0.02] p-1.5 rounded">{c.text}</p>
                </div>
              ))}
              {chats.length === 0 && (
                <p className="text-zinc-600 text-center py-6 font-mono">Banter with opponents here!</p>
              )}
            </div>

            {/* Chat submit input trigger */}
            <form onSubmit={handleSendChat} className="p-2 border-t border-white/[0.05] bg-black/40 flex gap-1 items-center">
              <input 
                type="text" 
                placeholder="Type message..." 
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                className="flex-1 bg-zinc-900 border border-white/5 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-secondary transition-colors"
              />
              <button 
                type="submit" 
                className="bg-secondary hover:brightness-115 text-black px-2.5 py-1.5 rounded font-bold text-[9px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* FOOTER CONTROLS CONTAINER */}
      <div className="bg-gradient-to-t from-black via-black/95 to-transparent pt-10 pb-8 px-4 flex flex-col items-center relative z-25">
        
        {isMyTurn && (
          <div className="mb-2.5 bg-secondary/15 border border-secondary/25 text-secondary px-4 py-1.5 rounded text-2xs uppercase tracking-widest font-black font-mono animate-pulse flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Your active Turn • Lay claimed {currentClaimRank}s from your hand!
          </div>
        )}

        {/* Hand Cards fanned out */}
        <div className="flex justify-center items-end h-40 relative max-w-lg mb-4">
          {userHand.map((card, idx) => {
            const total = userHand.length;
            const mid = (total - 1) / 2;
            const rankOffset = idx - mid;
            const rot = rankOffset * 5.5; // fanning angle rotation
            const transY = Math.abs(rankOffset) * 4;

            return (
              <motion.div
                key={card.id}
                layoutId={card.id}
                initial={{ opacity: 0, y: 50, rotate: rot }}
                animate={{ 
                  opacity: 1,
                  y: card.isSelected ? -35 : transY,
                  rotate: rot,
                  scale: card.isSelected ? 1.05 : 1,
                  zIndex: card.isSelected ? 50 : idx
                }}
                whileHover={{
                  y: card.isSelected ? -45 : transY - 12,
                  scale: card.isSelected ? 1.10 : 1.05,
                  zIndex: 65,
                  transition: { type: "spring", stiffness: 280, damping: 9 }
                }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                onClick={() => handleToggleCardSelection(card.id)}
                style={{
                  marginLeft: idx === 0 ? "0px" : "-50px"
                }}
                className={`w-28 h-38 sm:w-30 sm:h-40 rounded-xl border flex flex-col justify-between p-3.5 cursor-pointer select-none relative ${
                  card.isSelected
                    ? "bg-[#111e1a] border-secondary text-secondary shadow-[0_0_20px_rgba(233,195,73,0.35)]"
                    : "bg-[#0b1311] border-zinc-900 text-[#d7e6df]"
                }`}
              >
                {/* corner tags */}
                <div className="flex justify-between items-start leading-none pointer-events-none">
                  <span className="font-headline font-black text-xl">{card.rank}</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {card.suit === "heart" ? "favorite" : card.suit === "diamond" ? "diamond" : card.suit === "club" ? "spa" : "style"}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-4xl">
                    {card.suit === "heart" ? "favorite" : card.suit === "diamond" ? "diamond" : card.suit === "club" ? "spa" : "style"}
                  </span>
                </div>

                <div className="flex justify-between items-end rotate-180 leading-none pointer-events-none">
                  <span className="font-headline font-black text-xl">{card.rank}</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {card.suit === "heart" ? "favorite" : card.suit === "diamond" ? "diamond" : card.suit === "club" ? "spa" : "style"}
                  </span>
                </div>

                {card.isSelected && (
                  <div className="absolute -top-2.5 -right-2.5 bg-secondary text-neutral-950 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ring-2 ring-black font-extrabold">
                    <span className="material-symbols-outlined text-xs font-bold">check</span>
                  </div>
                )}
              </motion.div>
            );
          })}

          {userHand.length === 0 && (
            <div className="text-zinc-600 font-mono tracking-widest text-[10px] uppercase border border-dashed border-zinc-800 rounded px-6 py-4">
              Generating placement feedback...
            </div>
          )}
        </div>

        {/* Action Choice Controllers */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 max-w-2xl w-full">
          <button 
            type="button"
            onClick={handleUserPass}
            disabled={!isMyTurn}
            className="px-6 py-3.5 font-headline font-black text-[11px] text-zinc-400 hover:text-white uppercase tracking-wider hover:bg-white/5 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          >
            Pass Turn (Skip)
          </button>

          <button 
            type="button"
            onClick={handleUserPlayCards}
            disabled={!isMyTurn || userHand.filter(c => c.isSelected).length === 0}
            className="relative group px-12 py-4 bg-[#e9c349] hover:brightness-110 text-black font-headline font-black text-xs tracking-wider rounded-xl shadow-lg transition-all uppercase disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            Play {userHand.filter(c => c.isSelected).length || ""} Card(s) as {currentClaimRank}s
          </button>

          <button 
            type="button"
            onClick={onLeaveTable}
            className="px-4 py-3.5 text-xs text-zinc-600 hover:text-red-400 uppercase tracking-wider transition-all cursor-pointer"
          >
            Leave Match Table
          </button>
        </div>

      </div>

      {/* RECAP MODAL POPUP (FINISHED RECAP) */}
      <AnimatePresence>
        {gameStatus === "finished" && winnerDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111e1a] border border-[#e9c349]/35 max-w-lg w-full rounded-2xl overflow-hidden p-8 shadow-[0_15px_60px_rgba(0,0,0,0.95)] flex flex-col space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center border-b border-white/[0.06] pb-5">
                <span className="material-symbols-outlined text-secondary text-5xl font-black mb-1 animate-bounce">emoji_events</span>
                <h2 className="font-headline text-2xl font-extrabold text-white uppercase tracking-wider">Tournament Finished Recaps</h2>
                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mt-1">FINAL DECIDER RESULTS REPORT</p>
              </div>

              {/* Winner showcase block */}
              <div className="bg-[#0b1311] border border-white/[0.03] rounded-2xl p-5 flex items-center gap-4 shadow-inner">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary/50">
                  <img alt="Winner Avatar" className="w-full h-full object-cover" src={winnerDetails.avatar} />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-secondary uppercase block">Champions Cup Gold Medalist</span>
                  <p className="text-lg font-headline font-black text-white uppercase tracking-wide">{winnerDetails.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Survived the final checking sequence successfully!</p>
                </div>
              </div>

              {/* Statistics Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Round Performance Analytics</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0b1311] p-3.5 rounded-xl border border-white/[0.02]">
                    <span className="text-[8px] text-zinc-500 font-mono block uppercase">Total Hand Turns</span>
                    <span className="text-xl font-black text-white">{totalTurns} turns</span>
                  </div>

                  <div className="bg-[#0b1311] p-3.5 rounded-xl border border-white/[0.02]">
                    <span className="text-[8px] text-zinc-500 font-mono block uppercase">Claimed Target sequence</span>
                    <span className="text-xl font-black text-secondary uppercase font-headline">A to {currentClaimRank}</span>
                  </div>
                </div>

                {/* Player Breakdown list */}
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {players.map((p) => {
                    const stats = historyStatsMap[p.id] || {
                      totalClaims: 0,
                      successfulBluffs: 0,
                      failedBluffs: 0,
                      totalChallenges: 0,
                      successfulChallenges: 0
                    };
                    return (
                      <div key={p.id} className="flex items-center justify-between bg-[#0b1311] px-4.5 py-3 rounded-xl border border-white/[0.01]">
                        <div className="flex items-center gap-2.5">
                          <img alt={p.name} className="w-6 h-6 rounded-full object-cover border border-white/10" src={p.avatar} />
                          <span className="text-xs font-bold text-white uppercase">{p.name} {p.id === "player" ? "(You)" : ""}</span>
                        </div>
                        <div className="text-right text-[10px] font-mono space-x-3 text-zinc-400">
                          <span>Claims: <strong className="text-white">{stats.totalClaims}</strong></span>
                          <span>Caught: <strong className="text-red-400">{stats.failedBluffs}</strong></span>
                          <span>Chall: <strong className="text-emerald-400">{stats.successfulChallenges}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recap buttons */}
              <div className="flex gap-3 pt-3">
                <button 
                  onClick={initializeGame}
                  className="flex-1 py-4 bg-gradient-to-r from-secondary to-[#cba028] text-black font-headline font-black uppercase text-xs tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_15px_rgba(233,195,73,0.15)] cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm font-bold animate-spin">refresh</span>
                  Rematch Lounge
                </button>
                <button 
                  onClick={() => {
                    const winReward = winnerDetails.name === (customPlayerName.trim() || "You") ? selectedTable.minBuyIn * 2 : 0;
                    const winXp = winnerDetails.name === (customPlayerName.trim() || "You") ? 750 : 100;
                    onFinishGame(winnerDetails.name, winReward, winXp);
                  }}
                  className="px-6 py-4 bg-neutral-900 border border-white/5 hover:bg-neutral-800 text-zinc-400 hover:text-white font-headline font-black uppercase text-xs tracking-widest rounded-xl cursor-pointer text-center"
                >
                  Exit Game
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
};
