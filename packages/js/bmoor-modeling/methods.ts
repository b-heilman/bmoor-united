import {implode} from '@bmoor/path';
import { DynamicObject } from "@bmoor/object";

export function dictToFields(dict: DynamicObject<string>): Record<string, string>{
    const rtn = {};

    const paths = implode(dict);

    Object.entries(paths).map(([path, reference]) => {
        rtn[reference] = path;
    });

    return rtn;
}