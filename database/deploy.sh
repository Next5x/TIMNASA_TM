#!/bin/bash

echo "🚀 TIMNASA-MD: Inaanza mchakato wa kudeploy..."

# 1. Kusafisha cache za zamani
echo "🧹 Kusafisha mafaili ya zamani..."
rm -rf node_modules package-lock.json

# 2. Ku-install mahitaji ya mfumo (kama unatumia VPS/Ubuntu)
if [ -f /usr/bin/apt ]; then
    echo "📦 Ku-install FFmpeg na WebP..."
    sudo apt update && sudo apt install -y ffmpeg imagemagick
fi

# 3. Ku-install npm dependencies
echo "📥 Ku-install library za bot..."
npm install

# 4. Ku-install PM2 kama haipo
if ! command -v pm2 &> /dev/null
then
    echo "⚙️ Ku-install PM2 Process Manager..."
    npm install pm2 -g
fi

# 5. Kutengeneza folder la database kama halipo
if [ ! -d "database" ]; then
    mkdir database
    echo "📂 Folder la database limetengenezwa."
fi

# 6. Kuwasha bot
echo "✅ Kila kitu kipo sawa! Bot inawaka sasa..."
pm2 stop all || true
pm2 start index.js --name "timnasa-md"

# 7. Onyesha logs
echo "📊 Bot imewaka! Unaweza kuona kinachoendelea hapa chini:"
pm2 logs timnasa-md
