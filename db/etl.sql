-- Choose dialect for spoken languages and insert unique values
INSERT INTO spoken_languages (id, iso_code, dialect)
SELECT sld.id, iso_code, ref_name || " (" || region || ")"
FROM spoken_phonemes;