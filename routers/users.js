const express = require('express')
const crypto = require('crypto');

const router = express.Router()
const permission = require("../util/permission")
const auth = require("../util/auth")
const util = require("../util/variables");

router.post("/users/auth", async (req, res) => {
    
    if(req.body === undefined) {
        res.send(400);
    }
    
    let username = req.body.username;
    let password = req.body.password;

    if(util.isEmptyOrUndefined(username) || util.isEmptyOrUndefined(password)) {
        res.json({"error": "field error"});
    }

    password = crypto.createHash('sha256').update(password).digest('base64');

    if((await auth.login(username, password)) === true) {
        let os = req.headers['user-agent']; //.match(/(?<=\().*?(?=;)/)[0]; // possible xss if displayed?
        let uuid = await permission.addSession(username, os, req.socket.remoteAddress);

        if(uuid !== undefined) {
            res.cookie('UUID', uuid);
            res.redirect("/");
        } else {
            res.render("login.ejs", {error: "Something went wrong."})
        }
    } else {
        res.render("login", {error: "Username and Password Combination Unknown!"});
    }
});

module.exports = router