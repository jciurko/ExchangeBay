
# Assignment Template

This repository contains the base files for the assignment. You will need to create a _private duplicate_ in your module organisation. Carry out the following steps, taken from the [GitHub documentation](https://help.github.com/en/enterprise/2.16/user/articles/duplicating-a-repository):

Temporarily clone this repository to your development computer. This will create a directory on your computer called `temp` which contains the repository files:

`git clone https://github.coventry.ac.uk/web/template-dynamic-websites.git temp`

Create a new **private** repository in the module organisation on the GitHub server and copy the _clone url_ to the clipboard (the one that begins with `https://` and ends in `.git`. The repository name should be your username (the one you use to log into the University computers).

Mirror Push to this new repository, replacing xxx with the url from the clipboard making sure you are _in_ the `temp/` directory:

`cd temp/ && git push --mirror xxx`

Once you are sure the code is in your new repository, delete the temporary local repository.

`cd .. && rm -rf temp/`
Your private repository on GitHub will now contain a complete copy of this template including the commits that were already made. You can now start your assignment by carrying out the following steps:

Clone your private repository

## Local Config Settings

Before you make any commits you need to update the [local config settings](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup). Start by using the Terminal (or Git Bash on Windows) navigate inside the project. Once you are in this directory run the following commands, substituting you name as it appears on your ID badge and your university email address (without the `uni.` domain prefix).

```bash
git config user.name 'John Doe'
git config user.email 'doej@coventry.ac.uk'
git config core.hooksPath .githooks
git config --add merge.ff false
```

Start working on the assignment. Remember to install all the dependencies listed in the `package.json` file.

## Feature Branching

You should not be committing directly to the **master** branch, instead each task or activity you complete should be in its own _feature branch_. You should following the following steps:

1. Log onto GitHub and add an issue to the _issue tracker_, this is your _todo_ list.
2. Create a local feature branch making sure that the name of the branch includes both the issue _number_ and _title_ (in lower case).
    1. For example: `git checkout -b iss023/fix-login-bug`.
    2. You can see a list of all the local branches using `git branch`.
3. As you work on the issue make your local commits by:
    1. staging the files with `git add --all`.
    2. committing with the `no-ff` flag, eg. `git commit --no-ff -m 'detailed commit message here'`.
4. When the task is complete and all the tests pass, push the feature branch to GitHub.
    1. For example `git push origin iss023/fix-login-bug` would push the branch named above.
    2. Switch back to the _master_ branch with `git checkout master`.
5. Back on GitHub raise a **Pull Request** that merges this feature branch to the _master_ branch.
5. If there are no issues you can then merge the branch using the button in the _Pull Request_ interface.
6. Pull the latest version of the master branch code using `git pull origin master`.
