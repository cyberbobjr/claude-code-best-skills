# Claude Code best skills

**EN** — A small collection of reusable [Claude Code skills](https://code.claude.com/docs/en/skills): one audits and
slims down your Claude Code setup to cut token usage, two package a disciplined delivery process and a code audit. Copy
a folder from [`skills/`](skills/) into `~/.claude/skills/` (all projects) or `<project>/.claude/skills/` (one
project). Skills load only when a task needs them; `chantier-adr` and `audit-solid` are written in French.

It also ships a mod: [`usage-band`](mods/usage-band/README.md) draws model, effort, context and weekly usage with its
projected landing above the prompt.

---

## À quoi servent ces skills

Une skill est une procédure que Claude Code ne lit **que lorsque la tâche la demande** : à chaque session, seule sa
courte description est chargée. C'est l'inverse d'un `CLAUDE.md` ou d'un `AGENTS.md` long, relu en entier à chaque
échange. Ces skills sont nées d'un travail de réduction des tokens : sortir les procédures des fichiers d'instructions
pour ne les payer qu'au moment où elles servent.

| Skill | Sert à | Se déclenche quand on dit… |
| --- | --- | --- |
| [`audit-tokens`](skills/audit-tokens/SKILL.md) | Mesurer ce que Claude Code charge à chaque session sur ta machine et proposer, preuves à l'appui, les corrections qui réduisent la consommation de tokens | « optimise mes tokens », « réduire la consommation de Claude Code », "reduce token usage" |
| [`chantier-adr`](skills/chantier-adr/SKILL.md) | Mener un chantier de code avec méthode : décision écrite (ADR), plan, statuts, test d'abord avec preuve du vert, délégation, clôture | « nouvel ADR », « plan du chantier », « clôture de l'étape » |
| [`audit-solid`](skills/audit-solid/SKILL.md) | Auditer un code en lecture seule (SOLID, code smells, Clean Code, règles du projet) et rendre un rapport priorisé | « audit SOLID », « audit du code », « dette technique » |

### `audit-tokens` — réduire la consommation de Claude Code

Claude Code renvoie tout le contexte au modèle à chaque échange : instructions chargées au démarrage, définitions
d'outils, historique. Une configuration lourde se paie donc des milliers de fois. La skill :

1. **mesure** sans rien modifier : fichiers d'instructions (`CLAUDE.md` **et** `AGENTS.md`, que Claude Code lit
   désormais), imports `@`, mémoire, serveurs MCP et leur portée, sous-agents, hooks, modèle, effort, cache ;
2. **classe** les corrections par gain estimé par session, chacune avec sa preuve et son risque ;
3. **attend ton accord**, puis applique en sauvegardant les fichiers, sans rien supprimer.

Ce qu'elle a appris en route, mesures à l'appui
([`references/evidence.md`](skills/audit-tokens/references/evidence.md)) :

- le premier poste est presque toujours le contexte chargé d'office : un gros fichier d'instructions ou un index
  importé par `@` coûte plus que toutes les autres astuces réunies ;
- une règle répétée dans tous tes projets va dans le fichier global (`~/.claude/CLAUDE.md`), une procédure répétée dans
  plusieurs devient une skill partagée ;
- le cache compte plus que la compression : changer de modèle en cours de session ou reprendre après une longue pause
  refacture tout l'historique (10 fois plus cher, mesuré) ;
- les sous-agents ne sont pas gratuits : utiles pour les gros volumes, coûteux pour une petite tâche (2,6 fois,
  mesuré) ; Haiku exécute bien un plan précis mais planifie mal ;
- les compteurs « tokens économisés » des outils de compression (RTK, Caveman…) ne sont pas la facture : seul le coût
  par tâche réussie fait foi.

### `chantier-adr` — un processus de chantier commun à tous les projets

Aucun code sans décision écrite et acceptée (ADR), un plan par ADR, six statuts de tâche, cycle rouge-vert-refactor et
**preuve du vert obligatoire** pour chaque tâche, délégation ciblée aux sous-agents, clôture et archivage. Un projet
l'adopte avec une ligne dans son fichier d'instructions : « Aucun code sans ADR accepté. Test rouge d'abord. Clôture
selon la skill `chantier-adr`. » Le projet y ajoute ses propres points de clôture.

### `audit-solid` — audit de code priorisé

Audit en lecture seule contre SOLID, les code smells de Fowler, Clean Code et les règles du projet, avec un rapport
priorisé (P0 à P3), une preuve et une correction proposée pour chaque constat. Les références détaillées ne se chargent
qu'au besoin. Les règles propres à un projet vont dans son `docs/audit/regles-depot.md`, que la skill lit en premier.

## Installation

```bash
# toutes les sessions, tous les projets
cp -r skills/<nom> ~/.claude/skills/
# un seul projet
cp -r skills/<nom> <projet>/.claude/skills/
```

Dans une nouvelle session, la skill se déclenche seule quand la demande correspond, ou s'appelle par `/<nom>`.

## Mods

Un mod modifie l'interface de Claude Code. Il s'installe comme un plugin, depuis ce dépôt qui sert de marketplace.

| Mod | Sert à |
| --- | --- |
| [`usage-band`](mods/usage-band/README.md) | Afficher au-dessus du prompt le modèle, l'effort, le contexte et la consommation hebdomadaire, avec une projection verte, jaune ou rouge de l'atterrissage au reset |

```
/plugin install usage-band --marketplace cyberbobjr/claude-code-best-skills
```

## Licence

[MIT](LICENSE)
