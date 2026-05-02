# ChoreQuest — Full Build Plan

## Overview
A mobile-first web app that makes chores fun for kids. Kids complete real-world chores to earn XP and coins, level up their Lumin companions, and unlock new characters by keeping their room clean. Parents approve chores, manage a photo queue, and control the experience via a PIN-protected mode.

**Tech stack:** React + Vite + Tailwind CSS + localStorage (no backend)  
**Routing:** View-state switching (no router library needed)  
**Future migration path:** Laravel + Livewire when multi-kid/backend needed

---

## Screens / Views

1. **Home / Dashboard** — Pet display, current active Lumin, level + XP bar, coins, today's chores, "Start a Chore" button
2. **Chore List** — Colorful cards with emoji, time, points, difficulty. Tap to start.
3. **Active Chore (Timer)** — Full-screen countdown/count-up, Lumin-specific encouragement messages every 15s, pause, Done button. Bonus points for finishing under time.
4. **Chore Complete** — Confetti, points + coins earned, Lumin reaction, home or do another.
5. **Add Chore** — Name, emoji picker, estimated minutes, points (auto-suggest), difficulty, createdBy.
6. **Lumin & Rewards** — Active Lumin bigger view, rename, level/XP bar, happiness meter, coin balance, shop (food + toys), character collection grid.
7. **Parent Mode** — PIN-protected (default 1234). Edit/delete chores, completion history, weekly goals, photo approval queue, approve rewards.
8. **Character Select** (first run only) — Pick one of Pyro, Glacie, or Zappy.
9. **Evolution Reveal** — Full-screen dramatic reveal at level 15 and 30.
10. **Photo Submit** — Kid takes/uploads room photo, submits for parent review (1 per day).

---

## Data Model (localStorage)

```js
// Active character being used
activeCharacterId: string

// All owned characters
characters: [{
  id: string,                    // e.g. "pyro"
  level: number,                 // 1–30
  xp: number,                    // 0–(100 * level scaling)
  evolutionStage: 0 | 1 | 2,     // 0=base, 1=lvl15 evolved, 2=lvl30 evolved
  happiness: number,             // 0–100
  lastInteractionDate: string,   // ISO date, for decay
  nickname: string | null,       // kid-set name override
}]

// Kid profile
kid: {
  name: string,
  totalXpEarned: number,         // lifetime XP across all characters (attracts rarer pulls)
  coins: number,
  accountLevel: number,          // derived from totalXpEarned, affects rarity weights
}

// Chores
chores: [{
  id: string,
  name: string,
  emoji: string,
  estimatedMinutes: number,
  points: number,                // XP earned
  coins: number,                 // coins earned
  difficulty: 'easy' | 'medium' | 'hard',
  createdBy: 'parent' | 'kid',
}]

// Completions
completions: [{
  choreId: string,
  characterId: string,           // which Lumin was active
  timestamp: string,
  timeTaken: number,             // seconds
  pointsEarned: number,
  coinsEarned: number,
  bonusApplied: boolean,
}]

// Streaks
streaks: {
  currentStreak: number,
  lastCompletionDate: string,
}

// Photo pull queue
photoQueue: [{
  id: string,
  photoDataUrl: string,          // base64 stored locally
  submittedAt: string,
  status: 'pending' | 'approved' | 'rejected',
  pullResult: string | null,     // characterId if pull succeeded
  lastSubmissionDate: string,    // to enforce 1/day limit
}]

// Settings
settings: {
  parentPin: string,             // default "1234"
  soundOn: boolean,
  isFirstRun: boolean,
  lastPhotoSubmissionDate: string,
}

// Shop items (static config, not stored — but purchase history tracked)
purchaseHistory: [{
  itemId: string,
  characterId: string,
  purchasedAt: string,
  coinsSpent: number,
}]
```

---

## Economy Balancing (easy to tune — all in one config file)

```js
// src/config/balance.js
export const BALANCE = {
  // XP per chore
  xp: { easy: 10, medium: 25, hard: 50 },
  // Coins per chore
  coins: { easy: 5, medium: 12, hard: 25 },
  // Timer bonus multiplier
  timerBonusMultiplier: 1.5,
  // Streak multiplier (3-day streak)
  streakMultiplier: 2.0,
  // XP needed per level (flat for now)
  xpPerLevel: 100,
  // Happiness decay per day without chores
  happinessDecayPerDay: 10,
  // Happiness max
  happinessMax: 100,
  // Happiness boost from items
  happinessFromFood: 15,
  happinessFromToy: 25,
  // XP growth bonus from happiness
  happinessXpBonus: (happiness) => happiness >= 80 ? 1.2 : happiness >= 50 ? 1.0 : 0.8,
  // Shop prices
  shop: {
    apple: { cost: 8, happinessBoost: 10, type: 'food' },
    pizza: { cost: 20, happinessBoost: 25, type: 'food' },
    cookie: { cost: 5, happinessBoost: 8, type: 'food' },
    ball: { cost: 30, happinessBoost: 20, type: 'toy' },
    plushie: { cost: 50, happinessBoost: 35, type: 'toy' },
    frisbee: { cost: 25, happinessBoost: 18, type: 'toy' },
  },
  // Pull rates by rarity (must sum to 1)
  pullRates: {
    common: 0.60,
    uncommon: 0.25,
    rare: 0.12,
    legendary: 0.03,
  },
  // Account level thresholds that improve rare pull rates
  accountLevelBonuses: [
    { level: 10, rarePullBonus: 0.02 },
    { level: 25, rarePullBonus: 0.04 },
    { level: 50, rarePullBonus: 0.07 },
  ],
}
```

