# Modèle de données Grist conseillé

## Table principale : `Projets`

Les identifiants techniques ci-dessous évitent les espaces et accents. Les libellés affichés peuvent rester en français.

| Identifiant | Libellé | Type Grist | Obligatoire pour le widget |
|---|---|---:|---:|
| `Nom_Projet` | Nom du projet | Texte | Oui |
| `Nom_Complet` | Nom complet du projet | Texte | Non |
| `Vague` | Vague | Choix ou Texte | Non |
| `Date_Debut` | Date de début | Date | Oui |
| `Date_Fin` | Date de fin initiale | Date | Oui |
| `Prolonge` | Prolongé | Toggle | Non |
| `Date_Prolongation` | Date de prolongation | Date | Non |
| `Couleur` | Couleur | Texte | Non |
| `Objet` | Objet du projet | Texte long | Non |
| `Axe_Scientifique` | Axe scientifique | Choix | Non |
| `Porteur_1` / `Labo_1` | Porteur et laboratoire 1 | Texte | Non |
| `Porteur_2` / `Labo_2` | Porteur et laboratoire 2 | Texte | Non |
| `Porteur_3` / `Labo_3` | Porteur et laboratoire 3 | Texte | Non |
| `Budget_Total` | Budget total | Numérique | Non |
| `Couts_Directs` | Coûts directs | Numérique | Non |
| `Preciput` | Préciput | Numérique | Non |
| `Duree_Jours` | Durée | Formule numérique | Non |
| `Date_Mi_Temps` | Mi-temps | Formule date ou Date | Non |
| `Livrable_1` | Livrable lancement | Texte | Non |
| `Date_Jalon_1` | Date jalon lancement | Date | Non |
| `Livrable_2` | Livrable mi-temps | Texte | Non |
| `Date_Jalon_2` | Date jalon mi-temps | Date | Non |
| `Livrable_3` | Livrable final | Texte | Non |
| `Date_Jalon_3` | Date jalon final | Date | Non |
| `Documents` | Documents assignés | Pièces jointes | Non |


## Variante normalisée : table `Vagues`

Lorsque chaque vague impose une date de début et une date de fin communes, il est préférable de ne pas recopier ces dates manuellement sur chaque projet. Créer une table `Vagues` :

| Colonne | Type |
|---|---|
| `Nom_Vague` | Texte, colonne d’affichage |
| `Date_Debut` | Date |
| `Date_Fin` | Date |
| `Description` | Texte long, optionnel |

Dans `Projets`, la colonne `Vague` devient une **Référence vers `Vagues`**. Ajouter deux colonnes formule :

```python
$Vague.Date_Debut if $Vague else None
```

```python
$Vague.Date_Fin if $Vague else None
```

Mapper ces deux colonnes formule vers `StartDate` et `EndDate`. Le widget accepte aussi une référence pour `Wave` et affichera la valeur visible de la vague. Cette structure garantit qu’une correction de calendrier est répercutée sur tous les projets de la vague.

## Formules Grist utiles

### Durée initiale en jours

```python
($Date_Fin - $Date_Debut).days if $Date_Debut and $Date_Fin else None
```

### Date de mi-temps

```python
import datetime
$Date_Debut + datetime.timedelta(days=(($Date_Fin - $Date_Debut).days // 2)) if $Date_Debut and $Date_Fin else None
```

### Fin effective

```python
$Date_Prolongation if $Prolonge and $Date_Prolongation else $Date_Fin
```

### Contrôle de cohérence de la prolongation

```python
"À corriger" if $Prolonge and (not $Date_Prolongation or $Date_Prolongation <= $Date_Fin) else "OK"
```

## Faut-il une deuxième table `Projets` ?

Non. La « vue Projets » du widget et une vue Table/Card native de Grist peuvent toutes deux pointer sur la même table `Projets`. Dupliquer la table créerait des problèmes de synchronisation.

La deuxième vraie table utile est plutôt `Jalons`, lorsque le besoin dépassera trois jalons fixes :

| Colonne | Type |
|---|---|
| `Projet` | Référence vers `Projets` |
| `Nom_Jalon` | Texte |
| `Date_Jalon` | Date |
| `Type_Jalon` | Choix |
| `Livrable` | Texte ou Pièce jointe |
| `Statut` | Choix |

Cette évolution correspond à une version 0.2 du widget.

## Vagues normalisées — évolution possible

Si chaque vague impose exactement les mêmes dates à tous ses projets, créer une table `Vagues` avec `Nom`, `Date_Debut` et `Date_Fin`, puis une référence `Vague` dans `Projets`. Des colonnes de recherche peuvent recopier les dates dans `Projets` pour le widget.
