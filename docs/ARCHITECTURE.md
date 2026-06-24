# Architecture technique

## 1. Le rôle de chaque couche

### `index.html`

Contient uniquement la structure générale : en-tête, onglets, filtres, conteneurs de vues et dialogues. Il charge l’API Grist, les styles et `src/app.js`.

### `src/grist/grist-client.js`

C’est la frontière avec Grist. Ce module :

- déclare les colonnes attendues ;
- écoute `onRecords` ;
- transforme les noms réels des colonnes grâce au mapping ;
- récupère l’identifiant de la table sélectionnée ;
- met à jour une ligne avec `UpdateRecord` ;
- place le curseur Grist sur un projet.

Aucun autre module ne doit appeler directement l’API Grist. Cela simplifie les tests et une future migration.

### `src/domain/project.js`

Transforme une ligne mappée en objet projet stable. Cette étape protège le reste de l’application contre les valeurs vides, les formats de dates différents et les couleurs invalides.

### `src/state/store.js`

Conserve l’état minimal : projets, mapping, filtres et fenêtre temporelle. C’est volontairement plus simple qu’une bibliothèque Redux ou Vuex.

### `src/features/*`

Chaque fonctionnalité est isolée :

- `filters` décide quels projets sont visibles ;
- `gantt` calcule les positions et génère les lignes ;
- `projects` génère la table et la fiche d’édition ;
- `export` prépare une page d’impression complète.

## 2. Calcul des positions du Gantt

Pour une date `d`, une borne de début `a` et une borne de fin `b` :

```text
position en % = (d - a) / (b - a) × 100
```

Les années, trimestres, mois, barres, jalons et ligne du jour utilisent tous la même fonction. L’échelle reste donc cohérente.

## 3. Zoom

Le zoom ne grossit pas les rectangles eux-mêmes. Il modifie la fenêtre temporelle : 1, 2, 4, 6 ou 12 ans. La largeur visuelle du calendrier reste proche de la largeur disponible, tandis que la longueur relative des barres est recalculée.

## 4. Prolongation

Deux segments sont dessinés :

- segment initial : `Date_Debut → Date_Fin` ;
- segment prolongé : `Date_Fin → Date_Prolongation`.

Le second segment reprend la couleur, mélangée avec du blanc, et ajoute des hachures. Il reste immédiatement associé au même projet sans être confondu avec la période initiale.

## 5. Jalons

La version initiale accepte trois dates de jalons. Si les dates de jalons dédiées ne sont pas mappées :

- lancement = date de début ;
- mi-temps = champ `HalfTime` lorsqu’il est mappé, sinon milieu mathématique entre début et fin ;
- fin = fin effective, prolongation comprise.

Une évolution recommandée consiste à créer une table relationnelle `Jalons` et à la lire avec un accès complet au document.

## 6. Écriture dans Grist

Le formulaire n’écrit que dans les colonnes réellement mappées. Les dates sont converties en secondes Unix, format attendu par les actions de données Grist. Les permissions Grist s’appliquent normalement : une personne sans droit d’édition ne pourra pas enregistrer.
