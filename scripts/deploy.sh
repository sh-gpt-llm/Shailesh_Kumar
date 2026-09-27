#!/usr/bin/env bash
# One-command deploy: build locally to catch errors, commit, sync with remote, and push to main.
# Netlify is watching the GitHub "main" branch and auto-builds + publishes on every push
# (see netlify.toml). Pushing here is the ONLY step needed to update the live site at
# https://fastidious-praline-2bbf62.netlify.app/
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building locally to catch errors before pushing..."
npm run build

if [ -z "$(git status --porcelain)" ]; then
  echo "==> No local changes to commit."
else
  msg="${1:-Update site content}"
  echo "==> Committing: $msg"
  git add -A
  git commit -m "$msg"
fi

echo "==> Syncing with GitHub main..."
git pull --rebase origin main

echo "==> Pushing to GitHub main (Netlify will auto-deploy)..."
git push origin main

echo "==> Done. Netlify will rebuild and publish automatically in ~30-60s:"
echo "    https://fastidious-praline-2bbf62.netlify.app/"
