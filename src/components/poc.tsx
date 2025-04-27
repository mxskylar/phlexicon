import * as React from 'react';

export const Keyboard = () => {
    return (
        <div className="keyboard">
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">Consonants</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Vowels</a>
                </li>
            </ul>
            <div className="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
                <div className="btn-group me-2" role="group" aria-label="Hand">
                    <div className="input-group-text" id="btnGroupAddon">Hand</div>
                    <button type="button" className="btn btn-outline-info">Left</button>
                    <button type="button" className="btn btn-outline-info active">Right</button>
                </div>
                <div className="btn-group me-2" role="group" aria-label="Palm Facing">
                    <div className="input-group-text" id="btnGroupAddon">Palm Facing</div>
                    <button type="button" className="btn btn-outline-info active">↑</button>
                    <button type="button" className="btn btn-outline-info">↓</button>
                    <button type="button" className="btn btn-outline-info">←</button>
                    <button type="button" className="btn btn-outline-info">→</button>
                </div>
                <div className="btn-group me-2" role="group" aria-label="Hand">
                    <div className="input-group-text" id="btnGroupAddon">Rotate Palm</div>
                    <button type="button" className="btn btn-outline-info">↺</button>
                    <button type="button" className="btn btn-outline-info">↻</button>
                </div>
            </div>
            <div className="keys">
                <button type="button" className="btn btn-outline-secondary">b</button>
                <button type="button" className="btn btn-outline-secondary">d</button>
                <button type="button" className="btn btn-outline-secondary">ɡ</button>
                <button type="button" className="btn btn-outline-secondary">m</button>
                <button type="button" className="btn btn-outline-secondary">n</button>
                <button type="button" className="btn btn-outline-secondary">ŋ</button>
                <button type="button" className="btn btn-outline-secondary">f</button>
                <button type="button" className="btn btn-outline-secondary">v</button>
                <button type="button" className="btn btn-outline-secondary">θ</button>
                <button type="button" className="btn btn-outline-secondary">ð</button>
                <button type="button" className="btn btn-outline-secondary">s</button>
                <button type="button" className="btn btn-outline-secondary">z</button>
                <button type="button" className="btn btn-outline-secondary">ʃ</button>
                <button type="button" className="btn btn-outline-secondary">ʒ</button>
                <button type="button" className="btn btn-outline-secondary">h</button>
                <button type="button" className="btn btn-outline-secondary">ɹ</button>
                <button type="button" className="btn btn-outline-secondary">ɹ</button>
                <button type="button" className="btn btn-outline-secondary">l</button>
            </div>
        </div>
    )
};