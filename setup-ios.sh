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

# Copy native TCP printer plugin files
echo "📦 Copie du plugin TcpPrinter natif..."
PLUGIN_DIR="ios/App/App"
if [ -d "$PLUGIN_DIR" ]; then
  cp ios-plugins/TcpPrinterPlugin.swift "$PLUGIN_DIR/"
  cp ios-plugins/TcpPrinterPlugin.m "$PLUGIN_DIR/"
  echo "✅ Plugin TcpPrinter copié dans $PLUGIN_DIR"
else
  echo "❌ Dossier $PLUGIN_DIR introuvable"
  exit 1
fi

echo ""
echo "✅ Setup terminé !"
echo ""
echo "📋 IMPORTANT — Dans Xcode :"
echo "1. Ouvrez ios/App/App.xcworkspace"
echo "2. Dans le navigateur de fichiers (panneau gauche), vérifiez que"
echo "   TcpPrinterPlugin.swift et TcpPrinterPlugin.m apparaissent"
echo "   sous le dossier 'App'"
echo ""
echo "   ⚠️  S'ils n'apparaissent PAS :"
echo "   → Clic droit sur le dossier 'App' dans Xcode"
echo "   → 'Add Files to \"App\"...'"
echo "   → Sélectionnez TcpPrinterPlugin.swift ET TcpPrinterPlugin.m"
echo "   → Cochez 'Copy items if needed'"
echo "   → Cliquez 'Add'"
echo ""
echo "3. Si Xcode demande 'Create Bridging Header?' → Cliquez 'Create'"
echo "4. Sélectionnez votre Team (Signing & Capabilities)"
echo "5. Branchez votre iPhone/iPad"
echo "6. Cliquez ▶️ Run"

echo ""
echo "🔧 Ouverture de Xcode..."
npx cap open ios
