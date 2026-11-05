# SOLID et principes de composants

Chaque principe ci-dessous donne ce qu'il protège, comment le voir dans du TypeScript (les idées
valent pour tout langage), et ce qu'il ne faut pas confondre avec une entorse. La forme concrète
que prend chaque principe dans un projet donné (ports, hôtes, moteur de règles, contextes) se lit
dans `docs/audit/regles-depot.md` du projet.

En TypeScript, « classe » vaut aussi pour **module** : un fichier de fonctions exportées a une
responsabilité, une interface publique et des dépendances, exactement comme une classe.

## S — Responsabilité unique

**Énoncé (Martin)** : un module ne doit avoir qu'**une raison de changer**, c'est-à-dire ne
répondre qu'à un seul acteur (un seul demandeur de changement).

**Signaux**

- Le fichier importe plusieurs contextes sans rapport (nombre de contextes importés ≥ 4).
- Deux vocabulaires dans un même fichier : règles métier et mise en forme d'un texte, calcul et
  persistance, validation et application, logique et colle d'infrastructure.
- Les fonctions exportées se rangent en deux groupes qui ne s'appellent pas entre eux.
- `git log` montre que le fichier change pour des tickets de natures différentes (changement
  divergent).
- Nom attrape-tout : `*-system.ts` de 400 lignes, `utils`, `helpers`, `manager`, `common`.

**Corrections** : Extract Class / Extract Module, Split Phase (calculer puis présenter), Move
Function vers le contexte qui en est l'acteur.

