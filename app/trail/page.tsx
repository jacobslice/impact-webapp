"use client";

import { useState, useEffect, useReducer, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { ScoreData } from "@/lib/types";
import { getTier, computeBreakdown, computeSectorScores } from "@/lib/types";
import { PROFESSIONS, SUPPLIES, RANDOM_EVENTS, HUNT_TARGETS, getLandmarksForWallet, getProfessionForWallet, DEFAULT_PARTY_HANDLES } from "@/lib/trail-data";
import type { Profession, Landmark, RandomEvent } from "@/lib/trail-data";
import { useTwitterProfile } from "@/components/social/TwitterConnect";

// ============================================================
// TYPES
// ============================================================
interface StatChange {
  label: string;
  before: number | string;
  after: number | string;
  delta?: string;
  type: "good" | "bad" | "neutral";
}

interface PartyMember {
  handle: string;
  hp: number;
  alive: boolean;
}

interface GameState {
  phase: "title" | "connect" | "party" | "profession" | "store" | "sbf" | "trail" | "event" | "landmark" | "hunt" | "outcome" | "score";
  scoreData: ScoreData | null;
  player: string;
  playerAvatar: string | null;
  party: PartyMember[];
  profession: Profession | null;
  sol: number;
  supplies: Record<string, number>;
  landmarks: Landmark[];
  currentLandmark: number;
  events: string[];
  health: number;
  gameScore: number;
  currentEvent: RandomEvent | null;
  currentLandmarkData: Landmark | null;
  huntTargets: { emoji: string; name: string; points: number; x: number; y: number; alive: boolean; id: number; dx: number; dy: number }[];
  huntScore: number;
  huntBullets: number;
  lastOutcome: { text: string; changes: StatChange[] } | null;
}

type Action =
  | { type: "SET_PHASE"; phase: GameState["phase"] }
  | { type: "SET_SCORE_DATA"; data: ScoreData }
  | { type: "SET_PLAYER"; handle: string; avatar?: string | null }
  | { type: "SET_PARTY"; party: PartyMember[] }
  | { type: "ADD_PARTY"; handle: string }
  | { type: "REMOVE_PARTY"; index: number }
  | { type: "SET_PROFESSION"; profession: Profession }
  | { type: "AUTO_PROFESSION"; data: ScoreData } // kept for compatibility
  | { type: "BUY_SUPPLY"; name: string; price: number }
  | { type: "SBF_CHOICE"; trust: boolean }
  | { type: "ADVANCE_TRAIL" }
  | { type: "DISMISS_EVENT" }
  | { type: "DISMISS_OUTCOME" }
  | { type: "LANDMARK_CHOICE"; choiceIndex: number }
  | { type: "START_HUNT" }
  | { type: "HUNT_SHOOT"; targetId: number }
  | { type: "END_HUNT" }
  | { type: "SKIP_TO_SCORE" };

function makeOutcome(text: string, changes: StatChange[]): { text: string; changes: StatChange[] } {
  return { text, changes };
}

const initialState: GameState = {
  phase: "title",
  scoreData: null,
  player: "",
  playerAvatar: null,
  party: [],
  profession: null,
  sol: 0,
  supplies: { Bulls: 2, Food: 10, Medicine: 3 },
  landmarks: [],
  currentLandmark: -1,
  events: [],
  health: 100,
  gameScore: 0,
  currentEvent: null,
  currentLandmarkData: null,
  huntTargets: [],
  huntScore: 0,
  huntBullets: 5,
  lastOutcome: null,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_SCORE_DATA": {
      const protocols = Array.isArray(action.data.protocols_used)
        ? action.data.protocols_used
        : typeof action.data.protocols_used === "string"
          ? action.data.protocols_used.split(",").map(p => p.trim())
          : [];
      return { ...state, scoreData: action.data, landmarks: getLandmarksForWallet(protocols) };
    }
    case "SET_PLAYER":
      return { ...state, player: action.handle, playerAvatar: action.avatar || null };
    case "SET_PARTY":
      return { ...state, party: action.party };
    case "ADD_PARTY":
      if (state.party.length >= 4) return state;
      return { ...state, party: [...state.party, { handle: action.handle, hp: 50 + Math.floor(Math.random() * 50), alive: true }] };
    case "REMOVE_PARTY":
      return { ...state, party: state.party.filter((_, i) => i !== action.index) };
    case "SET_PROFESSION":
      return { ...state, profession: action.profession, sol: action.profession.startSol, phase: "store" };
    case "AUTO_PROFESSION": {
      const prof = getProfessionForWallet(action.data);
      return { ...state, profession: prof, sol: prof.startSol, phase: "store" };
    }
    case "BUY_SUPPLY": {
      if (state.sol < action.price) return state;
      return {
        ...state,
        sol: state.sol - action.price,
        supplies: { ...state.supplies, [action.name]: (state.supplies[action.name] || 0) + 1 },
      };
    }
    case "SBF_CHOICE": {
      if (action.trust) {
        const beforeSol = state.sol;
        const lost = Math.round(beforeSol * 0.3 * 10) / 10;
        return {
          ...state,
          sol: Math.max(0, beforeSol - lost),
          events: [...state.events, `SBF promised 20% APY. He got shanked in the lunch line and your ${lost} SOL fell into the prison toilet.`],
          lastOutcome: makeOutcome(
            `SBF promised 20% APY. He got shanked in the lunch line trying to trade your SOL for ramen. Your ${lost} SOL fell into the prison toilet. Gone forever.`,
            [{ label: "SOL", before: beforeSol.toFixed(1), after: Math.max(0, beforeSol - lost).toFixed(1), delta: `-${lost}`, type: "bad" }]
          ),
          phase: "outcome",
        };
      }
      return {
        ...state,
        events: [...state.events, "You walked past SBF's cell. Smart move."],
        lastOutcome: makeOutcome("You walked past SBF's cell. He's still calling out to the next traveler. \"Come back! I have a new exchange launching!\"", []),
        phase: "outcome",
      };
    }
    case "ADVANCE_TRAIL": {
      const next = state.currentLandmark + 1;
      // Consume 1 food per advance
      const newSupplies = { ...state.supplies };
      const foodBefore = newSupplies.Food || 0;
      newSupplies.Food = Math.max(0, foodBefore - 1);

      // Check lose conditions
      if (newSupplies.Food <= 0 && state.health <= 20) {
        return { ...state, supplies: newSupplies, phase: "score",
          events: [...state.events, "Your party ran out of Big Macs and turned on each other. Journey over."] };
      }
      if (newSupplies.Bulls <= 0) {
        return { ...state, supplies: newSupplies, phase: "score",
          events: [...state.events, "All your bulls are dead. No wagon, no journey. You're stranded."] };
      }
      if (state.sol <= 0 && newSupplies.Food <= 0) {
        return { ...state, supplies: newSupplies, phase: "score",
          events: [...state.events, "No Solana, no food. Your party turned on you. Journey over."] };
      }

      if (next >= state.landmarks.length) {
        return { ...state, supplies: newSupplies, phase: "score" };
      }
      // 60% event, 20% hunt, 20% straight to landmark (more events = more deaths)
      const roll = Math.random();
      if (roll < 0.6 && state.currentLandmark >= 0) {
        const evt = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        const newParty = [...state.party];
        let newHealth = state.health;
        let newSol = state.sol;
        const newSupplies = { ...state.supplies };
        let text = evt.text;
        const changes: StatChange[] = [];

        if (text.includes("PARTY_MEMBER") && newParty.length > 0) {
          const alive = newParty.filter(m => m.alive);
          if (alive.length > 0) {
            const victim = alive[Math.floor(Math.random() * alive.length)];
            text = text.replace("PARTY_MEMBER", `@${victim.handle}`);
            const oldHp = victim.hp;
            // Catastrophic events with PARTY_MEMBER = death
            if (evt.effect === "catastrophic") {
              victim.hp = 0;
              victim.alive = false;
              text += ` @${victim.handle} has died.`;
              changes.push({ label: `@${victim.handle}`, before: `${oldHp} HP`, after: "DEAD ☠️", type: "bad" });
            } else {
              victim.hp -= 40;
              if (victim.hp <= 0) {
                victim.alive = false;
                text += ` @${victim.handle} has died.`;
                changes.push({ label: `@${victim.handle}`, before: `${oldHp} HP`, after: "DEAD ☠️", type: "bad" });
              } else {
                changes.push({ label: `@${victim.handle} HP`, before: oldHp, after: victim.hp, delta: "-40", type: "bad" });
              }
            }
          }
        }

        const oldHealth = newHealth;
        const oldSol = newSol;
        if (evt.effect === "catastrophic") { newHealth = Math.max(0, newHealth - 25); newSol = Math.max(0, newSol - 3); newSupplies.Food = Math.max(0, (newSupplies.Food || 0) - 2); }
        if (evt.effect === "bad") { newHealth = Math.max(0, newHealth - 10); newSol = Math.max(0, newSol - 1); newSupplies.Food = Math.max(0, (newSupplies.Food || 0) - 1); }
        if (evt.effect === "good") {
          newHealth = Math.min(100, newHealth + 10);
          newSol += 5;
          // Heal all alive party members too
          for (const m of newParty) {
            if (m.alive) {
              const oldMHp = m.hp;
              m.hp = Math.min(100, m.hp + 15);
              if (m.hp !== oldMHp) {
                changes.push({ label: `@${m.handle} HP`, before: oldMHp, after: m.hp, delta: `+${m.hp - oldMHp}`, type: "good" });
              }
            }
          }
        }

        if (newHealth !== oldHealth) changes.push({ label: "Health", before: oldHealth, after: newHealth, delta: `${newHealth > oldHealth ? "+" : ""}${newHealth - oldHealth}`, type: newHealth > oldHealth ? "good" : "bad" });
        if (newSol !== oldSol) changes.push({ label: "Solana", before: oldSol.toFixed(1), after: newSol.toFixed(1), delta: `${newSol > oldSol ? "+" : ""}${(newSol - oldSol).toFixed(1)}`, type: newSol > oldSol ? "good" : "bad" });
        const oldFood = state.supplies.Food || 0;
        const newFood = newSupplies.Food || 0;
        if (newFood !== oldFood) changes.push({ label: "Food (Big Macs)", before: oldFood, after: newFood, delta: `${newFood - oldFood}`, type: "bad" });

        return {
          ...state,
          currentEvent: { ...evt, text },
          party: newParty,
          health: newHealth,
          sol: newSol,
          supplies: newSupplies,
          events: [...state.events, text],
          lastOutcome: makeOutcome(text, changes),
          phase: "event",
        };
      }
      if (roll < 0.8 && state.currentLandmark >= 0) {
        const targets = Array.from({ length: 6 }, (_, i) => {
          const t = HUNT_TARGETS[Math.floor(Math.random() * HUNT_TARGETS.length)];
          return {
            emoji: t.emoji, name: t.name, points: t.points,
            x: Math.random() * 70 + 10,
            y: Math.random() * 55 + 10,
            alive: true, id: i,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 1.5,
          };
        });
        return { ...state, huntTargets: targets, huntScore: 0, huntBullets: 5, phase: "hunt" };
      }
      return {
        ...state,
        currentLandmark: next,
        currentLandmarkData: state.landmarks[next],
        phase: "landmark",
      };
    }
    case "DISMISS_EVENT":
      return { ...state, phase: "outcome" };
    case "DISMISS_OUTCOME":
      return { ...state, lastOutcome: null, phase: "trail" };
    case "LANDMARK_CHOICE": {
      const choice = state.currentLandmarkData?.choices[action.choiceIndex];
      if (!choice) return state;
      const oldHealth = state.health;
      const oldSol = state.sol;
      let newHealth = state.health;
      let newSol = state.sol;
      let newScore = state.gameScore + 100;
      const changes: StatChange[] = [];

      if (choice.effect === "good") { newHealth = Math.min(100, newHealth + 10); newSol += 5; newScore += 50; }
      if (choice.effect === "bad") { newHealth = Math.max(0, newHealth - 15); newSol = Math.max(0, newSol - 5); }

      if (newHealth !== oldHealth) changes.push({ label: "Health", before: oldHealth, after: newHealth, delta: `${newHealth > oldHealth ? "+" : ""}${newHealth - oldHealth}`, type: newHealth > oldHealth ? "good" : "bad" });
      if (newSol !== oldSol) changes.push({ label: "Solana", before: oldSol.toFixed(1), after: newSol.toFixed(1), delta: `${newSol > oldSol ? "+" : ""}${(newSol - oldSol).toFixed(1)}`, type: newSol > oldSol ? "good" : "bad" });
      changes.push({ label: "Game Score", before: state.gameScore, after: newScore, delta: `+${newScore - state.gameScore}`, type: "good" });

      return {
        ...state,
        health: newHealth,
        sol: newSol,
        gameScore: newScore,
        events: [...state.events, `${state.currentLandmarkData!.name}: ${choice.outcome}`],
        lastOutcome: makeOutcome(choice.outcome, changes),
        phase: "outcome",
      };
    }
    case "HUNT_SHOOT": {
      if (state.huntBullets <= 0) return state;
      const targets = state.huntTargets.map(t =>
        t.id === action.targetId ? { ...t, alive: false } : t
      );
      const hit = state.huntTargets.find(t => t.id === action.targetId);
      const points = hit?.points ?? 0;
      const newSupplies = { ...state.supplies };
      // If you shot a bull, lose one from your supplies
      if (hit?.name === "Bull") {
        newSupplies.Bulls = Math.max(0, (newSupplies.Bulls || 0) - 1);
      }
      return { ...state, huntTargets: targets, huntScore: state.huntScore + points, huntBullets: state.huntBullets - 1, supplies: newSupplies };
    }
    case "END_HUNT": {
      const oldSol = state.sol;
      const solGain = state.huntScore;
      const newSol = Math.max(0, oldSol + solGain);
      return {
        ...state,
        sol: newSol,
        gameScore: state.gameScore + Math.max(0, state.huntScore),
        events: [...state.events, `Hunt: ${solGain >= 0 ? "+" : ""}${solGain} Solana`],
        lastOutcome: makeOutcome(
          `Hunting complete! ${5 - state.huntBullets} bullets used. ${solGain >= 0 ? "Earned" : "Lost"} ${Math.abs(solGain)} Solana.${state.supplies.Bulls < (state.supplies.Bulls || 0) ? " You accidentally shot one of your bulls!" : ""}`,
          [
            { label: "Solana", before: oldSol.toFixed(1), after: newSol.toFixed(1), delta: `${solGain >= 0 ? "+" : ""}${solGain}`, type: solGain >= 0 ? "good" : "bad" },
          ]
        ),
        phase: "outcome",
      };
    }
    case "SKIP_TO_SCORE":
      return { ...state, phase: "score" };
    default:
      return state;
  }
}

