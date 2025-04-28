import * as React from 'react';
import { Keyboard } from '../components/keyboard.tsx';
import { Option, Select, SelectSize } from '../components/select.tsx';
import { sendQuery } from '../db/ipc.ts';
import { Consonant } from '../phonemes/spoken/consonant.ts';
import { SpokenDialect } from '../phonemes/spoken/spoken-dialect.ts';
import { Vowel } from '../phonemes/spoken/vowel.ts';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';
import { VowelDetails } from '../components/spoken/vowel-details.tsx';

enum KeyboardType {
    VOWELS = "Vowels",
    CONSONANTS = "Consonants",
}

type Props = {};

type State = {
    dialectOptions: Option[],
    vowels: Vowel[],
    consonants: Consonant[],
    keyboardType: KeyboardType,
};

const ALL_LANGUAGES_VALUE = "ALL";

export class SpokenLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            dialectOptions: [],
            vowels: [],
            consonants: [],
            keyboardType: KeyboardType.VOWELS,
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

    switchKeyboard(e: React.BaseSyntheticEvent<HTMLLinkElement>) {
        const {selectedIndex, options} = e.target;
        this.setState({keyboardType: options[selectedIndex].value as KeyboardType});
    }

    getKeyboard(keyboardType: KeyboardType): React.ReactElement {
        switch(keyboardType) {
            case KeyboardType.VOWELS:
                return (
                    <Keyboard
                        phonemes={this.state.vowels.map(vowel => {
                            const {symbol} = vowel;
                            return {
                                symbol,
                                type: "Vowel",
                                body: (
                                    <VowelDetails />
                                ),
                            };
                        })}
                    />
                );
            case KeyboardType.CONSONANTS:
                return (
                    <Keyboard
                        phonemes={this.state.consonants.map(consonant => {
                            const {symbol} = consonant;
                            return {
                                symbol,
                                type: "Consonant",
                                body: (
                                    <p>Consonant body</p>
                                ),
                            };

                        })}
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
                    options={Object.values(KeyboardType).map(type => {
                        return {
                            displayText: type,
                            value: type,
                        };
                    })}
                    handleChange={this.switchKeyboard.bind(this)}
                />
                {this.getKeyboard(this.state.keyboardType)}
            </div>
        );
    }
}