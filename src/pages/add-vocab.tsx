import * as React from 'react';
//import {query} from '../utils/sqlite-dao'

export const AddVocab = () => {
    const add = () => {
        //query("CREATE DATABASE asl;");
        console.log("hi")
    }
    return (
        <div className="container-fluid">
           <button type="button" className="btn btn-primary" onClick={add}>Add</button>
        </div>
    );
};