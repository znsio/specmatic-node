# Contributing

Thanks for your willingness to contribute!

Please check [open issues](https://github.com/znsio/specmatic-node/issues?q=is%3Aopen+is%3Aissue). Please respond to questions/bug reports/feature requests!

## Project setup

1.  Fork and clone the repo
2.  Run `npm install` to install dependencies. This also downloads the specmatic.jar file of the version specified in src/config.ts.
3.  Create a branch for your PR with `git checkout -b your-branch-name`

> Tip: Keep your `master` branch pointing at the original repository and make
> pull requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream https://github.com/znsio/specmatic-node.git
> git fetch upstream
> git branch --set-upstream-to=upstream/master master
> ```
>
> This will add the original repository as a "remote" called "upstream," Then
> fetch the git information from that remote, then set your local `master`
> branch to use the upstream master branch whenever you run `git pull`. Then you
> can make all of your pull request branches based on this `master` branch.
> Whenever you want to update your version of `master`, do a regular `git pull`.

## Committing and Pushing changes

Please make sure to run the tests before you commit your changes by using the command

`npm test`

Build the dist files locally once to make sure build works

`npm run build`

Finally commit

## Publishing a new version to npm

### Prerequisites
* Push access to master branch 
* Node version 14 or higher

### Step 1: Updating specmatic jar version
If the specmatic jar version is to be updated, modify the __specmaticVersion__ property in __package.json__ accordingly and check it in.

### Step 2: Make a release via github releases
* Goto [github releases](https://github.com/znsio/specmatic-node/releases) and draft a new release
* Click `choose a tag` and enter the required version. If the tag exists then you might be releasing a wrong version. Reverify the tag and version number. Ideally the tag should not exist as this is a new version and thus you should be presented with option to `+ Create new tag: <version> on publish` option. Click it.
* Give a release title of format `v<version>`. 
* Describe the changes in this release briefly
* You can either save this draft and come back later to publish it or publish it now.
* On publish, a github action is triggered that updates the release on npm repository.

You can check the publish status in [github actions](https://github.com/znsio/specmatic-node/actions). Though, it might take some time to reflect in the [specmatic npm page](https://www.npmjs.com/package/specmatic) because of the npm caching.
