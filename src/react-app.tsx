
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AddVocab } from './pages/add-vocab.tsx';
import { SearchCustomizeVocab } from './pages/search-customize-vocab.tsx';
import { BackupExportData } from './pages/backup-export-data.tsx';
import { query } from './db/ipc.ts';

const Navbar = () => {
    query("SELECT * FROM spoken_dialects LIMIT 10;")
        .then(rows => console.log(rows));
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-2">
            <div className="container-fluid">
                <div className="navbar-brand">Phlexicon</div>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="/add-vocab">➕&nbsp;&nbsp;Add Vocab</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/search-customize-vocab">🔍&nbsp;&nbsp;Search & Customize Vocab</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/backup-export-data">💾&nbsp;&nbsp;Backup & Export Data</Link>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="https://mxskylar.github.io/phlexicon" target="_blank">📖&nbsp;&nbsp;User Guide</a>
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
                <Route path="/add-vocab" element={<AddVocab/>}/>
                <Route path="/search-customize-vocab"  element={<SearchCustomizeVocab/>}/>
                <Route path="/backup-export-data"  element={<BackupExportData/>}/>
                <Route path="*" element={<Navigate to="/add-vocab" replace />}/>
            </Routes>
        </BrowserRouter>
    );
  }

const node = document.getElementById('react-app');
if (node !== null) {
    const root = createRoot(node);
    root.render(<App/>);
}