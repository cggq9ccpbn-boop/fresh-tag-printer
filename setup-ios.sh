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

echo "✅ Ouverture de Xcode..."
npx cap open ios

echo ""
echo "📋 Dans Xcode :"
echo "1. Vérifiez que TcpPrinterPlugin.swift et .m sont dans le projet"
echo "   (Si non : File → Add Files to 'App' → sélectionnez les deux fichiers)"
echo "2. Sélectionnez votre Team (Signing & Capabilities)"
echo "3. Branchez votre iPhone/iPad"
echo "4. Cliquez ▶️ Run"
