import * as React from 'react';
import {Keyboard} from '../components/keyboard'

export const AddVocab = () => {
    return (
        <div className="container-fluid">
            <Keyboard/>
            <button type="button" className="btn btn-primary">Add</button>
        </div>
    );
};