const errors = {
    "101": {
        "type": "error",
        "title": "Oops...",
        "message": "You don't have the required permissions to create a workspace!"
    }
};

function getError(code) {
    code = errors[`${code}`];

    return [code["type"], code["title"], code["message"]];
}