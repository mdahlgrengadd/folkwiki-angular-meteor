Meteor.publish('products', function() {
  return Products.find();
});

Meteor.publish('products-trending', function(limit) {
  return Products.find({}, {sort: {numberOfVotes: -1, name: -1}, limit: limit});
});

Meteor.publish('products-recent', function(limit) {
  return Products.find({}, {sort: {createdAt: -1, name: -1}, limit: limit});
});


Meteor.publish('productsSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Products.search(query);
});

Meteor.publish("myLikes", function() {
    //returns undefined if not logged in so check if logged in first
    if(this.userId) {
      console.log("publish");
      console.log(this.userId);
      //console.log(Meteor);
        return Like.collection.find({userId:this.userId});
        //var user is the same info as would be given in Meteor.user();
    }
});


Meteor.publish("myRepertoires", function() {
    //returns undefined if not logged in so check if logged in first
    if(this.userId) {
      console.log("publish reps");
      console.log(this.userId);
      //console.log(Meteor);
        return RepertoireModel.collection.find({userId:this.userId});
        //var user is the same info as would be given in Meteor.user();
    }
});
/*Meteor.publishComposite('product', function(_id) {
  return {
    find: function() {
      return Products.find({_id: _id});
    },
    children: [
      {
        find: function(product) {
          return Meteor.users.find({_id: product.userId});
        }
      },
      {
        find: function(product) {
          return Meteor.users.find({_id: product.voterIds});
        }
      },
      {
        find: function(product) {
          return Comments.find({productId: product._id});
        },
        children: [
          {
            find: function(comment) {
              return Meteor.users.find({_id: comment.userId});
            }
          }
        ]
      }
    ]
  };
});

Meteor.publishComposite('user', function(_id) {
  return {
    find: function() {
      return Meteor.users.find({_id: _id});
    },
    children: [
      {
        find: function(user) {
          return Products.find({_id: {$in: user.profile.votedProductIds}});
        }
      }
    ]
  };
});*/
