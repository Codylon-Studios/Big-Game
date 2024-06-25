# Git Cheatsheet
### Rebase - Merge (Preferred)
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
> You can call `git config merge.ff false` to change config. Then call `git merge <branch>` instead of `git merge --no-ff <branch>`.

### Traditional Merge

```
git checkout develop
git pull
git merge --no-ff <branch>
git push
```