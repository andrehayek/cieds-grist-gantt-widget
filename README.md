# CIEDS Grist Gantt Widget

Widget personnalisé Grist, léger et sans framework, destiné au pilotage du portefeuille de projets CIEDS.

## Fonctionnalités de la version 0.1

- Gantt précis basé sur les dates réelles de début et de fin.
- Prolongation affichée dans la couleur du projet, mais éclaircie et hachurée.
- Trois jalons par projet, avec dates explicites ou dates calculées par défaut.
- Ligne verticale rouge pour la date du jour.
- Échelles de 1, 2, 4, 6 ou 12 ans et navigation temporelle.
- Affichage compact conçu pour 70 projets et plus.
- Filtres par recherche, année active, vague, axe scientifique et prolongation.
- Vue « Projets » lisible et fiche de modification connectée à Grist.
- Export de toutes les lignes vers la boîte d’impression du navigateur, en une ou plusieurs pages A3 paysage.
- Mode démonstration lorsqu’on ouvre directement `index.html` hors de Grist.

## Démarrage local

```bash
git clone https://github.com/VOTRE-COMPTE/cieds-grist-gantt-widget.git
cd cieds-grist-gantt-widget
npm run check
npm test
npm run dev
```

Ouvrir ensuite `http://localhost:8080/?demo=1`.

> Pour tester depuis une instance Grist distante en HTTPS, `localhost` peut être refusé comme contenu non sécurisé. Le test final doit alors être fait via l’URL HTTPS GitHub Pages.

## Publication

1. Créer un dépôt GitHub et pousser ce dossier sur la branche `main`.
2. Dans **Settings → Pages**, sélectionner **GitHub Actions** comme source.
3. Le workflow `.github/workflows/pages.yml` vérifie la syntaxe, exécute les tests puis publie automatiquement le widget.
4. L’URL sera de la forme `https://VOTRE-COMPTE.github.io/cieds-grist-gantt-widget/`.

## Installation dans Grist

1. Créer une page ou une vue basée sur la table des projets.
2. Ajouter un widget **Personnalisé / Custom**.
3. Coller l’URL GitHub Pages.
4. Accorder **Full document access**, nécessaire uniquement pour la fiche de modification.
5. Mapper au minimum `Name`, `StartDate` et `EndDate`.
6. Mapper les champs optionnels disponibles.

La documentation détaillée est dans [`docs/GRIST_SETUP.md`](docs/GRIST_SETUP.md).

## Sécurité des données

GitHub Pages héberge seulement les fichiers HTML, CSS et JavaScript. Le code s’exécute dans l’iframe du navigateur et reçoit les données de Grist via l’API du widget. Ce projet ne contient aucun appel réseau qui transmet les données à GitHub ou à un service tiers.

Le dépôt peut être public sans rendre publiques les données Grist. Le code source reste toutefois public : aucun secret, jeton ou mot de passe ne doit être ajouté au dépôt.

## Structure

```text
.
├── index.html                    # Interface et points d’ancrage DOM
├── assets/css/                   # Styles écran et impression
├── src/
│   ├── app.js                    # Orchestration générale
│   ├── config/columns.js         # Contrat de mapping avec Grist
│   ├── grist/grist-client.js     # Communication lecture/écriture Grist
│   ├── domain/project.js         # Normalisation métier des projets
│   ├── state/store.js            # État central minimal
│   ├── features/                 # Gantt, filtres, projets, export
│   └── utils/                    # Dates, couleurs et DOM
├── docs/                         # Guides et décisions d’architecture
├── tests/                        # Tests unitaires Node sans dépendance
├── examples/                     # Modèle CSV de données
└── .github/workflows/pages.yml   # Déploiement GitHub Pages
```

## Limites connues de cette première version

- Les pièces jointes sont affichées comme information, mais restent modifiées dans Grist.
- Le widget gère trois jalons standards. Une future version pourra lire une table relationnelle `Jalons` avec un nombre illimité de jalons.
- L’export utilise l’impression native du navigateur pour éviter une dépendance lourde à `html2canvas` et `jsPDF`.
- Les règles d’accès Grist restent la source de vérité : le widget ne contourne pas les permissions du document.

## Documentation

- [`docs/REFERENCE_ANALYSIS.md`](docs/REFERENCE_ANALYSIS.md) — analyse du dépôt de référence.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — flux technique du widget.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — colonnes Grist et formules conseillées.
- [`docs/GITHUB_GUIDE.md`](docs/GITHUB_GUIDE.md) — Git, GitHub, branches, commits et Pages.
- [`docs/GRIST_SETUP.md`](docs/GRIST_SETUP.md) — configuration dans l’instance Grist.
- [`docs/TESTING.md`](docs/TESTING.md) — checklist de validation.
