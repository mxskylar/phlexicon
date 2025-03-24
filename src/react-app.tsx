
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {Page} from "./components/page";

const node = document.getElementById('react-app');
if (node !== null) {
    const root = createRoot(node);
    root.render(<Page />);
}