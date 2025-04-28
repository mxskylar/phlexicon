import * as React from 'react';

export type Option = {
    displayText: string,
    value: string,
};

export enum SelectSize {
    SMALL = "form-select-sm",
    LARGE = "form-select-lg",
}

type Props = {
    id: string,
    options: Option[],
    handleChange: Function,
    classes: string[],
    size?: SelectSize,
};

export const Select = (props: Props) => {
    const classes = [...props.classes, "form-select"];
    if (props.size) {
        classes.push(props.size);
    }
    return (
        <select
            className={classes.join(" ")}
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

Select.defaultProps = {
    classes: [],
};