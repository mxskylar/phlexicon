import * as React from 'react';

type Props = {
    phonemes: PhonemeDetails[],
};

type State = {
    copied: boolean,
};

export type PhonemeDetails = {
    symbol: string,
    type: string,
    body: React.ReactElement,
};

const COPY_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
    </svg>
);

const COPIED_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard-check" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
    </svg>
);

export class Keyboard extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            copied: false,
        }
    }

    copyPhoneme(
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        phoneme: PhonemeDetails
    ) {
        navigator.clipboard.writeText(phoneme.symbol);
        this.setState({copied: true});
        setTimeout(() => this.setState({copied: false}), 750);
    }

    render() {
        return (
            <div>
                <div className="keyboard">
                    {
                        this.props.phonemes.map(phoneme => {
                            const {symbol} = phoneme;
                            return (
                                <button
                                    key={`key-${symbol}`}
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
                </div>
                {
                    this.props.phonemes.map(phoneme => {
                        const {symbol, type, body} = phoneme;
                        const copyButtonClass = this.state.copied
                            ? "btn-outline-success" : "btn-outline-dark";
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
                                            <button
                                                type="button"
                                                className={`btn ${copyButtonClass} copy-button`}
                                                onClick={e => this.copyPhoneme(e, phoneme)}
                                            >
                                               {
                                                    this.state.copied
                                                        ? COPIED_ICON
                                                        : COPY_ICON
                                                } 
                                            </button>
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
    }
}