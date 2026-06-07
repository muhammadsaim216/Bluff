import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";


interface MarketItem {
  id: string;
  name: string;
  type: "card-back" | "table-felt";
  price: number;
  description: string;
  colorClass: string;
  borderPreview: string;
  bgPreview: string;
}

const MARKET_ITEMS: MarketItem[] = [
  // Card Backs
  {
    id: "default",
    name: "Classic Shadow",
    type: "card-back",
    price: 0,
    description: "The traditional gold-filigree design of the Velvet Shadow lounge.",
    colorClass: "from-[#1a3a32] to-[#0d1f1b] border-secondary/40",
    borderPreview: "border-secondary/40",
    bgPreview: "bg-[#0d1f1b]"
  },
  {
    id: "crimson-royale",
    name: "Crimson Royale",
    type: "card-back",
    price: 15000,
    description: "Brass-bordered burgundy velvet weave. Reserved for elite tier tables.",
    colorClass: "from-[#5a1215] to-[#2c090a] border-red-500/50",
    borderPreview: "border-red-500/50",
    bgPreview: "bg-[#2c090a]"
  },
  {
    id: "stealth-onyx",
    name: "Stealth Onyx",
    type: "card-back",
    price: 30000,
    description: "Sleek carbon-fiber black background accented with glowing neon hazards.",
    colorClass: "from-[#1c1c1e] to-[#09090b] border-yellow-500/50",
    borderPreview: "border-yellow-500/50",
    bgPreview: "bg-[#09090b]"
  },
  {
    id: "neon-jade",
    name: "Cyber Neon Jade",
    type: "card-back",
    price: 22000,
    description: "Interactive motherboard patterns pulsing with chronometer circuitry.",
    colorClass: "from-[#062f21] to-[#031c11] border-green-400/50",
    borderPreview: "border-green-400/50",
    bgPreview: "bg-[#031c11]"
  },
  // Table Felts
  {
    id: "default-felt",
    name: "Forest Jade Felt",
    type: "table-felt",
    price: 0,
    description: "Classic deep forest-green felt fabric with standard telemetry lines.",
    colorClass: "from-[#0d2a1f] to-[#061811] border-emerald-600/30",
    borderPreview: "border-emerald-600/30",
    bgPreview: "bg-[#0d2a1f]"
  },
  {
    id: "crimson-velvet-felt",
    name: "Ruby Velvet Felt",
    type: "table-felt",
    price: 18000,
    description: "Plush ruby-red table felt that dampens card sounds and elevates moods.",
    colorClass: "from-[#4a0d10] to-[#240507] border-red-700/40",
    borderPreview: "border-red-700/40",
    bgPreview: "bg-[#4a0d10]"
  },
  {
    id: "midnight-cobalt-felt",
    name: "Cobalt Void Felt",
    type: "table-felt",
    price: 25000,
    description: "A cosmic indigo-blue felt, representing the limitless depths of space.",
    colorClass: "from-[#0f172a] to-[#020617] border-blue-600/40",
    borderPreview: "border-blue-600/40",
    bgPreview: "bg-[#0f172a]"
  }
];

interface BlackMarketViewProps {
  userChips: number;
  equippedCardBack: string;
  equippedTableFelt: string;
  unlockedItems: string[];
  onEquipItem: (type: "card-back" | "table-felt", id: string) => void;
  onBuyItem: (id: string, price: number) => void;
  onOpenRefill: () => void;
}

