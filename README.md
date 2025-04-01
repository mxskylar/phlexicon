# Phlexicon

> Beginner-friendly phonetic keyboards for spoken & sign languages on desktop Mac, Windows, & Linux.
> Use them to type out vocobulary [phoneme](https://en.wikipedia.org/wiki/Phoneme) by phoneme and build your lexicon!

See the [user guide](https://mxskylar.github.io/phlexicon/) to install and use the application.

---

Phlexicon would be nothing without the open source data and frameworks it depends on.
Read more about those [here](https://mxskylar.github.io/phlexicon/attribution).

## Development

Phlexicon is an [Electron](https://www.electronjs.org/) app built with [node](https://nodejs.org/) `v23.10.0`.

To build and launch the app from scratch:
```bash
npm start
```

Alternatively, you may run individual steps within `npm start` one at a time:
```bash
npm install # Installs Node & web dependencies
npm run install-db-data # Download data for database
npm run init-db # Creates & populates database tables
npm run app # Compiles Typescript, bundles application, then launches Electron app
```