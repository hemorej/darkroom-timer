cd $FORGE_SITE_PATH

git checkout . # undo temp changes, restore to last git status to avoid pull conflicts
git pull origin $FORGE_SITE_BRANCH # get latest
npm install --no-audit --no-fund --silent 
npm install @rollup/rollup-linux-x64-gnu --silent --no-audit --no-fund # bug in optional dependencies
npm run build
