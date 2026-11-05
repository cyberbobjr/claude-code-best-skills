# Clean Code (Robert C. Martin)

Les règles du livre, regroupées par chapitre, puis les heuristiques du chapitre 17 avec leurs
codes (`G5`, `F3`, …) à citer dans le rapport. Adapté à TypeScript ; là où AGENTS.md du projet
tranche autrement (limite de taille de fichier, conventions de nommage, vocabulaire imposé),
AGENTS.md gagne.

## Noms (chapitre 2)

- Un nom révèle l'intention : pourquoi la chose existe, ce qu'elle fait, comment s'en servir.
- Pas de désinformation : un `itemList` qui n'est pas une liste, un `isValid` qui modifie.
- Des distinctions qui veulent dire quelque chose : pas de `data` / `info` / `value2`.
- Prononçable, cherchable : pas de `d`, `tmp`, `cnt` hors d'une boucle de trois lignes.
- Pas d'encodage (préfixes de type, `I` devant une interface), sauf convention imposée par le
  projet.
- Fonctions : un verbe (`computeDamage`) ; types et modules : un nom (`DamageRoll`).
- **Un mot par concept** dans tout le dépôt : si l'on dit `resolve` pour un tour, pas `process`
  ailleurs pour la même idée. Vérifier contre le vocabulaire des ADR et du projet.
- Noms du domaine du problème dans le cœur, noms techniques dans les adaptateurs.

## Fonctions (chapitre 3)

- Petites, puis plus petites encore. Repères : 40 lignes ; complexité cyclomatique au-delà de 10 ;
  imbrication de 4 niveaux.
- **Une seule chose**, à **un seul niveau d'abstraction** : une fonction qui mêle la règle métier
  et l'arithmétique d'indices en fait deux.
- Lecture du haut vers le bas (règle du journal) : chaque fonction suivie de celles qu'elle
  appelle.
- `switch` : toléré s'il apparaît une fois, enfoui dans une fabrique, et crée des objets
  polymorphes. Ailleurs, voir `solid.md` § O.
- Arguments : zéro est idéal, un ou deux bien, trois à justifier, plus est à éviter.
- **Pas d'argument drapeau** : la fonction fait deux choses.
- Pas d'effet de bord caché : une fonction `check…` ou `get…` ne modifie rien.
- **Séparation commande / requête** : une fonction fait quelque chose ou répond à une question.
- Exceptions plutôt que codes d'erreur, et le traitement d'erreur extrait dans sa propre fonction.
- DRY : chaque connaissance a une représentation unique.

## Commentaires (chapitre 4)

- Un commentaire compense un code qui ne s'exprime pas : d'abord réécrire le code.
- Bons : intention et raison d'une décision, référence d'ADR, avertissement de conséquence,
  `TODO` daté et rattaché à une étape de plan, documentation d'une API publique.
- Mauvais : marmonnement, redondance avec le code, commentaire obligatoire vide, journal de
  modifications, code commenté, commentaire qui ment depuis un changement.

## Mise en forme (chapitre 5)

Si un formateur automatique (Prettier…) tranche la forme, ne pas la relever. Restent : ouverture
verticale entre concepts, proximité des fonctions qui s'appellent, déclarations près de leur
usage.

## Objets et structures de données (chapitre 6)

- Un objet cache ses données et expose des comportements ; une structure expose ses données et n'a
  pas de comportement. Les hybrides cumulent les défauts des deux.
- **Loi de Déméter** : une fonction ne parle qu'à ses amis immédiats (ses paramètres, ce qu'elle
  crée, ses champs), pas aux amis de ses amis. `game.player.inventory.items[0].affixes` est un
  « accident de train » (voir Fowler, Message Chains).
- Les états sérialisés sont des structures voulues ; la loi de Déméter s'applique aux **modules
  qui les manipulent**, pas aux données.

## Gestion des erreurs (chapitre 7)

- Ne pas rendre `null` quand une valeur est attendue, ne pas passer `null` en argument.
- Erreurs traitées **aux frontières** : validation des données au chargement, lecture de
  sauvegarde, entrées externes. Le cœur reçoit des données valides et ne se défend pas à chaque
  appel.
