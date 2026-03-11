# Application Mobile iOS — Ital Panini

## 🚀 Commande unique (tout-en-un)

Après avoir connecté le repo GitHub, ouvrez le **Terminal** sur votre Mac et lancez :

```bash
git clone https://github.com/cggq9ccpbn-boop/fresh-tag-printer.git fresh-tag-printer && cd fresh-tag-printer && chmod +x setup-ios.sh && ./setup-ios.sh
```

Si le repo est déjà cloné :

```bash
cd fresh-tag-printer && chmod +x setup-ios.sh && ./setup-ios.sh
```

Le script fait **tout automatiquement** :
- `git pull` (mise à jour)
- `npm install` (dépendances)
- `npm run build` (compilation)
- `npx cap add ios` + `npx cap sync ios` (plugin natif inclus)
- Injection des permissions réseau local
- Ouverture de Xcode

### Dans Xcode (seule étape manuelle)

1. Sélectionnez votre **Team** (Signing & Capabilities)
2. **Product → Clean Build Folder** (⇧⌘K)
3. Branchez votre iPhone/iPad
4. Cliquez **▶️ Run**

> ⚠️ **Pas besoin d'ajouter de fichiers manuellement dans Xcode.** Le plugin TcpPrinter est installé automatiquement via CocoaPods.

---

## ✅ Après chaque `git pull`

```bash
cd fresh-tag-printer && chmod +x setup-ios.sh && ./setup-ios.sh
```

C'est tout. Le script gère le reste.

---

## Impression TCP (plugin natif)

L'app utilise un **plugin Capacitor local** (`capacitor-tcp-printer`) pour imprimer sur les imprimantes thermiques réseau via TCP (port 9100).

- Le code TypeScript appelle `TcpPrinter.print()` et `TcpPrinter.testConnection()`
- Capacitor route vers `TcpPrinterPlugin.swift` (utilise `NWConnection`)
- Les données ZPL sont envoyées directement à l'imprimante

### Configuration

1. **Paramètres** → adresse IP (ex: `192.168.1.100`) et port (`9100`)
2. **Diagnostic** → vérifie que le plugin est chargé
3. **Tester la connexion** → vérifie la communication réseau

---

## 🔧 Dépannage

### Erreur `UNIMPLEMENTED`

```bash
rm -rf ios/ && ./setup-ios.sh
```

Puis dans Xcode : Clean Build Folder (⇧⌘K) → Run.

### Permission réseau local refusée

Sur l'iPhone : **Réglages → Ital Panini → Réseau local** → Activer.

### L'imprimante ne répond pas

1. Même réseau Wi-Fi/Ethernet
2. Vérifier IP et port dans les paramètres
3. Ping l'IP depuis un ordinateur
4. Redémarrer l'imprimante
