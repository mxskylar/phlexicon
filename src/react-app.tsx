
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Link, Navigate } from 'react-router-dom';
import { SpokenLanguages } from './pages/spoken-languages.tsx';
import { SignLanguages } from './pages/sign-languages.tsx';
import { ExportData } from './pages/export-data.tsx';

const NAV_BAR_TOGGLE_BUTTON_ID = "navigation-bar-toggle-button";

const hideNavMenu = e => {
    const navBarToggleButton = document.getElementById(NAV_BAR_TOGGLE_BUTTON_ID);
    if (navBarToggleButton.getAttribute("aria-expanded") === "true") {
        navBarToggleButton.click();
    }
}

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-2">
            <div className="container-fluid">
                <div className="navbar-brand">Phlexicon</div>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    id={NAV_BAR_TOGGLE_BUTTON_ID}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to="/spoken-languages"
                                onClick={e => hideNavMenu(e)}
                            >
                                🗣️&nbsp;&nbsp;Spoken Languages
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to="/sign-languages"
                                onClick={e => hideNavMenu(e)}
                            >
                                🤟&nbsp;&nbsp;Sign Languages
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to="/export-data"
                                onClick={e => hideNavMenu(e)}
                            >
                                💾&nbsp;&nbsp;Export Data
                            </Link>
                        </li>
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="https://mxskylar.github.io/phlexicon"
                                target="_blank"
                                onClick={e => hideNavMenu(e)}
                            >
                                📖&nbsp;&nbsp;User Guide
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

const App = () => {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/spoken-languages" element={<SpokenLanguages/>}/>
                <Route path="/sign-languages"  element={<SignLanguages/>}/>
                <Route path="/export-data"  element={<ExportData/>}/>
                <Route path="*" element={<Navigate to="/spoken-languages" replace />}/>
            </Routes>
        </BrowserRouter>
    );
  }

const node = document.getElementById('react-app');
if (node !== null) {
    const root = createRoot(node);
    root.render(<App/>);
}