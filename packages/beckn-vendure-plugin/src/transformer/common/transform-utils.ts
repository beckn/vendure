export function checkArgsForKeys(
    taskName: string,
    args: { [key: string]: string } | undefined,
    keys: string[],
) {
    if (!args) throw Error(`${taskName} needs configuration values in args`);
    for (const key of keys) {
        if (!args[key]) throw Error(`${taskName} requires config parameter ${key}`);
    }
}

export function assignValue(obj: any, key: string, value: any) {
    const keys = key.split('.');
    const length = keys.length;
    let tObj = obj;
    for (let i = 0; i < length - 1; i++) {
        tObj[keys[i]] = {};
        tObj = tObj[keys[i]];
    }
    tObj[keys[length - 1]] = value;
}