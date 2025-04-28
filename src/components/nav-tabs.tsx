import * as React from 'react';

export type NavItem = {
    displayText: string,
    href: string,
};

type Props = {
    id: string,
    navItems: NavItem[],
    handleChange: Function,
    children: React.ReactElement,
};

const ACTIVE_TAB_CLASS = "active";

export class NavTabs extends React.Component<Props> {
    links: React.ReactElement[];

    constructor(props) {
        super(props);
    }

    handleChange(e: React.BaseSyntheticEvent<HTMLLinkElement>) {
        Array.from(document.getElementById(this.props.id).children)
            .map(listItem => Array.from(listItem.children)[0])
            .forEach(link => link.classList.remove(ACTIVE_TAB_CLASS));
        e.target.classList.add(ACTIVE_TAB_CLASS);
        this.props.handleChange(e);
    }

    render() {
        return (
            <div className="tabs">
                <ul className="nav nav-tabs" id={this.props.id}>
                    {
                        this.props.navItems.map((navItem, i) =>
                            <li className="nav-item" key={`${this.props.id}-${i}`}>
                                <a
                                    className={`nav-link${i === 0 ? ` ${ACTIVE_TAB_CLASS}` : ""}`}
                                    aria-current="page"
                                    href={navItem.href}
                                    onClick={this.handleChange.bind(this)}
                                >
                                    {navItem.displayText}
                                </a>
                            </li>
                        )
                    }
                </ul>
                {this.props.children}
            </div>
        );
    }
}