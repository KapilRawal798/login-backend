const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/pinterest");

const userSchema = mongoose.Schema({
 username:String,
 email:String,
 password:String,
 name:String,
 contact:Number,
 profileImage:String,
 boards:{
  type:Array,
  default:[]
 },
 posts:[
   {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
   }
 ]
});
userSchema.plugin(plm);
module.exports = mongoose.model("user",userSchema);