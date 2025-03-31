
-- ISO Languages
DROP TABLE IF EXISTS main.languages;
CREATE TABLE IF NOT EXISTS main.languages(
    iso_code CHAR(3) NOT NULL PRIMARY KEY,
    language_name VARCHAR(75) NOT NULL
);

-- Spoken Languages
DROP TABLE IF EXISTS main.spoken_languages;
CREATE TABLE IF NOT EXISTS main.spoken_languages(
    id INTEGER NOT NULL PRIMARY KEY,
    dialect STRING NOT NULL,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY (iso_code) REFERENCES languages(iso_code)
);

DROP TABLE IF EXISTS main.spoken_phonemes;
CREATE TABLE IF NOT EXISTS main.spoken_phonemes(
    phoneme STRING NOT NULL,
    language_id INTEGER NOT NULL,
    iso_code CHAR(3) NOT NULL,
    language_variety STRING NOT NULL,
    dialect_description STRING,
    FOREIGN KEY (language_id) REFERENCES spoken_languages(id),
    FOREIGN KEY (iso_code) REFERENCES languages(iso_code),
    PRIMARY KEY (phoneme, language_id)
);

-- Sign Languages
DROP TABLE IF EXISTS main.sign_languages;
CREATE TABLE IF NOT EXISTS main.sign_languages(
    id INTEGER NOT NULL PRIMARY KEY,
    dialect STRING NOT NULL,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY (iso_code) REFERENCES languages(iso_code)
);