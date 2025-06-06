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
    handleReset: Function,
    scrollTop?: boolean,
};

type EventListener = {
    type: string,
    fn,
}

const TOGGLED_ON_CLASS = "on";

export class MultiSelect extends React.Component<Props> {
    checkboxListId: string;
    toggleOnClickOutside: EventListener;
    hideOnEscape: EventListener;

    constructor(props) {
        super(props);
        this.checkboxListId = `${this.props.id}-checkbox-list`;
        this.toggleOnClickOutside = {
            type: "click",
            fn: this.maybeHideDropDown.bind(this),
        };
        this.hideOnEscape = {
            type: "keydown",
            fn: e => {
                if (e.key == "Escape") {
                    document.getElementById(this.props.id).classList.remove(TOGGLED_ON_CLASS);
                }
            },
        };
    }

    addEventListenerToBody(eventListener: EventListener) {
        const {type, fn} = eventListener;
        document.body.addEventListener(type, fn);
    }

    componentDidMount() {
        this.addEventListenerToBody(this.toggleOnClickOutside);
        this.addEventListenerToBody(this.hideOnEscape);
    }

    removeEventListenerFromBody(eventListener: EventListener){
        const {type, fn} = eventListener;
        document.body.removeEventListener(type, fn);
    }

    componentWillUnmount() {
        this.removeEventListenerFromBody(this.toggleOnClickOutside);
        this.removeEventListenerFromBody(this.hideOnEscape);
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
            if (this.props.scrollTop) {
                document.getElementById(this.checkboxListId).scrollTop = 0;
            }
        }
    }

    reset(e) {
        const checkboxes = document.getElementById(this.checkboxListId)
            .querySelectorAll("input");
        checkboxes.forEach(checkbox => checkbox.checked = false);
        this.props.handleReset(e);
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
                <div className="dropdown">
                    <div className="reset-container">
                        <a
                            className="text-secondary"
                            href="#"
                            onClick={this.reset.bind(this)}
                        >
                            Reset
                        </a>
                    </div>
                    <div className="checkbox-list" id={this.checkboxListId}>
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
            </div>
        );
    }
}