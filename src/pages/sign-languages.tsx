import * as React from 'react';
import { Option, Select } from '../components/select.tsx';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';
import { sendQuery } from '../db/ipc.ts';
import { SignDialect } from '../phonemes/sign/sign-dialect.ts';
import { Hand } from '../phonemes/sign/hand.ts';
import { Toolbar, ToolbarType } from '../components/toolbar.tsx';

type Props = {};

type State = {
    dialectOptions: Option[],
};

const ALL_LANGUAGES_VALUE = "ALL";

export class SignLanguages extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            dialectOptions: [],
        };
    }

    async getHands(dialectId: string): Promise<Hand[]> {
        const getDialectPrimaryKeys = (dialectId: string): {
            isoCode: string,
            region: string,
        } => {
            const primaryKeys = dialectId.split("-");
            return {
                isoCode: primaryKeys[0],
                region: primaryKeys[1],
            };
        };
        const {isoCode, region} = getDialectPrimaryKeys(dialectId);
        return [];
    }

    async componentDidMount() {
        const dialects = await sendQuery("SELECT * FROM sign_dialects ORDER BY name;")
            .then(rows => rows as SignDialect[]);
        this.setState({
            //handshapes: await this.getHands(ALL_LANGUAGES_VALUE),
            dialectOptions: dialects.map(dialect => {
                return {
                    displayText: dialect.name,
                    value: `${dialect.iso_code}-${dialect.region}`,
                }
            }),
        });
    }

    async switchDialect(e: React.BaseSyntheticEvent<HTMLSelectElement>) {
        const {selectedIndex, options} = e.target;
        const dialectId = options[selectedIndex].value;
        console.log(dialectId);
        /*this.setState({
            handshapes: await this.getHands(dialectId),
        });*/
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
                                {child: "Right", isActive: true},
                                {child: "Left"},
                            ],
                        },
                        {
                            name: "Palm",
                            type: ToolbarType.TOGGLE,
                            buttons: [
                                {
                                    child: (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                        </svg>
                                    ),
                                    isActive: true
                                },
                                {child: "◑"},
                                {child: (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle-fill" viewBox="0 0 16 16">
                                        <circle cx="8" cy="8" r="8"/>
                                    </svg>
                                )},
                            ],
                        },
                    ]}
                />
            </div>
        );
    }
};