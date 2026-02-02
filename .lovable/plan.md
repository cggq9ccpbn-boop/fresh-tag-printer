

## 🏷️ Logiciel d'Étiquettes Alimentaires - Plan de développement

### Vue d'ensemble
Application web style Apple minimaliste permettant de créer et imprimer des étiquettes alimentaires pour distributeurs automatiques, avec impression directe sur imprimante thermique TCP/IP (format 80mm).

---

### 📋 Page d'accueil / Dashboard
- Interface épurée avec accès rapide aux fonctionnalités principales
- Aperçu des impressions en attente dans la file
- Accès aux paramètres du distributeur

---

### 🏪 Configuration du Distributeur
- **Informations société** : Nom, logo, adresse complète
- **Coordonnées** : Téléphone, email
- **Informations légales** : Numéro TVA, SIRET
- **Configuration imprimante** : Adresse IP et port TCP

---

### 📦 Gestion des Produits (Catalogue)
**Création de produits avec :**
- Nom du produit
- Photo du produit
- Prix
- Catégorie (sandwichs, boissons, desserts, snacks, etc.)
- Liste des allergènes (gluten, lactose, œufs, fruits à coque, etc.)
- Durée de conservation par défaut (en jours/heures) → pour calcul auto DLC

**Organisation :**
- Liste des produits filtrables par catégorie
- Recherche rapide
- Modification/suppression de produits

---

### 🏷️ Création d'Étiquettes
**À chaque impression, dialogue demandant :**
1. Sélection du produit (depuis le catalogue)
2. Date de production (par défaut : aujourd'hui)
3. Date DLC (calculée automatiquement selon durée de conservation, modifiable)
4. Nombre d'étiquettes à imprimer
5. Aperçu de l'étiquette avant impression

**Contenu de l'étiquette (80mm) :**
- Logo et nom du distributeur
- Nom du produit + photo
- Prix
- Date de production
- DLC (« À consommer avant le... » ou « À consommer de préférence avant le... »)
- Zone allergènes mise en évidence
- Informations légales (adresse, tél, TVA)

---

### 📋 File d'Impression
- Préparation de plusieurs étiquettes différentes
- Visualisation de la file d'attente
- Impression groupée en une fois
- Possibilité de modifier/supprimer avant impression

---

### 🖨️ Impression TCP
- Connexion directe à l'imprimante thermique via TCP/IP
- Envoi des commandes d'impression
- Retour visuel du statut d'impression

---

### 💾 Stockage Local
- Toutes les données sauvegardées localement dans le navigateur (LocalStorage/IndexedDB)
- Pas besoin de connexion internet après chargement initial
- Export/import des données possible

---

### 🎨 Design
- Style Apple : épuré, blanc, typographie élégante
- Ombres douces, coins arrondis
- Interface responsive (utilisable sur tablette)
- Animations fluides

