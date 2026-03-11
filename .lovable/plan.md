

# Corriger le socket TCP sur iOS

## Problème

Le plugin `capacitor-tcp-connect` n'a pas d'implémentation iOS fonctionnelle. L'erreur "plugin is not implemented on iOS" confirme que le code natif Swift n'est pas enregistré correctement.

## Solution

Remplacer `capacitor-tcp-connect` par **`@spryrocks/capacitor-socket-connection-plugin`** qui supporte explicitement iOS et Android avec une API connect/send/disconnect complète.

## Modifications

### 1. Remplacer le package npm

- Retirer `capacitor-tcp-connect`
- Installer `@spryrocks/capacitor-socket-connection-plugin`

### 2. Adapter `src/lib/electron.ts`

Réécrire les fonctions `printViaTcp` et `testPrinterConnection` pour utiliser la nouvelle API :

```typescript
// Ancien (capacitor-tcp-connect)
const { SocketConnect } = await import('capacitor-tcp-connect');
await SocketConnect.open({ ip, port: String(port), text: data });

// Nouveau (@spryrocks/capacitor-socket-connection-plugin)
import { SocketConnectionPlugin } from '@spryrocks/capacitor-socket-connection-plugin';
const socket = SocketConnectionPlugin.createSocket();
await socket.open(ip, port);
await socket.send(data);
await socket.disconnect();
```

### Après la modification

L'utilisateur devra :
1. `git pull`
2. `npm install`
3. Supprimer le dossier `ios/` existant
4. `npx cap add ios` puis `npm run build` puis `npx cap sync ios`
5. Relancer depuis Xcode

