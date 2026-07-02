cd $FORGE_SITE_PATH

git checkout . # undo temp changes, restore to last git status to avoid pull conflicts
git pull origin $FORGE_SITE_BRANCH # get latest
pnpm install --frozen-lockfile
pnpm run build
