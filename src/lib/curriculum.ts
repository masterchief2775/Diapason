export type LessonDef = {
  id: string;
  title: string;
  phase: 1 | 2 | 3 | 4;
  kind: "interactive" | "quiz" | "studio";
  summary: string;
  intro: string[];
};

export const PHASES = [
  { id: 1 as const, range: "0 → 20 %", title: "Fondations", titleEn: "Foundations" },
  { id: 2 as const, range: "20 → 45 %", title: "Harmonie et gammes", titleEn: "Harmony & scales" },
  { id: 3 as const, range: "45 → 75 %", title: "Maîtrise avancée", titleEn: "Advanced mastery" },
  { id: 4 as const, range: "75 → 100 %", title: "Composition et expertise", titleEn: "Composition & expertise" },
];

export const LESSONS: LessonDef[] = [
  {
    id: "notes",
    title: "Notes, octaves, nom des cordes",
    phase: 1,
    kind: "quiz",
    summary: "Les 12 notes et les six cordes à vide.",
    intro: [
      "La musique occidentale découpe l'octave en 12 demi-tons : Do, Do#, Ré, Ré#, Mi, Fa, Fa#, Sol, Sol#, La, La#, Si — puis on recommence une octave plus haut.",
      "Sur une guitare accordée en Mi standard, les cordes à vide (de la plus grave à la plus aiguë) sont Mi, La, Ré, Sol, Si, Mi. Chaque case monte d'un demi-ton.",
    ],
  },
  {
    id: "manche",
    title: "Le manche de la guitare",
    phase: 1,
    kind: "interactive",
    summary: "Repères, cases, et lecture du manche.",
    intro: [
      "Le manche est une grille : corde × case = une note. Les pastilles aux cases 3, 5, 7, 9 et 12 sont des balises visuelles.",
      "La case 12 est l'octave de la corde à vide. Clique les cases pour entendre et nommer chaque note.",
    ],
  },
  {
    id: "intervalles",
    title: "Les intervalles",
    phase: 1,
    kind: "interactive",
    summary: "Distance en demi-tons entre deux notes.",
    intro: [
      "Un intervalle mesure la distance entre deux notes, en demi-tons. Sur une seule corde, chaque case est un demi-ton.",
      "Cette logique construit ensuite les gammes et les accords : une gamme majeure n'est qu'une suite précise d'intervalles.",
    ],
  },
  {
    id: "rythme",
    title: "Rythme de base et lecture rythmique",
    phase: 1,
    kind: "interactive",
    summary: "Valeurs de notes et sens du tempo.",
    intro: [
      "En mesure à 4 temps, la ronde dure 4 temps, la blanche 2, la noire 1, la croche ½.",
      "Avant de jouer des figures, on apprend à coller chaque temps du métronome.",
    ],
  },
  {
    id: "gamme-maj",
    title: "Première gamme majeure et accords",
    phase: 1,
    kind: "interactive",
    summary: "Do majeur, degrés, triades I IV V.",
    intro: [
      "La gamme majeure suit le schéma T–T–½–T–T–T–½ (tons et demi-tons).",
      "En Do : Do Ré Mi Fa Sol La Si. Les accords I, IV et V (Do, Fa, Sol) suffisent déjà à accompagner des centaines de chansons.",
    ],
  },
  {
    id: "accords",
    title: "Construction des accords",
    phase: 2,
    kind: "interactive",
    summary: "Triades majeure, mineure, diminuée, augmentée.",
    intro: [
      "Une triade empile fondamentale, tierce et quinte. Changer la tierce ou la quinte change toute la couleur.",
      "Majeur = 1 3 5, mineur = 1 ♭3 5, diminué = 1 ♭3 ♭5, augmenté = 1 3 ♯5.",
    ],
  },
  {
    id: "gammes",
    title: "Gammes majeures et mineures",
    phase: 2,
    kind: "interactive",
    summary: "Naturelle, harmonique, mélodique.",
    intro: [
      "La mineure naturelle est le mode éolien (relatif de la majeure, 3 demi-tons plus bas).",
      "La mineure harmonique hausse la 7e pour créer une dominante vraie. La mélodique hausse aussi la 6e à la montée.",
    ],
  },
  {
    id: "modes",
    title: "Modes de la gamme majeure",
    phase: 2,
    kind: "interactive",
    summary: "Ionien à locrien, couleur de chaque mode.",
    intro: [
      "Un mode, c'est la même collection de notes, mais une autre tonique. Do ionien et Ré dorien partagent les touches, pas le centre.",
      "Retiens la note caractéristique : lydien = ♯4, mixolydien = ♭7, dorien = 6 majeure, phrygien = ♭2.",
    ],
  },
  {
    id: "pentas",
    title: "Pentatoniques et blues",
    phase: 2,
    kind: "interactive",
    summary: "Cinq notes, blue note, positions.",
    intro: [
      "La pentatonique mineure (1 ♭3 4 5 ♭7) est le terrain de jeu du rock et du blues. Ajoute la ♭5 : tu as la gamme blues.",
      "La pentatonique majeure (1 2 3 5 6) est la même forme, décalée de trois cases — le relatif.",
    ],
  },
  {
    id: "cadences",
    title: "Cadences et progressions",
    phase: 2,
    kind: "interactive",
    summary: "V–I, IV–I, ii–V–I, clichés utiles.",
    intro: [
      "Une cadence conclut une phrase. La cadence parfaite V–I affirme la tonalité. La plagale IV–I est plus douce.",
      "Le ii–V–I est le moteur du jazz. Le I–V–vi–IV est celui de la pop.",
    ],
  },
  {
    id: "voicings",
    title: "Voicings guitare et renversements",
    phase: 2,
    kind: "interactive",
    summary: "CAGED, drop-2, basse qui change tout.",
    intro: [
      "Le même accord sonne différemment selon la corde de basse et l'octave : c'est le voicing.",
      "Le CAGED donne 5 formes mobiles. Les renversements changent la basse (fondamentale, tierce, quinte). Le drop-2 (jazz) descend la 2e voix d'une octave pour aérer.",
    ],
  },
  {
    id: "harmonie-fonc",
    title: "Harmonie fonctionnelle complète",
    phase: 3,
    kind: "quiz",
    summary: "Tonique, sous-dominante, dominante.",
    intro: [
      "Chaque degré a une fonction : tonique (I, vi, iii) = repos ; sous-dominante (IV, ii) = départ ; dominante (V, vii°) = tension.",
      "Composer, c'est doser tension et résolution. Substituer un accord par un autre de même fonction préserve le discours.",
    ],
  },
  {
    id: "modes-exo",
    title: "Modes et gammes exotiques",
    phase: 3,
    kind: "interactive",
    summary: "Par tons, diminuée, mineure harmonique.",
    intro: [
      "La gamme par tons (6 notes à distance de 1 ton) flotte, sans dominante. Debussy et le fusion l'utilisent pour le rêve ou la tension statique.",
      "La diminuée (alternance ½–1) et la mineure harmonique (seconde augmentée) colorent jazz et metal.",
    ],
  },
  {
    id: "reharmo",
    title: "Substitution et réharmonisation",
    phase: 3,
    kind: "interactive",
    summary: "Triton, relatifs, passage chromatique.",
    intro: [
      "La substitution de triton remplace V7 par un 7 situé un triton plus loin : Sol7 ↔ Ré♭7. Les 3e et 7e s'échangent.",
      "On peut aussi remplacer I par vi, IV par ii, ou glisser chromatiquement vers la cible.",
    ],
  },
  {
    id: "analyse",
    title: "Analyse harmonique de morceaux",
    phase: 3,
    kind: "interactive",
    summary: "Grilles célèbres décortiquées pas à pas.",
    intro: [
      "Analyser, c'est nommer chaque accord par son degré dans la tonalité, puis voir les cadences et les emprunts.",
      "En Do majeur, Am = vi, F = IV, G = V, C = I. La grille vi–IV–I–V est une rotation du I–V–vi–IV.",
    ],
  },
  {
    id: "secondaires",
    title: "Dominantes secondaires et échange modal",
    phase: 3,
    kind: "interactive",
    summary: "V/V, V/vi et accords empruntés au mineur.",
    intro: [
      "Une dominante secondaire est l'accord V d'un autre degré que I : en Do, A7 est le V de Dm (V/ii). Elle amène un chromatisme qui tire vers sa cible.",
      "L'échange modal emprunte au mode parallèle : en Do majeur, Fm (iv) ou B♭ (VII) viennent de Do mineur et colorent sans quitter la tonalité.",
    ],
  },
  {
    id: "voix",
    title: "Conduite des voix",
    phase: 3,
    kind: "interactive",
    summary: "Mouvements minimaux, quintes à éviter.",
    intro: [
      "Bien enchaîner deux accords, c'est bouger chaque voix le moins possible : les notes communes restent, les autres glissent d'un demi-ton ou d'un ton.",
      "On évite les quintes et octaves parallèles (même intervalle qui se déplace) et on fait résoudre la sensible (+1 demi-ton) vers la tonique.",
    ],
  },
  {
    id: "metriques",
    title: "Métriques impaires et polyrythmie",
    phase: 3,
    kind: "interactive",
    summary: "5/4, 7/8, 3 contre 2.",
    intro: [
      "Une métrique impaire se compte par groupes : 7/8 = 2+2+3 ou 3+2+2. Compter à voix haute ancre le groove.",
      "La polyrythmie 3:2 superpose 3 temps là où l'autre joue 2 (ex. triolet contre croches). Le point de rencontre recale tout.",
    ],
  },
  {
    id: "melodie",
    title: "Composition mélodique",
    phase: 4,
    kind: "studio",
    summary: "Contour, notes cibles, tension.",
    intro: [
      "Une mélodie forte vise les notes de l'accord sur les temps forts, et utilise les notes de passage ou d'approche ailleurs.",
      "Varie le rythme : une phrase qui ne fait que des noires s'essouffle. Laisse des silences.",
    ],
  },
  {
    id: "structure",
    title: "Structure de chanson",
    phase: 4,
    kind: "quiz",
    summary: "Couplet, refrain, pont, breakdown.",
    intro: [
      "Le couplet raconte, le refrain résume (même paroles, harmonie plus ouverte), le pont contraste (nouveau degré, nouveau mode).",
      "Un schéma classique : intro – couplet – refrain – couplet – refrain – pont – refrain – coda.",
    ],
  },
  {
    id: "genres",
    title: "Composition par genres",
    phase: 4,
    kind: "studio",
    summary: "Codes rock, blues, jazz, metal, pop, funk.",
    intro: [
      "Chaque genre a des progressions, des gammes et un groove. Les connaître, c'est parler la langue avant d'inventer un dialecte.",
      "Choisis un genre, écoute sa grille type, puis compose ta variante dans le studio.",
    ],
  },
  {
    id: "projet",
    title: "Projet final",
    phase: 4,
    kind: "studio",
    summary: "Un morceau complet : grille, mélodie, genre.",
    intro: [
      "Tu rassembles tout : tonalité, progression, mélodie, structure mentale (couplet/refrain), et tu enregistres le résultat dans le carnet.",
      "Le but n'est pas la perfection — c'est de terminer un morceau cohérent que tu peux rejouer et modifier.",
    ],
  },
];

