# Claude Code token audit

**EN** — A ready-to-paste prompt that makes Claude Code audit its own configuration on your machine and propose
changes that cut token usage on every project, based on measured evidence rather than tool advertising. Open
[`prompts/audit-claude-code-tokens.md`](prompts/audit-claude-code-tokens.md), copy the prompt into a Claude Code
session, review the report, approve the changes.

---

## But

Claude Code renvoie tout le contexte au modèle à chaque échange : instructions chargées au démarrage, définitions
d'outils, historique. Une configuration lourde se paie donc des milliers de fois. Ce dépôt contient un **prompt
d'audit** qui demande à Claude Code de :

1. **mesurer** ce qui est chargé à chaque session (fichiers d'instructions `CLAUDE.md` **et** `AGENTS.md`, imports
   `@`, mémoire, serveurs MCP, sous-agents, hooks, réglages de modèle et d'effort) ;
2. **classer** les corrections par gain estimé, avec preuves ;
3. **attendre ton accord** avant de modifier quoi que ce soit, en sauvegardant les fichiers et sans rien supprimer.

Moins de tokens, c'est une facture ou un quota qui dure plus longtemps, des réponses plus rapides, et moins de calcul
consommé.

## Utilisation

1. Ouvre une session Claude Code dans un projet habituel (ou dans ton dossier personnel).
2. Colle le contenu de [`prompts/audit-claude-code-tokens.md`](prompts/audit-claude-code-tokens.md) (tout ce qui suit
   le trait horizontal).
3. Lis le rapport, choisis les corrections, laisse Claude les appliquer.
4. Vérifie l'effet : `/context` au démarrage d'une session, `/usage` après quelques jours de travail comparable.

## Ce que l'on a appris en le faisant

Le prompt embarque un tableau de preuves (novembre 2026) pour éviter de refaire la recherche à chaque audit :

- **Le premier poste est souvent le contexte chargé d'office.** Un fichier d'instructions de plus de 200 lignes ou un
  gros index importé par `@` coûte plus que toutes les autres astuces réunies. Mieux vaut un index court, des skills
  et des documents lus à la demande.
- **`AGENTS.md` compte autant que `CLAUDE.md`.** Claude Code lit désormais `AGENTS.md` : avec le réglage par défaut
  (`instructionFiles` = `claude-md-or-agents-md`), il le charge dans un dossier qui n'a pas de `CLAUDE.md`. Un
  `CLAUDE.md` oublié, même vide, le masque. L'audit vérifie lequel est réellement chargé et applique les mêmes règles
  de taille aux deux.
- **Modèle d'abord, effort ensuite.** L'effort `medium` est souvent le réglage le moins cher qui réussit ; `low` peut
  coûter plus en multipliant les tours.
- **Le cache compte plus que la compression.** Changer de modèle, d'accélération, de serveur MCP en cours de session,
  ou revenir après une longue pause, refacture tout l'historique.
- **Les sous-agents ne sont pas gratuits.** Chacun repart de zéro : sur un petit correctif, trois sous-agents ont coûté
  2,6 fois plus, sans meilleur résultat. Haiku pour l'exploration et pour exécuter un plan précis, oui ; déléguer une
  petite recherche, non.
- **Une longue pause coûte cher.** Reprendre une session après l'expiration du cache a coûté 10 fois plus qu'une
  reprise dans l'heure : après une longue pause, session neuve ou `/compact` avant de partir.
- **Les compteurs « tokens économisés » ne sont pas la facture.** Les mesures indépendantes de RTK, de Caveman et de la
  compression des sorties d'outils trouvent des effets faibles, parfois des coûts en hausse. Seul le coût par tâche
  réussie fait foi.

Les sources sont citées dans le prompt. Les chiffres évoluent avec les versions : le prompt demande de les revérifier
s'ils datent.

## Skills fournies

Deux skills prêtes à copier dans `~/.claude/skills/` (globales) ou `<projet>/.claude/skills/`. Elles illustrent le
principe central de l'audit : **sortir les procédures du fichier d'instructions**. Seule leur courte description est
chargée à chaque session ; leur contenu ne se lit que lorsque la tâche le demande.

- [`skills/chantier-adr`](skills/chantier-adr/SKILL.md) — processus de chantier commun à tous les projets : ADR
  accepté avant tout code, un plan par ADR, six statuts, rouge-vert-refactor avec **preuve du vert** obligatoire pour
  chaque tâche, délégation ciblée aux sous-agents, clôture et archivage. Un projet l'adopte avec une ligne dans son
  `AGENTS.md` ou `CLAUDE.md` : « Aucun code sans ADR accepté. Test rouge d'abord. Clôture selon la skill
  `chantier-adr`. »
- [`skills/audit-solid`](skills/audit-solid/SKILL.md) — audit de code en lecture seule contre SOLID, les code smells de
  Fowler, Clean Code et les règles du projet, avec rapport priorisé. Les références détaillées ne se chargent qu'au
  besoin. Les règles propres à un projet vont dans son `docs/audit/regles-depot.md`, que la skill lit en premier.

**EN** — Two reusable skills: `chantier-adr` (ADR-driven delivery process with a mandatory green-test proof per task)
and `audit-solid` (read-only SOLID / code-smell / clean-code audit driven by per-project rules). Both are in French;
they load only when a task needs them.

## Licence

[MIT](LICENSE)