export const BlackMarketView: React.FC<BlackMarketViewProps> = ({
  userChips,
  equippedCardBack,
  equippedTableFelt,
  unlockedItems,
  onEquipItem,
  onBuyItem,
  onOpenRefill
}) => {
  const [activeTab, setActiveTab] = useState<"card-back" | "table-felt">("card-back");
  const [hoveredItem, setHoveredItem] = useState<MarketItem | null>(null);
  const [isPurchasingId, setIsPurchasingId] = useState<string | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [items, setItems] = useState<MarketItem[]>([]);

  // Subscribe to market items collection in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "market_items"), (snapshot) => {
      const list: MarketItem[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as MarketItem);
      });
      if (list.length > 0) {
        setItems(list);
      }
    }, (error) => {
      console.error("Error loading market items:", error);
    });
    return () => unsubscribe();
  }, []);

  const finalMarketItems = items.length > 0 ? items : MARKET_ITEMS;

  // Parent container stagger animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  // Preview target depends on hovering, or falls back to equipped
  const displayBackId = hoveredItem?.type === "card-back" ? hoveredItem.id : equippedCardBack;
  const displayFeltId = hoveredItem?.type === "table-felt" ? hoveredItem.id : equippedTableFelt;

  const currentItemBack = finalMarketItems.find(i => i.id === displayBackId) || finalMarketItems[0] || MARKET_ITEMS[0];
  const currentItemFelt = finalMarketItems.find(i => i.id === displayFeltId) || finalMarketItems.find(i => i.type === "table-felt") || MARKET_ITEMS[4];


  const handlePurchase = async (item: MarketItem) => {
    if (userChips < item.price) {
      onOpenRefill();
      return;
    }

    setIsPurchasingId(item.id);
    
    // Simulate safe dial or coin spinning delight
    await new Promise((resolve) => setTimeout(resolve, 1400));
    
    onBuyItem(item.id, item.price);
    setIsPurchasingId(null);
    setJustBought(item.id);

    // Flash reward screen
    setTimeout(() => {
      setJustBought(null);
    }, 2500);
  };

  return (
    <div className="bg-[#091612] min-h-[90vh] text-[#d7e6df] font-sans px-4 py-12 md:px-12 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Grid Header */}
      <div className="max-w-7xl mx-auto mb-10 border-b border-outline/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-5 relative z-10">
        <div>
          <span className="text-secondary font-headline tracking-[0.25em] font-black text-xs uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-sm leading-none">lock_open</span> Underground Syndicate
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-black text-white uppercase tracking-tight mt-1">
            Black Market Custody
          </h1>
          <p className="text-[#8b928f] text-sm md:text-base mt-2">
            Trade won chips for custom carbon-weaved skins and plush heavy felts to stand out at high-stakes tables.
          </p>
        </div>

        {/* Balance */}
        <div className="bg-[#12221d] px-6 py-4 rounded-xl border border-secondary/30 flex items-center gap-4 shadow-xl">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#8b928f]">Available Credits</p>
            <p className="font-headline font-black text-2xl text-secondary font-mono">{userChips.toLocaleString()}</p>
          </div>
          <button 
            onClick={onOpenRefill}
            className="w-10 h-10 bg-secondary hover:bg-secondary/80 text-[#241a00] flex items-center justify-center rounded-full font-bold transition-transform hover:rotate-90"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-start">
        
        {/* Left Side: 3D Interactive Card/Felt Live Preview Frame (5 cols) */}
        <div className="lg:col-span-5 bg-[#0e1d19]/80 rounded-2xl border border-outline/10 p-6 md:p-8 flex flex-col items-center sticky top-24 shadow-2xl">
          <div className="w-full text-center mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8b928f] block">
              Active Table Presence
            </span>
            <h3 className="font-headline text-lg font-bold text-white mt-1">Aesthetic Preview</h3>
          </div>

          {/* Table Felt Sandbox Area */}
          <div className="w-full h-80 rounded-2xl relative shadow-inner overflow-hidden border border-outline/15 flex items-center justify-center p-4 felt-texture transition-all duration-700 bg-gradient-to-br"
               style={{
                 backgroundImage: currentItemFelt.id === "default" || currentItemFelt.id === "default-felt"
                   ? "radial-gradient(circle, #0e2f23 30%, #05140f 100%)"
                   : currentItemFelt.id === "crimson-velvet-felt"
                     ? "radial-gradient(circle, #4c0e12 30%, #1a0204 100%)"
                     : "radial-gradient(circle, #0f1c3f 30%, #04091d 100%)"
               }}>
            {/* Table markings inside preview */}
            <div className="absolute inset-4 rounded-xl border border-dashed border-white/5 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white/5 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/5 font-headline">BLUFF</span>
            </div>

            {/* 3D Flapping Card Container */}
            <div 
              className="relative w-40 h-60 cursor-pointer [perspective:1000px] select-none group"
              onClick={() => setIsCardFlipped(!isCardFlipped)}
            >
              <motion.div 
                className="w-full h-full duration-700 [transform-style:preserve-3d] relative"
                animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 14 }}
              >
                {/* CARD BACK SIDE (Visible initially) */}
                <div 
                  className={`absolute inset-0 rounded-xl border-4 p-3 flex flex-col justify-between shadow-[0_25px_45px_rgba(0,0,0,0.7)] [backface-visibility:hidden] bg-gradient-to-br ${currentItemBack.colorClass}`}
                >
                  <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center opacity-80">
                    <span className="text-[8px] font-bold text-[#e9c349]">B</span>
                  </div>
                  
                  {/* Decorative core print */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-32 border border-white/5 rounded-lg flex items-center justify-center select-none overflow-hidden relative">
                      {/* Filigree variations based on item id */}
                      {currentItemBack.id === "default" && (
                        <span className="material-symbols-outlined text-secondary/35 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                      )}
                      {currentItemBack.id === "crimson-royale" && (
                        <span className="material-symbols-outlined text-red-500/35 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                      )}
                      {currentItemBack.id === "stealth-onyx" && (
                        <span className="material-symbols-outlined text-yellow-500/35 text-6xl font-bold">bolt</span>
                      )}
                      {currentItemBack.id === "neon-jade" && (
                        <span className="material-symbols-outlined text-green-400/35 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
                      )}
                    </div>
                  </div>

                  <div className="w-full text-right opacity-40 text-[9px] font-mono select-none">
                    V.S. CLUB
                  </div>
                </div>

                {/* CARD FACE SIDE (Visible flipped) */}
                <div 
                  className="absolute inset-0 rounded-xl bg-[#d7e6df] border border-white shadow-[0_25px_45px_rgba(0,0,0,0.7)] text-black p-3 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)]"
                >
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-headline font-bold text-2xl text-red-600 leading-none">A</span>
                    <span className="material-symbols-outlined text-red-600 text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </div>
                  
                  {/* Big Ace of Heart */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-red-600 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </div>

                  <div className="flex flex-col items-end leading-none translate-y-1 transform rotate-180">
                    <span className="font-headline font-bold text-2xl text-red-600 leading-none">A</span>
                    <span className="material-symbols-outlined text-red-600 text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Interactive tips */}
          <div className="mt-6 flex items-center gap-2.5 bg-black/30 w-full p-4 rounded-xl border border-outline/5 text-xs text-[#8b928f]">
            <span className="material-symbols-outlined text-secondary text-base shrink-0 animate-bounce">touch_app</span>
            <p>Click the card above to test how it reveals its face, or hover on catalog items below to hot-swap textures.</p>
          </div>

          {/* Current Selection details */}
          <div className="w-full mt-6 space-y-3 bg-[#111e1a] p-4 rounded-xl border border-outline/10 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8b928f]">Card Back:</span>
              <span className="font-mono text-white text-right font-bold">{currentItemBack.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b928f]">Felt Fabric:</span>
              <span className="font-mono text-white text-right font-bold">{currentItemFelt.name}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Shop Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tabs Container */}
          <div className="flex bg-[#111e1a]/90 p-1 rounded-lg border border-outline/10 self-start justify-between sm:justify-start max-w-sm">
            <button
              onClick={() => setActiveTab("card-back")}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded font-headline font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === "card-back" 
                  ? "bg-secondary text-[#241a00] shadow-md" 
                  : "text-[#8b928f] hover:text-white"
              }`}
            >
              Card Backs
            </button>
            <button
              onClick={() => setActiveTab("table-felt")}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded font-headline font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === "table-felt" 
                  ? "bg-secondary text-[#241a00] shadow-md" 
                  : "text-[#8b928f] hover:text-white"
              }`}
            >
              Table Felts
            </button>
          </div>

          {/* Items Catalog List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {finalMarketItems.filter(item => item.type === activeTab).map((item) => {
                const isUnlocked = unlockedItems.includes(item.id);
                const isEquipped = item.type === "card-back" 
                  ? equippedCardBack === item.id 
                  : equippedTableFelt === item.id;
                
                const isAffordable = userChips >= item.price;
                const isProcessing = isPurchasingId === item.id;

                return (
                  <motion.div
                    layoutId={item.id}
                    variants={itemVariants}
                    key={item.id}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`rounded-xl border p-5 flex flex-col justify-between h-48 transition-all relative overflow-hidden group ${
                      isEquipped 
                        ? "border-secondary bg-gradient-to-b from-[#1a342c] to-[#0b1714] shadow-[0_4px_25px_rgba(233,195,73,0.12)]" 
                        : "border-outline/10 bg-surface-container hover:border-secondary/30"
                    }`}
                  >
                    {/* Glowing highlight edge */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-all duration-500" />

                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-headline font-bold text-white text-base group-hover:text-secondary transition-colors truncate">
                          {item.name}
                        </h4>
                        
                        {/* Status tag */}
                        {isEquipped ? (
                          <span className="shrink-0 bg-[#e9c349]/15 border border-secondary/35 text-secondary px-2 py-0.5 rounded text-[8px] tracking-[0.15em] uppercase font-black">
                            IN USE
                          </span>
                        ) : isUnlocked ? (
                          <span className="shrink-0 bg-white/5 border border-white/10 text-white px-2 py-0.5 rounded text-[8px] tracking-[0.15em] uppercase font-bold">
                            OWNED
                          </span>
                        ) : null}
                      </div>

                      <p className="text-[#8b928f] text-xs leading-relaxed mt-2.5 mr-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="border-t border-outline/5 pt-4 flex items-center justify-between gap-2 mt-auto">
                      {/* Price / Owned status description */}
                      {isUnlocked ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500">Inventory ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                          <span className="font-headline font-bold text-white font-mono text-sm">
                            {item.price > 0 ? item.price.toLocaleString() : "Free Entry"}
                          </span>
                        </div>
                      )}

                      {/* Buy / Equip Button */}
                      {isEquipped ? (
                        <button disabled className="text-secondary/50 text-xs font-bold font-headline select-none cursor-not-allowed">
                          Active Selection
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => onEquipItem(activeTab, item.id)}
                          className="px-4 py-2 bg-secondary text-[#241a00] font-headline font-black text-xs uppercase tracking-wider rounded select-none cursor-pointer hover:bg-white active:scale-95 transition-all text-center flex items-center gap-1"
                        >
                          Equip
                          <span className="material-symbols-outlined text-xs leading-none">check_circle</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={isProcessing}
                          className={`px-4 py-2 font-headline font-black text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 ${
                            isProcessing
                              ? "bg-zinc-700 text-zinc-400 cursor-wait"
                              : isAffordable
                                ? "bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-110 active:scale-95 cursor-pointer"
                                : "bg-outline/20 text-[#8b928f] hover:bg-secondary/15 hover:text-secondary cursor-pointer"
                          }`}
                        >
                          {isProcessing ? (
                            <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                          ) : isAffordable ? (
                            <>
                              Unlock
                              <span className="material-symbols-outlined text-xs leading-none">shopping_lock</span>
                            </>
                          ) : (
                            "Buy Chips"
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Prompt banner */}
          <div className="bg-surface-container p-6 rounded-xl border border-outline/10 mt-6 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="relative z-10 text-center sm:text-left">
              <h3 className="font-headline font-bold text-lg text-white mb-1">Syndicate Level Rewards</h3>
              <p className="text-[#8b928f] text-xs max-w-md">
                Unlocking custom items feeds into your overall rating. Equipped skins modify the appearance for everyone sitting in your active Lobby Tables.
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-secondary/35 select-none hidden sm:block animate-pulse duration-1000">workspace_premium</span>
          </div>

        </div>
      </div>

      {/* Success Modal overlay after purchase */}
      <AnimatePresence>
        {justBought && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#091612]/90 flex items-center justify-center z-[100] p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-surface-container rounded-2xl max-w-md w-full border border-secondary p-8 text-center shadow-2xl relative"
            >
              <div className="w-20 h-20 bg-secondary/10 border border-secondary flex items-center justify-center rounded-full mx-auto mb-6">
                <span className="material-symbols-outlined text-secondary text-4xl animate-bounce">celebration</span>
              </div>
              <h3 className="font-headline text-2xl font-black text-white uppercase tracking-tight mb-2">Item Unlocked</h3>
              <p className="text-[#8b928f] text-xs mb-6 max-w-xs mx-auto">
                Excellent trade! The weapon of style is now fully unlocked in your inventory. Equip it and challenge opponents.
              </p>
              <button
                onClick={() => setJustBought(null)}
                className="w-full py-4 bg-secondary text-[#241a00] font-headline font-black text-sm uppercase tracking-widest rounded shadow-lg hover:bg-white transition-all cursor-pointer"
              >
                Assemble Inventory
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
