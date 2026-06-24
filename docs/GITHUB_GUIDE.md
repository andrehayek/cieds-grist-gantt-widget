# Comprendre Git et GitHub pour ce projet

## 1. Git et GitHub ne sont pas la même chose

- **Git** enregistre localement les versions de tes fichiers sous forme de commits.
- **GitHub** héberge le dépôt Git, facilite la collaboration et publie le site statique avec GitHub Pages.
- **GitHub Pages** transforme les fichiers du dépôt en URL HTTPS utilisable par le widget Grist.
- **GitHub Actions** exécute automatiquement la vérification et le déploiement à chaque push sur `main`.

## 2. Créer le dépôt

Sur GitHub :

1. **New repository** ;
2. nom conseillé : `cieds-grist-gantt-widget` ;
3. visibilité publique pour GitHub Pages gratuit, sauf abonnement autorisant les Pages privées ;
4. ne pas ajouter automatiquement de README si tu importes ce package complet.

Dans un terminal, depuis le dossier :

```bash
git init
git add .
git commit -m "feat: initialiser le widget Gantt CIEDS"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/cieds-grist-gantt-widget.git
git push -u origin main
```

## 3. Ce que signifient les commandes

- `git init` crée l’historique Git local ;
- `git add .` prépare les changements pour le prochain commit ;
- `git commit` crée une version nommée et stable ;
- `git remote add origin` relie le dépôt local au dépôt GitHub ;
- `git push` envoie les commits vers GitHub.

## 4. Cycle de travail recommandé

Pour une petite correction :

```bash
git pull
git checkout -b fix/nom-de-la-correction
# modifier les fichiers
npm run check
git add .
git commit -m "fix: corriger le calcul des prolongations"
git push -u origin fix/nom-de-la-correction
```

Créer ensuite une Pull Request vers `main`. La branche protège le code stable et la Pull Request garde une trace de la décision.

## 5. Convention de commits

Utiliser des messages courts :

- `feat: ajouter un filtre par laboratoire`
- `fix: corriger un jalon hors période`
- `docs: préciser le mapping Grist`
- `refactor: isoler le calcul des dates`
- `test: ajouter un scénario de prolongation`
- `chore: mettre à jour le workflow Pages`

Un commit doit représenter une idée cohérente, pas une journée entière de modifications mélangées.

## 6. Déploiement GitHub Pages

Le fichier `.github/workflows/pages.yml` :

1. récupère le dépôt ;
2. lance `npm run check` ;
3. prépare le dossier comme artefact Pages ;
4. le déploie en HTTPS.

Dans **Settings → Pages**, choisir **GitHub Actions**. Après un push, suivre l’onglet **Actions**. L’URL finale apparaîtra dans le job de déploiement.

## 7. Mettre à jour le widget en production

Le document Grist conserve la même URL. Après chaque déploiement, il charge la nouvelle version. Le cache du navigateur peut retarder l’affichage ; recharger la page Grist ou ajouter temporairement `?v=2` à l’URL permet de forcer un rafraîchissement.

## 8. Revenir en arrière

```bash
git log --oneline
git revert IDENTIFIANT_DU_COMMIT
git push
```

`git revert` crée un nouveau commit qui annule proprement une modification, sans effacer l’historique.

## 9. Secrets

Ne jamais placer dans le dépôt :

- clé API Grist ;
- jeton GitHub ;
- mot de passe ;
- export de données réelles ;
- document contenant des informations sensibles.

Ce widget n’a besoin d’aucun secret : l’accès est accordé par Grist au moment où l’utilisateur ouvre le widget.
