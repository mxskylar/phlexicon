import * as React from 'react';
import { Option, Select } from './select.tsx';
import { sendQuery } from '../db/ipc.ts';
import { SpokenDialect } from '../phonemes/spoken/spoken-dialect.ts';
import { Vowel } from '../phonemes/spoken/vowel.ts';
import { Consonant } from '../phonemes/spoken/consonant.ts';

type Props = {};

type State = {
    dialectOptions: Option[],
    vowels: Vowel[],
    consonants: Consonant[]
};

const ALL_LANGUAGES_VALUE = "ALL";

export class SpokenLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            dialectOptions: [],
            vowels: [],
            consonants: [],
        };
    }

    async getVowels(dialectId: string): Promise<Vowel[]> {
        const query = dialectId === ALL_LANGUAGES_VALUE
            ? "SELECT * FROM vowels;"
            : "SELECT v.* FROM vowels v JOIN spoken_dialect_phonemes p " +
                `ON v.symbol = p.symbol WHERE dialect_id = "${dialectId}";`;
        return await sendQuery(query).then(rows => rows as Vowel[])
    }

    async componentDidMount() {
        const dialects = await sendQuery("SELECT * FROM spoken_dialects;")
            .then(rows => rows as SpokenDialect[]);
        const vowels = await this.getVowels(ALL_LANGUAGES_VALUE);
        this.setState({
            vowels,
            dialectOptions: dialects.map(dialect => {
                return {
                    displayText: dialect.name,
                    value: dialect.id,
                }
            }),
        });
    }

    async switchDialect(e) {
        const {selectedIndex, options} = e.target;
        const dialectId = options[selectedIndex].value;
        const vowels = await this.getVowels(dialectId);
        this.setState({vowels});
    }

    render() {
        return (
            <div className="container-fluid">
                <Select
                    defaultOption={{
                        displayText: "Pick a spoken language...",
                        value: ALL_LANGUAGES_VALUE,
                    }}
                    options={this.state.dialectOptions}
                    handleChange={this.switchDialect.bind(this)}
                />
                <div className="keyboard">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="#">Vowels</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Consonants</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Breakdown</a>
                        </li>
                    </ul>
                    <div className="keys">
                        {
                            this.state.vowels.map((vowel, i) =>
                                <button
                                    key={`symbol-${i}`}
                                    type="button"
                                    className="btn btn-outline-secondary"
                                >
                                    {vowel.symbol}
                                </button>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}