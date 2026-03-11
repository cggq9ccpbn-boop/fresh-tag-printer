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

echo ""
echo "✅ Setup terminé !"
echo ""
echo "📋 Étapes suivantes :"
echo "1. Ouvrez ios/App/App.xcworkspace dans Xcode"
echo "2. Sélectionnez votre Team (Signing & Capabilities)"
echo "3. Branchez votre iPhone/iPad"
echo "4. Cliquez ▶️ Run"

echo ""
echo "🔧 Ouverture de Xcode..."
npx cap open ios
