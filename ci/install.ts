import * as fs from 'fs';
import StreamZip from "node-stream-zip";

export const recreateDirectory = (path: string) => {
    if (fs.existsSync(path)) {
        console.log(`Deleting then recreating directory: ${path}`);
        fs.rmSync(path, {
            recursive: true,
            force: true
        });
        fs.mkdirSync(path);
    }
};

export const downloadFile = async (url: string, dir: string) => {
    const path = new URL(url).pathname.split("/");
    const fileName = path[path.length - 1];
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const filePath = `${dir}/${fileName}`;
    console.log(`Downloading ${filePath} from: ${url}`);
    await fetch(url, {method: "GET"})
        .then(response => response.arrayBuffer())
        .then(responseData => fs.appendFileSync(filePath, Buffer.from(responseData)));
};

// INSTALLED RESOURCES
const INSTALLED_RESOURCES_DIR = "installed-resources";
recreateDirectory(INSTALLED_RESOURCES_DIR);

// Bootswatch theme for Bootstrap UI: https://bootswatch.com/cerulean/
await downloadFile("https://bootswatch.com/5/cerulean/bootstrap.min.css", INSTALLED_RESOURCES_DIR);

// Bootstrap UI components & framework: https://getbootstrap.com/docs/5.0/getting-started/introduction/
// Minified bundle downloaded from CDN: https://getbootstrap.com/docs/5.3/getting-started/download/#cdn-via-jsdelivr
await downloadFile("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js", INSTALLED_RESOURCES_DIR);

// SignWriting Fonts: https://www.sutton-signwriting.io/#fonts
export const SIGNWRITING_FONT_FILE = "SuttonSignWritingLine.ttf";
await downloadFile(`https://unpkg.com/@sutton-signwriting/font-ttf@1.0.0/font/${SIGNWRITING_FONT_FILE}`, INSTALLED_RESOURCES_DIR);

// RAW DB DATA
export const DATA_DIR = "data";
recreateDirectory(DATA_DIR);

// ISO 639-3 Code Set: https://iso639-3.sil.org/code_tables/download_tables#639-3%20Code%20Set
export const ISO_FILE = "iso-639-3.tab";
await downloadFile(`https://iso639-3.sil.org/sites/iso639-3/files/downloads/${ISO_FILE}`, DATA_DIR);

// PBase data on spoken languages: https://pbase.phon.chass.ncsu.edu/
await downloadFile("https://phon.chass.ncsu.edu/pbase/pbasefiles.zip", DATA_DIR);
const pbaseZipFile = await new StreamZip.async({file: `${DATA_DIR}/pbasefiles.zip`});
await pbaseZipFile.extract(null, DATA_DIR);
await pbaseZipFile.close();
export const UNZIPPED_PBASE_FILES_DIR = "pbase";