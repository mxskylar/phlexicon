export type SpokenPhonemeAxis = {
    attributes: string[],
    otherAttributes: string[]
};

export type SpokenPhonemeAttributes = {
    xAxis: SpokenPhonemeAxis,
    yAxis: SpokenPhonemeAxis
};

export type SpokenDialectPhoneme = {
    dialect_id: string,
    symbol: string
};