//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false); // to remove the deprecation warning of findOneAndUpdate


const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://mridulgandhi411:Mridul3344@cluster0-qegcy.mongodb.net/todolistDB",{useNewUrlParser : true});

const itemsSchema = new mongoose.Schema({
    name : String
});


const listSchema = new mongoose.Schema ({
  name : String,
  items : [itemsSchema]
});



const Item = mongoose.model("Item",itemsSchema);

const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name : "Welcome to your to do list!"
});

const item2 = new Item ({
  name : "Hit the + button to add an item."
});

const item3 = new Item ({
  name : "<-- Hit this to delete an item."
});


const defaultItems = [item1,item2,item3];






app.get("/", function(req, res) {

   Item.find({},function(err,foundItems){

      if(foundItems.length === 0 ) {
        Item.insertMany(defaultItems , function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("Succesfully Updated Default Items.");
          }

          res.redirect("/");
        });
      } else {
         res.render("list", {listTitle: "Today", newListItems: foundItems});
      }


   });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name : itemName
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name : listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});


app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err) {
        console.log(err);
      } else {
        console.log("Succesfully Removed the checked item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name : listName} , {$pull : {items : {_id : checkedItemId}}},function(err , foundList) {
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/:listTopic",function(req,res){
  const listTopic=  _.capitalize(req.params.listTopic) ;

  List.findOne({name : listTopic},function(err,foundList) {
    if(!err) {
      if(!foundList) {
          // create a new list
          const list = new List ({
            name : listTopic,
            items : defaultItems
          });

          list.save();

          res.redirect("/" + listTopic);

      } else {
        //show already existing list
         res.render("list", {listTitle: listTopic, newListItems: foundList.items});
      }
    }
  });

});





app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port , function() {
  console.log("Server started Succesfully");
});
