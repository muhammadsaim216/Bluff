import { collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "./firebase";
import { TOP_PLAYERS, LOBBY_TABLES, ONLINE_FRIENDS, MARKET_ITEMS } from "./data";

export async function seedDatabaseIfNeeded() {
  try {
    // 1. Seed Leaderboard if empty
    const lbRef = collection(db, "leaderboards");
    const lbSnap = await getDocs(lbRef).catch(err => {
      handleFirestoreError(err, OperationType.GET, "leaderboards");
      return null;
    });

    if (lbSnap && lbSnap.empty) {
      console.log("Seeding leaderboards...");
      const batch = writeBatch(db);
      for (const player of TOP_PLAYERS) {
        const docRef = doc(db, "leaderboards", player.id);
        batch.set(docRef, {
          id: player.id,
          name: player.name,
          avatar: player.avatar,
          rank: player.rank,
          chips: player.chips,
          stats: {
            bluffRate: player.stats.bluffRate || "50%",
            chipsWon: player.stats.chipsWon || "0",
            winRate: player.stats.winRate || "50%",
            totalPot: player.stats.totalPot || "0",
            callAcc: player.stats.callAcc || "50%",
            weeklyGain: player.stats.weeklyGain || "0"
          }
        });
      }
      await batch.commit().catch(err => handleFirestoreError(err, OperationType.WRITE, "leaderboards"));
    }

    // 2. Seed Lobby Tables if empty
    const tablesRef = collection(db, "tables");
    const tablesSnap = await getDocs(tablesRef).catch(err => {
      handleFirestoreError(err, OperationType.GET, "tables");
      return null;
    });

    if (tablesSnap && tablesSnap.empty) {
      console.log("Seeding tables...");
      const batch = writeBatch(db);
      for (const tbl of LOBBY_TABLES) {
        const docRef = doc(db, "tables", tbl.id);
        batch.set(docRef, tbl);
      }
      await batch.commit().catch(err => handleFirestoreError(err, OperationType.WRITE, "tables"));
    }

    // 3. Seed Blacklist Dossiers if empty
    const dossiersRef = collection(db, "blacklist_dossiers");
    const dossiersSnap = await getDocs(dossiersRef).catch(err => {
      handleFirestoreError(err, OperationType.GET, "blacklist_dossiers");
      return null;
    });

    if (dossiersSnap && dossiersSnap.empty) {
      console.log("Seeding dossiers...");
      const batch = writeBatch(db);
      
      const defaultDossiers = [
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
        },
        {
          id: "lilly_bet",
          codename: "Lilly Bet",
          fullName: "Lilian Cartwright",
          status: "UNDERCOVER",
          bountyValue: "40,000 Chips",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn6XT-PQ6Q9kBGN1AqxPljNGi89CLajig2F7w5ICSijSKe1lKZQ_aH4jjZGLmqEGSRT_MQCDaFN8wukNXzK0nlpe2EUSxDkIPSWYeYQbR0LnzZnWi4mLNjrNCUo2uPpVVeK0UFg8UEfZb3qoR7HcZE9Y_q7V2AhDaF0Nz1D-6PdxMPybdps3hVKn2OArUr98Py3auKpqjH0SUalS_gf3WfvHEKCkggPJUBhGf24XQNHpoOzvWMQ2uUtkx6P-C1Hcdg5VVnywWNUYI",
          psychologicalProfile: "A conservative math-whiz hiding behind a delicate profile. She rarely bluffs, playing purely high-equity hands. She possesses an incredibly sharp calling radar, weeding out 90% of opponent bluffs using perfect situational mapping.",
          physicalTells: "When she actually attempts a rare bluff, she uses minimum-sizing structures to test the waters. If called, she collapses immediately without compounding her chips loss.",
          recommendedCounterStrategy: "When Lilly bets or claims a high rank, believe her! Fold immediately and preserve your stack. Raise her aggressively when she is in the blind positions to slowly bleed her stack without fight.",
          metrics: {
            bluffFrequency: 32,
            tiltFactor: 40,
            patienceLevel: 85,
            callingThreshold: 85
          }
        }
      ];

      for (const dossier of defaultDossiers) {
        const docRef = doc(db, "blacklist_dossiers", dossier.id);
        batch.set(docRef, dossier);
      }
      await batch.commit().catch(err => handleFirestoreError(err, OperationType.WRITE, "blacklist_dossiers"));
    }

    // 4. Seed Strategy Topics if empty
    const strategyRef = collection(db, "strategy_topics");
    const strategySnap = await getDocs(strategyRef).catch(err => {
      handleFirestoreError(err, OperationType.GET, "strategy_topics");
      return null;
    });

    if (strategySnap && strategySnap.empty) {
      console.log("Seeding strategies...");
      const batch = writeBatch(db);

      const defaultStrategies = [
        {
          id: "syndicate-rules",
          title: "Syndicate Rules",
          subtitle: "Core game mechanics of Bluff",
          icon: "gavel",
          contentMarkdown: "In the Velvet Shadow Underground, cards aren't just played; they're spoken. Master these absolute fundamentals:\n\n* **Invisible Hand Deals:** Every player receives a starting hand. Cards remain completely hidden.\n* **Face-Down Claims:** Discard between 1 to 4 cards face down onto the center pile, declaring they are the active target rank. You can lay actual matching cards (Truth), or throw card junk files (Bluff).\n* **The Interrogative Call:** After claims, opponents can call 'BLUFF!'. If you lied, you absorb the pile. If you told the truth, your challenger absorbs it. First to empty their hand wins."
        },
        {
          id: "pacing-and-sizing",
          title: "Pacing & Sizing",
          subtitle: "Manipulating opponents' timers",
          icon: "schedule",
          contentMarkdown: "AI bots in our lobby track how long you take to make claims:\n\n* **Hyper-Fast Sizing (0.5s):** Submitting an instant high claim is highly suspicious. Bots map rapid responses to panic plays. Wait 1-2 seconds to simulate deliberation.\n* **Passive Piles Bleeding:** Let cards stack in the center. The larger the center pile, the more risk an opponent faces when challenging."
        },
        {
          id: "tells-decoder",
          title: "Tells Decoder",
          subtitle: "Reading computerized metrics",
          icon: "psychology",
          contentMarkdown: "Elite players exhibit micro-eccentricities during high-wager sequences:\n\n* **Card Double-Checks:** Marcus Vane (DoubleDown) bluffs 88% of the time if he opens his cards multiple times.\n* **The Slow Fold:** Elena (VelvetQueen) calculates standard deviation risk. Immediate raises indicate premium cards."
        }
      ];

      for (const strat of defaultStrategies) {
        const docRef = doc(db, "strategy_topics", strat.id);
        batch.set(docRef, strat);
      }
      await batch.commit().catch(err => handleFirestoreError(err, OperationType.WRITE, "strategy_topics"));
    }

    // 5. Seed Market Items if empty
    const marketRef = collection(db, "market_items");
    const marketSnap = await getDocs(marketRef).catch(err => {
      handleFirestoreError(err, OperationType.GET, "market_items");
      return null;
    });

    if (marketSnap && marketSnap.empty) {
      console.log("Seeding market items...");
      const batch = writeBatch(db);
      for (const item of MARKET_ITEMS) {
        const docRef = doc(db, "market_items", item.id);
        batch.set(docRef, item);
      }
      await batch.commit().catch(err => handleFirestoreError(err, OperationType.WRITE, "market_items"));
    }

    // 6. Seed Friends if empty
    const friendsRef = collection(db, "friends");
    const friendsSnap = await getDocs(friendsRef).catch(err => {
      handleFirestoreError(err, OperationType.GET, "friends");
      return null;
    });

    if (friendsSnap && friendsSnap.empty) {
      console.log("Seeding online friends...");
      const batch = writeBatch(db);
      for (const friend of ONLINE_FRIENDS) {
        const docRef = doc(db, "friends", friend.id);
        batch.set(docRef, friend);
      }
      await batch.commit().catch(err => handleFirestoreError(err, OperationType.WRITE, "friends"));
    }

  } catch (error) {
    console.warn("Seeding failed or aborted:", error);
  }
}
