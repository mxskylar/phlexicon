# Phlexicon

A phonetic catalog for lexicons:
- **Study a language:** Build a personal database of the signs or words in the languages you study.
- **Document vocabulary:** Define and translate vocab in custom dictionaries. 
- **Analyze accents:** Break down vocab into its fundamental parts—[phonemes](https://en.wikipedia.org/wiki/Phoneme), the individual sounds of a word or parameters of a sign.

See the [user guide](https://mxskylar.github.io/phlexicon/) for more about the application.

Phlexicon would be nothing without the open source data and frameworks it depends on.
Read more about those [here](https://mxskylar.github.io/phlexicon/attribution).

## Development

Phlexicon is an [Electron](https://www.electronjs.org/) app built with [node](https://nodejs.org/) `v23.10.0`.

Setup the app:
```bash
npm install # Install JS & CSS dependencies
npm run install-db-data # Download data for database
npm run init-db # Create & populate database tables
```

Run the app:
```bash
npm start
```