import * as React from 'react';
import { Keyboard } from '../components/keyboard.tsx';
import { Option, Select, SelectSize } from '../components/select.tsx';
import { sendQuery } from '../db/ipc.ts';
import { Consonant, CONSONANT_ATTRIBUTE_NAMES, ConsonantAttribute } from '../phonemes/spoken/consonant.ts';
import { SpokenDialect } from '../phonemes/spoken/spoken-dialect.ts';
import { Vowel, VowelAttribute } from '../phonemes/spoken/vowel.ts';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';
import { VowelDetails } from '../components/spoken/vowel-details.tsx';
import { Toolbar, ToolbarButton, ToolbarButtonGroup, ToolbarType } from '../components/toolbar.tsx';
import { ConsonantDetails } from '../components/spoken/consonant-details.tsx';

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

type ConsonantFilters = {
    // Place (X-Axis)
    [ConsonantAttribute.BILABIAL]: boolean,
    [ConsonantAttribute.LABIODENTAL]: boolean,
    [ConsonantAttribute.DENTAL]: boolean,
    [ConsonantAttribute.ALVEOLAR]: boolean,
    [ConsonantAttribute.POSTALVEOLAR]: boolean,
    [ConsonantAttribute.RETROFLEX]: boolean,
    [ConsonantAttribute.PALATAL]: boolean,
    [ConsonantAttribute.VELAR]: boolean,
    [ConsonantAttribute.UVULAR]: boolean,
    [ConsonantAttribute.PHARYNGEAL]: boolean,
    [ConsonantAttribute.EPIGLOTTAL]: boolean,
    [ConsonantAttribute.GLOTTAL]: boolean,
    // Manner (Y-Axis)
    [ConsonantAttribute.NASAL]: boolean,
    [ConsonantAttribute.AFFRICATE]: boolean,
    [ConsonantAttribute.FRICATIVE]: boolean,
    [ConsonantAttribute.APPROXIMANT]: boolean,
    [ConsonantAttribute.LATERAL_APPROXIMANT]: boolean,
    [ConsonantAttribute.FLAP]: boolean,
    [ConsonantAttribute.TRILL]: boolean,
    [ConsonantAttribute.IMPLOSIVE]: boolean,
    [ConsonantAttribute.STOP]: boolean,
    [ConsonantAttribute.LATERAL_STOP]: boolean,
    [ConsonantAttribute.CLICK]: boolean,
    // Movement
    [ConsonantAttribute.GLIDE]: boolean,
};

