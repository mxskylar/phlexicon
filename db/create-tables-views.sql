
-- ISO Languages
CREATE TABLE IF NOT EXISTS main.iso_languages(
    iso_code CHAR(3) NOT NULL PRIMARY KEY,
    language_name VARCHAR(75) NOT NULL
);

-- Spoken Languages
CREATE TABLE IF NOT EXISTS main.spoken_dialects(
    id INTEGER NOT NULL PRIMARY KEY,
    iso_code CHAR(3) NOT NULL,
    dialect STRING NOT NULL,
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code)
);

CREATE TABLE IF NOT EXISTS main.tmp_spoken_phonemes(
    phoneme STRING NOT NULL,
    language_id INTEGER NOT NULL,
    iso_code CHAR(3) NOT NULL,
    language_variety STRING NOT NULL,
    dialect_description STRING,
    FOREIGN KEY (language_id) REFERENCES spoken_dialects(id),
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code),
    PRIMARY KEY (phoneme, language_id)
);

-- TODO: Add table with unique spoken phonemes for all spoken languages, rename the table below to spoken_keyboards

CREATE TABLE IF NOT EXISTS main.spoken_phonemes(
    phoneme STRING NOT NULL,
    language_id INTEGER NOT NULL,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY (language_id) REFERENCES spoken_dialects(id),
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code),
    PRIMARY KEY (phoneme, language_id)
);

-- TODO: Get rid of this table
CREATE TABLE IF NOT EXISTS main.spoken_entries(
    phonemes STRING NOT NULL, -- Insert with json_array and query with json_each: https://www.sqlite.org/json1.html
    language_id INTEGER NOT NULL,
    iso_code CHAR(3) NOT NULL,
    recording BLOB NOT NULL,
    FOREIGN KEY (language_id) REFERENCES spoken_dialects(id),
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code),
    PRIMARY KEY (phonemes, language_id)
);

-- Sign Languages
CREATE TABLE IF NOT EXISTS main.sign_dialects(
    id INTEGER NOT NULL PRIMARY KEY,
    dialect STRING NOT NULL,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code)
);

-- TODO: Add table with unique sign phonemes for all sign languages, rename the table below to sign_keyboards

CREATE TABLE IF NOT EXISTS main.sign_phonemes(
    phoneme STRING NOT NULL,
    language_id INTEGER NOT NULL,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY (language_id) REFERENCES sign_dialects(id),
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code),
    PRIMARY KEY (phoneme, language_id)
);

-- TODO: Get rid of this table
CREATE TABLE IF NOT EXISTS main.sign_entries(
    phonemes STRING NOT NULL, -- Insert with json_array and query with json_each: https://www.sqlite.org/json1.html
    language_id INTEGER NOT NULL,
    iso_code CHAR(3) NOT NULL,
    recording BLOB NOT NULL,
    FOREIGN KEY (language_id) REFERENCES sign_dialects(id),
    FOREIGN KEY (iso_code) REFERENCES iso_languages(iso_code),
    PRIMARY KEY (phonemes, language_id)
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
CREATE VIEW entries AS
SELECT *, "SPOKEN" AS language_type
FROM spoken_entries
UNION
SELECT *, "SIGN" AS language_type
FROM sign_entries;