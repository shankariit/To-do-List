//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");
const _= require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://uma_123:Shankar123@cluster0.3bti2.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema = {
   name : String
};

const Item = mongoose.model("Item",itemSchema); // CollectionName Always to be a singulat

const item1 = new Item(
    {name : "Book"}

);
const item2 = new Item(

    {name : "Pen"},

);
const item3 = new Item(

    {name : "pencil"}
);

const defaultitems = [item1,item2,item3];


const listSchema = {
    name : String,
    items : [itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();
Item.find({},function(err,result){
     if(result.length=== 0 ){
       Item.insertMany(defaultitems,function(err){
             if(err){
               console.log(err);
             }else{
                console.log("Success");
             }
        });
     }
    res.render("list", {listTitle: "Today", newListItems: result});
    });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
        name : itemName
  });

 if(listName==="Today"){
     newItem.save();
     res.redirect("/");
 }else{
        List.findOne({name:listName},function(err,result){
             result.items.push(newItem);
             result.save();
             res.redirect("/" + listName);
        });
 }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
     const checkedItem = req.body.check;
     const listName = req.body.listname;

     if(listName==="Today"){
     Item.findByIdAndRemove(checkedItem,function(err){
           if(err){
               console.log("Not deleted");
                res.redirect("/");
           }else{
                   res.redirect("/");
           }
     });
   }else{
          List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,result){
              if(!err){
                  res.redirect("/"+listName);
              }
          })
   }
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
  // console.log(customListName);
   List.findOne({name : customListName},function(err,results){
        if(!err){
          if(!results){
            const list = new List({
                name : customListName,
                items : defaultitems
            });
            list.save();
            res.redirect("/" + customListName);
          }
          else{
               res.render("list", {listTitle: results.name, newListItems: results.items});
          }

        }
   });

});
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
