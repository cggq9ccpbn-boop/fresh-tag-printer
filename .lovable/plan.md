

# Plan: Corriger la lenteur et le système d'impression TCP

## Problèmes identifiés

1. **Capacitor config sans hot-reload** : Le `capacitor.config.ts` ne pointe pas vers le serveur de dev, donc l'app charge des fichiers statiques qui peuvent être obsolètes.

2. **Plugin Swift peut appeler `call.reject`/`call.resolve` plusieurs fois** : Le timeout et le state handler peuvent tous les deux répondre au même `call`, ce qui cause des crashs/freezes silencieux. Il faut un flag `hasResponded` pour éviter les doubles réponses.

3. **Performance : `readValue` dans useLocalStorage recrée `initialValue` comme dépendance** : Quand `initialValue` est un objet (comme `DEFAULT_SETTINGS`), `readValue` est recréé à chaque render, ce qui déclenche l'effet `storage` en boucle.

4. **`registerPlugin` appelé au top-level** : Sur iOS, si le bridge n'est pas prêt au moment de l'import, le plugin peut ne pas se résoudre correctement.

## Corrections prévues

### 1. Fix `useLocalStorage` (performance)
- Supprimer `initialValue` des dépendances de `readValue` en utilisant un `useRef` pour stocker l'`initialValue`.
- Supprimer `readValue` des dépendances de l'effet `storage`.
- Cela élimine les re-renders en cascade qui rendent l'app lente.

### 2. Fix plugin Swift (double réponse)
- Ajouter un flag `var hasResponded = false` dans chaque méthode pour garantir qu'on ne répond qu'une seule fois au `CAPPluginCall`.
- Cela empêche les crashs quand le timeout se déclenche après une réponse.

### 3. Fix `src/lib/electron.ts` (plugin lazy)
- Utiliser un getter lazy pour `TcpPrinter` au lieu d'un `registerPlugin` au top-level, pour s'assurer que le bridge Capacitor est initialisé.

### 4. Fix `capacitor.config.ts`
- Ajouter la config `server.url` pointant vers le sandbox pour le hot-reload pendant le dev (facilite le debug).

### 5. Ajouter un bouton diagnostic dans les Settings
- Petit bouton qui affiche la plateforme détectée (`ios`/`web`/`electron`) et teste si le plugin TcpPrinter répond.
- Permet de vérifier rapidement si le plugin est chargé sans avoir à imprimer.

## Fichiers modifiés
- `src/hooks/useLocalStorage.ts` — fix performance
- `ios-plugins/TcpPrinterPlugin.swift` — fix double réponse
- `src/lib/electron.ts` — lazy plugin registration
- `capacitor.config.ts` — ajout server URL pour dev
- `src/components/settings/PrinterScanner.tsx` — ajout diagnostic
- `src/pages/SettingsPage.tsx` — aucun changement nécessaire (PrinterScanner est déjà inclus)

