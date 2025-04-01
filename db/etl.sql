-- Choose dialect for spoken languages and insert unique values
-- Then, drop the staging table with excess columns
INSERT INTO spoken_dialects (id, iso_code, dialect)
SELECT
    language_id,
    iso_code,
    CASE WHEN dialect_description IS NULL
        THEN language_variety
        ELSE language_variety || ", " || dialect_description
    END
FROM (
    SELECT DISTINCT language_id, iso_code, language_variety, dialect_description
    FROM tmp_spoken_phonemes
);

INSERT INTO spoken_phonemes (phoneme, language_id, iso_code)
SELECT phoneme, language_id, iso_code
FROM tmp_spoken_phonemes;

DROP TABLE tmp_spoken_phonemes;

-- Drop rows from iso_languages table  that are not supported
DELETE FROM iso_languages
WHERE iso_code NOT IN (
    SELECT DISTINCT iso_code
    FROM dialects
);

-- TODO: Insert data for demo spoken & sign languages