import * as React from 'react';
import { Consonant, CONSONANT_ATTRIBUTE_NAMES, MANNER_CONSONANT_ATTRIBUTES, PLACE_CONSONANT_ATTRIBUTES } from "../../phonemes/spoken/consonant.ts";

type Props = {
    consonant: Consonant,
};

export const ConsonantDetails = (props: Props) => {
    const {consonant} = props;
    const placeAttributes = PLACE_CONSONANT_ATTRIBUTES
        .filter(place => consonant[place]);
    const mannerAttributes = MANNER_CONSONANT_ATTRIBUTES
        .filter(manner => consonant[manner]);
    return (
        <div>
            <p>
                <b className="text-dark">Glide: </b>
                {consonant.glide ? "Yes" : "No"}
            </p>
            {
                placeAttributes.length > 0
                    ? (
                        <div className="phoneme-detail-item">
                            <h5>Place</h5>
                            <ul className="list-group list-group-flush">
                                {
                                    placeAttributes.map((place, i) => (
                                        <li
                                            className="list-group-item"
                                            key={`consonant-place-${place}-${i}`}
                                        >
                                            {CONSONANT_ATTRIBUTE_NAMES[place]}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    )
                    : ""
            }
            {
                mannerAttributes.length > 0
                    ? (
                        <div>
                            <h5>Manner</h5>
                            <ul className="list-group list-group-flush">
                                {
                                    mannerAttributes.map((manner, i) => (
                                        <li
                                            className="list-group-item"
                                            key={`consonant-manner-${manner}-${i}`}
                                        >
                                            {CONSONANT_ATTRIBUTE_NAMES[manner]}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    )
                    : ""
            }
        </div>
    );
};