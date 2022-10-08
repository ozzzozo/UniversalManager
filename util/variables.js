/*
**************************************************
**************************************************
*****All of the Util Functions Regarding Vars*****
**************************************************
**************************************************
*/

function isEmptyOrUndefined(param) {
    if(param === undefined) return true;
    if(typeof param !== "string") return true;
    if(param.length < 1) return true;
    return false;
}

module.exports = { isEmptyOrUndefined };