import * as React from 'react';

type Props = {
    keys: string[],
    handleClick: Function,
};

export const Keyboard = (props: Props) => {
    return (
        <div className="keyboard-container">
            <div className="keyboard">
                {
                    props.keys.map((key, i) =>
                        <button
                            key={`key-${i}`}
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={e => props.handleClick(e)}
                        >
                            {key}
                        </button>
                    )
                }
            </div>
            <div className="key-details"></div>
        </div>
    );
}