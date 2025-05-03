import * as React from 'react';

export type CheckboxProps = {
    text?: string,
    value?: string,
    isChecked?: boolean,
    isDisabled?: boolean,
    handleChange?: Function,
};

type State = {
    isChecked: boolean,
};

export class Checkbox extends React.Component<CheckboxProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: this.props.isChecked ? true : false,
        };
        console.log(this.props);
    }

    handleChange(e: React.BaseSyntheticEvent<HTMLInputElement>) {
        this.setState({isChecked: !this.state.isChecked});
        this.props.handleChange(e);
    }

    render() {
        const text = this.props.text ? ` ${this.props.text}` : "";
        return (
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    value={this.props.value}
                    checked={this.props.isChecked}
                    disabled={this.props.isDisabled}
                    onChange={this.handleChange.bind(this)}
                />
                {text}
            </label>
        )
    }
}