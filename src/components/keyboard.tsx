import * as React from 'react';
import { PHONEME_SYMBOL_CLASS } from '../constants.ts';
import { CopyButton } from './copy-button.tsx';

type Props = {
    phonemes: PhonemeDetails[],
};

export type PhonemeDetails = {
    symbol: string,
    type: string,
    body: React.ReactElement,
};

export const Keyboard = (props: Props) => (
    <div>
        <div className="keyboard">
            {
                props.phonemes.map(phoneme => {
                    const {symbol} = phoneme;
                    return (
                        <button
                            key={`key-${symbol}`}
                            type="button"
                            className={`btn btn-outline-secondary ${PHONEME_SYMBOL_CLASS}`}
                            data-bs-toggle="modal"
                            data-bs-target={`#${symbol}`}
                        >
                            {symbol}
                        </button>
                    );
                })
            }
        </div>
        {
            props.phonemes.map(phoneme => {
                const {symbol, type, body} = phoneme;
                return (
                    <div
                        className="modal fade phoneme-details"
                        id={symbol}
                        tabIndex={-1}
                        key={`modal-${symbol}`}
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <CopyButton text={symbol} />
                                    <div className="modal-title">
                                        <h1 className={PHONEME_SYMBOL_CLASS}>{symbol}</h1>
                                        <h6 className="text-secondary">{type}</h6>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    >
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {body}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
    </div>
);