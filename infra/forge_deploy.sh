$CREATE_RELEASE()

cd $FORGE_RELEASE_DIRECTORY

# Forge clones with a token embedded in the remote URL; strip the userinfo so it
# isn't left readable in .git/config of every release.
git remote set-url origin "$(git remote get-url origin | sed -E 's#^(https?://)[^/@]+@#\1#')"

$PNPM_PATH install --frozen-lockfile
$PNPM_PATH run build

$ACTIVATE_RELEASE()
