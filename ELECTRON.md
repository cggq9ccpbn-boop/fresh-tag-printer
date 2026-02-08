# Fresh Tag Printer - Version Desktop (Electron)

## 🚀 Génération automatique des builds

Les builds sont générés automatiquement via GitHub Actions lorsque vous créez un tag de version.

### Créer une release

```bash
# Créer un tag de version
git tag v1.0.0
git push origin v1.0.0
```

Cela déclenchera le workflow et générera :
- **Windows** : `.exe` (installateur) + `.exe` (portable)
- **macOS** : `.dmg` (Intel + Apple Silicon)
- **Linux** : `.AppImage` + `.deb`

### Télécharger les builds

Les fichiers seront disponibles dans l'onglet **Releases** de votre repo GitHub.

---

## 🔧 Configuration requise

### Secrets GitHub

Ajoutez ces secrets dans votre repo GitHub (Settings → Secrets → Actions) :

| Secret | Description |
|--------|-------------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase |

### Icônes

Placez vos icônes dans `electron/icons/` :
- `icon.ico` - Windows (256x256)
- `icon.icns` - macOS
- `icon.png` - Linux (512x512)

---

## 💻 Développement local

```bash
# 1. Installer les dépendances
npm install
cd electron && npm install && cd ..

# 2. Lancer le serveur de dev
npm run dev

# 3. Dans un autre terminal, lancer Electron
cd electron
NODE_ENV=development npm start
```

---

## 🖨️ Impression TCP

La version Electron permet l'impression directe via TCP vers les imprimantes thermiques :

```typescript
import { printViaTcp, testPrinterConnection, isElectron } from '@/lib/electron';

// Vérifier si on est dans Electron
if (isElectron()) {
  // Tester la connexion
  const connected = await testPrinterConnection('192.168.1.100', 9100);
  
  // Imprimer (data en base64)
  await printViaTcp('192.168.1.100', 9100, btoa(escPosData));
}
```

---

## 📁 Structure

```
├── electron/
│   ├── main.js          # Process principal Electron
│   ├── preload.js       # Bridge sécurisé
│   ├── package.json     # Config Electron + electron-builder
│   └── icons/           # Icônes de l'app
├── .github/
│   └── workflows/
│       └── electron-build.yml  # GitHub Actions
└── src/
    └── lib/
        └── electron.ts  # API TypeScript pour le frontend
```
