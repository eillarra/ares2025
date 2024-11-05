# ARES Conference 2025 application

This repository contains the source code for the ARES Conference 2025 pwa.
Development is done using Vue and the Quasar framework, but the final website is a static site.

## Updating the website contents

The website uses the Evan API to fetch the contents.
To update the contents, you need to update the conference information on Evan.

## Development

### Install Quasar CLI and dependencies

```bash
yarn global add @quasar/cli
yarn
```

### Start the app in development mode

```bash
yarn dev
```

### Lint the files

```bash
yarn lint
```

### Format the files

```bash
yarn format
```

### Build the app for production

Currently we are only exporting the application in PWA mode.

```bash
yarn build
```
