import {recreateDirectory, downloadFile} from "./utils.ts";

const INSTALLED_RESOURCES_DIR = "installed-resources";

recreateDirectory(INSTALLED_RESOURCES_DIR);

// Bootswatch theme for Bootstrap UI
// https://bootswatch.com/cerulean/
await downloadFile("https://bootswatch.com/5/cerulean/bootstrap.min.css", INSTALLED_RESOURCES_DIR);

// Bootstrap UI components & framework
// https://getbootstrap.com/docs/5.0/getting-started/introduction/
// Minified bundle downloaded from CDN: https://getbootstrap.com/docs/5.3/getting-started/download/#cdn-via-jsdelivr
await downloadFile("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js", INSTALLED_RESOURCES_DIR);