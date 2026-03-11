
Objectif

Corriger définitivement l’erreur `UNIMPLEMENTED` sur iPhone/iPad pour l’impression TCP, sans dépendre d’une étape manuelle fragile dans Xcode.

Ce que j’ai isolé

- Le front appelle déjà un plugin local `TcpPrinter` dans `src/lib/electron.ts`.
- Le plugin Swift existe bien dans `ios-plugins/TcpPrinterPlugin.swift/.m`.
- Mais l’intégration iOS actuelle reste fragile :
  - `setup-ios.sh` ne fait que copier des fichiers dans `ios/App/App/plugins/`
  - il faut encore les ajouter manuellement dans Xcode
  - il n’y a pas de trace d’un enregistrement natif explicite via `CAPBridgeViewController`
- La doc Capacitor 8 confirme qu’un plugin local ajouté “à la main” doit être enregistré côté iOS, sinon on obtient précisément `UNIMPLEMENTED`.
- Le projet contient encore les anciennes dépendances TCP (`@deedarb/capacitor-tcp-socket`, `capacitor-tcp-connect`, `capacitor-zebra-printer`), ce qui entretient la confusion.
- L’UI montre encore “TcpSocket” dans `PrinterScanner.tsx` alors que le code utilise désormais `TcpPrinter`.

Plan recommandé

1. Remplacer l’intégration iOS artisanale par un vrai plugin local Capacitor
- Créer un plugin local dans le repo, versionné comme un vrai package Capacitor
- Y déplacer la logique Swift `NWConnection`
- Le déclarer comme dépendance locale du projet
- Ainsi, `npx cap sync ios` l’installe proprement dans le projet natif, sans copier de fichiers à la main

2. Nettoyer le frontend pour ne garder qu’un seul bridge
- Conserver `registerPlugin('TcpPrinter')` côté TypeScript
- Supprimer la logique liée aux anciens plugins tiers
- Corriger les messages utilisateur et diagnostics pour parler uniquement de `TcpPrinter`

3. Simplifier totalement le setup iOS
- Transformer `setup-ios.sh` en script fiable :
  - install
  - build
  - `npx cap sync ios`
  - ouverture Xcode
- Supprimer la dépendance à “Add Files to App” si on passe par un vrai plugin local

4. Garder les permissions réseau iOS
- Conserver l’ajout de `NSLocalNetworkUsageDescription`
- Conserver `NSBonjourServices`
- Vérifier que la doc reflète bien le flux réel

5. Validation
- Vérifier que le diagnostic ne retourne plus `plugin_missing`
- Vérifier “Tester la connexion”
- Vérifier une impression réelle ZPL

Alternative minimale si on veut toucher le moins de fichiers possible

Si on ne veut pas créer un vrai plugin local Capacitor, alors il faut :
- ajouter un `MyViewController.swift` qui hérite de `CAPBridgeViewController`
- y faire `bridge?.registerPluginInstance(TcpPrinterPlugin())`
- relier ce contrôleur au storyboard iOS généré
- continuer à copier les fichiers Swift dans le projet iOS

Je ne recommande pas cette voie en premier, car elle reste plus fragile et plus difficile à maintenir.

Fichiers concernés

- `src/lib/electron.ts`
- `src/components/settings/PrinterScanner.tsx`
- `package.json`
- `setup-ios.sh`
- `CAPACITOR.md`
- nouveau dossier de plugin local Capacitor dans le repo
- éventuellement suppression de l’approche `ios-plugins/` actuelle ou conservation temporaire pendant migration

Détails techniques

```text
Etat actuel
Web/TS -> registerPlugin('TcpPrinter') -> OK
iOS runtime -> plugin copié manuellement / non enregistré fiablement -> UNIMPLEMENTED

Etat cible
Web/TS -> registerPlugin('TcpPrinter')
        -> vrai plugin local Capacitor installé via sync
        -> iOS plugin chargé automatiquement
        -> test TCP / print TCP fonctionnels
```

Résultat attendu

Après cette refonte, l’utilisateur n’aura plus à ajouter manuellement des fichiers Swift dans Xcode. Le flux redeviendra simple : `git pull` → `npm install` → `npm run build` → `npx cap sync ios` → ouvrir Xcode → Run.
