---
name: chantier-adr
description: Processus de chantier commun à tous les projets de l'utilisateur, présents et futurs — écrire ou modifier un ADR, créer ou tenir un plan de chantier, changer le statut d'une étape, mener le cycle rouge-vert-refactor, déléguer à des sous-agents, clore une étape ou archiver un plan. À lire avant d'écrire un ADR, d'ouvrir un plan, de démarrer ou de clore une étape (« nouvel ADR », « plan du chantier », « clôture de l'étape », « passe l'étape à Terminée »). Règle non négociable : écrire un plan n'autorise jamais à l'exécuter ; l'agent s'arrête après le plan et attend l'ordre explicite de l'utilisateur.
---

# Chantier : ADR, plan, suivi, test d'abord, délégation, clôture

Processus unique pour tous les projets, présents et futurs. Le `AGENTS.md` du projet ajoute ses propres points de
clôture (commandes, nature des preuves, documents à tenir) ; il ne contredit pas les règles ci-dessous, en particulier
la **preuve du vert** de chaque tâche. Un nouveau projet adopte cette skill en citant dans son `AGENTS.md` : « Aucun code
sans ADR accepté. Test rouge d'abord. Clôture selon la skill `chantier-adr` (`.claude/skills/chantier-adr/SKILL.md`). »

## Règle non négociable : l'implémentation est lancée à la main

**Une fois le plan écrit, l'agent s'arrête.** Il présente le plan, termine son tour et n'implémente rien, même si l'ADR
est accepté, même si le plan paraît simple ou minuscule, même en mode sans permission. Aucune exception, et aucun
`AGENTS.md` de projet ne peut lever cette règle.

- **Seul déclencheur** : un message de l'utilisateur, envoyé **après** la présentation du plan, qui demande explicitement
  de l'implémenter (« lance le plan 003 », « implémente l'étape 2 »).
- **Ne déclenchent pas l'implémentation** : l'acceptation de l'ADR, l'approbation du plan (« ok », « le plan me va »), une
  demande formulée avant l'écriture du plan (« fais l'ADR, le plan et implémente »), la réponse à un arbitrage `Q…`.
- **Dans le doute, ne pas lancer** : demander à l'utilisateur. Ne pas proposer de démarrage automatique, ne pas lancer de
  sous-agent, ne pas écrire de test ni de code « pour préparer ».
- **Portée** : l'ordre fixe le périmètre. « Lance le plan » couvre tout le plan ; « étape 2 » couvre l'étape 2 seule, et
  l'agent s'arrête ensuite.

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
- **Mise à jour au fil de l'eau** : le plan reflète à tout moment l'état réel du chantier. Une étape passe `En cours`
  avant que son travail démarre, et sa fiche et sa ligne du tableau de bord changent dès qu'un résultat arrive, jamais en
  lot à la fin du chantier. **L'agent principal est le seul à écrire dans le plan** (§ 5).
- Le tableau de bord et l'avancement du plan sont commités **dans le même commit** que le code de l'étape.

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
- **Le plan appartient à l'agent principal.** Un sous-agent ne modifie ni le plan, ni `docs/ADR/README.md` ; le brief le
  lui interdit et lui demande de rendre compte, à la fin de sa tâche ou dès un blocage : étape concernée, ce qui est fait,
  fichiers touchés, commande de test et sa ligne verte, ce qui reste à prouver, blocage éventuel.
- **À chaque compte rendu d'un sous-agent, avant toute autre action** (lancer la suite, répondre à l'utilisateur),
  l'agent principal met à jour la fiche de l'étape et sa ligne du tableau de bord : statut, travail fait, tests, preuve du
  vert. Il vérifie ce qu'il consigne : un résultat annoncé sans commande ni sortie verte ne fait pas passer l'étape
  `Terminée`. Une étape prouvée en partie passe `À valider` ; une étape bloquée passe `Bloquée (motif)`.
- En parallèle, chaque retour est consigné à son arrivée, sans attendre les autres sous-agents du lot.
- **Une seule suite complète à la fois** sur la machine : vérifier qu'aucune autre ne tourne avant de la lancer.
- Pas de duplication : importer une fonction, constante ou table depuis son module propriétaire plutôt que la recopier.
- Une fois l'implémentation lancée par l'utilisateur (voir la règle non négociable en tête), enchaîner les étapes du
  périmètre demandé sans redemander d'accord ; rendre compte en fin de périmètre, ou plus tôt en cas de blocage ou de
  décision qui revient à l'utilisateur. Sans cet ordre, aucune étape ne démarre.

## 6. Clôture d'une étape

- Les contrôles du projet passent (voir son `AGENTS.md` : tests, lint, types, build).
- La **preuve du vert** est dans la fiche (§ 4).
- Les autres preuves exigées par le projet sont déposées et liées dans la fiche (captures d'écran, mesures).
- Le statut, la date, les preuves et le tableau de bord sont à jour dans le même commit que le code.
- Puis appliquer la liste de clôture propre au projet, dans son `AGENTS.md`.
