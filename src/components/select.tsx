import * as React from 'react';

export type Option = {
    displayText: string,
    value: string,
};

type Props = {
    defaultOption: Option,
    options: Option[],
    handleChange: Function,
};

export const Select = (props: Props) => {
    return (
        <select
            className="form-select"
            aria-label="Default select example"
            defaultValue={props.defaultOption.value}
            onChange={e => props.handleChange(e)}
        >
            <option key={props.defaultOption.value} value={props.defaultOption.value}>
                {props.defaultOption.displayText}
            </option>
            {
                props.options.map(option =>
                    <option key={option.value} value={option.value}>
                        {option.displayText}
                    </option>
                )
            }
        </select>
    )
};