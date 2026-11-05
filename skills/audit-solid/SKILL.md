---
name: audit-solid
description: Audit complet du code de n'importe quel projet de l'utilisateur (ou d'un dossier) contre SOLID, les code smells de Fowler, Clean Code de Robert C. Martin et les règles propres au projet (AGENTS.md, docs/audit/regles-depot.md) ; rend un rapport priorisé, preuves à l'appui, avec la correction proposée pour chaque constat. Lecture seule. À utiliser pour « audit SOLID », « audit du code », « revue d'architecture », « code smells », « antipatterns », « dette technique », « factorisation » ou « refactoring à prévoir » sur tout un projet ou une partie. Ne relit pas un diff, ne chasse ni les failles de sécurité ni les lenteurs.
---

# Audit SOLID et Clean Code

Trouver ce qui rend le **prochain changement** plus cher qu'il ne devrait, le prouver par le code,
et proposer la correction. Un principe enfreint sans conséquence concrète n'est pas un constat ;
un constat sans `fichier:ligne` et sans extrait réel non plus.

L'audit ne modifie aucun fichier source. Il n'écrit que le rapport et les sorties de mesure, dans
le dossier de rapports du projet (voir étape 0).

Le skill est **générique** : tout ce qui est propre à un projet (règles normatives, gravité,
faux positifs, scripts de métriques, découpage en zones, emplacement du rapport) vit dans le
projet, pas ici.

## Références (à lire selon le besoin, pas d'un bloc)

Chemins relatifs à ce dossier (`~/.claude/skills/audit-solid/`).

| Fichier | Quand le lire |
| --- | --- |
| `references/solid.md` | Pour chaque module : les cinq principes et les principes de composants |
| `references/fowler-smells.md` | Pour qualifier un candidat issu des mesures ou de la lecture |
| `references/smell-to-technique.md` | Pour choisir la correction d'un constat confirmé |
| `references/clean-code.md` | Pour les noms, fonctions, commentaires, erreurs, tests, frontières |
| `checklists/verification.md` | Avant d'écrire le rapport |
| `assets/rapport.md` | Gabarit du rapport |

## Déroulé

### 0. Lire les règles du projet (toujours en premier)

1. `AGENTS.md` (ou `CLAUDE.md`) à la racine du projet et des sous-dossiers concernés : source de
   vérité des règles normatives (architecture, style, tests, langue des messages, processus). Le
   relire à chaque audit.
2. `docs/audit/regles-depot.md` **s'il existe** : traduction des règles du projet en détecteurs,
   grille de gravité, origine des constats, faux positifs connus, scripts de métriques, découpage
   en zones, emplacement du rapport. Il complète ce skill et l'emporte sur ses valeurs par défaut ;
   AGENTS.md l'emporte sur lui. Sans ce fichier, appliquer les valeurs par défaut ci-dessous et
   signaler dans le rapport qu'aucune règle propre au projet n'a été trouvée.
3. Les ADR / décisions d'architecture (`docs/ADR/`, `docs/adr/`…) et les tests d'architecture ou
   règles de lint qui gardent déjà des frontières.

Un choix tranché par une décision acceptée n'est pas un défaut : on le cite, et on ne le signale
que s'il produit un coût que la décision n'a pas vu. Un garde-fou déjà automatisé (test
d'architecture, lint) n'est pas re-signalé.

### 1. Portée

Sans précision : le code source du projet, tests exclus (ils ont leurs propres règles, auditées
sur demande, voir `clean-code.md` § Tests) ; `regles-depot.md` peut en dire plus. Exclure le code
généré, les dépendances, les builds. Annoncer la portée et ce qui en est exclu.

### 2. Mesures mécaniques

Lancer les scripts de métriques que `regles-depot.md` indique (complexité, tailles, imports,
cycles, blocs dupliqués, code mort). Sans script propre au projet, se contenter de ce qui existe :
`wc -l` et `rg` pour les tailles et les motifs, outils déjà installés (`madge`, `knip`, `jscpd`,
règles ESLint de complexité…), sans rien ajouter au projet.

**Churn** : `git log --since=6.months --name-only --format= -- <portée> | sort | uniq -c | sort -rn
| head -40`. Un fichier complexe que personne ne touche coûte peu ; un fichier complexe modifié
chaque semaine est un point chaud. Croiser churn × complexité (× fan-in) pour classer les zones à
lire en premier. Un historique trop court rend le churn inutilisable : le dire et classer par
taille × complexité × fan-in.

Les mesures sont des **signaux**, jamais des constats : chacune se confirme en lisant le code, ou
s'écarte avec sa raison.

### 3. Cartographie

Repérer les couches, les contextes et les ports/interfaces, puis les patrons déjà en place
(Strategy, Registry, Factory, Observer, Decorator, Command, Repository, façade, injection) pour
ne pas les prendre pour des smells.

### 4. Analyse par zone, en parallèle

Découper en zones indépendantes (dossiers de premier niveau ou contextes ; 8 au plus, découpage
de `regles-depot.md` s'il en donne un) et lancer **un sous-agent par zone, tous dans un seul
message**. Modèle : **Sonnet** pour juger SOLID (arbitrage d'architecture) ; les vérifications
mécaniques (compter des appelants, trouver des usages) vont à un agent d'exploration léger. Aucun
agent ne lance les tests, le build ni le lint, sauf si `regles-depot.md` le demande.

Brief de chaque agent (à compléter avec la zone et ses signaux mesurés) :

> Audit en lecture seule de `<zone>` dans `<racine du projet>`. Lis d'abord les règles du projet
> (`AGENTS.md`, `docs/audit/regles-depot.md` s'il existe), puis `solid.md`, `fowler-smells.md` et
> `clean-code.md` sous `~/.claude/skills/audit-solid/references/`. Signaux mesurés de ta zone :
> `<extrait>`. Confirme ou écarte chacun en lisant le code, puis lis en entier les fichiers à fort
> churn ou fort fan-in pour trouver ce que les mesures ne voient pas : mauvaise responsabilité,
> abstraction qui fuit, `if` sur une donnée, interface trop large, nom trompeur. Pour chaque
> constat, rends exactement : `ID | gravité P0–P3 | principe ou smell (nom canonique) |
> fichier:ligne-ligne | extrait réel ≤ 12 lignes | conséquence concrète | correction (technique
> Fowler + esquisse) | confiance certaine/probable/potentielle`, plus les champs que
> `regles-depot.md` exige (origine, règle…). Écarte ce qu'une décision acceptée a tranché.
> N'invente rien : un extrait que tu n'as pas lu n'existe pas. Rends aussi la liste des fichiers
> lus en entier et de ceux seulement survolés.

### 5. Passe transverse (toi, pas un agent)

Ce qu'aucune zone ne voit seule : cycles entre contextes, chirurgie au fusil (un concept modifié
dans plusieurs contextes), doublons d'une zone à l'autre, contextes loin de la séquence principale
(`D` élevé), interfaces dont les implémentations divergent, règles dupliquées entre le cœur et les
outils ou scripts, inventaire du code mort.

### 6. Vérification contradictoire

Pour chaque P0 et P1, un agent **distinct de celui qui l'a trouvé** relit le code et tente de
réfuter : le comportement est-il voulu (décision, commentaire, test qui le fige) ? L'extrait
est-il exact ? La correction casse-t-elle un contrat, un format persistant ou un test ? En
parallèle. Un constat réfuté sort du rapport ; un constat douteux descend en « potentiel ».

### 7. Classement

Gravité par défaut, que `regles-depot.md` remplace ou précise :

| Gravité | Critère |
| --- | --- |
| **P0 critique** | Enfreint une règle **normative** du projet ou une décision acceptée |
| **P1 haute** | Rend le prochain ajout plus cher : modifier du code au lieu d'ajouter une donnée, toucher plusieurs contextes pour un concept, contourner une interface |
| **P2 moyenne** | Smell local au coût mesurable (point chaud, duplication réelle, fonction illisible) |
| **P3 basse** | Nom, commentaire, petite simplification, à faire en passant |

Un P2 à fort churn ou fort fan-in peut monter en P1 ; un P1 dans du code mort peut descendre en
P2 : le dire. Dans une même gravité, trier par `impact × churn ÷ effort`. Repérer les **gains
rapides** (code mort, `catch` vide, cast forcé…) et donner un **ordre de correction** qui respecte
les dépendances : casser un cycle avant de déplacer ce qu'il lie, extraire une interface avant
d'en injecter l'implémentation.

### 8. Rapport

Remplir `assets/rapport.md` (y compris la section des constats propres aux règles du projet) et
l'écrire à l'emplacement donné par `regles-depot.md`, sinon dans
`artifacts/audit/<AAAA-MM-JJ>-<portée>.md` du projet. Passer `checklists/verification.md`.
Répondre à l'utilisateur en dix lignes au plus, sans tableau, en respectant les conventions
d'AGENTS.md pour les réponses (marqueur d'ouverture, langue) : chiffres par gravité, les trois
constats qui comptent le plus, le chemin du rapport.

### 9. Suite

L'audit s'arrête là : corriger est une décision de l'utilisateur. Un constat P0 ou P1 retenu suit
le processus du projet (ADR puis plan, rouge-vert-refactor, etc. selon AGENTS.md) ; le rapport
fournit pour chacun un brouillon de décision. Ne jamais enchaîner sur des modifications sans
demande explicite.

## Écrire `docs/audit/regles-depot.md` pour un nouveau projet

Pour qu'un projet profite pleinement de l'audit, créer ce fichier avec : les règles normatives
d'AGENTS.md traduites en détecteurs (règle, détecteur, faux positifs, gravité) ; la grille de
gravité propre ; ce qui n'est pas un défaut ici ; les scripts de métriques et leurs commandes ;
le découpage en zones ; l'emplacement du rapport ; les champs supplémentaires de constat ; le
brief et les commandes spécifiques. Ne pas y recopier SOLID ni Fowler.