---

## The Lumins — 20 Characters

### Rarity & Pull Rates
- **Common** (60%): Pyro, Glacie, Zappy, Mossy, Bubbles, Breezy
- **Uncommon** (25%): Dusty, Bloom, Rumble, Wisp, Ember, Shiver, Gale
- **Rare** (12%): Prism, Void, Solaris, Luna, Coral
- **Legendary** (3%): Nebula, Chronos

### Starter Characters (always Pyro, Glacie, Zappy)
Kid picks one at first run. The other two become pullable commons.

### Evolution Stages
- Stage 0 (Lvl 1–14): Base form — small, cute, simple
- Stage 1 (Lvl 15–29): Evolved — bigger, more features, glowing details
- Stage 2 (Lvl 30): MAX form — full majestic form, particle effects

### Character Definitions

```js
// Each character has: id, name, rarity, element, color palette,
// evolutionNames, and messages[] array for timer screen

PYRO
- Element: Fire | Rarity: Common | Palette: orange/red/yellow
- Evolutions: Pyro → Pyro+ → Pyro MAX
- Messages: "LET'S GOOO! 🔥", "You're literally on fire!", "CRUSH IT!", 
            "Pyro believes in you!", "Almost there, don't stop NOW!"

GLACIE
- Element: Ice | Rarity: Common | Palette: icy blue/white/cyan
- Evolutions: Glacie → Glacie+ → Glacie MAX
- Messages: "Cool and steady wins it.", "Ice cold focus. Nice.",
            "You've got this handled.", "Smooth. Very smooth.", "Almost done. Stay sharp."

ZAPPY
- Element: Lightning | Rarity: Common | Palette: electric yellow/purple
- Evolutions: Zappy → Zappy+ → Zappy MAX
- Messages: "ZOOOOM! GO GO GO!", "Speed run mode ACTIVATED!",
            "Zappy can barely keep up with you!", "FASTER! (just kidding, you're great)", "FINISH LINE INCOMING!"

MOSSY
- Element: Nature | Rarity: Common | Palette: green/brown/gold
- Evolutions: Mossy → Mossy+ → Mossy MAX
- Messages: "Every clean space helps things grow 🌱", "You're doing so well, I'm proud.",
            "Nature thanks you for your hard work.", "Keep going, little gardener.", "Almost in bloom!"

BUBBLES
- Element: Water | Rarity: Common | Palette: aqua/light blue/white
- Evolutions: Bubbles → Bubbles+ → Bubbles MAX
- Messages: "Don't burst under pressure — you've got this! 🫧", "Making waves!",
            "Go with the flow!", "You're on a roll(ing wave)!", "Almost shore done!"

BREEZY
- Element: Wind | Rarity: Common | Palette: sky blue/white/mint
- Evolutions: Breezy → Breezy+ → Breezy MAX
- Messages: "Gnarly effort, dude. 🤙", "Totally radical work happening here.",
            "Catch those good vibes.", "You're breezing through this.", "Almost done, hang loose!"

DUSTY
- Element: Sand | Rarity: Uncommon | Palette: tan/gold/amber
- Evolutions: Dusty → Dusty+ → Dusty MAX
- Messages: "The dune was built grain by grain.", "Patience reveals the treasure.",
            "Ancient wisdom: finish what you start.", "The desert rewards the persistent.",
            "Nearly complete. The sands remember."

BLOOM
- Element: Flower | Rarity: Uncommon | Palette: pink/lavender/soft green
- Evolutions: Bloom → Bloom+ → Bloom MAX
- Messages: "Every effort is a petal! 🌸", "You're growing into something amazing!",
            "Bloom believes in your potential!", "Gardens don't clean themselves — good thing you're here!",
            "Almost fully bloomed!"

RUMBLE
- Element: Thunder | Rarity: Uncommon | Palette: dark purple/electric blue/gold
- Evolutions: Rumble → Rumble+ → Rumble MAX
- Messages: "RUMBLE SAYS: DO NOT STOP. ⚡", "THE THUNDER APPROVES OF YOUR EFFORT!",
            "LEGENDARY PERFORMANCE HAPPENING RIGHT NOW!", "THE STORM IS PROUD OF YOU!",
            "FINISH IT! FOR GLORY!"

WISP
- Element: Spirit | Rarity: Uncommon | Palette: purple/teal/ghostly white
- Evolutions: Wisp → Wisp+ → Wisp MAX
- Messages: "Boo! Just kidding. You're doing great 👻", "Wisp is haunting your laziness away.",
            "Spooky how good you are at this.", "The ghost of chores past is impressed.",
            "Almost vanished from the chore list!"

EMBER
- Element: Magma | Rarity: Uncommon | Palette: deep red/orange/black
- Evolutions: Ember → Ember+ → Ember MAX
- Messages: "Focus. Execute. Dominate.", "No excuses. Just results.",
            "Ember doesn't celebrate until it's done.", "You're forged in fire. Act like it.",
            "Finish line. Now."

SHIVER
- Element: Frost | Rarity: Uncommon | Palette: pale blue/white/silver
- Evolutions: Shiver → Shiver+ → Shiver MAX
- Messages: "Shiver has counted 47 seconds elapsed. Excellent pace. ❄️",
            "Temperature: cold. Work ethic: hot.", "Precision is the goal. You're nailing it.",
            "Shiver calculates: 73% complete. Keep going.",
            "Final stretch. Shiver approves."

GALE
- Element: Storm | Rarity: Uncommon | Palette: dark blue/silver/electric white
- Evolutions: Gale → Gale+ → Gale MAX
- Messages: "Nothing stops a storm. Nothing stops you. 🌪️", "Unleash it!",
            "The wind doesn't ask permission. Neither do you.", "Gale-force effort detected!",
            "Tear through that finish line!"

PRISM
- Element: Rainbow | Rarity: Rare | Palette: full spectrum, bright
- Evolutions: Prism → Prism+ → Prism MAX
- Messages: "ABSOLUTELY MAGNIFICENT WORK. 🌈", "The most spectacular chore performance I have EVER witnessed.",
            "You are dazzling. Prism is dazzled.", "This is HISTORIC. Write it down.",
            "THE GRANDEST FINALE APPROACHES!"

VOID
- Element: Shadow | Rarity: Rare | Palette: deep black/dark purple/faint glow
- Evolutions: Void → Void+ → Void MAX
- Messages: "...", "Not bad.", "The darkness respects the work. 🖤",
            "Few make it this far.", "Almost. Don't ruin it."

SOLARIS
- Element: Sun | Rarity: Rare | Palette: warm gold/orange/white
- Evolutions: Solaris → Solaris+ → Solaris MAX
- Messages: "You shine so bright ☀️", "The sun rises for those who work.",
            "Warmth fills the room with every chore you complete.", "You are radiant.",
            "The light grows. You're almost done."

LUNA
- Element: Moon | Rarity: Rare | Palette: deep blue/silver/lavender
- Evolutions: Luna → Luna+ → Luna MAX
- Messages: "Even the moon completes its journey. 🌙", "In stillness, great things are accomplished.",
            "The stars watch over those who work.", "Like tides — steady, powerful, inevitable.",
            "The moon is proud of you tonight."

CORAL
- Element: Deep Ocean | Rarity: Rare | Palette: coral/teal/deep blue
- Evolutions: Coral → Coral+ → Coral MAX
- Messages: "Deep work requires deep focus. 🪸", "The ocean was shaped one wave at a time.",
            "You're diving deeper than most.", "Pressure makes pearls. Keep going.",
            "Rising to the surface. Almost done."

NEBULA
- Element: Cosmos | Rarity: Legendary | Palette: deep space purple/blue/pink starfield
- Evolutions: Nebula → Nebula+ → Nebula MAX
- Messages: "Across galaxies, this effort is legendary. ✨",
            "Stars were born from hard work. So are you.",
            "The cosmos has witnessed ten thousand years of effort. Yours ranks among the finest.",
            "Nebula has traveled far to witness this.", "A supernova of achievement approaches."

CHRONOS
- Element: Time | Rarity: Legendary | Palette: gold/silver/clockwork bronze
- Evolutions: Chronos → Chronos+ → Chronos MAX
- Messages: "Time is the only currency that matters. Spend it well. ⏳",
            "In ten years, you'll remember that you never gave up.",
            "Every second you work shapes who you become.",
            "The clock counts your progress, not your failures.",
            "This moment will be remembered."
```

