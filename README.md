# Phlexicon

Beginner-friendly phonetic keyboards for spoken & sign languages on desktop Mac, Windows, & Linux.

Type [phonemes](https://en.wikipedia.org/wiki/Phoneme) using the [International Phonetic Alphabet (IPA)](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet)
for spoken languages and [SignWriting](https://www.signwriting.org/about/) for sign languages.
Choose from a list of phonemes used by a particular dialect or optionally, all phonemes in the IPA or SignWriting.

The application is still under development and is only available for developers to build from scratch.
The [user guide](https://mxskylar.github.io/phlexicon/) will be updated when Phlexicon is available for installation.

> Phlexicon would be nothing without the open source data and frameworks it depends on.
> Read more about those [here](https://mxskylar.github.io/phlexicon/attribution).

## Development

Phlexicon is an [Electron](https://www.electronjs.org/) app built with [Node](https://nodejs.org/) `v23.10.0`.

Use the following commands to build and debug the application. See the [package.json](package.json) to understand how they are configured.

### Commands

Builds then launches the app from scratch.

```bash
npm start
```

*Deletes cache?* **Yes**, web resources & raw data previously downloaded by `postinstall` script are deleted then re-installed. If it exists, the previous version of the application bundled by `npm run app` are deleted then re-created.

---

Installs Node packages listed in the `package.json`, web resources (JavaScript UI frameworks, CSS style themes, & fonts), and raw data that will be inserted into the database by the `npm run app` command.

```bash
npm install
```

*Deletes cache?* **Yes**, web resources & raw data previously previously downloaded by the command are deleted, then re-installed. This does *not* apply to Node packages listed in the `package.json`, which are only re-installed if they do not exist in the cache.

---

Only installs Node packages listed in the `package.json`. Skips the `postinstall` script that installs all other dependencies.

```bash
npm install --ignore-scripts
```

*Deletes cache?* **No**, only installs Node packages that are not already in the cache. Preserves all other dependency caches that may contain web resources, raw data, etc.

---

Rebuilds `sqlite3` module for Electron build.

```bash
npm install --ignore-scripts
```

*Deletes cache?* Only rebuilds `sqlite3` package used by Electron build.

---

Bundles then launches the app.

```bash
npm run app
```

*Deletes cache?* **Yes**, deletes the bundle for the previous version of the app, if it exists, then re-creates it.

---

Bundles the application by copying web resources (JavaScript UI frameworks, CSS style themes, & fonts)
into the bundle directory, parsing and inserting raw data into the database, compiling TypeScript into JavaScript,
and bundling React with [Webpack](https://webpack.js.org/).


```bash
npm run init-app
```

*Deletes cache?* **Yes**, deletes the bundle for the previous version of the app, if it exists, then re-creates it.

---

Compiles [TypeScript](https://www.typescriptlang.org/) into JavaScript.

```bash
npm run compile-typescript
```

*Deletes cache?* **Partially**, replaces JavaScript files in application bundle, if they exist, with newly compiled files.

---

Bundles [React](https://react.dev/) JavaScript framework with [Webpack](https://webpack.js.org/).

```bash
npm run compile-react
```

*Deletes cache?* **Partially**, replaces JavaScript files in application bundle, if they exist, with newly compiled files.

---

Launches the Electron application.

```bash
npm run electron
```

*Deletes cache?* **No**, launches the app using its existing bundle.