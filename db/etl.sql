-- Choose dialect for spoken languages and insert unique values
-- Then, drop columns no longer needed
INSERT INTO spoken_languages (id, iso_code, dialect)
SELECT
    language_id,
    iso_code,
    CASE WHEN dialect_description IS NULL
        THEN language_variety
        ELSE language_variety || ", " || dialect_description
    END
FROM (
    SELECT DISTINCT language_id, iso_code, language_variety, dialect_description
    FROM spoken_phonemes
);

ALTER TABLE spoken_phonemes DROP COLUMN language_variety;
ALTER TABLE spoken_phonemes DROP COLUMN dialect_description;