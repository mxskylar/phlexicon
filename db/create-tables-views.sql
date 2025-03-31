
-- ISO Languages
DROP TABLE IF EXISTS main.iso_languages;
CREATE TABLE IF NOT EXISTS main.iso_languages(
    id CHAR(3) NOT NULL,
    ref_name VARCHAR(75) NOT NULL
);

-- Spoken Languages
DROP TABLE IF EXISTS main.spoken_languages;
CREATE TABLE IF NOT EXISTS main.spoken_languages(
    id INTEGER NOT NULL PRIMARY KEY,
    variety_name STRING NOT NULL,
    iso_code CHAR(3) NOT NULL
);

DROP TABLE IF EXISTS main.spoken_phonemes;
CREATE TABLE IF NOT EXISTS main.spoken_phonemes(
    phoneme STRING NOT NULL,
    variety_id CHAR(3) NOT NULL,
    FOREIGN KEY(variety_id) REFERENCES spoken_languages(id),
    PRIMARY KEY (phoneme, variety_id)
);

-- Sign Languages
DROP TABLE IF EXISTS main.sign_language_dictionaries;
CREATE TABLE IF NOT EXISTS main.sign_language_dictionaries(
    id INTEGER NOT NULL PRIMARY KEY,
    sign_puddle_dictionary STRING NOT NULL,
    region STRING NOT NULL,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY(iso_code) REFERENCES iso_languages(id)
);

DROP TABLE IF EXISTS main.sign_languages;
CREATE TABLE IF NOT EXISTS main.sign_languages(
    id INTEGER NOT NULL PRIMARY KEY,
    variety_name STRING NOT NULL,
    iso_code CHAR(3) NOT NULL
);