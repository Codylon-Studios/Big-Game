# Git Cheatsheet
### Rebase
```
git checkout develop
git pull
git checkout <branch>
git rebase develop
git push --force
git checkout develop
git merge --no-ff <branch>
git push
git branch -d <branch>
```
> You can call `git config merge.ff false` to change config. Then call instead of `git merge --no-ff <branch>` just `git merge <branch>`.