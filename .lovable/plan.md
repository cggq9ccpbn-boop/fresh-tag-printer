

# Corriger le chargement de l'app Capacitor sur iOS

## Problème identifié

Le `capacitor.config.ts` utilise `server.url` pointant vers `https://...lovableproject.com`. Sur un appareil physique iOS, le WebView n'arrive pas à charger cette URL distante, ce qui provoque le "JS Eval error".

## Solution

Supprimer la configuration `server.url` du `capacitor.config.ts` pour que l'app charge les fichiers locaux (depuis `dist/`) au lieu d'une URL distante. L'app fonctionnera en mode embarqué — plus rapide, plus fiable, et fonctionne hors ligne.

### Modification unique : `capacitor.config.ts`

Retirer le bloc `server` pour que la config devienne :

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.freshtagprinter',
  appName: 'fresh-tag-printer',
  webDir: 'dist',
};

export default config;
```

### Après la modification

L'utilisateur devra :
1. `git pull` le projet
2. `npm run build`
3. `npx cap sync ios`
4. Relancer depuis Xcode (▶️ Run)

## Note importante

Le mode `server.url` (hot-reload distant) est pratique pour le développement mais instable sur appareil physique. Le mode local embarqué est la méthode recommandée pour tester et déployer sur iOS.

