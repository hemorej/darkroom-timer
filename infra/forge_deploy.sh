# npm install @rollup/rollup-linux-x64-gnu --silent --no-audit --no-fund # bug in optional dependencies

cd $FORGE_SITE_PATH

git checkout . # undo temp changes, restore to last git status to avoid pull conflicts
git pull origin $FORGE_SITE_BRANCH # get latest
$PNPM_PATH install --frozen-lockfile
$PNPM_PATH run build