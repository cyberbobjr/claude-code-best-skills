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

1. **mesurer** ce qui est chargé à chaque session (`CLAUDE.md`/`AGENTS.md`, imports `@`, mémoire, serveurs MCP,
   sous-agents, hooks, réglages de modèle et d'effort) ;
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
- **Le cache compte plus que la compression.** Changer de modèle, d'accélération, de serveur MCP en cours de session,
  ou revenir après une longue pause, refacture tout l'historique.
- **Les sous-agents ne sont pas gratuits.** Chacun repart de zéro. Haiku pour l'exploration et les tâches simples,
  oui ; déléguer une petite recherche, non.
- **Les compteurs « tokens économisés » ne sont pas la facture.** Les mesures indépendantes de RTK, de Caveman et de la
  compression des sorties d'outils trouvent des effets faibles, parfois des coûts en hausse. Seul le coût par tâche
  réussie fait foi.

Les sources sont citées dans le prompt. Les chiffres évoluent avec les versions : le prompt demande de les revérifier
s'ils datent.

## Licence

[MIT](LICENSE)
