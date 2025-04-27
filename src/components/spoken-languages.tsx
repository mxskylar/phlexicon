import * as React from 'react';
import { Option, Select } from './select.tsx';
import { query } from '../db/ipc.ts';
import { SpokenDialect } from '../phonemes/spoken/spoken-dialect.ts';

type Props = {};

type State = {
    currentDialectId: string,
    options: Option[]
};

const ALL_LANGUAGES_VALUE = "ALL";

export class SpokenLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            currentDialectId: ALL_LANGUAGES_VALUE,
            options: []
        };
    }

    componentDidMount () {
        query("SELECT * FROM spoken_dialects")
            .then(rows => {
                const dialects = rows as SpokenDialect[];
                this.setState({options: dialects.map(dialect => {
                    return {
                        displayText: dialect.name,
                        value: dialect.id,
                    }
                })});
            });
    }

    render() {
        return (
            <div className="container-fluid">
                <Select
                    defaultOption={{
                        displayText: "Pick a spoken language...",
                        value: ALL_LANGUAGES_VALUE,
                    }}
                    options={this.state.options}
                />
            </div>
        );
    }
}