export const LESSON_ORDER = LESSONS.map((l) => l.id);

export function lessonById(id: string) {
  return LESSONS.find((l) => l.id === id);
}

export function lessonsForPhase(phase: number) {
  return LESSONS.filter((l) => l.phase === phase);
}

export type Mcq = { q: string; options: string[]; answer: number; explain: string };

export const QUIZZES: Record<string, Mcq[]> = {
  notes: [
    {
      q: "Combien de notes distinctes dans une octave (tempérament égal) ?",
      options: ["7", "8", "12", "24"],
      answer: 2,
      explain: "12 demi-tons : les 7 notes naturelles plus 5 altérations.",
    },
    {
      q: "La 5e corde à vide (en partant du grave) s'appelle…",
      options: ["Mi", "La", "Ré", "Sol"],
      answer: 1,
      explain: "Cordes à vide : 6 Mi, 5 La, 4 Ré, 3 Sol, 2 Si, 1 Mi.",
    },
    {
      q: "Deux cases sur la même corde, c'est…",
      options: ["un ton", "un demi-ton", "une tierce", "une octave"],
      answer: 1,
      explain: "Chaque case = un demi-ton. Deux cases = un ton.",
    },
    {
      q: "La case 12 d'une corde à vide donne…",
      options: ["la quinte", "la même note une octave au-dessus", "la tierce", "un Si"],
      answer: 1,
      explain: "12 demi-tons = une octave.",
    },
  ],
  "harmonie-fonc": [
    {
      q: "Quelle fonction a le V ?",
      options: ["Tonique", "Sous-dominante", "Dominante", "Pédale"],
      answer: 2,
      explain: "Le V (et le vii°) crée la tension qui veut résoudre sur I.",
    },
    {
      q: "Quel accord peut remplacer le I tout en gardant une fonction tonique ?",
      options: ["V", "IV", "vi", "ii"],
      answer: 2,
      explain: "vi (et iii) partagent assez de notes avec I pour rester toniques.",
    },
    {
      q: "ii et IV sont surtout…",
      options: ["dominants", "sous-dominants", "toniques", "modals"],
      answer: 1,
      explain: "Ils préparent la dominante : départ, pas encore tension maximale.",
    },
    {
      q: "Une cadence parfaite, c'est…",
      options: ["IV–I", "V–I", "ii–IV", "vi–I"],
      answer: 1,
      explain: "V–I, de préférence avec la fondamentale à la basse des deux accords.",
    },
  ],
  analyse: [
    {
      q: "En Sol majeur, Em est le degré…",
      options: ["ii", "iii", "vi", "IV"],
      answer: 2,
      explain: "Sol La Si Do Ré Mi Fa#. Em = vi.",
    },
    {
      q: "Am – F – C – G en Do majeur, c'est…",
      options: ["I–V–vi–IV", "vi–IV–I–V", "ii–V–I–IV", "I–vi–IV–V"],
      answer: 1,
      explain: "Am=vi, F=IV, C=I, G=V.",
    },
    {
      q: "Dans un ii–V–I en Fa, le ii est…",
      options: ["Sol m", "Si♭", "Do7", "Ré m"],
      answer: 0,
      explain: "Fa majeur : ii = Sol mineur (Gm).",
    },
    {
      q: "Un accord hors gamme juste avant le V est souvent…",
      options: ["une pédale", "un emprunt / une dominante secondaire", "un cluster", "un mode"],
      answer: 1,
      explain: "V/V (la dominante de la dominante) est l'emprunt le plus courant.",
    },
  ],
  secondaires: [
    {
      q: "En Do majeur, A7 placé avant Dm est…",
      options: ["le V/V", "le V/ii", "le ii/V", "un iv"],
      answer: 1,
      explain: "A7 est l'accord V du ii (Dm) : noté V/ii, il résout sur Dm.",
    },
    {
      q: "Une dominante secondaire contient presque toujours…",
      options: ["une 9e", "une sensible chromatique (tierce majeure hors gamme)", "une pédale", "un cluster"],
      answer: 1,
      explain: "Sa tierce majeure est la sensible de sa cible — le chromatisme qui tire.",
    },
    {
      q: "En Do majeur, Fm emprunté au mineur se note…",
      options: ["IV", "iv", "VI", "ii°"],
      answer: 1,
      explain: "Minuscule = mineur : iv emprunté à Do mineur (échange modal).",
    },
    {
      q: "V/vi en Do majeur, c'est…",
      options: ["G7", "E7", "A7", "B7"],
      answer: 1,
      explain: "Le vi est Am : son V est E7, qui résout sur Am.",
    },
  ],
  voix: [
    {
      q: "La règle d'or de la conduite des voix :",
      options: ["tout bouger en blocs", "mouvement minimal, notes communes tenues", "toujours monter", "doubler la sensible"],
      answer: 1,
      explain: "On garde les notes communes, le reste glisse au plus court.",
    },
    {
      q: "À éviter entre deux accords :",
      options: ["les tierces parallèles", "les quintes et octaves parallèles", "les mouvements contraires", "les notes communes"],
      answer: 1,
      explain: "Quintes/octaves parallèles = deux voix qui fusionnent, effet creux.",
    },
    {
      q: "La sensible (7e degré) doit…",
      options: ["descendre d'un ton", "monter d'un demi-ton vers la tonique", "sauter à la quinte", "rester sur place"],
      answer: 1,
      explain: "La sensible attire la tonique à un demi-ton au-dessus.",
    },
    {
      q: "Deux accords partagent 2 notes sur 3 : idéalement…",
      options: ["on rejoue tout ailleurs", "on garde les 2 communes, on bouge la 3e au plus près", "on change de tonalité", "on ajoute une 7e"],
      answer: 1,
      explain: "C'est la conduite la plus lisse et la plus chantante.",
    },
  ],
  metriques: [
    {
      q: "7/8 se compte par exemple…",
      options: ["4+3", "2+2+3", "3+3+1", "5+2"],
      answer: 1,
      explain: "Groupes asymétriques : 2+2+3 (ou 3+2+2). Total 7 croches.",
    },
    {
      q: "5/4, c'est…",
      options: ["5 temps par mesure", "5 croches par mesure", "un tempo", "un triolet"],
      answer: 0,
      explain: "5 temps (noires) par mesure, ex. 3+2 (Take Five).",
    },
    {
      q: "Un 3:2, c'est…",
      options: ["3 mesures pour 2", "3 notes dans le temps de 2", "un accord de 3 sons", "3 temps forts"],
      answer: 1,
      explain: "Triolet contre du binaire : 3 attaques là où l'autre en joue 2.",
    },
    {
      q: "Pour verrouiller une métrique impaire, le mieux est…",
      options: ["jouer plus fort", "compter les groupes à voix haute", "ignorer la basse", "accélérer"],
      answer: 1,
      explain: "« 1-2, 1-2, 1-2-3 » ancre le cycle dans le corps.",
    },
  ],
  "modes-exo": [
    {
      q: "La gamme par tons contient…",
      options: ["5 notes", "6 notes à 1 ton d'écart", "7 notes", "12 notes"],
      answer: 1,
      explain: "6 tons entiers = une octave. Aucun demi-ton, aucune dominante.",
    },
    {
      q: "La couleur typique de la mineure harmonique vient de…",
      options: ["la 6e majeure", "la seconde augmentée (♭6–7)", "la 9e", "la quarte"],
      answer: 1,
      explain: "L'intervalle ♭6–7 majeure (1,5 ton) donne la couleur orientale/metal.",
    },
    {
      q: "La diminuée alterne…",
      options: ["tons et tons", "demi-tons et tons", "tierces", "quartes"],
      answer: 1,
      explain: "½–1–½–1… : 8 notes, symétrique, passe-partout sur les dominantes.",
    },
    {
      q: "Sur un G7 qui résout en Do, la diminuée utile démarre…",
      options: ["sur Sol", "un demi-ton au-dessus (A♭)", "sur Do", "sur Mi"],
      answer: 1,
      explain: "La ½–1 issue de la fondamentale altérée glisse vers la tonique.",
    },
  ],
  reharmo: [
    {
      q: "Substituer G7 par D♭7, c'est…",
      options: ["une substitution diatonique", "une substitution triton", "un emprunt modal", "une pédale"],
      answer: 1,
      explain: "Un triton d'écart : les 3e/7e s'échangent, la résolution reste.",
    },
    {
      q: "Le triton de G–B (3e et 7e de G7) se retrouve dans D♭7 comme…",
      options: ["fondamentale et 5e", "7e et 3e (F–B)", "9e et 13e", "il disparaît"],
      answer: 1,
      explain: "F (7e de G7) devient 3e de D♭7, B (3e) devient 7e : même tension.",
    },
    {
      q: "Remplacer Cmaj7 par Am7, c'est…",
      options: ["une substitution de même fonction (tonique)", "un changement de tonalité", "une cadence", "une erreur"],
      answer: 0,
      explain: "Am7 partage C–E–G avec Cmaj7 : fonction tonique préservée.",
    },
    {
      q: "Avant un ii–V–I en Do, insérer E7–A7 donne…",
      options: ["une boucle", "une chaîne de dominantes secondaires (V/vi–V/ii)", "un pont", "un ostinato"],
      answer: 1,
      explain: "Chaque dominante amène la suivante : E7→Am (V/vi), A7→Dm (V/ii).",
    },
  ],
  structure: [
    {
      q: "Le refrain se distingue surtout par…",
      options: ["des paroles toujours nouvelles", "un crochet mémorable et une harmonie plus ouverte", "un solo", "le silence"],
      answer: 1,
      explain: "Même texte, pic émotionnel, souvent I plus présent.",
    },
    {
      q: "Le pont sert à…",
      options: ["répéter le couplet", "contraster avant le dernier refrain", "accorder la guitare", "finir le morceau"],
      answer: 1,
      explain: "Nouveau matériau pour relancer l'écoute.",
    },
    {
      q: "Un breakdown, surtout en metal/rock, c'est…",
      options: ["un solo jazz", "une section épurée, souvent plus lourde et rythmique", "un pont vocal", "une intro acoustique"],
      answer: 1,
      explain: "Texture réduite, groove appuyé.",
    },
    {
      q: "Schéma pop le plus courant ?",
      options: ["A–B–C–D sans retour", "couplet–refrain–couplet–refrain–pont–refrain", "12 mesures blues uniquement", "thème et variations baroques"],
      answer: 1,
      explain: "La forme verse/chorus avec bridge reste le standard.",
    },
  ],
  "gamme-maj": [
    {
      q: "Le schéma de la gamme majeure, c'est…",
      options: ["T–T–½–T–T–T–½", "T–½–T–T–½–T–T", "½–T–T–T–T–T–½", "T–T–T–½–T–T–½"],
      answer: 0,
      explain: "Deux tons, un demi, trois tons, un demi. En Do : Do Ré Mi Fa Sol La Si.",
    },
    {
      q: "En Sol majeur, le 7e degré est…",
      options: ["Fa", "Fa#", "Sol", "Mi"],
      answer: 1,
      explain: "Sol La Si Do Ré Mi Fa# : la sensible est à un demi-ton de la tonique.",
    },
    {
      q: "Les triades I, IV, V en majeur sont…",
      options: ["toutes mineures", "I majeur, IV et V mineurs", "toutes majeures", "toutes diminuées"],
      answer: 2,
      explain: "I, IV et V sont majeurs : ils portent à eux seuls des centaines de chansons.",
    },
    {
      q: "Un ton, c'est…",
      options: ["1 case", "2 cases", "3 cases", "4 cases"],
      answer: 1,
      explain: "Un ton = 2 demi-tons = 2 cases sur une corde.",
    },
  ],
  gammes: [
    {
      q: "La mineure naturelle, c'est le mode…",
      options: ["dorien", "éolien", "phrygien", "locrien"],
      answer: 1,
      explain: "L'éolien (6e mode) : 1 2 ♭3 4 5 ♭6 ♭7.",
    },
    {
      q: "La mineure harmonique hausse…",
      options: ["la 6e", "la 7e", "la 3e", "la 2e"],
      answer: 1,
      explain: "La 7e haussée crée une vraie dominante (V majeur) et la seconde augmentée typique.",
    },
    {
      q: "La mineure mélodique (montante) hausse…",
      options: ["la 6e et la 7e", "la 2e et la 4e", "la 3e", "rien"],
      answer: 0,
      explain: "6e et 7e majeures à la montée, retour naturel à la descente (classique).",
    },
    {
      q: "Le relatif mineur de Do majeur est…",
      options: ["La mineur", "Mi mineur", "Ré mineur", "Sol mineur"],
      answer: 0,
      explain: "3 demi-tons plus bas (ou 6e degré) : La.",
    },
  ],
  modes: [
    {
      q: "Le dorien, c'est un mineur avec…",
      options: ["♭2", "6 majeure", "♯4", "♭7 majeure"],
      answer: 1,
      explain: "1 2 ♭3 4 5 6 ♭7 : la 6 majeure fait toute la couleur jazzy.",
    },
    {
      q: "La note caractéristique du lydien est…",
      options: ["la ♭7", "la ♯4", "la ♭2", "la 6 mineure"],
      answer: 1,
      explain: "1 2 3 ♯4 5 6 7 : la quarte augmentée rêveuse.",
    },
    {
      q: "Le mixolydien convient sur…",
      options: ["un accord maj7", "un accord 7 (dominant)", "un accord m7♭5", "un diminué"],
      answer: 1,
      explain: "1 2 3 4 5 6 ♭7 : la couleur du blues et de la funk.",
    },
    {
      q: "Phrygien = mineur avec…",
      options: ["♭2", "♯4", "6 majeure", "7 majeure"],
      answer: 0,
      explain: "La seconde mineure donne la couleur sombre/flamenco.",
    },
  ],
  pentas: [
    {
      q: "La pentatonique mineure, c'est…",
      options: ["1 2 3 5 6", "1 ♭3 4 5 ♭7", "1 3 5 7 9", "1 ♭2 4 5 ♭6"],
      answer: 1,
      explain: "Cinq notes sans demi-ton : le terrain de jeu du rock.",
    },
    {
      q: "La gamme blues ajoute à la penta mineure…",
      options: ["la 9e", "la ♭5", "la 6 majeure", "la 7 majeure"],
      answer: 1,
      explain: "La blue note ♭5 entre 4 et 5.",
    },
    {
      q: "La pentatonique majeure et sa relative mineure sont décalées de…",
      options: ["1 case", "2 cases", "3 cases", "5 cases"],
      answer: 2,
      explain: "Comme majeur/relatif : 3 demi-tons (ex. Do maj ↔ La min).",
    },
    {
      q: "Sur un blues en La, la penta de base est…",
      options: ["La majeur", "La mineure / blues", "Fa# mineure", "Do lydien"],
      answer: 1,
      explain: "La penta mineure de La + blue note, sur les 12 mesures.",
    },
  ],
  cadences: [
    {
      q: "La cadence parfaite, c'est…",
      options: ["IV–I", "V–I", "ii–IV", "vi–iii"],
      answer: 1,
      explain: "Dominante → tonique, point final le plus net.",
    },
    {
      q: "La cadence plagale (Amen), c'est…",
      options: ["V–I", "IV–I", "ii–V", "iii–vi"],
      answer: 1,
      explain: "Sous-dominante → tonique, conclusion douce.",
    },
    {
      q: "La cadence rompue surprend avec…",
      options: ["V–vi", "V–I", "IV–V", "I–IV"],
      answer: 0,
      explain: "La résolution attendue sur I est détournée vers vi.",
    },
    {
      q: "Le ii–V–I est…",
      options: ["une boucle pop", "le moteur du jazz", "un riff metal", "une gamme"],
      answer: 1,
      explain: "Sous-dominante mineure → dominante → tonique.",
    },
  ],
  voicings: [
    {
      q: "Un 1er renversement met à la basse…",
      options: ["la fondamentale", "la tierce", "la quinte", "la 7e"],
      answer: 1,
      explain: "3 – 5 – 1 : la tierce chante à la basse.",
    },
    {
      q: "Le CAGED propose…",
      options: ["4 gammes", "5 formes d'accords mobiles", "7 modes", "12 arpèges"],
      answer: 1,
      explain: "C, A, G, E, D : cinq gabarits qui couvrent tout le manche.",
    },
    {
      q: "Un drop-2, c'est…",
      options: ["sauter 2 cordes", "descendre la 2e voix d'une octave", "jouer 2 fois plus vite", "accorder 2 tons plus bas"],
      answer: 1,
      explain: "Technique jazz : on aère un accord fermé en descendant la 2e voix.",
    },
    {
      q: "Changer seulement la basse d'un Do majeur (Mi à la basse) donne…",
      options: ["le même son, rien ne change", "C/E, 1er renversement, couleur plus douce", "un accord diminué", "un autre accord"],
      answer: 1,
      explain: "Mêmes notes, basse différente : la conduite des voix change tout.",
    },
  ],
};

