import * as os from 'os';
import { DataParser, DataType, DataWarning } from "./data-parser";
import { getJsonData, getSeperatedValueData } from "./parse-utils";
import { SignWritingFontParser } from "./sign-writing-font-parser";
import { SignDialect } from "../../src/phonemes/sign/sign-dialect";
import { SIGN_DIALECTS_TABLE } from "../../src/db/tables";

type Dictionary = {
    name: string,
    dialectId: string,
    isoCode: string,
    region: string
    languageName?: string
};

type RawIsoData = {
    Id: string,
    Part2b: string,
    Part2t: string,
    Part1: string,
    Scope: string,
    Language_Type: string,
    Ref_Name: string,
    Comment: string
};

export class SignDialectParser implements DataParser {
    warnings: DataWarning[] = [];
    private dictionaries: Dictionary[] = [];
    private rawIsoData: RawIsoData[];

    constructor(dictNamesFilePath: string, isoFilePath: string) {
        console.log(`Parsing: ${dictNamesFilePath}`);
        const dictNames: string[] = getJsonData(dictNamesFilePath);
        dictNames.forEach(name => {
            const dictNameArray = name.split("-");
            const isoCode = dictNameArray[0];
            const region = dictNameArray[1];
            this.dictionaries.push({
                name,
                dialectId: `${isoCode}-${region}`,
                isoCode,
                region
            });
        });
        console.log(`Parsing: ${isoFilePath}`);
        this.rawIsoData = getSeperatedValueData(isoFilePath, {delimiter: "\t"});
    }

    private getLanguageName(isoCode: string): string | undefined {
        for (const i in this.rawIsoData) {
            const language = this.rawIsoData[i];
            if (language.Id === isoCode) {
                return language.Ref_Name;
            }
        }
    }

    public getDialects(): SignDialect[] {
        console.log("Parsing sign dialects...");
        const languagesBestEffort: Dictionary[] = this.dictionaries.map(dict => {
            return {
                ...dict,
                languageName: this.getLanguageName(dict.isoCode)
            };
        });
        const languages = languagesBestEffort.filter(dict => dict.languageName);
        // Log warning if unable to find ISO language name for all SignWriting dictionaries
        if (languagesBestEffort.length !== languages.length) {
            const missingDictLogs = languagesBestEffort
                .filter(dict => !languages.includes(dict))
                .map(dict => `==> ${dict.name}`);
            const logs = [
                `Could not find ISO language name for the following SignWriting dictioanries:`,
                ...missingDictLogs
            ];
            this.warnings.push({
                dataName: SIGN_DIALECTS_TABLE.name,
                dataType: DataType.TABLE,
                message: logs.join(os.EOL)
            })
        }
        return languages.map(dict => {
            return {
                id: dict.dialectId,
                name: `${dict.languageName} (${dict.region})`
            };
        });
    }

    public getDictionaryDialectIdMap(): {[index: string]: string} {
        const dictNameDialectIdMap = {};
        this.dictionaries.forEach(dict => {
            dictNameDialectIdMap[dict.name] = dict.dialectId;
        });
        return dictNameDialectIdMap;
    }
}