---

## Photo Pull System

1. Kid submits a room photo (1 per day limit enforced by `settings.lastPhotoSubmissionDate`)
2. Photo stored as base64 in `photoQueue` with status `pending`
3. Parent sees pending count badge in Parent Mode
4. Parent views photo, approves or rejects
5. On **approve**: pull check runs against rarity weights (adjusted by kid's account level)
   - If pull **hits**: photo shows a shiny animated spot → kid taps it → gacha reveal screen shows new character
   - If pull **misses**: photo shows a simple "Great job! No visitor today." message
6. Characters already owned cannot be pulled again (re-roll automatically)
7. Reject = no pull attempt, photo flagged

**Pull check probability per approval (not per photo):**
- A "miss" is ~40% base chance regardless of rarity (so approval ≠ guaranteed pull)
- Then if it hits, rarity weights determine which character appears

---

## Happiness System

- Happiness: 0–100, displayed as a colored bar (red → yellow → green)
- Decays by `happinessDecayPerDay` (10) for each day without a completed chore
- Feeding food or giving a toy boosts happiness instantly
- Happiness affects XP growth rate:
  - 80–100 (Happy): +20% XP bonus
  - 50–79 (Content): no modifier
  - 0–49 (Sad): -20% XP penalty
- Visual: Lumin's expression/animation changes based on happiness tier

---

## Evolution Reveal Flow

Trigger: Character XP hits level 15 or 30 threshold after chore completion.

1. Chore Complete screen shows as normal
2. "Wait... something's happening!" message appears
3. Full-screen Evolution Reveal screen:
   - Dark background, dramatic music sting
   - Current form shown, then screen flashes/shakes
   - New form revealed with particle effects
   - Evolution name displayed (e.g., "Pyro has become **Pyro+**!")
4. Return to home

---

## Code Structure

```
src/
  config/
    balance.js          ← all tunable numbers
    characters.js       ← all 20 Lumin definitions (messages, palette, rarity)
    shopItems.js        ← food and toy definitions
  
  hooks/
    useAppState.js      ← single localStorage context/hook
    useHappinessDecay.js
    usePullSystem.js
  
  components/
    screens/
      HomeScreen.jsx
      ChoreListScreen.jsx
      ActiveChoreScreen.jsx
      ChoreCompleteScreen.jsx
      AddChoreScreen.jsx
      LuminRewardsScreen.jsx
      ParentModeScreen.jsx
      CharacterSelectScreen.jsx
      EvolutionRevealScreen.jsx
      PhotoSubmitScreen.jsx
    shared/
      LuminDisplay.jsx     ← renders SVG Lumin by id + stage + happiness
      ChoreCard.jsx
      Timer.jsx
      ConfettiOverlay.jsx
      HappinessBar.jsx
      XPBar.jsx
      CoinDisplay.jsx
      ShopItem.jsx
      PullReveal.jsx
  
  lumins/
    svg/
      pyro-0.svg (or inline JSX components)
      pyro-1.svg
      pyro-2.svg
      ... (60 SVG files total, or React SVG components)
  
  utils/
    localStorage.js      ← read/write helpers
    pullSystem.js        ← rarity roll logic
    happinessCalc.js
    xpCalc.js
```

---

## Seed Data

```js
chores: [
  { name: "Make Bed", emoji: "🛏️", estimatedMinutes: 5, points: 10, coins: 5, difficulty: "easy", createdBy: "parent" },
  { name: "Tidy Room", emoji: "🧹", estimatedMinutes: 15, points: 25, coins: 12, difficulty: "medium", createdBy: "parent" },
  { name: "Empty Dishwasher", emoji: "🍽️", estimatedMinutes: 10, points: 25, coins: 12, difficulty: "medium", createdBy: "parent" },
  { name: "Vacuum Living Room", emoji: "🌀", estimatedMinutes: 20, points: 50, coins: 25, difficulty: "hard", createdBy: "parent" },
  { name: "Take Out Trash", emoji: "🗑️", estimatedMinutes: 5, points: 10, coins: 5, difficulty: "easy", createdBy: "parent" },
  { name: "Clean Bathroom Sink", emoji: "🚿", estimatedMinutes: 8, points: 10, coins: 5, difficulty: "easy", createdBy: "parent" },
]
```

---

## Build Phases

### Phase 1 (Current — this build)
- All 10 screens
- Full character system (all 20 defined, 3 starters + unlock via pull)
- Two-currency economy (XP + Coins)
- Shop (food + toys)
- Happiness system with decay
- Photo queue + parent approval
- Pull/gacha system with rarity
- Evolution reveal at 15 + 30
- Lumin-specific encouragement messages
- Streak system
- Single kid profile (architecture ready for multi)
- Parent mode (PIN, chore management, photo queue, history)
- Confetti on completion
- Sound effects with mute toggle
- Mobile-first responsive

### Phase 2 (Future)
- Accessories (per account, swappable between Lumins)
- Multiple kid profiles
- Laravel + Livewire migration
- PvP battles / PvE scenarios
- Stats system post-level-30
- Expanded shop items