export const DIAGNOSTIC: Mcq[] = [
  {
    q: "Tu sais nommer les 6 cordes à vide ?",
    options: ["Oui, sans hésiter", "À peu près", "Non, pas encore"],
    answer: 0,
    explain: "Mi La Ré Sol Si Mi (du grave à l'aigu).",
  },
  {
    q: "Combien de demi-tons dans une octave ?",
    options: ["7", "8", "12"],
    answer: 2,
    explain: "12 cases = 12 demi-tons.",
  },
  {
    q: "Un accord majeur, c'est…",
    options: ["1 – ♭3 – 5", "1 – 3 – 5", "1 – 3 – ♯5"],
    answer: 1,
    explain: "Fondamentale, tierce majeure, quinte juste.",
  },
  {
    q: "La cadence V–I s'appelle…",
    options: ["plagale", "parfaite", "rompue"],
    answer: 1,
    explain: "La résolution la plus nette.",
  },
  {
    q: "Le ii–V–I appartient surtout au…",
    options: ["metal", "jazz", "flamenco"],
    answer: 1,
    explain: "Le moteur harmonique du jazz.",
  },
  {
    q: "Tu as déjà composé une grille complète ?",
    options: ["Oui, plusieurs", "Une esquisse", "Jamais"],
    answer: 0,
    explain: "Le studio et le carnet sont faits pour ça.",
  },
];

