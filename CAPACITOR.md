# Application Mobile Capacitor (iOS/Android)

## 🚀 Démarrage rapide (Mac + Xcode)

Après avoir cloné le projet depuis GitHub :

1. Ouvrez le **Terminal** (Applications → Utilitaires → Terminal)
2. Naviguez vers le dossier du projet (⚠️ si le nom contient des espaces, utilisez des guillemets) :
   ```bash
   cd ~/Downloads/"fresh-tag-printer-main"
   ```
3. Lancez le script :
   ```bash
   chmod +x setup-ios.sh
   ./setup-ios.sh
   ```

> **Si le Terminal affiche `bquote>` ou `quote>`** : appuyez sur `Ctrl + C` puis réessayez en copiant-collant les commandes exactes ci-dessus.

> **Si Xcode ne s'ouvre pas automatiquement** : lancez `npx cap open ios` ou ouvrez manuellement le fichier `ios/App/App.xcworkspace`.

Ce script installe tout, génère le dossier `ios/`, et ouvre Xcode automatiquement.

Dans Xcode :
1. Sélectionnez votre **Team** (Signing & Capabilities)
2. Branchez votre iPhone/iPad en USB
3. Cliquez **▶️ Run**

---

## Impression TCP (plugin natif)

L'application utilise le plugin **`@deedarb/capacitor-tcp-socket`** pour imprimer directement sur les imprimantes thermiques réseau via TCP.

> ⚠️ Ce plugin nécessite un build natif (Capacitor). L'impression ne fonctionne **pas** en mode web/navigateur.

### Configuration de l'imprimante

1. Aller dans **Paramètres** dans l'application
2. Configurer l'adresse IP de l'imprimante (ex: `192.168.1.100`)
3. Configurer le port (par défaut : `9100`)
4. Utiliser le bouton **Diagnostic** pour vérifier que le plugin est bien chargé

---

## ✅ Checklist après chaque `git pull`

**Exécutez ces commandes dans l'ordre à chaque mise à jour :**

```bash
# 1. Installer les dépendances (avec flag legacy pour compatibilité)
npm install --legacy-peer-deps

# 2. Builder l'application web
npm run build

# 3. Synchroniser avec le projet iOS natif
npx cap sync ios

# 4. Ouvrir dans Xcode
npx cap open ios
```

**Dans Xcode :**
1. **Product → Clean Build Folder** (⇧⌘K)
2. Sélectionnez votre appareil iOS
3. Cliquez **▶️ Run**

### Vérification du plugin

Après le sync, vérifiez dans Xcode que le plugin natif est présent :
- Ouvrez `ios/App/Podfile` → le pod `DeedarbCapacitorTcpSocket` doit apparaître
- Ou dans le navigateur de projet Xcode : `Pods` → le dossier du plugin doit être listé

---

## 🔧 Dépannage : erreur `UNIMPLEMENTED`

Si le diagnostic affiche `UNIMPLEMENTED` ou que l'impression échoue avec ce code :

**Le plugin natif n'est pas chargé dans le build iOS.** C'est un problème de synchronisation, pas de code.

### Solution complète :

```bash
# Supprimer le dossier iOS et repartir proprement
rm -rf ios/

# Réinstaller
npm install --legacy-peer-deps
npm run build

# Recréer le projet iOS
npx cap add ios
npx cap sync ios

# Ouvrir Xcode
npx cap open ios
```

Dans Xcode :
1. **Product → Clean Build Folder** (⇧⌘K)
2. Sélectionnez votre Team (Signing & Capabilities)
3. Branchez l'iPad/iPhone
4. **▶️ Run**

---

## Installation manuelle (sans le script)

### Prérequis

- **iOS** : Mac avec Xcode installé (disponible sur l'App Store)
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

3. **Ajouter les plateformes natives**
   ```bash
   npx cap add ios
   npx cap add android
   ```

4. **Builder l'application web**
   ```bash
   npm run build
   ```

5. **Synchroniser avec les projets natifs**
   ```bash
   npx cap sync
   ```

6. **Ouvrir dans Xcode**
   ```bash
   npx cap open ios
   ```

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
- [Plugin TcpSocket](https://github.com/gee1k/capacitor-tcp-socket)
- [Guide Lovable Mobile](https://lovable.dev/blog/2025/03/10/how-to-convert-a-web-app-to-a-mobile-app/)
