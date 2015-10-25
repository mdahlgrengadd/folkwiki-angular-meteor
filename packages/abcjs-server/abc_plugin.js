//    abc_plugin.js: Find everything which looks like abc and convert it

//    Copyright (C) 2010 Gregory Dyke (gregdyke at gmail dot com)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

//    requires: abcjs, raphael, jquery

if (!ABCJS)
    ABCJS = {};

ABCJS.Plugin = function() {
    var is_user_script = false;
    try {
        is_user_script = abcjs_is_user_script;
    } catch (ex) {
    }
  /*
  this.tune = {};
  this.tunebook = {};
  this.engraver_controller = {};
  this.abcParser = {};
  this.paper = {};*/
  this.show_midi = true;//!is_user_script || this.$.browser.mozilla;   // midi currently only works in Firefox, so in the userscript, don't complicate it.
  this.hide_abc = true;
  this.render_before = false;
  this.midi_options = {};
  //this.parse_options = {};
  this.render_options = {};
  this.render_classname = "abcrendered";
  this.text_classname = "abctext";
  this.auto_render_threshold = 20;
  this.show_text = "show score for: ";
  //this.hide_text = "hide score for: ";
};

ABCJS.Plugin.prototype.init = function(jq) {
    this.$ = jq;
    var body = jq("body");
  this.errors="";
  var elems = this.getABCContainingElements(this.$("body"));
  var self = this;
  var divs = elems.map(function(i,elem){
      return self.convertToDivs(elem);
    });
  //this.auto_render = (divs.size()<=this.auto_render_threshold);
  //divs.each(function(i,elem){
  //    self.render(elem,self.$(elem).data("abctext"));
  //  });
};

// returns a jquery set of the descendants (including self) of elem which have a text node which matches "X:"
ABCJS.Plugin.prototype.getABCContainingElements = function(elem) {
  var results = this.$();
  var includeself = false; // whether self is already included (no need to include it again)
  var self = this;
  // TODO maybe look to see whether it's even worth it by using textContent ?
  this.$(elem).contents().each(function() { 
      if (this.nodeType == 3 && !includeself) {
    if (this.nodeValue.match(/^\s*X:/m)) {
        if (this.parentNode.tagName.toLowerCase() !== 'textarea') {
          results = results.add(self.$(elem));
          includeself = true;
        }
    }
      } else if (this.nodeType==1 && !self.$(this).is("textarea")) {
    results = results.add(self.getABCContainingElements(this));
      }
    });
  return results;
};

