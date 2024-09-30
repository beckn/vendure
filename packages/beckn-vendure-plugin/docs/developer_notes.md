## Introduction

This document provides instructions and notes for developers of the Beckn Vendure Plugin.

## Setting up the development environment

The following is a description of one instance of developer environment. However there might be better and more optimised versions than this.

1. Have a clone of this repo (https://github.com/beckn/vendure) in a folder. For simplicity, its called `$/repos/vendure`. It could be placed anywhere. In the scripts the corresponding path has to be updated.
2. Install Vendure in a folder. In this document, I call it `$/vendure/dev`. In this folder you will install the `beckn-vendure-plugin, digital-products and reviews` plugin. Follow the instructions and setup the plugins to ensure the Vendure works.
3. After every pull of the plugin repo, use the following script in the `$/vendure/dev/src/plugins` to get the latest code into this workspace.

```
# sync_from_repo_to_here.sh
cp $/repos/vendure/packages/beckn-vendure-plugin .
cp $/repos/vendure/packages/reviews .
cp $/repos/vendure/packages/digital-products .
```

4. After you have modified the code and ensured everything is working, run the following script in `$/repos/vendure/packages`. Now the changes will be in the git clone. Create a branch and push the changes.

```
# update_from_dev.sh

rm -rf beckn-vendure-plugin
cp -R ~/work/vendure/dev/src/plugins/beckn-vendure-plugin .
rm -rf reviews
cp -R ~/work/vendure/dev/src/plugins/reviews .
rm -rf digital-products
cp -R ~/work/vendure/dev/src/plugins/digital-products .
```

## Testing end to end test cases

The overall test instructions has been absorbed into the [troubleshooting guide](../troubleshoot.md).

## Alternate design

This section is also integrated into the [troubleshooting guide](../troubleshoot.md) introduction section. The code for the initial implemenation of the alternate design has now been removed (Oct 2024). If you want to have a look at it, see any commit prior to Sep 30, 2024.
