import * as React from 'react';
import { Keyboard } from '../components/keyboard.tsx';
import { Option, Select, SelectSize } from '../components/select.tsx';
import { sendQuery } from '../db/ipc.ts';
import { Consonant } from '../phonemes/spoken/consonant.ts';
import { SpokenDialect } from '../phonemes/spoken/spoken-dialect.ts';
import { Vowel } from '../phonemes/spoken/vowel.ts';
import { KEYBOARD_CONTROL_CLASS } from './constants.ts';

enum PhonemeType {
    VOWELS = "Vowels",
    CONSONANTS = "Consonants",
}

type Props = {};

type State = {
    dialectOptions: Option[],
    vowels: Vowel[],
    consonants: Consonant[],
    tab: PhonemeType,
};

const ALL_LANGUAGES_VALUE = "ALL";

export class SpokenLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            dialectOptions: [],
            vowels: [],
            consonants: [],
            tab: PhonemeType.VOWELS,
        };
    }

    async getVowels(dialectId: string): Promise<Vowel[]> {
        const query = dialectId === ALL_LANGUAGES_VALUE
            ? "SELECT * FROM vowels ORDER BY symbol;"
            : "SELECT v.* FROM vowels v JOIN spoken_dialect_phonemes p " +
                `ON v.symbol = p.symbol WHERE dialect_id = "${dialectId}"` +
                "ORDER BY v.symbol;";
        return await sendQuery(query).then(rows => rows as Vowel[])
    }

    async getConsonants(dialectId: string): Promise<Consonant[]> {
        const query = dialectId === ALL_LANGUAGES_VALUE
            ? "SELECT * FROM consonants ORDER BY symbol;"
            : "SELECT c.* FROM consonants c JOIN spoken_dialect_phonemes p " +
                `ON c.symbol = p.symbol WHERE dialect_id = "${dialectId}"` +
                "ORDER BY c.symbol;";
        return await sendQuery(query).then(rows => rows as Consonant[])
    }

    async componentDidMount() {
        const dialects = await sendQuery("SELECT * FROM spoken_dialects ORDER BY name;")
            .then(rows => rows as SpokenDialect[]);
        this.setState({
            vowels: await this.getVowels(ALL_LANGUAGES_VALUE),
            consonants: await this.getConsonants(ALL_LANGUAGES_VALUE),
            dialectOptions: dialects.map(dialect => {
                return {
                    displayText: dialect.name,
                    value: dialect.id,
                }
            }),
        });
    }

    async switchDialect(e: React.BaseSyntheticEvent<HTMLSelectElement>) {
        const {selectedIndex, options} = e.target;
        const dialectId = options[selectedIndex].value;
        this.setState({
            vowels: await this.getVowels(dialectId),
            consonants: await this.getConsonants(dialectId),
        });
    }

    switchTab(e: React.BaseSyntheticEvent<HTMLLinkElement>) {
        const {selectedIndex, options} = e.target;
        this.setState({tab: options[selectedIndex].value as PhonemeType});
    }

    getKeyboard(tab: PhonemeType): React.ReactElement {
        switch(tab) {
            case PhonemeType.VOWELS:
                return (
                    <Keyboard
                        keys={this.state.vowels.map(vowel => vowel.symbol)}
                    />
                );
            case PhonemeType.CONSONANTS:
                return (
                    <Keyboard
                        keys={this.state.consonants.map(consonant => consonant.symbol)}
                    />
                );
        }
    }

    render() {
        return (
            <div className="container-fluid" id="spoken-languages">
                <Select
                    id="dialect-select"
                    classes={[KEYBOARD_CONTROL_CLASS]}
                    options={[
                        {
                            displayText: "Pick a spoken language...",
                            value: ALL_LANGUAGES_VALUE,
                        },
                        ...this.state.dialectOptions,
                    ]}
                    handleChange={this.switchDialect.bind(this)}
                />
                <Select
                    id="keyboard-tabs"
                    classes={[KEYBOARD_CONTROL_CLASS]}
                    size={SelectSize.SMALL}
                    options={Object.values(PhonemeType).map(tab => {
                        return {
                            displayText: tab,
                            value: tab,
                        };
                    })}
                    handleChange={this.switchTab.bind(this)}
                />
                {this.getKeyboard(this.state.tab)}
            </div>
        );
    }
}