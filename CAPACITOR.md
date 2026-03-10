# Application Mobile Capacitor (iOS/Android)

## 🚀 Démarrage rapide (Mac + Xcode)

Après avoir cloné le projet depuis GitHub, exécutez simplement :

```bash
chmod +x setup-ios.sh
./setup-ios.sh
```

Ce script installe tout, génère le dossier `ios/`, et ouvre Xcode automatiquement.

Dans Xcode :
1. Sélectionnez votre **Team** (Signing & Capabilities)
2. Branchez votre iPhone/iPad en USB
3. Cliquez **▶️ Run**

---

## Installation manuelle

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
   npm install
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

## Impression TCP

L'application utilise le plugin `capacitor-tcp-connect` pour imprimer directement sur les imprimantes thermiques réseau.

### Configuration de l'imprimante

1. Aller dans **Paramètres** dans l'application
2. Configurer l'adresse IP de l'imprimante (ex: `192.168.1.100`)
3. Configurer le port (par défaut : `9100`)

## Synchronisation après modifications

Après chaque `git pull`, exécuter :

```bash
npm install
npm run build
npx cap sync
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
- [Guide Lovable Mobile](https://lovable.dev/blog/2025/03/10/how-to-convert-a-web-app-to-a-mobile-app/)
