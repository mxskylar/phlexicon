
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
    variety_id CHAR(3) NOT NULL,
    language_variety STRING NOT NULL,
    dialect_description STRING,
    FOREIGN KEY (variety_id) REFERENCES languages(iso_code),
    PRIMARY KEY (phoneme, variety_id)
);

-- Sign Languages
DROP TABLE IF EXISTS main.sign_languages;
CREATE TABLE IF NOT EXISTS main.sign_languages(
    id INTEGER NOT NULL PRIMARY KEY,
    dialect STRING NOT NULL,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY (iso_code) REFERENCES languages(iso_code)
);