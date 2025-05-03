import * as React from 'react';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';
import { Checkbox, CheckboxProps } from './checkbox.tsx';

export type MultiSelectGroup = {
    name?: string,
    checkboxes: CheckboxProps[],
};

type Props = {
    id: string,
    prompt: string,
    groups: MultiSelectGroup[],
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
                    {this.props.prompt}
                </label>
                <div className="checkbox-list">
                    {
                        this.props.groups.map((group, i) => {
                            const sectionHeaderClass = i > 0
                                ? "subsequent-section-header"
                                : "first-section-header";
                            const {name} = group;
                            return (
                                <label
                                    className="section-label"
                                    key={`${this.props.id}-${name}-section-${i}`}
                                >
                                    {
                                        name
                                        ?   <h6 className={`text-dark ${sectionHeaderClass}`}>
                                                {name}
                                            </h6>
                                        : ""
                                    }
                                    {
                                        group.checkboxes.map((checkbox, i) => {
                                            return (
                                                <Checkbox
                                                    key={`${this.props.id}-${name}-checkbox-${i}`}
                                                    {...checkbox}
                                                />
                                            )
                                        })
                                    }
                                </label>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}