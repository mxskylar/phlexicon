# FAQ

## Where does Phlexicon get its data?

Spoken phonemes are pulled from [PBase](https://pbase.phon.chass.ncsu.edu/)
and the handshapes of sign languages are pulled from [SignPuddle 3.0](https://signpuddle.org/)
and the [one-dimensional font](https://www.sutton-signwriting.io/#fonts) for [SignWriting](https://www.signwriting.org/about).

These datasets are normalized and parsed by Phlexicon.
Some granular data may be excluded or simplified, but the data in the app
should not meaningfully differ from original datasets,
unless there is a [bug](https://github.com/mxskylar/phlexicon/issues).

See the [data parsing source code](https://github.com/mxskylar/phlexicon/blob/main/ci/app/init.ts)
to better understand how the original datasets are normalized, simplified, and parsed.

## What fonts does Phlexicon use?

The [Charis SIL font](https://software.sil.org/charis/) for spoken phonemes in the
[International Phonetic Alphabet (IPA)](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet)
and the [one-dimensional font for SignWriting](https://www.sutton-signwriting.io/#fonts),
which can be used to write sign languages.

Some characters in the IPA use are in a [Unicode private use area](https://en.wikipedia.org/wiki/Private_Use_Areas),
which means that the Charis font or another IPA-compatible font will need to be used to properly render them.
The SignWriting font must be used to render all symbols in the SignWriting system.

## Where can I find symobls for movement, location, expressions, etc. in sign languages?

For now, only oriented handshapes are supported by Phlexicon. The [SignMaker tool](https://www.signbank.org/signmaker/#)
can be used to find symbols for other phonemic parameters in the [SignWriting](https://www.signwriting.org/about) system.