// in this element there are one or more pieces of abc 
// (and it is not in a subelem)
// for each abc piece, we surround it with a div, store the abctext in the 
// div's data("abctext") and return an array 
ABCJS.Plugin.prototype.convertToDivs = function (elem) {
  var self = this;
  var contents = this.$(elem).contents();
  var abctext = "";
  var abcdiv = null;
  var inabc = false;
  var brcount = 0;
  var results = this.$();
  contents.each(function(i,node){
      if (node.nodeType==3 && !node.nodeValue.match(/^\s*$/)) {
    brcount=0;
    var text = node.nodeValue;
    if (text.match(/^\s*X:/m)) {
      inabc=true;
      abctext="";
      abcdiv=self.$("<div class='"+self.text_classname+"'></div>");
      self.$(node).before(abcdiv);
      if (self.hide_abc) {
        abcdiv.hide();
      } 
    }
    if (inabc) {
      abctext += text.replace(/\n+/,"");
      abcdiv.append(self.$(node));
    } 
      } else if (inabc && self.$(node).is("br")) {
    abctext += "\n";
    abcdiv.append(self.$(node));
    brcount++;
      } else if (inabc && node.nodeType === 1) {
          abctext += "\n";
            abcdiv.append(self.$(node));
          // just swallow this.
      } else if (inabc) { // second br or whitespace textnode
    inabc = false;
    brcount=0;
    abctext = abctext.replace(/\n+/,"\n"); // get rid of extra blank lines
    abcdiv.data("abctext",abctext);
    results = results.add(abcdiv);
      }
    });
  if (inabc) {
      abctext = abctext.replace(/\n+$/,"\n").replace(/^\n+/,"\n"); // get rid of extra blank lines
    abcdiv.data("abctext",abctext);
    results = results.add(abcdiv);
  }
  return results.get();
};
ABCJS.Plugin.prototype.render = function (contextnode, abcstring) {
  var abcdiv = this.$("<div class='"+this.render_classname+"'></div>");
    $(".abcrendered").remove(); // clear old render

  if (this.render_before) {
    $(contextnode).before(abcdiv);
  } else {
    $(contextnode).after(abcdiv);
  }
  var self = this;
  try {
    if (this.debug) {
      alert("About to render:\n\n" + abcstring);
    }
    var tunebook = new ABCJS.TuneBook(abcstring);
    var abcParser = new ABCJS.parse.Parse();
    abcParser.parse(tunebook.tunes[0].abc);
    var tune = abcParser.getTune();
    tune.metaText = {}; // clear all metatext :-)

    var doPrint = function() {
  try {
    var paper = Raphael(abcdiv.get(0), 800, 400);
    var engraver_controller = new ABCJS.write.EngraverController(paper,self.render_options);
    engraver_controller.engraveABC(tune);
  } catch (ex) { // f*** internet explorer doesn't like innerHTML in weird situations
    // can't remember why we don't do this in the general case, but there was a good reason
    abcdiv.remove();
    abcdiv = $("<div class='"+self.render_classname+"'></div>");
    paper = Raphael(abcdiv.get(0), 800, 400);
    //engraver_controller = new ABCJS.write.EngraverController(paper);
    //engraver_controller.engraveABC(tune);
    engraver_controller = new ABCJS.write.Printer(paper);
    engraver_controller.printABC(tune);
    $(contextnode).html(abcdiv);
    /*if (self.render_before) {
      $(contextnode).before(abcdiv);
    } else {
      $(contextnode).after(abcdiv);
    }*/
  }

  /*if (ABCJS.MidiWriter && self.show_midi) {
    var midiwriter = new ABCJS.midi.MidiWriter(abcdiv.get(0),self.midi_options);
    midiwriter.writeABC(tune);
  }*/
      };

    var showtext = "<a class='abcshow' href='#'>"+this.show_text+(tune.metaText.title||"untitled")+"</a>";
    doPrint();
    showspan.hide();
    /*if (this.auto_render) {
      
    
    } else {
      var showspan = $(showtext);
      showspan.click(function(){
    doPrint();
    showspan.hide();
    return false;
  });
      abcdiv.before(showspan);
    }*/

    } catch (e) {
    this.errors+=e;
   }
};