export type ExamDef = { id: string; title: string; titleEn: string; range: string; rangeEn: string; questions: Mcq[]; unlockAt: number };

const EXAM_SOURCES: Record<string, [string, string]> = {
  "exam-fondations": ["notes", "gamme-maj"],
  "exam-harmonie": ["cadences", "voicings"],
  "exam-expert": ["harmonie-fonc", "analyse"],
};

/** Questions d'examen dans la langue demandée (mêmes coupes que la version FR). */
export function examQuestions(lang: Lang, examId: string): Mcq[] {
  const [a, b] = EXAM_SOURCES[examId] ?? ["notes", "notes"];
  if (lang !== "en") return [...QUIZZES[a], ...QUIZZES[b]].slice(0, 6);
  return [...quizFor("en", a), ...quizFor("en", b)].slice(0, 6);
}

export const EXAMS: ExamDef[] = [
  {
    id: "exam-fondations",
    title: "Examen Fondations (0 → 20 %)",
    titleEn: "Foundations exam (0 → 20%)",
    range: "Après la leçon « Première gamme majeure »",
    rangeEn: "After “First major scale”",
    questions: [...QUIZZES["notes"], ...QUIZZES["gamme-maj"]].slice(0, 6),
    unlockAt: 4,
  },
  {
    id: "exam-harmonie",
    title: "Examen Harmonie (20 → 45 %)",
    titleEn: "Harmony exam (20 → 45%)",
    range: "Après « Voicings et renversements »",
    rangeEn: "After “Voicings & inversions”",
    questions: [...QUIZZES["cadences"], ...QUIZZES["voicings"]].slice(0, 6),
    unlockAt: 10,
  },
  {
    id: "exam-expert",
    title: "Examen Expert (45 → 100 %)",
    titleEn: "Expert exam (45 → 100%)",
    range: "Après « Analyse harmonique »",
    rangeEn: "After “Harmonic analysis”",
    questions: [...QUIZZES["harmonie-fonc"], ...QUIZZES["analyse"]].slice(0, 6),
    unlockAt: 13,
  },
];

