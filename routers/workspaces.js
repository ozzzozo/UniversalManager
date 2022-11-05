const express = require('express')
const crypto = require('crypto');

const router = express.Router()
const auth = require("../util/auth")
const util = require("../util/variables");

router.get("/", async (req, res) => {
    let authCookie = req.cookies.UUID;

    if(util.isEmptyOrUndefined(authCookie)) {
        return res.render("login", {});
    }

    res.render("itworks")
});

module.exports = router