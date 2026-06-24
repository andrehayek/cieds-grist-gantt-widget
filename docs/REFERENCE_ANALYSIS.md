# Analyse du dépôt `isaytoo/grist-project-manager-widget`

## Ce que le dépôt de référence fait bien

Le dépôt montre les grands mécanismes d’un widget Grist complet :

1. chargement de `grist-plugin-api.js` ;
2. appel à `grist.ready(...)` ;
3. lecture et écriture via `grist.docApi` ;
4. rechargement lors des événements `grist.onRecords(...)` ;
5. système de mapping pour réutiliser des tables et colonnes existantes ;
6. vues multiples dans une même interface ;
7. Gantt, zoom, prolongations et export PDF ;
8. hébergement statique par GitHub Pages.

## Pourquoi ne pas le copier directement

Le besoin CIEDS est plus étroit : il porte d’abord sur une table de projets et non sur une application complète de gestion de tâches. Le dépôt de référence crée et migre de nombreuses tables `PM_*`, gère utilisateurs, groupes, notifications, dépendances, temps, automatisations, modèles et statistiques. Cette richesse augmente fortement la surface de code.

Une grande partie de la logique se trouve aussi dans un très gros fichier JavaScript. Cela fonctionne, mais devient difficile à expliquer, tester et faire évoluer progressivement.

## Choix retenus dans ce starter kit

- **Pas de création automatique de tables** : la table Grist existante reste la source de vérité.
- **Mapping natif Grist** : le panneau du widget permet d’associer chaque champ logique à une colonne réelle.
- **Modules séparés** : Grist, dates, modèle métier, filtres, Gantt, fiche projet et export sont isolés.
- **Pas de bibliothèque de Gantt** : les positions sont calculées directement à partir des dates.
- **Pas de dépendance PDF lourde** : l’export s’appuie sur l’impression native et embarque toutes les lignes.
- **Pas de stockage extérieur** : toutes les données restent dans Grist et dans la mémoire du navigateur.

## Flux conceptuel conservé

```text
Table Grist
   ↓ onRecords + mapping
Normalisation des projets
   ↓
État local du widget
   ├── filtres
   ├── vue Gantt
   └── vue Projets
           ↓ modification
       UpdateRecord Grist
```
