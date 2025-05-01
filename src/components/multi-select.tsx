import * as React from 'react';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';

type Props = {
    id: string,
};

const TOGGLED_ON_CLASS = "on";

export class MultiSelect extends React.Component<Props> {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.body.addEventListener("click", this.maybeHideDropDown.bind(this));
    }

    maybeHideDropDown(e) {
        const element = e.target;
        const multiSelect = document.getElementById(this.props.id);
        // If element is not a child of the multi select
        // and is not the multi select itself
        if (element !== multiSelect && !multiSelect.contains(element)) {
            multiSelect.classList.remove(TOGGLED_ON_CLASS);
        }
    }

    toggleDropDown() {
        const {classList} = document.getElementById(this.props.id);
        if (classList.contains(TOGGLED_ON_CLASS)) {
            classList.remove(TOGGLED_ON_CLASS);
        } else {
            classList.add(TOGGLED_ON_CLASS);
        }
    }

    render() {
        return (
            <div
                className={`multi-select ${KEYBOARD_CONTROL_CLASS}`}
                aria-label="Multi-select dropdown"
                id={this.props.id}
            >
                <label
                    className="select-label form-select"
                    onClick={this.toggleDropDown.bind(this)}
                >
                    Select
                </label>
                <div className="checkbox-list">
                    <label className="section-label">
                        <h6 className="text-dark first-section-header">Group 1</h6>
                        <label className="checkbox-label">
                            <input type="checkbox" name="dropdown-group" value="group1-1" />
                            &nbsp;First Option
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" name="dropdown-group" value="group1-2" />
                            &nbsp;Second Option
                        </label>
                    </label>
                    <label className="section-label">
                        <h6 className="text-dark subsequent-section-header">Group 2</h6>
                        <label className="checkbox-label">
                            <input type="checkbox" name="dropdown-group" value="group2-1" />
                            &nbsp;First Option
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" name="dropdown-group" value="group2-2" disabled />
                            &nbsp;Second Option
                        </label>
                    </label>
                </div>
            </div>
        );
    }
}