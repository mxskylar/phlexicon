import * as React from 'react';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';

export type ToolbarButton = {
    text: string,
    isActive?: boolean,
    handleClick: Function,
    value: string,
};

export type ToolbarButtonGroup = {
    name?: string,
    isToggle?: boolean,
    buttons: ToolbarButton[],
};

type Props = {
    id: string,
    groups: ToolbarButtonGroup[],
};

const ACTIVE_CLASS = "active";

export class Toolbar extends React.Component<Props> {
    public static defaultProps = {
        isToggle: true,
    };

    constructor(props) {
        super(props);
    }

    handleClick(e, buttonGroup: ToolbarButtonGroup, handleClick: Function) {
        if (buttonGroup.isToggle) {
            Array.from(e.target.parentElement.children)
                .forEach((element, i) => {
                    const button = element as Element;
                    if (button.classList.contains(ACTIVE_CLASS)) {
                        buttonGroup.buttons[i].handleClick(button);
                        button.classList.remove(ACTIVE_CLASS);
                    }
                });
        }
        const {classList} = e.target;
        if (classList.contains(ACTIVE_CLASS)) {
            classList.remove(ACTIVE_CLASS);
        } else {
            classList.add(ACTIVE_CLASS);
        }
        handleClick(e.target);
    }

    render() {
        return (
            <div
                className="btn-toolbar mb-3"
                role="toolbar"
                aria-label="Toolbar with button groups"
                id={this.props.id}
            >
                {
                    this.props.groups.map((group, i) => (
                        <div
                            className={`btn-group me-2 ${KEYBOARD_CONTROL_CLASS}`}
                            role="group"
                            aria-label="Button group"
                            key={`${this.props.id}-toolbar-button-group-${i}`}
                        >
                            {
                                group.name
                                    ?   <div className="input-group-text" id="btnGroupAddon">
                                            {group.name}
                                        </div>
                                    : ""
                            }
                            {
                                group.buttons.map((button, i) => {
                                    const {isActive, text, handleClick, value} = button;
                                    return (
                                        <button
                                            type="button"
                                            className={`btn btn-outline-info${isActive ? " active" : ""}`}
                                            key={`${this.props.id}-button-${text}-${i}`}
                                            onClick={e => this.handleClick(e, group, handleClick)}
                                            value={value}
                                        >
                                            {text}
                                        </button>
                                    );
                                })
                            }
                        </div>
                    ))
                }
            </div>
        );
    }
}