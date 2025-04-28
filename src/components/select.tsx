import * as React from 'react';

export type Option = {
    displayText: string,
    value: string,
};

type Props = {
    id: string,
    options: Option[],
    handleChange: Function,
};

export const Select = (props: Props) => {
    return (
        <select
            className="form-select"
            aria-label="Default select example"
            defaultValue={props.options[0].value}
            onChange={e => props.handleChange(e)}
            id={props.id}
        >
            {
                props.options.map((option, i) =>
                    <option key={`${props.id}-${i}`} value={option.value}>
                        {option.displayText}
                    </option>
                )
            }
        </select>
    )
};