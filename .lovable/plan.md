
Problème identifié

L’erreur bloquante n’est pas le ZPL ni l’IP de l’imprimante. Le vrai problème est : le plugin natif iOS `TcpSocket` n’est pas chargé dans l’app iPhone/iPad, donc Capacitor renvoie `UNIMPLEMENTED` avant même toute connexion réseau.

Ce que j’ai vérifié
- Le code web appelle bien `TcpSocket` dans `src/lib/electron.ts`
- Le nom du plugin attendu côté iOS est bien `TcpSocket`
- La doc Capacitor v8 indique que `UNIMPLEMENTED` sur iOS arrive quand le plugin n’est pas injecté/trouvé dans le projet natif
- Le repo actuel n’a pas de dossier `ios/`, donc le problème est très probablement dans le projet Xcode généré localement, pas dans le code React

Do I know what the issue is?
Oui.

Issue exacte
- `src/lib/electron.ts` est cohérent
- Le plugin `@deedarb/capacitor-tcp-socket` est présent dans `package.json`
- Mais sur l’appareil iOS, le binaire lancé ne contient visiblement pas le plugin `TcpSocket`
- Donc il faut corriger la synchronisation/intégration native iOS, pas la logique d’impression

Plan d’implémentation

1. Renforcer le diagnostic dans l’app
- Améliorer le message d’erreur affiché quand `UNIMPLEMENTED` survient
- Distinguer clairement :
  - plugin natif absent
  - connexion réseau refusée
  - erreur d’envoi ZPL
- Afficher une instruction courte dans les réglages imprimante si le plugin n’est pas disponible

2. Nettoyer les incohérences du projet
- Retirer les anciennes références documentaires au plugin `capacitor-tcp-connect`
- Vérifier qu’il ne reste plus de logique ou wording lié à l’ancien plugin custom `TcpPrinter`
- Garder une seule voie officielle : `TcpSocket`

3. Vérifier la config Capacitor côté projet
- Revoir `capacitor.config.ts` pour s’assurer qu’aucun réglage iOS ne bloque l’injection des plugins
- Préparer le projet pour le cas où iOS utilise des restrictions App Bound Domains
- Documenter le comportement attendu pour les builds appareil réel

4. Mettre à jour le guide iOS
- Corriger `CAPACITOR.md` pour refléter le plugin réellement utilisé
- Ajouter une checklist exacte après chaque `git pull` :
  - `npm install --legacy-peer-deps`
  - `npm run build`
  - `npx cap sync ios`
  - ouvrir Xcode
  - Clean Build Folder
  - relancer sur l’iPad
- Ajouter la vérification Xcode essentielle : le plugin doit apparaître dans les dépendances natives générées

5. Ajouter une vraie aide de dépannage intégrée
- Dans le diagnostic imprimante, retourner un statut plus utile du type :
  - “Plugin natif détecté”
  - “Plugin non synchronisé dans le projet iOS”
- Ça évitera de confondre un souci Xcode avec un souci imprimante

Fichiers à toucher
- `src/lib/electron.ts`
- `src/components/settings/PrinterScanner.tsx`
- `CAPACITOR.md`
- éventuellement `capacitor.config.ts`

Détails techniques
- Les logs iOS système (`UIScene`, sandbox extension, CARenderServer, contraintes AutoLayout) ne sont pas la cause principale de l’échec d’impression
- Le signal important est uniquement :
  - `[TcpSocket] ...`
  - `Print error: {"code":"UNIMPLEMENTED"}`
- D’après la doc Capacitor iOS, les causes probables sont :
  - plugin pas synchronisé dans le projet iOS
  - plugin absent du projet natif généré
  - configuration iOS empêchant l’injection des plugins

Résultat attendu après correctif
- L’app saura dire clairement si le plugin natif manque
- La documentation et le diagnostic seront alignés
- On évitera la boucle d’erreurs actuelle
- Après resync propre du projet iOS, le test de connexion devra passer de `UNIMPLEMENTED` à soit :
  - succès
  - soit une vraie erreur réseau exploitable