type State = {
    dialectOptions: Option[],
    vowels: Vowel[],
    vowelFilters: VowelFilters,
    consonants: Consonant[],
    consonantFilters: ConsonantFilters,
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

const DEFAULT_CONSONANT_FILTERS: ConsonantFilters = {
    // Place (X-Axis)
    bilabial: false,
    labiodental: false,
    dental: false,
    alveolar: false,
    postalveolar: false,
    retroflex: false,
    palatal: false,
    velar: false,
    uvular: false,
    pharyngeal: false,
    epiglottal: false,
    glottal: false,
    // Manner (Y-Axis)
    nasal: false,
    affricate: false,
    fricative: false,
    approximant: false,
    lateral_approximant: false,
    flap: false,
    trill: false,
    implosive: false,
    stop: false,
    lateral_stop: false,
    click: false,
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
            consonantFilters: DEFAULT_CONSONANT_FILTERS,
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
            consonantFilters: DEFAULT_CONSONANT_FILTERS,
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
                                body: (<VowelDetails vowel={vowel}/>),
                            };
                        })}
                    />
                );
            case KeyboardType.CONSONANTS:
                const consonants = this.filterPhonemes(
                    this.state.consonants,
                    this.state.consonantFilters,
                );
                return (
                    <Keyboard
                        phonemes={consonants.map(consonant => {
                            const {symbol} = consonant;
                            return {
                                symbol,
                                type: "Consonant",
                                body: (<ConsonantDetails consonant={consonant} />),
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

    filterConsonants(button) {
        const attribute = button.value;
        this.setState({consonantFilters: {
            ...this.state.consonantFilters,
            [attribute]: !this.state.consonantFilters[attribute],
        }});
    }

    getToolbarGroups(keyboardType: KeyboardType): ToolbarButtonGroup[] {
        const toolbarType = ToolbarType.MULTI_SELECT;
        switch (keyboardType) {
            case KeyboardType.VOWELS:
                const getVowelButton = (
                    text: string,
                    attribute: VowelAttribute
                ): ToolbarButton => {
                    return {
                        text,
                        handleClick: this.filterVowels.bind(this),
                        value: attribute,
                        isActive: this.state.vowelFilters[attribute],
                        isDisabled: this.state.vowels.every(vowel => !vowel[attribute]),
                    };
                };
                return [
                    {
                        type: toolbarType,
                        buttons: [
                            getVowelButton("Front", VowelAttribute.FRONT),
                            getVowelButton("Central", VowelAttribute.CENTRAL),
                            getVowelButton("Back", VowelAttribute.BACK),
                        ],
                    },
                    {
                        type: toolbarType,
                        buttons: [
                            getVowelButton("Close", VowelAttribute.CLOSE),
                            getVowelButton("Near-Close", VowelAttribute.NEAR_CLOSE),
                            getVowelButton("Close-Mid", VowelAttribute.CLOSE_MID),
                            getVowelButton("Mid", VowelAttribute.MID),
                            getVowelButton("Open-Mid", VowelAttribute.OPEN_MID),
                            getVowelButton("Near-Open", VowelAttribute.NEAR_OPEN),
                            getVowelButton("Open", VowelAttribute.OPEN),
                        ],
                    },
                    {
                        type: toolbarType,
                        buttons: [
                            getVowelButton("Glide", VowelAttribute.GLIDE),
                            getVowelButton("Rounded", VowelAttribute.ROUNDED),
                            getVowelButton("Palatal", VowelAttribute.PALATAL),
                            getVowelButton("Labiovelar", VowelAttribute.LABIOVELAR),
                        ],
                    },
                ];
            case KeyboardType.CONSONANTS:
                const getConsonantButton = (attribute: ConsonantAttribute): ToolbarButton => {
                    return {
                        text: CONSONANT_ATTRIBUTE_NAMES[attribute],
                        handleClick: this.filterConsonants.bind(this),
                        value: attribute,
                        isActive: this.state.consonantFilters[attribute],
                        isDisabled: this.state.consonants.every(consonant => !consonant[attribute]),
                    };
                };
                return [
                    {
                        type: toolbarType,
                        buttons: [
                            getConsonantButton(ConsonantAttribute.BILABIAL),
                            getConsonantButton(ConsonantAttribute.LABIODENTAL),
                            getConsonantButton(ConsonantAttribute.DENTAL),
                            getConsonantButton(ConsonantAttribute.ALVEOLAR),
                            getConsonantButton(ConsonantAttribute.POSTALVEOLAR),
                            getConsonantButton(ConsonantAttribute.RETROFLEX),
                            getConsonantButton(ConsonantAttribute.PALATAL),
                            getConsonantButton(ConsonantAttribute.VELAR),
                            getConsonantButton(ConsonantAttribute.UVULAR),
                            getConsonantButton(ConsonantAttribute.PHARYNGEAL),
                            getConsonantButton(ConsonantAttribute.EPIGLOTTAL),
                            getConsonantButton(ConsonantAttribute.GLOTTAL),
                        ],
                    },
                    {
                        type: toolbarType,
                        buttons: [
                            getConsonantButton(ConsonantAttribute.NASAL),
                            getConsonantButton(ConsonantAttribute.AFFRICATE),
                            getConsonantButton(ConsonantAttribute.FRICATIVE),
                            getConsonantButton(ConsonantAttribute.APPROXIMANT),
                            getConsonantButton(ConsonantAttribute.LATERAL_APPROXIMANT),
                            getConsonantButton(ConsonantAttribute.FLAP),
                            getConsonantButton(ConsonantAttribute.TRILL),
                            getConsonantButton(ConsonantAttribute.IMPLOSIVE),
                            getConsonantButton(ConsonantAttribute.STOP),
                            getConsonantButton(ConsonantAttribute.LATERAL_STOP),
                            getConsonantButton(ConsonantAttribute.CLICK),
                        ],
                    },
                    {
                        type: toolbarType,
                        buttons: [getConsonantButton(ConsonantAttribute.GLIDE)],
                    },
                ];
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