import * as React from 'react';
import {query} from '../utils/sqlite-dao';
import {Keyboard} from '../components/keyboard'

export const AddVocab = () => {
    const add = () => {
        query("My query");
    };
    return (
        <div className="container-fluid">
            <Keyboard/>
            <button type="button" className="btn btn-primary" onClick={add}>Add</button>
        </div>
    );
};