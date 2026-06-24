# Configuration dans Grist DINUM

## 1. Préparer la table

Créer ou choisir la table contenant les projets. Les trois informations indispensables sont :

- nom du projet ;
- date de début ;
- date de fin initiale.

Ajouter ensuite les champs optionnels décrits dans `DATA_MODEL.md`.

## 2. Ajouter la vue personnalisée

1. Dans la page Grist souhaitée, cliquer sur **Ajouter un widget à la page**.
2. Choisir **Personnalisé / Custom**.
3. Choisir la table `Projets` comme source de données.
4. Coller l’URL GitHub Pages du dépôt.
5. Autoriser **Full document access**.
6. Associer les colonnes dans le panneau de configuration.

Le widget demande un accès complet parce que la fiche « Projets » peut mettre à jour la ligne. Une variante strictement en lecture seule pourrait demander `read table`, mais les boutons d’enregistrement devraient alors être retirés.

## 3. Mapping minimum

| Champ du widget | Colonne Grist |
|---|---|
| `Name` | `Nom_Projet` |
| `StartDate` | `Date_Debut` |
| `EndDate` | `Date_Fin` |

Puis mapper `Extended`, `ExtensionDate`, `Color`, `Wave`, `ScientificAxis`, les porteurs, budgets, livrables et dates de jalons.

## 4. Vue native Grist complémentaire

La bonne pratique n’est pas de créer une copie de la table. Sur la même page, ajouter :

- le widget personnalisé Gantt ;
- une vue Table ou Card native de `Projets` ;
- éventuellement relier les widgets par sélection.

Le clic ou la sélection depuis le widget peut placer le curseur sur la ligne Grist correspondante.

## 5. Filtres Grist et filtres internes

Les filtres du widget s’appliquent aux lignes reçues. Les filtres de la section Grist peuvent aussi limiter les lignes transmises, car `onRecords` respecte la sélection et les filtres de la vue. Les deux niveaux peuvent donc se cumuler.

## 6. Cas particulier de l’instance DINUM

Une instance Grist auto-hébergée peut charger un widget depuis une URL externe complète. Si l’URL GitHub Pages est refusée ou reste blanche, vérifier avec l’administrateur :

- que les widgets externes sont autorisés ;
- que `github.io` est accessible depuis le réseau ;
- qu’aucune politique de sécurité navigateur ne bloque l’iframe ;
- que l’URL est en HTTPS ;
- que l’accès complet a bien été approuvé.

Pour une exploitation institutionnelle durable, le code peut aussi être repris dans un dépôt d’organisation et intégré au catalogue de widgets de l’instance.

## 7. Données et confidentialité

Les fichiers du widget sont publics si le dépôt est public, mais les données Grist ne sont pas copiées dans GitHub. Elles transitent uniquement entre Grist et l’iframe dans le navigateur. Toute future intégration d’une API externe devra faire l’objet d’une revue de sécurité et d’une information explicite.
