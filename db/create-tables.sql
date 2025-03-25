
DROP TABLE IF EXISTS main.language_codes;
CREATE TABLE IF NOT EXISTS main.language_codes(
    code string PRIMARY KEY
);

DROP TABLE IF EXISTS main.language_varieties;
CREATE TABLE IF NOT EXISTS main.language_varieties(
    variety_name string PRIMARY KEY,
    language_code string,
    FOREIGN KEY(language_code) REFERENCES language_codes(code)
);