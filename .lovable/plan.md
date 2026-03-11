
Objectif: corriger définitivement l’erreur iOS `Unknown class _TtC3App30TcpPrinterBridgeViewController in Interface Builder file` (qui bloque l’enregistrement natif du plugin et provoque ensuite `UNIMPLEMENTED`).

1) Diagnostic confirmé
- `UNIMPLEMENTED` est un symptôme secondaire.
- Le vrai blocage actuel: le storyboard référence `TcpPrinterBridgeViewController`, mais cette classe n’est pas réellement compilée dans la cible iOS.
- Do I know what the issue is? Yes.
- Cause la plus probable dans le code actuel:
  - `setup-ios.sh` copie `TcpPrinterBridgeViewController.swift` sur disque, mais ne garantit pas son inclusion dans le target build Xcode.
  - Le patch storyboard force la classe custom, donc au runtime iOS ne la trouve pas.

2) Plan de correction (code)
Fichiers à ajuster:
- `setup-ios.sh` (principal)
- `ios-plugins/TcpPrinterBridgeViewController.swift` (optionnel selon stratégie)

Approche robuste:
- Ne plus dépendre d’un fichier Swift “copié puis espéré compilé”.
- Injecter la classe `TcpPrinterBridgeViewController` directement dans un fichier déjà compilé par défaut (App target), via le script.
- Garder l’enregistrement manuel:
  - `bridge?.registerPluginInstance(TcpPrinterPlugin())`

Concrètement dans `setup-ios.sh`:
- Après `npx cap sync ios`, patcher `ios/App/App/AppDelegate.swift` (ou un fichier Swift déjà présent dans target) pour y ajouter, si absent:
  - import Capacitor (si nécessaire)
  - définition `@objc(TcpPrinterBridgeViewController) ...`
- Patch storyboard de façon ciblée (Bridge View Controller uniquement), pas remplacement global agressif.
- Ajouter des vérifications bloquantes:
  - la classe existe dans le fichier Swift patché
  - `Main.storyboard` contient bien `customClass="TcpPrinterBridgeViewController"`
  - sinon `exit 1` avec message clair.

3) Stabilisation iOS (prévenir les faux positifs)
- Conserver la copie des sources plugin `TcpPrinterPlugin.swift/.m`.
- Ajouter un log natif explicite dans `capacitorDidLoad()` (ex: `[TcpPrinter] Bridge controller loaded`) pour valider rapidement que la classe est bien active.
- Aligner versions Capacitor (`@capacitor/core` et `@capacitor/ios`) pour éviter comportement imprévisible.

4) Validation après implémentation
Workflow utilisateur (commandes):
```bash
cd ~/Desktop/fresh-tag-printer
git stash
git pull
rm -rf ios
chmod +x setup-ios.sh
./setup-ios.sh
```
Puis dans Xcode:
- Product → Clean Build Folder
- Run

Résultat attendu:
- Plus d’erreur “Unknown class … TcpPrinterBridgeViewController”
- Le diagnostic app passe de `UNIMPLEMENTED` à un vrai test réseau (succès ou erreur réseau réelle).

5) Note sur les autres logs affichés
- `UIScene lifecycle will soon be required` et plusieurs logs `WebContent` vus précédemment sont généralement non bloquants pour l’impression TCP.
- Le bug à traiter en priorité est bien la classe custom introuvable (c’est celui qui casse le bridge plugin).
