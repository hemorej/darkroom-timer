cd $FORGE_SITE_PATH

# repo is public: pull over https, not the deploy-key ssh config Forge once wrote into .git/config
git config --unset core.sshCommand || true
git remote set-url origin "$(git remote get-url origin | sed -E 's#^git@github\.com:#https://github.com/#; s#^ssh://git@github\.com/#https://github.com/#')"

git checkout . # undo temp changes, restore to last git status to avoid pull conflicts
git pull origin $FORGE_SITE_BRANCH # get latest
$PNPM_PATH install --frozen-lockfile
$PNPM_PATH run build
