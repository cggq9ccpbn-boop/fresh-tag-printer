

# Plan : Scanner réseau, impression TCP Windows et personnalisation des étiquettes

## Contexte

L'application a deja Electron configuré avec impression TCP via `electron/main.js` et `electron/preload.js`. Le `LabelPreview` est en HTML/CSS avec une largeur fixe de 80mm. Les settings stockent `printerIp` et `printerPort`. L'impression actuelle est simulée (setTimeout) dans `PrintPage.tsx`.

---

## Partie 1 : Scanner réseau d'imprimantes (Electron)

### 1.1 — Ajouter un IPC `scan-network` dans `electron/main.js`

Scanner le sous-reseau local (basé sur l'IP de la machine) sur le port 9100. Tester chaque IP de .1 a .254 en parallele (batches de 50 connexions simultanées, timeout 1s). Retourner la liste des IPs qui repondent.

### 1.2 — Exposer dans `electron/preload.js`

Ajouter `scanNetwork: (options) => ipcRenderer.invoke('scan-network', options)` dans l'API exposée.

### 1.3 — Mettre a jour `src/lib/electron.ts`

Ajouter `scanForPrinters()` qui appelle `window.electronAPI.scanNetwork` et retourne `{ ip: string; port: number }[]`.

---

## Partie 2 : Interface de configuration imprimante (Settings)

### 2.1 — Nouveau composant `src/components/settings/PrinterScanner.tsx`

- Bouton "Scanner le réseau" avec spinner pendant le scan
- Liste des imprimantes trouvées, chaque ligne cliquable pour sélectionner
- Si aucune trouvée : message + formulaire manuel (IP + port)
- Si pas en Electron : afficher directement le formulaire manuel
- Quand une imprimante est sélectionnée : sauvegarder dans settings + bouton "Tester la connexion"

### 2.2 — Intégrer dans `SettingsPage.tsx`

Remplacer les champs IP/port manuels par le composant `PrinterScanner` qui gere les deux modes (scan auto + saisie manuelle).

---

## Partie 3 : Impression TCP reelle

### 3.1 — Modifier `PrintPage.tsx` > `handlePrint`

Remplacer le `setTimeout` simulé par un vrai appel a `printViaTcp` depuis `src/lib/electron.ts`. Generer les données ZPL pour chaque element de la file, envoyer en TCP. Si on est sur le web (pas Electron/Capacitor), afficher un message d'erreur expliquant que l'impression necessite l'app desktop.

---

## Partie 4 : Personnalisation de la taille des étiquettes et du texte

### 4.1 — Etendre `DistributorSettings` dans `src/types/index.ts`

Ajouter les champs :
```text
labelWidth: number        (defaut: 50, en mm)
labelHeight: number       (defaut: 80, en mm)
fontSizeTitle: number     (defaut: 14, en px)
fontSizeBody: number      (defaut: 10, en px)
fontSizeLegal: number     (defaut: 8, en px)
textAlign: 'left' | 'center' | 'right'  (defaut: 'left')
```

Mettre a jour `DEFAULT_SETTINGS` avec ces valeurs par defaut.

### 4.2 — Section "Format d'étiquette" dans `SettingsPage.tsx`

Nouvelle carte avec :
- **Taille de l'étiquette** : champs largeur/hauteur en mm (avec presets 50x80, 40x60, etc.)
- **Tailles de texte** : 3 sliders (Titre, Corps, Mentions légales) de 6px a 20px
- **Alignement** : 3 boutons toggle (gauche, centre, droite) avec icones

### 4.3 — Mettre a jour `LabelPreview.tsx`

- Utiliser `settings.labelWidth` et `settings.labelHeight` pour la taille du conteneur
- Appliquer `settings.fontSizeTitle/Body/Legal` aux sections correspondantes
- Appliquer `settings.textAlign` au conteneur principal

### 4.4 — Mettre a jour la generation ZPL

Adapter les commandes ZPL pour respecter les tailles de police et l'alignement configurés.

---

## Partie 5 : Aperçu en temps réel dans PrintDialog

Le `PrintDialog` utilise deja `LabelPreview` — les changements de settings seront automatiquement reflétés grace aux props.

---

## Fichiers modifiés/créés

| Fichier | Action |
|---|---|
| `electron/main.js` | Ajouter IPC `scan-network` |
| `electron/preload.js` | Exposer `scanNetwork` |
| `src/lib/electron.ts` | Ajouter `scanForPrinters()`, mettre a jour types |
| `src/types/index.ts` | Ajouter champs label/font/align dans `DistributorSettings` |
| `src/components/settings/PrinterScanner.tsx` | Nouveau composant scanner |
| `src/pages/SettingsPage.tsx` | Ajouter sections scanner + format etiquette |
| `src/components/print/LabelPreview.tsx` | Tailles dynamiques + alignement |
| `src/pages/PrintPage.tsx` | Impression TCP reelle via `printViaTcp` |

