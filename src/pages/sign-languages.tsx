import * as React from 'react';
import { Option, Select } from '../components/select.tsx';
import { KEYBOARD_CONTROL_CLASS, PHONEME_SYMOL_CLASS } from '../constants.ts';
import { sendQuery } from '../db/ipc.ts';
import { SignDialect } from '../phonemes/sign/sign-dialect.ts';
import { Hand } from '../phonemes/sign/hand.ts';
import { Toolbar, ToolbarType } from '../components/toolbar.tsx';

type Props = {};

type State = {
    dialectOptions: Option[],
    hands: Hand[],
};

const ALL_LANGUAGES_VALUE = "ALL";

export class SignLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            dialectOptions: [],
            hands: [],
        };
    }

    async getHands(dialectId: string): Promise<Hand[]> {
        const getDialectFilterQuery = (dialectId: string): string => {
            const primaryKeys = dialectId.split("-");
            const isoCode = primaryKeys[0];
            const region = primaryKeys[1];
            return "SELECT h.* FROM hands h JOIN sign_dialect_phonemes p " +
                "ON h.base_symbol = p.base_symbol " +
                `WHERE iso_code = "${isoCode}" AND region = "${region}" ` +
                "ORDER BY h.symbol;";
        };
        const query = dialectId === ALL_LANGUAGES_VALUE
            ? "SELECT * FROM hands ORDER BY symbol;"
            : getDialectFilterQuery(dialectId);
        return await sendQuery(query).then(rows => rows as Hand[]);
    }

    async componentDidMount() {
        const dialects = await sendQuery("SELECT * FROM sign_dialects ORDER BY name;")
            .then(rows => rows as SignDialect[]);
        this.setState({
            hands: await this.getHands(ALL_LANGUAGES_VALUE),
            dialectOptions: dialects.map(dialect => {
                return {
                    displayText: dialect.name,
                    value: `${dialect.iso_code}-${dialect.region}`,
                }
            }),
        });
        console.log(this.state.hands);
    }

    async switchDialect(e: React.BaseSyntheticEvent<HTMLSelectElement>) {
        const {selectedIndex, options} = e.target;
        const dialectId = options[selectedIndex].value;
        this.setState({
            hands: await this.getHands(dialectId),
        });
        console.log(this.state.hands);
    }

    render() {
        return (
            <div className="container-fluid" id="sign-languages">
                <Select
                    id="dialect-select"
                    classes={[KEYBOARD_CONTROL_CLASS]}
                    options={[
                        {
                            displayText: "Pick a sign language...",
                            value: ALL_LANGUAGES_VALUE  ,
                        },
                        ...this.state.dialectOptions,
                    ]}
                    handleChange={this.switchDialect.bind(this)}
                />
                <Toolbar
                    id="sign-languages-keyboard-controls"
                    groups={[
                        {
                            name: "Hand",
                            type: ToolbarType.TOGGLE,
                            buttons: [
                                {text: "Left"},
                                {text: "Right", isActive: true},
                            ],
                        },
                        {
                            name: "Palm",
                            type: ToolbarType.TOGGLE,
                            buttons: [
                                {
                                    text: "񆄡",
                                    isActive: true,
                                    classes: [PHONEME_SYMOL_CLASS],
                                },
                                {
                                    text: "񆄱",
                                    classes: [PHONEME_SYMOL_CLASS],
                                },
                                {
                                    text: "񆅁",
                                    classes: [PHONEME_SYMOL_CLASS],
                                },
                            ],
                        },
                        {
                            type: ToolbarType.CLICKABLE_BUTTON,
                            buttons: [
                                {text: "↺"},
                                {text: "↻"}
                            ],
                        },
                    ]}
                />
            </div>
        );
    }
};