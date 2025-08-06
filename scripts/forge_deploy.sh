cd $FORGE_SITE_PATH

git pull origin $FORGE_SITE_BRANCH
npm install --no-audit --no-fund --silent
npm install @rollup/rollup-linux-x64-gnu --silent --no-audit --no-fund # bug in optional dependencies
npm run build

if [ ! -L "$LINK_NAME" ]; then
    ln -s "$TARGET" "$LINK_NAME"
fi