#!/bin/bash
set -e

# ── Usage ──────────────────────────────────────────────────────────────
# Commande unique depuis n'importe où :
#
#   bash <(curl -sL https://raw.githubusercontent.com/VOTRE_USER/VOTRE_REPO/main/setup-ios.sh)
#
# Ou si le repo est déjà cloné :
#
#   cd fresh-tag-printer && chmod +x setup-ios.sh && ./setup-ios.sh
# ───────────────────────────────────────────────────────────────────────

REPO_URL="${REPO_URL:-}"

# ── Si le repo n'est pas encore cloné, le cloner ──
if [ ! -f "package.json" ]; then
  if [ -n "$REPO_URL" ]; then
    echo "📥 Clonage du repo..."
    git clone "$REPO_URL" fresh-tag-printer
    cd fresh-tag-printer
  elif [ -d ".git" ]; then
    echo "📥 git pull..."
    git pull
  else
    echo "❌ Lancez ce script depuis la racine du projet, ou définissez REPO_URL."
    echo "   Exemple : REPO_URL=https://github.com/user/repo.git ./setup-ios.sh"
    exit 1
  fi
else
  # On est déjà dans le repo, on pull les dernières modifs
  if [ -d ".git" ]; then
    echo "📥 Mise à jour du code (git pull)..."
    git pull
  fi
fi

echo ""
echo "🚀 Installation des dépendances..."
npm install --legacy-peer-deps

echo ""
echo "🔨 Build de l'application..."
npm run build

# ── Nettoyage du dossier iOS si existant ──
if [ -d "ios" ]; then
  echo "🗑️  Suppression de l'ancien dossier ios/..."
  rm -rf ios
fi

echo ""
echo "📱 Ajout de la plateforme iOS..."
npx cap add ios

echo ""
echo "🔄 Synchronisation (installe le plugin TcpPrinter automatiquement)..."
npx cap sync ios

# ── Permissions réseau local dans Info.plist ──
PLIST="ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  if ! grep -q "NSLocalNetworkUsageDescription" "$PLIST"; then
    echo "🔐 Ajout des permissions réseau local dans Info.plist..."
    sed -i '' 's|</dict>|<key>NSLocalNetworkUsageDescription</key>\
<string>Ital Panini a besoin d'\''accéder au réseau local pour communiquer avec votre imprimante thermique.</string>\
<key>NSBonjourServices</key>\
<array>\
<string>_pdl-datastream._tcp</string>\
<string>_printer._tcp</string>\
<string>_ipp._tcp</string>\
</array>\
</dict>|' "$PLIST"
    echo "   → Permissions réseau local ajoutées ✅"
  else
    echo "   → Permissions réseau local déjà présentes ✅"
  fi
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅  Setup terminé avec succès !"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Dans Xcode (s'ouvre automatiquement) :"
echo "    1. Sélectionnez votre Team (Signing & Capabilities)"
echo "    2. Product → Clean Build Folder (⇧⌘K)"
echo "    3. Branchez votre iPhone/iPad"
echo "    4. Cliquez ▶️ Run"
echo ""
echo "  ⚠️  PAS besoin d'ajouter de fichiers manuellement !"
echo "      Le plugin TcpPrinter est installé automatiquement."
echo ""

echo "🔧 Ouverture de Xcode..."
npx cap open ios
