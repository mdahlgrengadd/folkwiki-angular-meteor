RepertoireModel = BaseModel.extendAndSetupCollection("repertoires")
Repertoires  = Meteor.repertoires;//ProductsModel.collection; //Likable.prototype._collection;

// Comments.helpers({
//   author: function () {
//     return Meteor.users.findOne({_id: this.userId});
//   }
// });autoValue:function(){ return this.userId }

 RepertoireModel.appendSchema({
   userId: {
    type: String,
    autoValue: function () {
      if (this.isSet) {
        return;
      }
      if (this.isInsert) {
        return this.userId;
      } else {
        this.unset();
      }
    }
  },

   name: {
     type: String,
     autoform: {
       rows: 1,
       'label-type': 'placeholder',
       placeholder: 'Name'
     }
//   },
//   userId: {
//     type: String,
//     autoValue: function () {
//       if (this.isInsert) {
//         return Meteor.userId();
//       } else {
//         this.unset();
//       }
//     }
//   },
//   productId: {
//     type: String
//   },
//   createdAt: {
//     type: Date,
//     autoValue: function () {
//       if (this.isInsert) {
//         return new Date();
//       } else {
//         this.unset();
//       }
//     }
   }
 });


Meteor.repertoires.allow({
    insert: function(userId, book){
        //book is an instance of Book class thanks to collection transforms.
        return repertoires.checkOwnership();
    },
    update: function(userId, book){
        //book is an instance of Book class thanks to collection transforms.
        return repertoires.checkOwnership();
    },
    remove: function(userId, book) {
        //book is an instance of Book class thanks to collection transforms.
        return repertoires.checkOwnership()
    }
});