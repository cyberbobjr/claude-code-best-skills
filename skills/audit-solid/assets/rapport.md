# Gabarit du rapport d'audit

Remplacer les `{{…}}`, retirer les sections vides. Écrire à l'emplacement indiqué par
`docs/audit/regles-depot.md` du projet, sinon dans `artifacts/audit/<AAAA-MM-JJ>-<portée>.md`.
Les champs et sections marqués « projet » ne servent que si `regles-depot.md` les prévoit.

````markdown
# Audit SOLID et Clean Code — {{portée}}

| Champ | Valeur |
| --- | --- |
| Date | {{AAAA-MM-JJ}} |
| Portée | {{dossiers analysés}} ; exclus : {{…}} |
| Commit | {{git rev-parse --short HEAD}} {{+ références du projet}} |
| Règles du projet | {{AGENTS.md, docs/audit/regles-depot.md — ou « aucune règle propre trouvée »}} |
| Mesures | {{fichiers de métriques et de graphe produits}} |
| Lu en entier | {{n}} fichiers ; survolé : {{n}} (liste en annexe) |

## Synthèse

{{Deux à quatre phrases : l'état d'ensemble et la plus forte opportunité, en premier.}}

| Gravité | Constats |
| --- | --- |
| P0 critique | {{n}} |
| P1 haute | {{n}} |
| P2 moyenne | {{n}} |
| P3 basse | {{n}} |

### Les cinq qui comptent le plus

| # | Constat | Lieu | Effort | Gain |
| --- | --- | --- | --- | --- |
| {{F01}} | {{titre}} | `{{fichier:ligne}}` | {{faible / moyen / fort}} | {{ce que la correction rend moins cher}} |

### Gains rapides

- {{F…}} — {{une ligne}}

## Santé de l'architecture

- **Couches** : {{respect du sens des dépendances, interfaces, points d'entrée}}
- **Contextes** : {{cycles ; arête la moins chère à casser ; contextes en zone de douleur (I, A, D)}}
- **Extension par les données** : {{ce qui exige encore du code pour ajouter un contenu}}
- **Points chauds** : {{fichiers à fort churn × complexité × fan-in}}
- {{Lignes propres au projet : pureté du cœur, fidélité à une référence, reste à porter…}}

## Règles du projet

Constats sur les règles normatives de `regles-depot.md` / AGENTS.md (une ligne par règle,
même vide).

| Règle | Verdict | Constats |
| --- | --- | --- |
| {{règle}} | {{respectée / enfreinte / non vérifiable}} | {{F…}} |

## Constats

### P0 — critique

#### {{F01}} — {{titre}}

- **Règle** : {{règle du projet / décision ADR / principe SOLID / smell Fowler / heuristique Gnn}}
- **Origine** : {{si le projet en définit : ajouté / écart / hérité, avec référence}}
- **Lieu** : `{{fichier}}:{{début}}-{{fin}}`
- **Confiance** : {{certaine / probable / potentielle}} — vérifié par {{agent ou lecture directe}}
- **Conséquence** : {{quel changement futur coûte plus, quel bogue devient probable}}

```ts
{{extrait réel, 12 lignes au plus}}
```

- **Correction** : {{technique Fowler}} — {{esquisse de l'après, en code ou en prose}}
- **Effort** : {{faible / moyen / fort}} ; **risque** : {{format persistant, contrat public, test à graine fixe, parité avec une référence}}
- **Brouillon de décision** : « {{phrase prête pour la section Décisions d'un ADR}} »

### P1 — haute

{{même bloc}}

### P2 — moyenne

{{même bloc, brouillon de décision facultatif}}

### P3 — basse

| # | Lieu | Constat | Correction |
| --- | --- | --- | --- |
| {{F…}} | `{{fichier:ligne}}` | {{…}} | {{…}} |

## Ordre de correction proposé

1. {{F…}} — {{pourquoi d'abord : débloque F…, casse le cycle X}}

## Sections propres au projet

{{Par exemple « Hérité » (constats non corrigeables sans décision) ou « Reste à porter » ; les
retirer si `regles-depot.md` n'en prévoit pas.}}

## Écartés

| Signal | Lieu | Raison |
| --- | --- | --- |
| {{ligne de métriques}} | `{{…}}` | {{voulu par ADR-NNN / patron Strategy / faux positif du projet}} |

## Limites

- {{zones survolées, signaux non confirmés, ce qu'un humain doit trancher}}

## Annexe — fichiers lus

{{liste}}
````
