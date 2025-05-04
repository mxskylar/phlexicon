import * as React from 'react';
import { Option, Select } from '../components/select.tsx';
import { Toolbar, ToolbarType } from '../components/toolbar.tsx';
import { KEYBOARD_CONTROL_CLASS, PHONEME_SYMBOL_CLASS } from '../constants.ts';
import { sendQuery } from '../db/ipc.ts';
import { Hand, PalmDirection, RotatablePalmDirection } from '../phonemes/sign/hand.ts';
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
    isoCode: string | null,
    dialectOptions: Option[],
    allHands: Hand[],
    filteredHands: Hand[],
    palmFilterHands: Hand[],
    symbolRotationIndex: number,
    symbolRotation: SignWritingSymbolRotation,
    isRightHanded: boolean,
    palmDirection: PalmDirectionFilter,
    isVertical: boolean,
    allPalmDirections: PalmDirection[],
    allRotatablePalmDirections: RotatablePalmDirection[],
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
            isoCode: null,
            dialectOptions: [],
            allHands: [],
            filteredHands: [],
            palmFilterHands: [],
            symbolRotationIndex: 0,
            allPalmDirections: [],
            allRotatablePalmDirections: [],
            ...DEFAULT_HAND_FILTERS,
        };
    }

    getDialectFromValue(dialectId: string): {
        isoCode: string,
        region: string,
    } {
        const parts = dialectId.split("-");
        const isoCode = parts[0];
        const region = parts[1];
        return {isoCode, region};
    }

    async getHands(dialectId: string): Promise<Hand[]> {
        const getDialectFilterQuery = (dialectId: string): string => {
            const {isoCode, region} = this.getDialectFromValue(dialectId);
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
        const palmFilterHands =
            await sendQuery('SELECT * FROM hands WHERE base_symbol = "񆄱"') as Hand[];
        const allPalmDirections =
            await sendQuery('SELECT * FROM palm_directions') as PalmDirection[];
        const allRotatablePalmDirections = await sendQuery(
            'SELECT * FROM rotatable_palm_directions ORDER BY base_symbol, symbol_rotation'
        ) as RotatablePalmDirection[];
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
            palmFilterHands,
            allPalmDirections,
            allRotatablePalmDirections,
        });
    }

    async switchDialect(e: React.BaseSyntheticEvent<HTMLSelectElement>) {
        const {selectedIndex, options} = e.target;
        const dialectId = options[selectedIndex].value;
        const {isoCode} = this.getDialectFromValue(dialectId);
        const allHands = await this.getHands(dialectId);
        this.setState({
            isoCode,
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
        const symbolRotation = CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS[symbolRotationIndex];
        const filteredHands = this.getFilterHands(
            this.state.allHands,
            symbolRotation,
            this.state.isRightHanded,
            this.state.palmDirection,
            this.state.isVertical,
        );
        this.setState({
            symbolRotationIndex,
            symbolRotation,
            filteredHands,
        });
    }

    rotateCounterClockwise() {
        const decrementedIndex = this.state.symbolRotationIndex - 1;
        const symbolRotationIndex = decrementedIndex < 0
            ? CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS.length - 1
            : decrementedIndex;
        const symbolRotation = CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS[symbolRotationIndex];
        const filteredHands = this.getFilterHands(
            this.state.allHands,
            symbolRotation,
            this.state.isRightHanded,
            this.state.palmDirection,
            this.state.isVertical,
        );
        this.setState({
            symbolRotationIndex,
            symbolRotation,
            filteredHands,
        });
    }

    setIsRightHanded(isRightHanded: boolean) {
        const filteredHands = this.getFilterHands(
            this.state.allHands,
            this.state.symbolRotation,
            isRightHanded,
            this.state.palmDirection,
            this.state.isVertical,
        );
        this.setState({isRightHanded, filteredHands});
    }

    setIsVertical(isVertical: boolean) {
        const filteredHands = this.getFilterHands(
            this.state.allHands,
            this.state.symbolRotation,
            this.state.isRightHanded,
            this.state.palmDirection,
            isVertical,
        );
        this.setState({isVertical, filteredHands});
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
            hand.symbol_rotation === this.state.symbolRotation &&
            hand.vertical == this.state.isVertical
        );
        return {
            palmTowardsSymbol: this.getPalmTowardsSymbol(palmFilterHands),
            palmSidewaysSymbol: this.getPalmSidewaysSymbol(palmFilterHands),
            palmAwaySymbol: this.getPalmAwaySymbol(palmFilterHands),
        };
    }

    setPalmDirection(palmDirection: PalmDirectionFilter) {
        const filteredHands = this.getFilterHands(
            this.state.allHands,
            this.state.symbolRotation,
            this.state.isRightHanded,
            palmDirection,
            this.state.isVertical,
        );
        this.setState({palmDirection, filteredHands});
    }

    getPalmDirectionSymbolId(hand: Hand): string {
        const {
            allPalmDirections,
            allRotatablePalmDirections,
        } = this.state;
        for(const i in allPalmDirections) {
            const palmDirection = allPalmDirections[i];
            if (
                hand.base_symbol === palmDirection.base_symbol &&
                hand.palm_towards === palmDirection.palm_towards &&
                hand.palm_sideways === palmDirection.palm_sideways &&
                hand.palm_away === palmDirection.palm_away &&
                hand.vertical === palmDirection.vertical
            ) {
                return palmDirection.id;
            }
        }
        const rotatablePalmDirections = allRotatablePalmDirections
            .filter(palmDirection => hand.base_symbol === palmDirection.base_symbol);
        if (rotatablePalmDirections.length === 0) {
            throw Error(`Failed to get palm direction symbol ID for symbol: ${hand.symbol}`);
        }
        for(const i in allRotatablePalmDirections) {
            const palmDirection = allRotatablePalmDirections[i];
            if (hand.symbol_rotation === palmDirection.symbol_rotation) {
                return palmDirection.id;
            }
        }
        // A few symbols do not have pictures for their corresponding ID
        // In those cases, use the picture with the closes palm orientation
        return rotatablePalmDirections[rotatablePalmDirections.length - 1].id;
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
                                    handleClick: this.setIsRightHanded.bind(this, false),
                                },
                                {
                                    text: "Right",
                                    isActive: this.state.isRightHanded,
                                    handleClick: this.setIsRightHanded.bind(this, true),
                                },
                            ],
                        },
                        {
                            type: ToolbarType.TOGGLE,
                            buttons: [
                                {
                                    text: "Vertical",
                                    isActive: this.state.isVertical,
                                    handleClick: this.setIsVertical.bind(this, true),
                                },
                                {
                                    text: "Horizontal",
                                    isActive: !this.state.isVertical,
                                    handleClick: this.setIsVertical.bind(this, false),
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
                                    classes: [PHONEME_SYMBOL_CLASS],
                                    handleClick: this.setPalmDirection.bind(this, PalmDirectionFilter.TOWARDS),
                                },
                                {
                                    text: palmSidewaysSymbol,
                                    isActive: this.state.palmDirection === PalmDirectionFilter.SIDEWAYS,
                                    classes: [PHONEME_SYMBOL_CLASS],
                                    handleClick: this.setPalmDirection.bind(this, PalmDirectionFilter.SIDEWAYS),
                                },
                                {
                                    text: palmAwaySymbol,
                                    isActive: this.state.palmDirection === PalmDirectionFilter.AWAY,
                                    classes: [PHONEME_SYMBOL_CLASS],
                                    handleClick: this.setPalmDirection.bind(this, PalmDirectionFilter.AWAY),
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
                                    hand={hand}
                                    isoCode={this.state.isoCode}
                                    symbolId={this.getPalmDirectionSymbolId(hand)}
                                />
                            ),
                        };
                    })}
                />
            </div>
        );
    }
};