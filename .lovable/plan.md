

## Analyse du `.gitignore`

Le fichier actuel exclut `node_modules` et `dist`, mais il manque plusieurs entrées importantes pour le projet Electron :

### Manquant actuellement :
| Entrée | Raison |
|---|---|
| `electron-dist/` | Dossier de sortie des builds Electron (exécutables, installateurs) |
| `electron/node_modules/` | Dépendances Electron séparées (electron-builder, etc.) |
| `*.exe` | Binaires Windows générés |
| `*.dmg` | Installateurs macOS |
| `*.AppImage` | Binaires Linux |
| `*.deb` | Paquets Debian |
| `*.msi` | Installateurs MSI Windows |
| `bun.lockb` | Fichier lock Bun (binaire, déjà dans le repo) |

### Plan d'implémentation

Ajouter les entrées suivantes au `.gitignore` :

```text
# Electron build output
electron-dist/
electron/node_modules/

# Electron binaries
*.exe
*.dmg
*.AppImage
*.deb
*.msi
```

Cela réduira significativement la taille du repo et évitera que les artefacts de build soient poussés sur GitHub, ce qui causait potentiellement le timeout lors du `checkout` dans GitHub Actions.

