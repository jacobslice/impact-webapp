"use client";

import { useState, useEffect, useReducer, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import type { ScoreData } from "@/lib/types";
import { getTier, computeBreakdown, computeSectorScores } from "@/lib/types";
import {
  PROFESSIONS, RANDOM_EVENTS, HUNT_TARGETS, KOLS, BIOS_LINES, SBF_DIALOGUE,
  TRUMP_MISS_QUOTES,
  getLandmarksForWallet, getProfessionForWallet, getRandomKOLs,
} from "@/lib/trail-data";
import type { Profession, Landmark, RandomEvent, KOL } from "@/lib/trail-data";
import {
  sfxType, sfxClick, sfxGunshot, sfxDeath, sfxGood, sfxBad,
  sfxScoreReveal, sfxWagon, sfxBoot, sfxGlitch, sfxMiss, playTheme,
} from "@/lib/trail-audio";
import { useTwitterProfile } from "@/components/social/TwitterConnect";

// ============================================================
// TYPING EFFECT HOOK
// ============================================================
function useTypewriter(text: string, speed = 30, enabled = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  const skip = useCallback(() => { setDisplayed(text); setDone(true); }, [text]);
  return { displayed, done, skip };
}

// ============================================================
// PIXELATE PFP COMPONENT
// ============================================================
function PixelPFP({ handle, size = 48 }: { handle: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://unavatar.io/twitter/${handle}`;
    img.onload = () => {
      // Draw small then scale up for pixel effect
      const pxSize = 12;
      canvas.width = size;
      canvas.height = size;
      ctx.imageSmoothingEnabled = false;
      // Draw tiny
      ctx.drawImage(img, 0, 0, pxSize, pxSize);
      // Scale up
      ctx.drawImage(canvas, 0, 0, pxSize, pxSize, 0, 0, size, size);
      setLoaded(true);
    };
    img.onerror = () => {
      // Fallback: draw a colored square with first letter
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = "#33ff33";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#001a00";
      ctx.font = `bold ${size * 0.6}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(handle[0]?.toUpperCase() || "?", size / 2, size / 2);
      setLoaded(true);
    };
  }, [handle, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="border border-[#33ff33]/30"
      style={{ imageRendering: "pixelated", width: size, height: size }}
    />
  );
}

// Audio is now imported from @/lib/trail-audio

// ============================================================
// GAME STATE
// ============================================================
interface PartyMember {
  handle: string;
  hp: number;
  alive: boolean;
  isKOL: boolean;
  uniqueDeaths: string[];
}

interface StatChange {
  label: string;
  before: string | number;
  after: string | number;
  delta: string;
  type: "good" | "bad" | "neutral";
}

// The trail is a fixed sequence of steps: event1 → landmark → event2 → hunt → score
// This prevents looping.
type TrailStep = "event1" | "landmark" | "event2" | "hunt";
const TRAIL_SEQUENCE: TrailStep[] = ["event1", "landmark", "event2", "hunt"];

interface GameState {
  phase: "boot" | "title" | "connect" | "loading" | "profession" | "party" | "sbf" | "travel" | "event" | "landmark" | "hunt" | "hunt_miss" | "score_tombstones" | "score_tally" | "score_glitch" | "score_reveal";
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
  huntTargets: { sprite: string; name: string; points: number; x: number; y: number; alive: boolean; id: number; popTime: number; visible: boolean }[];
  huntScore: number;
  huntBullets: number;
  lastOutcome: string | null;
  lastChanges: StatChange[];
  travelText: string | null;
  sbfLine: number;
  bootLine: number;
  noDuneData: boolean;
  trailStep: number; // index into TRAIL_SEQUENCE
}

type Action =
  | { type: "SET_PHASE"; phase: GameState["phase"] }
  | { type: "SET_SCORE_DATA"; data: ScoreData }
  | { type: "NO_DUNE_DATA" }
  | { type: "SET_PLAYER"; handle: string; avatar?: string | null }
  | { type: "SET_PARTY"; party: PartyMember[] }
  | { type: "SET_PROFESSION"; profession: Profession }
  | { type: "SBF_TRUST" }
  | { type: "SBF_WALK" }
  | { type: "SBF_NEXT_LINE" }
  | { type: "NEXT_STEP" }
  | { type: "SET_TRAVEL_TEXT"; text: string }
  | { type: "LANDMARK_CHOICE"; choiceIndex: number }
  | { type: "START_HUNT" }
  | { type: "HUNT_SHOOT"; targetId: number }
  | { type: "HUNT_MISS" }
  | { type: "HUNT_MISS_DONE" }
  | { type: "END_HUNT" }
  | { type: "SKIP_TO_SCORE" }
  | { type: "BOOT_NEXT" }
  | { type: "SCORE_NEXT_PHASE" };

const initialState: GameState = {
  phase: "boot",
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
  lastChanges: [],
  travelText: null,
  sbfLine: 0,
  bootLine: 0,
  noDuneData: false,
  trailStep: 0,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_SCORE_DATA": {
      const protocols = Array.isArray(action.data.protocols_used)
        ? action.data.protocols_used
        : typeof action.data.protocols_used === "string"
          ? action.data.protocols_used.split(",").map((p: string) => p.trim())
          : [];
      return { ...state, scoreData: action.data, landmarks: getLandmarksForWallet(protocols), noDuneData: false };
    }
    case "NO_DUNE_DATA":
      return { ...state, noDuneData: true, landmarks: getLandmarksForWallet([]) };
    case "SET_PLAYER":
      return { ...state, player: action.handle, playerAvatar: action.avatar || null };
    case "SET_PARTY":
      return { ...state, party: action.party };
    case "SET_PROFESSION": {
      const prof = action.profession;
      return {
        ...state, profession: prof, sol: prof.startSol,
        supplies: { ...prof.supplies },
        phase: "party",
      };
    }
    case "SBF_NEXT_LINE":
      return { ...state, sbfLine: state.sbfLine + 1 };
    case "SBF_TRUST": {
      const beforeSol = state.sol;
      const lost = Math.round(beforeSol * 0.3 * 10) / 10;
      const afterSol = Math.max(0, beforeSol - lost);
      return {
        ...state,
        sol: afterSol,
        lastOutcome: `SBF promised 20% APY. He got shanked in the lunch line and your ${lost} SOL fell into the prison toilet. Gone forever.`,
        lastChanges: [{ label: "SOL", before: beforeSol.toFixed(1), after: afterSol.toFixed(1), delta: `-${lost}`, type: "bad" }],
        events: [...state.events, `Trusted SBF. Lost ${lost} SOL.`],
        phase: "event",
        // After this event, Continue → NEXT_STEP will handle the trail
      };
    }
    case "SBF_WALK":
      return {
        ...state,
        lastOutcome: "You walked past SBF's cell. He's still calling out: \"Come back! I have a new exchange launching!\"",
        lastChanges: [],
        events: [...state.events, "Walked past SBF. Smart."],
        phase: "event",
      };
    case "NEXT_STEP": {
      // Fixed trail sequence: event1 → landmark → event2 → hunt → score
      const step = TRAIL_SEQUENCE[state.trailStep];
      const nextStepIdx = state.trailStep + 1;
      const newSupplies = { ...state.supplies };
      const changes: StatChange[] = [];
      const newParty = [...state.party];
      let newHealth = state.health;

      // Player death check
      if (newHealth <= 0) {
        return { ...state, phase: "score_tombstones", events: [...state.events, "You collapsed on the trail. Your party carried on without you... briefly."] };
      }

      // Loss conditions
      if ((newSupplies.Food || 0) <= 0 && newHealth <= 20) {
        return { ...state, phase: "score_tombstones", events: [...state.events, "Ran out of Big Macs. Party turned on each other."] };
      }

      // Route to travel animation for landmark/hunt steps
      if (!step || step === "hunt") {
        return { ...state, supplies: newSupplies, trailStep: nextStepIdx, lastChanges: [], phase: "travel" };
      }
      if (step === "landmark") {
        const lm = state.landmarks[0];
        if (lm) {
          return { ...state, supplies: newSupplies, trailStep: nextStepIdx, currentLandmark: 0, currentLandmarkData: lm, lastChanges: [], phase: "travel" };
        }
        return { ...state, supplies: newSupplies, trailStep: nextStepIdx + 1, lastChanges: [], phase: "travel" };
      }

      // ===== RANDOM EVENT (event1 or event2) =====
      const isFirstEvent = state.trailStep === 0;
      const pool = isFirstEvent
        ? RANDOM_EVENTS.filter(e => e.effect === "catastrophic")
        : RANDOM_EVENTS;
      const evt = pool[Math.floor(Math.random() * pool.length)];
      let newSol = state.sol;
      let text = evt.text;

      // --- CATASTROPHIC: one member dies, party takes heavy damage ---
      if (evt.effect === "catastrophic") {
        if (text.includes("PARTY_MEMBER") && newParty.length > 0) {
          const alive = newParty.filter(m => m.alive);
          if (alive.length > 0) {
            const victim = alive[Math.floor(Math.random() * alive.length)];
            if (victim.isKOL && victim.uniqueDeaths.length > 0 && Math.random() < 0.9) {
              text = victim.uniqueDeaths[Math.floor(Math.random() * victim.uniqueDeaths.length)];
            } else {
              text = text.replace("PARTY_MEMBER", `@${victim.handle}`);
            }
            victim.hp = 0; victim.alive = false;
            changes.push({ label: `@${victim.handle}`, before: "alive", after: "DEAD ☠️", delta: "KILLED", type: "bad" });
          }
        }
        // Party-wide impact
        newHealth = Math.max(0, newHealth - 20);
        for (const m of newParty) { if (m.alive) m.hp = Math.max(1, m.hp - 15); }
        newSol = Math.max(0, newSol - 3);
        newSupplies.Food = Math.max(0, (newSupplies.Food || 0) - 2);
        changes.push({ label: "Party HP", before: "", after: "", delta: "-20", type: "bad" });
        changes.push({ label: "SOL", before: "", after: state.sol > newSol ? newSol.toFixed(1) : "", delta: "-3", type: "bad" });
        changes.push({ label: "Food", before: "", after: "", delta: "-2 (spoiled)", type: "bad" });
      }

      // --- BAD: targeted + party-wide minor damage ---
      if (evt.effect === "bad") {
        if (text.includes("PARTY_MEMBER") && newParty.length > 0) {
          const alive = newParty.filter(m => m.alive);
          if (alive.length > 0) {
            const victim = alive[Math.floor(Math.random() * alive.length)];
            text = text.replace("PARTY_MEMBER", `@${victim.handle}`);
            victim.hp -= 30;
            if (victim.hp <= 0) {
              victim.alive = false; victim.hp = 0;
              changes.push({ label: `@${victim.handle}`, before: "alive", after: "DEAD ☠️", delta: "KILLED", type: "bad" });
            } else {
              changes.push({ label: `@${victim.handle}`, before: "", after: "", delta: "-30 HP", type: "bad" });
            }
          }
        }
        newHealth = Math.max(0, newHealth - 10);
        for (const m of newParty) { if (m.alive) m.hp = Math.max(1, m.hp - 5); }
        newSol = Math.max(0, newSol - 1);
        changes.push({ label: "Party HP", before: "", after: "", delta: "-10", type: "bad" });
        if (state.sol > newSol) changes.push({ label: "SOL", before: "", after: "", delta: "-1", type: "bad" });
      }

      // --- GOOD: heal party + auto-use medicine ---
      if (evt.effect === "good") {
        let healAmount = 10;
        if ((newSupplies.Medicine || 0) > 0) {
          newSupplies.Medicine = (newSupplies.Medicine || 0) - 1;
          healAmount = 25;
          text += " Used 1 medicine for extra healing.";
          changes.push({ label: "Medicine", before: "", after: "", delta: "-1 (used)", type: "neutral" });
        }
        newHealth = Math.min(100, newHealth + healAmount);
        for (const m of newParty) { if (m.alive) m.hp = Math.min(100, m.hp + 15); }
        newSol += 5;
        changes.push({ label: "Party HP", before: "", after: "", delta: `+${healAmount}`, type: "good" });
        changes.push({ label: "SOL", before: "", after: "", delta: "+5", type: "good" });
      }

      // --- NEUTRAL: time passes, party fatigued ---
      if (evt.effect === "neutral") {
        newSupplies.Food = Math.max(0, (newSupplies.Food || 0) - 1);
        newHealth = Math.max(0, newHealth - 5);
        for (const m of newParty) { if (m.alive) m.hp = Math.max(1, m.hp - 5); }
        changes.push({ label: "Party HP", before: "", after: "", delta: "-5 (fatigue)", type: "bad" });
        changes.push({ label: "Food", before: "", after: "", delta: "-1 (time passed)", type: "bad" });
      }

      // Player death from this event
      if (newHealth <= 0) {
        changes.push({ label: "YOU", before: "", after: "DEAD", delta: "☠️", type: "bad" });
        text += " You didn't make it.";
      }

      return {
        ...state, currentEvent: { ...evt, text }, party: newParty,
        health: newHealth, sol: newSol, supplies: newSupplies, trailStep: nextStepIdx,
        events: [...state.events, text], lastOutcome: text, lastChanges: changes, phase: "event",
      };
    }
    case "SET_TRAVEL_TEXT":
      return { ...state, travelText: action.text };
    case "LANDMARK_CHOICE": {
      const choice = state.currentLandmarkData?.choices[action.choiceIndex];
      if (!choice) return state;
      const changes: StatChange[] = [];
      let newHealth = state.health;
      let newSol = state.sol;
      const newPartyLm = [...state.party];
      let newScore = state.gameScore + 100;
      if (choice.effect === "good") {
        newHealth = Math.min(100, newHealth + 10);
        for (const m of newPartyLm) { if (m.alive) m.hp = Math.min(100, m.hp + 10); }
        newSol += 5;
        newScore += 50;
        changes.push({ label: "Party HP", before: "", after: "", delta: "+10", type: "good" });
        changes.push({ label: "SOL", before: "", after: "", delta: "+5", type: "good" });
      }
      if (choice.effect === "bad") {
        newHealth = Math.max(0, newHealth - 15);
        for (const m of newPartyLm) { if (m.alive) m.hp = Math.max(1, m.hp - 10); }
        newSol = Math.max(0, newSol - 5);
        changes.push({ label: "Party HP", before: "", after: "", delta: "-15", type: "bad" });
        changes.push({ label: "SOL", before: "", after: "", delta: "-5", type: "bad" });
      }
      changes.push({ label: "Score", before: "", after: "", delta: `+${newScore - state.gameScore}`, type: "good" });

      return {
        ...state, health: newHealth, sol: newSol, gameScore: newScore,
        party: newPartyLm,
        events: [...state.events, `${state.currentLandmarkData!.name}: ${choice.outcome}`],
        lastOutcome: choice.outcome, lastChanges: changes, phase: "event",
      };
    }
    case "START_HUNT": {
      // More targets, faster pop times, shorter windows = harder
      const targets = Array.from({ length: 8 }, (_, i) => {
        const t = HUNT_TARGETS[Math.floor(Math.random() * HUNT_TARGETS.length)];
        return {
          sprite: t.sprite, name: t.name, points: t.points,
          x: -50, y: 60 + Math.random() * 30,
          alive: true, id: i,
          popTime: 500 + i * 1100 + Math.random() * 600, // staggered, faster
          visible: false,
        };
      });
      return { ...state, huntTargets: targets, huntScore: 0, huntBullets: 5, phase: "hunt" };
    }
    case "HUNT_SHOOT": {
      if (state.huntBullets <= 0) return state;
      const targets = state.huntTargets.map(t => t.id === action.targetId ? { ...t, alive: false, visible: false } : t);
      const hit = state.huntTargets.find(t => t.id === action.targetId);
      const points = hit?.points ?? 0;
      const newSupplies = { ...state.supplies };
      if (hit?.name === "Bull") newSupplies.Bulls = Math.max(0, (newSupplies.Bulls || 0) - 1);
      return { ...state, huntTargets: targets, huntScore: state.huntScore + points, huntBullets: state.huntBullets - 1, supplies: newSupplies };
    }
    case "HUNT_MISS":
      if (state.huntBullets <= 0) return state;
      return { ...state, huntBullets: state.huntBullets - 1, phase: "hunt_miss" };
    case "HUNT_MISS_DONE":
      return { ...state, phase: "hunt" };
    case "END_HUNT": {
      const solGain = state.huntScore;
      return {
        ...state, sol: Math.max(0, state.sol + solGain),
        gameScore: state.gameScore + Math.max(0, state.huntScore),
        events: [...state.events, `Hunt: ${solGain >= 0 ? "+" : ""}${solGain} SOL`],
        phase: "score_tombstones",
      };
    }
    case "SKIP_TO_SCORE":
      return { ...state, phase: "score_tombstones" };
    case "BOOT_NEXT":
      return { ...state, bootLine: state.bootLine + 1 };
    case "SCORE_NEXT_PHASE": {
      const order: GameState["phase"][] = ["score_tombstones", "score_tally", "score_glitch", "score_reveal"];
      const idx = order.indexOf(state.phase);
      if (idx < order.length - 1) return { ...state, phase: order[idx + 1] };
      return state;
    }
    default:
      return state;
  }
}

// ============================================================
// CRT WRAPPER
// ============================================================
function CRTWrapper({ children, onSkip, showSkip = true }: { children: React.ReactNode; onSkip?: () => void; showSkip?: boolean }) {
  return (
    <div className="min-h-screen bg-[#001a00] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
      }} />
      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-40" style={{
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,10,0,0.8) 100%)",
      }} />
      {/* Flicker */}
      <div className="fixed inset-0 pointer-events-none z-30 animate-[flicker_0.15s_infinite_alternate]" style={{ opacity: 0.02, background: "#33ff33" }} />
      <style>{`
        @keyframes flicker { 0% { opacity: 0.02; } 100% { opacity: 0.04; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wagonRoll { from { transform: translateX(-100px); } to { transform: translateX(calc(100vw + 100px)); } }
        @keyframes popUp { 0% { transform: translateY(100%); } 20% { transform: translateY(0); } 80% { transform: translateY(0); } 100% { transform: translateY(100%); } }
        @keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-3px, 3px); } 40% { transform: translate(3px, -3px); } 60% { transform: translate(-2px, -2px); } 80% { transform: translate(2px, 2px); } 100% { transform: translate(0); } }
        @keyframes countUp { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        .pixelated { image-rendering: pixelated; }
        .crt-curve { border-radius: 20px; box-shadow: inset 0 0 60px rgba(0,255,0,0.05), 0 0 30px rgba(0,255,0,0.1); }
      `}</style>
      {showSkip && onSkip && (
        <button onClick={onSkip} className="fixed top-4 right-4 z-[60] text-[#33ff33]/40 hover:text-[#33ff33]/80 text-xs font-mono border border-[#33ff33]/20 px-3 py-1 rounded hover:border-[#33ff33]/50 transition-all">
          SKIP →
        </button>
      )}
      <div className="w-full max-w-3xl font-mono crt-curve p-6" style={{ color: "#33ff33", textShadow: "0 0 8px #33ff3366, 0 0 2px #33ff33" }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// REUSABLE COMPONENTS
// ============================================================
function TypedText({ text, speed = 25, onDone, className = "" }: { text: string; speed?: number; onDone?: () => void; className?: string }) {
  const { displayed, done, skip } = useTypewriter(text, speed);
  useEffect(() => { if (done && onDone) onDone(); }, [done, onDone]);
  return <div className={className} onClick={skip}>{displayed}<span className={done ? "hidden" : "animate-pulse"}>█</span></div>;
}

function GreenButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-6 py-2 border border-[#33ff33] hover:bg-[#33ff33]/10 transition-colors font-mono ${className}`}
    >
      {children}
    </motion.button>
  );
}

function StatusBar({ state }: { state: GameState }) {
  const bars = (val: number, max: number, w = 10) => "█".repeat(Math.round((val / max) * w)) + "░".repeat(w - Math.round((val / max) * w));
  return (
    <div className="border border-[#33ff33]/20 p-3 text-xs space-y-1 mb-4">
      {state.profession && (
        <div className="text-[#33ff33]/40 mb-1">{state.profession.name} | SOL: {state.sol.toFixed(1)} | Score: {state.gameScore}</div>
      )}
      <div className="flex justify-between flex-wrap gap-2">
        <span>You: {bars(state.health, 100)} {state.health} HP</span>
      </div>
      <div className="flex gap-4 flex-wrap">
        <span>🐂 {state.supplies.Bulls || 0}</span>
        <span>🍔 {state.supplies.Food || 0}</span>
        <span>💊 {state.supplies.Medicine || 0}</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {state.party.map((m, i) => (
          <span key={i} className={m.alive ? "" : "line-through text-[#ff4444]/60"}>
            @{m.handle}: {m.alive ? `${m.hp}HP` : "☠️"}
          </span>
        ))}
      </div>
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
  const [addressInput, setAddressInput] = useState("");
  const [playerInput, setPlayerInput] = useState("");
  const [huntTimer, setHuntTimer] = useState(10);
  const huntStartRef = useRef<number>(0);
  const huntPausedAtRef = useRef<number>(0);
  const huntPausedTotalRef = useRef<number>(0);

  // Keyboard: ESC to skip, ENTER to continue
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "SKIP_TO_SCORE" });
      if (e.key === "Enter") {
        if (state.phase === "event") dispatch({ type: "NEXT_STEP" });
        if (state.phase === "boot") dispatch({ type: "SET_PHASE", phase: "title" });
      }
      if (state.phase === "landmark" && state.currentLandmarkData) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= state.currentLandmarkData.choices.length) {
          dispatch({ type: "LANDMARK_CHOICE", choiceIndex: num - 1 });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, state.currentLandmarkData]);

  // Fetch score on wallet connect
  useEffect(() => {
    if (!connected || !publicKey || state.scoreData || state.noDuneData) return;
    const addr = publicKey.toBase58();
    (async () => {
      try {
        const res = await fetch(`/api/score?address=${addr}`);
        const data = await res.json();
        if (res.ok && data.data) dispatch({ type: "SET_SCORE_DATA", data: data.data });
        else dispatch({ type: "NO_DUNE_DATA" });
      } catch { dispatch({ type: "NO_DUNE_DATA" }); }
    })();
  }, [connected, publicKey, state.scoreData, state.noDuneData]);

  // BIOS boot auto-advance
  useEffect(() => {
    if (state.phase !== "boot") return;
    if (state.bootLine === 0) sfxBoot();
    if (state.bootLine >= BIOS_LINES.length) {
      const timeout = setTimeout(() => dispatch({ type: "SET_PHASE", phase: "title" }), 800);
      return () => clearTimeout(timeout);
    }
    const delay = BIOS_LINES[state.bootLine] === "" ? 200 : 150 + Math.random() * 100;
    const timeout = setTimeout(() => {
      sfxType();
      dispatch({ type: "BOOT_NEXT" });
    }, delay);
    return () => clearTimeout(timeout);
  }, [state.phase, state.bootLine]);

  // Travel phase: wagon animation, then proceed
  useEffect(() => {
    if (state.phase !== "travel") return;
    sfxWagon();
    const timeout = setTimeout(() => {
      // After travel animation, check what the current trail step requires
      const currentStep = TRAIL_SEQUENCE[state.trailStep - 1]; // -1 because NEXT_STEP already incremented
      if (currentStep === "landmark" && state.currentLandmarkData) {
        dispatch({ type: "SET_PHASE", phase: "landmark" });
      } else if (currentStep === "hunt" || state.trailStep > TRAIL_SEQUENCE.length) {
        dispatch({ type: "START_HUNT" });
      } else {
        // Shouldn't hit this, but fallback to hunt
        dispatch({ type: "START_HUNT" });
      }
    }, 3500);
    return () => clearTimeout(timeout);
  }, [state.phase]);

  // Hunt animation tick — forces re-render for smooth target movement
  const [, setHuntTick] = useState(0);
  useEffect(() => {
    if (state.phase !== "hunt") return;
    const raf = setInterval(() => setHuntTick(t => t + 1), 100);
    return () => clearInterval(raf);
  }, [state.phase]);

  // Hunt timer — pauses during hunt_miss (Trump popup)
  useEffect(() => {
    if (state.phase === "hunt" && huntStartRef.current === 0) {
      huntStartRef.current = Date.now();
      huntPausedTotalRef.current = 0;
      setHuntTimer(10);
    }
    // Pause when entering hunt_miss
    if (state.phase === "hunt_miss" && huntPausedAtRef.current === 0) {
      huntPausedAtRef.current = Date.now();
    }
    // Resume when returning to hunt from hunt_miss
    if (state.phase === "hunt" && huntPausedAtRef.current > 0) {
      huntPausedTotalRef.current += Date.now() - huntPausedAtRef.current;
      huntPausedAtRef.current = 0;
    }
    if (state.phase !== "hunt" && state.phase !== "hunt_miss") {
      huntStartRef.current = 0;
      huntPausedAtRef.current = 0;
      huntPausedTotalRef.current = 0;
      return;
    }
    if (state.phase !== "hunt") return; // don't tick during hunt_miss
    const interval = setInterval(() => {
      const activeTime = Date.now() - huntStartRef.current - huntPausedTotalRef.current;
      const elapsed = Math.floor(activeTime / 1000);
      const remaining = Math.max(0, 10 - elapsed);
      setHuntTimer(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        dispatch({ type: "END_HUNT" });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [state.phase]);

  // Score phase auto-advance
  useEffect(() => {
    if (state.phase === "score_tombstones") {
      sfxDeath();
      const deadCount = state.party.filter(m => !m.alive).length;
      const delay = Math.max(3000, deadCount * 1500 + 1500); // scale with deaths
      const timeout = setTimeout(() => dispatch({ type: "SCORE_NEXT_PHASE" }), delay);
      return () => clearTimeout(timeout);
    }
    if (state.phase === "score_tally") {
      const timeout = setTimeout(() => dispatch({ type: "SCORE_NEXT_PHASE" }), 2500);
      return () => clearTimeout(timeout);
    }
    if (state.phase === "score_glitch") {
      sfxGlitch();
      const timeout = setTimeout(() => {
        sfxScoreReveal();
        dispatch({ type: "SCORE_NEXT_PHASE" });
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [state.phase]);

  const skip = () => dispatch({ type: "SKIP_TO_SCORE" });

  // Auto-assign KOLs when entering party phase
  useEffect(() => {
    if (state.phase === "party" && state.party.length === 0) {
      const kols = getRandomKOLs(3);
      const members: PartyMember[] = kols.map(k => ({
        handle: k.handle,
        hp: 50 + Math.floor(Math.random() * 50),
        alive: true,
        isKOL: true,
        uniqueDeaths: k.uniqueDeaths,
      }));
      dispatch({ type: "SET_PARTY", party: members });
    }
  }, [state.phase, state.party.length]);

  // SBF dialogue advance guard — prevents double-fire from re-renders
  const sbfAdvancedRef = useRef<number>(-1);
  const handleSbfLineDone = useCallback((lineIndex: number) => {
    if (lineIndex >= SBF_DIALOGUE.length - 1) return;
    if (sbfAdvancedRef.current >= lineIndex) return;
    sbfAdvancedRef.current = lineIndex;
    setTimeout(() => dispatch({ type: "SBF_NEXT_LINE" }), 800);
  }, []);

  // Play miss sound when entering hunt_miss phase
  const missQuoteRef = useRef("");
  useEffect(() => {
    if (state.phase === "hunt_miss") {
      sfxMiss();
      missQuoteRef.current = TRUMP_MISS_QUOTES[Math.floor(Math.random() * TRUMP_MISS_QUOTES.length)];
    }
  }, [state.phase]);

  // ================ BOOT ================
  if (state.phase === "boot") {
    return (
      <CRTWrapper showSkip={false}>
        <div className="py-12 space-y-0 text-sm">
          {BIOS_LINES.slice(0, state.bootLine).map((line, i) => (
            <div key={i} className={line === "" ? "h-3" : ""}>{line}</div>
          ))}
          <span className="animate-pulse">█</span>
        </div>
      </CRTWrapper>
    );
  }

  // ================ TITLE ================
  if (state.phase === "title") {
    return (
      <CRTWrapper showSkip={false}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 py-8"
        >
          <pre className="text-[#33ff33] text-[10px] sm:text-xs leading-tight whitespace-pre select-none">{`
   ____        __                    ______          _ __
  / __/____   / /___ _ ____  ___ _ /_  __/______ _ (_) /
 _\\ \\ / _ \\ / / __ \`// __ \\/ __ \`/  / /  / __/ __ \`// / /
/___/ \\___//_/\\_,_//_/ /_/\\_,_/  /_/  /_/  \\_,_//_/_/
          `}</pre>

          {/* Animated wagon rolling across */}
          <div className="relative h-16 overflow-hidden">
            <div className="absolute" style={{ animation: "wagonRoll 6s linear infinite" }}>
              <img src="/images/trail/wagon.png" alt="wagon" className="w-20 h-12 pixelated" style={{ imageRendering: "pixelated" }} />
            </div>
          </div>

          <p className="text-lg tracking-wider">THE BLOCKCHAIN TRAIL</p>
          <p className="text-sm text-[#33ff33]/50">Your protocols. Your journey. Your score.</p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => {
              sfxClick();
              dispatch({ type: "SET_PHASE", phase: "connect" });
            }}
            className="mt-6 px-8 py-3 border-2 border-[#33ff33] text-[#33ff33] hover:bg-[#33ff33]/10 transition-all text-lg animate-pulse"
          >
            ▸ PRESS START ◂
          </motion.button>

          <div className="flex items-center justify-center gap-2 mt-6 opacity-60">
            <span className="text-[10px]">Powered by</span>
            <img src="/images/slice-analytics-full.png" alt="Slice Analytics" className="h-5 pixelated" style={{ imageRendering: "pixelated", filter: "brightness(0) invert(1)" }} />
          </div>

          <p className="text-[#33ff33]/20 text-[10px] mt-2">ESC to skip | ENTER to continue | 1-3 to choose</p>
        </motion.div>
      </CRTWrapper>
    );
  }

  // ================ CONNECT ================
  if (state.phase === "connect") {
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-6 py-8">
          <h2 className="text-xl tracking-wider">═══ CONNECT YOUR WAGON ═══</h2>
          <TypedText text="Connect your Solana wallet to begin the trail. Your score is hidden until you reach Oregon." speed={20} className="text-sm text-[#33ff33]/70" />

          {connected && state.scoreData ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-[#33ff33]">✓ Wallet connected. {state.landmarks.length} landmark{state.landmarks.length !== 1 ? "s" : ""} loaded.</p>
              <GreenButton onClick={() => {
                sfxClick();
                const prof = getProfessionForWallet(state.scoreData);
                dispatch({ type: "SET_PROFESSION", profession: prof });
              }}>CONTINUE →</GreenButton>
            </motion.div>
          ) : connected && state.noDuneData ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="border border-[#ff4444]/30 p-4 text-sm">
                <p className="text-[#ff4444]">⚠ WALLET NOT FOUND IN DATABASE</p>
                <p className="text-[#33ff33]/50 mt-2">You may not have the supplies to make this journey.</p>
              </div>
              <div className="flex gap-3">
                <GreenButton onClick={() => {
                  sfxClick();
                  dispatch({ type: "SET_PROFESSION", profession: PROFESSIONS[6] }); // Crypto Poor
                }}>TRY ANYWAY</GreenButton>
                <GreenButton onClick={() => {
                  dispatch({ type: "SET_PHASE", phase: "connect" });
                  window.location.reload();
                }} className="border-[#33ff33]/30 text-[#33ff33]/50">CHECK ANOTHER WALLET</GreenButton>
              </div>
            </motion.div>
          ) : connected ? (
            <div className="space-y-2">
              <p className="animate-pulse">SCANNING BLOCKCHAIN...</p>
              <div className="border border-[#33ff33]/20 p-2">
                <div className="bg-[#33ff33]/20 h-2 animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <GreenButton onClick={() => { sfxClick(); setVisible(true); }}>
                CONNECT WALLET
              </GreenButton>
            </div>
          )}
        </div>
      </CRTWrapper>
    );
  }

  // ================ PROFESSION REVEAL ================
  if (state.phase === "profession") {
    const prof = state.profession!;
    const isCryptoPoor = prof.name === "Crypto Poor";
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-6 py-8">
          <h2 className="text-xl tracking-wider">═══ PROFESSION ASSIGNED ═══</h2>
          <TypedText
            text={`Based on your on-chain activity, you are a...`}
            speed={30}
            className="text-sm text-[#33ff33]/70"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}
            className="text-center py-4"
          >
            <div className={`text-3xl font-bold tracking-widest ${isCryptoPoor ? "text-[#ff4444]" : "text-[#33ff33]"}`}>
              {prof.name.toUpperCase()}
            </div>
            <p className="text-sm text-[#33ff33]/50 mt-2 italic">{prof.description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="border border-[#33ff33]/20 p-4 space-y-2 text-sm"
          >
            <div className="text-[#33ff33]/40 text-xs">═══ STARTING SUPPLIES ═══</div>
            <div className="grid grid-cols-2 gap-2">
              <span>💰 Solana: {prof.startSol}</span>
              <span>{isCryptoPoor ? "🛒" : "🐂"} {isCryptoPoor ? "Shopping Cart" : "Bulls"}: {prof.supplies.Bulls}</span>
              <span>🍔 Big Macs: {prof.supplies.Food}</span>
              <span>💊 Medicine: {prof.supplies.Medicine || "thoughts & prayers"}</span>
            </div>
            {isCryptoPoor && (
              <p className="text-[#ff4444]/60 text-xs mt-2 italic">
                You don&apos;t even have a wagon. You&apos;re pushing a shopping cart down the blockchain.
              </p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
            <GreenButton onClick={() => {
              sfxClick();
              dispatch({ type: "SET_PHASE", phase: "party" });
            }}>CONTINUE →</GreenButton>
          </motion.div>
        </div>
      </CRTWrapper>
    );
  }

  if (state.phase === "party") {
    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-6 py-8">
          <h2 className="text-xl tracking-wider">═══ YOUR PARTY ═══</h2>

          {/* Player identity */}
          <div className="border border-[#33ff33]/20 p-4 space-y-3">
            <div className="text-xs text-[#33ff33]/40">WAGON LEADER</div>
            {profile ? (
              <div className="flex items-center gap-3">
                <PixelPFP handle={profile.handle} size={48} />
                <span className="text-lg">@{profile.handle}</span>
                <span className="text-[#33ff33]/30 text-xs">✓ X connected</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input
                    value={playerInput}
                    onChange={e => setPlayerInput(e.target.value.replace("@", ""))}
                    placeholder="enter your name or @handle"
                    className="bg-transparent border-b border-[#33ff33]/30 text-[#33ff33] outline-none px-2 flex-1 font-mono"
                    onKeyDown={e => {
                      if (e.key === "Enter" && playerInput.trim()) {
                        dispatch({ type: "SET_PLAYER", handle: playerInput.trim() });
                      }
                    }}
                  />
                  {playerInput.trim() && (
                    <GreenButton onClick={() => dispatch({ type: "SET_PLAYER", handle: playerInput.trim() })}>SET</GreenButton>
                  )}
                </div>
                <button
                  onClick={() => { window.location.href = "/api/auth/twitter"; }}
                  className="flex items-center gap-2 px-4 py-1.5 border border-[#1DA1F2]/40 text-[#1DA1F2]/80 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/60 text-xs font-mono transition-all"
                >
                  𝕏 CONNECT YOUR X ACCOUNT
                </button>
              </div>
            )}
            {state.player && !profile && <p className="text-sm">Leader: @{state.player}</p>}
          </div>

          {/* KOL party members */}
          <div className="border border-[#33ff33]/20 p-4 space-y-3">
            <div className="text-xs text-[#33ff33]/40">PARTY MEMBERS (RANDOMLY ASSIGNED)</div>
            {state.party.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <PixelPFP handle={m.handle} size={36} />
                <span className="text-sm">@{m.handle}</span>
                <span className="text-[#33ff33]/30 text-xs">{m.hp} HP</span>
              </div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <GreenButton onClick={() => {
              sfxClick();
              if (!state.player && !profile) {
                dispatch({ type: "SET_PLAYER", handle: "Anon" });
              }
              if (profile && !state.player) {
                dispatch({ type: "SET_PLAYER", handle: profile.handle, avatar: profile.avatarUrl });
              }
              dispatch({ type: "SET_PHASE", phase: "sbf" });
            }}>EMBARK ON THE TRAIL →</GreenButton>
          </motion.div>
        </div>
      </CRTWrapper>
    );
  }

  // ================ SBF JAIL ================
  if (state.phase === "sbf") {
    const isLastLine = state.sbfLine >= SBF_DIALOGUE.length - 1;

    return (
      <CRTWrapper onSkip={skip}>
        <div className="space-y-6 py-8">
          <h2 className="text-xl tracking-wider">═══ A FAMILIAR FACE ═══</h2>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <img src="/images/trail/sbf.png" alt="SBF" className="w-24 h-24 pixelated border border-[#33ff33]/20" style={{ imageRendering: "pixelated" }} />
              <p className="text-[10px] text-center mt-1 text-[#33ff33]/30">SBF • FCI Pensacola</p>
            </div>
            <div className="flex-1 space-y-3">
              {SBF_DIALOGUE.slice(0, state.sbfLine + 1).map((line, i) => (
                <div key={i} className={i < state.sbfLine ? "text-[#33ff33]/40 text-sm" : ""}>
                  {i === state.sbfLine ? (
                    <TypedText
                      text={line}
                      speed={25}
                      onDone={() => handleSbfLineDone(i)}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm">{line}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isLastLine && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex gap-4 mt-4"
            >
              <GreenButton onClick={() => { sfxClick(); dispatch({ type: "SBF_TRUST" }); }}>
                🤝 TRUST SBF
              </GreenButton>
              <GreenButton onClick={() => { sfxClick(); dispatch({ type: "SBF_WALK" }); }}>
                🚶 WALK AWAY
              </GreenButton>
            </motion.div>
          )}
        </div>
      </CRTWrapper>
    );
  }

  // ================ EVENT OUTCOME ================
  if (state.phase === "event" && state.lastOutcome) {
    const changeColors = { good: "text-[#00ff00]", bad: "text-[#ff4444]", neutral: "text-[#33ff33]/60" };
    return (
      <CRTWrapper onSkip={skip}>
        <StatusBar state={state} />
        <div className="space-y-4 py-4">
          <TypedText text={state.lastOutcome} speed={20} className="text-sm border border-[#33ff33]/30 p-4" />

          {/* Stat changes — clean summary */}
          {state.lastChanges.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="border border-[#33ff33]/20 p-3 space-y-1"
            >
              {state.lastChanges.map((c, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-[#33ff33]/60">{c.label}</span>
                  <span className={`font-bold ${changeColors[c.type]}`}>{c.delta}</span>
                </div>
              ))}
            </motion.div>
          )}

          <GreenButton onClick={() => {
            sfxClick();
            dispatch({ type: "NEXT_STEP" });
          }}>Continue →</GreenButton>
        </div>
      </CRTWrapper>
    );
  }

  // ================ TRAVEL ANIMATION ================
  if (state.phase === "travel") {
    return (
      <CRTWrapper onSkip={skip}>
        <StatusBar state={state} />
        <div className="space-y-4 py-8">
          {/* Wagon rolling */}
          <div className="relative h-20 overflow-hidden border border-[#33ff33]/10">
            <div className="absolute bottom-2" style={{ animation: "wagonRoll 3s linear forwards" }}>
              <img
                src={state.profession?.name === "Crypto Poor" ? "/images/trail/cart.png" : "/images/trail/wagon.png"}
                alt={state.profession?.name === "Crypto Poor" ? "shopping cart" : "wagon"}
                className="w-16 h-10 pixelated"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            {/* Ground line */}
            <div className="absolute bottom-0 w-full h-px bg-[#33ff33]/20" />
          </div>

          <p className="text-center text-[#33ff33]/30 text-xs animate-pulse">Traveling...</p>
        </div>
      </CRTWrapper>
    );
  }

  // ================ LANDMARK ================
  if (state.phase === "landmark" && state.currentLandmarkData) {
    const lm = state.currentLandmarkData;
    return (
      <CRTWrapper onSkip={skip}>
        <StatusBar state={state} />
        <div className="space-y-4 py-4">
          <h2 className="text-lg tracking-wider">═══ {lm.name.toUpperCase()} ═══</h2>
          <TypedText text={lm.description} speed={20} className="text-sm text-[#33ff33]/70" />
          <div className="space-y-2 mt-4">
            {lm.choices.map((c, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                onClick={() => {
                  sfxClick();
                  dispatch({ type: "LANDMARK_CHOICE", choiceIndex: i });
                }}
                className="block w-full text-left px-4 py-2 border border-[#33ff33]/20 hover:bg-[#33ff33]/10 hover:border-[#33ff33]/50 transition-all text-sm"
              >
                <span className="text-[#33ff33]/40 mr-2">[{i + 1}]</span> {c.text}
              </motion.button>
            ))}
          </div>
        </div>
      </CRTWrapper>
    );
  }

  // ================ BEAR HUNT (Duck Hunt Style) ================
  if (state.phase === "hunt") {
    const now = Date.now();
    return (
      <CRTWrapper onSkip={skip} showSkip={true}>
        <div className="space-y-2 py-4">
          <div className="flex justify-between text-xs">
            <span>═══ BEAR HUNT ═══</span>
            <span>Bullets: {"🔴".repeat(state.huntBullets)}{"⚫".repeat(5 - state.huntBullets)}</span>
            <span>Time: {huntTimer}s</span>
          </div>

          {/* Hunt field */}
          <div
            className="relative w-full h-64 border border-[#33ff33]/20 bg-[#001a00] overflow-hidden"
            style={{ cursor: state.huntBullets > 0 ? "crosshair" : "not-allowed" }}
            onClick={() => {
              if (state.huntBullets > 0) {
                sfxGunshot();
                dispatch({ type: "HUNT_MISS" });
              }
            }}
          >
            {/* Ground */}
            <div className="absolute bottom-0 w-full h-12 bg-[#0a2a0a]" />

            {state.huntTargets.filter(t => t.alive).map((t) => {
              // Duck Hunt pop-up: targets appear based on active (non-paused) time
              const elapsed = huntStartRef.current > 0 ? Date.now() - huntStartRef.current - huntPausedTotalRef.current : 0;
              if (elapsed < t.popTime) return null;
              const popElapsed = elapsed - t.popTime;
              const popDuration = 1800; // shorter window = harder
              if (popElapsed > popDuration) return null;
              const popProgress = popElapsed / popDuration;
              // Pop up then back down
              let yOffset: number;
              if (popProgress < 0.2) yOffset = 100 - (popProgress / 0.2) * 100;
              else if (popProgress < 0.8) yOffset = 0;
              else yOffset = ((popProgress - 0.8) / 0.2) * 100;

              // Targets move horizontally using sine wave
              const baseX = 10 + (t.id * 18) % 70;
              const wobble = Math.sin(popElapsed / 200 + t.id * 2) * 8;
              const xPos = Math.max(5, Math.min(85, baseX + wobble));

              return (
                <motion.div
                  key={t.id}
                  className="absolute cursor-crosshair"
                  style={{
                    left: `${xPos}%`,
                    bottom: `${48 - yOffset * 0.6}px`,
                    transform: `translateY(${yOffset}%)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (state.huntBullets > 0) {
                      sfxGunshot();
                      dispatch({ type: "HUNT_SHOOT", targetId: t.id });
                    }
                  }}
                >
                  <img
                    src={t.sprite}
                    alt={t.name}
                    className="w-12 h-12 pixelated hover:brightness-150"
                    style={{ imageRendering: "pixelated" }}
                  />
                  {t.name === "Bull" && (
                    <span className="absolute -top-3 left-0 text-[8px] text-[#ff4444]">YOUR BULL!</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="text-xs text-[#33ff33]/40 text-center">
            Click targets to shoot! Bears = +SOL. Don&apos;t shoot your bulls!
          </div>
        </div>
      </CRTWrapper>
    );
  }

  // ================ HUNT MISS — TRUMP ================
  if (state.phase === "hunt_miss") {
    const quote = missQuoteRef.current || TRUMP_MISS_QUOTES[0];
    return (
      <CRTWrapper showSkip={false}>
        <div className="text-center py-8 space-y-4">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <img src="/images/trail/trump_cropped.png" alt="Trump laughing" className="w-28 h-32 mx-auto pixelated border-2 border-[#ff8c00]/30" style={{ imageRendering: "pixelated" }} />
            <p className="text-[#ff8c00] text-sm mt-3 max-w-md mx-auto italic">&quot;{quote}&quot;</p>
            <p className="text-[#ff8c00]/40 text-[10px] mt-1">— Donald J. Trump</p>
          </motion.div>
          <GreenButton onClick={() => dispatch({ type: "HUNT_MISS_DONE" })}>
            CONTINUE HUNTING
          </GreenButton>
        </div>
      </CRTWrapper>
    );
  }

  // ================ SCORE: TOMBSTONES ================
  if (state.phase === "score_tombstones") {
    const dead = state.party.filter(m => !m.alive);
    return (
      <CRTWrapper showSkip={false}>
        <div className="py-8 space-y-6">
          <h2 className="text-xl text-center tracking-wider">═══ JOURNEY&apos;S END ═══</h2>
          {dead.length > 0 ? (
            <>
              <p className="text-sm text-[#33ff33]/50 text-center">Those we lost along the way...</p>
              <div className="flex gap-4 justify-center flex-wrap">
                {dead.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="text-center border border-[#ff4444]/20 bg-[#ff4444]/5 p-4 rounded"
                  >
                    <PixelPFP handle={m.handle} size={48} />
                    <img src="/images/trail/tombstone.png" alt="RIP" className="w-12 h-16 mx-auto mt-2 pixelated" style={{ imageRendering: "pixelated" }} />
                    <p className="text-[#ff4444]/80 text-xs mt-1">@{m.handle}</p>
                    <p className="text-[#ff4444]/30 text-[10px]">Lost on the chain</p>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="text-center space-y-3"
            >
              <div className="text-3xl">🎉</div>
              <p className="text-lg text-[#33ff33]">THE ENTIRE PARTY SURVIVED</p>
              <p className="text-sm text-[#33ff33]/50">Against all odds, everyone made it to Oregon alive. This has literally never happened before. (It probably has. But let them have this.)</p>
            </motion.div>
          )}
        </div>
      </CRTWrapper>
    );
  }

  // ================ SCORE: TALLY ================
  if (state.phase === "score_tally") {
    const survivors = state.party.filter(m => m.alive).length;
    const mult = state.profession?.multiplier || 1;
    const finalGameScore = Math.round(state.gameScore * mult);
    return (
      <CRTWrapper showSkip={false}>
        <div className="py-8 space-y-4">
          <h2 className="text-xl text-center tracking-wider">═══ TRAIL STATS ═══</h2>
          <motion.div className="space-y-2 text-sm border border-[#33ff33]/20 p-4">
            {[
              `Profession: ${state.profession?.name}`,
              `Survivors: ${survivors}/${state.party.length}`,
              `Solana remaining: ${state.sol.toFixed(1)}`,
              `Big Macs left: ${state.supplies.Food || 0}`,
              `Bulls remaining: ${state.supplies.Bulls || 0}`,
              `Game Score: ${state.gameScore} × ${mult} = ${finalGameScore}`,
            ].map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
              >
                {line}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </CRTWrapper>
    );
  }

  // ================ SCORE: GLITCH ================
  if (state.phase === "score_glitch") {
    return (
      <CRTWrapper showSkip={false}>
        <div className="py-16 text-center" style={{ animation: "glitch 0.1s infinite" }}>
          <div className="text-4xl font-bold" style={{
            background: "linear-gradient(45deg, #33ff33, #ff0000, #33ff33)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "glitch 0.08s infinite",
          }}>
            ████████████
          </div>
          <div className="mt-4 text-sm text-[#33ff33]/30" style={{ animation: "glitch 0.12s infinite" }}>
            SIGNAL INTERRUPTED...
          </div>
        </div>
      </CRTWrapper>
    );
  }

  // ================ SCORE: REVEAL ================
  if (state.phase === "score_reveal") {
    const score = state.scoreData?.score ?? null;
    const tier = score !== null ? getTier(score) : null;
    const breakdown = state.scoreData ? computeBreakdown(state.scoreData) : null;
    const sectors = state.scoreData ? computeSectorScores(state.scoreData) : null;
    const shareText = encodeURIComponent(
      `🤠 I scored ${score ?? "???"} on Solana Trail!\n\n${state.profession?.name} • ${state.party.filter(m => m.alive).length}/${state.party.length} survived\n\nPlay yours: `
    );

    return (
      <CRTWrapper showSkip={false}>
        <div className="py-8 space-y-6">
          <TypedText
            text="BUT MORE IMPORTANTLY..."
            speed={50}
            className="text-center text-lg text-[#33ff33]/60"
          />

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2, type: "spring", bounce: 0.3 }}
            className="text-center"
          >
            <p className="text-xs text-[#33ff33]/40 mb-2">YOUR SOLANA SCORE</p>
            {score !== null ? (
              <>
                <div className="text-6xl font-bold" style={{
                  textShadow: "0 0 30px #33ff33, 0 0 60px #33ff33, 0 0 90px #33ff3366",
                }}>
                  {score}
                </div>
                {tier && (
                  <p className="text-sm mt-2" style={{ color: tier.color }}>{tier.name}</p>
                )}
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-[#ff4444]">???</div>
                <p className="text-sm text-[#ff4444]/60 mt-2">Your wallet has no score yet.</p>
                <p className="text-xs text-[#33ff33]/40 mt-1">Use Solana protocols to build your reputation, then come back and play with real data.</p>
                <p className="text-sm text-[#33ff33]/60 mt-3">Trail Game Score: <span className="text-[#33ff33] font-bold">{Math.round((state.gameScore) * (state.profession?.multiplier || 1))}</span></p>
              </>
            )}
          </motion.div>

          {/* Score breakdown */}
          {breakdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="border border-[#33ff33]/20 p-4 space-y-2 text-xs"
            >
              <div className="text-[#33ff33]/40">═══ SCORE BREAKDOWN ═══</div>
              {breakdown.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-32 text-[#33ff33]/60">{b.name} ({b.weight})</span>
                  <div className="flex-1 bg-[#33ff33]/10 h-3 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.score}%` }}
                      transition={{ delay: 3 + i * 0.2, duration: 0.5 }}
                      className="h-full bg-[#33ff33]/40"
                    />
                  </div>
                  <span className="w-8 text-right">{b.score}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Sybil status */}
          {state.scoreData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4 }}
              className="text-center"
            >
              <span className={`px-4 py-1 border text-sm ${
                state.scoreData.is_sybil
                  ? "border-[#ff4444] text-[#ff4444]"
                  : "border-[#33ff33] text-[#33ff33]"
              }`}>
                {state.scoreData.is_sybil ? "⚠ FLAGGED" : "✓ VERIFIED HUMAN"}
              </span>
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4"
          >
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 border-2 border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2]/10 font-mono transition-all"
            >
              SHARE ON 𝕏
            </a>
            {score !== null && (
              <a
                href={`/dashboard`}
                className="px-6 py-2 border border-[#33ff33] text-[#33ff33] hover:bg-[#33ff33]/10 font-mono transition-all"
              >
                VIEW FULL SCORE
              </a>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-[#33ff33]/30 text-[#33ff33]/50 hover:bg-[#33ff33]/5 font-mono transition-all"
            >
              PLAY AGAIN
            </button>
          </motion.div>

          <div className="text-center pt-4 opacity-60">
            <img src="/images/slice-analytics-full.png" alt="Slice Analytics" className="h-5 mx-auto pixelated" style={{ imageRendering: "pixelated", filter: "brightness(0) invert(1)" }} />
          </div>
        </div>
      </CRTWrapper>
    );
  }

  // Fallback
  return (
    <CRTWrapper showSkip={false}>
      <div className="py-8 text-center">
        <p>Loading...</p>
      </div>
    </CRTWrapper>
  );
}
