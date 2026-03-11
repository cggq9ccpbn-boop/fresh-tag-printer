

## Diagnostic

Le plugin `@deedarb/capacitor-tcp-socket` v7.2.1 est conçu pour **Capacitor 7** et ne fournit **pas de support Swift Package Manager (SPM)**. Or, **Capacitor 8 utilise SPM par défaut** pour iOS. Résultat : quand tu fais `npx cap add ios`, le projet iOS est créé en mode SPM, et le plugin TCP n'est jamais inclus dans le build natif → `UNIMPLEMENTED`.

## Solution

Forcer l'utilisation de **CocoaPods** comme gestionnaire de dépendances iOS au lieu de SPM. C'est un changement dans la procédure de build, pas dans le code.

### Changements

**1. `setup-ios.sh`** — Remplacer `npx cap add ios` par `npx cap add ios --packagemanager CocoaPods`

**2. `CAPACITOR.md`** — Mettre à jour toutes les commandes `npx cap add ios` avec le flag `--packagemanager CocoaPods` et ajouter une note expliquant pourquoi (plugin TCP pas encore compatible SPM)

**3. Instructions de nettoyage dans le diagnostic** (`src/lib/electron.ts`) — Mettre à jour les instructions affichées pour inclure `--packagemanager CocoaPods`

**4. `src/components/settings/PrinterScanner.tsx`** — Mettre à jour les instructions de resync affichées dans le diagnostic

### Prérequis sur ton Mac

Tu dois avoir **CocoaPods** installé :
```bash
brew install cocoapods
```

### Après implémentation — commandes à lancer

```bash
rm -rf ios/
npm install --legacy-peer-deps
npm run build
npx cap add ios --packagemanager CocoaPods
npx cap sync ios
npx cap open ios
```
Puis dans Xcode : Product → Clean Build Folder → ▶️ Run

