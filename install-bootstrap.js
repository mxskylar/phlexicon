import {downloadFile} from "./install-utils.js";

// Bootswatch theme for Bootstrap UI
// https://bootswatch.com/cerulean/
downloadFile("https://bootswatch.com/5/cerulean/bootstrap.min.css", "resources", "bootstrap.min.css");

// Bootstrap UI components & framework
// https://getbootstrap.com/docs/5.0/getting-started/introduction/
// Minified bundle downloaded from CDN: https://getbootstrap.com/docs/5.3/getting-started/download/#cdn-via-jsdelivr
downloadFile("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js", "resources", "bootstrap.bundle.min.js");