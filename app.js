const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const getDate = require(__dirname + "/date.js")

let item = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.render("list", {
        date: getDate.getDate(),
        items: item
    })
})

app.post("/", (req, res) => {
    itemInput = req.body.itemInput;
    item.push(itemInput)
    res.redirect("/")
})

app.listen(3000, () => {
    console.log("the server is running on port 3000")
})