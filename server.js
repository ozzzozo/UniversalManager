const express = require("express")
const port = 3000
const path = require("path")

const app = express();
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, 'views'));
app.use('/assets', express.static("assets"));

app.get("/", (req, res) => {
    res.render("login", {});
});

app.listen(port, () => {
    console.log(`[+] Server Running at Port ${port}`)
})