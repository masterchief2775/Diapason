import React, { useState, useMemo } from "react";
import {
  Home,
  Guitar,
  Music2,
  Flame,
  Star,
  Lock,
  CheckCircle2,
  ChevronRight,
  Target,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Clock,
  Wand2,
  Ear,
} from "lucide-react";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');";

// ---- Théorie : moteur de notes -------------------------------------------------

const NOTES = ["Do", "Do#", "Ré", "Ré#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];

// Cordes de la corde 6 (Mi grave) à la corde 1 (Mi aigu)
const TUNING = [4, 9, 2, 7, 11, 4];
const STRING_LABELS = ["6 · Mi", "5 · La", "4 · Ré", "3 · Sol", "2 · Si", "1 · Mi"];
const FRET_COUNT = 12;
const MARKER_FRETS = [3, 5, 7, 9];

function noteAt(stringIndex, fret) {
  return (TUNING[stringIndex] + fret) % 12;
}

const SCALES = [
  { id: "majeure", label: "Majeure", steps: [0, 2, 4, 5, 7, 9, 11] },
  { id: "mineure", label: "Mineure naturelle", steps: [0, 2, 3, 5, 7, 8, 10] },
  { id: "penta-maj", label: "Pentatonique majeure", steps: [0, 2, 4, 7, 9] },
  { id: "penta-min", label: "Pentatonique mineure", steps: [0, 3, 5, 7, 10] },
  { id: "blues", label: "Blues", steps: [0, 3, 5, 6, 7, 10] },
];

const INTERVALS = [
  { semis: 1, label: "seconde mineure" },
  { semis: 2, label: "seconde majeure" },
  { semis: 3, label: "tierce mineure" },
  { semis: 4, label: "tierce majeure" },
  { semis: 5, label: "quarte juste" },
  { semis: 7, label: "quinte juste" },
  { semis: 9, label: "sixte majeure" },
  { semis: 10, label: "septième mineure" },
  { semis: 11, label: "septième majeure" },
  { semis: 12, label: "octave" },
];

const CHORD_QUALITIES = [
  { id: "maj", label: "Majeur", formula: [0, 4, 7], degrees: "1 – 3 – 5" },
  { id: "min", label: "Mineur", formula: [0, 3, 7], degrees: "1 – ♭3 – 5" },
  { id: "dim", label: "Diminué", formula: [0, 3, 6], degrees: "1 – ♭3 – ♭5" },
  { id: "aug", label: "Augmenté", formula: [0, 4, 8], degrees: "1 – 3 – ♯5" },
];

// Fréquence (Hz) d'une note en octave 4, pour l'oreille musicale (La4 = 440 Hz)
function freqFor(noteIndex, octaveShift = 0) {
  const semitoneFromA4 = noteIndex - 9 + octaveShift * 12;
  return 440 * Math.pow(2, semitoneFromA4 / 12);
}

function playTone(ctx, freq, startTime, duration = 0.9) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// Fréquence à partir d'un décalage en demi-tons ascendant depuis une classe de hauteur
// (évite les sauts d'octave qu'on aurait avec un simple modulo 12)
function freqForOffset(baseNoteIndex, semitoneOffset) {
  return 440 * Math.pow(2, (baseNoteIndex - 9 + semitoneOffset) / 12);
}

function playClick(ctx, time, accent = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = accent ? 1400 : 900;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(accent ? 0.3 : 0.18, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.1);
}

// ---- Rythme ---------------------------------------------------------------------

const NOTE_VALUES = [
  { id: "ronde", label: "Ronde", beats: 4 },
  { id: "blanche", label: "Blanche", beats: 2 },
  { id: "noire", label: "Noire", beats: 1 },
  { id: "croche", label: "Croche", beats: 0.5 },
];

function NoteSymbol({ type, color = "#EDE7DD", size = 34 }) {
  const h = size * 1.3;
  const noteHeads = { ronde: false, blanche: false, noire: true, croche: true };
  const hasStem = type !== "ronde";
  const hasFlag = type === "croche";
  const filled = noteHeads[type];
  return (
    <svg width={size} height={h} viewBox="0 0 24 32">
      <ellipse
        cx="9"
        cy="24"
        rx="7"
        ry="5"
        transform="rotate(-18 9 24)"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="2"
      />
      {hasStem && <line x1="15.5" y1="22" x2="15.5" y2="3" stroke={color} strokeWidth="2" />}
      {hasFlag && <path d="M15.5 3 Q23 6 16 13" fill="none" stroke={color} strokeWidth="2" />}
    </svg>
  );
}

// ---- Harmonie diatonique (pour le studio de composition) -------------------------

const DIATONIC = {
  majeure: {
    steps: [0, 2, 4, 5, 7, 9, 11],
    qualities: ["maj", "min", "min", "maj", "maj", "min", "dim"],
    numerals: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  },
  mineure: {
    steps: [0, 2, 3, 5, 7, 8, 10],
    qualities: ["min", "dim", "maj", "min", "min", "maj", "maj"],
    numerals: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
  },
};

function degreeChord(keyRoot, mode, degreeIdx) {
  const d = DIATONIC[mode];
  const rootOffset = d.steps[degreeIdx];
  const rootNoteIndex = (keyRoot + rootOffset) % 12;
  const quality = CHORD_QUALITIES.find((q) => q.id === d.qualities[degreeIdx]);
  return { rootOffset, rootNoteIndex, quality, numeral: d.numerals[degreeIdx] };
}

const PROGRESSION_PRESETS = [
  { label: "Pop · I–V–vi–IV", degrees: [0, 4, 5, 3] },
  { label: "Blues/rock · I–IV–V–IV", degrees: [0, 3, 4, 3] },
  { label: "Cadence jazz · ii–V–I", degrees: [1, 4, 0] },
];

// ---- Contenu du parcours (issu du cahier des charges) --------------------------

const PHASES = [
  {
    id: 1,
    range: "0 → 20 %",
    title: "Fondations",
    modules: [
      { id: "notes", title: "Notes, octaves, nom des cordes", status: "done" },
      { id: "manche", title: "Le manche de la guitare", status: "done" },
      { id: "intervalles", title: "Les intervalles", status: "done" },
      { id: "rythme", title: "Rythme de base et lecture rythmique", status: "current" },
      { id: "gamme-maj", title: "Première gamme majeure et accords", status: "locked" },
    ],
  },
  {
    id: 2,
    range: "20 → 45 %",
    title: "Harmonie et gammes",
    modules: [
      { id: "accords", title: "Construction des accords", status: "done" },
      { id: "gammes", title: "Gammes majeures et mineures", status: "locked" },
      { id: "modes", title: "Modes de la gamme majeure", status: "locked" },
      { id: "pentas", title: "Pentatoniques et blues", status: "locked" },
      { id: "cadences", title: "Cadences et progressions", status: "locked" },
    ],
  },
  {
    id: 3,
    range: "45 → 75 %",
    title: "Maîtrise avancée",
    modules: [
      { id: "harmonie-fonc", title: "Harmonie fonctionnelle complète", status: "locked" },
      { id: "modes-exo", title: "Modes et gammes exotiques", status: "locked" },
      { id: "reharmo", title: "Substitution et réharmonisation", status: "locked" },
      { id: "analyse", title: "Analyse harmonique de morceaux", status: "locked" },
    ],
  },
  {
    id: 4,
    range: "75 → 100 %",
    title: "Composition et expertise",
    modules: [
      { id: "melodie", title: "Composition mélodique", status: "locked" },
      { id: "structure", title: "Structure de chanson", status: "locked" },
      { id: "genres", title: "Composition par genres", status: "locked" },
      { id: "projet", title: "Projet final", status: "locked" },
    ],
  },
];

// ---- Manche de guitare interactif ----------------------------------------------

function Fretboard({ highlight, onCellClick, activeCells = [], compact = false }) {
  const cellSize = compact ? 30 : 36;
  return (
    <div
      style={{
        overflowX: "auto",
        background: "#191410",
        border: "1px solid #2E2620",
        borderRadius: 10,
        padding: compact ? 12 : 20,
      }}
    >
      <div style={{ display: "inline-block", minWidth: (FRET_COUNT + 1) * cellSize + 60 }}>
        {/* numéros de frettes */}
        <div style={{ display: "flex", marginLeft: 60 }}>
          {Array.from({ length: FRET_COUNT + 1 }).map((_, f) => (
            <div
              key={f}
              style={{
                width: cellSize,
                textAlign: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#7C7264",
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {STRING_LABELS.map((label, sIdx) => (
          <div key={sIdx} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 60,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: "#A89A87",
                flexShrink: 0,
              }}
            >
              {label}
            </div>
            {Array.from({ length: FRET_COUNT + 1 }).map((_, f) => {
              const note = noteAt(sIdx, f);
              const isRoot = highlight && highlight.rootIndex !== undefined && note === highlight.rootIndex;
              const inScale = highlight && highlight.steps && highlight.steps.includes(
                (note - highlight.rootIndex + 12) % 12
              );
              const isActive = activeCells.some((c) => c.s === sIdx && c.f === f);
              const clickable = !!onCellClick;

              let dotBg = "transparent";
              let dotColor = "#5A5248";
              let border = "1px solid transparent";
              if (isRoot) {
                dotBg = "#F2C14E";
                dotColor = "#3A2A05";
              } else if (inScale) {
                dotBg = "#7FA98C";
                dotColor = "#0D2016";
              }
              if (isActive) {
                border = "2px solid #F2C14E";
              }

              return (
                <button
                  key={f}
                  onClick={() => clickable && onCellClick(sIdx, f)}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderTop: "1px solid #3A322A",
                    borderBottom: sIdx === 5 ? "1px solid #3A322A" : "none",
                    borderLeft: f === 0 ? "3px solid #6B6155" : "1px solid #2A241E",
                    background: "transparent",
                    cursor: clickable ? "pointer" : "default",
                    position: "relative",
                  }}
                >
                  {MARKER_FRETS.includes(f) && sIdx === 5 && !inScale && !isRoot && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -18,
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#3A322A",
                      }}
                    />
                  )}
                  <span
                    style={{
                      width: cellSize - 8,
                      height: cellSize - 8,
                      borderRadius: "50%",
                      background: dotBg,
                      color: dotColor,
                      border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10.5,
                      fontWeight: 500,
                    }}
                  >
                    {(isRoot || inScale || isActive) ? NOTES[note] : ""}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Vue : Tableau de bord ------------------------------------------------------

function Dashboard({ onOpenLesson, onOpenChords, onOpenEarTraining, onOpenRhythm, onOpenComposition }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1, color: "#F2C14E", margin: 0 }}>
          Phase 1 · Fondations
        </p>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: 34,
            color: "#EDE7DD",
            margin: "6px 0 6px",
          }}
        >
          Bon retour. On reprend le manche.
        </h1>
        <p style={{ color: "#A89A87", fontSize: 15, margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
          Prochaine étape : le rythme de base — sentir les temps avant de les jouer.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 36 }}>
        <StatCard icon={<Flame size={18} />} label="Série" value="6 jours" />
        <StatCard icon={<Star size={18} />} label="Expérience" value="240 XP" />
        <StatCard icon={<Target size={18} />} label="Progression" value="26 %" />
      </div>

      <div
        style={{
          background: "#1C1712",
          border: "1px solid #2E2620",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <p style={{ color: "#7C7264", fontSize: 12, margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>
            Leçon en cours
          </p>
          <p style={{ color: "#EDE7DD", fontSize: 17, fontFamily: "'Fraunces', serif", margin: 0 }}>
            Rythme de base
          </p>
        </div>
        <button
          onClick={onOpenRhythm}
          style={{
            background: "#F2C14E",
            color: "#3A2A05",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Continuer <ChevronRight size={16} />
        </button>
      </div>

      <div
        style={{
          background: "#1C1712",
          border: "1px solid #2E2620",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <p style={{ color: "#7C7264", fontSize: 12, margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>
            Nouveau
          </p>
          <p style={{ color: "#EDE7DD", fontSize: 17, fontFamily: "'Fraunces', serif", margin: 0 }}>
            Studio de composition
          </p>
        </div>
        <button
          onClick={onOpenComposition}
          style={{
            background: "transparent",
            color: "#F2C14E",
            border: "1px solid #4A3E2A",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Ouvrir <ChevronRight size={16} />
        </button>
      </div>

      <div
        style={{
          background: "#1C1712",
          border: "1px solid #2E2620",
          borderRadius: 12,
          padding: 20,
          marginBottom: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <p style={{ color: "#7C7264", fontSize: 12, margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>
            Entraînement libre
          </p>
          <p style={{ color: "#EDE7DD", fontSize: 17, fontFamily: "'Fraunces', serif", margin: 0 }}>
            Oreille musicale · intervalles
          </p>
        </div>
        <button
          onClick={onOpenEarTraining}
          style={{
            background: "transparent",
            color: "#F2C14E",
            border: "1px solid #4A3E2A",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Écouter <ChevronRight size={16} />
        </button>
      </div>

      <h2
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 500,
          fontSize: 20,
          color: "#EDE7DD",
          margin: "0 0 18px",
        }}
      >
        Parcours
      </h2>

      <div>
        {PHASES.map((phase, pIdx) => (
          <div key={phase.id} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#F2C14E", fontSize: 12 }}>
                Phase {phase.id}
              </span>
              <span style={{ color: "#EDE7DD", fontSize: 15, fontWeight: 500 }}>{phase.title}</span>
              <span style={{ color: "#7C7264", fontSize: 12, marginLeft: "auto" }}>{phase.range}</span>
            </div>
            <div style={{ borderLeft: "1px solid #2E2620", marginLeft: 7, paddingLeft: 20 }}>
              {phase.modules.map((m) => {
                const openable = m.id === "intervalles" || m.id === "accords" || m.id === "rythme";
                const handleClick = () => {
                  if (m.id === "intervalles") onOpenLesson();
                  if (m.id === "accords") onOpenChords();
                  if (m.id === "rythme") onOpenRhythm();
                };
                return (
                <div
                  key={m.id}
                  onClick={handleClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 0",
                    cursor: openable ? "pointer" : "default",
                    opacity: m.status === "locked" ? 0.5 : 1,
                  }}
                >
                  {m.status === "done" && <CheckCircle2 size={16} color="#7FA98C" />}
                  {m.status === "current" && <Sparkles size={16} color="#F2C14E" />}
                  {m.status === "locked" && <Lock size={14} color="#7C7264" />}
                  <span
                    style={{
                      fontSize: 14,
                      color: m.status === "current" ? "#EDE7DD" : "#C9BFAE",
                      fontWeight: m.status === "current" ? 500 : 400,
                    }}
                  >
                    {m.title}
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div
      style={{
        background: "#1C1712",
        border: "1px solid #2E2620",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div style={{ color: "#F2C14E", marginBottom: 8 }}>{icon}</div>
      <p style={{ color: "#7C7264", fontSize: 11, margin: "0 0 2px", fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </p>
      <p style={{ color: "#EDE7DD", fontSize: 17, margin: 0, fontFamily: "'Fraunces', serif" }}>{value}</p>
    </div>
  );
}

// ---- Vue : Manche interactif -----------------------------------------------------

function FretboardExplorer() {
  const [rootIndex, setRootIndex] = useState(4); // Mi
  const [scaleId, setScaleId] = useState("majeure");
  const scale = SCALES.find((s) => s.id === scaleId);

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 20px 80px" }}>
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 500,
          fontSize: 28,
          color: "#EDE7DD",
          margin: "0 0 6px",
        }}
      >
        Manche interactif
      </h1>
      <p style={{ color: "#A89A87", fontSize: 14, margin: "0 0 24px", maxWidth: 500, lineHeight: 1.6 }}>
        Choisis une tonique et une gamme pour voir où elle vit sur les six cordes. La tonique est en doré, les autres notes de la gamme en vert.
      </p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <p style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 8px" }}>
            Tonique
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 300 }}>
            {NOTES.map((n, i) => (
              <button
                key={n}
                onClick={() => setRootIndex(i)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: i === rootIndex ? "1px solid #F2C14E" : "1px solid #2E2620",
                  background: i === rootIndex ? "#2C2310" : "#1C1712",
                  color: i === rootIndex ? "#F2C14E" : "#C9BFAE",
                  fontSize: 12.5,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 8px" }}>
            Gamme
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 340 }}>
            {SCALES.map((s) => (
              <button
                key={s.id}
                onClick={() => setScaleId(s.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: s.id === scaleId ? "1px solid #7FA98C" : "1px solid #2E2620",
                  background: s.id === scaleId ? "#16261C" : "#1C1712",
                  color: s.id === scaleId ? "#7FA98C" : "#C9BFAE",
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Fretboard highlight={{ rootIndex, steps: scale.steps }} />
    </div>
  );
}

// ---- Vue : Leçon "Les intervalles" ------------------------------------------------

function IntervalLesson({ onBack }) {
  const [phase, setPhase] = useState("intro"); // intro | quiz | recap
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const totalRounds = 5;

  const newQuestion = () => {
    const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    setQuestion(interval);
    setFeedback(null);
  };

  const startQuiz = () => {
    setScore(0);
    setRound(0);
    setPhase("quiz");
    newQuestion();
  };

  const handleCellClick = (sIdx, f) => {
    if (sIdx !== 5 || feedback) return; // seule la corde de Mi grave (index 5, corde 1... on force la corde 6 en fait)
    if (sIdx !== 5) return;
  };

  // On restreint le clic à la corde 6 (Mi grave), index 0 dans STRING_LABELS
  const handleFretClick = (sIdx, f) => {
    if (sIdx !== 0 || feedback) return;
    const correct = f === question.semis;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (round + 1 >= totalRounds) {
      setPhase("recap");
    } else {
      setRound((r) => r + 1);
      newQuestion();
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 80px" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#A89A87",
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={15} /> Tableau de bord
      </button>

      {phase === "intro" && (
        <>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1, color: "#F2C14E", margin: 0 }}>
            Phase 1 · Leçon 3
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 30, color: "#EDE7DD", margin: "6px 0 18px" }}>
            Les intervalles
          </h1>
          <p style={{ color: "#C9BFAE", fontSize: 15.5, lineHeight: 1.75, margin: "0 0 16px", maxWidth: 560 }}>
            Un intervalle mesure la distance entre deux notes, en demi-tons. Sur une seule corde, c'est très concret :
            chaque case représente un demi-ton, donc l'intervalle entre deux notes est simplement le nombre de cases qui les sépare.
          </p>
          <p style={{ color: "#C9BFAE", fontSize: 15.5, lineHeight: 1.75, margin: "0 0 28px", maxWidth: 560 }}>
            Cette logique reste vraie partout sur le manche et c'est elle qui construit ensuite les gammes et les accords :
            une gamme majeure, par exemple, n'est qu'une suite précise d'intervalles empilés à partir d'une tonique.
          </p>

          <div style={{ marginBottom: 28 }}>
            <Fretboard compact activeCells={[{ s: 0, f: 0 }]} highlight={{ rootIndex: TUNING[0], steps: [0] }} />
          </div>

          <button
            onClick={startQuiz}
            style={{
              background: "#F2C14E",
              color: "#3A2A05",
              border: "none",
              borderRadius: 8,
              padding: "12px 20px",
              fontWeight: 600,
              fontSize: 14.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Commencer l'exercice <ChevronRight size={16} />
          </button>
        </>
      )}

      {phase === "quiz" && question && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7C7264", margin: 0 }}>
              Question {round + 1} / {totalRounds}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7FA98C", margin: 0 }}>
              Score : {score}
            </p>
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#EDE7DD", margin: "6px 0 22px" }}>
            Clique sur la {question.label} au-dessus du Mi grave à vide.
          </h2>

          <Fretboard highlight={{ rootIndex: TUNING[0], steps: [] }} onCellClick={handleFretClick} />

          {feedback && (
            <div
              style={{
                marginTop: 18,
                padding: "12px 16px",
                borderRadius: 8,
                background: feedback === "correct" ? "#16261C" : "#2A1414",
                border: feedback === "correct" ? "1px solid #7FA98C" : "1px solid #C4645F",
                color: feedback === "correct" ? "#9FC7AC" : "#E29C98",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                {feedback === "correct"
                  ? "Exact. C'est bien la bonne case."
                  : `Pas tout à fait — la ${question.label} est ${question.semis} case${question.semis > 1 ? "s" : ""} après la tonique.`}
              </span>
              <button
                onClick={nextQuestion}
                style={{
                  background: "transparent",
                  border: "1px solid currentColor",
                  color: "inherit",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {round + 1 >= totalRounds ? "Voir le résultat" : "Suivant"}
              </button>
            </div>
          )}
        </>
      )}

      {phase === "recap" && (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#F2C14E", margin: "0 0 8px" }}>
            Exercice terminé
          </p>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 30, color: "#EDE7DD", margin: "0 0 8px" }}>
            {score} / {totalRounds}
          </h2>
          <p style={{ color: "#A89A87", fontSize: 14, margin: "0 0 28px" }}>
            {score === totalRounds
              ? "Maîtrise parfaite des intervalles sur une corde."
              : "Encore quelques répétitions et ce sera automatique."}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={startQuiz}
              style={{
                background: "#1C1712",
                border: "1px solid #2E2620",
                color: "#EDE7DD",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <RotateCcw size={15} /> Refaire
            </button>
            <button
              onClick={onBack}
              style={{
                background: "#F2C14E",
                border: "none",
                color: "#3A2A05",
                borderRadius: 8,
                padding: "10px 16px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Vue : Leçon "Construction des accords" -----------------------------------------

function ChordLesson({ onBack }) {
  const [rootIndex, setRootIndex] = useState(4); // Mi
  const [qualityId, setQualityId] = useState("maj");
  const [gamePhase, setGamePhase] = useState("intro"); // intro | game | recap
  const [gameRound, setGameRound] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [target, setTarget] = useState(null);
  const [picked, setPicked] = useState([]);
  const [gameFeedback, setGameFeedback] = useState(null);
  const totalRounds = 4;

  const quality = CHORD_QUALITIES.find((q) => q.id === qualityId);
  const chordSteps = quality.formula;

  const newTarget = () => {
    const q = CHORD_QUALITIES[Math.floor(Math.random() * CHORD_QUALITIES.length)];
    const r = Math.floor(Math.random() * 12);
    setTarget({ root: r, quality: q });
    setPicked([]);
    setGameFeedback(null);
  };

  const startGame = () => {
    setGameScore(0);
    setGameRound(0);
    setGamePhase("game");
    newTarget();
  };

  const handleGameClick = (sIdx, f) => {
    if (gameFeedback) return;
    const note = noteAt(sIdx, f);
    const already = picked.some((p) => p.s === sIdx && p.f === f);
    let nextPicked = already ? picked.filter((p) => !(p.s === sIdx && p.f === f)) : [...picked, { s: sIdx, f, note }];
    setPicked(nextPicked);

    if (nextPicked.length === 3) {
      const pitchSet = new Set(nextPicked.map((p) => (p.note - target.root + 12) % 12));
      const targetSet = new Set(target.quality.formula);
      const correct =
        pitchSet.size === targetSet.size && [...pitchSet].every((v) => targetSet.has(v));
      setGameFeedback(correct ? "correct" : "wrong");
      if (correct) setGameScore((s) => s + 1);
    }
  };

  const nextGameQuestion = () => {
    if (gameRound + 1 >= totalRounds) {
      setGamePhase("recap");
    } else {
      setGameRound((r) => r + 1);
      newTarget();
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 80px" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#A89A87",
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={15} /> Tableau de bord
      </button>

      {gamePhase === "intro" && (
        <>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1, color: "#F2C14E", margin: 0 }}>
            Phase 2 · Leçon 1
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 30, color: "#EDE7DD", margin: "6px 0 18px" }}>
            Construction des accords
          </h1>
          <p style={{ color: "#C9BFAE", fontSize: 15.5, lineHeight: 1.75, margin: "0 0 16px", maxWidth: 560 }}>
            Une triade empile trois notes par intervalles de tierce : la fondamentale, la tierce et la quinte.
            Changer la tierce et la quinte de quelques demi-tons suffit à transformer la couleur de l'accord —
            c'est tout ce qui distingue un accord majeur d'un accord mineur, diminué ou augmenté.
          </p>
          <p style={{ color: "#C9BFAE", fontSize: 15.5, lineHeight: 1.75, margin: "0 0 24px", maxWidth: 560 }}>
            Choisis une fondamentale et une couleur d'accord ci-dessous : le manche affiche où se trouve chaque degré.
          </p>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 18 }}>
            <div>
              <p style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 8px" }}>
                Fondamentale
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 300 }}>
                {NOTES.map((n, i) => (
                  <button
                    key={n}
                    onClick={() => setRootIndex(i)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: i === rootIndex ? "1px solid #F2C14E" : "1px solid #2E2620",
                      background: i === rootIndex ? "#2C2310" : "#1C1712",
                      color: i === rootIndex ? "#F2C14E" : "#C9BFAE",
                      fontSize: 12.5,
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 8px" }}>
                Couleur
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 300 }}>
                {CHORD_QUALITIES.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQualityId(q.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: q.id === qualityId ? "1px solid #7FA98C" : "1px solid #2E2620",
                      background: q.id === qualityId ? "#16261C" : "#1C1712",
                      color: q.id === qualityId ? "#7FA98C" : "#C9BFAE",
                      fontSize: 12.5,
                      cursor: "pointer",
                    }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p style={{ color: "#7C7264", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 12px" }}>
            {NOTES[rootIndex]} {quality.label.toLowerCase()} · degrés {quality.degrees}
          </p>

          <div style={{ marginBottom: 28 }}>
            <Fretboard highlight={{ rootIndex, steps: chordSteps }} />
          </div>

          <button
            onClick={startGame}
            style={{
              background: "#F2C14E",
              color: "#3A2A05",
              border: "none",
              borderRadius: 8,
              padding: "12px 20px",
              fontWeight: 600,
              fontSize: 14.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Jouer : construis l'accord <ChevronRight size={16} />
          </button>
        </>
      )}

      {gamePhase === "game" && target && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7C7264", margin: 0 }}>
              Accord {gameRound + 1} / {totalRounds}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7FA98C", margin: 0 }}>
              Score : {gameScore}
            </p>
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#EDE7DD", margin: "6px 0 8px" }}>
            Clique sur 3 notes qui forment un {NOTES[target.root]} {target.quality.label.toLowerCase()}.
          </h2>
          <p style={{ color: "#7C7264", fontSize: 13, margin: "0 0 18px" }}>
            {picked.length} / 3 notes sélectionnées — n'importe où sur le manche.
          </p>

          <Fretboard
            highlight={{ rootIndex: -1, steps: [] }}
            activeCells={picked}
            onCellClick={handleGameClick}
          />

          {gameFeedback && (
            <div
              style={{
                marginTop: 18,
                padding: "12px 16px",
                borderRadius: 8,
                background: gameFeedback === "correct" ? "#16261C" : "#2A1414",
                border: gameFeedback === "correct" ? "1px solid #7FA98C" : "1px solid #C4645F",
                color: gameFeedback === "correct" ? "#9FC7AC" : "#E29C98",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span>
                {gameFeedback === "correct"
                  ? "Exact, ce sont bien les trois bonnes notes."
                  : `Ce n'était pas ça — les degrés attendus étaient ${target.quality.degrees}.`}
              </span>
              <button
                onClick={nextGameQuestion}
                style={{
                  background: "transparent",
                  border: "1px solid currentColor",
                  color: "inherit",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {gameRound + 1 >= totalRounds ? "Voir le résultat" : "Suivant"}
              </button>
            </div>
          )}
        </>
      )}

      {gamePhase === "recap" && (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#F2C14E", margin: "0 0 8px" }}>
            Exercice terminé
          </p>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 30, color: "#EDE7DD", margin: "0 0 8px" }}>
            {gameScore} / {totalRounds}
          </h2>
          <p style={{ color: "#A89A87", fontSize: 14, margin: "0 0 28px" }}>
            {gameScore === totalRounds
              ? "Les triades majeures, mineures, diminuées et augmentées sont acquises."
              : "Revois les degrés de chaque couleur d'accord et retente ta chance."}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={startGame}
              style={{
                background: "#1C1712",
                border: "1px solid #2E2620",
                color: "#EDE7DD",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <RotateCcw size={15} /> Refaire
            </button>
            <button
              onClick={onBack}
              style={{
                background: "#F2C14E",
                border: "none",
                color: "#3A2A05",
                borderRadius: 8,
                padding: "10px 16px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Vue : Oreille musicale (ear training) -------------------------------------------

function EarTraining({ onBack }) {
  const audioCtxRef = React.useRef(null);
  const [question, setQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const totalRounds = 8;

  const getCtx = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  };

  const playInterval = (semis) => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    const rootNote = 4; // Mi, fixe pour la répétabilité
    const now = ctx.currentTime;
    playTone(ctx, freqFor(rootNote), now, 0.7);
    playTone(ctx, freqFor((rootNote + semis) % 12, semis >= 12 - rootNote ? 1 : 0), now + 0.85, 0.7);
  };

  const newQuestion = () => {
    const shuffled = [...INTERVALS].sort(() => Math.random() - 0.5);
    const correct = shuffled[0];
    const opts = shuffled.slice(0, 4).sort(() => Math.random() - 0.5);
    setQuestion(correct);
    setChoices(opts);
    setSelected(null);
    setTimeout(() => playInterval(correct.semis), 150);
  };

  const start = () => {
    setScore(0);
    setRound(0);
    newQuestion();
  };

  React.useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoice = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt.semis === question.semis) setScore((s) => s + 1);
  };

  const next = () => {
    if (round + 1 >= totalRounds) {
      setRound((r) => r + 1);
    } else {
      setRound((r) => r + 1);
      newQuestion();
    }
  };

  const finished = round >= totalRounds;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 80px" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#A89A87",
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={15} /> Tableau de bord
      </button>

      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1, color: "#F2C14E", margin: 0 }}>
        Entraînement libre
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 28, color: "#EDE7DD", margin: "6px 0 18px" }}>
        Oreille musicale · intervalles
      </h1>

      {!finished ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7C7264", margin: 0 }}>
              Question {round + 1} / {totalRounds}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7FA98C", margin: 0 }}>
              Score : {score}
            </p>
          </div>

          <button
            onClick={() => question && playInterval(question.semis)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "0 auto 28px",
              background: "#1C1712",
              border: "1px solid #2E2620",
              borderRadius: 10,
              padding: "18px 28px",
              cursor: "pointer",
              color: "#F2C14E",
              fontSize: 14,
            }}
          >
            <Music2 size={18} /> Rejouer les deux notes
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {choices.map((opt) => {
              const isSelected = selected && selected.semis === opt.semis;
              const isCorrectAnswer = selected && opt.semis === question.semis;
              let border = "1px solid #2E2620";
              let bg = "#1C1712";
              let color = "#C9BFAE";
              if (selected) {
                if (isCorrectAnswer) {
                  border = "1px solid #7FA98C";
                  bg = "#16261C";
                  color = "#9FC7AC";
                } else if (isSelected) {
                  border = "1px solid #C4645F";
                  bg = "#2A1414";
                  color = "#E29C98";
                }
              }
              return (
                <button
                  key={opt.semis}
                  onClick={() => handleChoice(opt)}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border,
                    background: bg,
                    color,
                    fontSize: 14,
                    cursor: selected ? "default" : "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {selected && (
            <button
              onClick={next}
              style={{
                marginTop: 20,
                background: "#F2C14E",
                border: "none",
                color: "#3A2A05",
                borderRadius: 8,
                padding: "10px 18px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {round + 1 >= totalRounds ? "Voir le résultat" : "Suivant"} <ChevronRight size={16} />
            </button>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", paddingTop: 20 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 30, color: "#EDE7DD", margin: "0 0 8px" }}>
            {score} / {totalRounds}
          </h2>
          <p style={{ color: "#A89A87", fontSize: 14, margin: "0 0 28px" }}>
            {score >= totalRounds - 1
              ? "Reconnaissance d'intervalles très solide."
              : "L'oreille se muscle avec la répétition — retente une série."}
          </p>
          <button
            onClick={start}
            style={{
              background: "#1C1712",
              border: "1px solid #2E2620",
              color: "#EDE7DD",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 14,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RotateCcw size={15} /> Refaire une série
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Vue : Leçon "Rythme de base" ------------------------------------------------

function RhythmLesson({ onBack }) {
  const audioCtxRef = React.useRef(null);
  const timersRef = React.useRef([]);
  const expectedRef = React.useRef([]);
  const tapsRef = React.useRef([]);

  const [tempo, setTempo] = useState(90);
  const [phase, setPhase] = useState("intro"); // intro | running | result
  const [activeBeat, setActiveBeat] = useState(-1);
  const [rows, setRows] = useState(null);
  const BEATS = 8;

  const getCtx = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  };

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  React.useEffect(() => () => clearTimers(), []);

  const finishGame = () => {
    const expected = expectedRef.current;
    const taps = tapsRef.current.map((t) => ({ time: t, used: false }));
    const result = expected.map((t) => {
      let bestIdx = -1;
      let bestDiff = Infinity;
      taps.forEach((tap, idx) => {
        if (tap.used) return;
        const diff = Math.abs(tap.time - t);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestIdx = idx;
        }
      });
      if (bestIdx !== -1 && bestDiff <= 220) {
        taps[bestIdx].used = true;
        return { diff: Math.round(bestDiff), verdict: bestDiff <= 60 ? "parfait" : bestDiff <= 150 ? "bien" : "tard" };
      }
      return { diff: null, verdict: "manque" };
    });
    const points = result.reduce((sum, r) => sum + (r.verdict === "parfait" ? 2 : r.verdict === "bien" ? 1 : 0), 0);
    setRows({ result, percent: Math.round((points / (BEATS * 2)) * 100) });
    setPhase("result");
  };

  const startGame = () => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    clearTimers();
    setPhase("running");
    setRows(null);
    setActiveBeat(-1);

    const beatSec = 60 / tempo;
    const leadIn = 0.35;
    const startCtxTime = ctx.currentTime + leadIn;
    const startPerf = performance.now() + leadIn * 1000;

    expectedRef.current = Array.from({ length: BEATS }, (_, i) => startPerf + i * beatSec * 1000);
    tapsRef.current = [];

    for (let i = 0; i < BEATS; i++) {
      playClick(ctx, startCtxTime + i * beatSec, i % 4 === 0);
    }

    expectedRef.current.forEach((t, i) => {
      timersRef.current.push(setTimeout(() => setActiveBeat(i), Math.max(0, t - performance.now())));
    });
    timersRef.current.push(
      setTimeout(() => {
        setActiveBeat(-1);
        finishGame();
      }, expectedRef.current[BEATS - 1] - performance.now() + 700)
    );
  };

  const handleTap = () => {
    if (phase !== "running") return;
    tapsRef.current.push(performance.now());
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 80px" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#A89A87",
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={15} /> Tableau de bord
      </button>

      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1, color: "#F2C14E", margin: 0 }}>
        Phase 1 · Leçon 4
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 30, color: "#EDE7DD", margin: "6px 0 18px" }}>
        Rythme de base
      </h1>
      <p style={{ color: "#C9BFAE", fontSize: 15.5, lineHeight: 1.75, margin: "0 0 20px", maxWidth: 560 }}>
        En mesure à 4 temps, chaque valeur de note occupe une durée précise en temps. Une ronde dure toute la mesure,
        une blanche la moitié, une noire un temps, une croche un demi-temps.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          marginBottom: 32,
          background: "#1C1712",
          border: "1px solid #2E2620",
          borderRadius: 10,
          padding: 18,
        }}
      >
        {NOTE_VALUES.map((n) => (
          <div key={n.id} style={{ textAlign: "center" }}>
            <NoteSymbol type={n.id} />
            <p style={{ color: "#EDE7DD", fontSize: 13, margin: "6px 0 0" }}>{n.label}</p>
            <p style={{ color: "#7C7264", fontSize: 12, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
              {n.beats} temps
            </p>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 19, color: "#EDE7DD", margin: "0 0 6px" }}>
        Cale-toi sur le tempo
      </h2>
      <p style={{ color: "#7C7264", fontSize: 13.5, margin: "0 0 18px" }}>
        Le métronome joue 8 temps. Tape sur le cercle en rythme, le plus proche possible de chaque clic.
      </p>

      {phase !== "running" && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <span style={{ color: "#7C7264", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>60</span>
          <input
            type="range"
            min={60}
            max={140}
            step={1}
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ color: "#7C7264", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>140</span>
          <span
            style={{
              color: "#F2C14E",
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              minWidth: 62,
              textAlign: "right",
            }}
          >
            {tempo} bpm
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <button
          onClick={phase === "running" ? handleTap : startGame}
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            border: activeBeat >= 0 ? "3px solid #F2C14E" : "3px solid #2E2620",
            background: activeBeat >= 0 ? "#2C2310" : "#1C1712",
            color: "#EDE7DD",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 60ms, border-color 60ms",
          }}
        >
          {phase === "running" ? "Tape ici" : phase === "result" ? "Recommencer" : "Démarrer"}
        </button>

        {phase === "running" && (
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: BEATS }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: i <= activeBeat ? "#F2C14E" : "#2E2620",
                }}
              />
            ))}
          </div>
        )}

        {phase === "result" && rows && (
          <div style={{ width: "100%" }}>
            <p
              style={{
                textAlign: "center",
                fontFamily: "'Fraunces', serif",
                fontSize: 26,
                color: "#EDE7DD",
                margin: "0 0 4px",
              }}
            >
              {rows.percent} %
            </p>
            <p style={{ textAlign: "center", color: "#7C7264", fontSize: 13, margin: "0 0 18px" }}>
              {rows.percent >= 80
                ? "Excellent sens du tempo."
                : rows.percent >= 50
                ? "Bonne base, continue à t'exercer."
                : "Prends le temps d'écouter deux mesures avant de taper."}
            </p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {rows.result.map((r, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: r.verdict === "parfait" ? "#16261C" : r.verdict === "bien" ? "#241F12" : "#2A1414",
                    color: r.verdict === "parfait" ? "#9FC7AC" : r.verdict === "bien" ? "#E0C185" : "#E29C98",
                  }}
                >
                  {r.verdict === "manque" ? "—" : `${r.diff}ms`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Vue : Studio de composition (v1 — progressions d'accords) -------------------

function CompositionStudio({ onBack }) {
  const audioCtxRef = React.useRef(null);
  const [keyRoot, setKeyRoot] = useState(0); // Do
  const [mode, setMode] = useState("majeure");
  const [progression, setProgression] = useState([0, 4, 5, 3]);
  const [playingIdx, setPlayingIdx] = useState(-1);

  const getCtx = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  };

  const degrees = Array.from({ length: 7 }, (_, i) => degreeChord(keyRoot, mode, i));

  const addChord = (degreeIdx) => {
    if (progression.length >= 8) return;
    setProgression((p) => [...p, degreeIdx]);
  };
  const removeChord = (idx) => setProgression((p) => p.filter((_, i) => i !== idx));
  const clearAll = () => setProgression([]);

  const playChord = (chord, startTime, duration) => {
    const ctx = getCtx();
    chord.quality.formula.forEach((interval) => {
      const freq = freqForOffset(keyRoot, chord.rootOffset + interval);
      playTone(ctx, freq, startTime, duration);
    });
  };

  const playProgression = () => {
    if (progression.length === 0) return;
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    const chordDur = 0.85;
    const now = ctx.currentTime + 0.1;
    progression.forEach((degreeIdx, i) => {
      playChord(degrees[degreeIdx], now + i * chordDur, chordDur * 0.95);
      setTimeout(() => setPlayingIdx(i), i * chordDur * 1000);
    });
    setTimeout(() => setPlayingIdx(-1), progression.length * chordDur * 1000);
  };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 20px 80px" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#A89A87",
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={15} /> Tableau de bord
      </button>

      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1, color: "#F2C14E", margin: 0 }}>
        Studio de composition · v1
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 28, color: "#EDE7DD", margin: "6px 0 10px" }}>
        Construis une progression
      </h1>
      <p style={{ color: "#A89A87", fontSize: 14.5, margin: "0 0 26px", maxWidth: 560, lineHeight: 1.7 }}>
        Choisis une tonalité, puis empile les accords diatoniques pour composer une progression. C'est la première
        brique du studio complet — piano-roll, tablature et export arriveront ensuite.
      </p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <p style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 8px" }}>
            Tonalité
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 300 }}>
            {NOTES.map((n, i) => (
              <button
                key={n}
                onClick={() => setKeyRoot(i)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: i === keyRoot ? "1px solid #F2C14E" : "1px solid #2E2620",
                  background: i === keyRoot ? "#2C2310" : "#1C1712",
                  color: i === keyRoot ? "#F2C14E" : "#C9BFAE",
                  fontSize: 12.5,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 8px" }}>
            Mode
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {["majeure", "mineure"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: m === mode ? "1px solid #7FA98C" : "1px solid #2E2620",
                  background: m === mode ? "#16261C" : "#1C1712",
                  color: m === mode ? "#7FA98C" : "#C9BFAE",
                  fontSize: 12.5,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 8px" }}>
        Accords diatoniques — clique pour ajouter
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))", gap: 8, marginBottom: 26 }}>
        {degrees.map((chord, i) => (
          <button
            key={i}
            onClick={() => addChord(i)}
            style={{
              background: "#1C1712",
              border: "1px solid #2E2620",
              borderRadius: 8,
              padding: "10px 8px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, color: "#F2C14E", fontFamily: "'Fraunces', serif", fontSize: 16 }}>{chord.numeral}</p>
            <p style={{ margin: "2px 0 0", color: "#C9BFAE", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              {NOTES[chord.rootNoteIndex]}
              {chord.quality.id === "min" ? "m" : chord.quality.id === "dim" ? "°" : chord.quality.id === "aug" ? "+" : ""}
            </p>
          </button>
        ))}
      </div>

      <p style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 8px" }}>
        Suggestions
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
        {PROGRESSION_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setProgression(preset.degrees)}
            style={{
              background: "transparent",
              border: "1px solid #2E2620",
              borderRadius: 7,
              padding: "7px 12px",
              color: "#A89A87",
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#191410",
          border: "1px solid #2E2620",
          borderRadius: 10,
          padding: 18,
          minHeight: 90,
        }}
      >
        <p style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", margin: "0 0 12px" }}>
          Ta progression
        </p>
        {progression.length === 0 ? (
          <p style={{ color: "#5A5248", fontSize: 13.5, margin: 0 }}>
            Ajoute des accords ci-dessus, ou choisis une suggestion.
          </p>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {progression.map((degreeIdx, i) => {
              const chord = degrees[degreeIdx];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: playingIdx === i ? "#2C2310" : "#1C1712",
                    border: playingIdx === i ? "1px solid #F2C14E" : "1px solid #2E2620",
                    borderRadius: 7,
                    padding: "8px 10px",
                  }}
                >
                  <span style={{ color: "#F2C14E", fontFamily: "'Fraunces', serif", fontSize: 15 }}>{chord.numeral}</span>
                  <span style={{ color: "#7C7264", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    {NOTES[chord.rootNoteIndex]}
                  </span>
                  <button
                    onClick={() => removeChord(i)}
                    style={{ background: "none", border: "none", color: "#7C7264", cursor: "pointer", fontSize: 13, padding: 0 }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={playProgression}
            disabled={progression.length === 0}
            style={{
              background: "#F2C14E",
              color: "#3A2A05",
              border: "none",
              borderRadius: 8,
              padding: "9px 16px",
              fontWeight: 600,
              fontSize: 13.5,
              cursor: progression.length === 0 ? "default" : "pointer",
              opacity: progression.length === 0 ? 0.5 : 1,
            }}
          >
            Écouter la progression
          </button>
          <button
            onClick={clearAll}
            style={{
              background: "transparent",
              border: "1px solid #2E2620",
              color: "#A89A87",
              borderRadius: 8,
              padding: "9px 16px",
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            Effacer
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- App racine -------------------------------------------------------------------

export default function DiapasonApp() {
  const [view, setView] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: Home },
    { id: "fretboard", label: "Manche interactif", icon: Guitar },
    { id: "lesson", label: "Intervalles", icon: Music2 },
    { id: "chords", label: "Accords", icon: Sparkles },
    { id: "rhythm", label: "Rythme", icon: Clock },
    { id: "composition", label: "Composition", icon: Wand2 },
    { id: "ear", label: "Oreille", icon: Ear },
  ];

  return (
    <div style={{ background: "#14110F", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <div
        style={{
          borderBottom: "1px solid #2E2620",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 28,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "#F2C14E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Music2 size={15} color="#3A2A05" />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, color: "#EDE7DD" }}>Diapason</span>
        </div>
        <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 7,
                  border: "none",
                  background: active ? "#241C13" : "transparent",
                  color: active ? "#F2C14E" : "#A89A87",
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                <Icon size={15} /> {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {view === "dashboard" && (
        <Dashboard
          onOpenLesson={() => setView("lesson")}
          onOpenChords={() => setView("chords")}
          onOpenEarTraining={() => setView("ear")}
          onOpenRhythm={() => setView("rhythm")}
          onOpenComposition={() => setView("composition")}
        />
      )}
      {view === "fretboard" && <FretboardExplorer />}
      {view === "lesson" && <IntervalLesson onBack={() => setView("dashboard")} />}
      {view === "chords" && <ChordLesson onBack={() => setView("dashboard")} />}
      {view === "rhythm" && <RhythmLesson onBack={() => setView("dashboard")} />}
      {view === "composition" && <CompositionStudio onBack={() => setView("dashboard")} />}
      {view === "ear" && <EarTraining onBack={() => setView("dashboard")} />}
    </div>
  );
}
