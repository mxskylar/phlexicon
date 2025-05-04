import * as React from 'react';
import { Hand } from '../../phonemes/sign/hand.ts';
import { PHONEME_SYMBOL_CLASS } from '../../constants.ts';
import { CopyButton } from '../copy-button.tsx';

type Props = {
    hand: Hand,
    isoCode: string | null,
};

export const HandDetails = (props: Props) => {
    const {
        handshape,
        base_symbol,
        symbol,
    } = props.hand;
    const args = props.isoCode ? `?dictionary=${props.isoCode}` : "";
    const signMakerUrl = `https://www.signbank.org/signmaker/#${args}`;
    const twoDText = `${symbol}𝣠𝣠`
    return (
        <div className="hand-details">
            <table className="table table-borderless initial-details">
                <tbody>
                    <tr>
                        <td><CopyButton text={handshape} /></td>
                        <td className="text-primary text-primary">Handshape</td>
                        <td className={PHONEME_SYMBOL_CLASS}>{handshape}</td>
                        <td>Represents handshape at all orientations</td>
                    </tr>
                    <tr>
                        <td><CopyButton text={base_symbol} /></td>
                        <td className="text-primary text-primary">Base Symbol</td>
                        <td className={PHONEME_SYMBOL_CLASS}>{base_symbol}</td>
                        <td>Represents symbol at all rotations</td>
                    </tr>
                    <tr>
                        <td><CopyButton text={twoDText} /></td>
                        <td className="text-primary text-primary">2-D Text</td>
                        <td className={PHONEME_SYMBOL_CLASS}>{twoDText}</td>
                        <td>
                            Copy & paste this into "SWU" in the&nbsp;
                            <a href={signMakerUrl} target="_blank">SignMaker</a>&nbsp;
                            tool to represent this symbol in two dimenions.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}