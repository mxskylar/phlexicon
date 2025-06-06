import * as React from 'react';
import { KEYBOARD_CONTROL_CLASS } from '../constants.ts';

export type ToolbarButton = {
    text: string,
    value?: string,
    isActive?: boolean,
    isDisabled?: boolean,
    handleClick?: Function,
    classes?: string[],
};

export enum ToolbarType {
    CLICKABLE_BUTTON = "CLICKABLE_BUTTON",
    MULTI_SELECT = "MULTI_SELECT",
    TOGGLE = "TOGGLE",
}

export type ToolbarButtonGroup = {
    name?: string,
    type: ToolbarType,
    buttons: ToolbarButton[],
};

type Props = {
    id: string,
    groups: ToolbarButtonGroup[],
};

const ACTIVE_CLASS = "active";
const DISABLED_CLASS = "disabled";

export class Toolbar extends React.Component<Props> {
    constructor(props) {
        super(props);
    }

    handleClick(e, buttonGroup: ToolbarButtonGroup, handleClick?: Function) {
        // TODO: Ensure that e.target is always button that is clicked
        // And never the button's children
        const {type} = buttonGroup;
        if (type === ToolbarType.TOGGLE) {
            Array.from(e.target.parentElement.children)
                .map(element => element as Element)
                .filter(element => element.tagName === "BUTTON")
                .forEach((button, i) => {
                    if (button.classList.contains(ACTIVE_CLASS)) {
                        const handleParallelClick = buttonGroup.buttons[i].handleClick;
                        if (handleParallelClick) {
                            handleParallelClick(button);
                        }
                        button.classList.remove(ACTIVE_CLASS);
                    }
                });
        }
        if ([ToolbarType.MULTI_SELECT, ToolbarType.TOGGLE].includes(type)) {
            const {classList} = e.target;
            if (classList.contains(ACTIVE_CLASS)) {
                classList.remove(ACTIVE_CLASS);
            } else {
                classList.add(ACTIVE_CLASS);
            }
        }
        if (handleClick) {
            handleClick(e.target);
        }
    }

    render() {
        return (
            <div
                className="btn-toolbar"
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
                                    const {
                                        isActive,
                                        isDisabled,
                                        text,
                                        handleClick,
                                        value,
                                        classes
                                    } = button;
                                    const className = "btn btn-outline-info" +
                                        (isActive ? ` ${ACTIVE_CLASS}` : "") +
                                        (isDisabled ? ` ${DISABLED_CLASS}`: "") +
                                        (classes ? ` ${classes.join(" ")}` : "");
                                    return (
                                        <button
                                            type="button"
                                            className={className}
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