# Code smells (Fowler, *Refactoring*, 2ᵉ édition)

Les vingt-quatre odeurs du chapitre 3, avec leur nom canonique (à citer tel quel dans le
rapport), le coût qu'elles font payer, comment les voir et les techniques de correction
(détaillées dans `smell-to-technique.md`). Les seuils sont des signaux : un candidat ne devient
constat que si sa conséquence est concrète. Les exceptions propres à un projet (fichier gros par
nature, état sérialisé voulu en données pures…) sont dans son `docs/audit/regles-depot.md`.

## Nommage et duplication

**Mysterious Name** — un nom qui ne dit pas ce que fait la chose oblige chaque lecteur à lire le
corps. Signaux : `data`, `info`, `handle`, `process`, `tmp`, abréviations, booléens sans
`is/has/can`, un nom qui ment depuis un changement. *Correction* : Change Function Declaration,
Rename Variable, Rename Field. Si aucun bon nom ne vient, la chose fait sans doute trop.

**Duplicated Code** — la même logique à deux endroits change en deux fois, et un jour une seule.
Signaux : blocs dupliqués mesurés ; mêmes calculs avec d'autres constantes ; règle du cœur
recopiée dans un outil ou un script (souvent grave : deux vérités). *Correction* : Extract
Function, Slide Statements puis extraction, Pull Up Method, Form Template Method.

## Taille

**Long Function** — plus une fonction est longue, plus elle est difficile à comprendre ; le
découpage par intention nomme les étapes. Signaux : fonctions > 40 lignes ; un commentaire qui
annonce un bloc ; boucles et conditions longues. *Correction* : Extract Function (nommer ce que
fait chaque bloc), Replace Temp with Query, Decompose Conditional, Split Loop, Replace Function
with Command.

**Long Parameter List** — chaque appel devient fragile et illisible. Signaux : 4 arguments ou
plus ; mêmes arguments passés ensemble partout. *Correction* : Introduce Parameter Object,
Preserve Whole Object, Replace Parameter with Query, Remove Flag Argument.

**Large Class** — un module qui fait trop a trop de champs, trop de code et plusieurs raisons de
changer (voir `solid.md` § S). Signaux : fichier > 300 lignes (ou la limite du projet), groupes de
fonctions indépendants. *Correction* : Extract Class / Extract Module, Extract Superclass,
Replace Type Code with Subclasses.

## Données

**Global Data** — n'importe qui peut la changer, personne ne sait qui l'a fait. Signaux : `let`
au niveau d'un module, singleton mutable, état partagé importé, état global qui échappe à la
sauvegarde ou survit d'une partie ou d'une requête à l'autre. *Correction* : Encapsulate
Variable, puis restreindre la portée.

**Mutable Data** — une mutation à un endroit casse une hypothèse ailleurs. Signaux : objets
modifiés en place par plusieurs systèmes ; tableaux reçus en paramètre et modifiés. *Correction* :
Encapsulate Variable, Separate Query from Modifier, Split Variable, Replace Derived Variable with
Query, Change Reference to Value. Dans un cœur déterministe (graine fixe, reprise de sauvegarde),
une mutation non locale est aussi un risque pour la rejouabilité.

**Data Clumps** — les mêmes trois ou quatre données voyagent toujours ensemble (`x, y, floor` ;
`min, max`) : il manque un type. *Correction* : Extract Class, Introduce Parameter Object.

**Primitive Obsession** — des `string` et `number` portent un sens métier (identifiant, monnaie,
coordonnée, pourcentage, numéro de forme, tick) sans type qui l'exprime ni le valide.
*Correction* : Replace Primitive with Object ; en TypeScript, un type marqué
(`type ItemId = string & { readonly __brand: 'ItemId' }`) ou une union littérale.

**Temporary Field** — un champ qui n'a de sens que dans certains cas, vide le reste du temps.
*Correction* : Extract Class, Introduce Special Case, union discriminée.

**Data Class** — un type qui ne porte que des données, pendant que la logique qui le concerne
traîne chez ses clients. *Correction* : Move Function vers le module du type, Encapsulate
Record. Attention : un état sérialisé (sauvegarde, JSON de configuration, fichier normalisé) est
souvent **voulu** en données pures, avec la logique dans un module voisin. Ce n'est un smell que
si cette logique est éparpillée chez plusieurs clients.

