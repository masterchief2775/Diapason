# Diapason — Théorie musicale pour guitaristes 🎸

Application web progressive (PWA) qui emmène un guitariste **de zéro à compositeur** : théorie, manche
interactif, oreille musicale, jeux chronométrés et studio de composition — le tout dans un parcours guidé
de 0 à 100 %.

> Stack : React 19 · TanStack Start / Router · Tailwind CSS v4 · zustand (persisté en local) ·
> Web Audio API (corde pincée Karplus-Strong + piano modélisé, 100 % hors-ligne) ·
> Better Auth + Postgres (opt-in, désactivés par défaut).

## Fonctionnalités

### Parcours guidé 0 → 100 % (`/parcours`)
22 leçons en 4 phases, chacune débloquée par la précédente (60 % suffisent pour avancer) :

| Phase | Contenu |
| --- | --- |
| 1 · Fondations (0 → 20 %) | Notes & cordes, manche, intervalles, rythme, gamme majeure |
| 2 · Harmonie et gammes (20 → 45 %) | Accords, gammes mineures, modes, pentas/blues, cadences, **voicings CAGED & renversements** |
| 3 · Maîtrise avancée (45 → 75 %) | Harmonie fonctionnelle, gammes exotiques, réharmonisation, analyse guidée (Pachelbel, Creep, blues), dominantes secondaires, conduite des voix, métriques impaires |
| 4 · Composition & expert (75 → 100 %) | Mélodie, structure, genres, projet final |

Chaque leçon se termine par un **quiz ou un exercice validé** (plus de « marquer comme vu » sans preuve).

### Manche interactif (`/manche`)
Diagramme 6 cordes × 13 cases : tonique, gammes (14 : majeure, mineures, modes, pentas, blues,
par tons, diminuée…), **chaque case cliquable et audible** (vraie hauteur via Web Audio).

### Basse (`/basse`)
Espace autonome des bassistes : **parcours en 4 leçons** (rôle & accordage, notes sur
4 cordes, gammes majeure/mineure, groove & patterns — chacune avec explorateur
interactif et quiz) + **examen final** (60 % → +50 XP, badge **Bassiste confirmé**).
Aussi : **accordage** Mi–La–Ré–Sol, **manche 4 cordes** interactif, **3 patterns**
jouables et **mini-jeu « Trouve la note »** (badge **Bassiste**).

### Batterie (`/batterie`)
Espace autonome des batteurs, **modélisée par couches** (transitoire + peau + partiels
inharmoniques façon TR-808, bus compressé — aucun sample) : **parcours en 4 leçons**
(kit, pulsation & métronome, rock/punk/funk/bossa, breaks — avec pads, métronome,
rythmes jouables et démo de fill) + **examen final** (badge **Batteur confirmé**).
Aussi : **8 pads** jouables et **mini-jeu « Quel rythme ? »** (badge **Batteur**).

### Oreille musicale (`/oreille`)
5 ateliers : **intervalles**, **accords** (7 couleurs), **progressions** (12 grilles à nommer, avec
analyse), **modes**, et **micro** : accordeur temps réel (note + cents + cordes) + « joue ce que tu
entends » (8 notes à reproduire sur ta vraie guitare, ±30 cents). Séries courtes, score, XP.

### Jeux (`/jeux`)
6 jeux avec **records locaux persistés** et tableau des records sur le hub :

- Course d'intervalles (30 s) · Constructeur d'accords (45 s) · Note manquante
- Dictée mélodique (rejoue 4 notes case par case) · Grille en 60 s · Composition en 60 s

### Studio de composition (`/studio`)
Grille diatonique (majeur/mineur), mélodie par degrés, **10 genres** (rock, blues, jazz/fusion,
metal, pop/indie, funk/soul, classique, fingerstyle, prog, bossa), **assistant** (suggestion du
prochain accord + justification), **harmonisation auto**, **bibliothèque de 12 progressions
analysées**, **tablature auto** (positions simples), **export MIDI (.mid)**, texte/tab et
**fiche PDF** (impression), sauvegarde au **carnet** (`/carnet`, rejouable).

### Évaluation & motivation
- **Diagnostic** (`/diagnostic`) : 6 questions → niveau estimé + point d'entrée conseillé
- **Défi du jour** (`/defi`) : 5 questions seedées par la date, identiques pour tous
- **Examens** (`/examens`) : 3 examens de phase, 60 % pour valider
- **Révisions** : file « à revoir » sur l'accueil (leçons fragiles < 80 %), graphique XP 14 jours
  - **Progrès** (`/progression`) : XP, streaks, 18 badges à médaillons (logos + couleurs,
  ex. « Maître des modes », « Sans faute », « Bassiste », « Batteur », experts), titre évolutif, nom de niveau
  (Novice → Maître Diapason), barème officiel des sources d'XP, maîtrise par leçon,
  bouton d'installation PWA
- **Dopamine saine** : niveaux (100/300/600… XP), barre d'XP persistante, toasts de
  récompense (leçons, jeux, oreille, examens, défis, carnet, records), confettis +
  fanfare aux validations, modale de passage de niveau, bonus de série (+5/+10 XP),
  objectif quotidien de 50 XP avec anneau, urgence des chronos sous 10 s

### Mémos (`/memos`)
- **Cycle des quintes interactif** : gamme, relatif mineur, armure, accords du ton, écoute I–IV–V
- **Tables** : 12 intervalles, triades, tétrades, cadences — la référence du futur pro