/* ================= Anglais (miroir) ================= */

import type { Lang } from "./i18n";

export type LessonText = { title: string; summary: string; intro: string[] };

const LESSON_EN: Record<string, LessonText> = {
  notes: {
    title: "Notes, octaves, string names",
    summary: "The 12 notes and the six open strings.",
    intro: [
      "Western music slices the octave into 12 semitones: C, C#, D, D#, E, F, F#, G, G#, A, A#, B — then it repeats an octave higher.",
      "On a standard-tuned guitar, the open strings (lowest to highest) are E, A, D, G, B, E. Each fret raises the pitch by one semitone.",
    ],
  },
  manche: {
    title: "The guitar neck",
    summary: "Markers, frets, and reading the neck.",
    intro: [
      "The neck is a grid: string × fret = one note. The dots at frets 3, 5, 7, 9 and 12 are visual landmarks.",
      "Fret 12 is the octave of the open string. Click frets to hear and name each note.",
    ],
  },
  intervalles: {
    title: "Intervals",
    summary: "Distance in semitones between two notes.",
    intro: [
      "An interval measures the distance between two notes, in semitones. On one string, each fret is one semitone.",
      "This logic then builds scales and chords: a major scale is just a precise stack of intervals.",
    ],
  },
  rythme: {
    title: "Basic rhythm & reading",
    summary: "Note values and sense of tempo.",
    intro: [
      "In 4/4, the whole note lasts 4 beats, the half note 2, the quarter 1, the eighth ½.",
      "Before playing patterns, learn to sit exactly on each metronome click.",
    ],
  },
  "gamme-maj": {
    title: "First major scale & chords",
    summary: "C major, degrees, I IV V triads.",
    intro: [
      "The major scale follows W–W–H–W–W–W–H (whole and half steps).",
      "In C: C D E F G A B. The I, IV and V chords (C, F, G) alone can accompany hundreds of songs.",
    ],
  },
  accords: {
    title: "Building chords",
    summary: "Major, minor, diminished, augmented triads.",
    intro: [
      "A triad stacks root, third and fifth. Changing the third or fifth changes the whole color.",
      "Major = 1 3 5, minor = 1 ♭3 5, diminished = 1 ♭3 ♭5, augmented = 1 3 ♯5.",
    ],
  },
  gammes: {
    title: "Major & minor scales",
    summary: "Natural, harmonic, melodic.",
    intro: [
      "Natural minor is the Aeolian mode (relative of major, 3 semitones lower).",
      "Harmonic minor raises the 7th for a true dominant. Melodic minor also raises the 6th going up.",
    ],
  },
  modes: {
    title: "Modes of the major scale",
    summary: "Ionian to Locrian, each mode's color.",
    intro: [
      "A mode is the same note collection with a different tonic. C Ionian and D Dorian share the notes, not the center.",
      "Remember the signature note: Lydian = ♯4, Mixolydian = ♭7, Dorian = major 6th, Phrygian = ♭2.",
    ],
  },
  pentas: {
    title: "Pentatonics & blues",
    summary: "Five notes, blue note, positions.",
    intro: [
      "The minor pentatonic (1 ♭3 4 5 ♭7) is the playground of rock and blues. Add the ♭5 and you get the blues scale.",
      "The major pentatonic (1 2 3 5 6) is the same shape, shifted by three frets — the relative.",
    ],
  },
  cadences: {
    title: "Cadences & progressions",
    summary: "V–I, IV–I, ii–V–I, useful clichés.",
    intro: [
      "A cadence closes a phrase. The perfect V–I states the key. The plagal IV–I is softer.",
      "The ii–V–I drives jazz. The I–V–vi–IV drives pop.",
    ],
  },
  voicings: {
    title: "Guitar voicings & inversions",
    summary: "CAGED, drop-2, the bass changes everything.",
    intro: [
      "The same chord sounds different depending on the bass string and octave: that's voicing.",
      "CAGED gives 5 movable shapes. Inversions change the bass (root, third, fifth). Drop-2 (jazz) lowers the 2nd voice an octave to open things up.",
    ],
  },
  "harmonie-fonc": {
    title: "Full functional harmony",
    summary: "Tonic, subdominant, dominant.",
    intro: [
      "Each degree has a function: tonic (I, vi, iii) = rest; subdominant (IV, ii) = departure; dominant (V, vii°) = tension.",
      "Composing means dosing tension and release. Substituting a chord with one of the same function keeps the discourse intact.",
    ],
  },
  "modes-exo": {
    title: "Exotic modes & scales",
    summary: "Whole-tone, diminished, harmonic minor.",
    intro: [
      "The whole-tone scale (6 notes a whole step apart) floats, with no dominant. Debussy and fusion use it for dreams or static tension.",
      "The diminished (alternating ½–1) and harmonic minor (augmented 2nd) color jazz and metal.",
    ],
  },
  reharmo: {
    title: "Substitution & reharmonization",
    summary: "Tritone, relatives, chromatic approach.",
    intro: [
      "Tritone substitution swaps V7 for a 7th chord a tritone away: G7 ↔ D♭7. The 3rds and 7ths trade places.",
      "You can also replace I with vi, IV with ii, or slide chromatically into the target.",
    ],
  },
  analyse: {
    title: "Harmonic analysis of songs",
    summary: "Famous progressions taken apart step by step.",
    intro: [
      "To analyze is to name each chord by its degree in the key, then spot cadences and borrowings.",
      "In C major, Am = vi, F = IV, G = V, C = I. The vi–IV–I–V loop is a rotation of I–V–vi–IV.",
    ],
  },
  secondaires: {
    title: "Secondary dominants & modal interchange",
    summary: "V/V, V/vi and minor-mode borrowings.",
    intro: [
      "A secondary dominant is the V of another degree than I: in C, A7 is the V of Dm (V/ii). Its chromaticism pulls toward its target.",
      "Modal interchange borrows from the parallel mode: in C major, Fm (iv) or B♭ (VII) come from C minor and color without leaving the key.",
    ],
  },
  voix: {
    title: "Voice leading",
    summary: "Minimal motion, parallels to avoid.",
    intro: [
      "Connecting two chords well means moving each voice as little as possible: common tones stay, others slide by a half or whole step.",
      "Avoid parallel fifths and octaves (same interval moving together) and resolve the leading tone up a half step to the tonic.",
    ],
  },
  metriques: {
    title: "Odd meters & polyrhythm",
    summary: "5/4, 7/8, 3 against 2.",
    intro: [
      "An odd meter counts in groups: 7/8 = 2+2+3 or 3+2+2. Counting out loud anchors the groove.",
      "3:2 polyrhythm stacks 3 beats where the other plays 2 (e.g. triplet over eighths). The meeting point resets everything.",
    ],
  },
  melodie: {
    title: "Melodic composition",
    summary: "Contour, target notes, tension.",
    intro: [
      "A strong melody lands on chord tones on strong beats, and uses passing or approach notes elsewhere.",
      "Vary the rhythm: a phrase of only quarter notes runs out of breath. Leave silences.",
    ],
  },
  structure: {
    title: "Song structure",
    summary: "Verse, chorus, bridge, breakdown.",
    intro: [
      "The verse tells, the chorus sums up (same lyrics, more open harmony), the bridge contrasts (new degree, new mode).",
      "A classic map: intro – verse – chorus – verse – chorus – bridge – chorus – outro.",
    ],
  },
  genres: {
    title: "Composition by genre",
    summary: "Rock, blues, jazz, metal, pop, funk codes.",
    intro: [
      "Each genre has progressions, scales and a groove. Knowing them means speaking the language before inventing a dialect.",
      "Pick a genre, hear its typical progression, then compose your variation in the studio.",
    ],
  },
  projet: {
    title: "Final project",
    summary: "A full song: progression, melody, genre.",
    intro: [
      "You bring it all together: key, progression, melody, song form in mind (verse/chorus), and save the result in the journal.",
      "The goal isn't perfection — it's finishing a coherent song you can replay and reshape.",
    ],
  },
};

