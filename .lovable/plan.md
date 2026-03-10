

## Problème

Le dossier `ios/` nécessaire pour Xcode **n'existe pas dans le repo GitHub**. Il est généré localement par la commande `npx cap add ios`. Sans ce dossier, il n'y a rien à ouvrir dans Xcode.

## Solution

Créer un **script de setup automatique** (`setup-ios.sh`) et un guide clair pour que sur votre Mac, une seule commande prépare tout :

### 1. Créer `setup-ios.sh` à la racine du projet

Script bash qui exécute dans l'ordre :
- `npm install`
- `npm run build`
- `npx cap add ios` (génère le dossier `ios/`)
- `npx cap sync ios` (synchronise le code web dans le projet Xcode)
- `npx cap open ios` (ouvre automatiquement Xcode)

### 2. Mettre à jour `CAPACITOR.md`

Ajouter en haut du fichier les instructions simplifiées :
```
Sur Mac, exécutez :
chmod +x setup-ios.sh
./setup-ios.sh
```

### Résultat

Après le script, Xcode s'ouvrira automatiquement avec le projet `App.xcworkspace` prêt. Il suffira de :
1. Sélectionner votre Team (compte Apple)
2. Brancher l'iPhone
3. Cliquer ▶️ Run

