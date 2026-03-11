#!/bin/bash
set -e

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
    exit 1
  fi
else
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
echo "🔄 Synchronisation..."
npx cap sync ios

# ── Copie des sources du plugin TcpPrinter ──
SOURCES_DIR="ios/App/App/Sources"
APP_DIR="ios/App/App"
STORYBOARD="ios/App/App/Base.lproj/Main.storyboard"
APPDELEGATE="ios/App/App/AppDelegate.swift"

mkdir -p "$SOURCES_DIR"

echo "📦 Copie du plugin TcpPrinter..."
cp plugins/tcp-printer/ios/Sources/TcpPrinterPlugin.swift "$SOURCES_DIR/TcpPrinterPlugin.swift"
cp plugins/tcp-printer/ios/Sources/TcpPrinterPlugin.m "$SOURCES_DIR/TcpPrinterPlugin.m"
echo "   → Sources plugin copiées ✅"

# ── Injection du BridgeViewController dans AppDelegate.swift ──
# Au lieu de copier un fichier séparé (qui peut ne pas être compilé),
# on ajoute la classe directement dans AppDelegate.swift qui est TOUJOURS compilé.
echo "🔌 Injection du BridgeViewController dans AppDelegate.swift..."

if grep -q "TcpPrinterBridgeViewController" "$APPDELEGATE"; then
  echo "   → BridgeViewController déjà présent dans AppDelegate.swift ✅"
else
  cat >> "$APPDELEGATE" << 'SWIFT_EOF'

// MARK: - TcpPrinter Bridge View Controller
// Injecté automatiquement par setup-ios.sh
// Enregistre le plugin TcpPrinter manuellement dans le bridge Capacitor

@objc(TcpPrinterBridgeViewController)
class TcpPrinterBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(TcpPrinterPlugin())
        print("[TcpPrinter] ✅ Bridge controller loaded — plugin registered")
    }
}
SWIFT_EOF
  echo "   → BridgeViewController injecté dans AppDelegate.swift ✅"
fi

# ── Vérification que la classe est bien présente ──
if ! grep -q "class TcpPrinterBridgeViewController" "$APPDELEGATE"; then
  echo "❌ ERREUR: TcpPrinterBridgeViewController introuvable dans AppDelegate.swift"
  exit 1
fi

# ── Patch du Storyboard ──
if [ -f "$STORYBOARD" ]; then
  if ! grep -q "TcpPrinterBridgeViewController" "$STORYBOARD"; then
    echo "🔌 Configuration du Bridge View Controller dans le Storyboard..."
    perl -0pi -e 's/customClass="CAPBridgeViewController"/customClass="TcpPrinterBridgeViewController"/g; s/customModule="Capacitor"/customModule="App" customModuleProvider="target"/g' "$STORYBOARD"
    echo "   → Storyboard patché ✅"
  else
    echo "   → Storyboard déjà configuré ✅"
  fi
  
  # Vérification storyboard
  if ! grep -q 'customClass="TcpPrinterBridgeViewController"' "$STORYBOARD"; then
    echo "❌ ERREUR: Le Storyboard ne référence pas TcpPrinterBridgeViewController"
    exit 1
  fi
  echo "   → Vérification Storyboard OK ✅"
else
  echo "⚠️  Main.storyboard introuvable — patch ignoré"
fi

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
echo "  Dans Xcode :"
echo "    1. Sélectionnez votre Team (Signing & Capabilities)"
echo "    2. Product → Clean Build Folder (⇧⌘K)"
echo "    3. Branchez votre iPhone/iPad"
echo "    4. Cliquez ▶️ Run"
echo ""
echo "  Vérifiez dans la console Xcode :"
echo "    [TcpPrinter] ✅ Bridge controller loaded"
echo ""

echo "🔧 Ouverture de Xcode..."
npx cap open ios
