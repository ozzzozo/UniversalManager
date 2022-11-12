const errors = {
    "251": {
        "type": "error",
        "title": "Oops...",
        "message": "You don't have the required permissions to create a workspace!"
    },

    "252": {
        "type": "error",
        "title": "Oops...",
        "message": "Image size must not exceed 2MB!"
    },

    "253": {
        "type": "error",
        "title": "Oops...",
        "message": "Invalid File Type!"
    },
    
    "254": {
        "type": "error",
        "title": "Oops...",
        "message": " An Unknown Error as occurred!"
    }
};

function getError(code) {
    code = errors[`${code}`];

    return [code["type"], code["title"], code["message"]];
}

if(ERROR !== undefined) {
    popup("" + ERROR);
}