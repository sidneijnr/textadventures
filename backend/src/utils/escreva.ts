export const gerarEscreva = (ref: { str: string }) => {
    return (...str: unknown[]) => {
        let lastWasString = false;
        for(let s of str) {
            if(s === undefined || s === null) continue;
            let strValue: string;
            let isString: boolean;
            if(typeof s === 'string') {
                strValue = s;
                isString = true;
            } else {
                strValue = String(s);
                isString = false;
            }
            
            ref.str += strValue;
            if(lastWasString && !isString) {
                ref.str += ' ';
            }
            lastWasString = isString;
        }
    }
}