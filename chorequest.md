Build a web app called "ChoreQuest" that makes cleaning fun for 10-year-olds. Use React + Vite + Tailwind CSS, and store all data in localStorage (no backend). Make it a single-page app with client-side routing or simple view-state switching.

CORE CONCEPT:
Kids complete real-world chores in timed challenges to earn points, level up, and grow a virtual pet companion. Both parents and kids can add chores.

SCREENS / VIEWS:
1. Home / Dashboard — shows the virtual pet, current level, total points, today's chore list, and big "Start a Chore" button.
2. Chore List — all available chores as colorful cards with estimated time, points reward, and difficulty (easy/medium/hard). Kid taps one to start.
3. Active Chore (Timer Challenge) — full-screen countdown/count-up timer with the chore name, encouragement messages that change every 15 seconds ("You got this!", "Halfway there!", "Crushing it!"), a big pause button, and a "Done!" button. If they finish under the estimated time, they get bonus points.
4. Chore Complete — celebration screen with confetti animation, points earned, pet reaction ("Your pet is so happy!"), and buttons to go home or do another chore.
5. Add Chore — form with chore name, emoji/icon picker, estimated minutes, points value (auto-suggest based on time), and difficulty. Both parent and kid modes can add chores; mark who created it.
6. Pet & Rewards — shows the pet bigger, its name (kid can rename it), level, XP bar to next level, and unlocked accessories/evolutions.
7. Parent Mode — PIN-protected (default 1234, changeable). Parent can edit/delete any chore, see completion history, set weekly goals, and approve big rewards.

VIRTUAL PET SYSTEM:
- Pet is a cute SVG creature (start as a small egg/blob, evolve every 5 levels: blob → fluffy creature → winged creature → cosmic form).
- Each completed chore = XP. 100 XP per level.
- Pet has a mood that reflects recent activity (happy if chores done today, sleepy if none in 24hrs).
- Pet animates with simple CSS (bobbing, blinking, occasional wiggle).

POINTS & LEVELS:
- Easy chore: 10 pts, Medium: 25 pts, Hard: 50 pts.
- Beating the timer = +50% bonus.
- Streak system: 3 days in a row = 2x multiplier day.

DESIGN REQUIREMENTS:
- Bright, playful, kid-friendly palette (purples, teals, sunny yellows — not babyish).
- Rounded corners everywhere, large tap targets, big readable fonts.
- Use lucide-react for icons and simple emoji for chore icons.
- Confetti effect on completion (use canvas-confetti or a simple CSS animation).
- Sound effects on key actions (button taps, completion fanfare, level up) — use Web Audio API or short base64 sounds, with a mute toggle.
- Smooth page transitions.
- Mobile-first responsive design (this will mostly be used on a tablet/phone).

DATA MODEL (localStorage):
- chores: [{id, name, emoji, estimatedMinutes, points, difficulty, createdBy: 'parent' | 'kid'}]
- completions: [{choreId, timestamp, timeTaken, pointsEarned}]
- pet: {name, level, xp, evolutionStage, mood}
- settings: {parentPin, soundOn, kidName}
- streaks: {currentStreak, lastCompletionDate}

SEED DATA:
Pre-populate with 6 starter chores like: Make bed (easy, 5min), Tidy room (medium, 15min), Empty dishwasher (medium, 10min), Vacuum living room (hard, 20min), Take out trash (easy, 5min), Clean bathroom sink (easy, 8min). Each with a fitting emoji.

CODE STRUCTURE:
- Components folder with one component per screen plus shared UI (PetDisplay, ChoreCard, Timer, ConfettiOverlay).
- A single useAppState hook or context that wraps localStorage reads/writes.
- Keep it organized but don't over-engineer — this is a fun project, not enterprise software.

Ship a working, polished version. Make the pet really cute. Make completing a chore feel rewarding and exciting.
