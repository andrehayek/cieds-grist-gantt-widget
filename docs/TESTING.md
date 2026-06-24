# Checklist de test

## Vérification automatique

```bash
npm run check
npm test
```

La première commande vérifie la présence des fichiers essentiels et la syntaxe de tous les modules JavaScript.

## Scénarios fonctionnels

### Données

- [ ] Projet avec début et fin normales.
- [ ] Projet prolongé après la date de fin.
- [ ] `Prolonge = oui` sans date de prolongation.
- [ ] Date de prolongation antérieure à la fin initiale.
- [ ] Projet sans couleur : couleur stable générée automatiquement.
- [ ] Projet sans jalons explicites : jalons calculés.
- [ ] Projet sans axe ou sans vague.

### Gantt

- [ ] Échelle 1 an avec mois visibles.
- [ ] Échelle 4 ans avec trimestres visibles.
- [ ] Échelle 12 ans avec années visibles.
- [ ] Navigation précédente et suivante.
- [ ] Bouton Aujourd’hui.
- [ ] Ligne rouge visible lorsque le jour est dans la période.
- [ ] Barres correctement tronquées aux limites de la période.
- [ ] 70 projets sans ralentissement notable.

### Filtres

- [ ] Recherche sur nom, objet, porteur et laboratoire.
- [ ] Filtre année : projet actif au moins un jour dans l’année.
- [ ] Filtre vague.
- [ ] Filtre axe scientifique.
- [ ] Filtre prolongation.
- [ ] Réinitialisation.

### Modification

- [ ] Les champs non mappés sont désactivés.
- [ ] Enregistrement d’un texte.
- [ ] Enregistrement d’une date.
- [ ] Activation et désactivation de la prolongation.
- [ ] Refus d’écriture pour un utilisateur sans permission.
- [ ] Sélection de la ligne dans Grist.

### Export

- [ ] Toutes les lignes filtrées sont présentes dans la fenêtre d’impression.
- [ ] Mode multipage lisible.
- [ ] Mode une page contenant toutes les lignes.
- [ ] Enregistrement PDF depuis Chrome/Firefox/Edge.

## Navigateurs

Tester au minimum la version institutionnelle du navigateur utilisée par l’équipe, puis Chrome ou Edge récent. Le comportement exact de pagination PDF dépend du moteur d’impression du navigateur.
