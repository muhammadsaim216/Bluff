import { Player, LobbyTable, PlayerStats, MarketItem } from "./types";

export const TOP_PLAYERS: Player[] = [
  {
    id: "the_ghost",
    name: "The Ghost",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDk1o8jgjRBbUG_H_5BECDL2s0DavOaJhJ0a5rz949BlzofYuEZXNH1jjHqHipsI8x4UbtfWmTK2XJq9HxM0Kd5HDHVS8TQsVXo_GRVO4GWQNkIF5Ki0vZVVQnOHBsqmzS7Mg7tUbDyMNlZoS4nk3lmBwIg58-1EBGarpn-i7FuGnSnjcQ5YVFTwJZ1NQwtYv7Mkc80JjTXE6ds0sCeTbvOSMbn1eViq9_icBGg-xHATEb9--bM1ZFtLZ0f2toFrysOXpdyODrvdR0",
    rank: "GOLD III RANK",
    chips: 1200000,
    stats: {
      bluffRate: "82%",
      chipsWon: "1.2M",
      winRate: "71%",
      totalPot: "3.4M",
      callAcc: "58%",
      weeklyGain: "320K"
    }
  },
  {
    id: "velvet_queen",
    name: "VelvetQueen",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuANL92OAxCfnKbTYf7QxrKDQmDN63mneeL47wGwQ5LcmlJRKRyEFQv8N4OEV2Z8QkwshiQqKYnftE6iRpc3LpvsRKoL7tnGSNiZkHqCoyT9puT5KUHDoUYarI400vbG8RYiYq5aJOE0PUYm3Pj0PZ5U0DZcjggTN44o00ARJoliJQH1f3jJbiZV6eJMpuurznhfL8jWVTg7p_fb66ZezYgBIRcObO9bNkQ7YEuwA1KWc5lHXKD6tRWtnjE4FS0_Ho3dVqpUN8JRIQA",
    rank: "GRANDMASTER TIER",
    chips: 14500000,
    stats: {
      bluffRate: "65%",
      chipsWon: "12.8M",
      winRate: "94%",
      totalPot: "14.5M",
      callAcc: "88%",
      weeklyGain: "1.5M"
    }
  },
  {
    id: "double_down",
    name: "DoubleDown",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5Nnl39aLq6CslDOjGqADcucE6rNDmf1jFafwv61Hd1Yb5v3WNK1ei7UiFhZdNteNQPMk-Ncyk7d5H1-Y_radx_RF6k63FAyh0NypgPrDe324vOYqEIdqgnD1spCMKHXbEfoQa8IF9g1qvcoEJwXAWpCAaMBICzCbLX0tnuy-xRAwuBdwwSlHvQAuz2yzDt0donDhUMdzTSqEaoN7q0xiPuG1hNhBIAW6qKzCj8gxsKEbn-n6sEDE39ptEuv6VcXnPa52cGOMOhZU",
    rank: "DIAMOND II RANK",
    chips: 2400000,
    stats: {
      bluffRate: "59%",
      chipsWon: "2.4M",
      winRate: "65%",
      totalPot: "4.8M",
      callAcc: "65%",
      weeklyGain: "2.4M"
    }
  }
];

