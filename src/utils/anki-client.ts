/**
 * Client for Anki Connect API
 * 
 * https://git.sr.ht/~foosoft/anki-connect
 */

export const ankiPost = (payload: object) => {
    return fetch("http://localhost:8765", {
        method: "POST",
        body: JSON.stringify({
            version: 6,
            ...payload
        }),
    })
        .then(response => response.json())
        .then((responseData) => {
            const {result, error} = responseData;
            if (error) {
                throw new Error(error);
            }
            return result;
        });
};