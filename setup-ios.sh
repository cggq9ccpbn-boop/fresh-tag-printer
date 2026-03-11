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

echo "🔄 Synchronisation avec Xcode (inclut le plugin TcpPrinter)..."
npx cap sync ios

# ── Add NSLocalNetworkUsageDescription to Info.plist if missing ──
PLIST="ios/App/App/Info.plist"
if [ -f "$PLIST" ]; then
  if ! grep -q "NSLocalNetworkUsageDescription" "$PLIST"; then
    echo "🔐 Ajout de la permission réseau local dans Info.plist..."
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
echo "📋 Dans Xcode :"
echo "   1. Sélectionnez votre Team (Signing & Capabilities)"
echo "   2. Product → Clean Build Folder (⇧⌘K)"
echo "   3. Branchez votre iPhone/iPad"
echo "   4. Cliquez ▶️ Run"
echo ""
echo "💡 Le plugin TcpPrinter est installé automatiquement via CocoaPods."
echo "   Pas besoin d'ajouter de fichiers manuellement dans Xcode."

echo ""
echo "🔧 Ouverture de Xcode..."
npx cap open ios
