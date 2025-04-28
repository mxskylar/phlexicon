import * as React from 'react';

type Props = {
    keys: string[],
};

export const Keyboard = (props: Props) => (
    <div className="keyboard">
        {
            props.keys.map((symbol, i) => (
                <button
                    key={`key-${i}`}
                    type="button"
                    className="btn btn-outline-secondary phoneme-symbol"
                    data-bs-toggle="modal"
                    data-bs-target={`#${symbol}`}
                >
                    {symbol}
                </button>
            ))
        }
        {
            props.keys.map(symbol => (
                <div className="modal fade" id={symbol} tabIndex={-1} aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h1 className="phoneme-symbol">{symbol}</h1>
                                    <h6 className="text-secondary">Vowel</h6>
                                </div>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>Body of modal</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        }
    </div>
);