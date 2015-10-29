/*var Likable = LikeableModel.extend()

//BaseModel requires a prototype._collection so we do that here
Likable.prototype._collection = new Meteor.Collection("products", {
    transform: function(document){
        LinkableModel.registerLinkableType(Likable, "products") 
        return new Likable(document);
    }
});*/

//Add other protypal methods for this model

//expose the collection on the Meteor global
//Meteor.products = Likable.prototype._collection;
ProductsModel = myLikeableModel.extendAndSetupCollection("products")
Products = Meteor.products;//ProductsModel.collection; //Likable.prototype._collection;

//Products = new Mongo.Collection('products');

// Products.before.insert(function (userId, doc) {
//   doc.createdAt = new Date();
// });
/*
Products.helpers({
  datePosted: function () {
    return moment(this.createdAt).format('M/D');
  },
  author: function () {
    return Meteor.users.findOne({_id: this.userId});
  },
  voters: function () {
    return Meteor.users.find({_id: {$in: this.voterIds}});
  }
});
*/
RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

Products.search = function(query) {
  if (!query) {
    return;
  }
  return Products.find({
    name: { $regex: RegExp.escape(query), $options: 'i' }
  }, {
    limit: 200
  });
};

ProductsModel.appendSchema(new SimpleSchema({
  url: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Product URL'
    },
    max: 200
  },
  fwid: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'FolkWiki ID'
    },
    max: 200
  },
  key: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Key'
    },
    max: 200
  },  
  composer: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Composer'
    },
    max: 200
  },
  rhythm: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Rhythm'
    },
    max: 200
  },
  source: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Source'
    },
    max: 200
  },
    origin: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Origin'
    },
    max: 200
  },
    book: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Book'
    },
    max: 2000
  },
  transcription: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Transcription'
    },
    max: 200
  },
  name: {
    type: String,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Product Name'
    },
    max: 200
  },
  tagline: {
    type: String,
    optional: true,
    autoform: {
      'label-type': 'placeholder',
      placeholder: 'Tagline'
    },
    max: 20000
  },
  userId: {
    type: String,
    autoValue: function () {
      if (this.isSet) {
        return;
      }
      if (this.isInsert) {
        return Meteor.userId();
      } else {
        this.unset();
      }
    }
  },
  // voterIds: {
  //   type: [String],
  //   optional: true,
  //   defaultValue: []
  // },
  // numberOfVotes: {
  //   type: Number,
  //   optional: true,
  //   defaultValue: 0
  // },
  // numberOfComments: {
  //   type: Number,
  //   optional: true,
  //   defaultValue: 0
  // },
  createdAt: {
    type: Date
  }
}));

Meteor.products.allow({
    insert: function(userId, model){
        
        return model.checkOwnership(); //&& !!Meteor.authors.findOne(this.authorId);
    },
    update: function(userId, model){
        
        return model.checkOwnership();
    },
    remove: function(userId, book) {
        
        return model.checkOwnership()
    }
});

ProductsModel.methods({
    "owner": function(){
        return Meteor.users.findOne(this.userId);
    },
    // "author": function() {
    //     //return an instance of Author that itself has methods
    //     return Meteor.authors.findOne(this.authorId);
    // },
    // "fullTitle": function() {
    //     return this.title + ": " + this.subTitle;
    // }
});