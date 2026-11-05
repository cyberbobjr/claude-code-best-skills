# Du smell à la technique de correction

Noms canoniques du catalogue de Fowler (*Refactoring*, 2ᵉ édition), à citer tels quels. Chaque
technique préserve le comportement : elle s'applique à tests verts (étape « refactor »), sans
changer de format persistant.

## Table de correspondance

| Smell / principe | Techniques, de la plus légère à la plus lourde |
| --- | --- |
| Mysterious Name | Rename Variable · Rename Field · Change Function Declaration |
| Duplicated Code | Extract Function · Slide Statements · Pull Up Method · Form Template Method |
| Long Function | Extract Function · Replace Temp with Query · Decompose Conditional · Split Loop · Replace Function with Command |
| Long Parameter List | Remove Flag Argument · Replace Parameter with Query · Preserve Whole Object · Introduce Parameter Object · Combine Functions into Class |
| Global Data | Encapsulate Variable |
| Mutable Data | Encapsulate Variable · Split Variable · Separate Query from Modifier · Replace Derived Variable with Query · Change Reference to Value |
| Divergent Change | Split Phase · Move Function · Extract Class |
| Shotgun Surgery | Move Function · Move Field · Combine Functions into Class · Combine Functions into Transform · Inline Function |
| Feature Envy | Move Function · Extract Function |
| Data Clumps | Introduce Parameter Object · Extract Class · Preserve Whole Object |
| Primitive Obsession | Replace Primitive with Object · Replace Type Code with Subclasses · Introduce Parameter Object |
| Repeated Switches | Replace Conditional with Polymorphism · registre de stratégies indexé par la donnée |
| Loops | Replace Loop with Pipeline |
| Lazy Element | Inline Function · Inline Class · Collapse Hierarchy |
| Speculative Generality | Collapse Hierarchy · Inline Function · Change Function Declaration · Remove Dead Code |
| Temporary Field | Extract Class · Move Function · Introduce Special Case |
| Message Chains | Hide Delegate · Extract Function · Move Function |
| Middle Man | Remove Middle Man · Inline Function · Replace Superclass with Delegate |
| Insider Trading | Move Function · Move Field · Hide Delegate · Replace Subclass with Delegate |
| Large Class | Extract Class · Extract Superclass · Replace Type Code with Subclasses |
| Alternative Classes with Different Interfaces | Change Function Declaration · Move Function · Extract Superclass |
| Data Class | Encapsulate Record · Remove Setting Method · Move Function · Split Phase |
| Refused Bequest | Push Down Method · Push Down Field · Replace Subclass with Delegate · Replace Superclass with Delegate |
| Comments | Extract Function · Change Function Declaration · Introduce Assertion |
| Dead code | Remove Dead Code |
| Échec silencieux | Introduce Assertion · lever une erreur explicite à la place de la valeur neutre · traiter le cas manquant |
| SRP | Extract Class · Split Phase · Move Function |
| OCP | Replace Conditional with Polymorphism · Strategy en registre · déplacement vers la donnée ou le moteur de règles · Replace Type Code with data |
| LSP | Extract Interface · Replace Subclass with Delegate · test de contrat partagé |
| ISP | Extract Interface (interfaces de rôle) · `Pick<…>` sur le paramètre |
| DIP | Extract Interface côté appelant · injection par paramètre ou par la composition racine · Introduce Adapter |
| Cycle entre contextes (ADP) | Move Function vers le contexte appelé · Extract Interface dans le contexte stable · inversion par un registre alimenté depuis l'extérieur |

## Les techniques, en une ligne chacune

**Composer** — *Extract Function* : nommer un fragment par son intention et l'appeler. *Inline
Function* : l'inverse, quand le corps est aussi clair que le nom. *Extract Variable* / *Inline
Variable* : nommer une sous-expression, ou retirer un nom inutile. *Change Function
Declaration* : renommer, ajouter ou retirer un paramètre. *Split Phase* : séparer un calcul en
deux étapes reliées par une structure intermédiaire (analyser puis appliquer ; calculer puis
présenter). *Replace Function with Command* : faire d'une fonction trop complexe un objet dont
les étapes deviennent des méthodes.

**Encapsuler** — *Encapsulate Variable* : remplacer l'accès direct par des fonctions d'accès.
*Encapsulate Record* : un objet littéral partagé devient un type avec ses opérations.
*Encapsulate Collection* : ne jamais rendre la collection modifiable elle-même. *Replace
Primitive with Object* : donner un type au sens métier. *Replace Temp with Query* : une variable
calculée devient une fonction. *Extract Class* : déplacer un groupe de champs et de fonctions
cohérent dans son propre module. *Inline Class* : l'inverse. *Hide Delegate* : l'appelant ne
traverse plus la structure. *Remove Middle Man* : l'inverse quand la délégation n'apporte rien.
*Substitute Algorithm* : remplacer un algorithme par un plus clair.

**Déplacer** — *Move Function* / *Move Field* : vers le module qui en est le vrai propriétaire.
*Move Statements into Function* / *to Callers* : ajuster la frontière d'une fonction. *Slide
Statements* : rapprocher des lignes liées (prépare une extraction). *Split Loop* : une boucle,
une tâche. *Replace Loop with Pipeline*. *Remove Dead Code*.

**Organiser les données** — *Split Variable* : une variable, un sens. *Replace Derived Variable
with Query* : ne plus stocker ce qui se calcule. *Change Reference to Value* / *Value to
Reference* : choisir entre valeur immuable et entité partagée.

**Simplifier les conditions** — *Decompose Conditional* : extraire la condition et chaque
branche. *Consolidate Conditional Expression* : fusionner des tests au même résultat. *Replace
Nested Conditional with Guard Clauses* : sortir tôt des cas particuliers. *Replace Conditional
with Polymorphism* : une stratégie par cas. *Introduce Special Case* : un objet pour le cas
particulier (vide, inconnu) au lieu de tests répétés. *Introduce Assertion* : rendre une
hypothèse explicite.

**Refondre les API** — *Separate Query from Modifier* : une fonction lit ou modifie, pas les
deux. *Parameterize Function* : fusionner des fonctions qui ne diffèrent que par une valeur.
*Remove Flag Argument* : une fonction par valeur du drapeau. *Preserve Whole Object* : passer
l'objet plutôt que trois de ses champs. *Replace Parameter with Query* / *Query with
Parameter* : choisir qui calcule la valeur (le second rend une fonction pure, utile à un cœur
déterministe). *Remove Setting Method*. *Replace Constructor with Factory Function*. *Replace
Command with Function*.

**Héritage et délégation** — *Pull Up* / *Push Down Method* et *Field* : placer le membre au bon
niveau. *Replace Type Code with Subclasses*. *Extract Superclass*. *Collapse Hierarchy*.
*Replace Subclass with Delegate* / *Replace Superclass with Delegate* : préférer la composition.
*Form Template Method* : factoriser le squelette commun, garder les étapes différentes.

## Choisir

- Préférer la technique la plus **petite** qui supprime la conséquence. Une extraction de
  fonction vaut mieux qu'un nouveau patron.
- Une correction qui introduit un patron le **nomme** (fichier, en-tête, ADR), et seulement au
  deuxième cas constaté si AGENTS.md le demande.
- Une correction qui changerait un format persistant (sauvegarde, JSON de données), un contrat
  public ou une valeur de test à graine fixe n'est plus un refactor : la signaler comme telle,
  elle demande une décision (ADR ou accord de l'utilisateur). Les contraintes supplémentaires du
  projet (parité avec une référence, absence de migration…) sont dans son `regles-depot.md`.