- **Aucun échec silencieux** : un `catch` vide, une valeur neutre rendue à la place d'un
  comportement manquant, un cas ignoré par un `default:` muet. Gravité fixée par le projet
  (souvent P0 si AGENTS.md l'interdit).
- Messages d'erreur avec le contexte de l'échec.

## Frontières (chapitre 8)

- Le code tiers (framework, API du navigateur) reste derrière un adaptateur que l'on possède. Un
  type tiers qui traverse le cœur est une fuite (DIP).
- Les tests d'apprentissage d'une bibliothèque tierce protègent des montées de version.

## Tests unitaires (chapitre 9)

Seulement si la portée inclut les tests. Un concept par test ; code de test aussi propre que le
code de production. **F.I.R.S.T.** : *Fast* (rapides), *Independent* (sans ordre imposé),
*Repeatable* (graines fixes, aucune horloge ni réseau réels), *Self-validating* (pas de lecture
humaine), *Timely* (écrits avant ou avec le code, selon le processus du projet). Les règles
d'assertion et de test du projet sont dans son `regles-depot.md`.

## Classes (chapitre 10)

- Petites, mesurées en **responsabilités**, pas en lignes.
- Cohésion : chaque fonction d'un module utilise une bonne part de son état. Un module dont deux
  groupes de fonctions ne partagent rien se coupe en deux.
- Organisées pour le changement : ajouter un cas ne rouvre pas le module (OCP).

## Émergence (chapitre 12) — les quatre règles de la conception simple (Beck)

Par ordre de priorité : tous les tests passent ; aucune duplication ; le code exprime l'intention
du programmeur ; le nombre de modules et de fonctions est minimal. La quatrième sert d'arbitre
contre la généralité spéculative.

## Heuristiques du chapitre 17

Citer le code dans le rapport (`G30`, `N1`, …).

**Commentaires** — C1 information mal placée (historique, auteur : c'est le travail de git) ·
C2 commentaire obsolète · C3 commentaire redondant · C4 commentaire mal écrit · C5 code commenté.

**Environnement** — E1 construire demande plus d'une étape · E2 tester demande plus d'une étape.

**Fonctions** — F1 trop d'arguments · F2 argument de sortie (on modifie un paramètre) ·
F3 argument drapeau · F4 fonction morte.

**Général** —
G1 plusieurs langages dans un fichier (HTML ou CSS écrits en chaînes dans un module TypeScript) ·
G2 comportement évident non implémenté · G3 comportement incorrect aux limites ·
G4 sécurités désactivées (`eslint-disable`, `as any`, `@ts-ignore`, `!` non justifiés, grappes de
`!`) · G5 duplication · G6 code au mauvais niveau d'abstraction ·
G7 classe de base qui dépend de ses dérivées · G8 trop d'information exposée (interface large) ·
G9 code mort · G10 séparation verticale (déclaration loin de l'usage) · G11 incohérence ·
G12 fouillis · G13 couplage artificiel (une constante générale rangée dans un module spécialisé) ·
G14 envie de fonctionnalité (Feature Envy) · G15 argument sélecteur ·
G16 intention obscure · G17 responsabilité mal placée · G18 statique inapproprié ·
G19 variables explicatives manquantes · G20 nom de fonction qui ne dit pas ce qu'elle fait ·
G21 algorithme non compris (le code marche « par hasard ») ·
G22 dépendance logique non rendue physique (un module suppose un fait d'un autre sans le lui
demander) · G23 `if`/`switch` au lieu du polymorphisme ·
G24 conventions du dépôt non suivies · G25 nombres magiques au lieu de constantes nommées (une
valeur d'équilibrage ou de configuration relève parfois d'un fichier de données, pas d'une
constante) · G26 imprécision (arrondi, comparaison de flottants, division entière, débordement) ·
G27 structure plutôt que convention · G28 conditions non encapsulées ·
G29 conditions négatives · G30 une fonction fait plus d'une chose ·
G31 couplage temporel caché (deux appels à faire dans un ordre que rien n'impose) ·
G32 arbitraire (structure sans raison) · G33 conditions aux limites non encapsulées (`+ 1`
répétés) · G34 une fonction descend de plus d'un niveau d'abstraction ·
G35 donnée de configuration enfouie au lieu d'être en haut · G36 navigation transitive (Déméter).

**Noms** — N1 noms descriptifs · N2 noms au bon niveau d'abstraction · N3 nomenclature standard
(noms de patrons, vocabulaire du domaine) · N4 noms sans ambiguïté · N5 noms longs pour les
grandes portées · N6 pas d'encodage · N7 les noms décrivent les effets de bord.

**Tests** — T1 tests insuffisants · T2 outil de couverture absent (ne pas le relever si le projet
ne veut aucun seuil) · T3 tests triviaux sautés · T4 test ignoré = question ouverte · T5 limites
non testées · T6 tester à fond autour d'un défaut trouvé · T7 schémas d'échec révélateurs ·
T8 schémas de couverture révélateurs · T9 tests lents.
