

## Diagnostic: GitHub Actions "The operation was canceled"

Le `.gitignore` est deja correct avec toutes les exclusions necessaires. Le probleme n'est pas la.

### Cause probable

L'erreur "The operation was canceled" qui survient sur **plusieurs etapes** (checkout ET setup-node) indique generalement :

1. **Minutes GitHub Actions epuisees** -- Les comptes gratuits ont 2000 minutes/mois. Si elles sont epuisees, les jobs sont annules automatiquement.
2. **Timeout du workflow** -- Le job depasse le temps maximum autorise.

### Verification immediate (a faire sur GitHub)

1. Va dans **Settings > Billing and plans > Plans and usage** sur GitHub
2. Verifie la section **Actions** -- si les minutes sont a 0, c'est la cause

### Correction du workflow

Ajouter un `timeout-minutes` au job pour eviter les blocages, et retirer le `cache: 'npm'` du setup-node qui peut causer des timeouts sur Windows :

```yaml
jobs:
  build:
    timeout-minutes: 30
    strategy:
      matrix:
        include:
          - os: windows-latest
            platform: win
          - os: macos-latest
            platform: mac
          - os: ubuntu-latest
            platform: linux

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
```

Changements :
- Ajout de `timeout-minutes: 30` au job build
- Retrait de `cache: 'npm'` qui peut bloquer sur certains runners Windows

### Fichier modifie

| Fichier | Modification |
|---|---|
| `.github/workflows/electron-build.yml` | Ajout timeout + retrait cache npm |

