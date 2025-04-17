export type SpokenPhoneme = {[index: string]: boolean};

export type SpokenPhonemeAxis = {
    attributes: string[],
    otherAttributes: string[]
};

export type SpokenPhonemeAttributes = {
    xAxis: SpokenPhonemeAxis,
    yAxis: SpokenPhonemeAxis
}