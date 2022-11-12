/*
    All of the Util Functions Regarding Vars
*/

const imageTypes = [
    "image/apng",
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
];

function isEmptyOrUndefined(param) {
    if(param === undefined) return true;
    if(typeof param !== "string") return true;
    if(param.length < 1) return true;
    return false;
}

function returnSize(number) {
    if (number < 1024) {
        return `${number} B`;
    } else if (number >= 1024 && number < 1048576) {
        return `${(number / 1024).toFixed(1)} KB`;
    } else if (number >= 1048576) {
        return `${(number / 1048576).toFixed(1)} MB`;
    }
}

function sanatize(text) {
    return text;
}

module.exports = { isEmptyOrUndefined, returnSize, imageTypes, sanatize };