// ============================================================
// COMPONENTS
// ============================================================

function CRTWrapper({ children, onSkip }: { children: React.ReactNode; onSkip?: () => void }) {
  return (
    <div className="min-h-screen bg-[#001a00] flex items-center justify-center p-4 relative overflow-hidden" style={{ ['--tw-animate-fade' as string]: '' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
      }} />
      <div className="fixed inset-0 pointer-events-none z-40" style={{
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,10,0,0.8) 100%)",
      }} />
      {onSkip && (
        <button onClick={onSkip} className="fixed top-4 right-4 z-50 text-[#33ff33]/40 hover:text-[#33ff33]/80 text-xs font-mono border border-[#33ff33]/20 px-3 py-1 rounded hover:border-[#33ff33]/50 transition-all">
          SKIP TO SCORE →
        </button>
      )}
      <div className="w-full max-w-3xl font-mono" style={{ color: "#33ff33", textShadow: "0 0 8px #33ff3366, 0 0 2px #33ff33" }}>
        {children}
      </div>
    </div>
  );
}

function PixelBar({ value, max, width = 20 }: { value: number; max: number; width?: number }) {
  const filled = Math.round((value / max) * width);
  return <span>{"█".repeat(filled)}{"░".repeat(width - filled)} {value}/{max}</span>;
}

