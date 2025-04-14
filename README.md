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

Phlexicon is an [Electron](https://www.electronjs.org/) app built with [node](https://nodejs.org/) `v23.10.0`.

To build and launch the app from scratch:
```bash
npm start
```

Alternatively, you may run individual steps within `npm start` one at a time:
```bash
npm install # Installs Node, web dependencies, & raw data for database
npm run init-db # Creates & populates database tables
npm run app # Compiles Typescript, bundles application, then launches Electron app
```