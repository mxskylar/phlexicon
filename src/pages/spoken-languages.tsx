import * as React from 'react';
import { Keyboard } from '../components/keyboard.tsx';
import { Option, Select, SelectSize } from '../components/select.tsx';
import { sendQuery } from '../db/ipc.ts';
import { Consonant } from '../phonemes/spoken/consonant.ts';
import { SpokenDialect } from '../phonemes/spoken/spoken-dialect.ts';
import { Vowel, VowelAttribute } from '../phonemes/spoken/vowel.ts';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';
import { VowelDetails } from '../components/spoken/vowel-details.tsx';
import { Toolbar, ToolbarButton, ToolbarButtonGroup } from '../components/toolbar.tsx';

enum KeyboardType {
    VOWELS = "Vowels",
    CONSONANTS = "Consonants",
}

type Props = {};

type VowelFilters = {
    // X-Axis
    [VowelAttribute.FRONT]: boolean,
    [VowelAttribute.CENTRAL]: boolean,
    [VowelAttribute.BACK]: boolean,
    // Color
    [VowelAttribute.ROUNDED]: boolean,
    [VowelAttribute.PALATAL]: boolean,
    [VowelAttribute.LABIOVELAR]: boolean,
    // Y-AXIS
    [VowelAttribute.CLOSE]: boolean,
    [VowelAttribute.NEAR_CLOSE]: boolean,
    [VowelAttribute.CLOSE_MID]: boolean,
    [VowelAttribute.MID]: boolean,
    [VowelAttribute.OPEN_MID]: boolean,
    [VowelAttribute.NEAR_OPEN]: boolean,
    [VowelAttribute.OPEN]: boolean,
    // Movement
    [VowelAttribute.GLIDE]: boolean
};

type State = {
    dialectOptions: Option[],
    vowels: Vowel[],
    vowelFilters: VowelFilters,
    consonants: Consonant[],
    keyboardType: KeyboardType,
};

const ALL_LANGUAGES_VALUE = "ALL";

const DEFAULT_VOWEL_FILTERS: VowelFilters = {
    // X-AXIS
    front: false,
    central: false,
    back: false,
    // Color
    rounded: false,
    palatal: false,
    labiovelar: false,
    // Y-AXIS
    close: false,
    near_close: false,
    close_mid: false,
    mid: false,
    open_mid: false,
    near_open: false,
    open: false,
    // Movement
    glide: false,
};

export class SpokenLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            dialectOptions: [],
            vowels: [],
            vowelFilters: DEFAULT_VOWEL_FILTERS,
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
        return await sendQuery(query).then(rows => rows as Vowel[]);
    }

    async getConsonants(dialectId: string): Promise<Consonant[]> {
        const query = dialectId === ALL_LANGUAGES_VALUE
            ? "SELECT * FROM consonants ORDER BY symbol;"
            : "SELECT c.* FROM consonants c JOIN spoken_dialect_phonemes p " +
                `ON c.symbol = p.symbol WHERE dialect_id = "${dialectId}"` +
                "ORDER BY c.symbol;";
        return await sendQuery(query).then(rows => rows as Consonant[]);
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
            vowelFilters: DEFAULT_VOWEL_FILTERS,
            consonants: await this.getConsonants(dialectId),
        });
    }

    switchKeyboard(e: React.BaseSyntheticEvent<HTMLLinkElement>) {
        const {selectedIndex, options} = e.target;
        this.setState({keyboardType: options[selectedIndex].value as KeyboardType});
    }

    filterPhonemes<Type>(
        phonemes: Type[],
        filters: {[index: string]: boolean}
    ): Type[] {
        const flags = Object.keys(filters)
            .filter(attribute => filters[attribute]);
        return phonemes.filter(phoneme => flags.every(attribute => phoneme[attribute]));
    }

    getKeyboard(keyboardType: KeyboardType): React.ReactElement {
        switch(keyboardType) {
            case KeyboardType.VOWELS:
                const vowels = this.filterPhonemes(
                    this.state.vowels,
                    this.state.vowelFilters,
                );
                return (
                    <Keyboard
                        phonemes={vowels.map(vowel => {
                            const {symbol} = vowel;
                            return {
                                symbol,
                                type: "Vowel",
                                body: (
                                    <VowelDetails
                                        vowel={vowel}
                                    />
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

    filterVowels(button) {
        const attribute = button.value;
        this.setState({vowelFilters: {
            ...this.state.vowelFilters,
            [attribute]: !this.state.vowelFilters[attribute],
        }});
    }

    getToolbarGroups(keyboardType: KeyboardType): ToolbarButtonGroup[] {
        const handleClick = this.filterVowels.bind(this);
        const getButton = (text: string, attribute: VowelAttribute): ToolbarButton => {
            return {
                text,
                handleClick,
                value: attribute,
                isActive: this.state.vowelFilters[attribute],
            };
        };
        switch (keyboardType) {
            case KeyboardType.VOWELS:
                return [
                    {
                        buttons: [
                            getButton("Front", VowelAttribute.FRONT),
                            getButton("Central", VowelAttribute.CENTRAL),
                            getButton("Back", VowelAttribute.BACK),
                        ],
                    },
                    {
                        buttons: [
                            getButton("Close", VowelAttribute.CLOSE),
                            getButton("Near-Close", VowelAttribute.NEAR_CLOSE),
                            getButton("Close-Mid", VowelAttribute.CLOSE_MID),
                            getButton("Mid", VowelAttribute.MID),
                            getButton("Open-Mid", VowelAttribute.OPEN_MID),
                            getButton("Near-Open", VowelAttribute.NEAR_OPEN),
                            getButton("Open", VowelAttribute.OPEN),
                        ],
                    },
                    {
                        buttons: [
                            getButton("Glide", VowelAttribute.GLIDE),
                            getButton("Rounded", VowelAttribute.ROUNDED),
                            getButton("Palatal", VowelAttribute.PALATAL),
                            getButton("Labiovelar", VowelAttribute.LABIOVELAR),
                        ],
                    },
                ];
            case KeyboardType.CONSONANTS:
                return [];
        }
    }

    render() {
        return (
            <div className="container-fluid phoneme-picker" id="spoken-languages">
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
                <Toolbar
                    id="spoken-languages-keyboard-filters"
                    groups={this.getToolbarGroups(this.state.keyboardType)}
                />
                {this.getKeyboard(this.state.keyboardType)}
            </div>
        );
    }
}