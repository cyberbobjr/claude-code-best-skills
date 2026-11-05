---
name: chantier-adr
description: Processus de chantier commun à tous les projets de l'utilisateur, présents et futurs — écrire ou modifier un ADR, créer ou tenir un plan de chantier, changer le statut d'une étape, mener le cycle rouge-vert-refactor, déléguer à des sous-agents, clore une étape ou archiver un plan. À lire avant d'écrire un ADR, d'ouvrir un plan, de démarrer ou de clore une étape (« nouvel ADR », « plan du chantier », « clôture de l'étape », « passe l'étape à Terminée »).
---

# Chantier : ADR, plan, suivi, test d'abord, délégation, clôture

Processus unique pour tous les projets, présents et futurs. Le `AGENTS.md` du projet ajoute ses propres points de
clôture (commandes, nature des preuves, documents à tenir) ; il ne contredit pas les règles ci-dessous, en particulier
la **preuve du vert** de chaque tâche. Un nouveau projet adopte cette skill en citant dans son `AGENTS.md` : « Aucun code
sans ADR accepté. Test rouge d'abord. Clôture selon la skill `chantier-adr` (`~/.claude/skills/chantier-adr/SKILL.md`). »

## 1. Décision : un ADR avant tout code

Aucun code n'est écrit sans une décision consignée dans un ADR **accepté** de `docs/ADR/`.

- **En-tête** en tableau : `Identifiant` (`ADR-<NNN>-<SLUG>`), `Date de création et de mise à jour`, `Statut`,
  `Avancement`, `Décideur`, `Portée`, `Documents liés`, `Références` (plus `Origine` si l'ADR vient d'un audit). Prendre
  pour modèle un ADR existant du projet.
- **Numérotation** : trois chiffres, attribués à la création, jamais réattribués (même rejeté ou remplacé). Le même
  numéro dans le nom du fichier (`docs/ADR/<NNN>-<slug>.md`), le titre (`# ADR-<NNN> — <titre>`) et l'identifiant.
  Nouveau numéro = plus grand numéro utilisé + 1 (`ls docs/ADR/ docs/ADR/termines/`).
- **Statuts** : `Proposé` · `Accepté` · `Remplacé par <ADR-…>` · `Rejeté`. Le statut décrit la décision, jamais
  l'avancement du code (qui appartient au plan).
- **Décisions** numérotées `D01`, `D02`… ; **arbitrages ouverts** `Q01`, `Q02`…. Une étape dont le contenu dépend d'un
  arbitrage ouvert ne démarre pas avant qu'il soit rendu.
- **Changement de décision** : nouvel ADR, ou mise à jour datée qui garde la décision précédente et sa raison. Jamais
  de réécriture silencieuse.
- Le code qui contredit un ADR accepté est un défaut : corriger le code, ou faire trancher et mettre l'ADR à jour avant
  de continuer.

## 2. Planification : un ADR, un plan

- **Un plan par ADR**, seul ordre de livraison : `docs/ADR-plans/plan-<NNN>-<chantier>.md`, numéro de son ADR, titre
  `# Plan <NNN> — <titre>`, ADR cité en en-tête. Un ADR qui appellerait deux ordres de livraison porte deux décisions :
  il se scinde en deux ADR. Un plan qui déroule plusieurs ADR prend le plus petit numéro et nomme les autres.
- **Tableau de bord** en tête, colonnes `#`, `Étape`, `Statut`, `Dépend de`, `Décisions ADR`, `Taille`,
  `Parallélisable avec`. Chaque étape a ensuite sa fiche, qui porte la **preuve du vert** (§ 4).
- `docs/ADR-plans/` ne reçoit que des plans en cours. Un document de cadrage sans tâche ni statut vit dans `docs/`.
- **Archivage** : un plan dont toutes les étapes sont `Terminée` ou `Annulée` part dans `docs/ADR-plans/termines/`,
  son ADR dans `docs/ADR/termines/` (avancement « Terminé le <date> »), sans changer de nom ni de numéro. Un ADR archivé
  reste une décision en vigueur.
- L'état d'ensemble se lit dans `docs/ADR/README.md`, mis à jour avec le plan qu'il décrit.

## 3. Suivi : six statuts

`À faire` · `En cours` · `À valider` · `Terminée (date)` · `Bloquée (motif)` · `Annulée (motif)`

- `À valider` : code et tests présents, mais une recette ou une mesure manque.
- `Terminée` : toujours avec sa date et ses preuves.
- Le motif d'un statut `Bloquée` ou `Annulée` entre dans le statut.
- Le tableau de bord et l'avancement du plan se mettent à jour **dans le même commit** que le code de l'étape.

## 4. Développement : rouge, vert, refactor

Pour tout comportement nouveau et tout défaut corrigé, dans cet ordre :

1. **Rouge** : écrire le test, le lancer, constater l'échec. C'est une discipline de travail : le rouge n'est pas
   consigné dans le plan.
2. **Vert** : l'implémentation minimale qui le fait passer, sans généralité spéculative.
3. **Refactor** : restructurer et mutualiser à tests verts, sans changer le comportement attendu.

**Preuve du vert, obligatoire pour chaque tâche du plan.** La fiche de la tâche cite la commande lancée et sa sortie
verte (ligne décisive : nombre de tests passés, zéro échec), après le refactor, ou lie le fichier qui la contient. Sans
preuve du vert, la tâche ne passe pas `Terminée`. Un pur déplacement ou une suppression de copie a la même preuve : la
suite verte après le changement.

Un test à graine fixe dont le résultat change est justifié avant d'être rebasé ; un rebasage non expliqué est une
régression.

## 5. Délégation

- Déléguer les étapes volumineuses ou parallélisables, pas les petites corrections (un sous-agent repart de zéro et
  coûte plus cher qu'un travail direct). Lancer dans un seul message les sous-agents indépendants.
- Brief autonome : objectif, périmètre, fichiers (disjoints entre sous-agents), contraintes, critère de réussite, rappel
  du test d'abord. Un modèle léger exécute bien un plan précis ; il ne conçoit pas l'architecture.
- **Une seule suite complète à la fois** sur la machine : vérifier qu'aucune autre ne tourne avant de la lancer.
- Pas de duplication : importer une fonction, constante ou table depuis son module propriétaire plutôt que la recopier.
- À l'intérieur d'un plan dont l'ADR est accepté, enchaîner les étapes sans redemander d'accord ; rendre compte en fin de
  plan, ou plus tôt en cas de blocage ou de décision qui revient à l'utilisateur.

## 6. Clôture d'une étape

- Les contrôles du projet passent (voir son `AGENTS.md` : tests, lint, types, build).
- La **preuve du vert** est dans la fiche (§ 4).
- Les autres preuves exigées par le projet sont déposées et liées dans la fiche (captures d'écran, mesures).
- Le statut, la date, les preuves et le tableau de bord sont à jour dans le même commit que le code.
- Puis appliquer la liste de clôture propre au projet, dans son `AGENTS.md`.