ABCJS.Plugin.prototype.renderMartin = function (contextnode, abcstring) {
  var abcdiv = this.$("<div class='"+this.render_classname+"'></div>");
      this.$(contextnode).html(abcdiv);

      /*if (self.render_before) {
        this.$(contextnode).before(abcdiv);
      } else {
        this.$(contextnode).after(abcdiv);
      }*/
  var self = this;
  try {

    var tunebook = new ABCJS.TuneBook(abcstring);
    var abcParser = new ABCJS.parse.Parse();
    abcParser.parse(tunebook.tunes[0].abc);
    //if (!(tune instanceof ABCJS.data.Tune)) 
    var tune = abcParser.getTune();

    //tune.formatting = {topmargin: 0, botmargin: 0};
    var lines_backup = tune.lines;
    //this.$(contextnode).html("");

    //tune.metaText = {}; // clear all metatext :-)
    var doPrint = function() {
    //for (var i = lines_backup.length - 1; i >= 0; i--) {
        //tune.lines = lines_backup;//[lines_backup[i]];
        //tune.lines.splice(0, 1);

    
        try {
          var paper = Raphael(abcdiv.get(0), 800, 400);
          var engraver_controller = new ABCJS.write.Printer(paper,self.render_options);
          
          if (self.render_options.selectListener) {engraver_controller.addSelectListener(self.render_options.selectListener);}
          engraver_controller.printABC(tune);
        } catch (ex) { // f*** internet explorer doesn't like innerHTML in weird situations
          // can't remember why we don't do this in the general case, but there was a good reason
          abcdiv.remove();
          abcdiv = this.$("<div class='"+self.render_classname+"'></div>");
          paper = Raphael(abcdiv.get(0), 800, 400);
          engraver_controller = new ABCJS.write.Printer(paper);
          engraver_controller.printABC(tune);
          //this.$(contextnode).html(abcdiv);
          
          if (self.render_before) {
            this.$(contextnode).before(abcdiv);
          } else {
            this.$(contextnode).after(abcdiv);
          }
        }
    //};   
    /*if (ABCJS.MidiWriter && self.show_midi) {
      var midiwriter = new ABCJS.midi.MidiWriter(abcdiv.get(0),self.midi_options);
      midiwriter.writeABC(tune);
    }*/
      };

    //var showtext = "<a class='abcshow' href='#'>"+this.show_text+(tune.metaText.title||"untitled")+"</a>";
    
    doPrint();
    console.log(tune);
    /*if (this.auto_render) {
      doPrint();
    } else {
      var showspan = this.$(showtext);
      showspan.click(function(){
      doPrint();
      showspan.hide();
      return false;
    });
      abcdiv.before(showspan);
    }*/

    } catch (e) {
    this.errors+=e;
   }
};

ABCJS.Plugin.prototype.render_small_screen = function (contextnode, abcstring) {
  var abcdiv = this.$("<div class='"+this.render_classname+"'></div>");
    $(".abcrendered").remove(); // clear old render

  if (this.render_before) {
    $(contextnode).before(abcdiv);
  } else {
    $(contextnode).after(abcdiv);
  }
  var self = this;
  try {

    var tunebook = new ABCJS.TuneBook(abcstring);
    var abcParser = new ABCJS.parse.Parse();
    abcParser.parse(tunebook.tunes[0].abc);
    //if (!(tune instanceof ABCJS.data.Tune)) 
    var tune = abcParser.getTune();

    //tune.formatting = {topmargin: 0, botmargin: 0};
    var lines_backup = tune.lines;
    //this.$(contextnode).html("");

    var firstvoice = tune.lines[0].staff[0].voices[0];
    var firstnote = firstvoice[0].startChar;

    for (var j = tune.lines.length - 1; j >= 0; j--) {
        // Add line break after every 2 bars
        var voices = tune.lines[j].staff[0].voices[0];
        for (var i = voices.length - 1; i >= 0; i--) {
          if(voices[i].el_type === "bar" && i > 0) { //dont add line break if the bar element is the first element on a new staff line
            var position = voices[i].endChar;
            if (voices[i].startEnding) { // place [1 ....] [2....] at the beginning of staff on new line, otherwise it renders poorly
                position = voices[i].startChar; 
            } 
            
            var abcstring = [abcstring.slice(0, position), "\n", abcstring.slice(position)].join('');
          }
        };
    };

    var abcheader = abcstring.substring(0, firstnote-1);
    var abcsheet =  abcstring.substring(firstnote).replace(/^\s*[\r\n]/gm, ""); // remove linebreaks because we add or own later...

      arr = abcsheet.split("\n");
      //arr2 = doc.tagline.split("|");
      //console.log(arr2);
      //arr[0] = arr2[0];
      var str2 = "";
      //arr.push(" ");
      for (var i = 0; i <= arr.length - 2;  i=i+2) {
        str2 += arr[i] + arr[i+1] + "\n";
      };
      //str2 = arr.join("|\n");
      
         
    var reformattedAbc = abcheader + "\n" + str2;
    console.log("Reformatted------------\n"+reformattedAbc);

    tunebook = new ABCJS.TuneBook(reformattedAbc);
    abcParser = new ABCJS.parse.Parse();
    abcParser.parse(tunebook.tunes[0].abc);
    //if (!(tune instanceof ABCJS.data.Tune)) 
    tune = abcParser.getTune();
    tune.metaText = {}; // clear all metatext :-)

    var doPrint = function() {
  try {
    var paper = Raphael(abcdiv.get(0), 800, 400);
    var engraver_controller = new ABCJS.write.EngraverController(paper,self.render_options);
    engraver_controller.engraveABC(tune);
  } catch (ex) { // f*** internet explorer doesn't like innerHTML in weird situations
    // can't remember why we don't do this in the general case, but there was a good reason
    abcdiv.remove();
    abcdiv = $("<div class='"+self.render_classname+"'></div>");
    paper = Raphael(abcdiv.get(0), 800, 400);
    //engraver_controller = new ABCJS.write.EngraverController(paper);
    //engraver_controller.engraveABC(tune);
    engraver_controller = new ABCJS.write.Printer(paper);
    engraver_controller.printABC(tune);
    $(contextnode).html(abcdiv);
    /*if (self.render_before) {
      $(contextnode).before(abcdiv);
    } else {
      $(contextnode).after(abcdiv);
    }*/
  }

  /*if (ABCJS.MidiWriter && self.show_midi) {
    var midiwriter = new ABCJS.midi.MidiWriter(abcdiv.get(0),self.midi_options);
    midiwriter.writeABC(tune);
  }*/
      };

    var showtext = "<a class='abcshow' href='#'>"+this.show_text+(tune.metaText.title||"untitled")+"</a>";
    doPrint();
    showspan.hide();
    /*if (this.auto_render) {
      
    
    } else {
      var showspan = $(showtext);
      showspan.click(function(){
    doPrint();
    showspan.hide();
    return false;
  });
      abcdiv.before(showspan);
    }*/

    } catch (e) {
    this.errors+=e;
   }
};

