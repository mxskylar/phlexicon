
-- ISO Languages
CREATE TABLE IF NOT EXISTS main.iso_languages(
    iso_code CHAR(3) NOT NULL PRIMARY KEY,
    language_name VARCHAR(75) NOT NULL
);

-- Spoken Languages
CREATE TABLE IF NOT EXISTS main.spoken_dialects(
    id STRING NOT NULL PRIMARY KEY,
    dialect STRING NOT NULL
);

CREATE TABLE IF NOT EXISTS main.spoken_phonemes(
    symbol STRING NOT NULL PRIMARY KEY,
    phoneme_type STRING CHECK(phoneme_type IN ("vowel", "consonant"))
);

CREATE TABLE IF NOT EXISTS main.spoken_dialect_phonemes(
    phoneme STRING NOT NULL,
    dialect_id STRING NOT NULL,
    FOREIGN KEY (phoneme) REFERENCES spoken_phonemes(symbol),
    FOREIGN KEY (dialect_id) REFERENCES spoken_dialects(id),
    PRIMARY KEY (phoneme, dialect_id)
);

-- Sign Languages
CREATE TABLE IF NOT EXISTS main.tmp_sign_dialects(
    iso_code CHAR(3) NOT NULL,
    region STRING NOT NULL,
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code),
    PRIMARY KEY (iso_code, region)
);

CREATE TABLE IF NOT EXISTS main.sign_dialects(
    id STRING NOT NULL PRIMARY KEY,
    dialect STRING NOT NULL
);

CREATE TABLE IF NOT EXISTS main.sign_phonemes(
    symbol STRING NOT NULL PRIMARY KEY,
    phoneme_type STRING NOT NULL CHECK(phoneme_type IN ("oriented_handshape", "movement", "location_or_expression"))
);

CREATE TABLE IF NOT EXISTS main.sign_dialect_phonemes(
    phoneme STRING NOT NULL,
    dialect_id STRING NOT NULL,
    FOREIGN KEY (phoneme) REFERENCES sign_phonemes(symbol),
    FOREIGN KEY (dialect_id) REFERENCES sign_dialects(id),
    PRIMARY KEY (phoneme, dialect_id)
);

-- Create union views of spoken & sign language tables
CREATE VIEW dialects AS
SELECT *, "SPOKEN" AS language_type
FROM spoken_dialects
UNION
SELECT *, "SIGN" AS language_type
FROM sign_dialects;

CREATE VIEW phonemes AS
SELECT *, "SPOKEN" AS language_type
FROM spoken_phonemes
UNION
SELECT *, "SIGN" AS language_type
FROM sign_phonemes;

-- TODO: Get rid of this table
CREATE VIEW dialect_phonemes AS
SELECT *, "SPOKEN" AS language_type
FROM spoken_dialect_phonemes
UNION
SELECT *, "SIGN" AS language_type
FROM sign_dialect_phonemes;