function OutcomePanel({ outcome, onContinue }: { outcome: { text: string; changes: StatChange[] }; onContinue: () => void }) {
  const colors = { good: "text-[#00ff00]", bad: "text-[#ff4444]", neutral: "text-[#33ff33]/60" };
  return (
    <div className="space-y-4">
      <div className="border border-[#33ff33]/30 p-4 text-sm">{outcome.text}</div>
      {outcome.changes.length > 0 && (
        <div className="border border-[#33ff33]/20 p-3 space-y-1">
          <div className="text-xs text-[#33ff33]/40 mb-2">═══ WHAT CHANGED ═══</div>
          {outcome.changes.map((c, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-[#33ff33]/60">{c.label}</span>
              <span>
                <span className="text-[#33ff33]/30">{c.before}</span>
                {c.delta && <span className={`ml-2 font-bold ${colors[c.type]}`}>{c.delta}</span>}
                <span className="ml-2">→ <span className={colors[c.type]}>{c.after}</span></span>
              </span>
            </div>
          ))}
        </div>
      )}
      <button onClick={onContinue} className="px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10">Continue →</button>
    </div>
  );
}

function StatusBar({ state }: { state: GameState }) {
  return (
    <div className="border border-[#33ff33]/20 p-3 text-xs space-y-1">
      <div className="flex justify-between">
        <span>Health: <PixelBar value={state.health} max={100} width={12} /></span>
        <span>Solana: {state.sol.toFixed(1)}</span>
        <span>Score: {state.gameScore}</span>
      </div>
      <div className="flex gap-6">
        <span>🐂 Bulls: {state.supplies.Bulls || 0}</span>
        <span>🍔 Food: {state.supplies.Food || 0} Big Macs</span>
        <span>🥩 Medicine: {state.supplies.Medicine || 0}</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {state.party.map((m, i) => (
          <span key={i} className={m.alive ? "" : "line-through text-[#ff4444]/50"}>
            @{m.handle}: {m.alive ? `${m.hp}HP` : "☠️"}
          </span>
        ))}
      </div>
    </div>
  );
}

function Tombstone({ handle }: { handle: string }) {
  return (
    <div className="text-center animate-[fadeIn_1.5s_ease-in] border border-[#ff4444]/20 bg-[#ff4444]/5 p-4 rounded">
      <pre className="text-[#ff4444]/70 text-xs leading-tight">{`
    ▄████████▄
   ██████████████
   ██          ██
   ██  R.I.P.  ██
   ██          ██
   ██ @${handle.length > 10 ? handle.slice(0, 10) + ".." : handle.padEnd(12)}██
   ██          ██
   ██ Lost on  ██
   ██ the      ██
   ██ chain    ██
   ██████████████
   ░░░░░░░░░░░░░░`}</pre>
    </div>
  );
}

function EventLog({ events }: { events: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [events]);
  return (
    <div ref={ref} className="border border-[#33ff33]/10 p-3 text-xs text-[#33ff33]/40 max-h-28 overflow-y-auto space-y-1">
      {events.length === 0 ? (
        <div>The trail awaits...</div>
      ) : (
        events.map((e, i) => <div key={i}>▸ {e}</div>)
      )}
    </div>
  );
}

// ============================================================
// MAIN GAME
// ============================================================
export default function TrailPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { profile } = useTwitterProfile();
  const [partyInput, setPartyInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if (state.phase === "event") dispatch({ type: "DISMISS_EVENT" });
        if (state.phase === "outcome") dispatch({ type: "DISMISS_OUTCOME" });
      }
      if (e.key === "Escape") dispatch({ type: "SKIP_TO_SCORE" });
      // Number keys for choices
      if (state.phase === "landmark" && state.currentLandmarkData) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= state.currentLandmarkData.choices.length) {
          dispatch({ type: "LANDMARK_CHOICE", choiceIndex: num - 1 });
        }
      }
      if (state.phase === "profession") {
        const num = parseInt(e.key);
        if (num >= 1 && num <= PROFESSIONS.length) {
          dispatch({ type: "SET_PROFESSION", profession: PROFESSIONS[num - 1] });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, state.currentLandmarkData]);

  // Fetch score when wallet connects
  useEffect(() => {
    if (!connected || !publicKey || state.scoreData) return;
    const fetchScore = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/score?address=${publicKey.toBase58()}`);
        const data = await res.json();
        if (res.ok) dispatch({ type: "SET_SCORE_DATA", data: data.data });
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchScore();
  }, [connected, publicKey, state.scoreData]);

  // Initialize party with defaults when entering party phase
  useEffect(() => {
    if (state.phase === "party" && state.party.length === 0) {
      const defaults = DEFAULT_PARTY_HANDLES.map(h => ({
        handle: h, hp: 50 + Math.floor(Math.random() * 50), alive: true,
      }));
      dispatch({ type: "SET_PARTY", party: defaults });
      // Auto-fill leader from Twitter if connected
      if (profile) {
        dispatch({ type: "SET_PLAYER", handle: profile.handle, avatar: profile.avatarUrl });
      }
    }
  }, [state.phase, state.party.length, profile]);

  // Hunt target movement
  useEffect(() => {
    if (state.phase !== "hunt") return;
    const interval = setInterval(() => {
      dispatch({ type: "SET_PHASE", phase: "hunt" }); // trigger re-render
    }, 500);
    return () => clearInterval(interval);
  }, [state.phase]);

  const skip = () => dispatch({ type: "SKIP_TO_SCORE" });
  const advance = useCallback(() => dispatch({ type: "ADVANCE_TRAIL" }), []);

  // ============ TITLE ============
  if (state.phase === "title") {
    return (
      <CRTWrapper>
        <div className="text-center space-y-6 py-12">
          <pre className="text-[#33ff33] text-xs sm:text-sm leading-tight whitespace-pre">{`
   ____        __                    ______          _ __
  / __/____   / /___ _ ____  ___ _ /_  __/______ _ (_) /
 _\\ \\ / _ \\ / / __ \`// __ \\/ __ \`/  / /  / __/ __ \`// / /
/___/ \\___//_/\\_,_//_/ /_/\\_,_/  /_/  /_/  \\_,_//_/_/
          `}</pre>
          <p className="text-lg">The Blockchain Trail</p>
          <div className="space-y-2 text-sm text-[#33ff33]/60">
            <p>Travel the Solana blockchain from your first wallet to the Promised Land.</p>
            <p>Your protocols. Your journey. Your score.</p>
          </div>
          <button
            onClick={() => dispatch({ type: "SET_PHASE", phase: "connect" })}
            className="mt-8 px-8 py-3 border-2 border-[#33ff33] text-[#33ff33] hover:bg-[#33ff33]/10 transition-all text-lg animate-pulse"
          >
            ▸ PRESS START ◂
          </button>
          <p className="text-[#33ff33]/20 text-xs mt-4">ESC to skip at any time | ENTER to continue | 1-3 to choose</p>
        </div>
      </CRTWrapper>
    );
  }

  // ============ CONNECT ============
  if (state.phase === "connect") {
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-6 py-8">
          <h2 className="text-xl">═══ CONNECT YOUR WAGON ═══</h2>
          <p className="text-sm text-[#33ff33]/70">Connect your Solana wallet to load your trail.</p>
          <p className="text-sm text-[#33ff33]/70">Your score is hidden until you reach Oregon.</p>
          <p className="text-xs text-[#33ff33]/40">Your wallet determines your profession and starting SOL.</p>
          {loading && <p className="animate-pulse">Loading wagon manifest...</p>}
          {connected && state.scoreData ? (
            <div>
              <p className="text-[#33ff33]">✓ Wallet connected. {state.landmarks.length} landmarks loaded from your {state.scoreData.protocol_count} protocols.</p>
              <button onClick={() => dispatch({ type: "SET_PHASE", phase: "party" })} className="mt-4 px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10">
                CONTINUE →
              </button>
            </div>
          ) : connected && !loading ? (
            <div>
              <p className="text-[#33ff33]/60">Wallet not scored yet. Using default trail.</p>
              <button onClick={() => dispatch({ type: "SET_PHASE", phase: "party" })} className="mt-4 px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10">
                CONTINUE →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button onClick={() => setVisible(true)} className="px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10">
                CONNECT WALLET
              </button>
              <button onClick={() => dispatch({ type: "SET_PHASE", phase: "party" })} className="block px-6 py-2 border border-[#33ff33]/20 hover:bg-[#33ff33]/5 text-[#33ff33]/40 text-sm">
                or enter address manually →
              </button>
            </div>
          )}
        </div>
      </CRTWrapper>
    );
  }

  // ============ PARTY ============
  if (state.phase === "party") {
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-6 py-8">
          <h2 className="text-xl">═══ ASSEMBLE YOUR PARTY ═══</h2>
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <span className="text-[#33ff33]/50 w-20">Leader:</span>
              {profile ? (
                <span className="text-[#33ff33]">@{profile.handle} ✓</span>
              ) : (
                <input
                  value={state.player}
                  onChange={e => dispatch({ type: "SET_PLAYER", handle: e.target.value.replace("@", "") })}
                  placeholder="your_handle"
                  className="bg-transparent border-b border-[#33ff33]/30 text-[#33ff33] outline-none px-2 flex-1"
                />
              )}
            </div>
            {state.party.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-[#33ff33]/50 w-20">Member {i + 1}:</span>
                <input
                  value={m.handle}
                  onChange={e => {
                    const newParty = [...state.party];
                    newParty[i] = { ...newParty[i], handle: e.target.value.replace("@", "") };
                    dispatch({ type: "SET_PARTY", party: newParty });
                  }}
                  className="bg-transparent border-b border-[#33ff33]/30 text-[#33ff33] outline-none px-2 flex-1"
                />
                <span className="text-[#33ff33]/30 text-xs">HP: {m.hp}</span>
                <button onClick={() => dispatch({ type: "REMOVE_PARTY", index: i })} className="text-[#ff4444] text-xs">[✕]</button>
              </div>
            ))}
            {state.party.length < 4 && (
              <div className="flex gap-2">
                <span className="text-[#33ff33]/50 w-20"></span>
                <input
                  value={partyInput}
                  onChange={e => setPartyInput(e.target.value.replace("@", ""))}
                  onKeyDown={e => { if (e.key === "Enter" && partyInput.trim()) { dispatch({ type: "ADD_PARTY", handle: partyInput.trim() }); setPartyInput(""); } }}
                  placeholder="add @handle..."
                  className="bg-transparent border-b border-[#33ff33]/30 text-[#33ff33] outline-none px-2 flex-1"
                />
                <button onClick={() => { if (partyInput.trim()) { dispatch({ type: "ADD_PARTY", handle: partyInput.trim() }); setPartyInput(""); } }}
                  className="border border-[#33ff33]/30 px-3 hover:bg-[#33ff33]/10 text-sm">ADD</button>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (state.scoreData) {
                const prof = getProfessionForWallet(state.scoreData);
                dispatch({ type: "SET_PROFESSION", profession: prof });
              } else {
                dispatch({ type: "SET_PHASE", phase: "profession" });
              }
            }}
            className="mt-4 px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10"
          >
            {state.scoreData ? "CONTINUE →" : "CHOOSE PROFESSION →"}
          </button>
        </div>
      </CRTWrapper>
    );
  }

  // ============ PROFESSION (manual only) ============
  if (state.phase === "profession") {
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-4 py-8">
          <h2 className="text-xl">═══ CHOOSE YOUR PROFESSION ═══</h2>
          <p className="text-sm text-[#33ff33]/70">Press 1-6 or click to choose:</p>
          {PROFESSIONS.map((p, i) => (
            <button key={p.name} onClick={() => dispatch({ type: "SET_PROFESSION", profession: p })}
              className="block w-full text-left px-4 py-3 border border-[#33ff33]/20 hover:border-[#33ff33]/60 hover:bg-[#33ff33]/5 transition-all">
              <div className="flex justify-between">
                <span><span className="text-[#33ff33]/40">{i + 1}.</span> <span className="font-bold">{p.name}</span></span>
                <span className="text-[#33ff33]/50">{p.startSol} SOL | {p.multiplier}x</span>
              </div>
              <div className="text-xs text-[#33ff33]/40 mt-1">{p.description}</div>
            </button>
          ))}
        </div>
      </CRTWrapper>
    );
  }

  // ============ STORE / PROFESSION REVEAL ============
  if (state.phase === "store") {
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-4 py-8">
          <h2 className="text-xl">═══ YOUR WAGON IS LOADED ═══</h2>
          <div className="border border-[#33ff33]/30 p-4 space-y-2">
            <div className="text-sm">Based on your wallet, you are classified as:</div>
            <div className="text-2xl text-[#00ff00] font-bold">{state.profession?.name}</div>
            <div className="text-xs text-[#33ff33]/50">{state.profession?.description}</div>
            <div className="text-sm mt-3">Starting SOL: <span className="text-[#00ff00] font-bold">{state.sol.toFixed(1)}</span> | Score multiplier: <span className="text-[#00ff00]">{state.profession?.multiplier}x</span></div>
          </div>
          <div className="text-xs text-[#33ff33]/40 mt-2">Your supplies:</div>
          <div className="grid grid-cols-3 gap-2">
            {SUPPLIES.map((s) => (
              <div key={s.name} className="border border-[#33ff33]/10 p-2 text-xs">
                <span>{s.emoji} {s.name}: <span className="text-[#00ff00]">{state.supplies[s.name] || 0}</span></span>
              </div>
            ))}
          </div>
          <button onClick={() => dispatch({ type: "SET_PHASE", phase: "sbf" })} className="mt-4 px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10">
            HIT THE TRAIL →
          </button>
        </div>
      </CRTWrapper>
    );
  }

  // ============ SBF ============
  if (state.phase === "sbf") {
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-4 py-8">
          <h2 className="text-xl">═══ INDEPENDENCE, MISSOURI ═══</h2>
          <div className="flex gap-6 items-start">
            {/* SBF pixel art jail cell */}
            <pre className="text-[10px] leading-[1.1] text-[#33ff33]/70 flex-shrink-0 border border-[#33ff33]/20 p-2">{`
 ┌─────────────────┐
 │▓▓▓▓ JAIL ▓▓▓▓▓▓│
 │┃  ┃  ┃  ┃  ┃  ┃│
 │┃  ┃  ┃  ┃  ┃  ┃│
 │┃ ╭───╮ ┃  ┃  ┃│
 │┃ │~∩~│ ┃  ┃  ┃│
 │┃ │ ◕◕│ ┃  ┃  ┃│
 │┃ │ ─ │ ┃  ┃  ┃│
 │┃ │/FTX│ ┃  ┃  ┃│
 │┃ │ ║ │ ┃  ┃  ┃│
 │┃ ╰───╯ ┃  ┃  ┃│
 │┃  ┃  ┃  ┃  ┃  ┃│
 └─────────────────┘`}</pre>
            <div className="space-y-3 flex-1">
              <p className="text-sm">You pass a jail cell. Inside: <span className="text-[#ffcc00]">Sam Bankman-Fried</span>.</p>
              <p className="text-sm text-[#33ff33]/60">&quot;Hey traveler... I can get you 20% APY on your Solana if you leave it with me. I&apos;ve got a new exchange launching from in here...&quot;</p>
              <p className="text-xs text-[#33ff33]/30">You have {state.sol.toFixed(1)} Solana.</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={() => dispatch({ type: "SBF_CHOICE", trust: true })}
              className="px-6 py-2 border border-[#ff4444]/40 text-[#ff4444] hover:bg-[#ff4444]/10">
              1. Trust SBF (give him 30% of your SOL)
            </button>
            <button onClick={() => dispatch({ type: "SBF_CHOICE", trust: false })}
              className="px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10">
              2. Keep Walking
            </button>
          </div>
          <p className="text-xs text-[#33ff33]/20">Press 1 or 2</p>
        </div>
      </CRTWrapper>
    );
  }

  // ============ OUTCOME (after any event/choice) ============
  if (state.phase === "outcome" && state.lastOutcome) {
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-4 py-8">
          <h2 className="text-xl">═══ RESULT ═══</h2>
          <StatusBar state={state} />
          <OutcomePanel outcome={state.lastOutcome} onContinue={() => dispatch({ type: "DISMISS_OUTCOME" })} />
          <p className="text-xs text-[#33ff33]/20">Press ENTER to continue</p>
        </div>
      </CRTWrapper>
    );
  }

  // ============ TRAIL ============
  if (state.phase === "trail") {
    const nextIdx = state.currentLandmark + 1;
    const nextLandmark = state.landmarks[nextIdx];
    const isEnd = nextIdx >= state.landmarks.length;

    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-4 py-8">
          <h2 className="text-xl">═══ ON THE TRAIL ═══</h2>
          <StatusBar state={state} />
          <div className="text-sm text-[#33ff33]/50">
            Landmark {Math.min(state.currentLandmark + 2, state.landmarks.length)} of {state.landmarks.length}
          </div>
          <EventLog events={state.events} />
          {isEnd ? (
            <button onClick={() => dispatch({ type: "SET_PHASE", phase: "score" })} className="px-6 py-2 border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10 animate-pulse">
              ▸ ARRIVE IN OREGON ◂
            </button>
          ) : (
            <button onClick={advance} className="px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10">
              {nextLandmark ? `Continue to ${nextLandmark.name} →` : "Continue →"}
            </button>
          )}
        </div>
      </CRTWrapper>
    );
  }

  // ============ EVENT ============
  if (state.phase === "event" && state.currentEvent) {
    const colors: Record<string, string> = {
      catastrophic: "text-[#ff4444]", bad: "text-[#ffaa00]", good: "text-[#00ff00]", neutral: "text-[#33ff33]/60",
    };
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-4 py-8">
          <h2 className="text-xl">═══ TRAIL EVENT ═══</h2>
          <StatusBar state={state} />
          <div className={`text-lg border border-[#33ff33]/20 p-4 ${colors[state.currentEvent.effect]}`}>
            {state.currentEvent.text}
          </div>
          <button onClick={() => dispatch({ type: "DISMISS_EVENT" })} className="px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10">
            See Results →
          </button>
          <p className="text-xs text-[#33ff33]/20">Press ENTER</p>
        </div>
      </CRTWrapper>
    );
  }

  // ============ LANDMARK ============
  if (state.phase === "landmark" && state.currentLandmarkData) {
    const lm = state.currentLandmarkData;
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-4 py-8">
          <h2 className="text-xl">═══ {lm.name.toUpperCase()} ═══</h2>
          <StatusBar state={state} />
          <div className="text-xs text-[#33ff33]/30">[{lm.sector}] {lm.protocol}</div>
          <p className="text-sm text-[#33ff33]/80">{lm.description}</p>
          <div className="space-y-2 mt-4">
            {lm.choices.map((c, i) => (
              <button key={i} onClick={() => dispatch({ type: "LANDMARK_CHOICE", choiceIndex: i })}
                className="block w-full text-left px-4 py-2 border border-[#33ff33]/20 hover:border-[#33ff33]/60 hover:bg-[#33ff33]/5 text-sm transition-all">
                <span className="text-[#33ff33]/40">{i + 1}.</span> {c.text}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#33ff33]/20">Press 1-{lm.choices.length} to choose</p>
        </div>
      </CRTWrapper>
    );
  }

  // ============ HUNT ============
  if (state.phase === "hunt") {
    // Move targets
    const movedTargets = state.huntTargets.map(t => {
      if (!t.alive) return t;
      let nx = t.x + t.dx;
      let ny = t.y + t.dy;
      let ndx = t.dx;
      let ndy = t.dy;
      if (nx < 2 || nx > 90) ndx = -ndx;
      if (ny < 2 || ny > 80) ndy = -ndy;
      return { ...t, x: Math.max(2, Math.min(90, nx)), y: Math.max(2, Math.min(80, ny)), dx: ndx, dy: ndy };
    });
    // Update positions via effect
    if (JSON.stringify(movedTargets) !== JSON.stringify(state.huntTargets)) {
      setTimeout(() => {
        if (state.phase === "hunt") {
          // We can't dispatch here cleanly, targets move via CSS transition instead
        }
      }, 500);
    }

    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-4 py-8">
          <h2 className="text-xl">═══ BEAR HUNT ═══</h2>
          <p className="text-xs text-[#33ff33]/50">Shoot the 🐻 bears for Solana! DON&apos;T hit your 🐂 bulls — you need those!</p>
          <div className="flex justify-between text-sm">
            <span>Earned: <span className={state.huntScore >= 0 ? "text-[#00ff00]" : "text-[#ff4444]"}>{state.huntScore} Solana</span></span>
            <span>🔫 Bullets: <span className={state.huntBullets <= 1 ? "text-[#ff4444]" : "text-[#00ff00]"}>{state.huntBullets}</span> / 5</span>
          </div>
          <div className="relative border border-[#33ff33]/20 h-64 overflow-hidden cursor-crosshair select-none"
            style={{ background: "radial-gradient(ellipse at 50% 100%, #002200 0%, #001100 100%)" }}>
            {state.huntTargets.map((t) => t.alive && (
              <button key={t.id}
                onClick={() => state.huntBullets > 0 && dispatch({ type: "HUNT_SHOOT", targetId: t.id })}
                className={`absolute text-3xl transition-all duration-700 ease-linear ${state.huntBullets > 0 ? "cursor-crosshair hover:scale-125" : "cursor-not-allowed"}`}
                style={{ left: `${t.x + Math.sin(Date.now() / (300 + t.id * 100)) * 8}%`, top: `${t.y + Math.cos(Date.now() / (400 + t.id * 150)) * 5}%` }}>
                {t.emoji}
              </button>
            ))}
            {state.huntTargets.filter(t => !t.alive).map((t) => (
              <span key={`dead-${t.id}`} className={`absolute text-xs font-bold ${t.points > 0 ? "text-[#00ff00]" : "text-[#ff4444]"}`}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}>
                {t.points > 0 ? `+${t.points}` : `${t.points}`} {t.name === "Bull" ? "YOUR BULL!" : ""}
              </span>
            ))}
            {state.huntBullets <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-[#ff4444] text-lg">OUT OF BULLETS</span>
              </div>
            )}
          </div>
          <button onClick={() => dispatch({ type: "END_HUNT" })} className="px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10">
            {state.huntBullets <= 0 ? "No bullets left — " : ""}Done Hunting →
          </button>
        </div>
      </CRTWrapper>
    );
  }

  // ============ SCORE REVEAL ============
  if (state.phase === "score") {
    const scoreData = state.scoreData;
    const score = scoreData?.score || 0;
    const tier = getTier(score);
    const breakdown = scoreData ? computeBreakdown(scoreData) : [];
    const sectors = scoreData ? computeSectorScores(scoreData) : [];
    const survivors = state.party.filter(m => m.alive).length;
    const totalParty = state.party.length;
    const finalGameScore = Math.round(state.gameScore * (state.profession?.multiplier || 1));
    const dead = state.party.filter(m => !m.alive);

    return (
      <CRTWrapper>
        <div className="space-y-4 py-8 text-center">
          <pre className="text-xs text-[#33ff33]/40">{`
═══════════════════════════════════════════
   S O L A N A   T R A I L   C O M P L E T E
═══════════════════════════════════════════`}</pre>

          {dead.length > 0 && (
            <div className="grid grid-cols-2 gap-4 my-4">
              {dead.map((m, i) => (
                <div key={i} style={{ animationDelay: `${i * 0.8}s` }} className="animate-[fadeIn_1.5s_ease-in_both]">
                  <Tombstone handle={m.handle} />
                </div>
              ))}
            </div>
          )}

          <div className="text-left border border-[#33ff33]/20 p-4 text-sm space-y-1">
            <div>Party survivors: {survivors} of {totalParty + 1}</div>
            <div>🍔 Food: {state.supplies.Food || 0} Big Macs</div>
            <div>💰 Solana remaining: {state.sol.toFixed(1)}</div>
            <div>🐂 Bulls: {state.supplies.Bulls || 0}</div>
            <div>🥩 Medicine: {state.supplies.Medicine || 0}</div>
            <div>Profession: {state.profession?.name} ({state.profession?.multiplier}x)</div>
            <div className="text-[#00ff00] font-bold mt-2">GAME SCORE: {finalGameScore.toLocaleString()} pts</div>
          </div>

          <div className="my-6 text-[#33ff33]/30 animate-pulse text-lg">BUT MORE IMPORTANTLY...</div>

          <div className="border-2 border-[#00ff00] p-6 space-y-3">
            <div className="text-5xl font-bold text-[#00ff00]">{Math.round(score)}</div>
            <div className="text-xl">{tier.icon} {tier.name}</div>
            <div className="text-xs text-[#33ff33]/50">YOUR REAL SOLANA SCORE</div>

            <div className="text-left space-y-1 text-xs mt-4 font-mono">
              {breakdown.map(b => (
                <div key={b.name} className="flex items-center">
                  <span className="w-[180px] shrink-0 text-[#33ff33]/60">{b.name} ({b.weight})</span>
                  <span className="flex-1"><PixelBar value={b.score} max={100} width={14} /></span>
                </div>
              ))}
            </div>

            {sectors.length > 0 && (
              <div className="text-left space-y-1 text-xs mt-3 border-t border-[#33ff33]/10 pt-3 font-mono">
                <div className="text-[#33ff33]/40 mb-1">SECTOR SCORES</div>
                {sectors.map(s => (
                  <div key={s.name} className="flex items-center">
                    <span className="w-[180px] shrink-0 text-[#33ff33]/60">{s.name}</span>
                    <span className="flex-1"><PixelBar value={s.score} max={100} width={14} /></span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 text-xs">
              {!scoreData?.is_sybil ? (
                <span className="text-[#00ff00]">✓ SYBIL STATUS: VERIFIED HUMAN</span>
              ) : (
                <span className="text-[#ff4444]">⚠ SYBIL FLAG DETECTED</span>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `I survived the Solana Trail! 🤠\n\nScore: ${Math.round(score)}/100 (${tier.name})\nGame Score: ${finalGameScore.toLocaleString()} pts\n${dead.length > 0 ? `☠️ RIP: ${dead.map(d => `@${d.handle}`).join(", ")}\n` : ""}Check yours:`
              )}`} target="_blank" rel="noopener noreferrer"
              className="px-6 py-2 border border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2]/10">
              SHARE ON 𝕏
            </a>
            <button onClick={() => window.location.reload()}
              className="px-6 py-2 border border-[#33ff33]/30 hover:bg-[#33ff33]/10 text-[#33ff33]/50">
              PLAY AGAIN
            </button>
          </div>
        </div>
      </CRTWrapper>
    );
  }

  return null;
}
