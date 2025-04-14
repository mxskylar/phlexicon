
-- ISO Languages
CREATE TABLE IF NOT EXISTS main.iso_languages(
    `code` CHAR(3) NOT NULL PRIMARY KEY,
    `name` VARCHAR(75) NOT NULL
);

-- Spoken Languages
CREATE TABLE IF NOT EXISTS main.spoken_dialects(
    `id` STRING NOT NULL PRIMARY KEY,
    `dialect` STRING NOT NULL
);

CREATE TABLE IF NOT EXISTS main.ipa(
    `symbol` STRING NOT NULL PRIMARY KEY,
    `type` STRING CHECK(`type` IN ("vowel", "consonant", "other"))
);

-- https://en.wikipedia.org/wiki/IPA_vowel_chart_with_audio
CREATE TABLE IF NOT EXISTS main.vowels(
    `phoneme` STRING NOT NULL PRIMARY KEY,
    `rounded` BOOLEAN NOT NULL,
    -- X-axis of IPA vowel chart
    `horizontal_placement` STRING NOT NULL CHECK(place IN ("front", "central", "back")),
    -- Y-axis of IPA vowel chart
    `close` BOOLEAN NOT NULL,
    `near_close` BOOLEAN NOT NULL,
    `close_mid` BOOLEAN NOT NULL,
    `mid` BOOLEAN NOT NULL,
    `near_open` BOOLEAN NOT NULL,
    `open` BOOLEAN NOT NULL,
    FOREIGN KEY (`phoneme`) REFERENCES ipa(`symbol`)
);

-- https://en.wikipedia.org/wiki/IPA_consonant_chart_with_audio
CREATE TABLE IF NOT EXISTS main.consonants(
    `phoneme` STRING NOT NULL PRIMARY KEY,
    
    FOREIGN KEY (`phoneme`) REFERENCES ipa(`symbol`)
);

CREATE TABLE IF NOT EXISTS main.spoken_dialect_phonemes(
    `phoneme` STRING NOT NULL,
    `dialect_id` STRING NOT NULL,
    FOREIGN KEY (`phoneme`) REFERENCES ipa(`symbol`),
    FOREIGN KEY (`dialect_id`) REFERENCES spoken_dialects(`id`),
    PRIMARY KEY (`phoneme`, `dialect_id`)
);

-- Sign Languages
CREATE TABLE IF NOT EXISTS main.tmp_sign_dialects(
    `iso_code` CHAR(3) NOT NULL,
    `region` STRING NOT NULL,
    FOREIGN KEY (`iso_code`) REFERENCES iso_languages(`code`),
    PRIMARY KEY (`iso_code`, `region`)
);

CREATE TABLE IF NOT EXISTS main.sign_dialects(
    `id` STRING NOT NULL PRIMARY KEY,
    `dialect` STRING NOT NULL
);

CREATE TABLE IF NOT EXISTS main.signwriting(
    `symbol` STRING NOT NULL PRIMARY KEY,
    `type` STRING NOT NULL CHECK(`type` IN ("oriented_handshape", "movement", "location_or_expression"))
);

CREATE TABLE IF NOT EXISTS main.sign_dialect_phonemes(
    `phoneme` STRING NOT NULL,
    `dialect_id` STRING NOT NULL,
    FOREIGN KEY (`phoneme`) REFERENCES signwriting(`symbol`),
    FOREIGN KEY (`dialect_id`) REFERENCES sign_dialects(`id`),
    PRIMARY KEY (`phoneme`, `dialect_id`)
);