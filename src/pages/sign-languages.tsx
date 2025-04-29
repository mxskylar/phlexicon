import * as React from 'react';
import { Option, Select } from '../components/select.tsx';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';
import { sendQuery } from '../db/ipc.ts';
import { SignDialect } from '../phonemes/sign/sign-dialect.ts';
import { Hand } from '../phonemes/sign/hand.ts';

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
            </div>
        );
    }
};