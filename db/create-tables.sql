
DROP TABLE IF EXISTS main.iso_languages;
CREATE TABLE IF NOT EXISTS main.iso_languages(
    id char(3) NOT NULL,
    print_name varchar(75) NOT NULL,
    inverted_name varchar(75) NOT NULL
);

DROP TABLE IF EXISTS main.spoken_languages;
CREATE TABLE IF NOT EXISTS main.spoken_languages(
    language_variety string NOT NULL PRIMARY KEY,
    iso_code char(3) NOT NULL,
    FOREIGN KEY(iso_code) REFERENCES iso_languages(id)
);