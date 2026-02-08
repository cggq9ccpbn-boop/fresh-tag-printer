# Application Mobile Capacitor (iOS/Android)

Cette documentation explique comment compiler et exécuter l'application mobile native.

## Prérequis

- **iOS** : Mac avec Xcode installé (disponible sur l'App Store)
- **Android** : Android Studio installé

## Installation

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
   # Pour iOS
   npx cap add ios
   
   # Pour Android
   npx cap add android
   ```

4. **Mettre à jour les dépendances natives**
   ```bash
   npx cap update ios
   npx cap update android
   ```

5. **Builder l'application web**
   ```bash
   npm run build
   ```

6. **Synchroniser avec les projets natifs**
   ```bash
   npx cap sync
   ```

## Lancement

### iOS (iPad/iPhone)

```bash
npx cap run ios
```

Ou ouvrir directement dans Xcode :
```bash
npx cap open ios
```

### Android

```bash
npx cap run android
```

Ou ouvrir dans Android Studio :
```bash
npx cap open android
```

## Impression TCP

L'application utilise le plugin `capacitor-tcp-connect` pour imprimer directement sur les imprimantes thermiques réseau.

### Configuration de l'imprimante

1. Aller dans **Paramètres** dans l'application
2. Configurer l'adresse IP de l'imprimante (ex: `192.168.1.100`)
3. Configurer le port (par défaut : `9100`)

### Test d'impression

1. Aller sur la page **Impression**
2. Sélectionner un produit
3. L'impression sera envoyée directement à l'imprimante configurée

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
