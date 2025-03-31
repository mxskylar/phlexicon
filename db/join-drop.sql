INSERT INTO sign_languages
SELECT sld.id, iso_code, ref_name || " (" || region || ")" AS variety_name
FROM sign_language_dictionaries sld
JOIN iso_languages il
ON iso_code = il.id;

DROP TABLE sign_language_dictionaries;
DROP TABLE iso_languages;