# Vérification avant d'écrire le rapport

## Portée

- [ ] Les règles du projet ont été lues : AGENTS.md et `docs/audit/regles-depot.md` (ou l'absence
      de ce fichier est notée dans le rapport).
- [ ] La portée et les exclusions sont écrites en tête du rapport.
- [ ] Les métriques du projet et le churn ont été lancés le jour même (ou leur absence est
      expliquée).
- [ ] Les fichiers lus en entier et ceux seulement survolés sont listés (rien n'est déclaré sain
      sans avoir été lu).

## Couverture des familles

- [ ] Règles normatives du projet (`regles-depot.md`, AGENTS.md) : chacune a des constats ou la
      mention « rien trouvé dans la portée ».
- [ ] Les cinq principes SOLID, chacun avec des constats ou la mention « rien trouvé dans la
      portée ».
- [ ] Principes de composants : cycles (l'arête la moins chère à casser), SDP, zone de douleur.
- [ ] Smells de Fowler : taille, données, résistance au changement, couplage, superflu.
- [ ] Clean Code : noms, fonctions (drapeaux, commande / requête), commentaires, erreurs
      (échecs silencieux), frontières.
- [ ] Code mort.

## Preuve

- [ ] Chaque constat a un `fichier:ligne` vérifié et un extrait **copié du code**, pas reconstruit.
- [ ] Chaque constat dit sa **conséquence concrète** (quel changement futur coûte plus, quel bogue
      devient probable).
- [ ] Chaque P0 et P1 a été relu par un vérificateur distinct de celui qui l'a trouvé.
- [ ] Les cas incertains sont marqués « potentiel », avec ce qui manque pour trancher.
- [ ] Aucun choix tranché par une décision acceptée (ADR) n'est signalé comme défaut sans dire
      quel coût la décision n'a pas vu.
- [ ] Aucun patron voulu (Strategy, Registry, Specification, façade, hôte injecté) n'est pris
      pour un smell.
- [ ] Aucun garde-fou déjà assuré par un test d'architecture ou le lint n'est re-signalé.
- [ ] Les faux positifs et exceptions listés dans `regles-depot.md` ont été appliqués.
- [ ] Les champs supplémentaires exigés par `regles-depot.md` (origine, règle, etc.) sont remplis.

## Corrections

- [ ] Chaque constat nomme sa technique (nom canonique de Fowler) et esquisse l'après.
- [ ] Les corrections qui changeraient un format persistant, un contrat public ou un test à graine
      fixe sont marquées « demande une décision », pas « refactor ».
- [ ] Les gains rapides sont repérés ; l'ordre de correction respecte les dépendances.
- [ ] Chaque P0 et P1 porte un brouillon de décision réutilisable dans un ADR.

## Forme

- [ ] Gabarit `assets/rapport.md` suivi, sections vides retirées.
- [ ] Rapport écrit à l'emplacement prévu (`regles-depot.md`, sinon
      `artifacts/audit/<AAAA-MM-JJ>-<portée>.md`).
- [ ] Réponse à l'utilisateur en dix lignes au plus, sans tableau, avec le marqueur d'ouverture
      qu'exige AGENTS.md le cas échéant.
- [ ] Les vérifications propres au projet listées dans `regles-depot.md` § Vérifications
      supplémentaires sont passées.
