
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { SignLanguages } from './pages/sign-languages.tsx';
import { SpokenLanguages } from './pages/spoken-languages.tsx';

const NAV_BAR_ID = "navigation-bar";
const NAV_BAR_TOGGLE_BUTTON_ID = "navigation-bar-toggle-button";

const hideNavMenuIfShown = () => {
    const navBarToggleButton = document.getElementById(NAV_BAR_TOGGLE_BUTTON_ID);
    if (navBarToggleButton.getAttribute("aria-expanded") === "true") {
        navBarToggleButton.click();
    }
}

const Navbar = () => {
    return (
        <nav
            className="navbar navbar-expand-lg navbar-dark bg-primary mb-2"
            id={NAV_BAR_ID}
        >
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
                                onClick={e => hideNavMenuIfShown()}
                            >
                                🗣️&nbsp;&nbsp;Spoken Languages
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to="/sign-languages"
                                onClick={e => hideNavMenuIfShown()}
                            >
                                🤟&nbsp;&nbsp;Sign Languages
                            </Link>
                        </li>
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="https://mxskylar.github.io/phlexicon"
                                target="_blank"
                                onClick={e => hideNavMenuIfShown()}
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

class App extends React.Component {
    componentDidMount() {
        document.body.addEventListener("click", e => {
            const element = e.target as Node;
            const navBar = document.getElementById(NAV_BAR_ID);
            // If element is not a child of the nav bar
            // and is not the nav bar itself
            if (element !== navBar && !navBar.contains(element)) {
                hideNavMenuIfShown();
            }
        });
        document.body.addEventListener("keydown", e => {
            if (e.key == "Escape") {
                hideNavMenuIfShown();
            }
        });
    }

    render() {
        return (
            <HashRouter>
                <Navbar/>
                <Routes>
                    <Route path="/spoken-languages" element={<SpokenLanguages/>}/>
                    <Route path="/sign-languages"  element={<SignLanguages/>}/>
                    <Route path="*" element={<Navigate to="/spoken-languages" replace />}/>
                </Routes>
            </HashRouter>
        );
    }
}

const node = document.getElementById('react-app');
if (node !== null) {
    const root = createRoot(node);
    root.render(<App/>);
}