import * as React from 'react';
import { Option, Select } from '../components/select.tsx';
import { KEYBOARD_CONTROL_CLASS, PHONEME_SYMOL_CLASS } from '../constants.ts';
import { sendQuery } from '../db/ipc.ts';
import { SignDialect } from '../phonemes/sign/sign-dialect.ts';
import { Hand } from '../phonemes/sign/hand.ts';
import { Toolbar, ToolbarButton, ToolbarType } from '../components/toolbar.tsx';
import { CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS, SignWritingSymbolRotation } from '../phonemes/sign/sign-writing.ts';

type Props = {};

type State = {
    dialectOptions: Option[],
    hands: Hand[],
    palmFilterHands: Hand[],
    symbolRotationIndex: number,
    symbolRotation: SignWritingSymbolRotation,
    isRightHanded: boolean,
};

const ALL_LANGUAGES_VALUE = "ALL";

export class SignLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            dialectOptions: [],
            hands: [],
            palmFilterHands: [],
            symbolRotationIndex: 0,
            symbolRotation: SignWritingSymbolRotation.DEGREES_0_or_360,
            isRightHanded: true,
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
            dialectOptions: dialects.map(dialect => {
                return {
                    displayText: dialect.name,
                    value: `${dialect.iso_code}-${dialect.region}`,
                }
            }),
            hands: await this.getHands(ALL_LANGUAGES_VALUE),
            palmFilterHands: await sendQuery(
                'SELECT * FROM hands WHERE base_symbol = "񆄱"'
            ) as Hand[],
        });
    }

    async switchDialect(e: React.BaseSyntheticEvent<HTMLSelectElement>) {
        const {selectedIndex, options} = e.target;
        const dialectId = options[selectedIndex].value;
        this.setState({
            hands: await this.getHands(dialectId),
        });
    }

    rotateClockwise() {
        const incrementedIndex = this.state.symbolRotationIndex + 1;
        const symbolRotationIndex = incrementedIndex > CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS.length - 1
            ? 0
            : incrementedIndex;
        this.setState({
            symbolRotationIndex,
            symbolRotation: CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS[symbolRotationIndex],
        });
    }

    rotateCounterClockwise() {
        const decrementedIndex = this.state.symbolRotationIndex - 1;
        const symbolRotationIndex = decrementedIndex < 0
            ? CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS.length - 1
            : decrementedIndex;
        this.setState({
            symbolRotationIndex,
            symbolRotation: CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS[symbolRotationIndex],
        });
    }

    setRightHand() {
        this.setState({isRightHanded: true});
    }

    setLefttHand() {
        this.setState({isRightHanded: false});
    }

    getPalmTowardsSymbol(hands: Hand[]): string {
        for(const i in hands) {
            const hand = hands[i];
            if (hand.palm_towards) {
                return hand.symbol;
            }
        }
        return "񆄡";
    }

    getPalmSidewaysSymbol(hands: Hand[]): string {
        for(const i in hands) {
            const hand = hands[i];
            if (hand.palm_sideways) {
                return hand.symbol;
            }
        }
        return "񆄱";
    }

    getPalmAwaySymbol(hands: Hand[]): string {
        for(const i in hands) {
            const hand = hands[i];
            if (hand.palm_away) {
                return hand.symbol;
            }
        }
        return "񆅁";
    }

    getPalmButtonSymbols(): {
        palmTowardsSymbol: string,
        palmSidewaysSymbol: string,
        palmAwaySymbol: string,
    } {
        const palmFilterHands = this.state.palmFilterHands.filter(hand =>
            hand.right_handed === this.state.isRightHanded &&
            hand.symbol_rotation === this.state.symbolRotation
        );
        return {
            palmTowardsSymbol: this.getPalmTowardsSymbol(palmFilterHands),
            palmSidewaysSymbol: this.getPalmSidewaysSymbol(palmFilterHands),
            palmAwaySymbol: this.getPalmAwaySymbol(palmFilterHands),
        };
    }

    render() {
        const{
            palmTowardsSymbol,
            palmSidewaysSymbol,
            palmAwaySymbol
        } = this.getPalmButtonSymbols();
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
                                {
                                    text: "Left",
                                    handleClick: this.setLefttHand.bind(this),
                                },
                                {
                                    text: "Right",
                                    isActive: true,
                                    handleClick: this.setRightHand.bind(this),
                                },
                            ],
                        },
                        {
                            name: "Palm",
                            type: ToolbarType.TOGGLE,
                            buttons: [
                                {
                                    text: palmTowardsSymbol,
                                    isActive: true,
                                    classes: [PHONEME_SYMOL_CLASS],
                                },
                                {
                                    text: palmSidewaysSymbol,
                                    classes: [PHONEME_SYMOL_CLASS],
                                },
                                {
                                    text: palmAwaySymbol,
                                    classes: [PHONEME_SYMOL_CLASS],
                                },
                            ],
                        },
                        {
                            type: ToolbarType.CLICKABLE_BUTTON,
                            buttons: [
                                {
                                    text: "↺"
                                },
                                {
                                    text: "↻"
                                },
                            ],
                        },
                    ]}
                />
            </div>
        );
    }
};