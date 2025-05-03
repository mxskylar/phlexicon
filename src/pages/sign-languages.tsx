import * as React from 'react';
import { Option, Select } from '../components/select.tsx';
import { Toolbar, ToolbarType } from '../components/toolbar.tsx';
import { KEYBOARD_CONTROL_CLASS, PHONEME_SYMOL_CLASS } from '../constants.ts';
import { sendQuery } from '../db/ipc.ts';
import { Hand } from '../phonemes/sign/hand.ts';
import { SignDialect } from '../phonemes/sign/sign-dialect.ts';
import { CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS, SignWritingSymbolRotation } from '../phonemes/sign/sign-writing.ts';
import { Keyboard } from '../components/keyboard.tsx';
import { HandDetails } from '../components/sign/hand-details.tsx';

type Props = {};

enum PalmDirectionFilter {
    TOWARDS = "palm_towards",
    SIDEWAYS = "palm_sideways",
    AWAY = "palm_away",
}

type State = {
    dialectOptions: Option[],
    allHands: Hand[],
    filteredHands: Hand[],
    palmFilterHands: Hand[],
    symbolRotationIndex: number,
    symbolRotation: SignWritingSymbolRotation,
    isRightHanded: boolean,
    palmDirection: PalmDirectionFilter,
    isVertical: boolean,
};

const ALL_LANGUAGES_VALUE = "ALL";

const DEFAULT_HAND_FILTERS: {
    symbolRotation: SignWritingSymbolRotation,
    isRightHanded: boolean,
    palmDirection: PalmDirectionFilter,
    isVertical: boolean,
} = {
    symbolRotation: SignWritingSymbolRotation.DEGREES_0_or_360,
    isRightHanded: true,
    palmDirection: PalmDirectionFilter.TOWARDS,
    isVertical: true,
}

export class SignLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            dialectOptions: [],
            allHands: [],
            filteredHands: [],
            palmFilterHands: [],
            symbolRotationIndex: 0,
            ...DEFAULT_HAND_FILTERS,
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

    getFilterHands(
        allHands: Hand[],
        symbolRotation: SignWritingSymbolRotation,
        isRightHanded: boolean,
        palmDirection: PalmDirectionFilter,
        isVertical: boolean,
    ): Hand[] {
        return allHands.filter(hand =>
            hand.symbol_rotation === symbolRotation &&
            hand.right_handed == isRightHanded &&
            hand[palmDirection.valueOf()] &&
            hand.vertical == isVertical
        );
    }

    async componentDidMount() {
        const dialects = await sendQuery("SELECT * FROM sign_dialects ORDER BY name;")
            .then(rows => rows as SignDialect[]);
        const allHands = await this.getHands(ALL_LANGUAGES_VALUE);
        this.setState({
            dialectOptions: dialects.map(dialect => {
                return {
                    displayText: dialect.name,
                    value: `${dialect.iso_code}-${dialect.region}`,
                }
            }),
            allHands,
            filteredHands: this.getFilterHands(
                allHands,
                this.state.symbolRotation,
                this.state.isRightHanded,
                this.state.palmDirection,
                this.state.isVertical,
            ),
            palmFilterHands: await sendQuery(
                'SELECT * FROM hands WHERE base_symbol = "񆄱"'
            ) as Hand[],
        });
    }

    async switchDialect(e: React.BaseSyntheticEvent<HTMLSelectElement>) {
        const {selectedIndex, options} = e.target;
        const dialectId = options[selectedIndex].value;
        const allHands = await this.getHands(dialectId);
        this.setState({
            allHands,
            filteredHands: this.getFilterHands(
                allHands,
                this.state.symbolRotation,
                this.state.isRightHanded,
                this.state.palmDirection,
                this.state.isVertical,
            ),
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
            hand.right_handed == this.state.isRightHanded &&
            hand.symbol_rotation === this.state.symbolRotation
        );
        return {
            palmTowardsSymbol: this.getPalmTowardsSymbol(palmFilterHands),
            palmSidewaysSymbol: this.getPalmSidewaysSymbol(palmFilterHands),
            palmAwaySymbol: this.getPalmAwaySymbol(palmFilterHands),
        };
    }

    setPalmTowards() {
        this.setState({palmDirection: PalmDirectionFilter.TOWARDS});
    }

    setPalmSideways() {
        this.setState({palmDirection: PalmDirectionFilter.SIDEWAYS});
    }

    setPalmAway() {
        this.setState({palmDirection: PalmDirectionFilter.AWAY});
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
                            type: ToolbarType.CLICKABLE_BUTTON,
                            buttons: [
                                {
                                    text: "↺",
                                    handleClick: this.rotateCounterClockwise.bind(this),
                                },
                                {
                                    text: "↻",
                                    handleClick: this.rotateClockwise.bind(this),
                                },
                            ],
                        },
                        {
                            name: "Hand",
                            type: ToolbarType.TOGGLE,
                            buttons: [
                                {
                                    text: "Left",
                                    isActive: !this.state.isRightHanded,
                                    handleClick: this.setLefttHand.bind(this),
                                },
                                {
                                    text: "Right",
                                    isActive: this.state.isRightHanded,
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
                                    isActive: this.state.palmDirection === PalmDirectionFilter.TOWARDS,
                                    classes: [PHONEME_SYMOL_CLASS],
                                    handleClick: this.setPalmTowards.bind(this),
                                },
                                {
                                    text: palmSidewaysSymbol,
                                    isActive: this.state.palmDirection === PalmDirectionFilter.SIDEWAYS,
                                    classes: [PHONEME_SYMOL_CLASS],
                                    handleClick: this.setPalmSideways.bind(this),
                                },
                                {
                                    text: palmAwaySymbol,
                                    isActive: this.state.palmDirection === PalmDirectionFilter.AWAY,
                                    classes: [PHONEME_SYMOL_CLASS],
                                    handleClick: this.setPalmAway.bind(this),
                                },
                            ],
                        },
                    ]}
                />
                <Keyboard
                    phonemes={this.state.filteredHands.map(hand => {
                        const {symbol} = hand;
                        return {
                            symbol,
                            type: "Oriented Handshape",
                            body: (
                                <HandDetails
                                />
                            ),
                        };
                    })}
                />
            </div>
        );
    }
};