export function lessonText(lang: Lang, lesson: LessonDef): LessonText {
  if (lang === "en") {
    const en = LESSON_EN[lesson.id];
    if (en) return en;
  }
  return { title: lesson.title, summary: lesson.summary, intro: lesson.intro };
}

export const DIAGNOSTIC_EN: Mcq[] = [
  { q: "Can you name the 6 open strings?", options: ["Yes, instantly", "Roughly", "Not yet"], answer: 0, explain: "E A D G B E (low to high)." },
  { q: "How many semitones in an octave?", options: ["7", "8", "12"], answer: 2, explain: "12 frets = 12 semitones." },
  { q: "A major chord is…", options: ["1 – ♭3 – 5", "1 – 3 – 5", "1 – 3 – ♯5"], answer: 1, explain: "Root, major third, perfect fifth." },
  { q: "The V–I cadence is called…", options: ["plagal", "perfect", "deceptive"], answer: 1, explain: "The cleanest resolution." },
  { q: "The ii–V–I belongs mostly to…", options: ["metal", "jazz", "flamenco"], answer: 1, explain: "The harmonic engine of jazz." },
  { q: "Have you composed a full progression?", options: ["Yes, several", "A sketch", "Never"], answer: 0, explain: "The studio and journal are made for that." },
];

