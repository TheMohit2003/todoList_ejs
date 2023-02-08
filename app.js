const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const getDate = require(__dirname + "/date.js")
const mongoose = require('mongoose');
const lodash = require('lodash');



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static("public"))

main().catch(err => console.log(err));

async function main() {
    mongoose.set('strictQuery', true)
    await mongoose.connect('mongodb://127.0.0.1:27017/todoListDB');
}

const itemsSchema = {
    name: {
        type: String,
        required: true
    }
};
const Item = mongoose.model("Item", itemsSchema)

const listSchema = {
    name: String,
    list: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

const item1 = new Item({
    name: "Buy eggs"
})
const item2 = new Item({
    name: "Buy milk"
})
const item3 = new Item({
    name: "clean the room"
})

defaultItems = [item1, item2, item3];


app.get("/", function (req, res) {

    Item.find({}, (err, itemsList) => {

        if (itemsList.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                (err) ? console.log(err): console.log("Succesfully saved defaults items to DB.")
            });
            itemsList = defaultItems;
        }

        res.render("list", {
            date: "Today",
            items: itemsList
        });

    });

});


app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName;

    List.findOne({
        name: customListName
    }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                //create a new list 
                const list = new List({
                    name: customListName,
                    list: defaultItems
                })
                list.save();
                res.redirect(`/${customListName}`)
            } else {
                res.render("list", {
                    date: foundList.name,
                    items: foundList.list
                });
            }
        }
    })
})

app.post("/", (req, res) => {
    const itemName = req.body.itemInput;
    const listName = req.body.list;

    const newItem = new Item({
        name: itemName
    })

    if(listName==="Today"){
        newItem.save();
        res.redirect("/")
    }else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.list.push(newItem);
            foundList.save();
            res.redirect(`/${listName}`)
        })
    }
    
})

app.post("/delete", (req, res) => {
    const checkedId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedId,(err)=>{
            if(!err){
                console.log("sucessfully deleted")
                res.redirect("/");
            }else{
                List.findOneAndUpdate({name:listName},{$pull:{list:{_id:checkedId}}},(err,foundList)=>{
                    if(!err){
                        res.redirect(`/${listName}`)
                    }
                })
            }

        })
    }

})

app.listen(3000, () => {
    console.log("the server is running on port 3000")
})