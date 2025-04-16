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
npm install # Installs Node packages, web dependencies, & raw data for database
npm run app # Initializes database, compiles Typescript, bundles application, then launches Electron app
```

The `npm install` command will install Node packages listed in the `package.json`,
then it will trigger a `postinstall` script that downloads web dependencies
(JavaScript frameworks, CSS themes, and fonts) and raw data (CSV and tab-seperated files)
that will be inserted into the database by the `npm run app` command.

The `postinstall` command may take a few minutes to finish and may timeout
due to the limitations of external API's. It also deletes previously installed dependencies
before re-installing them. If you simply wish to re-install Node packages listed in the `package.json`,
it will be quicker and less error-prone to skip the `postinstall` script by running:

```bash
npm install --ignore-scripts
```