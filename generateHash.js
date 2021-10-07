console.time("run");
const fs = require('fs');
const STRING_LENGTH_LIMIT = 100;
const TEXT_FILE_TO_HASH = "";
const PASSED_STRING_TO_HASH = process.argv[2];
const SALT_TO_USE = process.argv[3];
function getStrFromFile(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, "utf-8", (err, data) => {
            if (err) reject(err);
            resolve(data);
        })
    })
};
function createSalt(digits) {
    if (SALT_TO_USE) return SALT_TO_USE;
    let salt = "";
    for (let i = 0; i < digits; i++) {
        salt += Math.round(Math.random() * 9).toString();
    }
    return salt.split('').map(e => Number(e));
}
function sprinkleSalt(seeds, salt) {
    let saltPlotIndex = Number(seeds[1]);
    saltPlotIndex = (saltPlotIndex >= seeds.length) ? (seeds.length - 1) : saltPlotIndex;
    seeds.splice(saltPlotIndex, 0, salt[saltPlotIndex])
    return seeds;
}
function createHashFromString(str) {
    const DIGITS_LIMIT = 38;
    let salt = createSalt(DIGITS_LIMIT);
    console.log('salt', salt);
    let seeds = str.split('').map(c => c.charCodeAt(0)).join('');
    let seasons = seeds.length;
    let cycles = Number(seeds[seeds.length - 1]) + 2;
    for (let i = 0; i < seasons * cycles; i++) {
        seeds = seeds.split('');
        let fertilizer = (Number(seeds.splice(0, 1)[0]) + 1);
        if (i > seasons) { seeds = sprinkleSalt(seeds, salt) }
        seeds = BigInt(seeds.join(''));
        seeds *= BigInt(fertilizer);
        seeds = seeds.toString();
        if (i > seasons) { seeds = seeds.substr(0, DIGITS_LIMIT - 1) }
        seeds += fertilizer.toString();
        if (seeds.length < DIGITS_LIMIT) { i-- };
    }
    return seeds
};
function isWithinLengthLimit(str) {
    return str.length <= STRING_LENGTH_LIMIT;
}
async function run() {
    let str;
    if (PASSED_STRING_TO_HASH) {
        str = PASSED_STRING_TO_HASH;
    } else if (TEXT_FILE_TO_HASH) {
        str = await getStrFromFile(TEXT_FILE_TO_HASH);
    } else {
        console.log("No string given as argument")
        return;
    }
    if (!isWithinLengthLimit(str)) {
        console.log(`Length of string exceeded limit of ${STRING_LENGTH_LIMIT}`);
        return;
    }
    let hash = createHashFromString(str);
    console.log(`Hash:${hash} / Original:${str}`)
}
run();
console.timeEnd("run");
//we need entropy, one-way mutations, and salt


