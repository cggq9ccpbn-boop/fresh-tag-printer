
Diagnostic

Le problème n’est pas l’imprimante ni le réseau Wi‑Fi/Ethernet. L’erreur `UNIMPLEMENTED` veut dire que le bridge natif iOS n’expose pas la fonction appelée par le code web.

Do I know what the issue is? Oui.

Ce que j’ai vérifié
- `src/lib/electron.ts` appelle toujours `@deedarb/capacitor-tcp-socket` (`TcpSocket.connect/send/disconnect`)
- `package.json` contient toujours `@deedarb/capacitor-tcp-socket`
- le projet a déjà un plugin Swift local `ios-plugins/TcpPrinterPlugin.swift/.m`
- mais ce plugin local n’est ni utilisé côté TypeScript, ni enregistré côté iOS, ni copié automatiquement dans le projet iOS
- il n’y a pas non plus de configuration visible pour l’autorisation réseau local iOS

Conclusion exacte

Le projet est dans un état incohérent :
1. le front appelle encore l’ancien plugin npm
2. le plugin Swift local existe, mais n’est pas branché au projet iOS
3. sur Capacitor récent, un plugin local iOS doit être enregistré explicitement, sinon on obtient précisément `UNIMPLEMENTED`

Approche que je propose

Je ne vais pas “retoucher encore CocoaPods”. Je vais remplacer complètement la chaîne d’impression iOS par le plugin Swift local déjà présent, qui envoie le TCP directement via `NWConnection`.

Plan d’implémentation

1. Remplacer le bridge TypeScript
- supprimer la dépendance logique à `@deedarb/capacitor-tcp-socket`
- créer un vrai wrapper Capacitor local pour `TcpPrinter`
- faire pointer `printViaTcp`, `testPrinterConnection` et `diagnoseTcpPlugin` vers `TcpPrinter` au lieu de `TcpSocket`

2. Corriger le plugin iOS local pour Capacitor 8
- adapter `TcpPrinterPlugin.swift` au format recommandé pour plugin local iOS
- enregistrer explicitement le plugin dans le contrôleur iOS (`capacitorDidLoad` / `registerPluginInstance`)
- garder les méthodes `print` et `testConnection`

3. Automatiser l’intégration iOS
- mettre à jour `setup-ios.sh` pour copier les fichiers natifs dans `ios/App/App/`
- ajouter aussi le fichier natif d’enregistrement si nécessaire
- faire en sorte que le setup reste reproductible après un nouveau clone GitHub

4. Ajouter les réglages iOS indispensables
- définir iOS 18+ dans `capacitor.config.ts`
- ajouter l’autorisation réseau local iOS pour permettre la connexion TCP aux imprimantes du LAN
- mettre à jour la doc pour refléter le nouveau fonctionnement

5. Corriger le diagnostic utilisateur
- `PrinterScanner.tsx` devra tester `TcpPrinter`
- le diagnostic devra distinguer :
  - bridge absent (`UNIMPLEMENTED`)
  - permission/réseau local refusé
  - imprimante inaccessible
  - envoi TCP échoué

Pourquoi je pense que ça réglera enfin le bug
- aujourd’hui, le code appelle un plugin qui n’est pas chargé côté iOS
- tant que cette partie n’est pas remplacée et enregistrée proprement, tu auras toujours la même erreur
- une fois le bridge local branché correctement, l’erreur changera :
  - soit ça imprime
  - soit on tombe sur une vraie erreur réseau/permission, donc enfin exploitable

Fichiers à toucher
- `src/lib/electron.ts`
- `src/components/settings/PrinterScanner.tsx`
- `package.json`
- `capacitor.config.ts`
- `setup-ios.sh`
- `CAPACITOR.md`
- `ios-plugins/TcpPrinterPlugin.swift`
- `ios-plugins/TcpPrinterPlugin.m`
- plus le fichier d’enregistrement iOS local à ajouter côté app native

Validation prévue
- recompiler l’app iOS après sync
- lancer “Diagnostic”
- vérifier que `UNIMPLEMENTED` disparaît
- tester “Tester la connexion”
- tester une impression réelle ZPL

Commandes de validation après correction
```bash
git pull
npm install --legacy-peer-deps
npm run build
rm -rf ios/
npx cap add ios
./setup-ios.sh
npx cap sync ios
npx cap open ios
```

Puis dans Xcode :
```text
Product → Clean Build Folder
Run
```

Point important
Je ne peux pas compiler moi-même dans ce mode lecture seule, mais après inspection du code et de la doc Capacitor, le vrai blocage est bien le bridge iOS non branché, pas l’adresse IP de l’imprimante.
