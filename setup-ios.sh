#!/bin/bash
set -e

echo "🚀 Installation des dépendances..."
npm install

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

echo "✅ Ouverture de Xcode..."
npx cap open ios

echo ""
echo "📋 Dans Xcode :"
echo "1. Sélectionnez votre Team (Signing & Capabilities)"
echo "2. Branchez votre iPhone/iPad"
echo "3. Cliquez ▶️ Run"
