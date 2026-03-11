# Application Mobile Capacitor (iOS/Android)

## 🚀 Démarrage rapide (Mac + Xcode)

Après avoir cloné le projet depuis GitHub :

1. Ouvrez le **Terminal** (Applications → Utilitaires → Terminal)
2. Naviguez vers le dossier du projet :
   ```bash
   cd ~/Downloads/"fresh-tag-printer-main"
   ```
3. Lancez le script :
   ```bash
   chmod +x setup-ios.sh
   ./setup-ios.sh
   ```

Ce script :
- Installe les dépendances
- Build l'application web
- Crée le projet iOS (Capacitor)
- Copie le **plugin TcpPrinter natif** dans le projet Xcode
- Ajoute les **permissions réseau local** dans Info.plist
- Ouvre Xcode automatiquement

### ⚠️ Étape manuelle dans Xcode (obligatoire la première fois)

Après l'ouverture de Xcode :

1. Dans le **navigateur de fichiers** (panneau gauche), faites **clic-droit** sur le dossier **`App`**
2. Choisissez **"Add Files to 'App'..."**
3. Naviguez vers `ios/App/App/plugins/`
4. Sélectionnez le dossier **`plugins`** entier
5. Cochez **"Create groups"** et **"Add to targets: App"**
6. Cliquez **"Add"**

Puis :
1. Sélectionnez votre **Team** (Signing & Capabilities)
2. **Product → Clean Build Folder** (⇧⌘K)
3. Branchez votre iPhone/iPad en USB
4. Cliquez **▶️ Run**

---

## Impression TCP (plugin natif local)

L'application utilise un **plugin Capacitor local** (`TcpPrinterPlugin`) pour imprimer directement sur les imprimantes thermiques réseau via TCP.

Ce plugin utilise `NWConnection` (framework Network d'Apple) — **pas de dépendance CocoaPods ni SPM externe**.

### Fonctionnement

- Le code TypeScript appelle `TcpPrinter.print()` et `TcpPrinter.testConnection()`
- Capacitor route ces appels vers `TcpPrinterPlugin.swift`
- Le plugin Swift ouvre une connexion TCP directe à l'imprimante
- Les données ZPL sont envoyées en clair sur le port configuré (défaut : 9100)

### Configuration de l'imprimante

1. Aller dans **Paramètres** dans l'application
2. Configurer l'adresse IP de l'imprimante (ex: `192.168.1.100`)
3. Configurer le port (par défaut : `9100`)
4. Utiliser le bouton **Diagnostic** pour vérifier que le plugin est bien chargé
5. Utiliser **Tester la connexion** pour vérifier la communication réseau

### Permissions iOS

Le plugin nécessite l'accès au **réseau local** sur iOS 14+. Le script `setup-ios.sh` ajoute automatiquement :
- `NSLocalNetworkUsageDescription` dans Info.plist
- `NSBonjourServices` pour la découverte d'imprimantes

L'utilisateur verra une popup iOS demandant l'autorisation réseau local au premier lancement.

---

## ✅ Checklist après chaque `git pull`

```bash
# 1. Installer les dépendances
npm install --legacy-peer-deps

# 2. Builder l'application web
npm run build

# 3. Synchroniser avec le projet iOS natif
npx cap sync ios

# 4. Re-copier les fichiers du plugin natif
mkdir -p ios/App/App/plugins
cp ios-plugins/TcpPrinterPlugin.swift ios/App/App/plugins/
cp ios-plugins/TcpPrinterPlugin.m ios/App/App/plugins/

# 5. Ouvrir dans Xcode
npx cap open ios
```

**Dans Xcode :**
1. **Product → Clean Build Folder** (⇧⌘K)
2. Sélectionnez votre appareil iOS
3. Cliquez **▶️ Run**

---

## 🔧 Dépannage

### Erreur `UNIMPLEMENTED`

Le plugin natif n'est pas chargé dans le build iOS.

**Solution complète :**

```bash
rm -rf ios/
./setup-ios.sh
```

Puis dans Xcode :
1. **Ajoutez le dossier `plugins`** au projet (voir étape manuelle ci-dessus)
2. **Product → Clean Build Folder** (⇧⌘K)
3. **▶️ Run**

### Permission réseau local refusée

Si l'app affiche une erreur de permission réseau :
1. Sur l'iPhone/iPad : **Réglages → Ital Panini → Réseau local**
2. Activez l'autorisation

### L'imprimante ne répond pas

1. Vérifiez que l'imprimante est sur le **même réseau Wi-Fi/Ethernet**
2. Vérifiez l'**adresse IP** et le **port** dans les paramètres
3. Essayez de **ping** l'adresse IP depuis un ordinateur
4. Redémarrez l'imprimante

---

## Installation manuelle (sans le script)

### Prérequis

- **iOS** : Mac avec Xcode installé
- **Android** : Android Studio installé

### Étapes

1. **Cloner le projet depuis GitHub**
   ```bash
   git clone <votre-repo>
   cd fresh-tag-printer
   ```

2. **Installer les dépendances**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Builder l'application web**
   ```bash
   npm run build
   ```

4. **Ajouter la plateforme iOS**
   ```bash
   npx cap add ios
   ```

5. **Synchroniser**
   ```bash
   npx cap sync ios
   ```

6. **Copier le plugin natif**
   ```bash
   mkdir -p ios/App/App/plugins
   cp ios-plugins/TcpPrinterPlugin.swift ios/App/App/plugins/
   cp ios-plugins/TcpPrinterPlugin.m ios/App/App/plugins/
   ```

7. **Ouvrir dans Xcode**
   ```bash
   npx cap open ios
   ```

8. **Ajouter les fichiers Swift au projet Xcode** (voir étape manuelle ci-dessus)

## Déploiement

### TestFlight (iOS)

1. Ouvrir le projet dans Xcode : `npx cap open ios`
2. Configurer le signing avec votre compte développeur Apple
3. Product → Archive
4. Distribuer via TestFlight

### Google Play (Android)

1. Ouvrir dans Android Studio : `npx cap open android`
2. Build → Generate Signed Bundle/APK
3. Publier sur Google Play Console

## Ressources

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Guide Lovable Mobile](https://lovable.dev/blog/2025/03/10/how-to-convert-a-web-app-to-a-mobile-app/)
