

## Plan: Utiliser le plugin Capacitor standard pour TCP

### Probleme identifie

Le plugin custom `TcpPrinter` (fichiers Swift copiés manuellement dans Xcode) n'est jamais correctement reconnu par Capacitor, d'où l'erreur `UNIMPLEMENTED` permanente. Le fallback `capacitor-tcp-connect` est compatible Capacitor 5 uniquement, pas Capacitor 8.

Le package `@deedarb/capacitor-tcp-socket` est **deja installe** (v7.2.1), compatible Capacitor 7+/8, et fournit un vrai plugin iOS natif sans configuration manuelle dans Xcode. Il suffit de `npx cap sync` pour qu'il fonctionne.

### Changements

**1. Réécrire `src/lib/electron.ts`** pour utiliser `TcpSocket` de `@deedarb/capacitor-tcp-socket` :
- Import `TcpSocket` au lieu du plugin custom `TcpPrinter`
- API: `connect({ipAddress, port})` → retourne `{client}` → `send({client, data})` → `disconnect({client})`
- Les données ZPL doivent être encodées en base64 (le plugin iOS décode en base64)
- Supprimer le code `registerPlugin('TcpPrinter')` et le fallback `SocketConnect`

**2. Simplifier `setup-ios.sh`** : retirer la copie des fichiers plugin custom (`TcpPrinterPlugin.swift/.m`) puisqu'ils ne sont plus nécessaires.

**3. Mettre à jour le diagnostic** dans `PrinterScanner.tsx` pour refléter le nouveau plugin (`TcpSocket`).

### Apres implementation

Tu devras :
1. `git pull` le projet
2. `npm install --legacy-peer-deps`
3. `npm run build`
4. `npx cap sync ios`
5. Ouvrir Xcode et lancer sur l'iPad

Plus besoin d'ajouter manuellement des fichiers Swift dans Xcode.

