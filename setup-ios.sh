#!/bin/bash
set -e

echo "🚀 Installation des dépendances..."
npm install --legacy-peer-deps

echo "🔨 Build de l'application..."
npm run build

if [ -d "ios" ]; then
  echo "📱 Le dossier ios/ existe déjà, synchronisation..."
else
  echo "📱 Ajout de la plateforme iOS..."
  npx cap add ios
fi

echo "🔄 Synchronisation avec Xcode..."
npx cap sync ios

# ── Copy local TcpPrinter plugin into the iOS project ──
PLUGIN_DIR="ios/App/App/plugins"
echo "📦 Copie du plugin TcpPrinter natif..."
mkdir -p "$PLUGIN_DIR"
cp ios-plugins/TcpPrinterPlugin.swift "$PLUGIN_DIR/TcpPrinterPlugin.swift"
cp ios-plugins/TcpPrinterPlugin.m "$PLUGIN_DIR/TcpPrinterPlugin.m"
echo "   → TcpPrinterPlugin.swift et .m copiés dans $PLUGIN_DIR"

# ── Add NSLocalNetworkUsageDescription to Info.plist if missing ──
PLIST="ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  if ! grep -q "NSLocalNetworkUsageDescription" "$PLIST"; then
    echo "🔐 Ajout de la permission réseau local dans Info.plist..."
    # Insert before the closing </dict>
    sed -i '' 's|</dict>|<key>NSLocalNetworkUsageDescription</key>\
<string>Ital Panini a besoin d'\''accéder au réseau local pour communiquer avec votre imprimante thermique.</string>\
<key>NSBonjourServices</key>\
<array>\
<string>_pdl-datastream._tcp</string>\
<string>_printer._tcp</string>\
<string>_ipp._tcp</string>\
</array>\
</dict>|' "$PLIST"
    echo "   → Permissions réseau local ajoutées"
  else
    echo "   → Permissions réseau local déjà présentes"
  fi
fi

echo ""
echo "✅ Setup terminé !"
echo ""
echo "⚠️  IMPORTANT : Ajoutez les fichiers Swift dans Xcode !"
echo "   1. Ouvrez ios/App/App.xcworkspace dans Xcode"
echo "   2. Dans le navigateur de fichiers, faites clic-droit sur le dossier 'App'"
echo "   3. Choisissez 'Add Files to \"App\"...'"
echo "   4. Sélectionnez le dossier 'plugins' (ios/App/App/plugins/)"
echo "   5. Cochez 'Create groups' et 'Add to targets: App'"
echo "   6. Cliquez 'Add'"
echo ""
echo "📋 Puis :"
echo "   1. Sélectionnez votre Team (Signing & Capabilities)"
echo "   2. Product → Clean Build Folder (⇧⌘K)"
echo "   3. Branchez votre iPhone/iPad"
echo "   4. Cliquez ▶️ Run"

echo ""
echo "🔧 Ouverture de Xcode..."
npx cap open ios