export const LOBBY_TABLES: LobbyTable[] = [
  {
    id: "table_shadow_suite",
    name: "The Shadow Suite",
    stakes: "Stakes: 500/1000",
    playerCount: 4,
    maxPlayers: 6,
    minBuyIn: 10000,
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgUp75v1TzloiMjPdyAaT2V36LqFso1u6SuP-5hh96nan6p_bk-dHle6lVXZOZm97BqvUrcTZXJCXJ4Y29hu2uLIBCbva1MsxHmzrIn6BjhoK5vZTkyHAdYhasyGrjVnFcExzcFi7wLpDsej74bfjNasENXux06oxpvl7xlxwvoxYOocHD3X5k-Xd8h7Dr0GmRFIM1ArkFK_IiiOJHfK16TzyfC0Xzjh_8WrtGTgyEYush-w6g8vF6mwZWk3u3g1vHwm6XLh3D2tk",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkh7ms7b5rwPY8rKcnehqyG7rgJP-Q6U93X5cRqnPAibofY-OOPOP2BP3y8xpK7w99o_AdvgnqlQJsS4g5W2Giu7LE1MpDAh14DrIFCg-7wZIHdU_iAnIj4JKCREtDsZxrBQuNjFqnFLHo7SBfm5ecmKQlgLZn4fczrQCGrhFrqu6IKuT0cTuEI139aLYYcQ2E2xeD9Re5qqNpNhD99BDiJWyOP3W0vOFrMnBunUgYMuU5b5bGyZUZaeZrUo5XdwhVrdQcgYNtZEs"
    ],
    status: "Active game"
  },
  {
    id: "table_velvet_lounge",
    name: "Velvet Lounge",
    stakes: "Stakes: 100/200",
    playerCount: 2,
    maxPlayers: 6,
    minBuyIn: 2000,
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBzc25Dz5IsTaBH5D--Nxaq0gKeCB611sA0e63hF8_GzUzSNJGRR4GZD8Mb89qXKEqMomeeO1q9DvD577RR0L8_BANbQ1G8vFBWPDwZii6QhnYQduiBmek9bZJLJSV5tDPUE7oZVfUkfz3t8hk2jmgdlfD56YEzu-j4DM4Chogt1hcnCk-62zkDq9J2zC1bv41rTGmYMdkVARdE3sJHwrrOzPaUJwzYGHndCKASHdKgnpL1mJo7EtrTfYIjOap_GGcANmw-f115ujg",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAk_3T2WpB46qKsmR82uydBg3RPI-L5NGer5kmaxng4mW8C6vsG1QNzOOWnmK-V1GMugEV3E4nIxFxXIyNKVu7wrvJLqKgCM6Yl6FKqKpHKQQj7FfWnxPqYoq1-3K8Y80vwQkk3oGorInPdn5mz5X1frbgvO0x4_rBk13OIlTAT2xoIXG9zypCGAbsAtS8-Hj3_ra10nqlVXzACDI-hy0mGwIBr4Pe_xTgoP9p0NgH_jTgHfDa0-coCmHITRw27YooDU9SX8u5c3uk"
    ],
    status: "Starting soon"
  },
  {
    id: "table_emerald_den",
    name: "Emerald Den",
    stakes: "Stakes: 1K/2K",
    playerCount: 5,
    maxPlayers: 6,
    minBuyIn: 20000,
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDxlD_NFYof97TnVQIqKQHnV7pob771JDlZPdkDNwWy-rTssdzlqtAoZmBJROsnkMzukuj28N5z9rpdezu59xWrr4WguebJlaTAYEA4jgmeHgQSJZcxdInNXUaB5EHblN5lKpWKU2hrJPVcZuumd-0aOCkhREb0QqUyBknJ87X3S0prwCpKR38zvMMiNeRnIx6oFERVYWt7swZmMwhDGFbbmZSluYsa5Ja3bq0XwNGyGKGg6-gYYHUoXcrmZ5uFpKT49OTYkKKVASo"
    ],
    status: "Almost Full"
  },
  {
    id: "table_high_roller",
    name: "The High Roller",
    stakes: "Stakes: 5K/10K",
    playerCount: 1,
    maxPlayers: 6,
    minBuyIn: 100000,
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAzeogEcuq2_ZtKH9m3nE-xFbVX2L0xDSV1I5ouW81pvcy9TnPv-SqucQ4F4NYeL-UtqoLpfiNvhz-iL_Bzux8CGuN1W_4HSw-Xid8V5D7t8iPM2QWiivpTakudhWwt00MQp-GgkH6heV_uNKCvOP5zcLM2f8sdK6ko2_xN2ZJj_4e3tazstHGnKNEqH3p_woPa-1FoCnjI6CA1WS-Y7JSMVtEGifYV64VCy3VrYIgu6NndsX0vIwMRUVeEDXuzf2iyWtHqsRMvUOc"
    ],
    status: "Waiting for players"
  }
];

export const ONLINE_FRIENDS: Player[] = [
  {
    id: "friend_1",
    name: "VesperLyra",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn6XT-PQ6Q9kBGN1AqxPljNGi89CLajig2F7w5ICSijSKe1lKZQ_aH4jjZGLmqEGSRT_MQCDaFN8wukNXzK0nlpe2EUSxDkIPSWYeYQbR0LnzZnWi4mLNjrNCUo2uPpVVeK0UFg8UEfZb3qoR7HcZE9Y_q7V2AhDaF0Nz1D-6PdxMPybdps3hVKn2OArUr98Py3auKpqjH0SUalS_gf3WfvHEKCkggPJUBhGf24XQNHpoOzvWMQ2uUtkx6P-C1Hcdg5VVnywWNUYI",
    rank: "In Shadow Suite",
    chips: 15400,
    online: true,
    stats: { bluffRate: "45%", chipsWon: "50K", winRate: "35%", totalPot: "100K", callAcc: "44%", weeklyGain: "12K" }
  },
  {
    id: "friend_2",
    name: "TheCollector",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeiwFzlNL8n9I5F2a3OGH6xFc5xeoKdl2Z3E1pZuhF-pSRV-i9owd6J02iDrglf6Yh2ExNb1r6hIFVYso7BQcQ7c8yum4Qfe3lUC-70OoJRS83WO88Kch8cmOVA7vHLiTKzghokfZfl29zDes4l91DkaXZvbqYnN624FNcC4yahn4pyIBmGX_eGsxOlOJSxVCccX_EMVDFpC1MW_Zkhjth3hLwrp86-rCdAtiEz4SgAp9eNv2zq7oFJk38ilaemXNirJsprlSG8n0",
    rank: "Lobby",
    chips: 45000,
    online: true,
    stats: { bluffRate: "55%", chipsWon: "250K", winRate: "58%", totalPot: "400K", callAcc: "62%", weeklyGain: "100K" }
  },
  {
    id: "friend_3",
    name: "MistWalker",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoBhfb8_oi6Eq58CQ817N4iQ0AShAGvhnXg8rk-1rOuxPN1lBzPcK8eSfL3onwONTGfQqtEYvRZwbdHcsmqzSBx7WBedaLlM68pdQzF8_U6ObLW4vhNyPhcBREnXVmCIXY55r-Yrs0DzK9yJpBHCaswjI0VDIl_KZPkI4iA2TBuajRVJqQphFhHz52FzPX_b9z7mNuGFIBF7o7FU_dBcvFMc5y2AFy03Wm7iXa7ROrGRKr5eTB2UwojMZ1WpvBzieHRJ8gPJ67-lE",
    rank: "Online",
    chips: 8200,
    online: true,
    stats: { bluffRate: "80%", chipsWon: "75K", winRate: "42%", totalPot: "150K", callAcc: "35%", weeklyGain: "30K" }
  }
];

export const MARKET_ITEMS: MarketItem[] = [
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

