import * as React from 'react';
import {Keyboard} from '../components/keyboard'
import {ankiPost} from '../utils/anki-client'

export const AddVocab = () => {
    ankiPost({action: "deckNames"})
        .then(result => console.log(result))
        .catch(failureCallback => console.log(failureCallback));
    const add = () => {
        console.log("My query");
    };
    return (
        <div className="container-fluid">
            <Keyboard/>
            <button type="button" className="btn btn-primary" onClick={add}>Add</button>
        </div>
    );
};