ABCJS.Plugin.prototype.render_oneline = function (contextnode, abcstring) {
  var abcdiv = this.$("<div class='"+this.render_classname+"'></div>");
      this.$(contextnode).html(abcdiv);

      /*if (self.render_before) {
        this.$(contextnode).before(abcdiv);
      } else {
        this.$(contextnode).after(abcdiv);
      }*/
  var self = this;
  try {
    var tunebook = new ABCJS.TuneBook(abcstring);
    var abcParser = new ABCJS.parse.Parse();
    abcParser.parse(tunebook.tunes[0].abc);
    //if (!(tune instanceof ABCJS.data.Tune)) 
    var tune = abcParser.getTune();
    tune.metaText = {}; // clear all metatext :-)
    //console.log("***tune***");
    //console.log(tune);
    
    tune.lines = [tune.lines[0]]; // remove all but first line :-)

    // Crop the staff to only the first 2 bars....
    var newVoices = [];

    for (var i = 0; i <= tune.lines[0].staff.length - 1;  i++) {
      

          var voices = tune.lines[0].staff[i].voices[0];
          var maxBars = 4;
          var numnotes = 0
          for (numnotes = 0 ; (numnotes < voices.length - 1) && (maxBars > 0) ; numnotes++) {
             switch(voices[numnotes].el_type) {
              case "bar":
              maxBars--;
              break;
              default:
              break;
             }
           };

          var crop = voices.slice(0, numnotes);
          //console.log("notes: "+numnotes);
          tune.lines[0].staff[i].voices[0] = crop;
          //end crop
    };

    
    

      


    var doPrint = function() {
    try {
      var paper = Raphael(abcdiv.get(0), 800, 400);
      var engraver_controller = new ABCJS.write.Printer(paper,self.render_options);
      engraver_controller.printABC(tune);
    } catch (ex) { // f*** internet explorer doesn't like innerHTML in weird situations
      // can't remember why we don't do this in the general case, but there was a good reason
      abcdiv.remove();
      abcdiv = this.$("<div class='"+self.render_classname+"'></div>");
      paper = Raphael(abcdiv.get(0), 800, 400);
      engraver_controller = new ABCJS.write.Printer(paper);
      engraver_controller.printABC(tune);
      this.$(contextnode).html(abcdiv);

      /*if (self.render_before) {
        this.$(contextnode).before(abcdiv);
      } else {
        this.$(contextnode).after(abcdiv);
      }*/
    }
    if (ABCJS.MidiWriter && self.show_midi) {
      var midiwriter = new ABCJS.midi.MidiWriter(abcdiv.get(0),self.midi_options);
      midiwriter.writeABC(tune);
    }
      };

    var showtext = "<a class='abcshow' href='#'>"+this.show_text+(tune.metaText.title||"untitled")+"</a>";
    
    doPrint();  
    /*if (this.auto_render) {
      doPrint();
    } else {
      var showspan = this.$(showtext);
      showspan.click(function(){
      doPrint();
      showspan.hide();
      return false;
    });
      abcdiv.before(showspan);
    }*/

    } catch (e) {
    this.errors+=e;
   }
};