### Paramètres (`/parametres`)
- **Langue** : français / anglais (interface, 22 leçons, tous les quiz)
- **Notation** : solfège (Do, Ré, Mi…) ou anglo-saxonne (C, D, E…) — appliquée partout :
  manche, leçons, jeux, oreille, studio, carnet
- **Son** : guitare / piano · **Thème** : Braise, Papier, Minuit, Forêt, Miku, Teto
  (instantané, persisté)
- **Données** : recommencer à zéro (les réglages sont conservés)

La progression (leçons, XP, records, compositions) est stockée **localement** (`localStorage`,
clé `diapason-progress-v1`) et **synchronisée dans le cloud** quand tu es connecté
(voir Comptes ci-dessous). Les réglages (langue, notation, thème, instrument) restent locaux.

## Comptes & profil

- **Le site exige un compte** : toute page hors `/login` redirige vers la connexion
  (avec retour à la page demandée après sign-in) ; hors-ligne, l'accès local reste
  possible sans forcer de reconnexion.
- **Connexion** (`/login`, page standalone sans en-tête) : création de compte /
  connexion par **e-mail + mot de passe**, ou via **Google / X** (fédération).
- **Profil** (`/profil`, protégé) : avatar, pseudo, e-mail, titre, 6 compteurs (XP, leçons,
  série, badges, morceaux, défis), état de la **sync cloud** (auto à l'ouverture + bouton
  manuel + push différé des modifications), suppression de la copie cloud, déconnexion.
- **Sync multi-appareils** : last-write-wins par horodatage (`user_progress`, requêtes
  scopées par `user_id` vérifié côté serveur). Sans compte, tout reste local et hors-ligne.

### Galerie (`/galerie`)
- Morceaux **publiés depuis le carnet** (bouton Publier/Retirer par pièce), visibles par tous :
  titre, auteur (pseudo du compte, jamais l'e-mail), grille, écoute, **récupération** vers
  son propre carnet. Suppression limitée à ses propres morceaux.

## Démarrage

Prérequis : Node 22.

```bash
npm install
npm run dev      # http://localhost:8080 (serveur dev, HMR)
```

Autres commandes :

```bash
npm run build      # build production + migrations DB
npm run preview    # servir le build (port 8081)
npm run typecheck  # tsc --noEmit
npm test           # tests unitaires
npm run lint       # eslint
npm run format     # prettier
```

## Structure

```
src/
  routes/          # index, parcours, lecon.$id, manche, oreille, jeux(.$id),
                   # studio, carnet, defi, diagnostic, examens, progression,
                   # profil, memos, galerie, login, parametres,
                   # basse(.parcours/.lecon.$id/.examen),
                   # batterie(.parcours/.lecon.$id/.examen)
  features/        # lesson-view (exercices guitare + studio),
                   # instrument-lesson + instrument-parcours (basse/batterie),
                   # quiz-block, page
  components/      # fretboard (manche 6 cordes), bass-neck (4 cordes),
                   # drum-pads, groove-card, badges (médaillons), shell, ui
  lib/
    music.ts       # théorie : notes, gammes, accords, diatonique, genres,
                   # voicings, bibliothèque, suggestions, tablature, export MIDI
    curriculum.ts  # 19 leçons, quiz, diagnostic, examens
    curriculum-basse.ts / curriculum-batterie.ts  # parcours basse/batterie FR/EN
    instrument-curriculum.ts  # types + déblocage séquentiel partagés
    bass.ts        # accordage, fréquences, patterns basse
    grooves.ts     # pads, rythmes 16 pas, lecture + démo de fill
    progress.ts    # store zustand persisté : XP, scores, records, pièces, activité
    gamification.ts# badges, titres, niveaux, défi du jour (seed), file de révision
    i18n.ts          # FR/EN (353 clés), notations Do–Si / C–B, hooks useT/useNN
    audio.ts       # Web Audio : guitare/piano, batterie modélisée, reverb,
                   # accords, intervalles, clics
    synth.ts       # synthèse pure (Karplus-Strong + piano) — testable sans navigateur
    feed.ts        # toasts de récompense
    confetti.ts    # confettis (canvas)
    sync.ts        # sync cloud last-write-wins + push différé
    theme.ts       # 7 thèmes (braise, papier, minuit, forêt, miku, teto, daltonien)
    pitch.ts       # détection de hauteur (autocorrélation) — testable sans navigateur
    mic.ts         # hook micro temps réel (accordeur, joue-ce-que-tu-entends)
```

## Notes techniques

- Les routes TanStack imbriquées (`/jeux` + `/jeux/$id`) exigent un `<Outlet/>` dans le parent,
  sinon l'enfant ne rend rien malgré l'URL correcte.
- L'audio démarre toujours sur geste utilisateur (`resumeAudio`) — politique autoplay des navigateurs.
- Auth & base partagée : **désactivées par défaut**. Le classement en ligne ou la synchro
  multi-appareils les activeraient (Better Auth + Postgres déjà pré-câblés dans `src/lib`).

## Feuille de route

- Dictée harmonique chronométrée · paliers de difficulté (tétrades, 12e case)
- Polyrythmies / métriques impaires · enregistrement audio des compos
- Classements en ligne (nécessite l'auth) · packs de genres premium
- Précache des chunks JS au build pour un hors-ligne encore plus rapide

## Interface

Design system à tokens (7 thèmes : Braise, Papier, Minuit, Forêt, Miku, Teto, Daltonien) :
motion d'entrée en cascade par page, cartes avec soulèvement au survol, quiz à pastilles
A/B/C/D avec feedback animé, anneau de score SVG, hero avec motif cordes, en-tête sticky
flouté. Le tout en `src/styles.css` + `src/components/ui.tsx`, sans dépendance.
