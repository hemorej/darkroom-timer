# npm install @rollup/rollup-linux-x64-gnu --silent --no-audit --no-fund # bug in optional dependencies

cd $FORGE_SITE_PATH

git checkout . # undo temp changes, restore to last git status to avoid pull conflicts
git pull origin $FORGE_SITE_BRANCH # get latest
/home/forge/.local/share/pnpm/bin/pnpm install --frozen-lockfile
/home/forge/.local/share/pnpm/bin/pnpm run build
