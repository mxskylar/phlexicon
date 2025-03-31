
-- ISO Languages
DROP TABLE IF EXISTS main.iso_languages;
CREATE TABLE IF NOT EXISTS main.iso_languages(
    iso_code CHAR(3) NOT NULL PRIMARY KEY,
    language_name VARCHAR(75) NOT NULL
);

-- Spoken Languages
DROP TABLE IF EXISTS main.spoken_dialects;
CREATE TABLE IF NOT EXISTS main.spoken_dialects(
    id INTEGER NOT NULL PRIMARY KEY,
    iso_code CHAR(3) NOT NULL,
    dialect STRING NOT NULL,
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code)
);

DROP TABLE IF EXISTS main.spoken_phonemes;
CREATE TABLE IF NOT EXISTS main.spoken_phonemes(
    phoneme STRING NOT NULL,
    language_id INTEGER NOT NULL,
    iso_code CHAR(3) NOT NULL,
    language_variety STRING NOT NULL,
    dialect_description STRING,
    FOREIGN KEY (language_id) REFERENCES spoken_dialects(id),
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code),
    PRIMARY KEY (phoneme, language_id)
);

-- Sign Languages
DROP TABLE IF EXISTS main.sign_dialects;
CREATE TABLE IF NOT EXISTS main.sign_dialects(
    id INTEGER NOT NULL PRIMARY KEY,
    dialect STRING NOT NULL,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code)
);

-- Create union views of spoken & sign language tables
DROP VIEW IF EXISTS dialects;
CREATE VIEW dialects AS
SELECT *, "SPOKEN" AS language_type
FROM spoken_dialects
UNION
SELECT *, "SIGN" AS language_type
FROM sign_dialects;