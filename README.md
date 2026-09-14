# Diapason — Théorie musicale pour guitaristes 🎸

Application web progressive (PWA) qui emmène un guitariste **de zéro à compositeur** : théorie, manche
interactif, oreille musicale, jeux chronométrés et studio de composition — le tout dans un parcours guidé
de 0 à 100 %.

> Stack : React 19 · TanStack Start / Router · Tailwind CSS v4 · zustand (persisté en local) ·
> Web Audio API · Better Auth + Postgres (opt-in, désactivés par défaut).

## Fonctionnalités

### Parcours guidé 0 → 100 % (`/parcours`)
19 leçons en 4 phases, chacune débloquée par la précédente (60 % suffisent pour avancer) :

| Phase | Contenu |
| --- | --- |
| 1 · Fondations (0 → 20 %) | Notes & cordes, manche, intervalles, rythme, gamme majeure |
| 2 · Harmonie et gammes (20 → 45 %) | Accords, gammes mineures, modes, pentas/blues, cadences, **voicings CAGED & renversements** |
| 3 · Maîtrise avancée (45 → 75 %) | Harmonie fonctionnelle, gammes exotiques, réharmonisation, analyse |
| 4 · Composition & expert (75 → 100 %) | Mélodie, structure, genres, projet final |

Chaque leçon se termine par un **quiz ou un exercice validé** (plus de « marquer comme vu » sans preuve).

### Manche interactif (`/manche`)
Diagramme 6 cordes × 13 cases : tonique, gammes (14 : majeure, mineures, modes, pentas, blues,
par tons, diminuée…), **chaque case cliquable et audible** (vraie hauteur via Web Audio).

### Oreille musicale (`/oreille`)
4 ateliers : **intervalles**, **accords** (7 couleurs), **progressions** (12 grilles à nommer, avec
analyse), **modes**. Séries courtes, score, XP.

### Jeux (`/jeux`)
6 jeux avec **records locaux persistés** et tableau des records sur le hub :

- Course d'intervalles (30 s) · Constructeur d'accords (45 s) · Note manquante
- Dictée mélodique (rejoue 4 notes case par case) · Grille en 60 s · Composition en 60 s

### Studio de composition (`/studio`)
Grille diatonique (majeur/mineur), mélodie par degrés, **10 genres** (rock, blues, jazz/fusion,
metal, pop/indie, funk/soul, classique, fingerstyle, prog, bossa), **assistant** (suggestion du
prochain accord + justification), **harmonisation auto**, **bibliothèque de 12 progressions
analysées**, **export MIDI (.mid)** et texte/tab, sauvegarde au **carnet** (`/carnet`, rejouable).

### Évaluation & motivation
- **Diagnostic** (`/diagnostic`) : 6 questions → niveau estimé + point d'entrée conseillé
- **Défi du jour** (`/defi`) : 5 questions seedées par la date, identiques pour tous
- **Examens** (`/examens`) : 3 examens de phase, 60 % pour valider
- **Progrès** (`/progression`) : XP, streaks, 9 badges (ex. « Maître des modes »), titre évolutif,
  maîtrise par leçon

La progression (leçons, XP, records, compositions) est stockée **localement** (`localStorage`,
clé `diapason-progress-v1`) : aucun compte requis, fonctionne hors-ligne pour l'essentiel.

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
  routes/          # index, parcours, lecon.$id, manche, oreille, jeux(.​$id),
                   # studio, carnet, defi, diagnostic, examens, progression
  features/        # lesson-view (tous les exercices + studio), quiz-block, page
  components/      # fretboard (manche), shell (nav), ui
  lib/
    music.ts       # théorie : notes, gammes, accords, diatonique, genres,
                   # voicings, bibliothèque, suggestions, export MIDI
    curriculum.ts  # 19 leçons, quiz, diagnostic, examens
    progress.ts    # store zustand persisté : XP, scores, records, pièces
    gamification.ts# badges, titres, défi du jour (seed)
    audio.ts       # Web Audio : oscillateurs, accords, intervalles, clics
```

## Notes techniques

- Les routes TanStack imbriquées (`/jeux` + `/jeux/$id`) exigent un `<Outlet/>` dans le parent,
  sinon l'enfant ne rend rien malgré l'URL correcte.
- L'audio démarre toujours sur geste utilisateur (`resumeAudio`) — politique autoplay des navigateurs.
- Auth & base partagée : **désactivées par défaut**. Le classement en ligne ou la synchro
  multi-appareils les activeraient (Better Auth + Postgres déjà pré-câblés dans `src/lib`).

## Feuille de route

- Dictée harmonique chronométrée · paliers de difficulté (tétrades, 12e case)
- Mode hors-ligne PWA complet · polyrythmies / métriques impaires
- Classements en ligne (nécessite l'auth) · packs de genres premium