## Résistance au changement

**Divergent Change** — un module change pour des raisons différentes (le pendant local de la
responsabilité unique). Signaux : churn élevé sur des tickets de natures différentes ; nombre de
contextes importés. *Correction* : Split Phase, Move Function, Extract Class.

**Shotgun Surgery** — un seul changement oblige à toucher beaucoup de modules. Signaux : ajouter
un contenu ou une règle touche plusieurs contextes ; `git log` montre des fichiers toujours
modifiés ensemble ; un concept éclaté entre plusieurs fichiers. *Correction* : Move Function,
Move Field, Combine Functions into Class, Inline Function puis réextraction au bon endroit.

**Repeated Switches** — le même `switch`/`if` sur le même discriminant dans plusieurs fichiers :
chaque nouveau cas les rouvre tous (voir `solid.md` § O). *Correction* : Replace Conditional with
Polymorphism, registre de stratégies indexé par la donnée, déplacement vers la donnée ou le moteur
de règles.

## Couplage

**Feature Envy** — une fonction s'intéresse plus aux données d'un autre module qu'aux siennes.
Signaux : chaîne d'accès `other.a.b`, `other.c` dans tout le corps. *Correction* : Move
Function, Extract Function puis Move. Exception : les patrons Strategy et Visitor séparent
exprès donnée et comportement.

**Insider Trading** — deux modules échangent trop de détails internes. Signaux : un contexte
importe des fonctions internes d'un autre au lieu d'un point d'entrée ; cycles entre deux
fichiers. *Correction* : Move Function, Move Field, Hide Delegate, Replace Subclass with
Delegate.

**Message Chains** — `a.b().c().d` : l'appelant connaît toute la structure. *Correction* : Hide
Delegate, Extract Function puis Move Function.

**Middle Man** — un module qui ne fait que déléguer. *Correction* : Remove Middle Man, Inline
Function. Exception : une façade voulue (point d'entrée d'un contexte, port, hôte injecté) n'est
pas un intermédiaire.

**Alternative Classes with Different Interfaces** — deux modules font la même chose sous deux
signatures, ce qui empêche de les substituer. *Correction* : Change Function Declaration, Move
Function, Extract Superclass ou interface commune.

**Refused Bequest** — un héritier (ou une implémentation) n'utilise pas ce qu'il reçoit, voire le
refuse. Voir `solid.md` § L. *Correction* : Push Down Method, Replace Subclass with Delegate,
Replace Superclass with Delegate.

## Superflu

**Lazy Element** — une fonction ou un module qui n'apporte rien de plus que ce qu'il emballe.
*Correction* : Inline Function, Inline Class, Collapse Hierarchy.

**Speculative Generality** — paramètre, crochet ou abstraction « au cas où », sans second usage.
Signaux : interface à une implémentation sans décision ni besoin connu d'en avoir une seconde ;
paramètre toujours passé à la même valeur ; export que seul un test utilise (code mort au sens du
graphe). Beaucoup de projets n'introduisent un patron qu'au deuxième cas constaté : le vérifier
dans AGENTS.md. *Correction* : Collapse Hierarchy, Inline Function, Change Function Declaration,
Remove Dead Code.

**Loops** — une boucle qui filtre, transforme et accumule en même temps cache l'intention.
*Correction* : Replace Loop with Pipeline (`filter`, `map`, `reduce`). Exception : boucle chaude
mesurée, où la performance justifie la forme.

**Comments** — un commentaire qui explique **ce que** fait un code peu clair est un désodorisant.
Signaux : commentaire en tête de bloc (→ extraire et nommer), commentaire qui paraphrase le code,
commentaire périmé. *Correction* : Extract Function, Change Function Declaration, Introduce
Assertion. Les commentaires qui disent **pourquoi** (décision, référence d'ADR, piège) restent.

## Code mort

Pas une odeur du chapitre 3, mais Fowler traite la suppression (Remove Dead Code) et c'est le
gain le moins cher : exports orphelins, fonctions jamais appelées, exports que seuls les tests
utilisent. Un test qui ne garde qu'un code mort part avec lui. Vérifier d'abord qu'aucun point
d'entrée dynamique (configuration, réflexion, fichier d'outil de build) ne l'utilise.
