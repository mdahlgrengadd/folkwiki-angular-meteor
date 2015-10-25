Meteor.startup(function() {
  Products.remove({});
  Products.allow({
      insert: function () {
          return true;
      },

      remove: function (){
          return true;    
      },

      update: function() {
          return true;    
      }

  });

  var users = [
    {
      emails: [{
        address: 'mdahlgrengadd@gmail.com',
        verified: false,
        primary: true
      }],
      profile: {
        name: 'mrdahlgren'
      },
      services: {
        'meteor-developer': {
          id: '2jefqB8rsQ2q3TuRW',
          username: 'mrdahlgren',
          emails: [{
            address: 'mdahlgrengadd@gmail.com',
            verified: false,
            primary: true
          }]
        }
      }
    }
  ];


  if (Meteor.users.find({}).count() === 0) {
    _(users).each(function (user) {
      Meteor.users.insert(user);
    });
  }

  var author = Meteor.users.find().fetch()[0];
  if (Products.find({}).count() === 0) {



  //var SQL = Npm.require('sql.js');
  var filebuffer = Assets.getBinary('folkwiki.se.db');
  //var S = Npm.require('string');

// Load the db
  var db = new SQL.Database(filebuffer);


    // Prepare a statement
  var stmt = db.prepare("SELECT * FROM tune WHERE id BETWEEN $start AND $end");
  stmt.getAsObject({$start:1, $end:1}); // {col1:1, col2:111}


  // Bind new values
  stmt.bind({$start:1, $end:100});
  while(stmt.step()) { //
      var row = stmt.getAsObject();
        // [...] do something with the row of result
      var abc = row.abc;
      var result = S(abc).between('(:music:)', '(:musicend:)').s;
      if(result == "") {
        result = "No score"
      } else {
            try {
            var tunebook = new ABCJS.TuneBook(result);
            var abcParser = new ABCJS.parse.Parse();
            abcParser.parse(tunebook.tunes[0].abc);
            //if (!(tune instanceof ABCJS.data.Tune)) 
            var tune = abcParser.getTune();

            var firstline = tune.lines[0].staff[0];
            var key = firstline.key.root + firstline.key.mode;
            //console.log(key);
            //metaText: a hash of {key, value}, where key is one of: title, author, rhythm, source, transcription, unalignedWords, etc...
            /*
            Products.insert({
              fwid: row.id,
              key: key || "Not specified",
              composer: tune.metaText.author || "Not specified" ,
              rhythm: tune.metaText.rhythm || "Not specified",
              source: tune.metaText.source || "Not specified",
              origin: tune.metaText.origin || "Not specified",
              book: tune.metaText.book || "Not specified",
              transcription: tune.metaText.transcription || "Not specified",
              userId: author._id,
              url: "http://www.folkwiki.se/Musik/"+row.id,
              name: row.name,
              tagline: result,
              createdAt: new Date()
            });
            */
            var product = new ProductsModel({
              fwid: row.id,
              key: key || "Not specified",
              composer: tune.metaText.author || "Not specified" ,
              rhythm: tune.metaText.rhythm || "Not specified",
              source: tune.metaText.source || "Not specified",
              origin: tune.metaText.origin || "Not specified",
              book: tune.metaText.book || "Not specified",
              transcription: tune.metaText.transcription || "Not specified",
              userId: author._id,
              url: "http://www.folkwiki.se/Musik/"+row.id,
              name: row.name,
              tagline: result,
              createdAt: new Date()

            });

            product.save();


          } catch (e) {
            console.log(e);
          }

      }






      /*Workouts.insert({id: row.id, Name: row.name, MediaUrl: "", Start: 0,
                End: 0,
                X: 1,
                M: "4/4",
                L: "1/8",
                K: "Emin",
                AbcNotation: result
              }, function(error, res) {
      //The insert will fail, error will be set,
      //and result will be undefined or false because "copies" is required.
      //
      //The list of errors is available on `error.invalidKeys` or by calling Weight.simpleSchema().namedContext().invalidKeys()
      if(error) {
            console.log(error.message);       
      }

    });*/



    //console.log(result);
    }




















































    /*_(products).each(function (product) {
      Products.insert({
        userId: author._id,
        url: product.url,
        name: product.name,
        tagline: product.tagline,
        createdAt: new Date()
      });
    });*/
  }
});
