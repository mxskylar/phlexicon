import {downloadFile} from "../install-utils.js";

const dataDir = "db/data";

// ISO language codes & names
// See Language Names Index at: https://iso639-3.sil.org/code_tables/download_tables
await downloadFile("https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3_Name_Index.tab", dataDir, "iso-languages.tab");

// Phoible data on spoken languages
// https://phoible.org/download
// https://github.com/phoible/dev/tree/master/data
await downloadFile("https://raw.githubusercontent.com/phoible/dev/master/mappings/InventoryID-LanguageCodes.csv", dataDir, "spoken-languages.csv");
await downloadFile("https://raw.githubusercontent.com/phoible/dev/master/data/phoible.csv", dataDir, "spoken-phonemes.csv");

// SignPuddle API for SignWriting
// API: https://signpuddle.com/client/api/
// Tools: https://signpuddle.com/tools/
// Dictionary UI: https://signpuddle.com/client/
// SignWriting Tutorial: https://www.signwriting.org/lessons/lessonsw/000%20Cover.html
// SignWriting Characters: https://signbank.org/SignWriting_Character_Viewer.html#?ui=en&set=uni8
// SignMaker: https://www.signbank.org/signmaker.html
