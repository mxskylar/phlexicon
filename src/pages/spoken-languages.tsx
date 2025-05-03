import * as React from 'react';
import { CheckboxProps } from '../components/checkbox.tsx';
import { Keyboard } from '../components/keyboard.tsx';
import { MultiSelect, MultiSelectGroup } from '../components/multi-select.tsx';
import { Option, Select, SelectSize } from '../components/select.tsx';
import { ConsonantDetails } from '../components/spoken/consonant-details.tsx';
import { VowelDetails } from '../components/spoken/vowel-details.tsx';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';
import { sendQuery } from '../db/ipc.ts';
import { Consonant, CONSONANT_ATTRIBUTE_NAMES, ConsonantAttribute } from '../phonemes/spoken/consonant.ts';
import { SpokenDialect } from '../phonemes/spoken/spoken-dialect.ts';
import { Vowel, VowelAttribute } from '../phonemes/spoken/vowel.ts';

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
    dialectId: string,
    dialectOptions: Option[],
    allVowels: Vowel[],
    vowelFilters: VowelFilters,
    filteredVowels: Vowel[],
    allConsonants: Consonant[],
    consonantFilters: ConsonantFilters,
    filteredConsonants: Consonant[],
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
            dialectId: ALL_LANGUAGES_VALUE,
            dialectOptions: [],
            allVowels: [],
            vowelFilters: DEFAULT_VOWEL_FILTERS,
            filteredVowels: [],
            allConsonants: [],
            consonantFilters: DEFAULT_CONSONANT_FILTERS,
            filteredConsonants: [],
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
        const vowels = await this.getVowels(this.state.dialectId);
        const consonants = await this.getConsonants(this.state.dialectId);
        this.setState({
            allVowels: vowels,
            filteredVowels: vowels,
            allConsonants: consonants,
            filteredConsonants: consonants,
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
        const vowels = await this.getVowels(dialectId);
        const consonants = await this.getConsonants(dialectId);
        if (this.state.dialectId !== dialectId) {
            this.setState({
                dialectId,
                allVowels: vowels,
                filteredVowels: vowels,
                vowelFilters: DEFAULT_VOWEL_FILTERS,
                allConsonants: consonants,
                filteredConsonants: consonants,
                consonantFilters: DEFAULT_CONSONANT_FILTERS,
            });
        }
    }

    switchKeyboard(e: React.BaseSyntheticEvent<HTMLLinkElement>) {
        const {selectedIndex, options} = e.target;
        this.setState({
            keyboardType: options[selectedIndex].value as KeyboardType
        });
    }

    getFilteredPhonemes<Type>(
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
                return (
                    <Keyboard
                        phonemes={this.state.filteredVowels.map(vowel => {
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
                return (
                    <Keyboard
                        phonemes={this.state.filteredConsonants.map(consonant => {
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

    filterVowels(e: React.BaseSyntheticEvent<HTMLInputElement>) {
        const attribute = e.target.value;
        const vowelFilters = {
            ...this.state.vowelFilters,
            [attribute]: !this.state.vowelFilters[attribute],
        };
        const filteredVowels = this.getFilteredPhonemes(
            this.state.allVowels,
            vowelFilters,
        );
        this.setState({vowelFilters, filteredVowels});
    }

    filterConsonants(e: React.BaseSyntheticEvent<HTMLInputElement>) {
        const attribute = e.target.value;
        const consonantFilters = {
            ...this.state.consonantFilters,
            [attribute]: !this.state.consonantFilters[attribute],
        };
        const filteredConsonants = this.getFilteredPhonemes(
            this.state.allConsonants,
            consonantFilters,
        );
        this.setState({consonantFilters, filteredConsonants});
    }

    isAttributeDisabled<Type>(phonemes: Type[], attribute: string): boolean {
        return phonemes.length > 0 && phonemes.every(phoneme => !phoneme[attribute]);
    }

    getVowelCheckboxGroups(): MultiSelectGroup[] {
        const getCheckbox = (
            text: string,
            attribute: VowelAttribute
        ): CheckboxProps => {
            return {
                text: text,
                handleChange: this.filterVowels.bind(this),
                value: attribute,
                isChecked: this.state.vowelFilters[attribute],
                isDisabled: this.isAttributeDisabled(
                    this.state.filteredVowels,
                    attribute,
                ),
            };
        };
        return [
            {
                name: "Horizontal Position",
                checkboxes: [
                    getCheckbox("Front", VowelAttribute.FRONT),
                    getCheckbox("Central", VowelAttribute.CENTRAL),
                    getCheckbox("Back", VowelAttribute.BACK),
                ],
            },
            {
                name: "Vertical Position",
                checkboxes: [
                    getCheckbox("Close", VowelAttribute.CLOSE),
                    getCheckbox("Near-Close", VowelAttribute.NEAR_CLOSE),
                    getCheckbox("Close-Mid", VowelAttribute.CLOSE_MID),
                    getCheckbox("Mid", VowelAttribute.MID),
                    getCheckbox("Open-Mid", VowelAttribute.OPEN_MID),
                    getCheckbox("Near-Open", VowelAttribute.NEAR_OPEN),
                    getCheckbox("Open", VowelAttribute.OPEN),
                ],
            },
            {
                name: "Other",
                checkboxes: [
                    getCheckbox("Glide", VowelAttribute.GLIDE),
                    getCheckbox("Rounded", VowelAttribute.ROUNDED),
                    getCheckbox("Palatal", VowelAttribute.PALATAL),
                    getCheckbox("Labiovelar", VowelAttribute.LABIOVELAR),
                ],
            },
        ];
    }

    getConsonantCheckboxGroups(): MultiSelectGroup[] {
        const getCheckbox = (attribute: ConsonantAttribute): CheckboxProps => {
            return {
                text: CONSONANT_ATTRIBUTE_NAMES[attribute],
                handleChange: this.filterConsonants.bind(this),
                value: attribute,
                isChecked: this.state.consonantFilters[attribute],
                isDisabled: this.isAttributeDisabled(
                    this.state.filteredConsonants,
                    attribute,
                ),
            };
        };
        return [
            {
                name: "Place",
                checkboxes: [
                    getCheckbox(ConsonantAttribute.BILABIAL),
                    getCheckbox(ConsonantAttribute.LABIODENTAL),
                    getCheckbox(ConsonantAttribute.DENTAL),
                    getCheckbox(ConsonantAttribute.ALVEOLAR),
                    getCheckbox(ConsonantAttribute.POSTALVEOLAR),
                    getCheckbox(ConsonantAttribute.RETROFLEX),
                    getCheckbox(ConsonantAttribute.PALATAL),
                    getCheckbox(ConsonantAttribute.VELAR),
                    getCheckbox(ConsonantAttribute.UVULAR),
                    getCheckbox(ConsonantAttribute.PHARYNGEAL),
                    getCheckbox(ConsonantAttribute.EPIGLOTTAL),
                    getCheckbox(ConsonantAttribute.GLOTTAL),
                ],
            },
            {
                name: "Manner",
                checkboxes: [
                    getCheckbox(ConsonantAttribute.NASAL),
                    getCheckbox(ConsonantAttribute.AFFRICATE),
                    getCheckbox(ConsonantAttribute.FRICATIVE),
                    getCheckbox(ConsonantAttribute.APPROXIMANT),
                    getCheckbox(ConsonantAttribute.LATERAL_APPROXIMANT),
                    getCheckbox(ConsonantAttribute.FLAP),
                    getCheckbox(ConsonantAttribute.TRILL),
                    getCheckbox(ConsonantAttribute.IMPLOSIVE),
                    getCheckbox(ConsonantAttribute.STOP),
                    getCheckbox(ConsonantAttribute.LATERAL_STOP),
                    getCheckbox(ConsonantAttribute.CLICK),
                ],
            },
            {
                name: "Other",
                checkboxes: [getCheckbox(ConsonantAttribute.GLIDE)],
            },
        ];
    }

    resetVowelFilters() {
        this.setState({
            filteredVowels: this.state.allVowels,
            vowelFilters: DEFAULT_VOWEL_FILTERS,
        });
    }

    resetConsonantFilters() {
        this.setState({
            filteredConsonants: this.state.allConsonants,
            consonantFilters: DEFAULT_CONSONANT_FILTERS,
        });
    }

    getAttributeFilters(keyboardType: KeyboardType): React.ReactElement {
        const props = {
            id: "spoken-phoneme-filters-multiselect",
            prompt: "Filter by attribute...",
            scrollTop: true,
        };
        switch (keyboardType) {
            case KeyboardType.VOWELS:
                return (
                    <MultiSelect
                        {...props}
                        groups={this.getVowelCheckboxGroups()}
                        handleReset={this.resetVowelFilters.bind(this)}
                    />
                );
            case KeyboardType.CONSONANTS:
                return (
                    <MultiSelect
                        {...props}
                        groups={this.getConsonantCheckboxGroups()}
                        handleReset={this.resetConsonantFilters.bind(this)}
                    />
                );
        }
    }

    render() {
        const {keyboardType} = this.state;
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
                {this.getAttributeFilters(keyboardType)}
                {this.getKeyboard(keyboardType)}
            </div>
        );
    }
}