**À ne pas confondre** : une façade ou une composition racine qui délègue à plusieurs modules a
une seule raison de changer (l'orchestration), même si elle importe beaucoup.

## O — Ouvert / fermé

**Énoncé (Meyer, repris par Martin)** : ouvert à l'extension, fermé à la modification. Ajouter un
cas ne doit pas obliger à rouvrir le code qui traite les cas existants.

**Signaux**

- `if`/`switch` sur un identifiant ou un genre de contenu codé en dur.
- Le même `switch (x.kind)` répété dans plusieurs fichiers : chaque nouveau genre impose de tous
  les retrouver (chirurgie au fusil).
- Pour ajouter un contenu (créature, objet, règle, format), il faut toucher du code et pas
  seulement une donnée ou enregistrer une entrée dans un registre.
- Une table de correspondance codée en dur qui double une donnée que le programme lit déjà.

**Corrections** : Replace Conditional with Polymorphism ; Strategy enregistrée dans un registre
indexé par une donnée ; déplacer le cas vers la donnée ou le moteur de règles du projet ; Replace
Type Code with data.

**À ne pas confondre** : un `switch` exhaustif sur une union **fermée par conception** (les
directions, les phases d'un tour), présent en un seul endroit : le compilateur garde l'exhaustivité.

## L — Substitution de Liskov

**Énoncé** : toute implémentation d'un contrat doit pouvoir remplacer une autre sans que
l'appelant le remarque.

**Signaux**

- Une implémentation lève « non pris en charge », renvoie `undefined` là où le contrat promet une
  valeur, ou ignore un paramètre.
- Une implémentation **durcit une précondition** (refuse une entrée que le contrat accepte) ou
  **affaiblit une postcondition** (rend moins que promis).
- L'appelant teste le type concret (`instanceof`, champ discriminant ajouté pour l'occasion) avant
  d'appeler.
- Effets de bord que le contrat ne dit pas (une implémentation de stockage qui notifie l'UI).
- Une implémentation de test (faux, stub) qui se comporte autrement que la vraie : les tests
  mentent (P2 ; P1 si un test vert masque un défaut réel).

**Corrections** : Extract Interface plus étroite ; Replace Subclass with Delegate ; test de
contrat unique, paramétré par implémentation. Un contrat à deux implémentations ou plus sans test
de contrat partagé est un constat P2.

## I — Ségrégation des interfaces

**Énoncé** : aucun client ne doit dépendre de méthodes qu'il n'utilise pas.

**Signaux**

- Interface ou type d'options de plus de sept membres, dont chaque appelant n'utilise qu'une
  partie.
- Paramètre typé par un gros objet (`Game`, l'état complet) alors que la fonction lit deux champs
  (voir aussi Fowler, Feature Envy et Data Clumps inversés).
- Implémentation qui laisse des membres vides ou `() => {}` pour satisfaire le type.
- Interface « fourre-tout » : un même contrat pour lire, écrire, lister et exporter.
- Un objet injecté qui expose tout son hôte à la couche qui le reçoit.

**Corrections** : Extract Interface (interfaces de rôle) ; Introduce Parameter Object réduit ;
en TypeScript structurel, la correction la plus légère est de typer le paramètre par `Pick<…>`
ou par une interface de rôle déclarée près de l'appelant.

## D — Inversion des dépendances

**Énoncé** : les modules de haut niveau ne dépendent pas des modules de bas niveau ; les deux
dépendent d'abstractions, et les abstractions appartiennent au haut niveau.

**Signaux**

- Une arête de dépendance qui remonte (le cœur importe un adaptateur, la couche basse importe la
  couche haute).
- Le cœur construit lui-même un objet concret de bord (`new` d'un adaptateur, accès direct à
  `localStorage`, `fetch`, `Date.now()`, `Math.random()`) au lieu de le recevoir.
- Le contrat d'une dépendance est déclaré côté implémentation au lieu de l'être côté appelant.
- Un test du cœur qui a besoin d'un DOM factice, du réseau ou d'une horloge réelle.

**Corrections** : Extract Interface déclarée côté appelant ; injection par paramètre ou par la
composition racine ; Introduce Adapter.

## Principes de composants (Martin, *Clean Architecture*)

Ils s'appliquent aux **contextes** : un dossier, un paquet, un module de premier niveau. Les
mesures (couplages, instabilité, abstraction) viennent des métriques du projet ou d'un calcul
sur le graphe d'imports.

### Cohésion

- **REP — équivalence réutilisation / livraison** : ce qui se réutilise ensemble se livre
  ensemble. Un outil ou un script qui n'utilise qu'un fichier d'un contexte mais doit en tirer
  dix est un signal.
- **CCP — fermeture commune** : ce qui change pour la même raison vit dans le même contexte. Un
  concept dont chaque évolution touche trois contextes est mal rangé (chirurgie au fusil à
  l'échelle des composants).
- **CRP — réutilisation commune** : ne pas forcer un contexte à dépendre de ce dont il n'a pas
  besoin. Un contexte qui en importe un autre pour une seule fonction utilitaire est un signal.

### Couplage

- **ADP — dépendances acycliques** : aucun cycle entre composants. L'audit ne relève pas chaque
  arête : il désigne **l'arête la moins chère à casser** (la moins utilisée, souvent un seul
  import) et la technique (Move Function, Extract Interface dans le contexte appelé, inversion
  par un registre alimenté de l'extérieur). Un cycle déjà connu et listé (test d'architecture,
  dette documentée) se signale une fois comme dette d'ensemble.
- **SDP — dépendances stables** : on dépend de ce qui est plus stable que soi. Mesure :
  instabilité `I = Ce / (Ca + Ce)`. Une arête d'un contexte stable (I bas) vers un contexte
  instable (I haut) est une entorse : le stable devra changer chaque fois que l'instable change.
- **SAP — abstractions stables** : un contexte stable doit être abstrait (types, interfaces,
  contrats). Mesure : abstraction `A` (part des exports qui sont des types ou interfaces) et
  distance à la séquence principale `D = |A + I − 1|`.
  - **Zone de douleur** (I bas, A bas, D haut) : très utilisé, concret, donc rigide. À examiner :
    quels exports concrets pourraient devenir des contrats ?
  - **Zone d'inutilité** (I haut, A haut) : abstractions que personne n'utilise.

Les types de base et les contextes d'infrastructure auront naturellement un D élevé : un composant
stable et concret qui ne change presque jamais (vérifier le churn) n'est pas douloureux. Un
contexte instable et peu abstrait en bordure du système (validation, adaptateurs) est à sa place.
