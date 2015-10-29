Like.appendSchema({

    "repertoire":{
        type: String,
        max: 200
    }

}); 



// Extension to linkable-model so that you can do Like.collection.findOne({userId:this.userId}).product() to give you
// the liked product. For instance in profile to iterate over the user's liked products...
LinkableModel.methods({
  "product": function (){
    return Meteor.products.findOne(this.linkedObjectId);
  }

});


/**
 * Extensible model for creating child models which can be "liked"
 * @class LinkableModel
 */
myLikeableModel = LikeableModel.extend();


/**
 * Add a record to the likes collection which is linked to the model
 */
myLikeableModel.prototype.like = function (rep_name) {
    var type = this._objectType;
    new Like({linkedObjectId:this._id, userId:Meteor.userId(), objectType:type, repertoire: rep_name}).save();
};


