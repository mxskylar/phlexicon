import * as React from 'react';
import { Option, Select } from '../components/select.tsx';
import { sendQuery } from '../db/ipc.ts';
import { SpokenDialect } from '../phonemes/spoken/spoken-dialect.ts';
import { Vowel } from '../phonemes/spoken/vowel.ts';
import { Consonant } from '../phonemes/spoken/consonant.ts';
import { NavTabs } from '../components/nav-tabs.tsx';
import { Keyboard } from '../components/keyboard.tsx';

enum NavTabHref {
    VOWELS = "#Vowels",
    CONSONANTS = "#Consonants",
    BREAKDOWN = "#Breakdown",
}

type Props = {};

type State = {
    dialectOptions: Option[],
    vowels: Vowel[],
    consonants: Consonant[],
    href: NavTabHref,
};

const ALL_LANGUAGES_VALUE = "ALL";

export class SpokenLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            dialectOptions: [],
            vowels: [],
            consonants: [],
            href: NavTabHref.VOWELS,
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
        const href = new URL(e.target.href).hash as NavTabHref;
        this.setState({href});
    }

    handleKeyClick(e: React.BaseSyntheticEvent<HTMLButtonElement>) {
        console.log(e);
    }

    getTabContent(href: NavTabHref): React.ReactElement {
        switch(href) {
            case NavTabHref.VOWELS:
                return (
                    <Keyboard
                        keys={this.state.vowels.map(vowel => vowel.symbol)}
                        handleClick={this.handleKeyClick.bind(this)}
                    />
                );
            case NavTabHref.CONSONANTS:
                return (
                    <Keyboard
                        keys={this.state.consonants.map(consonant => consonant.symbol)}
                        handleClick={this.handleKeyClick.bind(this)}
                    />
                );
            case NavTabHref.BREAKDOWN:
                return (
                    <p>Breakdown!</p>
                );
        }
    }

    render() {
        return (
            <div className="container-fluid">
                <Select
                    id="dialect-select"
                    options={[
                        {
                            displayText: "Pick a spoken language...",
                            value: ALL_LANGUAGES_VALUE,
                        },
                        ...this.state.dialectOptions,
                    ]}
                    handleChange={this.switchDialect.bind(this)}
                />
                <NavTabs
                    id="keyboard-tabs"
                    navItems={[
                        {
                            displayText: "Vowels",
                            href: NavTabHref.VOWELS,
                        },
                        {
                            displayText: "Consonants",
                            href: NavTabHref.CONSONANTS,
                        },
                        {
                            displayText: "Breakdown",
                            href: NavTabHref.BREAKDOWN,
                        },
                    ]}
                    handleChange={this.switchTab.bind(this)}
                >
                    {this.getTabContent(this.state.href)}
                </NavTabs>
            </div>
        );
    }
}