# Git 协作流程说明

## 远程仓库

| 远程名 | 用途 | 地址 |
| --- | --- | --- |
| **github** | 日常开发、多人协作、整合 dev/master | https://github.com/peiyuanxin1240314976/vegoo-web-admin.git |
| **origin** | 云效，最终发布用，只推 master | codeup.aliyun.com |

**分支流向：** 个人分支 → **dev**（GitHub）→ **master**（GitHub）→ **origin/master**（云效）

---

## 一、你日常在 pyx-dev 上写代码

### 1. 开始干活前（拉最新 dev，再合到自己的分支）

```bash
git checkout pyx-dev
git fetch github
git merge github/dev
# 如有冲突，解决后 git add / git commit
```

这样 pyx-dev 始终基于最新的 dev，减少以后合到 dev 时的冲突。

### 2. 写代码、提交

```bash
# 正常改代码后
git add .
git commit -m "feat: 某某功能"   # 按项目 commit 规范：feat/fix/chore 等
```

### 3. 模块写完后：合并到 dev 并推到 GitHub

```bash
# 1. 确保 pyx-dev 已提交干净
git status

# 2. 切到 dev，拉最新
git checkout dev
git pull github dev

# 3. 把 pyx-dev 合进来
git merge pyx-dev -m "chore: merge pyx-dev"

# 4. 若有冲突，解决后：
#    git add <冲突文件>
#    git commit -m "chore: resolve merge conflicts"

# 5. 推 dev 到 GitHub
git push github dev

# 6. 回到自己分支继续写
git checkout pyx-dev
```

**要点：** 只把 dev 推到 **github**，不推到云效；云效只接收 master。

---

## 二、别的同事在他们的分支上写代码

同事流程和你类似：

- 在自己分支（如 `lzx-dev`）开发
- 写完后：`checkout dev` → `pull github dev` → `merge <自己分支>` → `git push github dev`

这样所有人的模块都会汇总到 **GitHub 的 dev**。

---

## 三、把 dev 整合到 master（发版前）

通常由一个人（或你们约定的人）在本地做「dev → master」的合并，并推送到 GitHub。

```bash
git fetch github
git checkout master
git pull github master

# 把 dev 整进 master
git merge github/dev -m "chore: merge dev into master for release"

# 若有冲突，解决后 git add / git commit，再继续
git push github master
```

之后 **GitHub 的 master** 就是当前要发布的版本。

---

## 四、把 master 推到云效（统一发布）

同样，推云效前先拉一下 GitHub 的 master，再推 origin。

```bash
git checkout master
git pull github master

# 推到云效
git push origin master
```

**注意：** 云效（origin）只推 **master**，不推 dev 或个人分支。

---

## 五、流程小结

| 步骤         | 谁做   | 操作                                                            |
| ------------ | ------ | --------------------------------------------------------------- |
| 日常开发     | 你     | 在 **pyx-dev** 写代码，commit                                   |
| 模块完成     | 你     | `dev` 拉最新 → `merge pyx-dev` → `git push github dev`          |
| 同事模块完成 | 同事   | 同上，各自分支 merge 到 dev，再 `push github dev`               |
| 发版整合     | 约定人 | `master` 拉最新 → `merge github/dev` → `git push github master` |
| 发布到云效   | 约定人 | `git pull github master` → `git push origin master`             |

---

## 六、常用命令速查

```bash
# 看当前分支和远程
git branch -a
git remote -v

# 你推自己的 dev 到 GitHub
git push github dev

# 只推云效的 master（不推 dev）
git push origin master
```

按这个流程，你们可以稳定地：在 **pyx-dev** 写代码，在 **dev** 上整合各人模块，在 **master** 上发版，再统一推到云效的 **master**。