function tr(q: Mcq, en: { q: string; options: string[]; explain: string }): Mcq {
  return { ...q, q: en.q, options: en.options, explain: en.explain };
}

/** Miroir anglais : même ordre d'options, mêmes réponses. */
export function quizFor(lang: Lang, id: string): Mcq[] {
  const base = QUIZZES[id];
  if (!base || lang !== "en") return base ?? [];
  const dict = QUIZZES_EN[id];
  if (!dict) return base;
  return base.map((q, i) => (dict[i] ? tr(q, dict[i]) : q));
}

type McqEn = { q: string; options: string[]; explain: string };

const QUIZZES_EN: Record<string, McqEn[]> = {
  notes: [
    { q: "How many distinct notes in an octave (equal temperament)?", options: ["7", "8", "12", "24"], explain: "12 semitones: 7 naturals plus 5 accidentals." },
    { q: "The 5th string open (from the low side) is…", options: ["E", "A", "D", "G"], explain: "Open strings: 6 E, 5 A, 4 D, 3 G, 2 B, 1 E." },
    { q: "Two frets on the same string is…", options: ["a half step", "a whole step", "a third", "an octave"], explain: "Each fret = one semitone. Two frets = one tone." },
    { q: "Fret 12 above an open string gives…", options: ["the fifth", "the same note one octave up", "the third", "a B"], explain: "12 semitones = one octave." },
  ],
  "gamme-maj": [
    { q: "The major scale pattern is…", options: ["W–W–H–W–W–W–H", "W–H–W–W–H–W–W", "H–W–W–W–W–W–H", "W–W–W–H–W–W–H"], explain: "Two wholes, a half, three wholes, a half. In C: C D E F G A B." },
    { q: "In G major, the 7th degree is…", options: ["F", "F#", "G", "E"], explain: "G A B C D E F#: the leading tone sits a half step below the tonic." },
    { q: "The I, IV, V triads in major are…", options: ["all minor", "I major, IV and V minor", "all major", "all diminished"], explain: "I, IV and V are major: they carry hundreds of songs alone." },
    { q: "One whole tone is…", options: ["1 fret", "2 frets", "3 frets", "4 frets"], explain: "One tone = 2 semitones = 2 frets on one string." },
  ],
  gammes: [
    { q: "Natural minor is the … mode", options: ["Dorian", "Aeolian", "Phrygian", "Locrian"], explain: "Aeolian (6th mode): 1 2 ♭3 4 5 ♭6 ♭7." },
    { q: "Harmonic minor raises…", options: ["the 6th", "the 7th", "the 3rd", "the 2nd"], explain: "The raised 7th creates a true dominant (major V) and the signature augmented 2nd." },
    { q: "Melodic minor (ascending) raises…", options: ["the 6th and 7th", "the 2nd and 4th", "the 3rd", "nothing"], explain: "Major 6th and 7th going up, natural coming down (classical)." },
    { q: "The relative minor of C major is…", options: ["A minor", "E minor", "D minor", "G minor"], explain: "3 semitones down (or 6th degree): A." },
  ],
  modes: [
    { q: "Dorian is a minor with…", options: ["♭2", "major 6th", "♯4", "major ♭7"], explain: "1 2 ♭3 4 5 6 ♭7: the major 6th is the whole jazzy color." },
    { q: "The Lydian signature note is…", options: ["♭7", "♯4", "♭2", "minor 6th"], explain: "1 2 3 ♯4 5 6 7: the dreamy augmented 4th." },
    { q: "Mixolydian fits over…", options: ["a maj7 chord", "a 7th (dominant) chord", "a m7♭5 chord", "a diminished chord"], explain: "1 2 3 4 5 6 ♭7: the blues and funk color." },
    { q: "Phrygian = minor with…", options: ["♭2", "♯4", "major 6th", "major 7th"], explain: "The minor 2nd gives the dark/flamenco color." },
  ],
  pentas: [
    { q: "The minor pentatonic is…", options: ["1 2 3 5 6", "1 ♭3 4 5 ♭7", "1 3 5 7 9", "1 ♭2 4 5 ♭6"], explain: "Five notes with no semitone: rock's playground." },
    { q: "The blues scale adds to minor pentatonic…", options: ["the 9th", "the ♭5", "the major 6th", "the major 7th"], explain: "The blue note ♭5 between 4 and 5." },
    { q: "Major pentatonic and its relative minor are offset by…", options: ["1 fret", "2 frets", "3 frets", "5 frets"], explain: "Like major/relative: 3 semitones (e.g. C maj ↔ A min)." },
    { q: "Over an A blues, the home pentatonic is…", options: ["A major", "A minor / blues", "F# minor", "C Lydian"], explain: "A minor pentatonic + blue note, across the 12 bars." },
  ],
  cadences: [
    { q: "The perfect cadence is…", options: ["IV–I", "V–I", "ii–IV", "vi–iii"], explain: "Dominant → tonic, the firmest full stop." },
    { q: "The plagal (Amen) cadence is…", options: ["V–I", "IV–I", "ii–V", "iii–vi"], explain: "Subdominant → tonic, soft landing." },
    { q: "The deceptive cadence surprises with…", options: ["V–vi", "V–I", "IV–V", "I–IV"], explain: "The expected I is sidestepped to vi." },
    { q: "The ii–V–I is…", options: ["a pop loop", "the engine of jazz", "a metal riff", "a scale"], explain: "Minor subdominant → dominant → tonic." },
  ],
  voicings: [
    { q: "First inversion puts in the bass…", options: ["the root", "the third", "the fifth", "the 7th"], explain: "3 – 5 – 1: the third sings in the bass." },
    { q: "CAGED offers…", options: ["4 scales", "5 movable chord shapes", "7 modes", "12 arpeggios"], explain: "C, A, G, E, D: five templates covering the neck." },
    { q: "A drop-2 is…", options: ["skipping 2 strings", "lowering the 2nd voice an octave", "playing twice as fast", "tuning 2 steps down"], explain: "Jazz technique: open a close chord by dropping its 2nd voice." },
    { q: "Changing only the bass of C major (E in the bass) gives…", options: ["the same sound, nothing changes", "C/E, 1st inversion, softer color", "a diminished chord", "another chord"], explain: "Same notes, different bass: voice leading changes everything." },
  ],
  "harmonie-fonc": [
    { q: "What function is V?", options: ["Tonic", "Subdominant", "Dominant", "Pedal"], explain: "V (and vii°) builds the tension that wants I." },
    { q: "Which chord can replace I keeping a tonic function?", options: ["V", "IV", "vi", "ii"], explain: "vi (and iii) share enough notes with I to stay tonic." },
    { q: "ii and IV are mostly…", options: ["dominant", "subdominant", "tonic", "modal"], explain: "They prepare the dominant: departure, not yet peak tension." },
    { q: "A perfect cadence is…", options: ["IV–I", "V–I", "ii–IV", "vi–I"], explain: "V–I, ideally with the root in both basses." },
  ],
  analyse: [
    { q: "In G major, Em is the … degree", options: ["ii", "iii", "vi", "IV"], explain: "G A B C D E F#. Em = vi." },
    { q: "Am – F – C – G in C major is…", options: ["I–V–vi–IV", "vi–IV–I–V", "ii–V–I–IV", "I–vi–IV–V"], explain: "Am=vi, F=IV, C=I, G=V." },
    { q: "In a ii–V–I in F, the ii is…", options: ["Gm", "B♭", "C7", "Dm"], explain: "F major: ii = G minor (Gm)." },
    { q: "A foreign chord just before V is often…", options: ["a pedal", "a borrowing / secondary dominant", "a cluster", "a mode"], explain: "V/V (the dominant of the dominant) is the most common borrowing." },
  ],
  secondaires: [
    { q: "In C major, A7 placed before Dm is…", options: ["V/V", "V/ii", "ii/V", "iv"], explain: "A7 is the V of ii (Dm): labeled V/ii, resolving to Dm." },
    { q: "A secondary dominant almost always contains…", options: ["a 9th", "a chromatic leading tone (major 3rd off-key)", "a pedal", "a cluster"], explain: "Its major 3rd is its target's leading tone — the pulling chromaticism." },
    { q: "In C major, Fm borrowed from minor is written…", options: ["IV", "iv", "VI", "ii°"], explain: "Lowercase = minor: iv borrowed from C minor (modal interchange)." },
    { q: "V/vi in C major is…", options: ["G7", "E7", "A7", "B7"], explain: "vi is Am: its V is E7, resolving to Am." },
  ],
  voix: [
    { q: "The golden rule of voice leading:", options: ["move everything in blocks", "minimal motion, hold common tones", "always go up", "double the leading tone"], explain: "Keep common tones, slide the rest the short way." },
    { q: "Avoid between two chords:", options: ["parallel thirds", "parallel fifths and octaves", "contrary motion", "common tones"], explain: "Parallel 5ths/8ves fuse two voices — hollow effect." },
    { q: "The leading tone (7th degree) should…", options: ["step down a tone", "rise a half step to the tonic", "leap to the fifth", "stay put"], explain: "The leading tone pulls to the tonic a half step above." },
    { q: "Two chords share 2 of 3 notes: ideally…", options: ["replay everything elsewhere", "keep the 2 shared, move the 3rd nearby", "change key", "add a 7th"], explain: "The smoothest, most singable connection." },
  ],
  metriques: [
    { q: "7/8 counts for instance…", options: ["4+3", "2+2+3", "3+3+1", "5+2"], explain: "Lopsided groups: 2+2+3 (or 3+2+2). 7 eighths total." },
    { q: "5/4 means…", options: ["5 beats per bar", "5 eighths per bar", "a tempo", "a triplet"], explain: "5 (quarter) beats per bar, e.g. 3+2 (Take Five)." },
    { q: "A 3:2 is…", options: ["3 bars for 2", "3 notes in the time of 2", "a 3-note chord", "3 downbeats"], explain: "Triplet over duple: 3 attacks where the other plays 2." },
    { q: "To lock an odd meter, best to…", options: ["play louder", "count the groups out loud", "ignore the bass", "speed up"], explain: "'1-2, 1-2, 1-2-3' anchors the cycle in the body." },
  ],
  "modes-exo": [
    { q: "The whole-tone scale holds…", options: ["5 notes", "6 notes a step apart", "7 notes", "12 notes"], explain: "6 whole steps = one octave. No semitone, no dominant." },
    { q: "Harmonic minor's signature color comes from…", options: ["the major 6th", "the augmented 2nd (♭6–7)", "the 9th", "the 4th"], explain: "The ♭6–major-7 gap (1.5 steps) gives the exotic/metal color." },
    { q: "The diminished alternates…", options: ["steps and steps", "half steps and steps", "thirds", "fourths"], explain: "H–W–H–W…: 8 notes, symmetric, fits over dominants." },
    { q: "Over G7 resolving to C, the useful diminished starts…", options: ["on G", "a half step above (A♭)", "on C", "on E"], explain: "The H–W off the altered root slides into the tonic." },
  ],
  reharmo: [
    { q: "Swapping G7 for D♭7 is…", options: ["a diatonic sub", "a tritone sub", "a modal borrowing", "a pedal"], explain: "A tritone apart: 3rds/7ths trade places, resolution holds." },
    { q: "G7's G–B tritone (3rd and 7th) reappears in D♭7 as…", options: ["root and 5th", "7th and 3rd (F–B)", "9th and 13th", "it's gone"], explain: "F (G7's 7th) becomes D♭7's 3rd, B (3rd) becomes 7th: same tension." },
    { q: "Replacing Cmaj7 with Am7 is…", options: ["a same-function sub (tonic)", "a key change", "a cadence", "a mistake"], explain: "Am7 shares C–E–G with Cmaj7: tonic function kept." },
    { q: "Before a ii–V–I in C, inserting E7–A7 gives…", options: ["a loop", "a secondary-dominant chain (V/vi–V/ii)", "a bridge", "an ostinato"], explain: "Each dominant brings the next: E7→Am (V/vi), A7→Dm (V/ii)." },
  ],
  structure: [
    { q: "The chorus stands out mostly by…", options: ["ever-new lyrics", "a memorable hook and more open harmony", "a solo", "silence"], explain: "Same words, emotional peak, often more I." },
    { q: "The bridge is for…", options: ["repeating the verse", "contrasting before the last chorus", "tuning the guitar", "ending the song"], explain: "Fresh material to reboot attention." },
    { q: "A breakdown, especially in metal/rock, is…", options: ["a jazz solo", "a stripped, often heavier rhythmic section", "a vocal bridge", "an acoustic intro"], explain: "Reduced texture, heavy groove." },
    { q: "Most common pop map?", options: ["A–B–C–D with no return", "verse–chorus–verse–chorus–bridge–chorus", "12-bar blues only", "baroque theme and variations"], explain: "Verse/chorus with bridge remains the standard." },
  ],
};
