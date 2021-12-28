# Contributing

Thanks for being willing to contribute!

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

Build the dist files using

`npm run build`


### Update Typings

If your PR introduced some changes in the API, you are more than welcome to
modify the Typescript type definition to reflect those changes. Just modify the
`/types/index.d.ts` file accordingly. If you have never seen Typescript
definitions before, you can read more about it in its
[documentation pages](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html).
Though this library itself is not written in Typescript we use
[dtslint](https://github.com/microsoft/dtslint) to lint our typings.


## Publishing a new version to npm

### Prerequisites
* Access to push to master. 
* Node version > 14 is needed.

### Step 1: Make the changes
If there is a new version available in [specmatic downloads](https://specmatic.in/download/), download it in the project root, replacing the older version. Commit the new version.

### Step 2: Update node module's version
`npm version` displays the existing version of the npm module.

Use the suitable command to auto increment the npm version:

`npm version major`

`npm version minor`

`npm version patch`

OR

Update the version to a specific semver by using command `npm version x.y.z`

### Step 3: Publish to npm
Push to master will automatically build, run the tests and publish the new version to npm. You can check the status of the publish in [github actions](https://github.com/znsio/specmatic-node/actions). Though, it might take some time to reflect in the [specmatic npm page](https://www.npmjs.com/package/specmatic) because of the npm caching.


## Help needed

Please checkout the [the open issues][issues]

Also, please watch the repo and respond to questions/bug reports/feature
requests! Thanks!