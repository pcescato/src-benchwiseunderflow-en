#!/usr/bin/env bash
#
# 🚀 Déploiement incrémental d’un site Astro via rsync
# Usage : ./deploy.sh ou npm run deploy
# Prérequis : accès SSH et rsync installé des deux côtés

# --- CONFIGURATION ---
LOCAL_DIR="dist/"
REMOTE_USER="root"
REMOTE_HOST="vps.mondomaine.fr"
REMOTE_PATH="/www/wwwroot/fr.benchwiseunderflow.in/"
LOG_FILE="./deploy.log"

# Options rsync :
# -a : archive (préserve permissions, timestamps…)
# -v : verbose
# -z : compression
# --delete : supprime les fichiers absents localement
# --progress : affichage en direct
# --human-readable : tailles lisibles
# --exclude : exclure certains fichiers
RSYNC_OPTS="-avz --delete --progress --human-readable \
  --exclude='.DS_Store' \
  --exclude='Thumbs.db'"

echo "--------------------------------------------------"
echo "🚀 Déploiement en cours vers $REMOTE_USER@$REMOTE_HOST..."
echo "Dossier distant : $REMOTE_PATH"
echo "--------------------------------------------------"

# Vérifie la connexion SSH
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "$REMOTE_USER@$REMOTE_HOST" "exit" 2>/dev/null; then
  echo "❌ Impossible de se connecter à $REMOTE_HOST. Vérifie ta clé SSH ou ton accès."
  exit 1
fi

# Synchronisation rsync
rsync $RSYNC_OPTS "$LOCAL_DIR" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH" | tee "$LOG_FILE"

# Retour du statut
if [ $? -eq 0 ]; then
  echo "✅ Déploiement terminé avec succès à $(date '+%H:%M:%S')."
else
  echo "❌ Une erreur est survenue pendant le déploiement."
  exit 1
fi

echo "--------------------------------------------------"
echo "📜 Log disponible dans : $LOG_FILE"
echo "--------------------------------------------------"

