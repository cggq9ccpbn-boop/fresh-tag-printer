

# Refonte design iOS/iPad + Impression TCP native

## Contexte
L'app fonctionne mais le design n'est pas optimisé pour iPhone/iPad (pas de header mobile avec logo, navigation basique, pas de safe areas). L'impression TCP via les plugins Capacitor tiers ne fonctionne pas sur iOS.

## Plan

### 1. Refonte design mobile-first

**Layout** (`Layout.tsx`)
- Ajouter le `MobileNav` (header avec logo + menu hamburger) pour mobile
- Ajouter `pt-16` au contenu mobile pour compenser le header fixe
- Safe area bottom pour la bottom nav

**Dashboard** (`Dashboard.tsx`)
- Header avec logo Ital Panini et salutation
- Cards stats plus compactes et colorées avec icones en couleur
- Actions rapides en grille 2 colonnes sur mobile
- Design épuré style iOS : coins arrondis xl, ombres douces

**ProductsPage** (`ProductsPage.tsx`)
- Cards produits en liste compacte sur mobile (pas de grille avec photo pleine)
- Boutons d'action visibles sans hover (swipe ou boutons inline)
- Filtres catégories en scroll horizontal

**PrintPage** (`PrintPage.tsx`)
- Layout en une colonne sur mobile
- Boutons d'impression plus gros et accessibles
- File d'impression avec swipe-to-delete visuel

**SettingsPage** (`SettingsPage.tsx`)
- Sections plus compactes, style iOS Settings
- Moins d'espace vertical gaspillé

**Thème** (`index.css`)
- Couleurs plus chaudes inspirées du logo (vert italien, rouge, doré)
- Variables CSS mises à jour

**BottomNav** (`BottomNav.tsx`)
- Safe area bottom pour les iPhones avec encoche
- Style plus iOS natif avec indicateur actif

### 2. Plugin TCP natif custom pour iOS

Puisque tous les plugins tiers échouent, créer un plugin Capacitor local :

**Fichiers natifs** (copiés dans `ios/App/App/` via script) :
- `TcpPrinterPlugin.swift` : utilise `NWConnection` (framework Network d'Apple) pour envoyer du ZPL en TCP
- `TcpPrinterPlugin.m` : bridge Objective-C pour enregistrement Capacitor

**`src/lib/electron.ts`** :
- Sur Capacitor : appel via `Capacitor.Plugins.TcpPrinter.print()` / `.testConnection()`
- Suppression des imports de plugins tiers défaillants

**`setup-ios.sh`** :
- Copie automatique des fichiers Swift dans le projet Xcode
- Instructions claires post-setup

**Nettoyage `package.json`** :
- Retrait de `@deedarb/capacitor-tcp-socket` et `capacitor-tcp-connect`

### 3. Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `src/index.css` | Palette de couleurs Ital Panini |
| `src/components/layout/Layout.tsx` | Ajout MobileNav + safe areas |
| `src/components/layout/BottomNav.tsx` | Style iOS natif + safe area |
| `src/components/layout/MobileNav.tsx` | Header mobile avec logo |
| `src/pages/Dashboard.tsx` | Design cards iOS-like |
| `src/pages/ProductsPage.tsx` | Liste compacte mobile, actions visibles |
| `src/pages/PrintPage.tsx` | Layout mobile optimisé |
| `src/pages/SettingsPage.tsx` | Style iOS Settings |
| `src/lib/electron.ts` | Plugin natif custom Capacitor |
| `ios-plugins/TcpPrinterPlugin.swift` | Nouveau - Code Swift TCP |
| `ios-plugins/TcpPrinterPlugin.m` | Nouveau - Bridge ObjC |
| `setup-ios.sh` | Mise a jour - copie fichiers natifs |

### Apres implementation

Sur le Mac :
1. `git pull` + `npm install`
2. Supprimer `ios/` puis `npx cap add ios`
3. `npm run build` + `npx cap sync ios`
4. Executer `bash setup-ios.sh` pour copier les fichiers Swift
5. Ouvrir Xcode et lancer

