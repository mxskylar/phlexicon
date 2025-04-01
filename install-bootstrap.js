import * as fs from 'fs';
import {downloadFile} from "./install-utils.js";

const INSTALLED_RESOURCES_DIR = "installed-resources"

// Delete existing resources and download fresh
if (fs.existsSync(INSTALLED_RESOURCES_DIR)) {
    console.log(`Deleting existing directory: ${INSTALLED_RESOURCES_DIR}`);
    fs.rmSync(INSTALLED_RESOURCES_DIR, {
        recursive: true,
        force: true
    });
    fs.mkdirSync(INSTALLED_RESOURCES_DIR);
}


// Bootswatch theme for Bootstrap UI
// https://bootswatch.com/cerulean/
downloadFile("https://bootswatch.com/5/cerulean/bootstrap.min.css", INSTALLED_RESOURCES_DIR, "bootstrap.min.css");

// Bootstrap UI components & framework
// https://getbootstrap.com/docs/5.0/getting-started/introduction/
// Minified bundle downloaded from CDN: https://getbootstrap.com/docs/5.3/getting-started/download/#cdn-via-jsdelivr
downloadFile("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js", INSTALLED_RESOURCES_DIR, "bootstrap.bundle.min.js");