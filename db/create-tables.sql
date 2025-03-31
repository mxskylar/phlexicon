
DROP TABLE IF EXISTS main.iso_languages;
CREATE TABLE IF NOT EXISTS main.iso_languages(
    id CHAR(3) NOT NULL,
    print_name VARCHAR(75) NOT NULL,
    inverted_name VARCHAR(75) NOT NULL
);

DROP TABLE IF EXISTS main.spoken_languages;
CREATE TABLE IF NOT EXISTS main.spoken_languages(
    language_variety STRING NOT NULL PRIMARY KEY,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY(iso_code) REFERENCES iso_languages(id)
);

DROP TABLE IF EXISTS main.sign_languages;
CREATE TABLE IF NOT EXISTS main.sign_languages(
    sign_puddle_dictionary STRING NOT NULL PRIMARY KEY,
    region STRING NOT NULL,
    iso_code CHAR(3) NOT NULL,
    FOREIGN KEY(iso_code) REFERENCES iso_languages(id)
);