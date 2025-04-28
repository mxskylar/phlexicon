import * as React from 'react';

type Props = {
    phonemes: PhonemeDetails[],
};

export type PhonemeDetails = {
    symbol: string,
    type: string,
    body: React.ReactElement,
};

export const Keyboard = (props: Props) => (
    <div className="keyboard">
        {
            props.phonemes.map((phoneme, i) => {
                const {symbol} = phoneme;
                return (
                    <button
                        key={`key-${i}`}
                        type="button"
                        className="btn btn-outline-secondary phoneme-symbol"
                        data-bs-toggle="modal"
                        data-bs-target={`#${symbol}`}
                    >
                        {symbol}
                    </button>
                );
            })
        }
        {
            props.phonemes.map(phoneme => {
                const {symbol, type, body} = phoneme;
                return (
                    <div className="modal fade" id={symbol} tabIndex={-1} aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div className="modal-title">
                                        <h1 className="phoneme-symbol">{symbol}</h1>
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