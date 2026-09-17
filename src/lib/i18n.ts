import { useProgress } from "./progress";

export type Lang = "fr" | "en";
export type Naming = "solf" | "abc";

/** Do–Si ou C–B, même index, même musique. */
export const NOTE_NAMES: Record<Naming, readonly string[]> = {
  solf: ["Do", "Do#", "Ré", "Ré#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"],
  abc: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
};

const OPEN_PCS = [4, 9, 2, 7, 11, 4]; // Mi La Ré Sol Si Mi, corde 6 → 1

export function stringLabels(naming: Naming): string[] {
  const nn = NOTE_NAMES[naming];
  return OPEN_PCS.map((pc, i) => `${6 - i} · ${nn[pc]}`);
}

export function useLang(): Lang {
  return useProgress((s) => s.lang);
}

export function useNaming(): Naming {
  return useProgress((s) => s.naming);
}

/** Noms de notes selon la notation choisie. */
export function useNN(): readonly string[] {
  return NOTE_NAMES[useNaming()];
}

type Txt = { fr: string; en: string };

const TXT: Record<string, Txt> = {
  // shell
  "nav.home": { fr: "Accueil", en: "Home" },
  "nav.fretboard": { fr: "Manche", en: "Fretboard" },
  "nav.path": { fr: "Parcours", en: "Path" },
  "nav.studio": { fr: "Studio", en: "Studio" },
  "nav.ear": { fr: "Oreille", en: "Ear" },
  "nav.games": { fr: "Jeux", en: "Games" },
  "nav.defi": { fr: "Défi", en: "Challenge" },
  "nav.exams": { fr: "Examens", en: "Exams" },
  "nav.progress": { fr: "Progrès", en: "Progress" },
  "nav.journal": { fr: "Carnet", en: "Journal" },
  "nav.gallery": { fr: "Galerie", en: "Gallery" },
  "nav.profil": { fr: "Profil", en: "Profile" },
  "nav.learn": { fr: "Apprendre", en: "Learn" },
  "nav.create": { fr: "Créer", en: "Create" },
  "nav.play": { fr: "Jouer", en: "Play" },
  "nav.pathD": { fr: "19 leçons guidées, de zéro à compositeur", en: "19 guided lessons, zero to composer" },
  "nav.fretboardD": { fr: "Gammes et notes sur le manche", en: "Scales and notes on the neck" },
  "nav.basse": { fr: "Basse", en: "Bass" },
  "nav.basseD": { fr: "Manche 4 cordes, groove et patterns", en: "4-string neck, groove and patterns" },
  "nav.batterie": { fr: "Batterie", en: "Drums" },
  "nav.batterieD": { fr: "Pads, rythmes et breaks", en: "Pads, grooves and breaks" },
  "nav.earD": { fr: "Intervalles, accords, micro", en: "Intervals, chords, mic" },
  "nav.examsD": { fr: "Valide chaque phase", en: "Validate each phase" },
  "nav.studioD": { fr: "Grilles, mélodies, exports", en: "Progressions, melodies, exports" },
  "nav.journalD": { fr: "Tes morceaux sauvegardés", en: "Your saved pieces" },
  "nav.galleryD": { fr: "Ce que compose la communauté", en: "What the community composes" },
  "nav.gamesD": { fr: "6 jeux chronométrés", en: "6 timed games" },
  "nav.defiD": { fr: "Le défi quotidien", en: "The daily challenge" },
  "nav.memosD": { fr: "Cycle, intervalles, accords", en: "Circle, intervals, chords" },
  "nav.memos": { fr: "Mémos", en: "Cheat sheets" },
  "home.card.memoK": { fr: "Référence", en: "Reference" },
  "home.card.memoT": { fr: "Cycle des quintes et formules", en: "Circle of fifths and formulas" },

  // footer
  "foot.tagline": { fr: "Théorie guidée pour guitaristes, de zéro à la composition.", en: "Guided theory for guitarists, zero to composition." },
  "foot.install": { fr: "Installer l'app", en: "Install the app" },
  "foot.top": { fr: "Haut", en: "Top" },
  "nav.settings": { fr: "Paramètres", en: "Settings" },
  "nav.offline": { fr: "hors-ligne", en: "offline" },
  "sound.guitar": { fr: "Guitare", en: "Guitar" },
  "sound.piano": { fr: "Piano", en: "Piano" },

  // home
  "home.welcome": { fr: "Bienvenue", en: "Welcome" },
  "home.hero": { fr: "De zéro à compositeur, une leçon à la fois.", en: "From zero to composer, one lesson at a time." },
  "home.heroSub": {
    fr: "Diapason t'accompagne sur le manche : notes, intervalles, accords, gammes, puis composition par genres. Chaque concept se joue, s'écoute, et se teste.",
    en: "Diapason guides you across the fretboard: notes, intervals, chords, scales, then composition by genre. Every concept is played, heard, and tested.",
  },
  "home.startNotes": { fr: "Commencer par les notes", en: "Start with the notes" },
  "home.title": { fr: "Le manche, la théorie, la composition.", en: "The fretboard, the theory, the composition." },
  "home.next": { fr: "Prochaine étape", en: "Next step" },
  "home.doneAll": { fr: "Parcours terminé. Compose et affine ton oreille.", en: "Path complete. Compose and sharpen your ear." },
  "home.streak": { fr: "Série", en: "Streak" },
  "home.xp": { fr: "Expérience", en: "Experience" },
  "home.path": { fr: "Parcours", en: "Path" },
  "home.current": { fr: "Leçon en cours", en: "Current lesson" },
  "home.continue": { fr: "Continuer", en: "Continue" },
  "home.review": { fr: "À revoir en priorité", en: "Review first" },
  "home.new": { fr: "nouveau", en: "new" },
  "home.nextStepOf": { fr: "prochaine étape du parcours", en: "next step of the path" },
  "home.aim80": { fr: "vise 80 %+", en: "aim for 80%+" },
  "home.preview": { fr: "Aperçu du parcours", en: "Path overview" },
  "home.phase": { fr: "Phase", en: "Phase" },
  "home.card.defiK": { fr: "Défi du jour", en: "Daily challenge" },
  "home.card.defiDone": { fr: "Fait — retenter ?", en: "Done — retry?" },
  "home.card.defiTodo": { fr: "5 questions, même seed pour tous", en: "5 questions, same seed for all" },
  "home.card.diagK": { fr: "Diagnostic", en: "Diagnostic" },
  "home.card.diagT": { fr: "Calibrer mon niveau en 2 minutes", en: "Assess my level in 2 minutes" },
  "home.card.studioK": { fr: "Studio", en: "Studio" },
  "home.card.studioT": { fr: "Compose une grille et une mélodie", en: "Compose a progression and a melody" },
  "home.card.earK": { fr: "Oreille", en: "Ear" },
  "home.card.earT": { fr: "Intervalles, accords, grilles, modes", en: "Intervals, chords, progressions, modes" },
  "home.card.gamesK": { fr: "Jeux", en: "Games" },
  "home.card.gamesT": { fr: "S'entraîner sans leçon", en: "Drill without a lesson" },
  "home.card.exploreK": { fr: "Explorer", en: "Explore" },
  "home.card.exploreT": { fr: "Manche interactif", en: "Interactive fretboard" },
  "home.card.examsK": { fr: "Examens", en: "Exams" },
  "home.card.examsT": { fr: "Valider chaque phase à 60 %", en: "Validate each phase at 60%" },
  "home.card.progK": { fr: "Progrès", en: "Progress" },
  "home.card.progT": { fr: "Badges, titre, mastery", en: "Badges, title, mastery" },
  "home.card.basseK": { fr: "Basse", en: "Bass" },
  "home.card.basseT": { fr: "Groove en 4 cordes", en: "Groove on 4 strings" },
  "home.card.drumK": { fr: "Batterie", en: "Drums" },
  "home.card.drumT": { fr: "Pads et rythmes", en: "Pads and grooves" },

  // shared
  "ui.question": { fr: "Question", en: "Question" },
  "ui.score": { fr: "Score", en: "Score" },
  "ui.result": { fr: "Voir le résultat", en: "See result" },
  "ui.next": { fr: "Suivant", en: "Next" },
  "ui.retry": { fr: "Refaire", en: "Retry" },
  "ui.continue": { fr: "Continuer", en: "Continue" },
  "ui.done": { fr: "Terminé", en: "Done" },
  "ui.startQuiz": { fr: "Commencer le quiz", en: "Start the quiz" },
  "ui.startExercise": { fr: "Commencer l'exercice", en: "Start the exercise" },
  "ui.listen": { fr: "Écouter", en: "Listen" },
  "ui.replay": { fr: "Rejouer", en: "Replay" },
  "ui.validateQuiz": { fr: "Valider avec le quiz", en: "Validate with the quiz" },
  "ui.validated": { fr: "Validé. Direction la leçon suivante.", en: "Passed. On to the next lesson." },
  "ui.below60": { fr: "Sous les 60 % : revois l'explorateur ci-dessus puis retente.", en: "Below 60%: review the explorer above, then retry." },
  "ui.finishLesson": { fr: "Terminer", en: "Finish" },
  "ui.save": { fr: "Enregistrer", en: "Save" },

  // parcours
  "path.kicker": { fr: "Guidé", en: "Guided" },
  "path.lead": { fr: "Chaque leçon débloque la suivante. 60 % suffisent pour avancer.", en: "Each lesson unlocks the next. 60% is enough to move on." },
  "path.title": { fr: "Parcours 0 → 100 %", en: "Path 0 → 100%" },

  // manche
  "fb.kicker": { fr: "Explorer", en: "Explore" },
  "fb.title": { fr: "Manche interactif", en: "Interactive fretboard" },
  "fb.lead": { fr: "Tonique en clair, autres degrés en sage. Clique une case pour l'entendre.", en: "Tonic highlighted, other degrees in sage. Click a fret to hear it." },
  "fb.tonic": { fr: "Tonique", en: "Tonic" },
  "fb.scale": { fr: "Gamme", en: "Scale" },

  // login
  "login.title": { fr: "Connexion", en: "Sign in" },
  "login.lead": { fr: "Retrouve ta progression sur tous tes appareils.", en: "Pick up your progress on every device." },
  "login.email": { fr: "Créer un compte / se connecter par e-mail", en: "Sign up / in with email" },
  "login.social": { fr: "Ou continuer avec", en: "Or continue with" },
  "login.signup": { fr: "Créer un compte", en: "Sign up" },
  "login.signin": { fr: "Se connecter", en: "Sign in" },
  "login.haveAccount": { fr: "Déjà un compte ? Se connecter", en: "Have an account? Sign in" },
  "login.noAccount": { fr: "Pas de compte ? En créer un", en: "No account? Create one" },
  "login.name": { fr: "Pseudo", en: "Name" },
  "login.emailPh": { fr: "E-mail", en: "Email" },
  "login.passPh": { fr: "Mot de passe (8+ caractères)", en: "Password (8+ characters)" },
  "login.working": { fr: "En cours…", en: "Working…" },
  "login.back": { fr: "Retour à l'accueil", en: "Back home" },
  "login.required": { fr: "Connecte-toi pour accéder à cette page — tu y seras redirigé ensuite.", en: "Sign in to open this page — you'll be sent back right after." },
  "login.tagline": { fr: "De zéro à compositeur, une leçon à la fois.", en: "From zero to composer, one lesson at a time." },
  "login.b1": { fr: "Progression suivie et synchronisée", en: "Tracked, synced progress" },
  "login.b2": { fr: "19 leçons, jeux, oreille et studio", en: "19 lessons, games, ear training and studio" },
  "login.b3": { fr: "Galerie et défis de la communauté", en: "Community gallery and challenges" },
  "login.error": { fr: "Échec, réessaie.", en: "Failed, try again." },

  // profil
  "profil.title": { fr: "Profil", en: "Profile" },
  "profil.loading": { fr: "Chargement du profil…", en: "Loading profile…" },
  "profil.memberSince": { fr: "Progression suivie sur cet appareil et dans le cloud.", en: "Progress tracked on this device and in the cloud." },
  "profil.cloud": { fr: "Cloud", en: "Cloud" },
  "profil.synced": { fr: "synchronisé", en: "synced" },
  "profil.never": { fr: "jamais", en: "never" },
  "profil.syncNow": { fr: "Synchroniser maintenant", en: "Sync now" },
  "profil.syncing": { fr: "Synchronisation…", en: "Syncing…" },
  "profil.syncOk": { fr: "À jour.", en: "Up to date." },
  "profil.localOnly": { fr: "Données locales uniquement.", en: "Local data only." },
  "profil.signOut": { fr: "Se déconnecter", en: "Sign out" },
  "profil.deleteCloud": { fr: "Supprimer mes données cloud", en: "Delete my cloud data" },
  "profil.deleteConfirm": { fr: "Effacer la copie cloud ? (le local reste)", en: "Erase the cloud copy? (local stays)" },
  "profil.deleteYes": { fr: "Oui, effacer le cloud", en: "Yes, erase cloud" },
  "profil.cancel": { fr: "Annuler", en: "Cancel" },
  "profil.loginCta": { fr: "Connecte-toi pour synchroniser ta progression.", en: "Sign in to sync your progress." },
  "profil.goLogin": { fr: "Se connecter / créer un compte", en: "Sign in / create an account" },

  // galerie
  "gal.title": { fr: "Galerie", en: "Gallery" },
  "gal.lead": { fr: "Ce que la communauté compose. Écoute, récupère, réinvente.", en: "What the community composes. Listen, take, reinvent." },
  "gal.empty": { fr: "Rien pour l'instant. Publie ton premier morceau depuis le carnet.", en: "Nothing yet. Publish your first piece from the journal." },
  "gal.listen": { fr: "Écouter", en: "Listen" },
  "gal.fork": { fr: "Récupérer", en: "Take it" },
  "gal.forked": { fr: "Au carnet ✓", en: "In journal ✓" },
  "gal.unpublish": { fr: "Retirer", en: "Remove" },
  "gal.loginHint": { fr: "Connecte-toi pour publier et récupérer.", en: "Sign in to publish and take pieces." },
  "gal.publish": { fr: "Publier", en: "Publish" },
  "gal.published": { fr: "Publié ✓", en: "Published ✓" },
  "gal.by": { fr: "par", en: "by" },

  // settings
  "set.title": { fr: "Paramètres", en: "Settings" },
  "set.lead": { fr: "Langue, notation, son et données. Tout est conservé sur cet appareil.", en: "Language, notation, sound and data. Everything stays on this device." },
  "set.lang": { fr: "Langue", en: "Language" },
  "set.langHint": { fr: "Interface, leçons et quiz.", en: "Interface, lessons and quizzes." },
  "set.naming": { fr: "Nom des notes", en: "Note names" },
  "set.namingHint": { fr: "Solfège (Do, Ré, Mi) ou anglo-saxon (C, D, E).", en: "Solfège (Do, Ré, Mi) or letter names (C, D, E)." },
  "set.solf": { fr: "Do · Ré · Mi", en: "Do · Ré · Mi" },
  "set.abc": { fr: "C · D · E", en: "C · D · E" },
  "set.sound": { fr: "Son des notes", en: "Note sound" },
  "set.soundHint": { fr: "Corde pincée ou piano modélisé.", en: "Plucked string or modelled piano." },
  "set.theme": { fr: "Thème", en: "Theme" },
  "set.themeHint": { fr: "7 ambiances, appliquées aussitôt.", en: "7 moods, applied instantly." },
  "set.data": { fr: "Données", en: "Data" },
  "set.reset": { fr: "Tout recommencer", en: "Reset everything" },
  "set.resetHint": { fr: "Efface progression, records et carnet sur cet appareil.", en: "Erases progress, records and journal on this device." },
  "set.resetConfirm": { fr: "Effacer vraiment tout ?", en: "Really erase everything?" },
  "set.resetYes": { fr: "Oui, effacer", en: "Yes, erase" },
  "set.resetNo": { fr: "Annuler", en: "Cancel" },
  "set.about": { fr: "Diapason — théorie guidée pour guitaristes, de zéro à la composition.", en: "Diapason — guided theory for guitarists, from zero to composition." },

  // feed / récompenses
  "feed.lessonDone": { fr: "Leçon validée", en: "Lesson complete" },
  "feed.saved": { fr: "Morceau au carnet", en: "Piece saved" },
  "feed.challenge": { fr: "Défi relevé", en: "Challenge done" },
  "feed.game": { fr: "Partie terminée", en: "Game over" },
  "feed.ear": { fr: "Oreille travaillée", en: "Ear trained" },
  "feed.exam": { fr: "Examen réussi", en: "Exam passed" },
  "feed.record": { fr: "Nouveau record !", en: "New record!" },
  "feed.badge": { fr: "Badge débloqué", en: "Badge unlocked" },
  "feed.levelUp": { fr: "Niveau {n} !", en: "Level {n}!" },
  "feed.levelSub": { fr: "Continue comme ça.", en: "Keep it up." },
  "feed.daily": { fr: "Objectif du jour", en: "Daily goal" },
  "feed.level": { fr: "Niv.", en: "Lv." },

  // barème XP (progression)
  "xpSrc.title": { fr: "Comment gagner de l'XP", en: "How to earn XP" },
  "xpSrc.lesson": { fr: "Leçon validée (≥ 60 %)", en: "Lesson passed (≥ 60%)" },
  "xpSrc.perfect": { fr: "Bonus sans faute (100 %)", en: "Flawless bonus (100%)" },
  "xpSrc.retry": { fr: "Leçon refaite (progression)", en: "Lesson retaken (improvement)" },
  "xpSrc.fail": { fr: "Leçon tentée (< 60 %)", en: "Lesson attempted (< 60%)" },
  "xpSrc.streak": { fr: "Bonus série (3 j / 7 j)", en: "Streak bonus (3d / 7d)" },
  "xpSrc.exam": { fr: "Examen validé", en: "Exam passed" },
  "xpSrc.games": { fr: "Jeux (selon score)", en: "Games (score-based)" },
  "xpSrc.ear": { fr: "Oreille (selon score)", en: "Ear training (score-based)" },
  "xpSrc.challenge": { fr: "Défi du jour", en: "Daily challenge" },
  "xpSrc.bass": { fr: "Quiz de la basse (≥ 60 %)", en: "Bass quiz (≥ 60%)" },
  "xpSrc.drum": { fr: "Quiz de la batterie (≥ 60 %)", en: "Drum quiz (≥ 60%)" },
  "xpSrc.piece": { fr: "Pièce au carnet", en: "Journal piece" },
  "xpSrc.next": { fr: "Prochain niveau", en: "Next level" },

  // basse
  "basse.kicker": { fr: "Section bassistes · 4 cordes", en: "Bassists corner · 4 strings" },
  "basse.title": { fr: "La basse : le groove d'abord", en: "Bass: groove first" },
  "basse.lead": { fr: "Mi – La – Ré – Sol, une octave sous la guitare. Ton rôle : la fondation — temps solides, notes qui lient les accords.", en: "E – A – D – G, one octave below guitar. Your job: the foundation — solid beats, notes that glue chords together." },
  "basse.tuning": { fr: "Accordage", en: "Tuning" },
  "basse.tuningLead": { fr: "Les 4 cordes à vide, du grave à l'aigu. Touche pour entendre.", en: "The 4 open strings, low to high. Tap to hear." },
  "basse.playAll": { fr: "Tout jouer", en: "Play all" },
  "basse.open": { fr: "à vide", en: "open" },
  "basse.scales": { fr: "Gammes sur 4 cordes", en: "Scales on 4 strings" },
  "basse.scalesLead": { fr: "Mêmes gammes que la guitare, posées sur le manche de basse.", en: "Same scales as guitar, laid out on the bass neck." },
  "basse.patterns": { fr: "Patterns de bassiste", en: "Bassist patterns" },
  "basse.patternsLead": { fr: "Trois schémas qui font 90 % des lignes de basse. Écoute, repère les degrés, rejoue-les.", en: "Three shapes behind 90% of bass lines. Listen, spot the degrees, play them back." },
  "basse.game": { fr: "Trouve la note", en: "Find the note" },
  "basse.gameLead": { fr: "5 manches : clique la case qui sonne la note demandée. 60 % → +30 XP et badge Bassiste.", en: "5 rounds: click the fret that sounds the requested note. 60% → +30 XP and the Bassist badge." },
  "basse.find": { fr: "Trouve", en: "Find" },
  "basse.round": { fr: "Manche", en: "Round" },
  "basse.youPlayed": { fr: "Tu as joué", en: "You played" },
  "basse.pathK": { fr: "Parcours basse", en: "Bass path" },
  "basse.pathT": { fr: "4 leçons, de l'accordage au walking", en: "4 lessons, tuning to walking" },
  "basse.pathTodo": { fr: "pas commencé", en: "not started" },
  "basse.examK": { fr: "Examen final", en: "Final exam" },
  "basse.examT": { fr: "Valide ton niveau de bassiste", en: "Validate your bass level" },
  "basse.examDone": { fr: "Validé ✓", en: "Passed ✓" },
  "basse.examTodo": { fr: "6 questions, 60 % pour valider", en: "6 questions, 60% to pass" },
  "basse.courseK": { fr: "Parcours basse", en: "Bass path" },
  "basse.courseT": { fr: "4 leçons + examen", en: "4 lessons + exam" },
  "basse.courseLead": { fr: "Ton espace à part : chaque leçon débloque la suivante, l'examen valide le tout.", en: "Your own space: each lesson unlocks the next, the exam seals it all." },

  // batterie
  "bat.kicker": { fr: "Section batteurs · 100 % synthétisé", en: "Drummers corner · 100% synthesized" },
  "bat.title": { fr: "La batterie : le temps d'abord", en: "Drums: time first" },
  "bat.lead": { fr: "Grosse caisse, caisse claire, charlestons : chaque son est synthétisé dans ton navigateur, sans sample. Tape, écoute, reconnais.", en: "Kick, snare, hi-hats: every sound is synthesized in your browser, no samples. Hit, listen, recognize." },
  "bat.pads": { fr: "Pads", en: "Pads" },
  "bat.padsLead": { fr: "8 éléments, touche pour frapper.", en: "8 pieces, tap to hit." },
  "bat.grooves": { fr: "Rythmes", en: "Grooves" },
  "bat.groovesLead": { fr: "4 rythmes de 16 pas en boucle. Règle le tempo, écoute la différence.", en: "4 looping 16-step grooves. Set the tempo, hear the difference." },
  "bat.tempo": { fr: "Tempo", en: "Tempo" },
  "bat.game": { fr: "Quel rythme ?", en: "Which groove?" },
  "bat.gameLead": { fr: "4 manches : écoute le rythme et reconnais-le. 75 % → +30 XP et badge Batteur.", en: "4 rounds: hear the groove and name it. 75% → +30 XP and the Drummer badge." },
  "bat.pathK": { fr: "Parcours batterie", en: "Drum path" },
  "bat.pathT": { fr: "4 leçons, du kit aux breaks", en: "4 lessons, kit to fills" },
  "bat.pathTodo": { fr: "pas commencé", en: "not started" },
  "bat.examK": { fr: "Examen final", en: "Final exam" },
  "bat.examT": { fr: "Valide ton niveau de batteur", en: "Validate your drum level" },
  "bat.examDone": { fr: "Validé ✓", en: "Passed ✓" },
  "bat.examTodo": { fr: "6 questions, 60 % pour valider", en: "6 questions, 60% to pass" },
  "bat.courseK": { fr: "Parcours batterie", en: "Drum path" },
  "bat.courseT": { fr: "4 leçons + examen", en: "4 lessons + exam" },
  "bat.courseLead": { fr: "Ton espace à part : chaque leçon débloque la suivante, l'examen valide le tout.", en: "Your own space: each lesson unlocks the next, the exam seals it all." },

  // lesson shell
  "lesson.notFound": { fr: "Leçon introuvable.", en: "Lesson not found." },
  "lesson.locked": { fr: "Termine la leçon précédente pour débloquer", en: "Finish the previous lesson to unlock" },
  "lesson.finishWith": { fr: "J'ai vu la gamme — marquer comme vue", en: "I've seen the scale — mark as seen" },
  "lesson.exploreNote": { fr: "Leçon d'exploration : pas de quiz bloquant ici, l'examen Expert validera l'ensemble.", en: "Exploration lesson: no blocking quiz here, the Expert exam covers it." },
  "lesson.solid": { fr: "Solide. Tu peux avancer.", en: "Solid. You can move on." },
  "lesson.retry60": { fr: "Relis l'intro et retente — 60 % débloque la suite.", en: "Re-read the intro and retry — 60% unlocks what's next." },

  // intervalles
  "iv.intro": { fr: "Un intervalle mesure la distance entre deux notes, en demi-tons. Sur une corde, c'est le nombre de cases.", en: "An interval measures the distance between two notes, in semitones. On one string, it's the fret count." },
  "iv.above": { fr: "au-dessus du Mi grave à vide.", en: "above the open low E." },
  "iv.click": { fr: "Clique la", en: "Click the" },
  "iv.exact": { fr: "Exact.", en: "Correct." },
  "iv.miss": { fr: "plus loin.", en: "further up." },
  "iv.isCases": { fr: "est", en: "sits" },
  "iv.case": { fr: "case", en: "fret" },
  "iv.cases": { fr: "cases", en: "frets" },
  "iv.perfect": { fr: "Les intervalles sur une corde sont automatiques.", en: "One-string intervals are automatic now." },
  "iv.ok": { fr: "Encore quelques passages et ce sera fluide.", en: "A few more runs and it'll flow." },

  // accords
  "ch.intro": { fr: "Une triade empile fondamentale, tierce et quinte. Change la tierce ou la quinte : la couleur change.", en: "A triad stacks root, third and fifth. Change the third or fifth: the color changes." },
  "ch.root": { fr: "Fondamentale", en: "Root" },
  "ch.color": { fr: "Couleur", en: "Quality" },
  "ch.play": { fr: "Jouer : construis l'accord", en: "Play: build the chord" },
  "ch.target": { fr: "notes pour un", en: "notes for a" },
  "ch.degrees": { fr: "Degrés", en: "Degrees" },
  "ch.perfect": { fr: "Triades acquises.", en: "Triads locked in." },
  "ch.ok": { fr: "Revois les degrés de chaque couleur.", en: "Review each quality's degrees." },

  // rythme
  "rh.intro": { fr: "En 4/4, la ronde dure la mesure, la blanche la moitié, la noire un temps, la croche un demi-temps.", en: "In 4/4, the whole note fills the bar, half gets two beats, quarter one, eighth half a beat." },
  "rh.title": { fr: "Cale-toi sur le tempo", en: "Lock in to the tempo" },
  "rh.sub": { fr: "8 clics. Tape le cercle le plus près possible de chaque temps.", en: "8 clicks. Tap the circle as close to each beat as you can." },
  "rh.tap": { fr: "Tape ici", en: "Tap here" },
  "rh.start": { fr: "Démarrer", en: "Start" },
  "rh.restart": { fr: "Recommencer", en: "Restart" },
  "rh.great": { fr: "Excellent sens du tempo.", en: "Excellent sense of tempo." },
  "rh.advice": { fr: "Écoute deux mesures avant de te lancer.", en: "Listen two bars before jumping in." },
  "rh.beats": { fr: "t", en: "b" },

  // manche (leçon)
  "nk.intro": { fr: "Clique n'importe quelle case qui porte la note demandée. Le manche entier répète les 12 sons.", en: "Click any fret carrying the requested note. The whole neck repeats the 12 sounds." },
  "nk.find": { fr: "Trouve un", en: "Find an" },
  "nk.good": { fr: "Bien vu.", en: "Nice." },
  "nk.was": { fr: "C'était", en: "It was" },

  // gamme majeure
  "mj.intro": { fr: "Tonique → T T ½ T T T ½. Les accords I, IV, V se construisent sur les 1er, 4e et 5e degrés.", en: "Tonic → W W H W W W H. Chords I, IV, V are built on the 1st, 4th and 5th degrees." },

  // gammes
  "sc.intro": { fr: "Compare majeure, mineure naturelle, harmonique (7e haussée) et mélodique (6e et 7e haussées).", en: "Compare major, natural minor, harmonic (raised 7th) and melodic (raised 6th and 7th)." },

  // modes
  "mo.intro": { fr: "Même notes que Do majeur, centre déplacé. Écoute la couleur de chaque mode.", en: "Same notes as C major, shifted center. Hear each mode's color." },

  // pentas
  "pe.intro": { fr: "La pentatonique mineure et la majeure sont relatives (trois demi-tons). La blues ajoute la ♭5.", en: "Minor and major pentatonics are relatives (three semitones). Blues adds the ♭5." },

  // cadences
  "ca.intro": { fr: "Écoute les cadences dans n'importe quelle tonalité. V–I conclut, IV–I adoucit, ii–V–I est le moteur jazz.", en: "Hear cadences in any key. V–I closes, IV–I softens, ii–V–I is the jazz engine." },

  // voicings
  "vo.intro": { fr: "Mêmes notes, basse différente : écoute comment le renversement change la couleur. Puis repère les 5 formes CAGED sur le manche.", en: "Same notes, different bass: hear how inversion changes the color. Then spot the 5 CAGED shapes on the neck." },
  "vo.quality": { fr: "Qualité", en: "Quality" },
  "vo.bass": { fr: "basse", en: "bass" },
  "vo.hear": { fr: "Écouter le voicing (arpège + basse)", en: "Hear the voicing (arpeggio + bass)" },

  // studio embeds
  "st.melodyHint": { fr: "Ouvre le studio : pose une grille I–V–vi–IV, puis une mélodie sur les degrés de la gamme. Vise les notes de l'accord sur les temps forts.", en: "Open the studio: lay down a I–V–vi–IV progression, then a melody on scale degrees. Aim for chord tones on strong beats." },
  "st.projetHint": { fr: "Projet final : choisis un genre, une tonalité, une grille d'au moins 4 accords, une mélodie, et enregistre dans le carnet.", en: "Final project: pick a genre, a key, a progression of at least 4 chords, a melody, and save to the journal." },

  // analyse guidée
  "an.step": { fr: "Morceau", en: "Song" },
  "an.hear": { fr: "Écouter la grille", en: "Hear the progression" },
  "an.degrees": { fr: "Degrés", en: "Degrees" },
  "an.read": { fr: "Lire l'analyse", en: "Read the analysis" },
  "an.pachelbel": { fr: "Canon de Pachelbel — la descente qui ne finit jamais : I–V–vi–iii–IV–I–IV–V. Chaque basse descend par degrés conjoints, chaque accord partage des notes avec le suivant.", en: "Pachelbel's Canon — the endless descent: I–V–vi–iii–IV–I–IV–V. Each bass steps down, each chord shares tones with the next." },
  "an.creep": { fr: "Creep (Radiohead) — I–III–IV–iv en Sol : le III majeur (Si) est chromatique, et le iv mineur final (Do mineur) est emprunté au mode mineur. D'où la tension qui explose au refrain.", en: "Creep (Radiohead) — I–III–IV–iv in G: the major III (B) is chromatic, and the final minor iv (C minor) is borrowed from minor. Hence the tension bursting into the chorus." },
  "an.blues": { fr: "Blues en La (12 mesures) — I7–IV7–V7 : trois dominantes là où la gamme n'en prévoit qu'une. La friction est voulue, les blue notes la racontent.", en: "A blues in A (12 bars) — I7–IV7–V7: three dominants where the scale plans one. The grit is deliberate, the blue notes tell it." },

  // dominantes secondaires
  "se.intro": { fr: "Écoute la même cadence habillée trois fois : diatonique, dominante secondaire, emprunt modal.", en: "Hear the same cadence dressed three ways: diatonic, secondary dominant, modal borrowing." },
  "se.diat": { fr: "ii – V – I (tout diatonique)", en: "ii – V – I (all diatonic)" },
  "se.sec": { fr: "V/ii – ii – V – I (A7 avant Dm)", en: "V/ii – ii – V – I (A7 before Dm)" },
  "se.secShort": { fr: "avec V/ii (A7 → Dm)", en: "with V/ii (A7 → Dm)" },
  "se.modal": { fr: "iv – I (Fm emprunté au mineur)", en: "iv – I (Fm borrowed from minor)" },

  // conduite des voix
  "vx.intro": { fr: "Même enchaînement C – G, deux conduites : l'une saute partout, l'autre glisse. Écoute la différence, regarde les mouvements.", en: "Same C – G move, two leadings: one jumps everywhere, one glides. Hear the difference, watch the motion." },
  "vx.jumpy": { fr: "Écouter : sauts (positions fondamentales)", en: "Hear: jumpy (root positions)" },
  "vx.jumpyShort": { fr: "sauts de fondamentales", en: "root-position jumps" },
  "vx.smooth": { fr: "Écouter : conduite lisse (renversements)", en: "Hear: smooth leading (inversions)" },
  "vx.smoothShort": { fr: "notes communes tenues", en: "common tones held" },
  "vx.rule": { fr: "Retiens : note commune = on la garde ; le reste bouge au plus court ; la sensible monte.", en: "Remember: shared note = keep it; the rest moves shortest; the leading tone rises." },

  // métriques
  "me.intro": { fr: "Tape avec le métronome en 5/4 (3+2) puis 7/8 (2+2+3). Le compteur de groupes t'aide à ne pas te perdre.", en: "Tap along in 5/4 (3+2) then 7/8 (2+2+3). The group counter keeps you from getting lost." },
  "me.meter": { fr: "Métrique", en: "Meter" },
  "me.tap": { fr: "Tape chaque temps", en: "Tap each beat" },
  "me.start": { fr: "Démarrer", en: "Start" },
  "me.again": { fr: "Recommencer", en: "Restart" },

  // mémos
  "memo.kicker": { fr: "Référence", en: "Reference" },
  "memo.title": { fr: "Fiches mémo", en: "Cheat sheets" },
  "memo.lead": { fr: "Tout ce qu'un pro garde sous les yeux : cycle des quintes, intervalles, accords, cadences.", en: "Everything a pro keeps at hand: circle of fifths, intervals, chords, cadences." },
  "memo.circle": { fr: "Cycle des quintes", en: "Circle of fifths" },
  "memo.circleHint": { fr: "Clique une tonalité : gamme, relatif mineur, armure et accords diatoniques.", en: "Click a key: scale, relative minor, key signature and diatonic chords." },
  "memo.scale": { fr: "Gamme", en: "Scale" },
  "memo.relative": { fr: "Relatif mineur", en: "Relative minor" },
  "memo.key": { fr: "Armure", en: "Key signature" },
  "memo.sharps": { fr: "dièses", en: "sharps" },
  "memo.flats": { fr: "bémols", en: "flats" },
  "memo.none": { fr: "rien", en: "none" },
  "memo.degrees": { fr: "Accords du ton", en: "Key chords" },
  "memo.intervals": { fr: "Les 12 intervalles", en: "The 12 intervals" },
  "memo.semis": { fr: "demi-tons", en: "semitones" },
  "memo.triads": { fr: "Triades", en: "Triads" },
  "memo.sevenths": { fr: "Tétrades (7e)", en: "Seventh chords" },
  "memo.cadences": { fr: "Cadences", en: "Cadences" },
  "memo.cadPerf": { fr: "parfaite — point final", en: "perfect — full stop" },
  "memo.cadPlag": { fr: "plagale — conclusion douce", en: "plagal — soft landing" },
  "memo.cadBrok": { fr: "rompue — surprise vers vi", en: "deceptive — surprise to vi" },
  "memo.cadJazz": { fr: "le moteur du jazz", en: "the jazz engine" },
  "st.lead": { fr: "Grille diatonique, mélodie par degrés, templates de genres. Tout s'écoute.", en: "Diatonic progression, degree-based melody, genre templates. Everything plays." },
  "st.title": { fr: "Compose une progression", en: "Compose a progression" },
  "st.sub": { fr: "Tonalité, accords diatoniques, mélodie sur 8 temps, genres. Écoute, puis enregistre dans le carnet.", en: "Key, diatonic chords, 8-beat melody, genres. Listen, then save to the journal." },
  "st.key": { fr: "Tonalité", en: "Key" },
  "st.mode": { fr: "Mode", en: "Mode" },
  "st.genre": { fr: "Genre", en: "Genre" },
  "st.degrees": { fr: "Accords diatoniques", en: "Diatonic chords" },
  "st.prog": { fr: "Progression", en: "Progression" },
  "st.addChords": { fr: "Ajoute des accords.", en: "Add some chords." },
  "st.melody": { fr: "Mélodie (degré de la gamme par temps)", en: "Melody (scale degree per beat)" },
  "st.clear": { fr: "Effacer accords", en: "Clear chords" },
  "st.harmonize": { fr: "Harmoniser auto", en: "Auto-harmonize" },
  "st.assist": { fr: "Assistant — que jouer après", en: "Assistant — what after" },
  "st.library": { fr: "Bibliothèque — 12 grilles analysées", en: "Library — 12 analyzed progressions" },
  "st.midi": { fr: "Export MIDI", en: "Export MIDI" },
  "st.text": { fr: "Export texte / tab", en: "Export text / tab" },
  "st.pdf": { fr: "Fiche PDF / imprimer", en: "PDF sheet / print" },
  "st.tab": { fr: "Tablature (positions simples, capo 0)", en: "Tablature (easy positions, capo 0)" },
  "st.name": { fr: "Titre", en: "Title" },
  "st.untitled": { fr: "Sans titre", en: "Untitled" },
  "st.save": { fr: "Enregistrer dans le carnet", en: "Save to journal" },
};

export function t(lang: Lang, key: string): string {
  const e = TXT[key];
  if (!e) return key;
  return lang === "en" ? e.en : e.fr;
}

export function useT(): (key: string) => string {
  const lang = useLang();
  return (key: string) => t(lang, key);
}