ABCJS.Plugin.prototype.render_oneline_small = function (contextnode, abcstring) {
  var abcdiv = this.$("<div class='"+this.render_classname+"'></div>");
      this.$(contextnode).html(abcdiv);

      /*if (self.render_before) {
        this.$(contextnode).before(abcdiv);
      } else {
        this.$(contextnode).after(abcdiv);
      }*/
  var self = this;
  try {
    var tunebook = new ABCJS.TuneBook(abcstring);
    var abcParser = new ABCJS.parse.Parse();
    abcParser.parse(tunebook.tunes[0].abc);
    //if (!(tune instanceof ABCJS.data.Tune)) 
    var tune = abcParser.getTune();
    tune.metaText = {}; // clear all metatext :-)
    //console.log("***tune***");
    //console.log(tune);
    
    tune.lines = [tune.lines[0]]; // remove all but first line :-)

    // Crop the staff to only the first 2 bars....
    var newVoices = [];

    for (var i = 0; i <= tune.lines[0].staff.length - 1;  i++) {
      

          var voices = tune.lines[0].staff[i].voices[0];
          var maxBars = 2;
          var numnotes = 0
          for (numnotes = 0 ; (numnotes < voices.length - 1) && (maxBars > 0) ; numnotes++) {
             switch(voices[numnotes].el_type) {
              case "bar":
              maxBars--;
              break;
              default:
              break;
             }
           };

          var crop = voices.slice(0, numnotes);
          //console.log("notes: "+numnotes);
          tune.lines[0].staff[i].voices[0] = crop;
          //end crop
    };

    
    

      


    var doPrint = function() {
    try {
      var paper = Raphael(abcdiv.get(0), 800, 400);
      var engraver_controller = new ABCJS.write.Printer(paper,self.render_options);
      engraver_controller.printABC(tune);
    } catch (ex) { // f*** internet explorer doesn't like innerHTML in weird situations
      // can't remember why we don't do this in the general case, but there was a good reason
      abcdiv.remove();
      abcdiv = this.$("<div class='"+self.render_classname+"'></div>");
      paper = Raphael(abcdiv.get(0), 800, 400);
      engraver_controller = new ABCJS.write.Printer(paper);
      engraver_controller.printABC(tune);
      this.$(contextnode).html(abcdiv);

      /*if (self.render_before) {
        this.$(contextnode).before(abcdiv);
      } else {
        this.$(contextnode).after(abcdiv);
      }*/
    }
    if (ABCJS.MidiWriter && self.show_midi) {
      var midiwriter = new ABCJS.midi.MidiWriter(abcdiv.get(0),self.midi_options);
      midiwriter.writeABC(tune);
    }
      };

    var showtext = "<a class='abcshow' href='#'>"+this.show_text+(tune.metaText.title||"untitled")+"</a>";
    
    doPrint();  
    /*if (this.auto_render) {
      doPrint();
    } else {
      var showspan = this.$(showtext);
      showspan.click(function(){
      doPrint();
      showspan.hide();
      return false;
    });
      abcdiv.before(showspan);
    }*/

    } catch (e) {
    this.errors+=e;
   }
};



ABCJS.plugin = new ABCJS.Plugin();

