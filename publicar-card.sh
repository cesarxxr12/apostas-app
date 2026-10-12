#!/usr/bin/env bash
# Publica card-hoje.json no GitHub Pages
set -e
cd "$(dirname "$0")"
git add card-hoje.json
if git diff --cached --quiet; then echo "Sem alterações."; exit 0; fi
git commit -m "card $(date +%F' '%H:%M)"
git push origin main
