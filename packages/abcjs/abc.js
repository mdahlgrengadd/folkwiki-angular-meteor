if (!ABCJS) {
    ABCJS = {}
}(function() {
    function a(g, f) {
        var j = g.getAttribute("class");
        var i = /[\t\r\n\f]/g;
        var h = " " + f + " ";
        return (g.nodeType === 1 && (" " + j + " ").replace(i, " ").indexOf(h) >= 0)
    }

    function e(l, g, f) {
        var k = l.getElementsByClassName(g);
        var h = [];
        for (var j = 0; j < k.length; j++) {
            if (a(k[j], f)) {
                h.push(k[j])
            }
        }
        return h
    }

    function b(g, f) {
        var h;
        if (f.bpm) {
            h = f.bpm
        } else {
            if (g && g.metaText && g.metaText.tempo && g.metaText.tempo.bpm) {
                h = g.metaText.tempo.bpm
            } else {
                h = 120
            }
        }
        return h
    }
    var d = false;
    var c;
    ABCJS.startAnimation = function(h, j, q) {
        if (h.getElementsByClassName === undefined) {
            console.error("ABCJS.startAnimation: The first parameter must be a regular DOM element. (Did you pass a jQuery object or an ID?)");
            return
        }
        if (j.getBeatLength === undefined) {
            console.error("ABCJS.startAnimation: The second parameter must be a single tune. (Did you pass the entire array of tunes?)");
            return
        }
        if (q.showCursor) {
            c = $('<div class="cursor" style="position: absolute;"></div>');
            $(h).append(c)
        }
        d = false;
        var r = b(j, q);
        var p = r / 60000;
        var m = j.getBeatLength();
        var g;

        function f(w, s) {
            var u = e(h, "l" + w, "m" + s);
            if (u.length > 0) {
                for (var t = 0; t < u.length; t++) {
                    var v = u[t];
                    if (!a(v, "bar")) {
                        v.style.display = "none"
                    }
                }
            }
        }

        function o(u) {
            var s = [];
            for (var t in u) {
                if (u.hasOwnProperty(t)) {
                    s.push(u[t])
                }
            }
            s = s.sort(function(w, v) {
                return w.time - v.time
            });
            return s
        }
        var k = [];

        function i(O) {
            var y = {};
            var x = 0;
            var w = false;
            for (var C = 0; C < O.staffgroups.length; C++) {
                var B = O.staffgroups[C];
                var z = B.voices;
                var H = B.y;
                var I = B.height;
                var F = 0;
                for (var E = 0; E < z.length; E++) {
                    var L = x;
                    var G = z[E].children;
                    for (var K = 0; K < G.length; K++) {
                        var t = G[K];
                        if (t.duration > 0) {
                            var N = t.startTie;
                            if (w) {
                                if (!N) {
                                    w = false
                                }
                            } else {
                                y["event" + L] = {
                                    type: "event",
                                    time: L,
                                    top: H,
                                    height: I,
                                    left: t.x,
                                    width: t.w
                                };
                                if (N) {
                                    w = true
                                }
                            }
                            L += t.duration
                        }
                        if (t.type === "bar") {
                            if (k.length === 0 || k[k.length - 1] !== "bar") {
                                if (t.elemset && t.elemset.length > 0 && t.elemset[0].attrs) {
                                    var D = t.elemset[0].attrs["class"];
                                    var s = D.split(" ");
                                    var M;
                                    var u;
                                    for (var J = 0; J < s.length; J++) {
                                        var A = /m(\d+)/.exec(s[J]);
                                        if (A) {
                                            u = A[1]
                                        }
                                        A = /l(\d+)/.exec(s[J]);
                                        if (A) {
                                            M = A[1]
                                        }
                                    }
                                    y["bar" + L] = {
                                        type: "bar",
                                        time: L,
                                        lineNum: M,
                                        measureNum: u
                                    }
                                }
                            }
                        }
                    }
                    F = Math.max(F, L)
                }
                x = F
            }
            k = o(y)
        }
        i(j.engraver);

        function l() {
            var s = k.shift();
            if (!s) {
                d = true;
                return 0
            }
            if (s.type === "bar") {
                if (q.hideFinishedMeasures) {
                    f(s.lineNum, s.measureNum)
                }
                return l()
            }
            if (q.showCursor) {
                c.css({
                    left: s.left + "px",
                    top: s.top + "px",
                    width: s.width + "px",
                    height: s.height + "px"
                })
            }
            if (k.length > 0) {
                return k[0].time / m
            }
            d = true;
            return 0
        }

        function n() {
            if (d) {
                ABCJS.stopAnimation();
                return
            }
            var t = l();
            var v = t / p;
            var u = new Date();
            u = u.getTime();
            var s = g + v - u;
            if (s <= 0) {
                n()
            } else {
                setTimeout(n, s)
            }
        }
        g = new Date();
        g = g.getTime();
        n()
    };
    ABCJS.stopAnimation = function() {
        d = true;
        if (c) {
            c.remove();
            c = null
        }
    }
})();
if (!ABCJS) {
    ABCJS = {}
}(function() {
    ABCJS.numberOfTunes = function(d) {
        var b = d.split("\nX:");
        var c = b.length;
        if (c === 0) {
            c = 1
        }
        return c
    };
    ABCJS.TuneBook = function(d) {
        var h = this;
        var g = "";
        d = ABCJS.parse.strip(d);
        var b = d.split("\nX:");
        for (var f = 1; f < b.length; f++) {
            b[f] = "X:" + b[f]
        }
        var j = 0;
        h.tunes = [];
        ABCJS.parse.each(b, function(i) {
            h.tunes.push({
                abc: i,
                startPos: j
            });
            j += i.length
        });
        if (h.tunes.length > 1 && !ABCJS.parse.startsWith(h.tunes[0].abc, "X:")) {
            var c = h.tunes.shift();
            var e = c.abc.split("\n");
            ABCJS.parse.each(e, function(i) {
                if (ABCJS.parse.startsWith(i, "%%")) {
                    g += i + "\n"
                }
            })
        }
        h.header = g;
        ABCJS.parse.each(h.tunes, function(k) {
            var i = k.abc.indexOf("\n\n");
            if (i > 0) {
                k.abc = k.abc.substring(0, i)
            }
            k.pure = k.abc;
            k.abc = g + k.abc;
            var l = k.pure.split("T:");
            if (l.length > 1) {
                l = l[1].split("\n");
                k.title = l[0].replace(/^\s+|\s+$/g, "")
            } else {
                k.title = ""
            }
            var m = k.pure.substring(2, k.pure.indexOf("\n"));
            k.id = m.replace(/^\s+|\s+$/g, "")
        })
    };
    ABCJS.TuneBook.prototype.getTuneById = function(c) {
        for (var b = 0; b < this.tunes.length; b++) {
            if (this.tunes[b].id === c) {
                return this.tunes[b]
            }
        }
        return null
    };
    ABCJS.TuneBook.prototype.getTuneByTitle = function(c) {
        for (var b = 0; b < this.tunes.length; b++) {
            if (this.tunes[b].title === c) {
                return this.tunes[b]
            }
        }
        return null
    };

    function a(o, e, n, l, d) {
        var m = [];
        var k = function(i) {
            return i && !(i.propertyIsEnumerable("length")) && typeof i === "object" && typeof i.length === "number"
        };
        if (e === undefined || n === undefined) {
            return
        }
        if (!k(e)) {
            e = [e]
        }
        if (l === undefined) {
            l = {}
        }
        if (d === undefined) {
            d = {}
        }
        var g = d.startingTune ? d.startingTune : 0;
        var f = new ABCJS.TuneBook(n);
        var c = new ABCJS.parse.Parse();
        for (var h = 0; h < e.length; h++) {
            var b = e[h];
            if (typeof(b) === "string") {
                b = document.getElementById(b)
            }
            if (b) {
                b.innerHTML = "";
                if (g < f.tunes.length) {
                    c.parse(f.tunes[g].abc, l);
                    var j = c.getTune();
                    m.push(j);
                    o(b, j)
                }
            }
            g++
        }
        return m
    }
    ABCJS.renderAbc = function(c, e, b, d, f) {
        function g(l, i) {
            var h = f ? f.width ? f.width : 800 : 800;
            var k = Raphael(l, h, 400);
            if (d === undefined) {
                d = {}
            }
            var j = new ABCJS.write.Printer(k, d);
            j.printABC(i);
            i.engraver = j
        }
        return a(g, c, e, b, f)
    };
    ABCJS.renderMidi = function(c, d, b, f, e) {
        function g(j, h) {
            if (f === undefined) {
                f = {}
            }
            var i = new ABCJS.midi.MidiWriter(j, f);
            i.writeABC(h)
        }
        return a(g, c, d, b, e)
    }
})();
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.data) {
    ABCJS.data = {}
}
ABCJS.data.Tune = function() {
    this.getBeatLength = function() {
        for (var c = 0; c < this.lines.length; c++) {
            if (this.lines[c].staff) {
                for (var b = 0; b < this.lines[c].staff.length; b++) {
                    if (this.lines[c].staff[b].meter) {
                        var d = this.lines[c].staff[b].meter;
                        if (d.type === "specified") {
                            if (d.value.length > 0) {
                                var a = parseInt(d.value[0].num, 10);
                                var e = parseInt(d.value[0].den, 10);
                                if (a === 6 && e === 8) {
                                    return 3 / 8
                                }
                                if (a === 9 && e === 8) {
                                    return 3 / 8
                                }
                                if (a === 12 && e === 8) {
                                    return 3 / 8
                                }
                                return 1 / e
                            } else {
                                return null
                            }
                        } else {
                            if (d.type === "cut_time") {
                                return 1 / 2
                            } else {
                                return 1 / 4
                            }
                        }
                    }
                }
            }
        }
        return null
    };
    this.reset = function() {
        this.version = "1.0.1";
        this.media = "screen";
        this.metaText = {};
        this.formatting = {};
        this.lines = [];
        this.staffNum = 0;
        this.voiceNum = 0;
        this.lineNum = 0
    };
    this.cleanUp = function(f, p, y, q) {
        this.closeLine();
        var b = false;
        var x, o, k;
        for (x = 0; x < this.lines.length; x++) {
            if (this.lines[x].staff !== undefined) {
                var m = false;
                for (o = 0; o < this.lines[x].staff.length; o++) {
                    if (this.lines[x].staff[o] === undefined) {
                        b = true;
                        this.lines[x].staff[o] = null
                    } else {
                        for (k = 0; k < this.lines[x].staff[o].voices.length; k++) {
                            if (this.lines[x].staff[o].voices[k] === undefined) {
                                this.lines[x].staff[o].voices[k] = []
                            } else {
                                if (this.containsNotes(this.lines[x].staff[o].voices[k])) {
                                    m = true
                                }
                            }
                        }
                    }
                }
                if (!m) {
                    this.lines[x] = null;
                    b = true
                }
            }
        }
        if (b) {
            this.lines = ABCJS.parse.compact(this.lines);
            ABCJS.parse.each(this.lines, function(i) {
                if (i.staff) {
                    i.staff = ABCJS.parse.compact(i.staff)
                }
            })
        }
        if (y) {
            for (x = 0; x < this.lines.length; x++) {
                if (this.lines[x].staff !== undefined) {
                    for (o = 0; o < this.lines[x].staff.length; o++) {
                        for (k = 0; k < this.lines[x].staff[o].voices.length; k++) {
                            var d = 0;
                            for (var t = 0; t < this.lines[x].staff[o].voices[k].length; t++) {
                                if (this.lines[x].staff[o].voices[k][t].el_type === "bar") {
                                    d++;
                                    if (d >= y) {
                                        if (t < this.lines[x].staff[o].voices[k].length - 1) {
                                            if (x === this.lines.length - 1) {
                                                var g = JSON.parse(JSON.stringify(this.lines[x]));
                                                this.lines.push(ABCJS.parse.clone(g));
                                                for (var u = 0; u < this.lines[x + 1].staff.length; u++) {
                                                    for (var r = 0; r < this.lines[x + 1].staff[u].voices.length; r++) {
                                                        this.lines[x + 1].staff[u].voices[r] = []
                                                    }
                                                }
                                            }
                                            var a = t + 1;
                                            var h = this.lines[x].staff[o].voices[k].slice(a);
                                            this.lines[x].staff[o].voices[k] = this.lines[x].staff[o].voices[k].slice(0, a);
                                            this.lines[x + 1].staff[o].voices[k] = h.concat(this.lines[x + 1].staff[o].voices[k])
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (y) {
            b = false;
            for (x = 0; x < this.lines.length; x++) {
                if (this.lines[x].staff !== undefined) {
                    for (o = 0; o < this.lines[x].staff.length; o++) {
                        var c = false;
                        for (k = 0; k < this.lines[x].staff[o].voices.length; k++) {
                            if (this.containsNotesStrict(this.lines[x].staff[o].voices[k])) {
                                c = true
                            }
                        }
                        if (!c) {
                            b = true;
                            this.lines[x].staff[o] = null
                        }
                    }
                }
            }
            if (b) {
                ABCJS.parse.each(this.lines, function(i) {
                    if (i.staff) {
                        i.staff = ABCJS.parse.compact(i.staff)
                    }
                })
            }
        }
        for (x = 0; x < this.lines.length; x++) {
            if (this.lines[x].staff) {
                for (o = 0; o < this.lines[x].staff.length; o++) {
                    delete this.lines[x].staff[o].workingClef
                }
            }
        }

        function l(K) {
            var J = [];
            var H;
            var I = function(N, j, P) {
                if (J[P] === undefined) {
                    for (H = 0; H < J.length; H++) {
                        if (J[H] !== undefined) {
                            P = H;
                            break
                        }
                    }
                    if (J[P] === undefined) {
                        var O = P * 100;
                        ABCJS.parse.each(N.endSlur, function(i) {
                            if (O === i) {
                                --O
                            }
                        });
                        J[P] = [O]
                    }
                }
                var M;
                for (var L = 0; L < j; L++) {
                    M = J[P].pop();
                    N.endSlur.push(M)
                }
                if (J[P].length === 0) {
                    delete J[P]
                }
                return M
            };
            var C = function(N, j, O, M) {
                N.startSlur = [];
                if (J[O] === undefined) {
                    J[O] = []
                }
                var P = O * 100 + 1;
                for (var L = 0; L < j; L++) {
                    if (M) {
                        ABCJS.parse.each(M, function(i) {
                            if (P === i) {
                                ++P
                            }
                        });
                        ABCJS.parse.each(M, function(i) {
                            if (P === i) {
                                ++P
                            }
                        });
                        ABCJS.parse.each(M, function(i) {
                            if (P === i) {
                                ++P
                            }
                        })
                    }
                    ABCJS.parse.each(J[O], function(i) {
                        if (P === i) {
                            ++P
                        }
                    });
                    ABCJS.parse.each(J[O], function(i) {
                        if (P === i) {
                            ++P
                        }
                    });
                    J[O].push(P);
                    N.startSlur.push({
                        label: P
                    });
                    P++
                }
            };
            for (var D = 0; D < K.length; D++) {
                var v = K[D];
                if (v.el_type === "note") {
                    if (v.gracenotes) {
                        for (var E = 0; E < v.gracenotes.length; E++) {
                            if (v.gracenotes[E].endSlur) {
                                var F = v.gracenotes[E].endSlur;
                                v.gracenotes[E].endSlur = [];
                                for (var n = 0; n < F; n++) {
                                    I(v.gracenotes[E], 1, 20)
                                }
                            }
                            if (v.gracenotes[E].startSlur) {
                                H = v.gracenotes[E].startSlur;
                                C(v.gracenotes[E], H, 20)
                            }
                        }
                    }
                    if (v.endSlur) {
                        H = v.endSlur;
                        v.endSlur = [];
                        I(v, H, 0)
                    }
                    if (v.startSlur) {
                        H = v.startSlur;
                        C(v, H, 0)
                    }
                    if (v.pitches) {
                        var G = [];
                        for (var s = 0; s < v.pitches.length; s++) {
                            if (v.pitches[s].endSlur) {
                                var A = v.pitches[s].endSlur;
                                v.pitches[s].endSlur = [];
                                for (var B = 0; B < A; B++) {
                                    var z = I(v.pitches[s], 1, s + 1);
                                    G.push(z)
                                }
                            }
                        }
                        for (s = 0; s < v.pitches.length; s++) {
                            if (v.pitches[s].startSlur) {
                                H = v.pitches[s].startSlur;
                                C(v.pitches[s], H, s + 1, G)
                            }
                        }
                        if (v.gracenotes && v.pitches[0].endSlur && v.pitches[0].endSlur[0] === 100 && v.pitches[0].startSlur) {
                            if (v.gracenotes[0].endSlur) {
                                v.gracenotes[0].endSlur.push(v.pitches[0].startSlur[0].label)
                            } else {
                                v.gracenotes[0].endSlur = [v.pitches[0].startSlur[0].label]
                            }
                            if (v.pitches[0].endSlur.length === 1) {
                                delete v.pitches[0].endSlur
                            } else {
                                if (v.pitches[0].endSlur[0] === 100) {
                                    v.pitches[0].endSlur.shift()
                                } else {
                                    if (v.pitches[0].endSlur[v.pitches[0].endSlur.length - 1] === 100) {
                                        v.pitches[0].endSlur.pop()
                                    }
                                }
                            }
                            if (J[1].length === 1) {
                                delete J[1]
                            } else {
                                J[1].pop()
                            }
                        }
                    }
                }
            }
        }

        function e(i) {
            ABCJS.parse.parseKeyVoice.fixClef(i)
        }
        for (this.lineNum = 0; this.lineNum < this.lines.length; this.lineNum++) {
            if (this.lines[this.lineNum].staff) {
                for (this.staffNum = 0; this.staffNum < this.lines[this.lineNum].staff.length; this.staffNum++) {
                    if (this.lines[this.lineNum].staff[this.staffNum].clef) {
                        e(this.lines[this.lineNum].staff[this.staffNum].clef)
                    }
                    for (this.voiceNum = 0; this.voiceNum < this.lines[this.lineNum].staff[this.staffNum].voices.length; this.voiceNum++) {
                        l(this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum]);
                        for (var w = 0; w < this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum].length; w++) {
                            if (this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum][w].el_type === "clef") {
                                e(this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum][w])
                            }
                        }
                    }
                }
            }
        }
        if (!this.formatting.pagewidth) {
            this.formatting.pagewidth = f
        }
        if (!this.formatting.pageheight) {
            this.formatting.pageheight = p
        }
        delete this.staffNum;
        delete this.voiceNum;
        delete this.lineNum;
        delete this.potentialStartBeam;
        delete this.potentialEndBeam;
        delete this.vskipPending
    };
    this.reset();
    this.getLastNote = function() {
        if (this.lines[this.lineNum] && this.lines[this.lineNum].staff && this.lines[this.lineNum].staff[this.staffNum] && this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum]) {
            for (var a = this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum].length - 1; a >= 0; a--) {
                var b = this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum][a];
                if (b.el_type === "note") {
                    return b
                }
            }
        }
        return null
    };
    this.addTieToLastNote = function() {
        var a = this.getLastNote();
        if (a && a.pitches && a.pitches.length > 0) {
            a.pitches[0].startTie = {};
            return true
        }
        return false
    };
    this.getDuration = function(a) {
        if (a.duration) {
            return a.duration
        }
        return 0
    };
    this.closeLine = function() {
        if (this.potentialStartBeam && this.potentialEndBeam) {
            this.potentialStartBeam.startBeam = true;
            this.potentialEndBeam.endBeam = true
        }
        delete this.potentialStartBeam;
        delete this.potentialEndBeam
    };
    this.appendElement = function(h, i, e, a) {
        var c = this;
        var g = function(l) {
            if (l.pitches !== undefined) {
                var j = c.lines[c.lineNum].staff[c.staffNum].workingClef.verticalPos;
                ABCJS.parse.each(l.pitches, function(m) {
                    m.verticalPos = m.pitch - j
                })
            }
            if (l.gracenotes !== undefined) {
                var k = c.lines[c.lineNum].staff[c.staffNum].workingClef.verticalPos;
                ABCJS.parse.each(l.gracenotes, function(m) {
                    m.verticalPos = m.pitch - k
                })
            }
            c.lines[c.lineNum].staff[c.staffNum].voices[c.voiceNum].push(l)
        };
        a.el_type = h;
        if (i !== null) {
            a.startChar = i
        }
        if (e !== null) {
            a.endChar = e
        }
        var d = function() {
            c.potentialStartBeam.startBeam = true;
            a.endBeam = true;
            delete c.potentialStartBeam;
            delete c.potentialEndBeam
        };
        var f = function() {
            if (c.potentialStartBeam !== undefined && c.potentialEndBeam !== undefined) {
                c.potentialStartBeam.startBeam = true;
                c.potentialEndBeam.endBeam = true
            }
            delete c.potentialStartBeam;
            delete c.potentialEndBeam
        };
        if (h === "note") {
            var b = c.getDuration(a);
            if (b >= 0.25) {
                f()
            } else {
                if (a.force_end_beam_last && c.potentialStartBeam !== undefined) {
                    f()
                } else {
                    if (a.end_beam && c.potentialStartBeam !== undefined) {
                        if (a.rest === undefined) {
                            d()
                        } else {
                            f()
                        }
                    } else {
                        if (a.rest === undefined) {
                            if (c.potentialStartBeam === undefined) {
                                if (!a.end_beam) {
                                    c.potentialStartBeam = a;
                                    delete c.potentialEndBeam
                                }
                            } else {
                                c.potentialEndBeam = a
                            }
                        }
                    }
                }
            }
        } else {
            f()
        }
        delete a.end_beam;
        delete a.force_end_beam_last;
        g(a)
    };
    this.appendStartingElement = function(f, a, h, c) {
        this.closeLine();
        var e;
        if (f === "key") {
            e = c.impliedNaturals;
            delete c.impliedNaturals
        }
        var b = ABCJS.parse.clone(c);
        if (f === "clef") {
            this.lines[this.lineNum].staff[this.staffNum].workingClef = b
        }
        if (this.lines[this.lineNum].staff.length <= this.staffNum) {
            this.lines[this.lineNum].staff[this.staffNum] = {};
            this.lines[this.lineNum].staff[this.staffNum].clef = ABCJS.parse.clone(this.lines[this.lineNum].staff[0].clef);
            this.lines[this.lineNum].staff[this.staffNum].key = ABCJS.parse.clone(this.lines[this.lineNum].staff[0].key);
            this.lines[this.lineNum].staff[this.staffNum].meter = ABCJS.parse.clone(this.lines[this.lineNum].staff[0].meter);
            this.lines[this.lineNum].staff[this.staffNum].workingClef = ABCJS.parse.clone(this.lines[this.lineNum].staff[0].workingClef);
            this.lines[this.lineNum].staff[this.staffNum].voices = [
                []
            ]
        }
        var g = this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum];
        for (var d = 0; d < g.length; d++) {
            if (g[d].el_type === "note" || g[d].el_type === "bar") {
                b.el_type = f;
                b.startChar = a;
                b.endChar = h;
                if (e) {
                    b.accidentals = e.concat(b.accidentals)
                }
                g.push(b);
                return
            }
            if (g[d].el_type === f) {
                b.el_type = f;
                b.startChar = a;
                b.endChar = h;
                if (e) {
                    b.accidentals = e.concat(b.accidentals)
                }
                g[d] = b;
                return
            }
        }
        this.lines[this.lineNum].staff[this.staffNum][f] = c
    };
    this.getNumLines = function() {
        return this.lines.length
    };
    this.pushLine = function(a) {
        if (this.vskipPending) {
            a.vskip = this.vskipPending;
            delete this.vskipPending
        }
        this.lines.push(a)
    };
    this.addSubtitle = function(a) {
        this.pushLine({
            subtitle: a
        })
    };
    this.addSpacing = function(a) {
        this.vskipPending = a
    };
    this.addNewPage = function(a) {
        this.pushLine({
            newpage: a
        })
    };
    this.addSeparator = function(c, b, a) {
        this.pushLine({
            separator: {
                spaceAbove: c,
                spaceBelow: b,
                lineLength: a
            }
        })
    };
    this.addText = function(a) {
        this.pushLine({
            text: a
        })
    };
    this.addCentered = function(a) {
        this.pushLine({
            text: [{
                text: a,
                center: true
            }]
        })
    };
    this.containsNotes = function(b) {
        for (var a = 0; a < b.length; a++) {
            if (b[a].el_type === "note" || b[a].el_type === "bar") {
                return true
            }
        }
        return false
    };
    this.containsNotesStrict = function(b) {
        for (var a = 0; a < b.length; a++) {
            if (b[a].el_type === "note" && b[a].rest === undefined) {
                return true
            }
        }
        return false
    };
    this.startNewLine = function(e) {
        var d = this;
        this.closeLine();
        var c = function(j) {
            d.lines[d.lineNum].staff[d.staffNum].voices[d.voiceNum] = [];
            if (d.isFirstLine(d.lineNum)) {
                if (j.name) {
                    if (!d.lines[d.lineNum].staff[d.staffNum].title) {
                        d.lines[d.lineNum].staff[d.staffNum].title = []
                    }
                    d.lines[d.lineNum].staff[d.staffNum].title[d.voiceNum] = j.name
                }
            } else {
                if (j.subname) {
                    if (!d.lines[d.lineNum].staff[d.staffNum].title) {
                        d.lines[d.lineNum].staff[d.staffNum].title = []
                    }
                    d.lines[d.lineNum].staff[d.staffNum].title[d.voiceNum] = j.subname
                }
            }
            if (j.style) {
                d.appendElement("style", null, null, {
                    head: j.style
                })
            }
            if (j.stem) {
                d.appendElement("stem", null, null, {
                    direction: j.stem
                })
            } else {
                if (d.voiceNum > 0) {
                    if (d.lines[d.lineNum].staff[d.staffNum].voices[0] !== undefined) {
                        var g = false;
                        for (var f = 0; f < d.lines[d.lineNum].staff[d.staffNum].voices[0].length; f++) {
                            if (d.lines[d.lineNum].staff[d.staffNum].voices[0].el_type === "stem") {
                                g = true
                            }
                        }
                        if (!g) {
                            var h = {
                                el_type: "stem",
                                direction: "up"
                            };
                            d.lines[d.lineNum].staff[d.staffNum].voices[0].splice(0, 0, h)
                        }
                    }
                    d.appendElement("stem", null, null, {
                        direction: "down"
                    })
                }
            }
            if (j.scale) {
                d.appendElement("scale", null, null, {
                    size: j.scale
                })
            }
        };
        var a = function(f) {
            d.lines[d.lineNum].staff[d.staffNum] = {
                voices: [],
                clef: f.clef,
                key: f.key,
                workingClef: f.clef
            };
            if (f.vocalfont) {
                d.lines[d.lineNum].staff[d.staffNum].vocalfont = f.vocalfont
            }
            if (f.bracket) {
                d.lines[d.lineNum].staff[d.staffNum].bracket = f.bracket
            }
            if (f.brace) {
                d.lines[d.lineNum].staff[d.staffNum].brace = f.brace
            }
            if (f.connectBarLines) {
                d.lines[d.lineNum].staff[d.staffNum].connectBarLines = f.connectBarLines
            }
            c(f);
            if (f.part) {
                d.appendElement("part", f.startChar, f.endChar, {
                    title: f.part
                })
            }
            if (f.meter !== undefined) {
                d.lines[d.lineNum].staff[d.staffNum].meter = f.meter
            }
        };
        var b = function(f) {
            d.lines[d.lineNum] = {
                staff: []
            };
            a(f)
        };
        if (this.lines[this.lineNum] === undefined) {
            b(e)
        } else {
            if (this.lines[this.lineNum].staff === undefined) {
                this.lineNum++;
                this.startNewLine(e)
            } else {
                if (this.lines[this.lineNum].staff[this.staffNum] === undefined) {
                    a(e)
                } else {
                    if (this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum] === undefined) {
                        c(e)
                    } else {
                        if (!this.containsNotes(this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum])) {
                            return
                        } else {
                            this.lineNum++;
                            this.startNewLine(e)
                        }
                    }
                }
            }
        }
    };
    this.hasBeginMusic = function() {
        return this.lines.length > 0
    };
    this.isFirstLine = function(a) {
        for (var b = a - 1; b >= 0; b--) {
            if (this.lines[b].staff !== undefined) {
                return false
            }
        }
        return true
    };
    this.getCurrentVoice = function() {
        if (this.lines[this.lineNum] !== undefined && this.lines[this.lineNum].staff[this.staffNum] !== undefined && this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum] !== undefined) {
            return this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum]
        } else {
            return null
        }
    };
    this.setCurrentVoice = function(c, b) {
        this.staffNum = c;
        this.voiceNum = b;
        for (var a = 0; a < this.lines.length; a++) {
            if (this.lines[a].staff) {
                if (this.lines[a].staff[c] === undefined || this.lines[a].staff[c].voices[b] === undefined || !this.containsNotes(this.lines[a].staff[c].voices[b])) {
                    this.lineNum = a;
                    return
                }
            }
        }
        this.lineNum = a
    };
    this.addMetaText = function(a, b) {
        if (this.metaText[a] === undefined) {
            this.metaText[a] = b
        } else {
            this.metaText[a] += "\n" + b
        }
    };
    this.addMetaTextArray = function(a, b) {
        if (this.metaText[a] === undefined) {
            this.metaText[a] = [b]
        } else {
            this.metaText[a].push(b)
        }
    };
    this.addMetaTextObj = function(a, b) {
        this.metaText[a] = b
    }
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.midi) {
    ABCJS.midi = {}
}(function() {
    function a(j, i) {
        for (var h in i) {
            if (i.hasOwnProperty(h)) {
                j.setAttribute(h, i[h])
            }
        }
        return j
    }

    function g(h, i) {
        this.javamidi = h;
        this.qtmidi = i
    }
    g.prototype.setTempo = function(h) {
        this.javamidi.setTempo(h);
        this.qtmidi.setTempo(h)
    };
    g.prototype.startTrack = function() {
        this.javamidi.startTrack();
        this.qtmidi.startTrack()
    };
    g.prototype.endTrack = function() {
        this.javamidi.endTrack();
        this.qtmidi.endTrack()
    };
    g.prototype.setInstrument = function(h) {
        this.javamidi.setInstrument(h);
        this.qtmidi.setInstrument(h)
    };
    g.prototype.startNote = function(j, h, i) {
        this.javamidi.startNote(j, h, i);
        this.qtmidi.startNote(j, h, i)
    };
    g.prototype.endNote = function(i, h) {
        this.javamidi.endNote(i, h);
        this.qtmidi.endNote(i, h)
    };
    g.prototype.addRest = function(h) {
        this.javamidi.addRest(h);
        this.qtmidi.addRest(h)
    };
    g.prototype.embed = function(h) {
        this.javamidi.embed(h);
        this.qtmidi.embed(h, true)
    };

    function b(h) {
        this.playlist = [];
        this.trackcount = 0;
        this.timecount = 0;
        this.tempo = 60;
        this.midiapi = MIDIPlugin;
        this.midiwriter = h;
        this.noteOnAndChannel = "%90"
    }
    b.prototype.setTempo = function(h) {
        this.tempo = h
    };
    b.prototype.startTrack = function() {
        this.silencelength = 0;
        this.trackcount++;
        this.timecount = 0;
        this.playlistpos = 0;
        this.first = true;
        if (this.instrument) {
            this.setInstrument(this.instrument)
        }
        if (this.channel) {
            this.setChannel(this.channel)
        }
    };
    b.prototype.endTrack = function() {};
    b.prototype.setInstrument = function(h) {
        this.instrument = h;
        this.midiapi.setInstrument(h)
    };
    b.prototype.setChannel = function(h) {
        this.channel = h;
        this.midiapi.setChannel(h)
    };
    b.prototype.updatePos = function() {
        while (this.playlist[this.playlistpos] && this.playlist[this.playlistpos].time < this.timecount) {
            this.playlistpos++
        }
    };
    b.prototype.startNote = function(k, i, j) {
        this.timecount += this.silencelength;
        this.silencelength = 0;
        if (this.first) {}
        this.updatePos();
        var h = this;
        this.playlist.splice(this.playlistpos, 0, {
            time: this.timecount,
            funct: function() {
                h.midiapi.playNote(k);
                h.midiwriter.notifySelect(j)
            }
        })
    };
    b.prototype.endNote = function(j, i) {
        this.timecount += i;
        this.updatePos();
        var h = this;
        this.playlist.splice(this.playlistpos, 0, {
            time: this.timecount,
            funct: function() {
                h.midiapi.stopNote(j)
            }
        })
    };
    b.prototype.addRest = function(h) {
        this.silencelength += h
    };
    b.prototype.embed = function(i) {
        this.playlink = a(document.createElement("a"), {
            style: "border:1px solid black; margin:3px;"
        });
        this.playlink.innerHTML = "play";
        var h = this;
        this.playlink.onmousedown = function() {
            if (h.playing) {
                this.innerHTML = "play";
                h.pausePlay()
            } else {
                this.innerHTML = "pause";
                h.startPlay()
            }
        };
        i.appendChild(this.playlink);
        var j = a(document.createElement("a"), {
            style: "border:1px solid black; margin:3px;"
        });
        j.innerHTML = "stop";
        j.onmousedown = function() {
            h.stopPlay()
        };
        i.appendChild(j);
        this.i = 0;
        this.currenttime = 0;
        this.playing = false
    };
    b.prototype.stopPlay = function() {
        this.i = 0;
        this.currenttime = 0;
        this.pausePlay();
        this.playlink.innerHTML = "play"
    };
    b.prototype.startPlay = function() {
        this.playing = true;
        var h = this;
        this.ticksperinterval = 480 / 4;
        this.doPlay();
        this.playinterval = setInterval(function() {
            h.doPlay()
        }, (60000 / (this.tempo * 4)))
    };
    b.prototype.pausePlay = function() {
        this.playing = false;
        clearInterval(this.playinterval);
        this.midiapi.stopAllNotes()
    };
    b.prototype.doPlay = function() {
        while (this.playlist[this.i] && this.playlist[this.i].time <= this.currenttime) {
            this.playlist[this.i].funct();
            this.i++
        }
        if (this.playlist[this.i]) {
            this.currenttime += this.ticksperinterval
        } else {
            this.stopPlay()
        }
    };

    function d() {
        this.trackstrings = "";
        this.trackcount = 0;
        this.noteOnAndChannel = "%90"
    }
    d.prototype.setTempo = function(h) {
        if (this.trackcount === 0) {
            this.startTrack();
            this.track += "%00%FF%51%03" + c(Math.round(60000000 / h), 6);
            this.endTrack()
        }
    };
    d.prototype.startTrack = function() {
        this.track = "";
        this.silencelength = 0;
        this.trackcount++;
        this.first = true;
        if (this.instrument) {
            this.setInstrument(this.instrument)
        }
    };
    d.prototype.endTrack = function() {
        var h = c(this.track.length / 3 + 4, 8);
        this.track = "MTrk" + h + this.track + "%00%FF%2F%00";
        this.trackstrings += this.track
    };
    d.prototype.setInstrument = function(h) {
        if (this.track) {
            this.track = "%00%C0" + c(h, 2) + this.track
        } else {
            this.track = "%00%C0" + c(h, 2)
        }
        this.instrument = h
    };
    d.prototype.setChannel = function(h) {
        this.channel = h - 1;
        this.noteOnAndChannel = "%9" + this.channel.toString(16)
    };
    d.prototype.startNote = function(i, h) {
        this.track += e(this.silencelength);
        this.silencelength = 0;
        if (this.first) {
            this.first = false;
            this.track += this.noteOnAndChannel
        }
        this.track += "%" + i.toString(16) + "%" + h
    };
    d.prototype.endNote = function(i, h) {
        this.track += e(h);
        this.track += "%" + i.toString(16) + "%00"
    };
    d.prototype.addRest = function(h) {
        this.silencelength += h
    };
    d.prototype.embed = function(i, h) {
        var k = "data:audio/midi,MThd%00%00%00%06%00%01" + c(this.trackcount, 4) + "%01%e0" + this.trackstrings;
        var j = a(document.createElement("a"), {
            href: k
        });
        j.innerHTML = "download midi";
        i.insertBefore(j, i.firstChild);
        if (h) {
            return
        }
        var l = a(document.createElement("embed"), {
            src: k,
            type: "video/quicktime",
            controller: "true",
            autoplay: "false",
            loop: "false",
            enablejavascript: "true",
            style: "display:block; height: 20px;"
        });
        i.insertBefore(l, i.firstChild)
    };

    function f(k) {
        var h = "";
        for (var j = 0; j < k.length; j += 2) {
            h += "%";
            h += k.substr(j, 2)
        }
        return h
    }

    function c(j, i) {
        var h = j.toString(16);
        while (h.length < i) {
            h = "0" + h
        }
        return f(h)
    }

    function e(o) {
        var k = 0;
        var h = [];
        while (o !== 0) {
            h.push(o & 127);
            o = o >> 7
        }
        for (var j = h.length - 1; j >= 0; j--) {
            k = k << 8;
            var l = h[j];
            if (j !== 0) {
                l = l | 128
            }
            k = k | l
        }
        var m = k.toString(16).length;
        m += m % 2;
        return c(k, m)
    }
    ABCJS.midi.MidiWriter = function(i, h) {
        h = h || {};
        this.parent = i;
        this.scale = [0, 2, 4, 5, 7, 9, 11];
        this.restart = {
            line: 0,
            staff: 0,
            voice: 0,
            pos: 0
        };
        this.visited = {};
        this.multiplier = 1;
        this.next = null;
        this.qpm = h.qpm || 180;
        this.program = h.program || 2;
        this.noteOnAndChannel = "%90";
        this.javamidi = h.type === "java" || false;
        this.listeners = [];
        this.transpose = 0;
        if (this.javamidi) {
            MIDIPlugin = document.MIDIPlugin;
            setTimeout(function() {
                try {
                    MIDIPlugin.openPlugin()
                } catch (k) {
                    var j = document.createElement("a");
                    j.href = "http://java.sun.com/products/java-media/sound/soundbanks.html";
                    j.target = "_blank";
                    j.appendChild(document.createTextNode("Download Soundbank"));
                    i.appendChild(j)
                }
            }, 0)
        }
    };
    ABCJS.midi.MidiWriter.prototype.addListener = function(h) {
        this.listeners.push(h)
    };
    ABCJS.midi.MidiWriter.prototype.notifySelect = function(j) {
        for (var h = 0; h < this.listeners.length; h++) {
            this.listeners[h].notifySelect(j.abselem)
        }
    };
    ABCJS.midi.MidiWriter.prototype.getMark = function() {
        return {
            line: this.line,
            staff: this.staff,
            voice: this.voice,
            pos: this.pos
        }
    };
    ABCJS.midi.MidiWriter.prototype.getMarkString = function(h) {
        h = h || this;
        return "line" + h.line + "staff" + h.staff + "voice" + h.voice + "pos" + h.pos
    };
    ABCJS.midi.MidiWriter.prototype.goToMark = function(h) {
        this.line = h.line;
        this.staff = h.staff;
        this.voice = h.voice;
        this.pos = h.pos
    };
    ABCJS.midi.MidiWriter.prototype.markVisited = function() {
        this.lastmark = this.getMarkString();
        this.visited[this.lastmark] = true
    };
    ABCJS.midi.MidiWriter.prototype.isVisited = function() {
        if (this.visited[this.getMarkString()]) {
            return true
        }
        return false
    };
    ABCJS.midi.MidiWriter.prototype.setJumpMark = function(h) {
        this.visited[this.lastmark] = h
    };
    ABCJS.midi.MidiWriter.prototype.getJumpMark = function() {
        return this.visited[this.getMarkString()]
    };
    ABCJS.midi.MidiWriter.prototype.getLine = function() {
        return this.abctune.lines[this.line]
    };
    ABCJS.midi.MidiWriter.prototype.getStaff = function() {
        try {
            return this.getLine().staff[this.staff]
        } catch (h) {}
    };
    ABCJS.midi.MidiWriter.prototype.getVoice = function() {
        return this.getStaff().voices[this.voice]
    };
    ABCJS.midi.MidiWriter.prototype.getElem = function() {
        return this.getVoice()[this.pos]
    };
    ABCJS.midi.MidiWriter.prototype.writeABC = function(l) {
        try {
            this.midi = (this.javamidi) ? new g(new b(this), new d()) : new d();
            this.baraccidentals = [];
            this.abctune = l;
            this.baseduration = 480 * 4;
            if (l.formatting.midi && l.formatting.midi.transpose) {
                this.transpose = l.formatting.midi.transpose
            }
            if (l.formatting.midi && l.formatting.midi.program && l.formatting.midi.program.program) {
                this.midi.setInstrument(l.formatting.midi.program.program)
            } else {
                this.midi.setInstrument(this.program)
            }
            if (l.formatting.midi && l.formatting.midi.channel) {
                this.midi.setChannel(l.formatting.midi.channel)
            }
            if (l.metaText.tempo) {
                var k = 1 / 4;
                if (l.metaText.tempo.duration) {
                    k = l.metaText.tempo.duration[0]
                }
                var j = 60;
                if (l.metaText.tempo.bpm) {
                    j = l.metaText.tempo.bpm
                }
                this.qpm = j * k * 4
            }
            this.midi.setTempo(this.qpm);
            this.staffcount = 1;
            for (this.staff = 0; this.staff < this.staffcount; this.staff++) {
                this.voicecount = 1;
                for (this.voice = 0; this.voice < this.voicecount; this.voice++) {
                    this.midi.startTrack();
                    this.restart = {
                        line: 0,
                        staff: this.staff,
                        voice: this.voice,
                        pos: 0
                    };
                    this.next = null;
                    for (this.line = 0; this.line < l.lines.length; this.line++) {
                        var h = l.lines[this.line];
                        if (this.getLine().staff) {
                            this.writeABCLine()
                        }
                    }
                    this.midi.endTrack()
                }
            }
            this.midi.embed(this.parent)
        } catch (i) {
            this.parent.innerHTML = "Couldn't write midi: " + i
        }
    };
    ABCJS.midi.MidiWriter.prototype.writeABCLine = function() {
        this.staffcount = this.getLine().staff.length;
        this.voicecount = this.getStaff().voices.length;
        this.setKeySignature(this.getStaff().key);
        this.writeABCVoiceLine()
    };
    ABCJS.midi.MidiWriter.prototype.writeABCVoiceLine = function() {
        this.pos = 0;
        while (this.pos < this.getVoice().length) {
            this.writeABCElement(this.getElem());
            if (this.next) {
                this.goToMark(this.next);
                this.next = null;
                if (!this.getLine().staff) {
                    return
                }
            } else {
                this.pos++
            }
        }
    };
    ABCJS.midi.MidiWriter.prototype.writeABCElement = function(h) {
        var i;
        switch (h.el_type) {
            case "note":
                this.writeNote(h);
                break;
            case "key":
                this.setKeySignature(h);
                break;
            case "bar":
                this.handleBar(h);
                break;
            case "meter":
            case "clef":
                break;
            default:
        }
    };
    ABCJS.midi.MidiWriter.prototype.writeNote = function(m) {
        if (m.startTriplet) {
            if (m.startTriplet === 2) {
                this.multiplier = 3 / 2
            } else {
                this.multiplier = (m.startTriplet - 1) / m.startTriplet
            }
        }
        var h = m.duration * this.baseduration * this.multiplier;
        if (m.pitches) {
            var l = [];
            for (var j = 0; j < m.pitches.length; j++) {
                var k = m.pitches[j];
                var n = k.pitch;
                if (k.accidental) {
                    switch (k.accidental) {
                        case "sharp":
                            this.baraccidentals[n] = 1;
                            break;
                        case "flat":
                            this.baraccidentals[n] = -1;
                            break;
                        case "natural":
                            this.baraccidentals[n] = 0;
                            break;
                        case "dblsharp":
                            this.baraccidentals[n] = 2;
                            break;
                        case "dblflat":
                            this.baraccidentals[n] = -2;
                            break
                    }
                }
                l[j] = 60 + 12 * this.extractOctave(n) + this.scale[this.extractNote(n)];
                if (this.baraccidentals[n] !== undefined) {
                    l[j] += this.baraccidentals[n]
                } else {
                    l[j] += this.accidentals[this.extractNote(n)]
                }
                l[j] += this.transpose;
                this.midi.startNote(l[j], 64, m);
                if (k.startTie) {
                    this.tieduration = h
                }
            }
            for (j = 0; j < m.pitches.length; j++) {
                var k = m.pitches[j];
                var n = k.pitch + this.transpose;
                if (k.startTie) {
                    continue
                }
                if (k.endTie) {
                    this.midi.endNote(l[j], h + this.tieduration)
                } else {
                    this.midi.endNote(l[j], h)
                }
                h = 0;
                this.tieduration = 0
            }
        } else {
            if (m.rest && m.rest.type !== "spacer") {
                this.midi.addRest(h)
            }
        }
        if (m.endTriplet) {
            this.multiplier = 1
        }
    };
    ABCJS.midi.MidiWriter.prototype.handleBar = function(l) {
        this.baraccidentals = [];
        var m = (l.type === "bar_right_repeat" || l.type === "bar_dbl_repeat");
        var k = (l.startEnding) ? true : false;
        var h = (m || k);
        var j = (l.type === "bar_left_repeat" || l.type === "bar_dbl_repeat" || l.type === "bar_thick_thin" || l.type === "bar_thin_thick" || l.type === "bar_thin_thin" || l.type === "bar_right_repeat");
        var i = null;
        if (this.isVisited()) {
            i = this.getJumpMark()
        } else {
            if (k || m) {
                if (this.visited[this.lastmark] === true) {
                    this.setJumpMark(this.getMark())
                }
            }
            if (h) {
                this.markVisited()
            }
            if (m) {
                i = this.restart;
                this.setJumpMark(this.getMark())
            }
        }
        if (j) {
            this.restart = this.getMark()
        }
        if (i && this.getMarkString(i) !== this.getMarkString()) {
            this.next = i
        }
    };
    ABCJS.midi.MidiWriter.prototype.setKeySignature = function(h) {
        this.accidentals = [0, 0, 0, 0, 0, 0, 0];
        if (this.abctune.formatting.bagpipes) {
            h.accidentals = [{
                acc: "natural",
                note: "g"
            }, {
                acc: "sharp",
                note: "f"
            }, {
                acc: "sharp",
                note: "c"
            }]
        }
        if (!h.accidentals) {
            return
        }
        ABCJS.parse.each(h.accidentals, function(k) {
            var l = (k.acc === "sharp") ? 1 : (k.acc === "natural") ? 0 : -1;
            var j = k.note.toLowerCase();
            var i = this.extractNote(j.charCodeAt(0) - "c".charCodeAt(0));
            this.accidentals[i] += l
        }, this)
    };
    ABCJS.midi.MidiWriter.prototype.extractNote = function(h) {
        h = h % 7;
        if (h < 0) {
            h += 7
        }
        return h
    };
    ABCJS.midi.MidiWriter.prototype.extractOctave = function(h) {
        return Math.floor(h / 7)
    }
})();
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.parse) {
    ABCJS.parse = {}
}
ABCJS.parse.clone = function(c) {
    var a = {};
    for (var b in c) {
        if (c.hasOwnProperty(b)) {
            a[b] = c[b]
        }
    }
    return a
};
ABCJS.parse.gsub = function(c, b, a) {
    return c.split(b).join(a)
};
ABCJS.parse.strip = function(a) {
    return a.replace(/^\s+/, "").replace(/\s+$/, "")
};
ABCJS.parse.startsWith = function(b, a) {
    return b.indexOf(a) === 0
};
ABCJS.parse.endsWith = function(c, a) {
    var b = c.length - a.length;
    return b >= 0 && c.lastIndexOf(a) === b
};
ABCJS.parse.each = function(a, d, c) {
    for (var b = 0, e = a.length; b < e; b++) {
        d.apply(c, [a[b], b])
    }
};
ABCJS.parse.last = function(a) {
    if (a.length === 0) {
        return null
    }
    return a[a.length - 1]
};
ABCJS.parse.compact = function(a) {
    var b = [];
    for (var c = 0; c < a.length; c++) {
        if (a[c]) {
            b.push(a[c])
        }
    }
    return b
};
ABCJS.parse.detect = function(a, c) {
    for (var b = 0; b < a.length; b++) {
        if (c(a[b])) {
            return true
        }
    }
    return false
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.parse) {
    ABCJS.parse = {}
}
ABCJS.parse.Parse = function() {
    var f = new ABCJS.data.Tune();
    var o = new ABCJS.parse.tokenizer();
    this.getTune = function() {
        return f
    };
    var z = {
        reset: function() {
            for (var B in this) {
                if (this.hasOwnProperty(B) && typeof this[B] !== "function") {
                    delete this[B]
                }
            }
            this.iChar = 0;
            this.key = {
                accidentals: [],
                root: "none",
                acc: "",
                mode: ""
            };
            this.meter = {
                type: "specified",
                value: [{
                    num: "4",
                    den: "4"
                }]
            };
            this.origMeter = {
                type: "specified",
                value: [{
                    num: "4",
                    den: "4"
                }]
            };
            this.hasMainTitle = false;
            this.default_length = 0.125;
            this.clef = {
                type: "treble",
                verticalPos: 0
            };
            this.next_note_duration = 0;
            this.start_new_line = true;
            this.is_in_header = true;
            this.is_in_history = false;
            this.partForNextLine = "";
            this.havent_set_length = true;
            this.voices = {};
            this.staves = [];
            this.macros = {};
            this.currBarNumber = 1;
            this.inTextBlock = false;
            this.inPsBlock = false;
            this.ignoredDecorations = [];
            this.textBlock = "";
            this.score_is_present = false;
            this.inEnding = false;
            this.inTie = false;
            this.inTieChord = {}
        }
    };
    var A = function(B) {
        if (!z.warnings) {
            z.warnings = []
        }
        z.warnings.push(B)
    };
    var c = function(C) {
        var B = ABCJS.parse.gsub(C, "\x12", " ");
        B = ABCJS.parse.gsub(B, "&", "&amp;");
        B = ABCJS.parse.gsub(B, "<", "&lt;");
        return ABCJS.parse.gsub(B, ">", "&gt;")
    };
    var y = function(F, B, E) {
        var D = B.charAt(E);
        if (D === " ") {
            D = "SPACE"
        }
        var C = c(B.substring(0, E)) + '<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + D + "</span>" + c(B.substring(E + 1));
        A("Music Line:" + f.getNumLines() + ":" + (E + 1) + ": " + F + ":  " + C)
    };
    var v = new ABCJS.parse.ParseHeader(o, y, z, f);
    this.getWarnings = function() {
        return z.warnings
    };
    var u = function(D, E) {
        if (D.charAt(E) === '"') {
            var F = o.getBrackettedSubstring(D, E, 5);
            if (!F[2]) {
                y("Missing the closing quote while parsing the chord symbol", D, E)
            }
            if (F[0] > 0 && F[1].length > 0 && F[1].charAt(0) === "^") {
                F[1] = F[1].substring(1);
                F[2] = "above"
            } else {
                if (F[0] > 0 && F[1].length > 0 && F[1].charAt(0) === "_") {
                    F[1] = F[1].substring(1);
                    F[2] = "below"
                } else {
                    if (F[0] > 0 && F[1].length > 0 && F[1].charAt(0) === "<") {
                        F[1] = F[1].substring(1);
                        F[2] = "left"
                    } else {
                        if (F[0] > 0 && F[1].length > 0 && F[1].charAt(0) === ">") {
                            F[1] = F[1].substring(1);
                            F[2] = "right"
                        } else {
                            if (F[0] > 0 && F[1].length > 0 && F[1].charAt(0) === "@") {
                                F[1] = F[1].substring(1);
                                var B = o.getFloat(F[1]);
                                if (B.digits === 0) {
                                    y("Missing first position in absolutely positioned annotation.", D, E)
                                }
                                F[1] = F[1].substring(B.digits);
                                if (F[1][0] !== ",") {
                                    y("Missing comma absolutely positioned annotation.", D, E)
                                }
                                F[1] = F[1].substring(1);
                                var G = o.getFloat(F[1]);
                                if (G.digits === 0) {
                                    y("Missing second position in absolutely positioned annotation.", D, E)
                                }
                                F[1] = F[1].substring(G.digits);
                                var C = o.skipWhiteSpace(F[1]);
                                F[1] = F[1].substring(C);
                                F[2] = null;
                                F[3] = {
                                    x: B.value,
                                    y: G.value
                                }
                            } else {
                                F[1] = F[1].replace(/([ABCDEFG])b/g, "$1♭");
                                F[1] = F[1].replace(/([ABCDEFG])#/g, "$1♯");
                                F[2] = "default"
                            }
                        }
                    }
                }
            }
            return F
        }
        return [0, ""]
    };
    var q = ["trill", "lowermordent", "uppermordent", "mordent", "pralltriller", "accent", "fermata", "invertedfermata", "tenuto", "0", "1", "2", "3", "4", "5", "+", "wedge", "open", "thumb", "snap", "turn", "roll", "breath", "shortphrase", "mediumphrase", "longphrase", "segno", "coda", "D.S.", "D.C.", "fine", "crescendo(", "crescendo)", "diminuendo(", "diminuendo)", "p", "pp", "f", "ff", "mf", "mp", "ppp", "pppp", "fff", "ffff", "sfz", "repeatbar", "repeatbar2", "slide", "upbow", "downbow", "/", "//", "///", "////", "trem1", "trem2", "trem3", "trem4", "turnx", "invertedturn", "invertedturnx", "trill(", "trill)", "arpeggio", "xstem", "mark", "umarcato", "style=normal", "style=harmonic", "style=rhythm", "style=x"];
    var t = [
        ["<", "accent"],
        [">", "accent"],
        ["tr", "trill"],
        ["<(", "crescendo("],
        ["<)", "crescendo)"],
        [">(", "diminuendo("],
        [">)", "diminuendo)"],
        ["plus", "+"],
        ["emphasis", "accent"]
    ];
    var i = function(B, D) {
        var E = z.macros[B.charAt(D)];
        if (E !== undefined) {
            if (E.charAt(0) === "!" || E.charAt(0) === "+") {
                E = E.substring(1)
            }
            if (E.charAt(E.length - 1) === "!" || E.charAt(E.length - 1) === "+") {
                E = E.substring(0, E.length - 1)
            }
            if (ABCJS.parse.detect(q, function(F) {
                    return (E === F)
                })) {
                return [1, E]
            } else {
                if (!ABCJS.parse.detect(z.ignoredDecorations, function(F) {
                        return (E === F)
                    })) {
                    y("Unknown macro: " + E, B, D)
                }
                return [1, ""]
            }
        }
        switch (B.charAt(D)) {
            case ".":
                return [1, "staccato"];
            case "u":
                return [1, "upbow"];
            case "v":
                return [1, "downbow"];
            case "~":
                return [1, "irishroll"];
            case "!":
            case "+":
                var C = o.getBrackettedSubstring(B, D, 5);
                if (C[1].length > 0 && (C[1].charAt(0) === "^" || C[1].charAt(0) === "_")) {
                    C[1] = C[1].substring(1)
                }
                if (ABCJS.parse.detect(q, function(F) {
                        return (C[1] === F)
                    })) {
                    return C
                }
                if (ABCJS.parse.detect(t, function(F) {
                        if (C[1] === F[0]) {
                            C[1] = F[1];
                            return true
                        } else {
                            return false
                        }
                    })) {
                    return C
                }
                if (B.charAt(D) === "!" && (C[0] === 1 || B.charAt(D + C[0] - 1) !== "!")) {
                    return [1, null]
                }
                y("Unknown decoration: " + C[1], B, D);
                C[1] = "";
                return C;
            case "H":
                return [1, "fermata"];
            case "J":
                return [1, "slide"];
            case "L":
                return [1, "accent"];
            case "M":
                return [1, "mordent"];
            case "O":
                return [1, "coda"];
            case "P":
                return [1, "pralltriller"];
            case "R":
                return [1, "roll"];
            case "S":
                return [1, "segno"];
            case "T":
                return [1, "trill"]
        }
        return [0, 0]
    };
    var e = function(B, C) {
        var D = C;
        while (o.isWhiteSpace(B.charAt(C))) {
            C++
        }
        return [C - D]
    };
    var s = function(D, G) {
        var E = o.getBarLine(D, G);
        if (E.len === 0) {
            return [0, ""]
        }
        if (E.warn) {
            y(E.warn, D, G);
            return [E.len, ""]
        }
        for (var C = 0; C < D.length; C++) {
            if (D.charAt(G + E.len + C) !== " ") {
                break
            }
        }
        var H = E.len;
        if (D.charAt(G + E.len + C) === "[") {
            E.len += C + 1
        }
        if (D.charAt(G + E.len) === '"' && D.charAt(G + E.len - 1) === "[") {
            var B = o.getBrackettedSubstring(D, G + E.len, 5);
            return [E.len + B[0], E.token, B[1]]
        }
        var F = o.getTokenOf(D.substring(G + E.len), "1234567890-,");
        if (F.len === 0 || F.token[0] === "-") {
            return [H, E.token]
        }
        return [E.len + F.len, E.token, F.token]
    };
    var p = function(B, D) {
        var C = {};
        var E = D;
        while (B.charAt(D) === "(" || o.isWhiteSpace(B.charAt(D))) {
            if (B.charAt(D) === "(") {
                if (D + 1 < B.length && (B.charAt(D + 1) >= "2" && B.charAt(D + 1) <= "9")) {
                    if (C.triplet !== undefined) {
                        y("Can't nest triplets", B, D)
                    } else {
                        C.triplet = B.charAt(D + 1) - "0";
                        if (D + 2 < B.length && B.charAt(D + 2) === ":") {
                            if (D + 3 < B.length && B.charAt(D + 3) === ":") {
                                if (D + 4 < B.length && (B.charAt(D + 4) >= "1" && B.charAt(D + 4) <= "9")) {
                                    C.num_notes = B.charAt(D + 4) - "0";
                                    D += 3
                                } else {
                                    y("expected number after the two colons after the triplet to mark the duration", B, D)
                                }
                            } else {
                                if (D + 3 < B.length && (B.charAt(D + 3) >= "1" && B.charAt(D + 3) <= "9")) {
                                    if (D + 4 < B.length && B.charAt(D + 4) === ":") {
                                        if (D + 5 < B.length && (B.charAt(D + 5) >= "1" && B.charAt(D + 5) <= "9")) {
                                            C.num_notes = B.charAt(D + 5) - "0";
                                            D += 4
                                        }
                                    } else {
                                        C.num_notes = C.triplet;
                                        D += 3
                                    }
                                } else {
                                    y("expected number after the triplet to mark the duration", B, D)
                                }
                            }
                        }
                    }
                    D++
                } else {
                    if (C.startSlur === undefined) {
                        C.startSlur = 1
                    } else {
                        C.startSlur++
                    }
                }
            }
            D++
        }
        C.consumed = D - E;
        return C
    };
    var n = function(C, I) {
        if (!C) {
            y("Can't add words before the first line of mulsic", C, 0);
            return
        }
        I = ABCJS.parse.strip(I);
        if (I.charAt(I.length - 1) !== "-") {
            I = I + " "
        }
        var H = [];
        var G = 0;
        var E = false;
        var B = function(J) {
            var K = ABCJS.parse.strip(I.substring(G, J));
            G = J + 1;
            if (K.length > 0) {
                if (E) {
                    K = ABCJS.parse.gsub(K, "~", " ")
                }
                var L = I.charAt(J);
                if (L !== "_" && L !== "-") {
                    L = " "
                }
                H.push({
                    syllable: o.translateString(K),
                    divider: L
                });
                E = false;
                return true
            }
            return false
        };
        for (var D = 0; D < I.length; D++) {
            switch (I.charAt(D)) {
                case " ":
                case "\x12":
                    B(D);
                    break;
                case "-":
                    if (!B(D) && H.length > 0) {
                        ABCJS.parse.last(H).divider = "-";
                        H.push({
                            skip: true,
                            to: "next"
                        })
                    }
                    break;
                case "_":
                    B(D);
                    H.push({
                        skip: true,
                        to: "slur"
                    });
                    break;
                case "*":
                    B(D);
                    H.push({
                        skip: true,
                        to: "next"
                    });
                    break;
                case "|":
                    B(D);
                    H.push({
                        skip: true,
                        to: "bar"
                    });
                    break;
                case "~":
                    E = true;
                    break
            }
        }
        var F = false;
        ABCJS.parse.each(C, function(K) {
            if (H.length !== 0) {
                if (H[0].skip) {
                    switch (H[0].to) {
                        case "next":
                            if (K.el_type === "note" && K.pitches !== null && !F) {
                                H.shift()
                            }
                            break;
                        case "slur":
                            if (K.el_type === "note" && K.pitches !== null) {
                                H.shift()
                            }
                            break;
                        case "bar":
                            if (K.el_type === "bar") {
                                H.shift()
                            }
                            break
                    }
                } else {
                    if (K.el_type === "note" && K.rest === undefined && !F) {
                        var J = H.shift();
                        if (K.lyric === undefined) {
                            K.lyric = [J]
                        } else {
                            K.lyric.push(J)
                        }
                    }
                }
            }
        })
    };
    var d = function(C, I) {
        if (!C) {
            y("Can't add symbols before the first line of mulsic", C, 0);
            return
        }
        I = ABCJS.parse.strip(I);
        if (I.charAt(I.length - 1) !== "-") {
            I = I + " "
        }
        var H = [];
        var G = 0;
        var E = false;
        var B = function(J) {
            var K = ABCJS.parse.strip(I.substring(G, J));
            G = J + 1;
            if (K.length > 0) {
                if (E) {
                    K = ABCJS.parse.gsub(K, "~", " ")
                }
                var L = I.charAt(J);
                if (L !== "_" && L !== "-") {
                    L = " "
                }
                H.push({
                    syllable: o.translateString(K),
                    divider: L
                });
                E = false;
                return true
            }
            return false
        };
        for (var D = 0; D < I.length; D++) {
            switch (I.charAt(D)) {
                case " ":
                case "\x12":
                    B(D);
                    break;
                case "-":
                    if (!B(D) && H.length > 0) {
                        ABCJS.parse.last(H).divider = "-";
                        H.push({
                            skip: true,
                            to: "next"
                        })
                    }
                    break;
                case "_":
                    B(D);
                    H.push({
                        skip: true,
                        to: "slur"
                    });
                    break;
                case "*":
                    B(D);
                    H.push({
                        skip: true,
                        to: "next"
                    });
                    break;
                case "|":
                    B(D);
                    H.push({
                        skip: true,
                        to: "bar"
                    });
                    break;
                case "~":
                    E = true;
                    break
            }
        }
        var F = false;
        ABCJS.parse.each(C, function(K) {
            if (H.length !== 0) {
                if (H[0].skip) {
                    switch (H[0].to) {
                        case "next":
                            if (K.el_type === "note" && K.pitches !== null && !F) {
                                H.shift()
                            }
                            break;
                        case "slur":
                            if (K.el_type === "note" && K.pitches !== null) {
                                H.shift()
                            }
                            break;
                        case "bar":
                            if (K.el_type === "bar") {
                                H.shift()
                            }
                            break
                    }
                } else {
                    if (K.el_type === "note" && K.rest === undefined && !F) {
                        var J = H.shift();
                        if (K.lyric === undefined) {
                            K.lyric = [J]
                        } else {
                            K.lyric.push(J)
                        }
                    }
                }
            }
        })
    };
    var b = function(B, C) {
        switch (B.charAt(C)) {
            case ">":
                if (C < B.length - 1 && B.charAt(C + 1) === ">") {
                    return [2, 1.75, 0.25]
                } else {
                    return [1, 1.5, 0.5]
                }
                break;
            case "<":
                if (C < B.length - 1 && B.charAt(C + 1) === "<") {
                    return [2, 0.25, 1.75]
                } else {
                    return [1, 0.5, 1.5]
                }
                break
        }
        return null
    };
    var g = function(B) {
        if (B.duration !== undefined && B.duration < 0.25) {
            B.end_beam = true
        }
        return B
    };
    var k = {
        A: 5,
        B: 6,
        C: 0,
        D: 1,
        E: 2,
        F: 3,
        G: 4,
        a: 12,
        b: 13,
        c: 7,
        d: 8,
        e: 9,
        f: 10,
        g: 11
    };
    var a = {
        x: "invisible",
        y: "spacer",
        z: "rest",
        Z: "multimeasure"
    };
    var j = function(K, H, D, B) {
        var I = function(L) {
            return (L === "octave" || L === "duration" || L === "Zduration" || L === "broken_rhythm" || L === "end_slur")
        };
        var C = "startSlur";
        var E = false;
        while (1) {
            switch (K.charAt(H)) {
                case "(":
                    if (C === "startSlur") {
                        if (D.startSlur === undefined) {
                            D.startSlur = 1
                        } else {
                            D.startSlur++
                        }
                    } else {
                        if (I(C)) {
                            D.endChar = H;
                            return D
                        } else {
                            return null
                        }
                    }
                    break;
                case ")":
                    if (I(C)) {
                        if (D.endSlur === undefined) {
                            D.endSlur = 1
                        } else {
                            D.endSlur++
                        }
                    } else {
                        return null
                    }
                    break;
                case "^":
                    if (C === "startSlur") {
                        D.accidental = "sharp";
                        C = "sharp2"
                    } else {
                        if (C === "sharp2") {
                            D.accidental = "dblsharp";
                            C = "pitch"
                        } else {
                            if (I(C)) {
                                D.endChar = H;
                                return D
                            } else {
                                return null
                            }
                        }
                    }
                    break;
                case "_":
                    if (C === "startSlur") {
                        D.accidental = "flat";
                        C = "flat2"
                    } else {
                        if (C === "flat2") {
                            D.accidental = "dblflat";
                            C = "pitch"
                        } else {
                            if (I(C)) {
                                D.endChar = H;
                                return D
                            } else {
                                return null
                            }
                        }
                    }
                    break;
                case "=":
                    if (C === "startSlur") {
                        D.accidental = "natural";
                        C = "pitch"
                    } else {
                        if (I(C)) {
                            D.endChar = H;
                            return D
                        } else {
                            return null
                        }
                    }
                    break;
                case "A":
                case "B":
                case "C":
                case "D":
                case "E":
                case "F":
                case "G":
                case "a":
                case "b":
                case "c":
                case "d":
                case "e":
                case "f":
                case "g":
                    if (C === "startSlur" || C === "sharp2" || C === "flat2" || C === "pitch") {
                        D.pitch = k[K.charAt(H)];
                        C = "octave";
                        if (B && z.next_note_duration !== 0) {
                            D.duration = z.next_note_duration;
                            z.next_note_duration = 0;
                            E = true
                        } else {
                            D.duration = z.default_length
                        }
                    } else {
                        if (I(C)) {
                            D.endChar = H;
                            return D
                        } else {
                            return null
                        }
                    }
                    break;
                case ",":
                    if (C === "octave") {
                        D.pitch -= 7
                    } else {
                        if (I(C)) {
                            D.endChar = H;
                            return D
                        } else {
                            return null
                        }
                    }
                    break;
                case "'":
                    if (C === "octave") {
                        D.pitch += 7
                    } else {
                        if (I(C)) {
                            D.endChar = H;
                            return D
                        } else {
                            return null
                        }
                    }
                    break;
                case "x":
                case "y":
                case "z":
                case "Z":
                    if (C === "startSlur") {
                        D.rest = {
                            type: a[K.charAt(H)]
                        };
                        delete D.accidental;
                        delete D.startSlur;
                        delete D.startTie;
                        delete D.endSlur;
                        delete D.endTie;
                        delete D.end_beam;
                        delete D.grace_notes;
                        if (D.rest.type === "multimeasure") {
                            D.duration = 1;
                            C = "Zduration"
                        } else {
                            if (B && z.next_note_duration !== 0) {
                                D.duration = z.next_note_duration;
                                z.next_note_duration = 0;
                                E = true
                            } else {
                                D.duration = z.default_length
                            }
                            C = "duration"
                        }
                    } else {
                        if (I(C)) {
                            D.endChar = H;
                            return D
                        } else {
                            return null
                        }
                    }
                    break;
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                case "0":
                case "/":
                    if (C === "octave" || C === "duration") {
                        var J = o.getFraction(K, H);
                        if (!E) {
                            D.duration = D.duration * J.value
                        }
                        D.endChar = J.index;
                        while (J.index < K.length && (o.isWhiteSpace(K.charAt(J.index)) || K.charAt(J.index) === "-")) {
                            if (K.charAt(J.index) === "-") {
                                D.startTie = {}
                            } else {
                                D = g(D)
                            }
                            J.index++
                        }
                        H = J.index - 1;
                        C = "broken_rhythm"
                    } else {
                        if (C === "sharp2") {
                            D.accidental = "quartersharp";
                            C = "pitch"
                        } else {
                            if (C === "flat2") {
                                D.accidental = "quarterflat";
                                C = "pitch"
                            } else {
                                if (C === "Zduration") {
                                    var G = o.getNumber(K, H);
                                    D.duration = G.num;
                                    D.endChar = G.index;
                                    return D
                                } else {
                                    return null
                                }
                            }
                        }
                    }
                    break;
                case "-":
                    if (C === "startSlur") {
                        f.addTieToLastNote();
                        D.endTie = true
                    } else {
                        if (C === "octave" || C === "duration" || C === "end_slur") {
                            D.startTie = {};
                            if (!E && B) {
                                C = "broken_rhythm"
                            } else {
                                if (o.isWhiteSpace(K.charAt(H + 1))) {
                                    g(D)
                                }
                                D.endChar = H + 1;
                                return D
                            }
                        } else {
                            if (C === "broken_rhythm") {
                                D.endChar = H;
                                return D
                            } else {
                                return null
                            }
                        }
                    }
                    break;
                case " ":
                case "\t":
                    if (I(C)) {
                        D.end_beam = true;
                        do {
                            if (K.charAt(H) === "-") {
                                D.startTie = {}
                            }
                            H++
                        } while (H < K.length && (o.isWhiteSpace(K.charAt(H)) || K.charAt(H) === "-"));
                        D.endChar = H;
                        if (!E && B && (K.charAt(H) === "<" || K.charAt(H) === ">")) {
                            H--;
                            C = "broken_rhythm"
                        } else {
                            return D
                        }
                    } else {
                        return null
                    }
                    break;
                case ">":
                case "<":
                    if (I(C)) {
                        if (B) {
                            var F = b(K, H);
                            H += F[0] - 1;
                            z.next_note_duration = F[2] * D.duration;
                            D.duration = F[1] * D.duration;
                            C = "end_slur"
                        } else {
                            D.endChar = H;
                            return D
                        }
                    } else {
                        return null
                    }
                    break;
                default:
                    if (I(C)) {
                        D.endChar = H;
                        return D
                    }
                    return null
            }
            H++;
            if (H === K.length) {
                if (I(C)) {
                    D.endChar = H;
                    return D
                } else {
                    return null
                }
            }
        }
        return null
    };

    function w() {
        var C = {
            startChar: -1,
            endChar: -1
        };
        if (z.partForNextLine.length) {
            C.part = z.partForNextLine
        }
        C.clef = z.currentVoice && z.staves[z.currentVoice.staffNum].clef !== undefined ? ABCJS.parse.clone(z.staves[z.currentVoice.staffNum].clef) : ABCJS.parse.clone(z.clef);
        C.key = ABCJS.parse.parseKeyVoice.deepCopyKey(z.key);
        ABCJS.parse.parseKeyVoice.addPosToKey(C.clef, C.key);
        if (z.meter !== null) {
            if (z.currentVoice) {
                ABCJS.parse.each(z.staves, function(D) {
                    D.meter = z.meter
                });
                C.meter = z.staves[z.currentVoice.staffNum].meter;
                z.staves[z.currentVoice.staffNum].meter = null
            } else {
                C.meter = z.meter
            }
            z.meter = null
        } else {
            if (z.currentVoice && z.staves[z.currentVoice.staffNum].meter) {
                C.meter = z.staves[z.currentVoice.staffNum].meter;
                z.staves[z.currentVoice.staffNum].meter = null
            }
        }
        if (z.currentVoice && z.currentVoice.name) {
            C.name = z.currentVoice.name
        }
        if (z.vocalfont) {
            C.vocalfont = z.vocalfont
        }
        if (z.style) {
            C.style = z.style
        }
        if (z.currentVoice) {
            var B = z.staves[z.currentVoice.staffNum];
            if (B.brace) {
                C.brace = B.brace
            }
            if (B.bracket) {
                C.bracket = B.bracket
            }
            if (B.connectBarLines) {
                C.connectBarLines = B.connectBarLines
            }
            if (B.name) {
                C.name = B.name[z.currentVoice.index]
            }
            if (B.subname) {
                C.subname = B.subname[z.currentVoice.index]
            }
            if (z.currentVoice.stem) {
                C.stem = z.currentVoice.stem
            }
            if (z.currentVoice.scale) {
                C.scale = z.currentVoice.scale
            }
            if (z.currentVoice.style) {
                C.style = z.currentVoice.style
            }
        }
        f.startNewLine(C);
        z.partForNextLine = "";
        if (z.currentVoice === undefined || (z.currentVoice.staffNum === z.staves.length - 1 && z.staves[z.currentVoice.staffNum].numVoices - 1 === z.currentVoice.index)) {
            if (z.barNumbers === 0) {
                z.barNumOnNextNote = z.currBarNumber
            }
        }
    }
    var x = function(C, E) {
        if (C.charAt(E) === "{") {
            var D = o.getBrackettedSubstring(C, E, 1, "}");
            if (!D[2]) {
                y("Missing the closing '}' while parsing grace note", C, E)
            }
            if (C[E + D[0]] === ")") {
                D[0] ++;
                D[1] += ")"
            }
            var B = [];
            var G = 0;
            var H = false;
            while (G < D[1].length) {
                var I = false;
                if (D[1].charAt(G) === "/") {
                    I = true;
                    G++
                }
                var F = j(D[1], G, {}, false);
                if (F !== null) {
                    if (I) {
                        F.acciaccatura = true
                    }
                    B.push(F);
                    if (H) {
                        F.endTie = true;
                        H = false
                    }
                    if (F.startTie) {
                        H = true
                    }
                    G = F.endChar;
                    delete F.endChar
                } else {
                    if (D[1].charAt(G) === " ") {
                        if (B.length > 0) {
                            B[B.length - 1].end_beam = true
                        }
                    } else {
                        y("Unknown character '" + D[1].charAt(G) + "' while parsing grace note", C, E)
                    }
                    G++
                }
            }
            if (B.length) {
                return [D[0], B]
            }
        }
        return [0]
    };

    function h(B) {
        var C = B.origMeter;
        if (!C || C.type !== "specified") {
            return 1
        }
        if (!C.value || C.value.length === 0) {
            return 1
        }
        return parseInt(C.value[0].num, 10) / parseInt(C.value[0].den, 10)
    }
    var r = "ABCDEFGabcdefgxyzZ[]|^_{";
    var m = function(L) {
        v.resolveTempo();
        z.is_in_header = false;
        var S = 0;
        var R = z.iChar;
        while (o.isWhiteSpace(L.charAt(S)) && S < L.length) {
            S++
        }
        if (S === L.length || L.charAt(S) === "%") {
            return
        }
        var V = z.start_new_line;
        if (z.continueall === undefined) {
            z.start_new_line = true
        } else {
            z.start_new_line = false
        }
        var I = 0;
        var O = v.letter_to_body_header(L, S);
        if (O[0] > 0) {
            S += O[0]
        }
        var D = {};
        while (S < L.length) {
            var E = S;
            if (L.charAt(S) === "%") {
                break
            }
            var C = v.letter_to_inline_header(L, S);
            if (C[0] > 0) {
                S += C[0]
            } else {
                if (V) {
                    w();
                    V = false
                }
                var X;
                while (1) {
                    X = o.eatWhiteSpace(L, S);
                    if (X > 0) {
                        S += X
                    }
                    if (S > 0 && L.charAt(S - 1) === "\x12") {
                        X = v.letter_to_body_header(L, S);
                        if (X[0] > 0) {
                            S = X[0];
                            z.start_new_line = false
                        }
                    }
                    X = e(L, S);
                    if (X[0] > 0) {
                        S += X[0]
                    }
                    X = u(L, S);
                    if (X[0] > 0) {
                        if (!D.chord) {
                            D.chord = []
                        }
                        var H = o.translateString(X[1]);
                        H = H.replace(/;/g, "\n");
                        var G = false;
                        for (var M = 0; M < D.chord.length; M++) {
                            if (D.chord[M].position === X[2]) {
                                G = true;
                                D.chord[M].name += "\n" + H
                            }
                        }
                        if (G === false) {
                            if (X[2] === null && X[3]) {
                                D.chord.push({
                                    name: H,
                                    rel_position: X[3]
                                })
                            } else {
                                D.chord.push({
                                    name: H,
                                    position: X[2]
                                })
                            }
                        }
                        S += X[0];
                        var N = o.skipWhiteSpace(L.substring(S));
                        if (N > 0) {
                            D.force_end_beam_last = true
                        }
                        S += N
                    } else {
                        if (r.indexOf(L.charAt(S)) === -1) {
                            X = i(L, S)
                        } else {
                            X = [0]
                        }
                        if (X[0] > 0) {
                            if (X[1] === null) {
                                if (S + 1 < L.length) {
                                    w()
                                }
                            } else {
                                if (X[1].length > 0) {
                                    if (D.decoration === undefined) {
                                        D.decoration = []
                                    }
                                    D.decoration.push(X[1])
                                }
                            }
                            S += X[0]
                        } else {
                            X = x(L, S);
                            if (X[0] > 0) {
                                D.gracenotes = X[1];
                                S += X[0]
                            } else {
                                break
                            }
                        }
                    }
                }
                X = s(L, S);
                if (X[0] > 0) {
                    if (D.gracenotes !== undefined) {
                        D.rest = {
                            type: "spacer"
                        };
                        D.duration = 0.125;
                        f.appendElement("note", R + S, R + S + X[0], D);
                        z.measureNotEmpty = true;
                        D = {}
                    }
                    var U = {
                        type: X[1]
                    };
                    if (U.type.length === 0) {
                        y("Unknown bar type", L, S)
                    } else {
                        if (z.inEnding && U.type !== "bar_thin") {
                            U.endEnding = true;
                            z.inEnding = false
                        }
                        if (X[2]) {
                            U.startEnding = X[2];
                            if (z.inEnding) {
                                U.endEnding = true
                            }
                            z.inEnding = true
                        }
                        if (D.decoration !== undefined) {
                            U.decoration = D.decoration
                        }
                        if (D.chord !== undefined) {
                            U.chord = D.chord
                        }
                        if (U.startEnding && z.barFirstEndingNum === undefined) {
                            z.barFirstEndingNum = z.currBarNumber
                        } else {
                            if (U.startEnding && U.endEnding && z.barFirstEndingNum) {
                                z.currBarNumber = z.barFirstEndingNum
                            } else {
                                if (U.endEnding) {
                                    z.barFirstEndingNum = undefined
                                }
                            }
                        }
                        if (U.type !== "bar_invisible" && z.measureNotEmpty) {
                            z.currBarNumber++;
                            if (z.barNumbers && z.currBarNumber % z.barNumbers === 0) {
                                z.barNumOnNextNote = z.currBarNumber
                            }
                        }
                        f.appendElement("bar", R + S, R + S + X[0], U);
                        z.measureNotEmpty = false;
                        D = {}
                    }
                    S += X[0]
                } else {
                    if (L[S] === "&") {
                        y("Overlay not yet supported", L, S);
                        S++
                    } else {
                        X = p(L, S);
                        if (X.consumed > 0) {
                            if (X.startSlur !== undefined) {
                                D.startSlur = X.startSlur
                            }
                            if (X.triplet !== undefined) {
                                if (I > 0) {
                                    y("Can't nest triplets", L, S)
                                } else {
                                    D.startTriplet = X.triplet;
                                    I = X.num_notes === undefined ? X.triplet : X.num_notes
                                }
                            }
                            S += X.consumed
                        }
                        if (L.charAt(S) === "[") {
                            S++;
                            var B = null;
                            var Q = false;
                            while (!Q) {
                                var K = j(L, S, {}, false);
                                if (K !== null) {
                                    if (K.end_beam) {
                                        D.end_beam = true;
                                        delete K.end_beam
                                    }
                                    if (D.pitches === undefined) {
                                        D.duration = K.duration;
                                        D.pitches = [K]
                                    } else {
                                        D.pitches.push(K)
                                    }
                                    delete K.duration;
                                    if (z.inTieChord[D.pitches.length]) {
                                        K.endTie = true;
                                        z.inTieChord[D.pitches.length] = undefined
                                    }
                                    if (K.startTie) {
                                        z.inTieChord[D.pitches.length] = true
                                    }
                                    S = K.endChar;
                                    delete K.endChar
                                } else {
                                    if (L.charAt(S) === " ") {
                                        y("Spaces are not allowed in chords", L, S);
                                        S++
                                    } else {
                                        if (S < L.length && L.charAt(S) === "]") {
                                            S++;
                                            if (z.next_note_duration !== 0) {
                                                D.duration = D.duration * z.next_note_duration;
                                                z.next_note_duration = 0
                                            }
                                            if (z.inTie) {
                                                ABCJS.parse.each(D.pitches, function(Y) {
                                                    Y.endTie = true
                                                });
                                                z.inTie = false
                                            }
                                            if (I > 0) {
                                                I--;
                                                if (I === 0) {
                                                    D.endTriplet = true
                                                }
                                            }
                                            var J = false;
                                            while (S < L.length && !J) {
                                                switch (L.charAt(S)) {
                                                    case " ":
                                                    case "\t":
                                                        g(D);
                                                        break;
                                                    case ")":
                                                        if (D.endSlur === undefined) {
                                                            D.endSlur = 1
                                                        } else {
                                                            D.endSlur++
                                                        }
                                                        break;
                                                    case "-":
                                                        ABCJS.parse.each(D.pitches, function(Y) {
                                                            Y.startTie = {}
                                                        });
                                                        z.inTie = true;
                                                        break;
                                                    case ">":
                                                    case "<":
                                                        var W = b(L, S);
                                                        S += W[0] - 1;
                                                        z.next_note_duration = W[2];
                                                        B = W[1];
                                                        break;
                                                    case "1":
                                                    case "2":
                                                    case "3":
                                                    case "4":
                                                    case "5":
                                                    case "6":
                                                    case "7":
                                                    case "8":
                                                    case "9":
                                                    case "/":
                                                        var F = o.getFraction(L, S);
                                                        B = F.value;
                                                        S = F.index;
                                                        if (L.charAt(S) === "-" || L.charAt(S) === ")") {
                                                            S--
                                                        } else {
                                                            J = true
                                                        }
                                                        break;
                                                    default:
                                                        J = true;
                                                        break
                                                }
                                                if (!J) {
                                                    S++
                                                }
                                            }
                                        } else {
                                            y("Expected ']' to end the chords", L, S)
                                        }
                                        if (D.pitches !== undefined) {
                                            if (B !== null) {
                                                D.duration = D.duration * B
                                            }
                                            if (z.barNumOnNextNote) {
                                                D.barNumber = z.barNumOnNextNote;
                                                z.barNumOnNextNote = null
                                            }
                                            f.appendElement("note", R + S, R + S, D);
                                            z.measureNotEmpty = true;
                                            D = {}
                                        }
                                        Q = true
                                    }
                                }
                            }
                        } else {
                            var P = {};
                            var T = j(L, S, P, true);
                            if (P.endTie !== undefined) {
                                z.inTie = true
                            }
                            if (T !== null) {
                                if (T.pitch !== undefined) {
                                    D.pitches = [{}];
                                    if (T.accidental !== undefined) {
                                        D.pitches[0].accidental = T.accidental
                                    }
                                    D.pitches[0].pitch = T.pitch;
                                    if (T.endSlur !== undefined) {
                                        D.pitches[0].endSlur = T.endSlur
                                    }
                                    if (T.endTie !== undefined) {
                                        D.pitches[0].endTie = T.endTie
                                    }
                                    if (T.startSlur !== undefined) {
                                        D.pitches[0].startSlur = T.startSlur
                                    }
                                    if (D.startSlur !== undefined) {
                                        D.pitches[0].startSlur = D.startSlur
                                    }
                                    if (T.startTie !== undefined) {
                                        D.pitches[0].startTie = T.startTie
                                    }
                                    if (D.startTie !== undefined) {
                                        D.pitches[0].startTie = D.startTie
                                    }
                                } else {
                                    D.rest = T.rest;
                                    if (T.endSlur !== undefined) {
                                        D.endSlur = T.endSlur
                                    }
                                    if (T.endTie !== undefined) {
                                        D.rest.endTie = T.endTie
                                    }
                                    if (T.startSlur !== undefined) {
                                        D.startSlur = T.startSlur
                                    }
                                    if (T.startTie !== undefined) {
                                        D.rest.startTie = T.startTie
                                    }
                                    if (D.startTie !== undefined) {
                                        D.rest.startTie = D.startTie
                                    }
                                }
                                if (T.chord !== undefined) {
                                    D.chord = T.chord
                                }
                                if (T.duration !== undefined) {
                                    D.duration = T.duration
                                }
                                if (T.decoration !== undefined) {
                                    D.decoration = T.decoration
                                }
                                if (T.graceNotes !== undefined) {
                                    D.graceNotes = T.graceNotes
                                }
                                delete D.startSlur;
                                if (z.inTie) {
                                    if (D.pitches !== undefined) {
                                        D.pitches[0].endTie = true
                                    } else {
                                        D.rest.endTie = true
                                    }
                                    z.inTie = false
                                }
                                if (T.startTie || D.startTie) {
                                    z.inTie = true
                                }
                                S = T.endChar;
                                if (I > 0) {
                                    I--;
                                    if (I === 0) {
                                        D.endTriplet = true
                                    }
                                }
                                if (T.end_beam) {
                                    g(D)
                                }
                                if (D.rest && D.rest.type === "rest" && D.duration === 1) {
                                    D.rest.type = "whole";
                                    D.duration = h(z)
                                }
                                if (z.barNumOnNextNote) {
                                    D.barNumber = z.barNumOnNextNote;
                                    z.barNumOnNextNote = null
                                }
                                f.appendElement("note", R + E, R + S, D);
                                z.measureNotEmpty = true;
                                D = {}
                            }
                        }
                        if (S === E) {
                            if (L.charAt(S) !== " " && L.charAt(S) !== "`") {
                                y("Unknown character ignored", L, S)
                            }
                            S++
                        }
                    }
                }
            }
        }
    };
    var l = function(B) {
        var C = v.parseHeader(B);
        if (C.regular) {
            m(C.str)
        }
        if (C.newline && z.continueall === undefined) {
            w()
        }
        if (C.words) {
            n(f.getCurrentVoice(), B.substring(2))
        }
        if (C.symbols) {
            d(f.getCurrentVoice(), B.substring(2))
        }
        if (C.recurse) {
            l(C.str)
        }
    };
    this.parse = function(H, F) {
        f.reset();
        if (F && F.print) {
            f.media = "print"
        }
        z.reset();
        v.reset(o, y, z, f);
        H = ABCJS.parse.gsub(H, "\r\n", "\n");
        H = ABCJS.parse.gsub(H, "\r", "\n");
        H += "\n";
        H = H.replace(/\n\\.*\n/g, "\n");
        var D = function(K, M, N) {
            var J = "                                                                                                                                                                                                     ";
            var L = N ? J.substring(0, N.length) : "";
            return M + " \x12" + L
        };
        H = H.replace(/\\([ \t]*)(%.*)*\n/g, D);
        var C = H.split("\n");
        if (ABCJS.parse.last(C).length === 0) {
            C.pop()
        }
        try {
            ABCJS.parse.each(C, function(J) {
                if (F) {
                    if (F.header_only && z.is_in_header === false) {
                        throw "normal_abort"
                    }
                    if (F.stop_on_warning && z.warnings) {
                        throw "normal_abort"
                    }
                }
                if (z.is_in_history) {
                    if (J.charAt(1) === ":") {
                        z.is_in_history = false;
                        l(J)
                    } else {
                        f.addMetaText("history", o.translateString(o.stripComment(J)))
                    }
                } else {
                    if (z.inTextBlock) {
                        if (ABCJS.parse.startsWith(J, "%%endtext")) {
                            f.addText(z.textBlock);
                            z.inTextBlock = false
                        } else {
                            if (ABCJS.parse.startsWith(J, "%%")) {
                                z.textBlock += " " + J.substring(2)
                            } else {
                                z.textBlock += " " + J
                            }
                        }
                    } else {
                        if (z.inPsBlock) {
                            if (ABCJS.parse.startsWith(J, "%%endps")) {
                                z.inPsBlock = false
                            } else {
                                z.textBlock += " " + J
                            }
                        } else {
                            l(J)
                        }
                    }
                }
                z.iChar += J.length + 1
            });
            var I = 11 * 72;
            var E = 8.5 * 72;
            switch (z.papersize) {
                case "legal":
                    I = 14 * 72;
                    E = 8.5 * 72;
                    break;
                case "A4":
                    I = 11.7 * 72;
                    E = 8.3 * 72;
                    break
            }
            if (z.landscape) {
                var B = I;
                I = E;
                E = B
            }
            f.cleanUp(E, I, z.barsperstaff, z.staffnonote)
        } catch (G) {
            if (G !== "normal_abort") {
                throw G
            }
        }
    }
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.parse) {
    ABCJS.parse = {}
}
ABCJS.parse.parseDirective = {};
(function() {
    var b;
    var d;
    var a;
    var c;
    ABCJS.parse.parseDirective.initialize = function(h, f, g, e) {
        b = h;
        d = f;
        a = g;
        c = e
    };
    ABCJS.parse.parseDirective.parseFontChangeLine = function(g) {
        var e = g.split("$");
        if (e.length > 1 && a.setfont) {
            var h = [{
                text: e[0]
            }];
            for (var f = 1; f < e.length; f++) {
                if (e[f].charAt(0) === "0") {
                    h.push({
                        text: e[f].substring(1)
                    })
                } else {
                    if (e[f].charAt(0) === "1" && a.setfont[1]) {
                        h.push({
                            font: a.setfont[1],
                            text: e[f].substring(1)
                        })
                    } else {
                        if (e[f].charAt(0) === "2" && a.setfont[2]) {
                            h.push({
                                font: a.setfont[2],
                                text: e[f].substring(1)
                            })
                        } else {
                            if (e[f].charAt(0) === "3" && a.setfont[3]) {
                                h.push({
                                    font: a.setfont[3],
                                    text: e[f].substring(1)
                                })
                            } else {
                                if (e[f].charAt(0) === "4" && a.setfont[4]) {
                                    h.push({
                                        font: a.setfont[4],
                                        text: e[f].substring(1)
                                    })
                                } else {
                                    h[h.length - 1].text += "$" + e[f]
                                }
                            }
                        }
                    }
                }
            }
            if (h.length > 1) {
                return h
            }
        }
        return g
    };
    ABCJS.parse.parseDirective.addDirective = function(O) {
        var X = function(t, ai) {
            var p = b.getMeasurement(ai);
            if (p.used === 0 || ai.length !== 0) {
                return {
                    error: 'Directive "' + t + '" requires a measurement as a parameter.'
                }
            }
            return p.value
        };
        var T = function(t, ai) {
            var p = b.getMeasurement(ai);
            if (p.used === 0 || ai.length !== 0) {
                return 'Directive "' + t + '" requires a measurement as a parameter.'
            }
            c.formatting[t] = p.value;
            return null
        };
        var D = function(aj) {
            var p = {};
            var t = ABCJS.parse.last(aj);
            if (t.type === "number") {
                p.size = parseInt(t.token);
                aj.pop()
            }
            if (aj.length > 0) {
                var ai = "";
                ABCJS.parse.each(aj, function(ak) {
                    if (ak.token !== "-") {
                        if (ai.length > 0) {
                            ai += " "
                        }
                        ai += ak.token
                    }
                });
                p.font = ai
            }
            return p
        };
        var k = function(p, t) {
            if (t.length === 0) {
                return 'Directive "' + p + '" requires a font as a parameter.'
            }
            a[p] = D(t);
            return null
        };
        var r = function(p, t) {
            if (t.length === 0) {
                return 'Directive "' + p + '" requires a font as a parameter.'
            }
            c.formatting[p] = D(t);
            return null
        };
        var g = function(aj, ak, al, ai, p) {
            if (al.length !== 1 || al[0].type !== "number") {
                return 'Directive "' + ak + '" requires a number as a parameter.'
            }
            var t = al[0].intt;
            if (ai !== undefined && t < ai) {
                return 'Directive "' + ak + '" requires a number greater than or equal to ' + ai + " as a parameter."
            }
            if (p !== undefined && t > p) {
                return 'Directive "' + ak + '" requires a number less than or equal to ' + p + " as a parameter."
            }
            a[aj] = t;
            return null
        };
        var G = function(p, t, ai) {
            var aj = g(p, t, ai, 0, 1);
            if (aj !== null) {
                return aj
            }
            a[p] = (a[p] === 1);
            return null
        };
        var M = b.tokenize(O, 0, O.length);
        if (M.length === 0 || M[0].type !== "alpha") {
            return null
        }
        var f = O.substring(O.indexOf(M[0].token) + M[0].token.length);
        f = b.stripComment(f);
        var ab = M.shift().token.toLowerCase();
        var ae;
        var j = "";
        switch (ab) {
            case "bagpipes":
                c.formatting.bagpipes = true;
                break;
            case "landscape":
                a.landscape = true;
                break;
            case "papersize":
                a.papersize = f;
                break;
            case "slurgraces":
                c.formatting.slurgraces = true;
                break;
            case "stretchlast":
                c.formatting.stretchlast = true;
                break;
            case "titlecaps":
                a.titlecaps = true;
                break;
            case "titleleft":
                c.formatting.titleleft = true;
                break;
            case "measurebox":
                c.formatting.measurebox = true;
                break;
            case "botmargin":
            case "botspace":
            case "composerspace":
            case "indent":
            case "leftmargin":
            case "linesep":
            case "musicspace":
            case "partsspace":
            case "pageheight":
            case "pagewidth":
            case "rightmargin":
            case "staffsep":
            case "staffwidth":
            case "subtitlespace":
            case "sysstaffsep":
            case "systemsep":
            case "textspace":
            case "titlespace":
            case "topmargin":
            case "topspace":
            case "vocalspace":
            case "wordsspace":
                return T(ab, M);
            case "vskip":
                var i = X(ab, M);
                if (i.error) {
                    return i.error
                }
                c.addSpacing(i);
                return null;
            case "scale":
                j = "";
                ABCJS.parse.each(M, function(p) {
                    j += p.token
                });
                ae = parseFloat(j);
                if (isNaN(ae) || ae === 0) {
                    return 'Directive "' + ab + '" requires a number as a parameter.'
                }
                c.formatting.scale = ae;
                break;
            case "sep":
                if (M.length === 0) {
                    c.addSeparator()
                } else {
                    var S = b.getMeasurement(M);
                    if (S.used === 0) {
                        return 'Directive "' + ab + '" requires 3 numbers: space above, space below, length of line'
                    }
                    var L = S.value;
                    S = b.getMeasurement(M);
                    if (S.used === 0) {
                        return 'Directive "' + ab + '" requires 3 numbers: space above, space below, length of line'
                    }
                    var ah = S.value;
                    S = b.getMeasurement(M);
                    if (S.used === 0 || M.length !== 0) {
                        return 'Directive "' + ab + '" requires 3 numbers: space above, space below, length of line'
                    }
                    var C = S.value;
                    c.addSeparator(L, ah, C)
                }
                break;
            case "barsperstaff":
                j = g("barsperstaff", ab, M);
                if (j !== null) {
                    return j
                }
                break;
            case "staffnonote":
                j = G("staffnonote", ab, M);
                if (j !== null) {
                    return j
                }
                break;
            case "printtempo":
                j = G("printTempo", ab, M);
                if (j !== null) {
                    return j
                }
                break;
            case "measurenb":
            case "barnumbers":
                j = g("barNumbers", ab, M);
                if (j !== null) {
                    return j
                }
                break;
            case "begintext":
                a.inTextBlock = true;
                break;
            case "continueall":
                a.continueall = true;
                break;
            case "beginps":
                a.inPsBlock = true;
                d("Postscript ignored", O, 0);
                break;
            case "deco":
                if (f.length > 0) {
                    a.ignoredDecorations.push(f.substring(0, f.indexOf(" ")))
                }
                d("Decoration redefinition ignored", O, 0);
                break;
            case "text":
                var Y = b.translateString(f);
                c.addText(ABCJS.parse.parseDirective.parseFontChangeLine(Y));
                break;
            case "center":
                var e = b.translateString(f);
                c.addCentered(ABCJS.parse.parseDirective.parseFontChangeLine(e));
                break;
            case "font":
                break;
            case "setfont":
                var z = b.tokenize(f, 0, f.length);
                var I = false;
                if (z.length >= 4) {
                    if (z[0].token === "-" && z[1].type === "number") {
                        var h = parseInt(z[1].token);
                        if (h >= 1 && h <= 4) {
                            if (!a.setfont) {
                                a.setfont = []
                            }
                            var F = z.pop();
                            if (F.type === "number") {
                                F = parseInt(F.token);
                                var v = "";
                                for (var x = 2; x < z.length; x++) {
                                    v += z[x].token
                                }
                                a.setfont[h] = {
                                    font: v,
                                    size: F
                                };
                                I = true
                            }
                        }
                    }
                }
                if (!I) {
                    return "Bad parameters: " + ab
                }
                break;
            case "gchordfont":
            case "partsfont":
            case "vocalfont":
            case "textfont":
                return k(ab, M);
            case "barlabelfont":
            case "barnumberfont":
            case "composerfont":
            case "subtitlefont":
            case "tempofont":
            case "titlefont":
            case "voicefont":
                return r(ab, M);
            case "barnumfont":
                return r("barnumberfont", M);
            case "staves":
            case "score":
                a.score_is_present = true;
                var ag = function(al, ai, ak, aj, t) {
                    if (ai || a.staves.length === 0) {
                        a.staves.push({
                            index: a.staves.length,
                            numVoices: 0
                        })
                    }
                    var p = ABCJS.parse.last(a.staves);
                    if (ak !== undefined) {
                        p.bracket = ak
                    }
                    if (aj !== undefined) {
                        p.brace = aj
                    }
                    if (t) {
                        p.connectBarLines = "end"
                    }
                    if (a.voices[al] === undefined) {
                        a.voices[al] = {
                            staffNum: p.index,
                            index: p.numVoices
                        };
                        p.numVoices++
                    }
                };
                var Q = false;
                var aa = false;
                var o = false;
                var R = false;
                var m = false;
                var q = false;
                var n = false;
                var u;
                var af = function() {
                    n = true;
                    if (u) {
                        var p = "start";
                        if (u.staffNum > 0) {
                            if (a.staves[u.staffNum - 1].connectBarLines === "start" || a.staves[u.staffNum - 1].connectBarLines === "continue") {
                                p = "continue"
                            }
                        }
                        a.staves[u.staffNum].connectBarLines = p
                    }
                };
                while (M.length) {
                    var V = M.shift();
                    switch (V.token) {
                        case "(":
                            if (Q) {
                                d("Can't nest parenthesis in %%score", O, V.start)
                            } else {
                                Q = true;
                                R = true
                            }
                            break;
                        case ")":
                            if (!Q || R) {
                                d("Unexpected close parenthesis in %%score", O, V.start)
                            } else {
                                Q = false
                            }
                            break;
                        case "[":
                            if (aa) {
                                d("Can't nest brackets in %%score", O, V.start)
                            } else {
                                aa = true;
                                m = true
                            }
                            break;
                        case "]":
                            if (!aa || m) {
                                d("Unexpected close bracket in %%score", O, V.start)
                            } else {
                                aa = false;
                                a.staves[u.staffNum].bracket = "end"
                            }
                            break;
                        case "{":
                            if (o) {
                                d("Can't nest braces in %%score", O, V.start)
                            } else {
                                o = true;
                                q = true
                            }
                            break;
                        case "}":
                            if (!o || q) {
                                d("Unexpected close brace in %%score", O, V.start)
                            } else {
                                o = false;
                                a.staves[u.staffNum].brace = "end"
                            }
                            break;
                        case "|":
                            af();
                            break;
                        default:
                            var E = "";
                            while (V.type === "alpha" || V.type === "number") {
                                E += V.token;
                                if (V.continueId) {
                                    V = M.shift()
                                } else {
                                    break
                                }
                            }
                            var K = !Q || R;
                            var N = m ? "start" : aa ? "continue" : undefined;
                            var B = q ? "start" : o ? "continue" : undefined;
                            ag(E, K, N, B, n);
                            R = false;
                            m = false;
                            q = false;
                            n = false;
                            u = a.voices[E];
                            if (ab === "staves") {
                                af()
                            }
                            break
                    }
                }
                break;
            case "newpage":
                var w = b.getInt(f);
                c.addNewPage(w.digits === 0 ? -1 : w.value);
                break;
            case "abc":
                var A = f.split(" ");
                switch (A[0]) {
                    case "-copyright":
                    case "-creator":
                    case "-edited-by":
                    case "-version":
                    case "-charset":
                        var l = A.shift();
                        c.addMetaText(ab + l, A.join(" "));
                        break;
                    default:
                        return "Unknown directive: " + ab + A[0]
                }
                break;
            case "header":
            case "footer":
                var U = b.getMeat(f, 0, f.length);
                U = f.substring(U.start, U.end);
                if (U.charAt(0) === '"' && U.charAt(U.length - 1) === '"') {
                    U = U.substring(1, U.length - 2)
                }
                var H = U.split("\t");
                var s = {};
                if (H.length === 1) {
                    s = {
                        left: "",
                        center: H[0],
                        right: ""
                    }
                } else {
                    if (H.length === 2) {
                        s = {
                            left: H[0],
                            center: H[1],
                            right: ""
                        }
                    } else {
                        s = {
                            left: H[0],
                            center: H[1],
                            right: H[2]
                        }
                    }
                }
                if (H.length > 3) {
                    d("Too many tabs in " + ab + ": " + H.length + " found.", f, 0)
                }
                c.addMetaTextObj(ab, s);
                break;
            case "midi":
                var Z = b.tokenize(f, 0, f.length);
                if (Z.length > 0 && Z[0].token === "=") {
                    Z.shift()
                }
                if (Z.length === 0) {
                    d("Expected midi command", f, 0)
                } else {
                    var y = function(ai) {
                        if (ai.length > 0) {
                            var aj = ai.shift();
                            var ak = aj.token;
                            if (aj.type === "number") {
                                ak = aj.intt
                            }
                            return ak
                        } else {
                            return null
                        }
                    };
                    if (c.formatting[ab] === undefined) {
                        c.formatting[ab] = {}
                    }
                    var J = Z.shift().token;
                    var P = true;
                    if (J === "program") {
                        var ad = y(Z);
                        if (ad) {
                            var ac = y(Z);
                            if (ac) {
                                P = {
                                    channel: ad,
                                    program: ac
                                }
                            } else {
                                P = {
                                    program: ad
                                }
                            }
                        }
                    } else {
                        var W = y(Z);
                        if (W !== null) {
                            P = W
                        }
                    }
                    c.formatting[ab][J] = P
                }
                break;
            case "playtempo":
            case "auquality":
            case "continuous":
            case "nobarcheck":
                c.formatting[ab] = f;
                break;
            default:
                return "Unknown directive: " + ab
        }
        return null
    }
})();
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.parse) {
    ABCJS.parse = {}
}
ABCJS.parse.ParseHeader = function(c, e, a, d) {
    this.reset = function(g, i, f, h) {
        ABCJS.parse.parseKeyVoice.initialize(g, i, f, h);
        ABCJS.parse.parseDirective.initialize(g, i, f, h)
    };
    this.reset(c, e, a, d);
    this.setTitle = function(f) {
        if (a.hasMainTitle) {
            d.addSubtitle(c.translateString(c.stripComment(f)))
        } else {
            d.addMetaText("title", c.translateString(c.theReverser(c.stripComment(f))));
            a.hasMainTitle = true
        }
    };
    this.setMeter = function(n) {
        n = c.stripComment(n);
        if (n === "C") {
            if (a.havent_set_length === true) {
                a.default_length = 0.125
            }
            return {
                type: "common_time"
            }
        } else {
            if (n === "C|") {
                if (a.havent_set_length === true) {
                    a.default_length = 0.125
                }
                return {
                    type: "cut_time"
                }
            } else {
                if (n === "o") {
                    if (a.havent_set_length === true) {
                        a.default_length = 0.125
                    }
                    return {
                        type: "tempus_perfectum"
                    }
                } else {
                    if (n === "c") {
                        if (a.havent_set_length === true) {
                            a.default_length = 0.125
                        }
                        return {
                            type: "tempus_imperfectum"
                        }
                    } else {
                        if (n === "o.") {
                            if (a.havent_set_length === true) {
                                a.default_length = 0.125
                            }
                            return {
                                type: "tempus_perfectum_prolatio"
                            }
                        } else {
                            if (n === "c.") {
                                if (a.havent_set_length === true) {
                                    a.default_length = 0.125
                                }
                                return {
                                    type: "tempus_imperfectum_prolatio"
                                }
                            } else {
                                if (n.length === 0 || n.toLowerCase() === "none") {
                                    if (a.havent_set_length === true) {
                                        a.default_length = 0.125
                                    }
                                    return null
                                } else {
                                    var k = c.tokenize(n, 0, n.length);
                                    try {
                                        var j = function() {
                                            var p = {
                                                value: 0,
                                                num: ""
                                            };
                                            var o = k.shift();
                                            if (o.token === "(") {
                                                o = k.shift()
                                            }
                                            while (1) {
                                                if (o.type !== "number") {
                                                    throw "Expected top number of meter"
                                                }
                                                p.value += parseInt(o.token);
                                                p.num += o.token;
                                                if (k.length === 0 || k[0].token === "/") {
                                                    return p
                                                }
                                                o = k.shift();
                                                if (o.token === ")") {
                                                    if (k.length === 0 || k[0].token === "/") {
                                                        return p
                                                    }
                                                    throw "Unexpected paren in meter"
                                                }
                                                if (o.token !== "." && o.token !== "+") {
                                                    throw "Expected top number of meter"
                                                }
                                                p.num += o.token;
                                                if (k.length === 0) {
                                                    throw "Expected top number of meter"
                                                }
                                                o = k.shift()
                                            }
                                            return p
                                        };
                                        var f = function() {
                                            var p = j();
                                            if (k.length === 0) {
                                                return p
                                            }
                                            var o = k.shift();
                                            if (o.token !== "/") {
                                                throw "Expected slash in meter"
                                            }
                                            o = k.shift();
                                            if (o.type !== "number") {
                                                throw "Expected bottom number of meter"
                                            }
                                            p.den = o.token;
                                            p.value = p.value / parseInt(p.den);
                                            return p
                                        };
                                        if (k.length === 0) {
                                            throw "Expected meter definition in M: line"
                                        }
                                        var g = {
                                            type: "specified",
                                            value: []
                                        };
                                        var l = 0;
                                        while (1) {
                                            var i = f();
                                            l += i.value;
                                            var m = {
                                                num: i.num
                                            };
                                            if (i.den !== undefined) {
                                                m.den = i.den
                                            }
                                            g.value.push(m);
                                            if (k.length === 0) {
                                                break
                                            }
                                        }
                                        if (a.havent_set_length === true) {
                                            a.default_length = l < 0.75 ? 0.0625 : 0.125
                                        }
                                        return g
                                    } catch (h) {
                                        e(h, n, 0)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return null
    };
    this.calcTempo = function(f) {
        var h = 1 / 4;
        if (a.meter && a.meter.type === "specified") {
            h = 1 / parseInt(a.meter.value[0].den)
        } else {
            if (a.origMeter && a.origMeter.type === "specified") {
                h = 1 / parseInt(a.origMeter.value[0].den)
            }
        }
        for (var g = 0; g < f.duration; g++) {
            f.duration[g] = h * f.duration[g]
        }
        return f
    };
    this.resolveTempo = function() {
        if (a.tempo) {
            this.calcTempo(a.tempo);
            d.metaText.tempo = a.tempo;
            delete a.tempo
        }
    };
    this.addUserDefinition = function(g, l, f) {
        var h = g.indexOf("=", l);
        if (h === -1) {
            e("Need an = in a macro definition", g, l);
            return
        }
        var j = ABCJS.parse.strip(g.substring(l, h));
        var k = ABCJS.parse.strip(g.substring(h + 1));
        if (j.length !== 1) {
            e("Macro definitions can only be one character", g, l);
            return
        }
        var i = "HIJKLMNOPQRSTUVWXYhijklmnopqrstuvw~";
        if (i.indexOf(j) === -1) {
            e("Macro definitions must be H-Y, h-w, or tilde", g, l);
            return
        }
        if (k.length === 0) {
            e("Missing macro definition", g, l);
            return
        }
        if (a.macros === undefined) {
            a.macros = {}
        }
        a.macros[j] = k
    };
    this.setDefaultLength = function(h, l, g) {
        var f = ABCJS.parse.gsub(h.substring(l, g), " ", "");
        var k = f.split("/");
        if (k.length === 2) {
            var j = parseInt(k[0]);
            var i = parseInt(k[1]);
            if (i > 0) {
                a.default_length = j / i;
                a.havent_set_length = false
            }
        }
    };
    this.setTempo = function(o, f, i) {
        try {
            var l = c.tokenize(o, f, i);
            if (l.length === 0) {
                throw "Missing parameter in Q: field"
            }
            var j = {};
            var n = true;
            var h = l.shift();
            if (h.type === "quote") {
                j.preString = h.token;
                h = l.shift();
                if (l.length === 0) {
                    return {
                        type: "immediate",
                        tempo: j
                    }
                }
            }
            if (h.type === "alpha" && h.token === "C") {
                if (l.length === 0) {
                    throw "Missing tempo after C in Q: field"
                }
                h = l.shift();
                if (h.type === "punct" && h.token === "=") {
                    if (l.length === 0) {
                        throw "Missing tempo after = in Q: field"
                    }
                    h = l.shift();
                    if (h.type !== "number") {
                        throw "Expected number after = in Q: field"
                    }
                    j.duration = [1];
                    j.bpm = parseInt(h.token)
                } else {
                    if (h.type === "number") {
                        j.duration = [parseInt(h.token)];
                        if (l.length === 0) {
                            throw "Missing = after duration in Q: field"
                        }
                        h = l.shift();
                        if (h.type !== "punct" || h.token !== "=") {
                            throw "Expected = after duration in Q: field"
                        }
                        if (l.length === 0) {
                            throw "Missing tempo after = in Q: field"
                        }
                        h = l.shift();
                        if (h.type !== "number") {
                            throw "Expected number after = in Q: field"
                        }
                        j.bpm = parseInt(h.token)
                    } else {
                        throw "Expected number or equal after C in Q: field"
                    }
                }
            } else {
                if (h.type === "number") {
                    var k = parseInt(h.token);
                    if (l.length === 0 || l[0].type === "quote") {
                        j.duration = [1];
                        j.bpm = k
                    } else {
                        n = false;
                        h = l.shift();
                        if (h.type !== "punct" && h.token !== "/") {
                            throw "Expected fraction in Q: field"
                        }
                        h = l.shift();
                        if (h.type !== "number") {
                            throw "Expected fraction in Q: field"
                        }
                        var m = parseInt(h.token);
                        j.duration = [k / m];
                        while (l.length > 0 && l[0].token !== "=" && l[0].type !== "quote") {
                            h = l.shift();
                            if (h.type !== "number") {
                                throw "Expected fraction in Q: field"
                            }
                            k = parseInt(h.token);
                            h = l.shift();
                            if (h.type !== "punct" && h.token !== "/") {
                                throw "Expected fraction in Q: field"
                            }
                            h = l.shift();
                            if (h.type !== "number") {
                                throw "Expected fraction in Q: field"
                            }
                            m = parseInt(h.token);
                            j.duration.push(k / m)
                        }
                        h = l.shift();
                        if (h.type !== "punct" && h.token !== "=") {
                            throw "Expected = in Q: field"
                        }
                        h = l.shift();
                        if (h.type !== "number") {
                            throw "Expected tempo in Q: field"
                        }
                        j.bpm = parseInt(h.token)
                    }
                } else {
                    throw "Unknown value in Q: field"
                }
            }
            if (l.length !== 0) {
                h = l.shift();
                if (h.type === "quote") {
                    j.postString = h.token;
                    h = l.shift()
                }
                if (l.length !== 0) {
                    throw "Unexpected string at end of Q: field"
                }
            }
            if (a.printTempo === false) {
                j.suppress = true
            }
            return {
                type: n ? "delaySet" : "immediate",
                tempo: j
            }
        } catch (g) {
            e(g, o, f);
            return {
                type: "none"
            }
        }
    };
    this.letter_to_inline_header = function(h, k) {
        var g = c.eatWhiteSpace(h, k);
        k += g;
        if (h.length >= k + 5 && h.charAt(k) === "[" && h.charAt(k + 2) === ":") {
            var n = h.indexOf("]", k);
            switch (h.substring(k, k + 3)) {
                case "[I:":
                    var l = ABCJS.parse.parseDirective.addDirective(h.substring(k + 3, n));
                    if (l) {
                        e(l, h, k)
                    }
                    return [n - k + 1 + g];
                case "[M:":
                    var m = this.setMeter(h.substring(k + 3, n));
                    if (d.hasBeginMusic() && m) {
                        d.appendStartingElement("meter", -1, -1, m)
                    } else {
                        a.meter = m
                    }
                    return [n - k + 1 + g];
                case "[K:":
                    var f = ABCJS.parse.parseKeyVoice.parseKey(h.substring(k + 3, n));
                    if (f.foundClef && d.hasBeginMusic()) {
                        d.appendStartingElement("clef", -1, -1, a.clef)
                    }
                    if (f.foundKey && d.hasBeginMusic()) {
                        d.appendStartingElement("key", -1, -1, ABCJS.parse.parseKeyVoice.fixKey(a.clef, a.key))
                    }
                    return [n - k + 1 + g];
                case "[P:":
                    d.appendElement("part", -1, -1, {
                        title: h.substring(k + 3, n)
                    });
                    return [n - k + 1 + g];
                case "[L:":
                    this.setDefaultLength(h, k + 3, n);
                    return [n - k + 1 + g];
                case "[Q:":
                    if (n > 0) {
                        var j = this.setTempo(h, k + 3, n);
                        if (j.type === "delaySet") {
                            d.appendElement("tempo", -1, -1, this.calcTempo(j.tempo))
                        } else {
                            if (j.type === "immediate") {
                                d.appendElement("tempo", -1, -1, j.tempo)
                            }
                        }
                        return [n - k + 1 + g, h.charAt(k + 1), h.substring(k + 3, n)]
                    }
                    break;
                case "[V:":
                    if (n > 0) {
                        ABCJS.parse.parseKeyVoice.parseVoice(h, k + 3, n);
                        return [n - k + 1 + g, h.charAt(k + 1), h.substring(k + 3, n)]
                    }
                    break;
                default:
            }
        }
        return [0]
    };
    this.letter_to_body_header = function(g, j) {
        if (g.length >= j + 3) {
            switch (g.substring(j, j + 2)) {
                case "I:":
                    var k = ABCJS.parse.parseDirective.addDirective(g.substring(j + 2));
                    if (k) {
                        e(k, g, j)
                    }
                    return [g.length];
                case "M:":
                    var l = this.setMeter(g.substring(j + 2));
                    if (d.hasBeginMusic() && l) {
                        d.appendStartingElement("meter", -1, -1, l)
                    }
                    return [g.length];
                case "K:":
                    var f = ABCJS.parse.parseKeyVoice.parseKey(g.substring(j + 2));
                    if (f.foundClef && d.hasBeginMusic()) {
                        d.appendStartingElement("clef", -1, -1, a.clef)
                    }
                    if (f.foundKey && d.hasBeginMusic()) {
                        d.appendStartingElement("key", -1, -1, ABCJS.parse.parseKeyVoice.fixKey(a.clef, a.key))
                    }
                    return [g.length];
                case "P:":
                    if (d.hasBeginMusic()) {
                        d.appendElement("part", -1, -1, {
                            title: g.substring(j + 2)
                        })
                    }
                    return [g.length];
                case "L:":
                    this.setDefaultLength(g, j + 2, g.length);
                    return [g.length];
                case "Q:":
                    var m = g.indexOf("\x12", j + 2);
                    if (m === -1) {
                        m = g.length
                    }
                    var h = this.setTempo(g, j + 2, m);
                    if (h.type === "delaySet") {
                        d.appendElement("tempo", -1, -1, this.calcTempo(h.tempo))
                    } else {
                        if (h.type === "immediate") {
                            d.appendElement("tempo", -1, -1, h.tempo)
                        }
                    }
                    return [m, g.charAt(j), ABCJS.parse.strip(g.substring(j + 2))];
                case "V:":
                    ABCJS.parse.parseKeyVoice.parseVoice(g, 2, g.length);
                    return [g.length, g.charAt(j), ABCJS.parse(g.substring(j + 2))];
                default:
            }
        }
        return [0]
    };
    var b = {
        A: "author",
        B: "book",
        C: "composer",
        D: "discography",
        F: "url",
        G: "group",
        I: "instruction",
        N: "notes",
        O: "origin",
        R: "rhythm",
        S: "source",
        W: "unalignedWords",
        Z: "transcription"
    };
    this.parseHeader = function(g) {
        if (ABCJS.parse.startsWith(g, "%%")) {
            var l = ABCJS.parse.parseDirective.addDirective(g.substring(2));
            if (l) {
                e(l, g, 2)
            }
            return {}
        }
        var j = g.indexOf("%");
        if (j >= 0) {
            g = g.substring(0, j)
        }
        g = g.replace(/\s+$/, "");
        if (g.length === 0) {
            return {}
        }
        if (g.length >= 2) {
            if (g.charAt(1) === ":") {
                var k = "";
                if (g.indexOf("\x12") >= 0 && g.charAt(0) !== "w") {
                    k = g.substring(g.indexOf("\x12") + 1);
                    g = g.substring(0, g.indexOf("\x12"))
                }
                var m = b[g.charAt(0)];
                if (m !== undefined) {
                    if (m === "unalignedWords") {
                        d.addMetaTextArray(m, ABCJS.parse.parseDirective.parseFontChangeLine(c.translateString(c.stripComment(g.substring(2)))))
                    } else {
                        d.addMetaText(m, c.translateString(c.stripComment(g.substring(2))))
                    }
                    return {}
                } else {
                    switch (g.charAt(0)) {
                        case "H":
                            d.addMetaText("history", c.translateString(c.stripComment(g.substring(2))));
                            a.is_in_history = true;
                            break;
                        case "K":
                            this.resolveTempo();
                            var f = ABCJS.parse.parseKeyVoice.parseKey(g.substring(2));
                            if (!a.is_in_header && d.hasBeginMusic()) {
                                if (f.foundClef) {
                                    d.appendStartingElement("clef", -1, -1, a.clef)
                                }
                                if (f.foundKey) {
                                    d.appendStartingElement("key", -1, -1, ABCJS.parse.parseKeyVoice.fixKey(a.clef, a.key))
                                }
                            }
                            a.is_in_header = false;
                            break;
                        case "L":
                            this.setDefaultLength(g, 2, g.length);
                            break;
                        case "M":
                            a.origMeter = a.meter = this.setMeter(g.substring(2));
                            break;
                        case "P":
                            if (a.is_in_header) {
                                d.addMetaText("partOrder", c.translateString(c.stripComment(g.substring(2))))
                            } else {
                                a.partForNextLine = c.translateString(c.stripComment(g.substring(2)))
                            }
                            break;
                        case "Q":
                            var h = this.setTempo(g, 2, g.length);
                            if (h.type === "delaySet") {
                                a.tempo = h.tempo
                            } else {
                                if (h.type === "immediate") {
                                    d.metaText.tempo = h.tempo
                                }
                            }
                            break;
                        case "T":
                            this.setTitle(g.substring(2));
                            break;
                        case "U":
                            this.addUserDefinition(g, 2, g.length);
                            break;
                        case "V":
                            ABCJS.parse.parseKeyVoice.parseVoice(g, 2, g.length);
                            if (!a.is_in_header) {
                                return {
                                    newline: true
                                }
                            }
                            break;
                        case "s":
                            return {
                                symbols: true
                            };
                        case "w":
                            return {
                                words: true
                            };
                        case "X":
                            break;
                        case "E":
                        case "m":
                            e("Ignored header", g, 0);
                            break;
                        default:
                            if (k.length) {
                                k = "\x12" + k
                            }
                            return {
                                regular: true,
                                str: g + k
                            }
                    }
                }
                if (k.length > 0) {
                    return {
                        recurse: true,
                        str: k
                    }
                }
                return {}
            }
        }
        return {
            regular: true,
            str: g
        }
    }
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.parse) {
    ABCJS.parse = {}
}
ABCJS.parse.parseKeyVoice = {};
(function() {
    var i;
    var f;
    var b;
    var e;
    ABCJS.parse.parseKeyVoice.initialize = function(n, l, m, k) {
        i = n;
        f = l;
        b = m;
        e = k
    };
    ABCJS.parse.parseKeyVoice.standardKey = function(x) {
        var n = {
            acc: "sharp",
            note: "f"
        };
        var s = {
            acc: "sharp",
            note: "c"
        };
        var w = {
            acc: "sharp",
            note: "g"
        };
        var l = {
            acc: "sharp",
            note: "d"
        };
        var q = {
            acc: "sharp",
            note: "A"
        };
        var v = {
            acc: "sharp",
            note: "e"
        };
        var z = {
            acc: "sharp",
            note: "B"
        };
        var u = {
            acc: "flat",
            note: "B"
        };
        var t = {
            acc: "flat",
            note: "e"
        };
        var r = {
            acc: "flat",
            note: "A"
        };
        var p = {
            acc: "flat",
            note: "d"
        };
        var o = {
            acc: "flat",
            note: "G"
        };
        var m = {
            acc: "flat",
            note: "c"
        };
        var k = {
            acc: "flat",
            note: "F"
        };
        var y = {
            "C#": [n, s, w, l, q, v, z],
            "A#m": [n, s, w, l, q, v, z],
            "G#Mix": [n, s, w, l, q, v, z],
            "D#Dor": [n, s, w, l, q, v, z],
            "E#Phr": [n, s, w, l, q, v, z],
            "F#Lyd": [n, s, w, l, q, v, z],
            "B#Loc": [n, s, w, l, q, v, z],
            "F#": [n, s, w, l, q, v],
            "D#m": [n, s, w, l, q, v],
            "C#Mix": [n, s, w, l, q, v],
            "G#Dor": [n, s, w, l, q, v],
            "A#Phr": [n, s, w, l, q, v],
            BLyd: [n, s, w, l, q, v],
            "E#Loc": [n, s, w, l, q, v],
            B: [n, s, w, l, q],
            "G#m": [n, s, w, l, q],
            "F#Mix": [n, s, w, l, q],
            "C#Dor": [n, s, w, l, q],
            "D#Phr": [n, s, w, l, q],
            ELyd: [n, s, w, l, q],
            "A#Loc": [n, s, w, l, q],
            E: [n, s, w, l],
            "C#m": [n, s, w, l],
            BMix: [n, s, w, l],
            "F#Dor": [n, s, w, l],
            "G#Phr": [n, s, w, l],
            ALyd: [n, s, w, l],
            "D#Loc": [n, s, w, l],
            A: [n, s, w],
            "F#m": [n, s, w],
            EMix: [n, s, w],
            BDor: [n, s, w],
            "C#Phr": [n, s, w],
            DLyd: [n, s, w],
            "G#Loc": [n, s, w],
            D: [n, s],
            Bm: [n, s],
            AMix: [n, s],
            EDor: [n, s],
            "F#Phr": [n, s],
            GLyd: [n, s],
            "C#Loc": [n, s],
            G: [n],
            Em: [n],
            DMix: [n],
            ADor: [n],
            BPhr: [n],
            CLyd: [n],
            "F#Loc": [n],
            C: [],
            Am: [],
            GMix: [],
            DDor: [],
            EPhr: [],
            FLyd: [],
            BLoc: [],
            F: [u],
            Dm: [u],
            CMix: [u],
            GDor: [u],
            APhr: [u],
            BbLyd: [u],
            ELoc: [u],
            Bb: [u, t],
            Gm: [u, t],
            FMix: [u, t],
            CDor: [u, t],
            DPhr: [u, t],
            EbLyd: [u, t],
            ALoc: [u, t],
            Eb: [u, t, r],
            Cm: [u, t, r],
            BbMix: [u, t, r],
            FDor: [u, t, r],
            GPhr: [u, t, r],
            AbLyd: [u, t, r],
            DLoc: [u, t, r],
            Ab: [u, t, r, p],
            Fm: [u, t, r, p],
            EbMix: [u, t, r, p],
            BbDor: [u, t, r, p],
            CPhr: [u, t, r, p],
            DbLyd: [u, t, r, p],
            GLoc: [u, t, r, p],
            Db: [u, t, r, p, o],
            Bbm: [u, t, r, p, o],
            AbMix: [u, t, r, p, o],
            EbDor: [u, t, r, p, o],
            FPhr: [u, t, r, p, o],
            GbLyd: [u, t, r, p, o],
            CLoc: [u, t, r, p, o],
            Gb: [u, t, r, p, o, m],
            Ebm: [u, t, r, p, o, m],
            DbMix: [u, t, r, p, o, m],
            AbDor: [u, t, r, p, o, m],
            BbPhr: [u, t, r, p, o, m],
            CbLyd: [u, t, r, p, o, m],
            FLoc: [u, t, r, p, o, m],
            Cb: [u, t, r, p, o, m, k],
            Abm: [u, t, r, p, o, m, k],
            GbMix: [u, t, r, p, o, m, k],
            DbDor: [u, t, r, p, o, m, k],
            EbPhr: [u, t, r, p, o, m, k],
            FbLyd: [u, t, r, p, o, m, k],
            BbLoc: [u, t, r, p, o, m, k],
            "A#": [u, t],
            "B#": [],
            "D#": [u, t, r],
            "E#": [u],
            "G#": [u, t, r, p],
            Gbm: [n, s, w, l, q, v, z]
        };
        return y[x]
    };
    var c = {
        treble: {
            clef: "treble",
            pitch: 4,
            mid: 0
        },
        "treble+8": {
            clef: "treble+8",
            pitch: 4,
            mid: 0
        },
        "treble-8": {
            clef: "treble-8",
            pitch: 4,
            mid: 0
        },
        treble1: {
            clef: "treble",
            pitch: 2,
            mid: 2
        },
        treble2: {
            clef: "treble",
            pitch: 4,
            mid: 0
        },
        treble3: {
            clef: "treble",
            pitch: 6,
            mid: -2
        },
        treble4: {
            clef: "treble",
            pitch: 8,
            mid: -4
        },
        treble5: {
            clef: "treble",
            pitch: 10,
            mid: -6
        },
        perc: {
            clef: "perc",
            pitch: 6,
            mid: 0
        },
        none: {
            clef: "none",
            mid: 0
        },
        bass: {
            clef: "bass",
            pitch: 8,
            mid: -12
        },
        "bass+8": {
            clef: "bass+8",
            pitch: 8,
            mid: -12
        },
        "bass-8": {
            clef: "bass-8",
            pitch: 8,
            mid: -12
        },
        "bass+16": {
            clef: "bass",
            pitch: 8,
            mid: -12
        },
        "bass-16": {
            clef: "bass",
            pitch: 8,
            mid: -12
        },
        bass1: {
            clef: "bass",
            pitch: 2,
            mid: -6
        },
        bass2: {
            clef: "bass",
            pitch: 4,
            mid: -8
        },
        bass3: {
            clef: "bass",
            pitch: 6,
            mid: -10
        },
        bass4: {
            clef: "bass",
            pitch: 8,
            mid: -12
        },
        bass5: {
            clef: "bass",
            pitch: 10,
            mid: -14
        },
        tenor: {
            clef: "alto",
            pitch: 8,
            mid: -8
        },
        tenor1: {
            clef: "alto",
            pitch: 2,
            mid: -2
        },
        tenor2: {
            clef: "alto",
            pitch: 4,
            mid: -4
        },
        tenor3: {
            clef: "alto",
            pitch: 6,
            mid: -6
        },
        tenor4: {
            clef: "alto",
            pitch: 8,
            mid: -8
        },
        tenor5: {
            clef: "alto",
            pitch: 10,
            mid: -10
        },
        alto: {
            clef: "alto",
            pitch: 6,
            mid: -6
        },
        alto1: {
            clef: "alto",
            pitch: 2,
            mid: -2
        },
        alto2: {
            clef: "alto",
            pitch: 4,
            mid: -4
        },
        alto3: {
            clef: "alto",
            pitch: 6,
            mid: -6
        },
        alto4: {
            clef: "alto",
            pitch: 8,
            mid: -8
        },
        alto5: {
            clef: "alto",
            pitch: 10,
            mid: -10
        },
        "alto+8": {
            clef: "alto+8",
            pitch: 6,
            mid: -6
        },
        "alto-8": {
            clef: "alto-8",
            pitch: 6,
            mid: -6
        }
    };
    var j = function(n, k) {
        var m = c[n];
        var l = m ? m.mid : 0;
        return l + k
    };
    ABCJS.parse.parseKeyVoice.fixClef = function(l) {
        var k = c[l.type];
        if (k) {
            l.clefPos = k.pitch;
            l.type = k.clef
        }
    };
    ABCJS.parse.parseKeyVoice.deepCopyKey = function(l) {
        var k = {
            accidentals: [],
            root: l.root,
            acc: l.acc,
            mode: l.mode
        };
        ABCJS.parse.each(l.accidentals, function(m) {
            k.accidentals.push(ABCJS.parse.clone(m))
        });
        return k
    };
    var d = {
        A: 5,
        B: 6,
        C: 0,
        D: 1,
        E: 2,
        F: 3,
        G: 4,
        a: 12,
        b: 13,
        c: 7,
        d: 8,
        e: 9,
        f: 10,
        g: 11
    };
    ABCJS.parse.parseKeyVoice.addPosToKey = function(m, l) {
        var k = m.verticalPos;
        ABCJS.parse.each(l.accidentals, function(n) {
            var o = d[n.note];
            o = o - k;
            n.verticalPos = o
        });
        if (l.impliedNaturals) {
            ABCJS.parse.each(l.impliedNaturals, function(n) {
                var o = d[n.note];
                o = o - k;
                n.verticalPos = o
            })
        }
        if (k < -10) {
            ABCJS.parse.each(l.accidentals, function(n) {
                n.verticalPos -= 7;
                if (n.verticalPos >= 11 || (n.verticalPos === 10 && n.acc === "flat")) {
                    n.verticalPos -= 7
                }
                if (n.note === "A" && n.acc === "sharp") {
                    n.verticalPos -= 7
                }
                if ((n.note === "G" || n.note === "F") && n.acc === "flat") {
                    n.verticalPos -= 7
                }
            });
            if (l.impliedNaturals) {
                ABCJS.parse.each(l.impliedNaturals, function(n) {
                    n.verticalPos -= 7;
                    if (n.verticalPos >= 11 || (n.verticalPos === 10 && n.acc === "flat")) {
                        n.verticalPos -= 7
                    }
                    if (n.note === "A" && n.acc === "sharp") {
                        n.verticalPos -= 7
                    }
                    if ((n.note === "G" || n.note === "F") && n.acc === "flat") {
                        n.verticalPos -= 7
                    }
                })
            }
        } else {
            if (k < -4) {
                ABCJS.parse.each(l.accidentals, function(n) {
                    n.verticalPos -= 7;
                    if (k === -8 && (n.note === "f" || n.note === "g") && n.acc === "sharp") {
                        n.verticalPos -= 7
                    }
                });
                if (l.impliedNaturals) {
                    ABCJS.parse.each(l.impliedNaturals, function(n) {
                        n.verticalPos -= 7;
                        if (k === -8 && (n.note === "f" || n.note === "g") && n.acc === "sharp") {
                            n.verticalPos -= 7
                        }
                    })
                }
            } else {
                if (k >= 7) {
                    ABCJS.parse.each(l.accidentals, function(n) {
                        n.verticalPos += 7
                    });
                    if (l.impliedNaturals) {
                        ABCJS.parse.each(l.impliedNaturals, function(n) {
                            n.verticalPos += 7
                        })
                    }
                }
            }
        }
    };
    ABCJS.parse.parseKeyVoice.fixKey = function(m, k) {
        var l = ABCJS.parse.clone(k);
        ABCJS.parse.parseKeyVoice.addPosToKey(m, l);
        return l
    };
    var a = function(m) {
        var k = d[m.charAt(0)];
        for (var l = 1; l < m.length; l++) {
            if (m.charAt(l) === ",") {
                k -= 7
            } else {
                if (m.charAt(l) === ",") {
                    k += 7
                } else {
                    break
                }
            }
        }
        return {
            mid: k - 6,
            str: m.substring(l)
        }
    };
    var h = function(k) {
        for (var l = 0; l < k.length; l++) {
            if (k[l].note === "b") {
                k[l].note = "B"
            } else {
                if (k[l].note === "a") {
                    k[l].note = "A"
                } else {
                    if (k[l].note === "F") {
                        k[l].note = "f"
                    } else {
                        if (k[l].note === "E") {
                            k[l].note = "e"
                        } else {
                            if (k[l].note === "D") {
                                k[l].note = "d"
                            } else {
                                if (k[l].note === "C") {
                                    k[l].note = "c"
                                } else {
                                    if (k[l].note === "G" && k[l].acc === "sharp") {
                                        k[l].note = "g"
                                    } else {
                                        if (k[l].note === "g" && k[l].acc === "flat") {
                                            k[l].note = "G"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    ABCJS.parse.parseKeyVoice.parseKey = function(x) {
        if (x.length === 0) {
            x = "none"
        }
        var w = i.tokenize(x, 0, x.length);
        var D = {};
        switch (w[0].token) {
            case "HP":
                ABCJS.parse.parseDirective.addDirective("bagpipes");
                b.key = {
                    root: "HP",
                    accidentals: [],
                    acc: "",
                    mode: ""
                };
                D.foundKey = true;
                w.shift();
                break;
            case "Hp":
                ABCJS.parse.parseDirective.addDirective("bagpipes");
                b.key = {
                    root: "Hp",
                    accidentals: [{
                        acc: "natural",
                        note: "g"
                    }, {
                        acc: "sharp",
                        note: "f"
                    }, {
                        acc: "sharp",
                        note: "c"
                    }],
                    acc: "",
                    mode: ""
                };
                D.foundKey = true;
                w.shift();
                break;
            case "none":
                b.key = {
                    root: "none",
                    accidentals: [],
                    acc: "",
                    mode: ""
                };
                D.foundKey = true;
                w.shift();
                break;
            default:
                var p = i.getKeyPitch(w[0].token);
                if (p.len > 0) {
                    D.foundKey = true;
                    var n = "";
                    var v = "";
                    if (w[0].token.length > 1) {
                        w[0].token = w[0].token.substring(1)
                    } else {
                        w.shift()
                    }
                    var E = p.token;
                    if (w.length > 0) {
                        var l = i.getSharpFlat(w[0].token);
                        if (l.len > 0) {
                            if (w[0].token.length > 1) {
                                w[0].token = w[0].token.substring(1)
                            } else {
                                w.shift()
                            }
                            E += l.token;
                            n = l.token
                        }
                        if (w.length > 0) {
                            var C = i.getMode(w[0].token);
                            if (C.len > 0) {
                                w.shift();
                                E += C.token;
                                v = C.token
                            }
                        }
                    }
                    var s = ABCJS.parse.parseKeyVoice.deepCopyKey(b.key);
                    b.key = ABCJS.parse.parseKeyVoice.deepCopyKey({
                        accidentals: ABCJS.parse.parseKeyVoice.standardKey(E)
                    });
                    b.key.root = p.token;
                    b.key.acc = n;
                    b.key.mode = v;
                    if (s) {
                        var m;
                        for (var z = 0; z < b.key.accidentals.length; z++) {
                            for (m = 0; m < s.accidentals.length; m++) {
                                if (s.accidentals[m].note && b.key.accidentals[z].note.toLowerCase() === s.accidentals[m].note.toLowerCase()) {
                                    s.accidentals[m].note = null
                                }
                            }
                        }
                        for (m = 0; m < s.accidentals.length; m++) {
                            if (s.accidentals[m].note) {
                                if (!b.key.impliedNaturals) {
                                    b.key.impliedNaturals = []
                                }
                                b.key.impliedNaturals.push({
                                    acc: "natural",
                                    note: s.accidentals[m].note
                                })
                            }
                        }
                    }
                }
                break
        }
        if (w.length === 0) {
            return D
        }
        if (w[0].token === "exp") {
            w.shift()
        }
        if (w.length === 0) {
            return D
        }
        if (w[0].token === "oct") {
            w.shift()
        }
        if (w.length === 0) {
            return D
        }
        var t = i.getKeyAccidentals2(w);
        if (t.warn) {
            f(t.warn, x, 0)
        }
        if (t.accs) {
            if (!D.foundKey) {
                D.foundKey = true;
                b.key = {
                    root: "none",
                    acc: "",
                    mode: "",
                    accidentals: []
                }
            }
            h(t.accs);
            for (var B = 0; B < t.accs.length; B++) {
                var u = false;
                for (var A = 0; A < b.key.accidentals.length && !u; A++) {
                    if (b.key.accidentals[A].note === t.accs[B].note) {
                        u = true;
                        b.key.accidentals[A].acc = t.accs[B].acc
                    }
                }
                if (!u) {
                    b.key.accidentals.push(t.accs[B]);
                    if (b.key.impliedNaturals) {
                        for (var q = 0; q < b.key.impliedNaturals.length; q++) {
                            if (b.key.impliedNaturals[q].note === t.accs[B].note) {
                                b.key.impliedNaturals.splice(q, 1)
                            }
                        }
                    }
                }
            }
        }
        var o;
        while (w.length > 0) {
            switch (w[0].token) {
                case "m":
                case "middle":
                    w.shift();
                    if (w.length === 0) {
                        f("Expected = after middle", x, 0);
                        return D
                    }
                    o = w.shift();
                    if (o.token !== "=") {
                        f("Expected = after middle", x, o.start);
                        break
                    }
                    if (w.length === 0) {
                        f("Expected parameter after middle=", x, 0);
                        return D
                    }
                    var r = i.getPitchFromTokens(w);
                    if (r.warn) {
                        f(r.warn, x, 0)
                    }
                    if (r.position) {
                        b.clef.verticalPos = r.position - 6
                    }
                    break;
                case "transpose":
                    w.shift();
                    if (w.length === 0) {
                        f("Expected = after transpose", x, 0);
                        return D
                    }
                    o = w.shift();
                    if (o.token !== "=") {
                        f("Expected = after transpose", x, o.start);
                        break
                    }
                    if (w.length === 0) {
                        f("Expected parameter after transpose=", x, 0);
                        return D
                    }
                    if (w[0].type !== "number") {
                        f("Expected number after transpose", x, w[0].start);
                        break
                    }
                    b.clef.transpose = w[0].intt;
                    w.shift();
                    break;
                case "stafflines":
                    w.shift();
                    if (w.length === 0) {
                        f("Expected = after stafflines", x, 0);
                        return D
                    }
                    o = w.shift();
                    if (o.token !== "=") {
                        f("Expected = after stafflines", x, o.start);
                        break
                    }
                    if (w.length === 0) {
                        f("Expected parameter after stafflines=", x, 0);
                        return D
                    }
                    if (w[0].type !== "number") {
                        f("Expected number after stafflines", x, w[0].start);
                        break
                    }
                    b.clef.stafflines = w[0].intt;
                    w.shift();
                    break;
                case "staffscale":
                    w.shift();
                    if (w.length === 0) {
                        f("Expected = after staffscale", x, 0);
                        return D
                    }
                    o = w.shift();
                    if (o.token !== "=") {
                        f("Expected = after staffscale", x, o.start);
                        break
                    }
                    if (w.length === 0) {
                        f("Expected parameter after staffscale=", x, 0);
                        return D
                    }
                    if (w[0].type !== "number") {
                        f("Expected number after staffscale", x, w[0].start);
                        break
                    }
                    b.clef.staffscale = w[0].floatt;
                    w.shift();
                    break;
                case "style":
                    w.shift();
                    if (w.length === 0) {
                        f("Expected = after style", x, 0);
                        return D
                    }
                    o = w.shift();
                    if (o.token !== "=") {
                        f("Expected = after style", x, o.start);
                        break
                    }
                    if (w.length === 0) {
                        f("Expected parameter after style=", x, 0);
                        return D
                    }
                    switch (w[0].token) {
                        case "normal":
                        case "harmonic":
                        case "rhythm":
                        case "x":
                            b.style = w[0].token;
                            w.shift();
                            break;
                        default:
                            f("error parsing style element: " + w[0].token, x, w[0].start);
                            break
                    }
                    break;
                case "clef":
                    w.shift();
                    if (w.length === 0) {
                        f("Expected = after clef", x, 0);
                        return D
                    }
                    o = w.shift();
                    if (o.token !== "=") {
                        f("Expected = after clef", x, o.start);
                        break
                    }
                    if (w.length === 0) {
                        f("Expected parameter after clef=", x, 0);
                        return D
                    }
                case "treble":
                case "bass":
                case "alto":
                case "tenor":
                case "perc":
                    var y = w.shift();
                    switch (y.token) {
                        case "treble":
                        case "tenor":
                        case "alto":
                        case "bass":
                        case "perc":
                        case "none":
                            break;
                        case "C":
                            y.token = "alto";
                            break;
                        case "F":
                            y.token = "bass";
                            break;
                        case "G":
                            y.token = "treble";
                            break;
                        case "c":
                            y.token = "alto";
                            break;
                        case "f":
                            y.token = "bass";
                            break;
                        case "g":
                            y.token = "treble";
                            break;
                        default:
                            f("Expected clef name. Found " + y.token, x, y.start);
                            break
                    }
                    if (w.length > 0 && w[0].type === "number") {
                        y.token += w[0].token;
                        w.shift()
                    }
                    if (w.length > 1 && (w[0].token === "-" || w[0].token === "+") && w[1].token === "8") {
                        y.token += w[0].token + w[1].token;
                        w.shift();
                        w.shift()
                    }
                    b.clef = {
                        type: y.token,
                        verticalPos: j(y.token, 0)
                    };
                    D.foundClef = true;
                    break;
                default:
                    f("Unknown parameter: " + w[0].token, x, w[0].start);
                    w.shift()
            }
        }
        return D
    };
    var g = function(k) {
        b.currentVoice = b.voices[k];
        e.setCurrentVoice(b.currentVoice.staffNum, b.currentVoice.index)
    };
    ABCJS.parse.parseKeyVoice.parseVoice = function(n, x, y) {
        var C = i.getMeat(n, x, y);
        var l = C.start;
        var k = C.end;
        var r = i.getToken(n, l, k);
        if (r.length === 0) {
            f("Expected a voice id", n, l);
            return
        }
        var A = false;
        if (b.voices[r] === undefined) {
            b.voices[r] = {};
            A = true;
            if (b.score_is_present) {
                f("Can't have an unknown V: id when the %score directive is present", n, l)
            }
        }
        l += r.length;
        l += i.eatWhiteSpace(n, l);
        var p = {
            startStaff: A
        };
        var D = function(v) {
            var s = i.getVoiceToken(n, l, k);
            if (s.warn !== undefined) {
                f("Expected value for " + v + " in voice: " + s.warn, n, l)
            } else {
                if (s.token.length === 0 && n.charAt(l) !== '"') {
                    f("Expected value for " + v + " in voice", n, l)
                } else {
                    p[v] = s.token
                }
            }
            l += s.len
        };
        var z = function(F, v, E) {
            var s = i.getVoiceToken(n, l, k);
            if (s.warn !== undefined) {
                f("Expected value for " + v + " in voice: " + s.warn, n, l)
            } else {
                if (s.token.length === 0 && n.charAt(l) !== '"') {
                    f("Expected value for " + v + " in voice", n, l)
                } else {
                    if (E === "number") {
                        s.token = parseFloat(s.token)
                    }
                    b.voices[F][v] = s.token
                }
            }
            l += s.len
        };
        while (l < k) {
            var m = i.getVoiceToken(n, l, k);
            l += m.len;
            if (m.warn) {
                f("Error parsing voice: " + m.warn, n, l)
            } else {
                var u = null;
                switch (m.token) {
                    case "clef":
                    case "cl":
                        D("clef");
                        var t = 0;
                        if (p.clef !== undefined) {
                            p.clef = p.clef.replace(/[',]/g, "");
                            if (p.clef.indexOf("+16") !== -1) {
                                t += 14;
                                p.clef = p.clef.replace("+16", "")
                            }
                            p.verticalPos = j(p.clef, t)
                        }
                        break;
                    case "treble":
                    case "bass":
                    case "tenor":
                    case "alto":
                    case "none":
                    case "treble'":
                    case "bass'":
                    case "tenor'":
                    case "alto'":
                    case "none'":
                    case "treble''":
                    case "bass''":
                    case "tenor''":
                    case "alto''":
                    case "none''":
                    case "treble,":
                    case "bass,":
                    case "tenor,":
                    case "alto,":
                    case "none,":
                    case "treble,,":
                    case "bass,,":
                    case "tenor,,":
                    case "alto,,":
                    case "none,,":
                        var w = 0;
                        p.clef = m.token.replace(/[',]/g, "");
                        p.verticalPos = j(p.clef, w);
                        break;
                    case "staves":
                    case "stave":
                    case "stv":
                        D("staves");
                        break;
                    case "brace":
                    case "brc":
                        D("brace");
                        break;
                    case "bracket":
                    case "brk":
                        D("bracket");
                        break;
                    case "name":
                    case "nm":
                        D("name");
                        break;
                    case "subname":
                    case "sname":
                    case "snm":
                        D("subname");
                        break;
                    case "merge":
                        p.startStaff = false;
                        break;
                    case "stems":
                        u = i.getVoiceToken(n, l, k);
                        if (u.warn !== undefined) {
                            f("Expected value for stems in voice: " + u.warn, n, l)
                        } else {
                            if (u.token === "up" || u.token === "down") {
                                b.voices[r].stem = u.token
                            } else {
                                f("Expected up or down for voice stem", n, l)
                            }
                        }
                        l += u.len;
                        break;
                    case "up":
                    case "down":
                        b.voices[r].stem = m.token;
                        break;
                    case "middle":
                    case "m":
                        D("verticalPos");
                        p.verticalPos = a(p.verticalPos).mid;
                        break;
                    case "gchords":
                    case "gch":
                        b.voices[r].suppressChords = true;
                        break;
                    case "space":
                    case "spc":
                        D("spacing");
                        break;
                    case "scale":
                        z(r, "scale", "number");
                        break;
                    case "transpose":
                        z(r, "transpose", "number");
                        break
                }
            }
            l += i.eatWhiteSpace(n, l)
        }
        if (p.startStaff || b.staves.length === 0) {
            b.staves.push({
                index: b.staves.length,
                meter: b.origMeter
            });
            if (!b.score_is_present) {
                b.staves[b.staves.length - 1].numVoices = 0
            }
        }
        if (b.voices[r].staffNum === undefined) {
            b.voices[r].staffNum = b.staves.length - 1;
            var B = 0;
            for (var o in b.voices) {
                if (b.voices.hasOwnProperty(o)) {
                    if (b.voices[o].staffNum === b.voices[r].staffNum) {
                        B++
                    }
                }
            }
            b.voices[r].index = B - 1
        }
        var q = b.staves[b.voices[r].staffNum];
        if (!b.score_is_present) {
            q.numVoices++
        }
        if (p.clef) {
            q.clef = {
                type: p.clef,
                verticalPos: p.verticalPos
            }
        }
        if (p.spacing) {
            q.spacing_below_offset = p.spacing
        }
        if (p.verticalPos) {
            q.verticalPos = p.verticalPos
        }
        if (p.name) {
            if (q.name) {
                q.name.push(p.name)
            } else {
                q.name = [p.name]
            }
        }
        if (p.subname) {
            if (q.subname) {
                q.subname.push(p.subname)
            } else {
                q.subname = [p.subname]
            }
        }
        g(r)
    }
})();
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.parse) {
    ABCJS.parse = {}
}
ABCJS.parse.tokenizer = function() {
    this.skipWhiteSpace = function(j) {
        for (var h = 0; h < j.length; h++) {
            if (!this.isWhiteSpace(j.charAt(h))) {
                return h
            }
        }
        return j.length
    };
    var g = function(j, h) {
        return h >= j.length
    };
    this.eatWhiteSpace = function(h, j) {
        for (var k = j; k < h.length; k++) {
            if (!this.isWhiteSpace(h.charAt(k))) {
                return k - j
            }
        }
        return k - j
    };
    this.getKeyPitch = function(j) {
        var h = this.skipWhiteSpace(j);
        if (g(j, h)) {
            return {
                len: 0
            }
        }
        switch (j.charAt(h)) {
            case "A":
                return {
                    len: h + 1,
                    token: "A"
                };
            case "B":
                return {
                    len: h + 1,
                    token: "B"
                };
            case "C":
                return {
                    len: h + 1,
                    token: "C"
                };
            case "D":
                return {
                    len: h + 1,
                    token: "D"
                };
            case "E":
                return {
                    len: h + 1,
                    token: "E"
                };
            case "F":
                return {
                    len: h + 1,
                    token: "F"
                };
            case "G":
                return {
                    len: h + 1,
                    token: "G"
                }
        }
        return {
            len: 0
        }
    };
    this.getSharpFlat = function(h) {
        if (h === "bass") {
            return {
                len: 0
            }
        }
        switch (h.charAt(0)) {
            case "#":
                return {
                    len: 1,
                    token: "#"
                };
            case "b":
                return {
                    len: 1,
                    token: "b"
                }
        }
        return {
            len: 0
        }
    };
    this.getMode = function(l) {
        var k = function(i, m) {
            while (m < i.length && ((i.charAt(m) >= "a" && i.charAt(m) <= "z") || (i.charAt(m) >= "A" && i.charAt(m) <= "Z"))) {
                m++
            }
            return m
        };
        var j = this.skipWhiteSpace(l);
        if (g(l, j)) {
            return {
                len: 0
            }
        }
        var h = l.substring(j, j + 3).toLowerCase();
        if (h.length > 1 && h.charAt(1) === " " || h.charAt(1) === "^" || h.charAt(1) === "_" || h.charAt(1) === "=") {
            h = h.charAt(0)
        }
        switch (h) {
            case "mix":
                return {
                    len: k(l, j),
                    token: "Mix"
                };
            case "dor":
                return {
                    len: k(l, j),
                    token: "Dor"
                };
            case "phr":
                return {
                    len: k(l, j),
                    token: "Phr"
                };
            case "lyd":
                return {
                    len: k(l, j),
                    token: "Lyd"
                };
            case "loc":
                return {
                    len: k(l, j),
                    token: "Loc"
                };
            case "aeo":
                return {
                    len: k(l, j),
                    token: "m"
                };
            case "maj":
                return {
                    len: k(l, j),
                    token: ""
                };
            case "ion":
                return {
                    len: k(l, j),
                    token: ""
                };
            case "min":
                return {
                    len: k(l, j),
                    token: "m"
                };
            case "m":
                return {
                    len: k(l, j),
                    token: "m"
                }
        }
        return {
            len: 0
        }
    };
    this.getClef = function(o, n) {
        var h = o;
        var m = this.skipWhiteSpace(o);
        if (g(o, m)) {
            return {
                len: 0
            }
        }
        var q = false;
        var p = o.substring(m);
        if (ABCJS.parse.startsWith(p, "clef=")) {
            q = true;
            p = p.substring(5);
            m += 5
        }
        if (p.length === 0 && q) {
            return {
                len: m + 5,
                warn: "No clef specified: " + h
            }
        }
        var l = this.skipWhiteSpace(p);
        if (g(p, l)) {
            return {
                len: 0
            }
        }
        if (l > 0) {
            m += l;
            p = p.substring(l)
        }
        var k = null;
        if (ABCJS.parse.startsWith(p, "treble")) {
            k = "treble"
        } else {
            if (ABCJS.parse.startsWith(p, "bass3")) {
                k = "bass3"
            } else {
                if (ABCJS.parse.startsWith(p, "bass")) {
                    k = "bass"
                } else {
                    if (ABCJS.parse.startsWith(p, "tenor")) {
                        k = "tenor"
                    } else {
                        if (ABCJS.parse.startsWith(p, "alto2")) {
                            k = "alto2"
                        } else {
                            if (ABCJS.parse.startsWith(p, "alto1")) {
                                k = "alto1"
                            } else {
                                if (ABCJS.parse.startsWith(p, "alto")) {
                                    k = "alto"
                                } else {
                                    if (!n && (q && ABCJS.parse.startsWith(p, "none"))) {
                                        k = "none"
                                    } else {
                                        if (ABCJS.parse.startsWith(p, "perc")) {
                                            k = "perc"
                                        } else {
                                            if (!n && (q && ABCJS.parse.startsWith(p, "C"))) {
                                                k = "tenor"
                                            } else {
                                                if (!n && (q && ABCJS.parse.startsWith(p, "F"))) {
                                                    k = "bass"
                                                } else {
                                                    if (!n && (q && ABCJS.parse.startsWith(p, "G"))) {
                                                        k = "treble"
                                                    } else {
                                                        return {
                                                            len: m + 5,
                                                            warn: "Unknown clef specified: " + h
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        p = p.substring(k.length);
        l = this.isMatch(p, "+8");
        if (l > 0) {
            k += "+8"
        } else {
            l = this.isMatch(p, "-8");
            if (l > 0) {
                k += "-8"
            }
        }
        return {
            len: m + k.length,
            token: k,
            explicit: q
        }
    };
    this.getBarLine = function(h, k) {
        switch (h.charAt(k)) {
            case "]":
                ++k;
                switch (h.charAt(k)) {
                    case "|":
                        return {
                            len: 2,
                            token: "bar_thick_thin"
                        };
                    case "[":
                        ++k;
                        if ((h.charAt(k) >= "1" && h.charAt(k) <= "9") || h.charAt(k) === '"') {
                            return {
                                len: 2,
                                token: "bar_invisible"
                            }
                        }
                        return {
                            len: 1,
                            warn: "Unknown bar symbol"
                        };
                    default:
                        return {
                            len: 1,
                            token: "bar_invisible"
                        }
                }
                break;
            case ":":
                ++k;
                switch (h.charAt(k)) {
                    case ":":
                        return {
                            len: 2,
                            token: "bar_dbl_repeat"
                        };
                    case "|":
                        ++k;
                        switch (h.charAt(k)) {
                            case "]":
                                ++k;
                                switch (h.charAt(k)) {
                                    case "|":
                                        ++k;
                                        if (h.charAt(k) === ":") {
                                            return {
                                                len: 5,
                                                token: "bar_dbl_repeat"
                                            }
                                        }
                                        return {
                                            len: 3,
                                            token: "bar_right_repeat"
                                        };
                                    default:
                                        return {
                                            len: 3,
                                            token: "bar_right_repeat"
                                        }
                                }
                                break;
                            case "|":
                                ++k;
                                if (h.charAt(k) === ":") {
                                    return {
                                        len: 4,
                                        token: "bar_dbl_repeat"
                                    }
                                }
                                return {
                                    len: 3,
                                    token: "bar_right_repeat"
                                };
                            default:
                                return {
                                    len: 2,
                                    token: "bar_right_repeat"
                                }
                        }
                        break;
                    default:
                        return {
                            len: 1,
                            warn: "Unknown bar symbol"
                        }
                }
                break;
            case "[":
                ++k;
                if (h.charAt(k) === "|") {
                    ++k;
                    switch (h.charAt(k)) {
                        case ":":
                            return {
                                len: 3,
                                token: "bar_left_repeat"
                            };
                        case "]":
                            return {
                                len: 3,
                                token: "bar_invisible"
                            };
                        default:
                            return {
                                len: 2,
                                token: "bar_thick_thin"
                            }
                    }
                } else {
                    if ((h.charAt(k) >= "1" && h.charAt(k) <= "9") || h.charAt(k) === '"') {
                        return {
                            len: 1,
                            token: "bar_invisible"
                        }
                    }
                    return {
                        len: 0
                    }
                }
                break;
            case "|":
                ++k;
                switch (h.charAt(k)) {
                    case "]":
                        return {
                            len: 2,
                            token: "bar_thin_thick"
                        };
                    case "|":
                        ++k;
                        if (h.charAt(k) === ":") {
                            return {
                                len: 3,
                                token: "bar_left_repeat"
                            }
                        }
                        return {
                            len: 2,
                            token: "bar_thin_thin"
                        };
                    case ":":
                        var j = 0;
                        while (h.charAt(k + j) === ":") {
                            j++
                        }
                        return {
                            len: 1 + j,
                            token: "bar_left_repeat"
                        };
                    default:
                        return {
                            len: 1,
                            token: "bar_thin"
                        }
                }
                break
        }
        return {
            len: 0
        }
    };
    this.getTokenOf = function(k, j) {
        for (var h = 0; h < k.length; h++) {
            if (j.indexOf(k.charAt(h)) < 0) {
                return {
                    len: h,
                    token: k.substring(0, h)
                }
            }
        }
        return {
            len: h,
            token: k
        }
    };
    this.getToken = function(k, l, h) {
        var j = l;
        while (j < h && !this.isWhiteSpace(k.charAt(j))) {
            j++
        }
        return k.substring(l, j)
    };
    this.isMatch = function(k, h) {
        var j = this.skipWhiteSpace(k);
        if (g(k, j)) {
            return 0
        }
        if (ABCJS.parse.startsWith(k.substring(j), h)) {
            return j + h.length
        }
        return 0
    };
    this.getPitchFromTokens = function(j) {
        var h = {};
        var i = {
            A: 5,
            B: 6,
            C: 0,
            D: 1,
            E: 2,
            F: 3,
            G: 4,
            a: 12,
            b: 13,
            c: 7,
            d: 8,
            e: 9,
            f: 10,
            g: 11
        };
        h.position = i[j[0].token];
        if (h.position === undefined) {
            return {
                warn: "Pitch expected. Found: " + j[0].token
            }
        }
        j.shift();
        while (j.length) {
            switch (j[0].token) {
                case ",":
                    h.position -= 7;
                    j.shift();
                    break;
                case "'":
                    h.position += 7;
                    j.shift();
                    break;
                default:
                    return h
            }
        }
        return h
    };
    this.getKeyAccidentals2 = function(j) {
        var h;
        while (j.length > 0) {
            var i;
            if (j[0].token === "^") {
                i = "sharp";
                j.shift();
                if (j.length === 0) {
                    return {
                        accs: h,
                        warn: "Expected note name after " + i
                    }
                }
                switch (j[0].token) {
                    case "^":
                        i = "dblsharp";
                        j.shift();
                        break;
                    case "/":
                        i = "quartersharp";
                        j.shift();
                        break
                }
            } else {
                if (j[0].token === "=") {
                    i = "natural";
                    j.shift()
                } else {
                    if (j[0].token === "_") {
                        i = "flat";
                        j.shift();
                        if (j.length === 0) {
                            return {
                                accs: h,
                                warn: "Expected note name after " + i
                            }
                        }
                        switch (j[0].token) {
                            case "_":
                                i = "dblflat";
                                j.shift();
                                break;
                            case "/":
                                i = "quarterflat";
                                j.shift();
                                break
                        }
                    } else {
                        return {
                            accs: h
                        }
                    }
                }
            }
            if (j.length === 0) {
                return {
                    accs: h,
                    warn: "Expected note name after " + i
                }
            }
            switch (j[0].token.charAt(0)) {
                case "a":
                case "b":
                case "c":
                case "d":
                case "e":
                case "f":
                case "g":
                case "A":
                case "B":
                case "C":
                case "D":
                case "E":
                case "F":
                case "G":
                    if (h === undefined) {
                        h = []
                    }
                    h.push({
                        acc: i,
                        note: j[0].token.charAt(0)
                    });
                    if (j[0].token.length === 1) {
                        j.shift()
                    } else {
                        j[0].token = j[0].token.substring(1)
                    }
                    break;
                default:
                    return {
                        accs: h,
                        warn: "Expected note name after " + i + " Found: " + j[0].token
                    }
            }
        }
        return {
            accs: h
        }
    };
    this.getKeyAccidental = function(l) {
        var k = {
            "^": "sharp",
            "^^": "dblsharp",
            "=": "natural",
            _: "flat",
            __: "dblflat",
            "_/": "quarterflat",
            "^/": "quartersharp"
        };
        var h = this.skipWhiteSpace(l);
        if (g(l, h)) {
            return {
                len: 0
            }
        }
        var j = null;
        switch (l.charAt(h)) {
            case "^":
            case "_":
            case "=":
                j = l.charAt(h);
                break;
            default:
                return {
                    len: 0
                }
        }
        h++;
        if (g(l, h)) {
            return {
                len: 1,
                warn: "Expected note name after accidental"
            }
        }
        switch (l.charAt(h)) {
            case "a":
            case "b":
            case "c":
            case "d":
            case "e":
            case "f":
            case "g":
            case "A":
            case "B":
            case "C":
            case "D":
            case "E":
            case "F":
            case "G":
                return {
                    len: h + 1,
                    token: {
                        acc: k[j],
                        note: l.charAt(h)
                    }
                };
            case "^":
            case "_":
            case "/":
                j += l.charAt(h);
                h++;
                if (g(l, h)) {
                    return {
                        len: 2,
                        warn: "Expected note name after accidental"
                    }
                }
                switch (l.charAt(h)) {
                    case "a":
                    case "b":
                    case "c":
                    case "d":
                    case "e":
                    case "f":
                    case "g":
                    case "A":
                    case "B":
                    case "C":
                    case "D":
                    case "E":
                    case "F":
                    case "G":
                        return {
                            len: h + 1,
                            token: {
                                acc: k[j],
                                note: l.charAt(h)
                            }
                        };
                    default:
                        return {
                            len: 2,
                            warn: "Expected note name after accidental"
                        }
                }
                break;
            default:
                return {
                    len: 1,
                    warn: "Expected note name after accidental"
                }
        }
    };
    this.isWhiteSpace = function(h) {
        return h === " " || h === "\t" || h === "\x12"
    };
    this.getMeat = function(i, k, h) {
        var j = i.indexOf("%", k);
        if (j >= 0 && j < h) {
            h = j
        }
        while (k < h && (i.charAt(k) === " " || i.charAt(k) === "\t" || i.charAt(k) === "\x12")) {
            k++
        }
        while (k < h && (i.charAt(h - 1) === " " || i.charAt(h - 1) === "\t" || i.charAt(h - 1) === "\x12")) {
            h--
        }
        return {
            start: k,
            end: h
        }
    };
    var d = function(h) {
        return (h >= "A" && h <= "Z") || (h >= "a" && h <= "z")
    };
    var c = function(h) {
        return (h >= "0" && h <= "9")
    };
    this.tokenize = function(r, j, k) {
        var n = this.getMeat(r, j, k);
        j = n.start;
        k = n.end;
        var p = [];
        var l;
        while (j < k) {
            if (r.charAt(j) === '"') {
                l = j + 1;
                while (l < k && r.charAt(l) !== '"') {
                    l++
                }
                p.push({
                    type: "quote",
                    token: r.substring(j + 1, l),
                    start: j + 1,
                    end: l
                });
                l++
            } else {
                if (d(r.charAt(j))) {
                    l = j + 1;
                    while (l < k && d(r.charAt(l))) {
                        l++
                    }
                    p.push({
                        type: "alpha",
                        token: r.substring(j, l),
                        continueId: c(r.charAt(l)),
                        start: j,
                        end: l
                    });
                    j = l + 1
                } else {
                    if (r.charAt(j) === "." && c(r.charAt(l + 1))) {
                        l = j + 1;
                        var q = null;
                        var m = null;
                        while (l < k && c(r.charAt(l))) {
                            l++
                        }
                        m = parseFloat(r.substring(j, l));
                        p.push({
                            type: "number",
                            token: r.substring(j, l),
                            intt: q,
                            floatt: m,
                            continueId: d(r.charAt(l)),
                            start: j,
                            end: l
                        });
                        j = l + 1
                    } else {
                        if (c(r.charAt(j)) || (r.charAt(j) === "-" && c(r.charAt(l + 1)))) {
                            l = j + 1;
                            var h = null;
                            var o = null;
                            while (l < k && c(r.charAt(l))) {
                                l++
                            }
                            if (r.charAt(l) === "." && c(r.charAt(l + 1))) {
                                l++;
                                while (l < k && c(r.charAt(l))) {
                                    l++
                                }
                            } else {
                                h = parseInt(r.substring(j, l))
                            }
                            o = parseFloat(r.substring(j, l));
                            p.push({
                                type: "number",
                                token: r.substring(j, l),
                                intt: h,
                                floatt: o,
                                continueId: d(r.charAt(l)),
                                start: j,
                                end: l
                            });
                            j = l + 1
                        } else {
                            if (r.charAt(j) === " " || r.charAt(j) === "\t") {
                                l = j + 1
                            } else {
                                p.push({
                                    type: "punct",
                                    token: r.charAt(j),
                                    start: j,
                                    end: j + 1
                                });
                                l = j + 1
                            }
                        }
                    }
                }
            }
            j = l
        }
        return p
    };
    this.getVoiceToken = function(j, n, h) {
        var k = n;
        while (k < h && this.isWhiteSpace(j.charAt(k)) || j.charAt(k) === "=") {
            k++
        }
        if (j.charAt(k) === '"') {
            var m = j.indexOf('"', k + 1);
            if (m === -1 || m >= h) {
                return {
                    len: 1,
                    err: "Missing close quote"
                }
            }
            return {
                len: m - n + 1,
                token: this.translateString(j.substring(k + 1, m))
            }
        } else {
            var l = k;
            while (l < h && !this.isWhiteSpace(j.charAt(l)) && j.charAt(l) !== "=") {
                l++
            }
            return {
                len: l - n + 1,
                token: j.substring(k, l)
            }
        }
    };
    var f = {
        "`a": "à",
        "'a": "á",
        "^a": "â",
        "~a": "ã",
        '"a': "ä",
        oa: "å",
        "=a": "ā",
        ua: "ă",
        ";a": "ą",
        "`e": "è",
        "'e": "é",
        "^e": "ê",
        '"e': "ë",
        "=e": "ē",
        ue: "ĕ",
        ";e": "ę",
        ".e": "ė",
        "`i": "ì",
        "'i": "í",
        "^i": "î",
        '"i': "ï",
        "=i": "ī",
        ui: "ĭ",
        ";i": "į",
        "`o": "ò",
        "'o": "ó",
        "^o": "ô",
        "~o": "õ",
        '"o': "ö",
        "=o": "ō",
        uo: "ŏ",
        "/o": "ø",
        "`u": "ù",
        "'u": "ú",
        "^u": "û",
        "~u": "ũ",
        '"u': "ü",
        ou: "ů",
        "=u": "ū",
        uu: "ŭ",
        ";u": "ų",
        "`A": "À",
        "'A": "Á",
        "^A": "Â",
        "~A": "Ã",
        '"A': "Ä",
        oA: "Å",
        "=A": "Ā",
        uA: "Ă",
        ";A": "Ą",
        "`E": "È",
        "'E": "É",
        "^E": "Ê",
        '"E': "Ë",
        "=E": "Ē",
        uE: "Ĕ",
        ";E": "Ę",
        ".E": "Ė",
        "`I": "Ì",
        "'I": "Í",
        "^I": "Î",
        "~I": "Ĩ",
        '"I': "Ï",
        "=I": "Ī",
        uI: "Ĭ",
        ";I": "Į",
        ".I": "İ",
        "`O": "Ò",
        "'O": "Ó",
        "^O": "Ô",
        "~O": "Õ",
        '"O': "Ö",
        "=O": "Ō",
        uO: "Ŏ",
        "/O": "Ø",
        "`U": "Ù",
        "'U": "Ú",
        "^U": "Û",
        "~U": "Ũ",
        '"U': "Ü",
        oU: "Ů",
        "=U": "Ū",
        uU: "Ŭ",
        ";U": "Ų",
        ae: "æ",
        AE: "Æ",
        oe: "œ",
        OE: "Œ",
        ss: "ß",
        "'c": "ć",
        "^c": "ĉ",
        uc: "č",
        cc: "ç",
        ".c": "ċ",
        cC: "Ç",
        "'C": "Ć",
        "^C": "Ĉ",
        uC: "Č",
        ".C": "Ċ",
        "~n": "ñ",
        "=s": "š",
        vs: "š",
        vz: "ž"
    };
    var e = {
        "#": "♯",
        b: "♭",
        "=": "♮"
    };
    var b = {
        "201": "♯",
        "202": "♭",
        "203": "♮",
        "241": "¡",
        "242": "¢",
        "252": "a",
        "262": "2",
        "272": "o",
        "302": "Â",
        "312": "Ê",
        "322": "Ò",
        "332": "Ú",
        "342": "â",
        "352": "ê",
        "362": "ò",
        "372": "ú",
        "243": "£",
        "253": "«",
        "263": "3",
        "273": "»",
        "303": "Ã",
        "313": "Ë",
        "323": "Ó",
        "333": "Û",
        "343": "ã",
        "353": "ë",
        "363": "ó",
        "373": "û",
        "244": "¤",
        "254": "¬",
        "264": "  ́",
        "274": "1⁄4",
        "304": "Ä",
        "314": "Ì",
        "324": "Ô",
        "334": "Ü",
        "344": "ä",
        "354": "ì",
        "364": "ô",
        "374": "ü",
        "245": "¥",
        "255": "-",
        "265": "μ",
        "275": "1⁄2",
        "305": "Å",
        "315": "Í",
        "325": "Õ",
        "335": "Ý",
        "345": "å",
        "355": "í",
        "365": "õ",
        "375": "ý",
        "246": "¦",
        "256": "®",
        "266": "¶",
        "276": "3⁄4",
        "306": "Æ",
        "316": "Î",
        "326": "Ö",
        "336": "Þ",
        "346": "æ",
        "356": "î",
        "366": "ö",
        "376": "þ",
        "247": "§",
        "257": " ̄",
        "267": "·",
        "277": "¿",
        "307": "Ç",
        "317": "Ï",
        "327": "×",
        "337": "ß",
        "347": "ç",
        "357": "ï",
        "367": "÷",
        "377": "ÿ",
        "250": " ̈",
        "260": "°",
        "270": " ̧",
        "300": "À",
        "310": "È",
        "320": "Ð",
        "330": "Ø",
        "340": "à",
        "350": "è",
        "360": "ð",
        "370": "ø",
        "251": "©",
        "261": "±",
        "271": "1",
        "301": "Á",
        "311": "É",
        "321": "Ñ",
        "331": "Ù",
        "341": "á",
        "351": "é",
        "361": "ñ",
        "371": "ù"
    };
    this.translateString = function(j) {
        var h = j.split("\\");
        if (h.length === 1) {
            return j
        }
        var i = null;
        ABCJS.parse.each(h, function(k) {
            if (i === null) {
                i = k
            } else {
                var l = f[k.substring(0, 2)];
                if (l !== undefined) {
                    i += l + k.substring(2)
                } else {
                    l = b[k.substring(0, 3)];
                    if (l !== undefined) {
                        i += l + k.substring(3)
                    } else {
                        l = e[k.substring(0, 1)];
                        if (l !== undefined) {
                            i += l + k.substring(1)
                        } else {
                            i += "\\" + k
                        }
                    }
                }
            }
        });
        return i
    };
    this.getNumber = function(h, j) {
        var i = 0;
        while (j < h.length) {
            switch (h.charAt(j)) {
                case "0":
                    i = i * 10;
                    j++;
                    break;
                case "1":
                    i = i * 10 + 1;
                    j++;
                    break;
                case "2":
                    i = i * 10 + 2;
                    j++;
                    break;
                case "3":
                    i = i * 10 + 3;
                    j++;
                    break;
                case "4":
                    i = i * 10 + 4;
                    j++;
                    break;
                case "5":
                    i = i * 10 + 5;
                    j++;
                    break;
                case "6":
                    i = i * 10 + 6;
                    j++;
                    break;
                case "7":
                    i = i * 10 + 7;
                    j++;
                    break;
                case "8":
                    i = i * 10 + 8;
                    j++;
                    break;
                case "9":
                    i = i * 10 + 9;
                    j++;
                    break;
                default:
                    return {
                        num: i,
                        index: j
                    }
            }
        }
        return {
            num: i,
            index: j
        }
    };
    this.getFraction = function(h, k) {
        var j = 1;
        var o = 1;
        if (h.charAt(k) !== "/") {
            var i = this.getNumber(h, k);
            j = i.num;
            k = i.index
        }
        if (h.charAt(k) === "/") {
            k++;
            if (h.charAt(k) === "/") {
                var n = 0.5;
                while (h.charAt(k++) === "/") {
                    n = n / 2
                }
                return {
                    value: j * n,
                    index: k - 1
                }
            } else {
                var l = k;
                var m = this.getNumber(h, k);
                if (m.num === 0 && l === k) {
                    m.num = 2
                }
                if (m.num !== 0) {
                    o = m.num
                }
                k = m.index
            }
        }
        return {
            value: j / o,
            index: k
        }
    };
    this.theReverser = function(h) {
        if (ABCJS.parse.endsWith(h, ", The")) {
            return "The " + h.substring(0, h.length - 5)
        }
        if (ABCJS.parse.endsWith(h, ", A")) {
            return "A " + h.substring(0, h.length - 3)
        }
        return h
    };
    this.stripComment = function(j) {
        var h = j.indexOf("%");
        if (h >= 0) {
            return ABCJS.parse.strip(j.substring(0, h))
        }
        return ABCJS.parse.strip(j)
    };
    this.getInt = function(l) {
        var h = parseInt(l);
        if (isNaN(h)) {
            return {
                digits: 0
            }
        }
        var k = "" + h;
        var j = l.indexOf(k);
        return {
            value: h,
            digits: j + k.length
        }
    };
    this.getFloat = function(l) {
        var h = parseFloat(l);
        if (isNaN(h)) {
            return {
                digits: 0
            }
        }
        var k = "" + h;
        var j = l.indexOf(k);
        return {
            value: h,
            digits: j + k.length
        }
    };
    this.getMeasurement = function(k) {
        if (k.length === 0) {
            return {
                used: 0
            }
        }
        var j = 1;
        var i = "";
        if (k[0].token === "-") {
            k.shift();
            i = "-";
            j++
        } else {
            if (k[0].type !== "number") {
                return {
                    used: 0
                }
            }
        }
        i += k.shift().token;
        if (k.length === 0) {
            return {
                used: 1,
                value: parseInt(i)
            }
        }
        var h = k.shift();
        if (h.token === ".") {
            j++;
            if (k.length === 0) {
                return {
                    used: j,
                    value: parseInt(i)
                }
            }
            if (k[0].type === "number") {
                h = k.shift();
                i = i + "." + h.token;
                j++;
                if (k.length === 0) {
                    return {
                        used: j,
                        value: parseFloat(i)
                    }
                }
            }
            h = k.shift()
        }
        switch (h.token) {
            case "pt":
                return {
                    used: j + 1,
                    value: parseFloat(i)
                };
            case "cm":
                return {
                    used: j + 1,
                    value: parseFloat(i) / 2.54 * 72
                };
            case "in":
                return {
                    used: j + 1,
                    value: parseFloat(i) * 72
                };
            default:
                k.unshift(h);
                return {
                    used: j,
                    value: parseFloat(i)
                }
        }
        return {
            used: 0
        }
    };
    var a = function(h) {
        while (h.indexOf("\\n") !== -1) {
            h = h.replace("\\n", "\n")
        }
        return h
    };
    this.getBrackettedSubstring = function(h, j, n, l) {
        var k = l || h.charAt(j);
        var m = j + 1;
        while ((m < h.length) && (h.charAt(m) !== k)) {
            ++m
        }
        if (h.charAt(m) === k) {
            return [m - j + 1, a(h.substring(j + 1, m)), true]
        } else {
            m = j + n;
            if (m > h.length - 1) {
                m = h.length - 1
            }
            return [m - j + 1, a(h.substring(j + 1, m)), false]
        }
    }
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.AbsoluteElement = function(d, c, b, a) {
    this.abcelem = d;
    this.duration = c;
    this.minspacing = b || 0;
    this.x = 0;
    this.children = [];
    this.heads = [];
    this.extra = [];
    this.extraw = 0;
    this.w = 0;
    this.right = [];
    this.invisible = false;
    this.bottom = 7;
    this.top = 7;
    this.type = a
};
ABCJS.write.AbsoluteElement.prototype.getMinWidth = function() {
    return this.w
};
ABCJS.write.AbsoluteElement.prototype.getExtraWidth = function() {
    return -this.extraw
};
ABCJS.write.AbsoluteElement.prototype.addExtra = function(a) {
    if (a.dx < this.extraw) {
        this.extraw = a.dx
    }
    this.extra[this.extra.length] = a;
    this.addChild(a)
};
ABCJS.write.AbsoluteElement.prototype.addHead = function(a) {
    if (a.dx < this.extraw) {
        this.extraw = a.dx
    }
    this.heads[this.heads.length] = a;
    this.addRight(a)
};
ABCJS.write.AbsoluteElement.prototype.addRight = function(a) {
    if (a.dx + a.w > this.w) {
        this.w = a.dx + a.w
    }
    this.right[this.right.length] = a;
    this.addChild(a)
};
ABCJS.write.AbsoluteElement.prototype.addChild = function(a) {
    a.parent = this;
    this.children[this.children.length] = a;
    this.pushTop(a.top);
    this.pushBottom(a.bottom)
};
ABCJS.write.AbsoluteElement.prototype.pushTop = function(a) {
    this.top = Math.max(a, this.top)
};
ABCJS.write.AbsoluteElement.prototype.pushBottom = function(a) {
    this.bottom = Math.min(a, this.bottom)
};
ABCJS.write.AbsoluteElement.prototype.draw = function(e, f) {
    this.elemset = e.paper.set();
    if (this.invisible) {
        return
    }
    e.beginGroup();
    for (var d = 0; d < this.children.length; d++) {
        this.elemset.push(this.children[d].draw(e, this.x, f))
    }
    this.elemset.push(e.endGroup(this.type));
    if (this.klass) {
        this.setClass("mark", "", "#00ff00")
    }
    var c = this;
    this.elemset.mouseup(function() {
        e.notifySelect(c)
    });
    this.abcelem.abselem = this;
    var h = ABCJS.write.spacing.STEP * e.scale;
    var g = function() {
            this.dy = 0
        },
        b = function(j, i) {
            i = Math.round(i / h) * h;
            this.translate(0, -this.dy);
            this.dy = i;
            this.translate(0, this.dy)
        },
        a = function() {
            var i = -Math.round(this.dy / h);
            c.abcelem.pitches[0].pitch += i;
            c.abcelem.pitches[0].verticalPos += i;
            e.notifyChange()
        };
    if (this.abcelem.el_type === "note" && e.editable) {
        this.elemset.drag(b, g, a)
    }
};
ABCJS.write.AbsoluteElement.prototype.isIE =
    /*@cc_on!@*/
    false;
ABCJS.write.AbsoluteElement.prototype.setClass = function(d, e, b) {
    if (b !== null) {
        this.elemset.attr({
            fill: b
        })
    }
    if (!this.isIE) {
        for (var c = 0; c < this.elemset.length; c++) {
            if (this.elemset[c][0].setAttribute) {
                var a = this.elemset[c][0].getAttribute("class");
                if (!a) {
                    a = ""
                }
                a = a.replace(e, "");
                a = a.replace(d, "");
                if (d.length > 0) {
                    if (a.length > 0 && a.charAt(a.length - 1) !== " ") {
                        a += " "
                    }
                    a += d
                }
                this.elemset[c][0].setAttribute("class", a)
            }
        }
    }
};
ABCJS.write.AbsoluteElement.prototype.highlight = function(a, b) {
    if (a === undefined) {
        a = "note_selected"
    }
    if (b === undefined) {
        b = "#ff0000"
    }
    this.setClass(a, "", b)
};
ABCJS.write.AbsoluteElement.prototype.unhighlight = function(a, b) {
    if (a === undefined) {
        a = "note_selected"
    }
    if (b === undefined) {
        b = "#000000"
    }
    this.setClass("", a, b)
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.BeamElem = function(a, b) {
    this.isflat = (b);
    this.isgrace = (a && a === "grace");
    this.forceup = (a && a === "up");
    this.forcedown = (a && a === "down");
    this.elems = [];
    this.total = 0;
    this.dy = (this.asc) ? ABCJS.write.spacing.STEP * 1.2 : -ABCJS.write.spacing.STEP * 1.2;
    if (this.isgrace) {
        this.dy = this.dy * 0.4
    }
    this.allrests = true
};
ABCJS.write.BeamElem.prototype.add = function(a) {
    var b = a.abcelem.averagepitch;
    if (b === undefined) {
        return
    }
    this.allrests = this.allrests && a.abcelem.rest;
    a.beam = this;
    this.elems.push(a);
    this.total += b;
    if (!this.min || a.abcelem.minpitch < this.min) {
        this.min = a.abcelem.minpitch
    }
    if (!this.max || a.abcelem.maxpitch > this.max) {
        this.max = a.abcelem.maxpitch
    }
};
ABCJS.write.BeamElem.prototype.average = function() {
    try {
        return this.total / this.elems.length
    } catch (a) {
        return 0
    }
};
ABCJS.write.BeamElem.prototype.draw = function(a) {
    if (this.elems.length === 0 || this.allrests) {
        return
    }
    this.drawBeam(a);
    this.drawStems(a)
};
ABCJS.write.BeamElem.prototype.calcDir = function() {
    var a = this.average();
    this.asc = (this.forceup || this.isgrace || a < 6) && (!this.forcedown);
    return this.asc
};
ABCJS.write.BeamElem.prototype.drawBeam = function(g) {
    var b = this.average();
    var i = (this.isgrace) ? 5 : 7;
    this.calcDir();
    var a = this.asc ? 5 : 8;
    this.pos = Math.round(this.asc ? Math.max(b + i, this.max + a) : Math.min(b - i, this.min - a));
    var f = this.elems[0].abcelem.averagepitch - this.elems[this.elems.length - 1].abcelem.averagepitch;
    if (this.isflat) {
        f = 0
    }
    var e = this.elems.length / 2;
    if (f > e) {
        f = e
    }
    if (f < -e) {
        f = -e
    }
    this.starty = g.calcY(this.pos + Math.floor(f / 2));
    this.endy = g.calcY(this.pos + Math.floor(-f / 2));
    var d = this.elems[0].heads[(this.asc) ? 0 : this.elems[0].heads.length - 1];
    var h = this.elems[this.elems.length - 1].heads[(this.asc) ? 0 : this.elems[this.elems.length - 1].heads.length - 1];
    this.startx = d.x;
    if (this.asc) {
        this.startx += d.w - 0.6
    }
    this.endx = h.x;
    if (this.asc) {
        this.endx += h.w
    }
    if (this.asc && this.pos < 6) {
        this.starty = g.calcY(6);
        this.endy = g.calcY(6)
    } else {
        if (!this.asc && this.pos > 6) {
            this.starty = g.calcY(6);
            this.endy = g.calcY(6)
        }
    }
    var c = "M" + this.startx + " " + this.starty + " L" + this.endx + " " + this.endy + "L" + this.endx + " " + (this.endy + this.dy) + " L" + this.startx + " " + (this.starty + this.dy) + "z";
    g.printPath({
        path: c,
        stroke: "none",
        fill: "#000000",
        "class": g.addClasses("beam-elem")
    })
};
ABCJS.write.BeamElem.prototype.drawStems = function(m) {
    var a = [];
    m.beginGroup();
    for (var g = 0, r = this.elems.length; g < r; g++) {
        if (this.elems[g].abcelem.rest) {
            continue
        }
        var n = this.elems[g].heads[(this.asc) ? 0 : this.elems[g].heads.length - 1];
        var e = (this.isgrace) ? 1 / 3 : 1 / 5;
        var b = n.pitch + ((this.asc) ? e : -e);
        var p = m.calcY(b);
        var q = n.x + ((this.asc) ? n.w : 0);
        var l = this.getBarYAt(q);
        var s = (this.asc) ? -0.6 : 0.6;
        m.printStem(q, s, p, l);
        var o = (this.asc) ? 1.5 * ABCJS.write.spacing.STEP : -1.5 * ABCJS.write.spacing.STEP;
        if (this.isgrace) {
            o = o * 2 / 3
        }
        for (var c = ABCJS.write.getDurlog(this.elems[g].abcelem.duration); c < -3; c++) {
            if (a[-4 - c]) {
                a[-4 - c].single = false
            } else {
                a[-4 - c] = {
                    x: q + ((this.asc) ? -0.6 : 0),
                    y: l + o * (-4 - c + 1),
                    durlog: c,
                    single: true
                }
            }
        }
        for (var f = a.length - 1; f >= 0; f--) {
            if (g === r - 1 || ABCJS.write.getDurlog(this.elems[g + 1].abcelem.duration) > (-f - 4)) {
                var k = q;
                var h = l + o * (f + 1);
                if (a[f].single) {
                    k = (g === 0) ? q + 5 : q - 5;
                    h = this.getBarYAt(k) + o * (f + 1)
                }
                var d = "M" + a[f].x + " " + a[f].y + " L" + k + " " + h + "L" + k + " " + (h + this.dy) + " L" + a[f].x + " " + (a[f].y + this.dy) + "z";
                m.printPath({
                    path: d,
                    stroke: "none",
                    fill: "#000000",
                    "class": m.addClasses("beam-elem")
                });
                a = a.slice(0, f)
            }
        }
    }
    m.endGroup("beam-elem")
};
ABCJS.write.BeamElem.prototype.getBarYAt = function(a) {
    return this.starty + (this.endy - this.starty) / (this.endx - this.startx) * (a - this.startx)
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.CrescendoElem = function(c, b, a) {
    this.anchor1 = c;
    this.anchor2 = b;
    this.dir = a
};
ABCJS.write.CrescendoElem.prototype.draw = function(a) {
    if (this.dir === "<") {
        this.drawLine(a, 0, -4);
        this.drawLine(a, 0, 4)
    } else {
        this.drawLine(a, -4, 0);
        this.drawLine(a, 4, 0)
    }
};
ABCJS.write.CrescendoElem.prototype.drawLine = function(d, c, b) {
    var e = d.layouter.minY - 7;
    var a = ABCJS.write.sprintf("M %f %f L %f %f", this.anchor1.x, d.calcY(e) + c - 4, this.anchor2.x, d.calcY(e) + b - 4);
    d.printPath({
        path: a,
        stroke: "#000000",
        "class": d.addClasses("decoration")
    })
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.DynamicDecoration = function(a, b) {
    this.anchor = a;
    this.dec = b
};
ABCJS.write.DynamicDecoration.prototype.draw = function(d, f, a) {
    var e = d.layouter.minY - 7;
    var c = 1;
    var b = 1;
    d.printSymbol(this.anchor.x, e, this.dec, c, b, d.addClasses("decoration"))
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.EndingElem = function(c, b, a) {
    this.text = c;
    this.anchor1 = b;
    this.anchor2 = a
};
ABCJS.write.EndingElem.prototype.draw = function(c, d, b) {
    var a;
    if (this.anchor1) {
        d = this.anchor1.x + this.anchor1.w;
        a = ABCJS.write.sprintf("M %f %f L %f %f", d, c.y, d, c.y + 10);
        c.printPath({
            path: a,
            stroke: "#000000",
            fill: "#000000",
            "class": c.addClasses("ending")
        });
        c.printText(d + 5 * c.scale, 18.5, this.text, "start", "ending").attr({
            "font-size": "" + 10 * c.scale + "px"
        })
    }
    if (this.anchor2) {
        b = this.anchor2.x;
        a = ABCJS.write.sprintf("M %f %f L %f %f", b, c.y, b, c.y + 10);
        c.printPath({
            path: a,
            stroke: "#000000",
            fill: "#000000",
            "class": c.addClasses("ending")
        })
    }
    a = ABCJS.write.sprintf("M %f %f L %f %f", d, c.y, b, c.y);
    c.printPath({
        path: a,
        stroke: "#000000",
        fill: "#000000",
        "class": c.addClasses("ending")
    })
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.Glyphs = function() {
    var a = {
        "rests.whole": {
            d: [
                ["M", 0.06, 0.03],
                ["l", 0.09, -0.06],
                ["l", 5.46, 0],
                ["l", 5.49, 0],
                ["l", 0.09, 0.06],
                ["l", 0.06, 0.09],
                ["l", 0, 2.19],
                ["l", 0, 2.19],
                ["l", -0.06, 0.09],
                ["l", -0.09, 0.06],
                ["l", -5.49, 0],
                ["l", -5.46, 0],
                ["l", -0.09, -0.06],
                ["l", -0.06, -0.09],
                ["l", 0, -2.19],
                ["l", 0, -2.19],
                ["z"]
            ],
            w: 11.25,
            h: 4.68
        },
        "rests.half": {
            d: [
                ["M", 0.06, -4.62],
                ["l", 0.09, -0.06],
                ["l", 5.46, 0],
                ["l", 5.49, 0],
                ["l", 0.09, 0.06],
                ["l", 0.06, 0.09],
                ["l", 0, 2.19],
                ["l", 0, 2.19],
                ["l", -0.06, 0.09],
                ["l", -0.09, 0.06],
                ["l", -5.49, 0],
                ["l", -5.46, 0],
                ["l", -0.09, -0.06],
                ["l", -0.06, -0.09],
                ["l", 0, -2.19],
                ["l", 0, -2.19],
                ["z"]
            ],
            w: 11.25,
            h: 4.68
        },
        "rests.quarter": {
            d: [
                ["M", 1.89, -11.82],
                ["c", 0.12, -0.06, 0.24, -0.06, 0.36, -0.03],
                ["c", 0.09, 0.06, 4.74, 5.58, 4.86, 5.82],
                ["c", 0.21, 0.39, 0.15, 0.78, -0.15, 1.26],
                ["c", -0.24, 0.33, -0.72, 0.81, -1.62, 1.56],
                ["c", -0.45, 0.36, -0.87, 0.75, -0.96, 0.84],
                ["c", -0.93, 0.99, -1.14, 2.49, -0.6, 3.63],
                ["c", 0.18, 0.39, 0.27, 0.48, 1.32, 1.68],
                ["c", 1.92, 2.25, 1.83, 2.16, 1.83, 2.34],
                ["c", -0, 0.18, -0.18, 0.36, -0.36, 0.39],
                ["c", -0.15, -0, -0.27, -0.06, -0.48, -0.27],
                ["c", -0.75, -0.75, -2.46, -1.29, -3.39, -1.08],
                ["c", -0.45, 0.09, -0.69, 0.27, -0.9, 0.69],
                ["c", -0.12, 0.3, -0.21, 0.66, -0.24, 1.14],
                ["c", -0.03, 0.66, 0.09, 1.35, 0.3, 2.01],
                ["c", 0.15, 0.42, 0.24, 0.66, 0.45, 0.96],
                ["c", 0.18, 0.24, 0.18, 0.33, 0.03, 0.42],
                ["c", -0.12, 0.06, -0.18, 0.03, -0.45, -0.3],
                ["c", -1.08, -1.38, -2.07, -3.36, -2.4, -4.83],
                ["c", -0.27, -1.05, -0.15, -1.77, 0.27, -2.07],
                ["c", 0.21, -0.12, 0.42, -0.15, 0.87, -0.15],
                ["c", 0.87, 0.06, 2.1, 0.39, 3.3, 0.9],
                ["l", 0.39, 0.18],
                ["l", -1.65, -1.95],
                ["c", -2.52, -2.97, -2.61, -3.09, -2.7, -3.27],
                ["c", -0.09, -0.24, -0.12, -0.48, -0.03, -0.75],
                ["c", 0.15, -0.48, 0.57, -0.96, 1.83, -2.01],
                ["c", 0.45, -0.36, 0.84, -0.72, 0.93, -0.78],
                ["c", 0.69, -0.75, 1.02, -1.8, 0.9, -2.79],
                ["c", -0.06, -0.33, -0.21, -0.84, -0.39, -1.11],
                ["c", -0.09, -0.15, -0.45, -0.6, -0.81, -1.05],
                ["c", -0.36, -0.42, -0.69, -0.81, -0.72, -0.87],
                ["c", -0.09, -0.18, -0, -0.42, 0.21, -0.51],
                ["z"]
            ],
            w: 7.888,
            h: 21.435
        },
        "rests.8th": {
            d: [
                ["M", 1.68, -6.12],
                ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72],
                ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48],
                ["c", 0.12, 0, 0.18, 0, 0.33, -0.09],
                ["c", 0.39, -0.18, 1.32, -1.29, 1.68, -1.98],
                ["c", 0.09, -0.21, 0.24, -0.3, 0.39, -0.3],
                ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18],
                ["c", 0.03, 0.06, -0.27, 1.11, -1.86, 6.42],
                ["c", -1.02, 3.48, -1.89, 6.39, -1.92, 6.42],
                ["c", 0, 0.03, -0.12, 0.12, -0.24, 0.15],
                ["c", -0.18, 0.09, -0.21, 0.09, -0.45, 0.09],
                ["c", -0.24, 0, -0.3, 0, -0.48, -0.06],
                ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15],
                ["c", -0.06, -0.03, 0.15, -0.57, 1.68, -4.92],
                ["c", 0.96, -2.67, 1.74, -4.89, 1.71, -4.89],
                ["l", -0.51, 0.15],
                ["c", -1.08, 0.36, -1.74, 0.48, -2.55, 0.48],
                ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9],
                ["z"]
            ],
            w: 7.534,
            h: 13.883
        },
        "rests.16th": {
            d: [
                ["M", 3.33, -6.12],
                ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72],
                ["c", 0.15, 0.39, 0.57, 0.57, 0.87, 0.42],
                ["c", 0.39, -0.18, 1.2, -1.23, 1.62, -2.07],
                ["c", 0.06, -0.15, 0.24, -0.24, 0.36, -0.24],
                ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18],
                ["c", 0.03, 0.06, -0.45, 1.86, -2.67, 10.17],
                ["c", -1.5, 5.55, -2.73, 10.14, -2.76, 10.17],
                ["c", -0.03, 0.03, -0.12, 0.12, -0.24, 0.15],
                ["c", -0.18, 0.09, -0.21, 0.09, -0.45, 0.09],
                ["c", -0.24, 0, -0.3, 0, -0.48, -0.06],
                ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15],
                ["c", -0.06, -0.03, 0.12, -0.57, 1.44, -4.92],
                ["c", 0.81, -2.67, 1.47, -4.86, 1.47, -4.89],
                ["c", -0.03, 0, -0.27, 0.06, -0.54, 0.15],
                ["c", -1.08, 0.36, -1.77, 0.48, -2.58, 0.48],
                ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42],
                ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38],
                ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9],
                ["c", 0.09, 0.09, 0.27, 0.18, 0.45, 0.21],
                ["c", 0.12, 0, 0.18, 0, 0.33, -0.09],
                ["c", 0.33, -0.15, 1.02, -0.93, 1.41, -1.59],
                ["c", 0.12, -0.21, 0.18, -0.39, 0.39, -1.08],
                ["c", 0.66, -2.1, 1.17, -3.84, 1.17, -3.87],
                ["c", 0, 0, -0.21, 0.06, -0.42, 0.15],
                ["c", -0.51, 0.15, -1.2, 0.33, -1.68, 0.42],
                ["c", -0.33, 0.06, -0.51, 0.06, -0.96, 0.06],
                ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9],
                ["z"]
            ],
            w: 9.724,
            h: 21.383
        },
        "rests.32nd": {
            d: [
                ["M", 4.23, -13.62],
                ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72],
                ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48],
                ["c", 0.12, 0, 0.18, 0, 0.27, -0.06],
                ["c", 0.33, -0.21, 0.99, -1.11, 1.44, -1.98],
                ["c", 0.09, -0.24, 0.21, -0.33, 0.39, -0.33],
                ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18],
                ["c", 0.03, 0.06, -0.57, 2.67, -3.21, 13.89],
                ["c", -1.8, 7.62, -3.3, 13.89, -3.3, 13.92],
                ["c", -0.03, 0.06, -0.12, 0.12, -0.24, 0.18],
                ["c", -0.21, 0.09, -0.24, 0.09, -0.48, 0.09],
                ["c", -0.24, -0, -0.3, -0, -0.48, -0.06],
                ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15],
                ["c", -0.06, -0.03, 0.09, -0.57, 1.23, -4.92],
                ["c", 0.69, -2.67, 1.26, -4.86, 1.29, -4.89],
                ["c", 0, -0.03, -0.12, -0.03, -0.48, 0.12],
                ["c", -1.17, 0.39, -2.22, 0.57, -3, 0.54],
                ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42],
                ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38],
                ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9],
                ["c", 0.12, 0.09, 0.3, 0.18, 0.48, 0.21],
                ["c", 0.12, -0, 0.18, -0, 0.3, -0.09],
                ["c", 0.42, -0.21, 1.29, -1.29, 1.56, -1.89],
                ["c", 0.03, -0.12, 1.23, -4.59, 1.23, -4.65],
                ["c", 0, -0.03, -0.18, 0.03, -0.39, 0.12],
                ["c", -0.63, 0.18, -1.2, 0.36, -1.74, 0.45],
                ["c", -0.39, 0.06, -0.54, 0.06, -1.02, 0.06],
                ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42],
                ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38],
                ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9],
                ["c", 0.18, 0.18, 0.51, 0.27, 0.72, 0.15],
                ["c", 0.3, -0.12, 0.69, -0.57, 1.08, -1.17],
                ["c", 0.42, -0.6, 0.39, -0.51, 1.05, -3.03],
                ["c", 0.33, -1.26, 0.6, -2.31, 0.6, -2.34],
                ["c", 0, -0, -0.21, 0.03, -0.45, 0.12],
                ["c", -0.57, 0.18, -1.14, 0.33, -1.62, 0.42],
                ["c", -0.33, 0.06, -0.51, 0.06, -0.96, 0.06],
                ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9],
                ["z"]
            ],
            w: 11.373,
            h: 28.883
        },
        "rests.64th": {
            d: [
                ["M", 5.13, -13.62],
                ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96],
                ["c", 0.18, 0.21, 0.54, 0.3, 0.75, 0.18],
                ["c", 0.24, -0.12, 0.63, -0.66, 1.08, -1.56],
                ["c", 0.33, -0.66, 0.39, -0.72, 0.6, -0.72],
                ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18],
                ["c", 0.03, 0.06, -0.69, 3.66, -3.54, 17.64],
                ["c", -1.95, 9.66, -3.57, 17.61, -3.57, 17.64],
                ["c", -0.03, 0.06, -0.12, 0.12, -0.24, 0.18],
                ["c", -0.21, 0.09, -0.24, 0.09, -0.48, 0.09],
                ["c", -0.24, 0, -0.3, 0, -0.48, -0.06],
                ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15],
                ["c", -0.06, -0.03, 0.06, -0.57, 1.05, -4.95],
                ["c", 0.6, -2.7, 1.08, -4.89, 1.08, -4.92],
                ["c", 0, 0, -0.24, 0.06, -0.51, 0.15],
                ["c", -0.66, 0.24, -1.2, 0.36, -1.77, 0.48],
                ["c", -0.42, 0.06, -0.57, 0.06, -1.05, 0.06],
                ["c", -0.69, 0, -0.87, -0.03, -1.35, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42],
                ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38],
                ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9],
                ["c", 0.09, 0.09, 0.27, 0.18, 0.45, 0.21],
                ["c", 0.21, 0.03, 0.39, -0.09, 0.72, -0.42],
                ["c", 0.45, -0.45, 1.02, -1.26, 1.17, -1.65],
                ["c", 0.03, -0.09, 0.27, -1.14, 0.54, -2.34],
                ["c", 0.27, -1.2, 0.48, -2.19, 0.51, -2.22],
                ["c", 0, -0.03, -0.09, -0.03, -0.48, 0.12],
                ["c", -1.17, 0.39, -2.22, 0.57, -3, 0.54],
                ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93],
                ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72],
                ["c", 0.15, 0.39, 0.57, 0.57, 0.9, 0.42],
                ["c", 0.36, -0.18, 1.2, -1.26, 1.47, -1.89],
                ["c", 0.03, -0.09, 0.3, -1.2, 0.57, -2.43],
                ["l", 0.51, -2.28],
                ["l", -0.54, 0.18],
                ["c", -1.11, 0.36, -1.8, 0.48, -2.61, 0.48],
                ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93],
                ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96],
                ["c", 0.21, 0.21, 0.54, 0.3, 0.75, 0.18],
                ["c", 0.36, -0.18, 0.93, -0.93, 1.29, -1.68],
                ["c", 0.12, -0.24, 0.18, -0.48, 0.63, -2.55],
                ["l", 0.51, -2.31],
                ["c", 0, -0.03, -0.18, 0.03, -0.39, 0.12],
                ["c", -1.14, 0.36, -2.1, 0.54, -2.82, 0.51],
                ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9],
                ["z"]
            ],
            w: 12.453,
            h: 36.383
        },
        "rests.128th": {
            d: [
                ["M", 6.03, -21.12],
                ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72],
                ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48],
                ["c", 0.21, 0, 0.33, -0.06, 0.54, -0.36],
                ["c", 0.15, -0.21, 0.54, -0.93, 0.78, -1.47],
                ["c", 0.15, -0.33, 0.18, -0.39, 0.3, -0.48],
                ["c", 0.18, -0.09, 0.45, 0, 0.51, 0.15],
                ["c", 0.03, 0.09, -7.11, 42.75, -7.17, 42.84],
                ["c", -0.03, 0.03, -0.15, 0.09, -0.24, 0.15],
                ["c", -0.18, 0.06, -0.24, 0.06, -0.45, 0.06],
                ["c", -0.24, -0, -0.3, -0, -0.48, -0.06],
                ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15],
                ["c", -0.06, -0.03, 0.03, -0.57, 0.84, -4.98],
                ["c", 0.51, -2.7, 0.93, -4.92, 0.9, -4.92],
                ["c", 0, -0, -0.15, 0.06, -0.36, 0.12],
                ["c", -0.78, 0.27, -1.62, 0.48, -2.31, 0.57],
                ["c", -0.15, 0.03, -0.54, 0.03, -0.81, 0.03],
                ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93],
                ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72],
                ["c", 0.12, 0.27, 0.33, 0.45, 0.63, 0.48],
                ["c", 0.12, -0, 0.18, -0, 0.3, -0.09],
                ["c", 0.42, -0.21, 1.14, -1.11, 1.5, -1.83],
                ["c", 0.12, -0.27, 0.12, -0.27, 0.54, -2.52],
                ["c", 0.24, -1.23, 0.42, -2.25, 0.39, -2.25],
                ["c", 0, -0, -0.24, 0.06, -0.51, 0.18],
                ["c", -1.26, 0.39, -2.25, 0.57, -3.06, 0.54],
                ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93],
                ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96],
                ["c", 0.18, 0.21, 0.51, 0.3, 0.75, 0.18],
                ["c", 0.36, -0.15, 1.05, -0.99, 1.41, -1.77],
                ["l", 0.15, -0.3],
                ["l", 0.42, -2.25],
                ["c", 0.21, -1.26, 0.42, -2.28, 0.39, -2.28],
                ["l", -0.51, 0.15],
                ["c", -1.11, 0.39, -1.89, 0.51, -2.7, 0.51],
                ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93],
                ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96],
                ["c", 0.18, 0.18, 0.48, 0.27, 0.72, 0.21],
                ["c", 0.33, -0.12, 1.14, -1.26, 1.41, -1.95],
                ["c", 0, -0.09, 0.21, -1.11, 0.45, -2.34],
                ["c", 0.21, -1.2, 0.39, -2.22, 0.39, -2.28],
                ["c", 0.03, -0.03, 0, -0.03, -0.45, 0.12],
                ["c", -0.57, 0.18, -1.2, 0.33, -1.71, 0.42],
                ["c", -0.3, 0.06, -0.51, 0.06, -0.93, 0.06],
                ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93],
                ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54],
                ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26],
                ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72],
                ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48],
                ["c", 0.18, -0, 0.36, -0.09, 0.57, -0.33],
                ["c", 0.33, -0.36, 0.78, -1.14, 0.93, -1.56],
                ["c", 0.03, -0.12, 0.24, -1.2, 0.45, -2.4],
                ["c", 0.24, -1.2, 0.42, -2.22, 0.42, -2.28],
                ["c", 0.03, -0.03, 0, -0.03, -0.39, 0.09],
                ["c", -1.05, 0.36, -1.8, 0.48, -2.58, 0.48],
                ["c", -0.63, -0, -0.84, -0.03, -1.29, -0.27],
                ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3],
                ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9],
                ["z"]
            ],
            w: 12.992,
            h: 43.883
        },
        "accidentals.sharp": {
            d: [
                ["M", 5.73, -11.19],
                ["c", 0.21, -0.12, 0.54, -0.03, 0.66, 0.24],
                ["c", 0.06, 0.12, 0.06, 0.21, 0.06, 2.31],
                ["c", 0, 1.23, 0, 2.22, 0.03, 2.22],
                ["c", 0, -0, 0.27, -0.12, 0.6, -0.24],
                ["c", 0.69, -0.27, 0.78, -0.3, 0.96, -0.15],
                ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.38],
                ["c", 0, 1.02, 0, 1.11, -0.06, 1.2],
                ["c", -0.03, 0.06, -0.09, 0.12, -0.12, 0.15],
                ["c", -0.06, 0.03, -0.42, 0.21, -0.84, 0.36],
                ["l", -0.75, 0.33],
                ["l", -0.03, 2.43],
                ["c", 0, 1.32, 0, 2.43, 0.03, 2.43],
                ["c", 0, -0, 0.27, -0.12, 0.6, -0.24],
                ["c", 0.69, -0.27, 0.78, -0.3, 0.96, -0.15],
                ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.38],
                ["c", 0, 1.02, 0, 1.11, -0.06, 1.2],
                ["c", -0.03, 0.06, -0.09, 0.12, -0.12, 0.15],
                ["c", -0.06, 0.03, -0.42, 0.21, -0.84, 0.36],
                ["l", -0.75, 0.33],
                ["l", -0.03, 2.52],
                ["c", 0, 2.28, -0.03, 2.55, -0.06, 2.64],
                ["c", -0.21, 0.36, -0.72, 0.36, -0.93, -0],
                ["c", -0.03, -0.09, -0.06, -0.33, -0.06, -2.43],
                ["l", 0, -2.31],
                ["l", -1.29, 0.51],
                ["l", -1.26, 0.51],
                ["l", 0, 2.43],
                ["c", 0, 2.58, 0, 2.52, -0.15, 2.67],
                ["c", -0.06, 0.09, -0.27, 0.18, -0.36, 0.18],
                ["c", -0.12, -0, -0.33, -0.09, -0.39, -0.18],
                ["c", -0.15, -0.15, -0.15, -0.09, -0.15, -2.43],
                ["c", 0, -1.23, 0, -2.22, -0.03, -2.22],
                ["c", 0, -0, -0.27, 0.12, -0.6, 0.24],
                ["c", -0.69, 0.27, -0.78, 0.3, -0.96, 0.15],
                ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.38],
                ["c", 0, -1.02, 0, -1.11, 0.06, -1.2],
                ["c", 0.03, -0.06, 0.09, -0.12, 0.12, -0.15],
                ["c", 0.06, -0.03, 0.42, -0.21, 0.84, -0.36],
                ["l", 0.78, -0.33],
                ["l", 0, -2.43],
                ["c", 0, -1.32, 0, -2.43, -0.03, -2.43],
                ["c", 0, -0, -0.27, 0.12, -0.6, 0.24],
                ["c", -0.69, 0.27, -0.78, 0.3, -0.96, 0.15],
                ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.38],
                ["c", 0, -1.02, 0, -1.11, 0.06, -1.2],
                ["c", 0.03, -0.06, 0.09, -0.12, 0.12, -0.15],
                ["c", 0.06, -0.03, 0.42, -0.21, 0.84, -0.36],
                ["l", 0.78, -0.33],
                ["l", 0, -2.52],
                ["c", 0, -2.28, 0.03, -2.55, 0.06, -2.64],
                ["c", 0.21, -0.36, 0.72, -0.36, 0.93, 0],
                ["c", 0.03, 0.09, 0.06, 0.33, 0.06, 2.43],
                ["l", 0.03, 2.31],
                ["l", 1.26, -0.51],
                ["l", 1.26, -0.51],
                ["l", 0, -2.43],
                ["c", 0, -2.28, 0, -2.43, 0.06, -2.55],
                ["c", 0.06, -0.12, 0.12, -0.18, 0.27, -0.24],
                ["z"],
                ["m", -0.33, 10.65],
                ["l", 0, -2.43],
                ["l", -1.29, 0.51],
                ["l", -1.26, 0.51],
                ["l", 0, 2.46],
                ["l", 0, 2.43],
                ["l", 0.09, -0.03],
                ["c", 0.06, -0.03, 0.63, -0.27, 1.29, -0.51],
                ["l", 1.17, -0.48],
                ["l", 0, -2.46],
                ["z"]
            ],
            w: 8.25,
            h: 22.462
        },
        "accidentals.halfsharp": {
            d: [
                ["M", 2.43, -10.05],
                ["c", 0.21, -0.12, 0.54, -0.03, 0.66, 0.24],
                ["c", 0.06, 0.12, 0.06, 0.21, 0.06, 2.01],
                ["c", 0, 1.05, 0, 1.89, 0.03, 1.89],
                ["l", 0.72, -0.48],
                ["c", 0.69, -0.48, 0.69, -0.51, 0.87, -0.51],
                ["c", 0.15, 0, 0.18, 0.03, 0.27, 0.09],
                ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.41],
                ["c", 0, 1.11, -0.03, 1.14, -0.09, 1.23],
                ["c", -0.03, 0.03, -0.48, 0.39, -1.02, 0.75],
                ["l", -0.99, 0.66],
                ["l", 0, 2.37],
                ["c", 0, 1.32, 0, 2.37, 0.03, 2.37],
                ["l", 0.72, -0.48],
                ["c", 0.69, -0.48, 0.69, -0.51, 0.87, -0.51],
                ["c", 0.15, 0, 0.18, 0.03, 0.27, 0.09],
                ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.41],
                ["c", 0, 1.11, -0.03, 1.14, -0.09, 1.23],
                ["c", -0.03, 0.03, -0.48, 0.39, -1.02, 0.75],
                ["l", -0.99, 0.66],
                ["l", 0, 2.25],
                ["c", 0, 1.95, 0, 2.28, -0.06, 2.37],
                ["c", -0.06, 0.12, -0.12, 0.21, -0.24, 0.27],
                ["c", -0.27, 0.12, -0.54, 0.03, -0.69, -0.24],
                ["c", -0.06, -0.12, -0.06, -0.21, -0.06, -2.01],
                ["c", 0, -1.05, 0, -1.89, -0.03, -1.89],
                ["l", -0.72, 0.48],
                ["c", -0.69, 0.48, -0.69, 0.48, -0.87, 0.48],
                ["c", -0.15, 0, -0.18, 0, -0.27, -0.06],
                ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.41],
                ["c", 0, -1.11, 0.03, -1.14, 0.09, -1.23],
                ["c", 0.03, -0.03, 0.48, -0.39, 1.02, -0.75],
                ["l", 0.99, -0.66],
                ["l", 0, -2.37],
                ["c", 0, -1.32, 0, -2.37, -0.03, -2.37],
                ["l", -0.72, 0.48],
                ["c", -0.69, 0.48, -0.69, 0.48, -0.87, 0.48],
                ["c", -0.15, 0, -0.18, 0, -0.27, -0.06],
                ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.41],
                ["c", 0, -1.11, 0.03, -1.14, 0.09, -1.23],
                ["c", 0.03, -0.03, 0.48, -0.39, 1.02, -0.75],
                ["l", 0.99, -0.66],
                ["l", 0, -2.25],
                ["c", 0, -2.13, 0, -2.28, 0.06, -2.4],
                ["c", 0.06, -0.12, 0.12, -0.18, 0.27, -0.24],
                ["z"]
            ],
            w: 5.25,
            h: 20.174
        },
        "accidentals.nat": {
            d: [
                ["M", 0.204, -11.4],
                ["c", 0.24, -0.06, 0.78, 0, 0.99, 0.15],
                ["c", 0.03, 0.03, 0.03, 0.48, 0, 2.61],
                ["c", -0.03, 1.44, -0.03, 2.61, -0.03, 2.61],
                ["c", 0, 0.03, 0.75, -0.09, 1.68, -0.24],
                ["c", 0.96, -0.18, 1.71, -0.27, 1.74, -0.27],
                ["c", 0.15, 0.03, 0.27, 0.15, 0.36, 0.3],
                ["l", 0.06, 0.12],
                ["l", 0.09, 8.67],
                ["c", 0.09, 6.96, 0.12, 8.67, 0.09, 8.67],
                ["c", -0.03, 0.03, -0.12, 0.06, -0.21, 0.09],
                ["c", -0.24, 0.09, -0.72, 0.09, -0.96, 0],
                ["c", -0.09, -0.03, -0.18, -0.06, -0.21, -0.09],
                ["c", -0.03, -0.03, -0.03, -0.48, 0, -2.61],
                ["c", 0.03, -1.44, 0.03, -2.61, 0.03, -2.61],
                ["c", 0, -0.03, -0.75, 0.09, -1.68, 0.24],
                ["c", -0.96, 0.18, -1.71, 0.27, -1.74, 0.27],
                ["c", -0.15, -0.03, -0.27, -0.15, -0.36, -0.3],
                ["l", -0.06, -0.15],
                ["l", -0.09, -7.53],
                ["c", -0.06, -4.14, -0.09, -8.04, -0.12, -8.67],
                ["l", 0, -1.11],
                ["l", 0.15, -0.06],
                ["c", 0.09, -0.03, 0.21, -0.06, 0.27, -0.09],
                ["z"],
                ["m", 3.75, 8.4],
                ["c", 0, -0.33, 0, -0.42, -0.03, -0.42],
                ["c", -0.12, 0, -2.79, 0.45, -2.79, 0.48],
                ["c", -0.03, 0, -0.09, 6.3, -0.09, 6.33],
                ["c", 0.03, 0, 2.79, -0.45, 2.82, -0.48],
                ["c", 0, 0, 0.09, -4.53, 0.09, -5.91],
                ["z"]
            ],
            w: 5.411,
            h: 22.8
        },
        "accidentals.flat": {
            d: [
                ["M", -0.36, -14.07],
                ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15],
                ["c", 0.06, 0.03, 0.06, 0.36, -0.03, 5.25],
                ["c", -0.06, 2.85, -0.09, 5.19, -0.09, 5.19],
                ["c", 0, 0.03, 0.12, -0.03, 0.24, -0.12],
                ["c", 0.63, -0.42, 1.41, -0.66, 2.19, -0.72],
                ["c", 0.81, -0.03, 1.47, 0.21, 2.04, 0.78],
                ["c", 0.57, 0.54, 0.87, 1.26, 0.93, 2.04],
                ["c", 0.03, 0.57, -0.09, 1.08, -0.36, 1.62],
                ["c", -0.42, 0.81, -1.02, 1.38, -2.82, 2.61],
                ["c", -1.14, 0.78, -1.44, 1.02, -1.8, 1.44],
                ["c", -0.18, 0.18, -0.39, 0.39, -0.45, 0.42],
                ["c", -0.27, 0.18, -0.57, 0.15, -0.81, -0.06],
                ["c", -0.06, -0.09, -0.12, -0.18, -0.15, -0.27],
                ["c", -0.03, -0.06, -0.09, -3.27, -0.18, -8.34],
                ["c", -0.09, -4.53, -0.15, -8.58, -0.18, -9.03],
                ["l", 0, -0.78],
                ["l", 0.12, -0.06],
                ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12],
                ["z"],
                ["m", 3.18, 11.01],
                ["c", -0.21, -0.12, -0.54, -0.15, -0.81, -0.06],
                ["c", -0.54, 0.15, -0.99, 0.63, -1.17, 1.26],
                ["c", -0.06, 0.3, -0.12, 2.88, -0.06, 3.87],
                ["c", 0.03, 0.42, 0.03, 0.81, 0.06, 0.9],
                ["l", 0.03, 0.12],
                ["l", 0.45, -0.39],
                ["c", 0.63, -0.54, 1.26, -1.17, 1.56, -1.59],
                ["c", 0.3, -0.42, 0.6, -0.99, 0.72, -1.41],
                ["c", 0.18, -0.69, 0.09, -1.47, -0.18, -2.07],
                ["c", -0.15, -0.3, -0.33, -0.51, -0.6, -0.63],
                ["z"]
            ],
            w: 6.75,
            h: 18.801
        },
        "accidentals.halfflat": {
            d: [
                ["M", 4.83, -14.07],
                ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15],
                ["c", 0.06, 0.03, 0.06, 0.6, -0.12, 9.06],
                ["c", -0.09, 5.55, -0.15, 9.06, -0.18, 9.12],
                ["c", -0.03, 0.09, -0.09, 0.18, -0.15, 0.27],
                ["c", -0.24, 0.21, -0.54, 0.24, -0.81, 0.06],
                ["c", -0.06, -0.03, -0.27, -0.24, -0.45, -0.42],
                ["c", -0.36, -0.42, -0.66, -0.66, -1.8, -1.44],
                ["c", -1.23, -0.84, -1.83, -1.32, -2.25, -1.77],
                ["c", -0.66, -0.78, -0.96, -1.56, -0.93, -2.46],
                ["c", 0.09, -1.41, 1.11, -2.58, 2.4, -2.79],
                ["c", 0.3, -0.06, 0.84, -0.03, 1.23, 0.06],
                ["c", 0.54, 0.12, 1.08, 0.33, 1.53, 0.63],
                ["c", 0.12, 0.09, 0.24, 0.15, 0.24, 0.12],
                ["c", 0, 0, -0.12, -8.37, -0.18, -9.75],
                ["l", 0, -0.66],
                ["l", 0.12, -0.06],
                ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12],
                ["z"],
                ["m", -1.65, 10.95],
                ["c", -0.6, -0.18, -1.08, 0.09, -1.38, 0.69],
                ["c", -0.27, 0.6, -0.36, 1.38, -0.18, 2.07],
                ["c", 0.12, 0.42, 0.42, 0.99, 0.72, 1.41],
                ["c", 0.3, 0.42, 0.93, 1.05, 1.56, 1.59],
                ["l", 0.48, 0.39],
                ["l", 0, -0.12],
                ["c", 0.03, -0.09, 0.03, -0.48, 0.06, -0.9],
                ["c", 0.03, -0.57, 0.03, -1.08, 0, -2.22],
                ["c", -0.03, -1.62, -0.03, -1.62, -0.24, -2.07],
                ["c", -0.21, -0.42, -0.6, -0.75, -1.02, -0.84],
                ["z"]
            ],
            w: 6.728,
            h: 18.801
        },
        "accidentals.dblflat": {
            d: [
                ["M", -0.36, -14.07],
                ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15],
                ["c", 0.06, 0.03, 0.06, 0.33, -0.03, 4.89],
                ["c", -0.06, 2.67, -0.09, 5.01, -0.09, 5.22],
                ["l", 0, 0.36],
                ["l", 0.15, -0.15],
                ["c", 0.36, -0.3, 0.75, -0.51, 1.2, -0.63],
                ["c", 0.33, -0.09, 0.96, -0.09, 1.26, -0.03],
                ["c", 0.27, 0.09, 0.63, 0.27, 0.87, 0.45],
                ["l", 0.21, 0.15],
                ["l", 0, -0.27],
                ["c", 0, -0.15, -0.03, -2.43, -0.09, -5.1],
                ["c", -0.09, -4.56, -0.09, -4.86, -0.03, -4.89],
                ["c", 0.15, -0.12, 0.39, -0.15, 0.72, -0.15],
                ["c", 0.3, 0, 0.54, 0.03, 0.69, 0.15],
                ["c", 0.06, 0.03, 0.06, 0.33, -0.03, 4.95],
                ["c", -0.06, 2.7, -0.09, 5.04, -0.09, 5.22],
                ["l", 0.03, 0.3],
                ["l", 0.21, -0.15],
                ["c", 0.69, -0.48, 1.44, -0.69, 2.28, -0.69],
                ["c", 0.51, 0, 0.78, 0.03, 1.2, 0.21],
                ["c", 1.32, 0.63, 2.01, 2.28, 1.53, 3.69],
                ["c", -0.21, 0.57, -0.51, 1.02, -1.05, 1.56],
                ["c", -0.42, 0.42, -0.81, 0.72, -1.92, 1.5],
                ["c", -1.26, 0.87, -1.5, 1.08, -1.86, 1.5],
                ["c", -0.39, 0.45, -0.54, 0.54, -0.81, 0.51],
                ["c", -0.18, 0, -0.21, 0, -0.33, -0.06],
                ["l", -0.21, -0.21],
                ["l", -0.06, -0.12],
                ["l", -0.03, -0.99],
                ["c", -0.03, -0.54, -0.03, -1.29, -0.06, -1.68],
                ["l", 0, -0.69],
                ["l", -0.21, 0.24],
                ["c", -0.36, 0.42, -0.75, 0.75, -1.8, 1.62],
                ["c", -1.02, 0.84, -1.2, 0.99, -1.44, 1.38],
                ["c", -0.36, 0.51, -0.54, 0.6, -0.9, 0.51],
                ["c", -0.15, -0.03, -0.39, -0.27, -0.42, -0.42],
                ["c", -0.03, -0.06, -0.09, -3.27, -0.18, -8.34],
                ["c", -0.09, -4.53, -0.15, -8.58, -0.18, -9.03],
                ["l", 0, -0.78],
                ["l", 0.12, -0.06],
                ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12],
                ["z"],
                ["m", 2.52, 10.98],
                ["c", -0.18, -0.09, -0.48, -0.12, -0.66, -0.06],
                ["c", -0.39, 0.15, -0.69, 0.54, -0.84, 1.14],
                ["c", -0.06, 0.24, -0.06, 0.39, -0.09, 1.74],
                ["c", -0.03, 1.44, 0, 2.73, 0.06, 3.18],
                ["l", 0.03, 0.15],
                ["l", 0.27, -0.27],
                ["c", 0.93, -0.96, 1.5, -1.95, 1.74, -3.06],
                ["c", 0.06, -0.27, 0.06, -0.39, 0.06, -0.96],
                ["c", 0, -0.54, 0, -0.69, -0.06, -0.93],
                ["c", -0.09, -0.51, -0.27, -0.81, -0.51, -0.93],
                ["z"],
                ["m", 5.43, 0],
                ["c", -0.18, -0.09, -0.51, -0.12, -0.72, -0.06],
                ["c", -0.54, 0.12, -0.96, 0.63, -1.17, 1.26],
                ["c", -0.06, 0.3, -0.12, 2.88, -0.06, 3.9],
                ["c", 0.03, 0.42, 0.03, 0.81, 0.06, 0.9],
                ["l", 0.03, 0.12],
                ["l", 0.36, -0.3],
                ["c", 0.42, -0.36, 1.02, -0.96, 1.29, -1.29],
                ["c", 0.36, -0.45, 0.66, -0.99, 0.81, -1.41],
                ["c", 0.42, -1.23, 0.15, -2.76, -0.6, -3.12],
                ["z"]
            ],
            w: 11.613,
            h: 18.804
        },
        "accidentals.dblsharp": {
            d: [
                ["M", -0.186, -3.96],
                ["c", 0.06, -0.03, 0.12, -0.06, 0.15, -0.06],
                ["c", 0.09, 0, 2.76, 0.27, 2.79, 0.3],
                ["c", 0.12, 0.03, 0.15, 0.12, 0.15, 0.51],
                ["c", 0.06, 0.96, 0.24, 1.59, 0.57, 2.1],
                ["c", 0.06, 0.09, 0.15, 0.21, 0.18, 0.24],
                ["l", 0.09, 0.06],
                ["l", 0.09, -0.06],
                ["c", 0.03, -0.03, 0.12, -0.15, 0.18, -0.24],
                ["c", 0.33, -0.51, 0.51, -1.14, 0.57, -2.1],
                ["c", 0, -0.39, 0.03, -0.45, 0.12, -0.51],
                ["c", 0.03, 0, 0.66, -0.09, 1.44, -0.15],
                ["c", 1.47, -0.15, 1.5, -0.15, 1.56, -0.03],
                ["c", 0.03, 0.06, 0, 0.42, -0.09, 1.44],
                ["c", -0.09, 0.72, -0.15, 1.35, -0.15, 1.38],
                ["c", 0, 0.03, -0.03, 0.09, -0.06, 0.12],
                ["c", -0.06, 0.06, -0.12, 0.09, -0.51, 0.09],
                ["c", -1.08, 0.06, -1.8, 0.3, -2.28, 0.75],
                ["l", -0.12, 0.09],
                ["l", 0.09, 0.09],
                ["c", 0.12, 0.15, 0.39, 0.33, 0.63, 0.45],
                ["c", 0.42, 0.18, 0.96, 0.27, 1.68, 0.33],
                ["c", 0.39, -0, 0.45, 0.03, 0.51, 0.09],
                ["c", 0.03, 0.03, 0.06, 0.09, 0.06, 0.12],
                ["c", 0, 0.03, 0.06, 0.66, 0.15, 1.38],
                ["c", 0.09, 1.02, 0.12, 1.38, 0.09, 1.44],
                ["c", -0.06, 0.12, -0.09, 0.12, -1.56, -0.03],
                ["c", -0.78, -0.06, -1.41, -0.15, -1.44, -0.15],
                ["c", -0.09, -0.06, -0.12, -0.12, -0.12, -0.54],
                ["c", -0.06, -0.93, -0.24, -1.56, -0.57, -2.07],
                ["c", -0.06, -0.09, -0.15, -0.21, -0.18, -0.24],
                ["l", -0.09, -0.06],
                ["l", -0.09, 0.06],
                ["c", -0.03, 0.03, -0.12, 0.15, -0.18, 0.24],
                ["c", -0.33, 0.51, -0.51, 1.14, -0.57, 2.07],
                ["c", 0, 0.42, -0.03, 0.48, -0.12, 0.54],
                ["c", -0.03, 0, -0.66, 0.09, -1.44, 0.15],
                ["c", -1.47, 0.15, -1.5, 0.15, -1.56, 0.03],
                ["c", -0.03, -0.06, 0, -0.42, 0.09, -1.44],
                ["c", 0.09, -0.72, 0.15, -1.35, 0.15, -1.38],
                ["c", 0, -0.03, 0.03, -0.09, 0.06, -0.12],
                ["c", 0.06, -0.06, 0.12, -0.09, 0.51, -0.09],
                ["c", 0.72, -0.06, 1.26, -0.15, 1.68, -0.33],
                ["c", 0.24, -0.12, 0.51, -0.3, 0.63, -0.45],
                ["l", 0.09, -0.09],
                ["l", -0.12, -0.09],
                ["c", -0.48, -0.45, -1.2, -0.69, -2.28, -0.75],
                ["c", -0.39, 0, -0.45, -0.03, -0.51, -0.09],
                ["c", -0.03, -0.03, -0.06, -0.09, -0.06, -0.12],
                ["c", 0, -0.03, -0.06, -0.63, -0.12, -1.38],
                ["c", -0.09, -0.72, -0.15, -1.35, -0.15, -1.38],
                ["z"]
            ],
            w: 7.961,
            h: 7.977
        },
        "dots.dot": {
            d: [
                ["M", 1.32, -1.68],
                ["c", 0.09, -0.03, 0.27, -0.06, 0.39, -0.06],
                ["c", 0.96, 0, 1.74, 0.78, 1.74, 1.71],
                ["c", 0, 0.96, -0.78, 1.74, -1.71, 1.74],
                ["c", -0.96, 0, -1.74, -0.78, -1.74, -1.71],
                ["c", 0, -0.78, 0.54, -1.5, 1.32, -1.68],
                ["z"]
            ],
            w: 3.45,
            h: 3.45
        },
        "noteheads.dbl": {
            d: [
                ["M", -0.69, -4.02],
                ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0],
                ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3],
                ["c", 0.06, 0.15, 0.06, 0.18, 0.06, 1.41],
                ["l", -0, 1.23],
                ["l", 0.12, -0.18],
                ["c", 0.72, -1.26, 2.64, -2.31, 4.86, -2.64],
                ["c", 0.81, -0.15, 1.11, -0.15, 2.13, -0.15],
                ["c", 0.99, 0, 1.29, 0, 2.1, 0.15],
                ["c", 0.75, 0.12, 1.38, 0.27, 2.04, 0.54],
                ["c", 1.35, 0.51, 2.34, 1.26, 2.82, 2.1],
                ["l", 0.12, 0.18],
                ["l", 0, -1.23],
                ["c", 0, -1.2, 0, -1.26, 0.06, -1.38],
                ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33],
                ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0],
                ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3],
                ["l", 0.06, 0.15],
                ["l", 0, 3.54],
                ["l", 0, 3.54],
                ["l", -0.06, 0.15],
                ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33],
                ["c", -0.18, 0.09, -0.36, 0.09, -0.54, 0],
                ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33],
                ["c", -0.06, -0.12, -0.06, -0.18, -0.06, -1.38],
                ["l", 0, -1.23],
                ["l", -0.12, 0.18],
                ["c", -0.48, 0.84, -1.47, 1.59, -2.82, 2.1],
                ["c", -0.84, 0.33, -1.71, 0.54, -2.85, 0.66],
                ["c", -0.45, 0.06, -2.16, 0.06, -2.61, 0],
                ["c", -1.14, -0.12, -2.01, -0.33, -2.85, -0.66],
                ["c", -1.35, -0.51, -2.34, -1.26, -2.82, -2.1],
                ["l", -0.12, -0.18],
                ["l", 0, 1.23],
                ["c", 0, 1.23, 0, 1.26, -0.06, 1.38],
                ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33],
                ["c", -0.18, 0.09, -0.36, 0.09, -0.54, 0],
                ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33],
                ["l", -0.06, -0.15],
                ["l", 0, -3.54],
                ["c", 0, -3.48, 0, -3.54, 0.06, -3.66],
                ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33],
                ["z"],
                ["m", 7.71, 0.63],
                ["c", -0.36, -0.06, -0.9, -0.06, -1.14, 0],
                ["c", -0.3, 0.03, -0.66, 0.24, -0.87, 0.42],
                ["c", -0.6, 0.54, -0.9, 1.62, -0.75, 2.82],
                ["c", 0.12, 0.93, 0.51, 1.68, 1.11, 2.31],
                ["c", 0.75, 0.72, 1.83, 1.2, 2.85, 1.26],
                ["c", 1.05, 0.06, 1.83, -0.54, 2.1, -1.65],
                ["c", 0.21, -0.9, 0.12, -1.95, -0.24, -2.82],
                ["c", -0.36, -0.81, -1.08, -1.53, -1.95, -1.95],
                ["c", -0.3, -0.15, -0.78, -0.3, -1.11, -0.39],
                ["z"]
            ],
            w: 16.83,
            h: 8.145
        },
        "noteheads.whole": {
            d: [
                ["M", 6.51, -4.05],
                ["c", 0.51, -0.03, 2.01, 0, 2.52, 0.03],
                ["c", 1.41, 0.18, 2.64, 0.51, 3.72, 1.08],
                ["c", 1.2, 0.63, 1.95, 1.41, 2.19, 2.31],
                ["c", 0.09, 0.33, 0.09, 0.9, -0, 1.23],
                ["c", -0.24, 0.9, -0.99, 1.68, -2.19, 2.31],
                ["c", -1.08, 0.57, -2.28, 0.9, -3.75, 1.08],
                ["c", -0.66, 0.06, -2.31, 0.06, -2.97, 0],
                ["c", -1.47, -0.18, -2.67, -0.51, -3.75, -1.08],
                ["c", -1.2, -0.63, -1.95, -1.41, -2.19, -2.31],
                ["c", -0.09, -0.33, -0.09, -0.9, -0, -1.23],
                ["c", 0.24, -0.9, 0.99, -1.68, 2.19, -2.31],
                ["c", 1.2, -0.63, 2.61, -0.99, 4.23, -1.11],
                ["z"],
                ["m", 0.57, 0.66],
                ["c", -0.87, -0.15, -1.53, 0, -2.04, 0.51],
                ["c", -0.15, 0.15, -0.24, 0.27, -0.33, 0.48],
                ["c", -0.24, 0.51, -0.36, 1.08, -0.33, 1.77],
                ["c", 0.03, 0.69, 0.18, 1.26, 0.42, 1.77],
                ["c", 0.6, 1.17, 1.74, 1.98, 3.18, 2.22],
                ["c", 1.11, 0.21, 1.95, -0.15, 2.34, -0.99],
                ["c", 0.24, -0.51, 0.36, -1.08, 0.33, -1.8],
                ["c", -0.06, -1.11, -0.45, -2.04, -1.17, -2.76],
                ["c", -0.63, -0.63, -1.47, -1.05, -2.4, -1.2],
                ["z"]
            ],
            w: 14.985,
            h: 8.097
        },
        "noteheads.half": {
            d: [
                ["M", 7.44, -4.05],
                ["c", 0.06, -0.03, 0.27, -0.03, 0.48, -0.03],
                ["c", 1.05, 0, 1.71, 0.24, 2.1, 0.81],
                ["c", 0.42, 0.6, 0.45, 1.35, 0.18, 2.4],
                ["c", -0.42, 1.59, -1.14, 2.73, -2.16, 3.39],
                ["c", -1.41, 0.93, -3.18, 1.44, -5.4, 1.53],
                ["c", -1.17, 0.03, -1.89, -0.21, -2.28, -0.81],
                ["c", -0.42, -0.6, -0.45, -1.35, -0.18, -2.4],
                ["c", 0.42, -1.59, 1.14, -2.73, 2.16, -3.39],
                ["c", 0.63, -0.42, 1.23, -0.72, 1.98, -0.96],
                ["c", 0.9, -0.3, 1.65, -0.42, 3.12, -0.54],
                ["z"],
                ["m", 1.29, 0.87],
                ["c", -0.27, -0.09, -0.63, -0.12, -0.9, -0.03],
                ["c", -0.72, 0.24, -1.53, 0.69, -3.27, 1.8],
                ["c", -2.34, 1.5, -3.3, 2.25, -3.57, 2.79],
                ["c", -0.36, 0.72, -0.06, 1.5, 0.66, 1.77],
                ["c", 0.24, 0.12, 0.69, 0.09, 0.99, 0],
                ["c", 0.84, -0.3, 1.92, -0.93, 4.14, -2.37],
                ["c", 1.62, -1.08, 2.37, -1.71, 2.61, -2.19],
                ["c", 0.36, -0.72, 0.06, -1.5, -0.66, -1.77],
                ["z"]
            ],
            w: 10.37,
            h: 8.132
        },
        "noteheads.quarter": {
            d: [
                ["M", 6.09, -4.05],
                ["c", 0.36, -0.03, 1.2, 0, 1.53, 0.06],
                ["c", 1.17, 0.24, 1.89, 0.84, 2.16, 1.83],
                ["c", 0.06, 0.18, 0.06, 0.3, 0.06, 0.66],
                ["c", 0, 0.45, 0, 0.63, -0.15, 1.08],
                ["c", -0.66, 2.04, -3.06, 3.93, -5.52, 4.38],
                ["c", -0.54, 0.09, -1.44, 0.09, -1.83, 0.03],
                ["c", -1.23, -0.27, -1.98, -0.87, -2.25, -1.86],
                ["c", -0.06, -0.18, -0.06, -0.3, -0.06, -0.66],
                ["c", 0, -0.45, 0, -0.63, 0.15, -1.08],
                ["c", 0.24, -0.78, 0.75, -1.53, 1.44, -2.22],
                ["c", 1.2, -1.2, 2.85, -2.01, 4.47, -2.22],
                ["z"]
            ],
            w: 9.81,
            h: 8.094
        },
        "scripts.ufermata": {
            d: [
                ["M", -0.75, -10.77],
                ["c", 0.12, 0, 0.45, -0.03, 0.69, -0.03],
                ["c", 2.91, -0.03, 5.55, 1.53, 7.41, 4.35],
                ["c", 1.17, 1.71, 1.95, 3.72, 2.43, 6.03],
                ["c", 0.12, 0.51, 0.12, 0.57, 0.03, 0.69],
                ["c", -0.12, 0.21, -0.48, 0.27, -0.69, 0.12],
                ["c", -0.12, -0.09, -0.18, -0.24, -0.27, -0.69],
                ["c", -0.78, -3.63, -3.42, -6.54, -6.78, -7.38],
                ["c", -0.78, -0.21, -1.2, -0.24, -2.07, -0.24],
                ["c", -0.63, -0, -0.84, -0, -1.2, 0.06],
                ["c", -1.83, 0.27, -3.42, 1.08, -4.8, 2.37],
                ["c", -1.41, 1.35, -2.4, 3.21, -2.85, 5.19],
                ["c", -0.09, 0.45, -0.15, 0.6, -0.27, 0.69],
                ["c", -0.21, 0.15, -0.57, 0.09, -0.69, -0.12],
                ["c", -0.09, -0.12, -0.09, -0.18, 0.03, -0.69],
                ["c", 0.33, -1.62, 0.78, -3, 1.47, -4.38],
                ["c", 1.77, -3.54, 4.44, -5.67, 7.56, -5.97],
                ["z"],
                ["m", 0.33, 7.47],
                ["c", 1.38, -0.3, 2.58, 0.9, 2.31, 2.25],
                ["c", -0.15, 0.72, -0.78, 1.35, -1.47, 1.5],
                ["c", -1.38, 0.27, -2.58, -0.93, -2.31, -2.31],
                ["c", 0.15, -0.69, 0.78, -1.29, 1.47, -1.44],
                ["z"]
            ],
            w: 19.748,
            h: 11.289
        },
        "scripts.dfermata": {
            d: [
                ["M", -9.63, -0.42],
                ["c", 0.15, -0.09, 0.36, -0.06, 0.51, 0.03],
                ["c", 0.12, 0.09, 0.18, 0.24, 0.27, 0.66],
                ["c", 0.78, 3.66, 3.42, 6.57, 6.78, 7.41],
                ["c", 0.78, 0.21, 1.2, 0.24, 2.07, 0.24],
                ["c", 0.63, -0, 0.84, -0, 1.2, -0.06],
                ["c", 1.83, -0.27, 3.42, -1.08, 4.8, -2.37],
                ["c", 1.41, -1.35, 2.4, -3.21, 2.85, -5.22],
                ["c", 0.09, -0.42, 0.15, -0.57, 0.27, -0.66],
                ["c", 0.21, -0.15, 0.57, -0.09, 0.69, 0.12],
                ["c", 0.09, 0.12, 0.09, 0.18, -0.03, 0.69],
                ["c", -0.33, 1.62, -0.78, 3, -1.47, 4.38],
                ["c", -1.92, 3.84, -4.89, 6, -8.31, 6],
                ["c", -3.42, 0, -6.39, -2.16, -8.31, -6],
                ["c", -0.48, -0.96, -0.84, -1.92, -1.14, -2.97],
                ["c", -0.18, -0.69, -0.42, -1.74, -0.42, -1.92],
                ["c", 0, -0.12, 0.09, -0.27, 0.24, -0.33],
                ["z"],
                ["m", 9.21, 0],
                ["c", 1.2, -0.27, 2.34, 0.63, 2.34, 1.86],
                ["c", -0, 0.9, -0.66, 1.68, -1.5, 1.89],
                ["c", -1.38, 0.27, -2.58, -0.93, -2.31, -2.31],
                ["c", 0.15, -0.69, 0.78, -1.29, 1.47, -1.44],
                ["z"]
            ],
            w: 19.744,
            h: 11.274
        },
        "scripts.sforzato": {
            d: [
                ["M", -6.45, -3.69],
                ["c", 0.06, -0.03, 0.15, -0.06, 0.18, -0.06],
                ["c", 0.06, 0, 2.85, 0.72, 6.24, 1.59],
                ["l", 6.33, 1.65],
                ["c", 0.33, 0.06, 0.45, 0.21, 0.45, 0.51],
                ["c", 0, 0.3, -0.12, 0.45, -0.45, 0.51],
                ["l", -6.33, 1.65],
                ["c", -3.39, 0.87, -6.18, 1.59, -6.21, 1.59],
                ["c", -0.21, -0, -0.48, -0.24, -0.51, -0.45],
                ["c", 0, -0.15, 0.06, -0.36, 0.18, -0.45],
                ["c", 0.09, -0.06, 0.87, -0.27, 3.84, -1.05],
                ["c", 2.04, -0.54, 3.84, -0.99, 4.02, -1.02],
                ["c", 0.15, -0.06, 1.14, -0.24, 2.22, -0.42],
                ["c", 1.05, -0.18, 1.92, -0.36, 1.92, -0.36],
                ["c", 0, -0, -0.87, -0.18, -1.92, -0.36],
                ["c", -1.08, -0.18, -2.07, -0.36, -2.22, -0.42],
                ["c", -0.18, -0.03, -1.98, -0.48, -4.02, -1.02],
                ["c", -2.97, -0.78, -3.75, -0.99, -3.84, -1.05],
                ["c", -0.12, -0.09, -0.18, -0.3, -0.18, -0.45],
                ["c", 0.03, -0.15, 0.15, -0.3, 0.3, -0.39],
                ["z"]
            ],
            w: 13.5,
            h: 7.5
        },
        "scripts.staccato": {
            d: [
                ["M", -0.36, -1.47],
                ["c", 0.93, -0.21, 1.86, 0.51, 1.86, 1.47],
                ["c", -0, 0.93, -0.87, 1.65, -1.8, 1.47],
                ["c", -0.54, -0.12, -1.02, -0.57, -1.14, -1.08],
                ["c", -0.21, -0.81, 0.27, -1.65, 1.08, -1.86],
                ["z"]
            ],
            w: 2.989,
            h: 3.004
        },
        "scripts.tenuto": {
            d: [
                ["M", -4.2, -0.48],
                ["l", 0.12, -0.06],
                ["l", 4.08, 0],
                ["l", 4.08, 0],
                ["l", 0.12, 0.06],
                ["c", 0.39, 0.21, 0.39, 0.75, 0, 0.96],
                ["l", -0.12, 0.06],
                ["l", -4.08, 0],
                ["l", -4.08, 0],
                ["l", -0.12, -0.06],
                ["c", -0.39, -0.21, -0.39, -0.75, 0, -0.96],
                ["z"]
            ],
            w: 8.985,
            h: 1.08
        },
        "scripts.umarcato": {
            d: [
                ["M", -0.15, -8.19],
                ["c", 0.15, -0.12, 0.36, -0.03, 0.45, 0.15],
                ["c", 0.21, 0.42, 3.45, 7.65, 3.45, 7.71],
                ["c", -0, 0.12, -0.12, 0.27, -0.21, 0.3],
                ["c", -0.03, 0.03, -0.51, 0.03, -1.14, 0.03],
                ["c", -1.05, 0, -1.08, 0, -1.17, -0.06],
                ["c", -0.09, -0.06, -0.24, -0.36, -1.17, -2.4],
                ["c", -0.57, -1.29, -1.05, -2.34, -1.08, -2.34],
                ["c", -0, -0.03, -0.51, 1.02, -1.08, 2.34],
                ["c", -0.93, 2.07, -1.08, 2.34, -1.14, 2.4],
                ["c", -0.06, 0.03, -0.15, 0.06, -0.18, 0.06],
                ["c", -0.15, 0, -0.33, -0.18, -0.33, -0.33],
                ["c", -0, -0.06, 3.24, -7.32, 3.45, -7.71],
                ["c", 0.03, -0.06, 0.09, -0.15, 0.15, -0.15],
                ["z"]
            ],
            w: 7.5,
            h: 8.245
        },
        "scripts.dmarcato": {
            d: [
                ["M", -3.57, 0.03],
                ["c", 0.03, 0, 0.57, -0.03, 1.17, -0.03],
                ["c", 1.05, 0, 1.08, 0, 1.17, 0.06],
                ["c", 0.09, 0.06, 0.24, 0.36, 1.17, 2.4],
                ["c", 0.57, 1.29, 1.05, 2.34, 1.08, 2.34],
                ["c", 0, 0.03, 0.51, -1.02, 1.08, -2.34],
                ["c", 0.93, -2.07, 1.08, -2.34, 1.14, -2.4],
                ["c", 0.06, -0.03, 0.15, -0.06, 0.18, -0.06],
                ["c", 0.15, 0, 0.33, 0.18, 0.33, 0.33],
                ["c", 0, 0.09, -3.45, 7.74, -3.54, 7.83],
                ["c", -0.12, 0.12, -0.3, 0.12, -0.42, 0],
                ["c", -0.09, -0.09, -3.54, -7.74, -3.54, -7.83],
                ["c", 0, -0.09, 0.12, -0.27, 0.18, -0.3],
                ["z"]
            ],
            w: 7.5,
            h: 8.25
        },
        "scripts.stopped": {
            d: [
                ["M", -0.27, -4.08],
                ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0],
                ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3],
                ["l", 0.06, 0.15],
                ["l", -0, 1.5],
                ["l", -0, 1.47],
                ["l", 1.47, 0],
                ["l", 1.5, 0],
                ["l", 0.15, 0.06],
                ["c", 0.15, 0.09, 0.21, 0.15, 0.3, 0.33],
                ["c", 0.09, 0.18, 0.09, 0.36, -0, 0.54],
                ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33],
                ["c", -0.12, 0.06, -0.18, 0.06, -1.62, 0.06],
                ["l", -1.47, 0],
                ["l", -0, 1.47],
                ["l", -0, 1.47],
                ["l", -0.06, 0.15],
                ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33],
                ["c", -0.18, 0.09, -0.36, 0.09, -0.54, 0],
                ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33],
                ["l", -0.06, -0.15],
                ["l", -0, -1.47],
                ["l", -0, -1.47],
                ["l", -1.47, 0],
                ["c", -1.44, 0, -1.5, 0, -1.62, -0.06],
                ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33],
                ["c", -0.09, -0.18, -0.09, -0.36, -0, -0.54],
                ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33],
                ["l", 0.15, -0.06],
                ["l", 1.47, 0],
                ["l", 1.47, 0],
                ["l", -0, -1.47],
                ["c", -0, -1.44, -0, -1.5, 0.06, -1.62],
                ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33],
                ["z"]
            ],
            w: 8.295,
            h: 8.295
        },
        "scripts.upbow": {
            d: [
                ["M", -4.65, -15.54],
                ["c", 0.12, -0.09, 0.36, -0.06, 0.48, 0.03],
                ["c", 0.03, 0.03, 0.09, 0.09, 0.12, 0.15],
                ["c", 0.03, 0.06, 0.66, 2.13, 1.41, 4.62],
                ["c", 1.35, 4.41, 1.38, 4.56, 2.01, 6.96],
                ["l", 0.63, 2.46],
                ["l", 0.63, -2.46],
                ["c", 0.63, -2.4, 0.66, -2.55, 2.01, -6.96],
                ["c", 0.75, -2.49, 1.38, -4.56, 1.41, -4.62],
                ["c", 0.06, -0.15, 0.18, -0.21, 0.36, -0.24],
                ["c", 0.15, 0, 0.3, 0.06, 0.39, 0.18],
                ["c", 0.15, 0.21, 0.24, -0.18, -2.1, 7.56],
                ["c", -1.2, 3.96, -2.22, 7.32, -2.25, 7.41],
                ["c", 0, 0.12, -0.06, 0.27, -0.09, 0.3],
                ["c", -0.12, 0.21, -0.6, 0.21, -0.72, 0],
                ["c", -0.03, -0.03, -0.09, -0.18, -0.09, -0.3],
                ["c", -0.03, -0.09, -1.05, -3.45, -2.25, -7.41],
                ["c", -2.34, -7.74, -2.25, -7.35, -2.1, -7.56],
                ["c", 0.03, -0.03, 0.09, -0.09, 0.15, -0.12],
                ["z"]
            ],
            w: 9.73,
            h: 15.608
        },
        "scripts.downbow": {
            d: [
                ["M", -5.55, -9.93],
                ["l", 0.09, -0.06],
                ["l", 5.46, 0],
                ["l", 5.46, 0],
                ["l", 0.09, 0.06],
                ["l", 0.06, 0.09],
                ["l", 0, 4.77],
                ["c", 0, 5.28, 0, 4.89, -0.18, 5.01],
                ["c", -0.18, 0.12, -0.42, 0.06, -0.54, -0.12],
                ["c", -0.06, -0.09, -0.06, -0.18, -0.06, -2.97],
                ["l", 0, -2.85],
                ["l", -4.83, 0],
                ["l", -4.83, 0],
                ["l", 0, 2.85],
                ["c", 0, 2.79, 0, 2.88, -0.06, 2.97],
                ["c", -0.15, 0.24, -0.51, 0.24, -0.66, 0],
                ["c", -0.06, -0.09, -0.06, -0.21, -0.06, -4.89],
                ["l", 0, -4.77],
                ["z"]
            ],
            w: 11.22,
            h: 9.992
        },
        "scripts.turn": {
            d: [
                ["M", -4.77, -3.9],
                ["c", 0.36, -0.06, 1.05, -0.06, 1.44, 0.03],
                ["c", 0.78, 0.15, 1.5, 0.51, 2.34, 1.14],
                ["c", 0.6, 0.45, 1.05, 0.87, 2.22, 2.01],
                ["c", 1.11, 1.08, 1.62, 1.5, 2.22, 1.86],
                ["c", 0.6, 0.36, 1.32, 0.57, 1.92, 0.57],
                ["c", 0.9, -0, 1.71, -0.57, 1.89, -1.35],
                ["c", 0.24, -0.93, -0.39, -1.89, -1.35, -2.1],
                ["l", -0.15, -0.06],
                ["l", -0.09, 0.15],
                ["c", -0.03, 0.09, -0.15, 0.24, -0.24, 0.33],
                ["c", -0.72, 0.72, -2.04, 0.54, -2.49, -0.36],
                ["c", -0.48, -0.93, 0.03, -1.86, 1.17, -2.19],
                ["c", 0.3, -0.09, 1.02, -0.09, 1.35, -0],
                ["c", 0.99, 0.27, 1.74, 0.87, 2.25, 1.83],
                ["c", 0.69, 1.41, 0.63, 3, -0.21, 4.26],
                ["c", -0.21, 0.3, -0.69, 0.81, -0.99, 1.02],
                ["c", -0.3, 0.21, -0.84, 0.45, -1.17, 0.54],
                ["c", -1.23, 0.36, -2.49, 0.15, -3.72, -0.6],
                ["c", -0.75, -0.48, -1.41, -1.02, -2.85, -2.46],
                ["c", -1.11, -1.08, -1.62, -1.5, -2.22, -1.86],
                ["c", -0.6, -0.36, -1.32, -0.57, -1.92, -0.57],
                ["c", -0.9, 0, -1.71, 0.57, -1.89, 1.35],
                ["c", -0.24, 0.93, 0.39, 1.89, 1.35, 2.1],
                ["l", 0.15, 0.06],
                ["l", 0.09, -0.15],
                ["c", 0.03, -0.09, 0.15, -0.24, 0.24, -0.33],
                ["c", 0.72, -0.72, 2.04, -0.54, 2.49, 0.36],
                ["c", 0.48, 0.93, -0.03, 1.86, -1.17, 2.19],
                ["c", -0.3, 0.09, -1.02, 0.09, -1.35, 0],
                ["c", -0.99, -0.27, -1.74, -0.87, -2.25, -1.83],
                ["c", -0.69, -1.41, -0.63, -3, 0.21, -4.26],
                ["c", 0.21, -0.3, 0.69, -0.81, 0.99, -1.02],
                ["c", 0.48, -0.33, 1.11, -0.57, 1.74, -0.66],
                ["z"]
            ],
            w: 16.366,
            h: 7.893
        },
        "scripts.trill": {
            d: [
                ["M", -0.51, -16.02],
                ["c", 0.12, -0.09, 0.21, -0.18, 0.21, -0.18],
                ["l", -0.81, 4.02],
                ["l", -0.81, 4.02],
                ["c", 0.03, 0, 0.51, -0.27, 1.08, -0.6],
                ["c", 0.6, -0.3, 1.14, -0.63, 1.26, -0.66],
                ["c", 1.14, -0.54, 2.31, -0.6, 3.09, -0.18],
                ["c", 0.27, 0.15, 0.54, 0.36, 0.6, 0.51],
                ["l", 0.06, 0.12],
                ["l", 0.21, -0.21],
                ["c", 0.9, -0.81, 2.22, -0.99, 3.12, -0.42],
                ["c", 0.6, 0.42, 0.9, 1.14, 0.78, 2.07],
                ["c", -0.15, 1.29, -1.05, 2.31, -1.95, 2.25],
                ["c", -0.48, -0.03, -0.78, -0.3, -0.96, -0.81],
                ["c", -0.09, -0.27, -0.09, -0.9, -0.03, -1.2],
                ["c", 0.21, -0.75, 0.81, -1.23, 1.59, -1.32],
                ["l", 0.24, -0.03],
                ["l", -0.09, -0.12],
                ["c", -0.51, -0.66, -1.62, -0.63, -2.31, 0.03],
                ["c", -0.39, 0.42, -0.3, 0.09, -1.23, 4.77],
                ["l", -0.81, 4.14],
                ["c", -0.03, 0, -0.12, -0.03, -0.21, -0.09],
                ["c", -0.33, -0.15, -0.54, -0.18, -0.99, -0.18],
                ["c", -0.42, 0, -0.66, 0.03, -1.05, 0.18],
                ["c", -0.12, 0.06, -0.21, 0.09, -0.21, 0.09],
                ["c", 0, -0.03, 0.36, -1.86, 0.81, -4.11],
                ["c", 0.9, -4.47, 0.87, -4.26, 0.69, -4.53],
                ["c", -0.21, -0.36, -0.66, -0.51, -1.17, -0.36],
                ["c", -0.15, 0.06, -2.22, 1.14, -2.58, 1.38],
                ["c", -0.12, 0.09, -0.12, 0.09, -0.21, 0.6],
                ["l", -0.09, 0.51],
                ["l", 0.21, 0.24],
                ["c", 0.63, 0.75, 1.02, 1.47, 1.2, 2.19],
                ["c", 0.06, 0.27, 0.06, 0.36, 0.06, 0.81],
                ["c", 0, 0.42, 0, 0.54, -0.06, 0.78],
                ["c", -0.15, 0.54, -0.33, 0.93, -0.63, 1.35],
                ["c", -0.18, 0.24, -0.57, 0.63, -0.81, 0.78],
                ["c", -0.24, 0.15, -0.63, 0.36, -0.84, 0.42],
                ["c", -0.27, 0.06, -0.66, 0.06, -0.87, 0.03],
                ["c", -0.81, -0.18, -1.32, -1.05, -1.38, -2.46],
                ["c", -0.03, -0.6, 0.03, -0.99, 0.33, -2.46],
                ["c", 0.21, -1.08, 0.24, -1.32, 0.21, -1.29],
                ["c", -1.2, 0.48, -2.4, 0.75, -3.21, 0.72],
                ["c", -0.69, -0.06, -1.17, -0.3, -1.41, -0.72],
                ["c", -0.39, -0.75, -0.12, -1.8, 0.66, -2.46],
                ["c", 0.24, -0.18, 0.69, -0.42, 1.02, -0.51],
                ["c", 0.69, -0.18, 1.53, -0.15, 2.31, 0.09],
                ["c", 0.3, 0.09, 0.75, 0.3, 0.99, 0.45],
                ["c", 0.12, 0.09, 0.15, 0.09, 0.15, 0.03],
                ["c", 0.03, -0.03, 0.33, -1.59, 0.72, -3.45],
                ["c", 0.36, -1.86, 0.66, -3.42, 0.69, -3.45],
                ["c", 0, -0.03, 0.03, -0.03, 0.21, 0.03],
                ["c", 0.21, 0.06, 0.27, 0.06, 0.48, 0.06],
                ["c", 0.42, -0.03, 0.78, -0.18, 1.26, -0.48],
                ["c", 0.15, -0.12, 0.36, -0.27, 0.48, -0.39],
                ["z"],
                ["m", -5.73, 7.68],
                ["c", -0.27, -0.03, -0.96, -0.06, -1.2, -0.03],
                ["c", -0.81, 0.12, -1.35, 0.57, -1.5, 1.2],
                ["c", -0.18, 0.66, 0.12, 1.14, 0.75, 1.29],
                ["c", 0.66, 0.12, 1.92, -0.12, 3.18, -0.66],
                ["l", 0.33, -0.15],
                ["l", 0.09, -0.39],
                ["c", 0.06, -0.21, 0.09, -0.42, 0.09, -0.45],
                ["c", 0, -0.03, -0.45, -0.3, -0.75, -0.45],
                ["c", -0.27, -0.15, -0.66, -0.27, -0.99, -0.36],
                ["z"],
                ["m", 4.29, 3.63],
                ["c", -0.24, -0.39, -0.51, -0.75, -0.51, -0.69],
                ["c", -0.06, 0.12, -0.39, 1.92, -0.45, 2.28],
                ["c", -0.09, 0.54, -0.12, 1.14, -0.06, 1.38],
                ["c", 0.06, 0.42, 0.21, 0.6, 0.51, 0.57],
                ["c", 0.39, -0.06, 0.75, -0.48, 0.93, -1.14],
                ["c", 0.09, -0.33, 0.09, -1.05, -0, -1.38],
                ["c", -0.09, -0.39, -0.24, -0.69, -0.42, -1.02],
                ["z"]
            ],
            w: 17.963,
            h: 16.49
        },
        "scripts.segno": {
            d: [
                ["M", -3.72, -11.22],
                ["c", 0.78, -0.09, 1.59, 0.03, 2.31, 0.42],
                ["c", 1.2, 0.6, 2.01, 1.71, 2.31, 3.09],
                ["c", 0.09, 0.42, 0.09, 1.2, 0.03, 1.5],
                ["c", -0.15, 0.45, -0.39, 0.81, -0.66, 0.93],
                ["c", -0.33, 0.18, -0.84, 0.21, -1.23, 0.15],
                ["c", -0.81, -0.18, -1.32, -0.93, -1.26, -1.89],
                ["c", 0.03, -0.36, 0.09, -0.57, 0.24, -0.9],
                ["c", 0.15, -0.33, 0.45, -0.6, 0.72, -0.75],
                ["c", 0.12, -0.06, 0.18, -0.09, 0.18, -0.12],
                ["c", 0, -0.03, -0.03, -0.15, -0.09, -0.24],
                ["c", -0.18, -0.45, -0.54, -0.87, -0.96, -1.08],
                ["c", -1.11, -0.57, -2.34, -0.18, -2.88, 0.9],
                ["c", -0.24, 0.51, -0.33, 1.11, -0.24, 1.83],
                ["c", 0.27, 1.92, 1.5, 3.54, 3.93, 5.13],
                ["c", 0.48, 0.33, 1.26, 0.78, 1.29, 0.78],
                ["c", 0.03, 0, 1.35, -2.19, 2.94, -4.89],
                ["l", 2.88, -4.89],
                ["l", 0.84, 0],
                ["l", 0.87, 0],
                ["l", -0.03, 0.06],
                ["c", -0.15, 0.21, -6.15, 10.41, -6.15, 10.44],
                ["c", 0, 0, 0.21, 0.15, 0.48, 0.27],
                ["c", 2.61, 1.47, 4.35, 3.03, 5.13, 4.65],
                ["c", 1.14, 2.34, 0.51, 5.07, -1.44, 6.39],
                ["c", -0.66, 0.42, -1.32, 0.63, -2.13, 0.69],
                ["c", -2.01, 0.09, -3.81, -1.41, -4.26, -3.54],
                ["c", -0.09, -0.42, -0.09, -1.2, -0.03, -1.5],
                ["c", 0.15, -0.45, 0.39, -0.81, 0.66, -0.93],
                ["c", 0.33, -0.18, 0.84, -0.21, 1.23, -0.15],
                ["c", 0.81, 0.18, 1.32, 0.93, 1.26, 1.89],
                ["c", -0.03, 0.36, -0.09, 0.57, -0.24, 0.9],
                ["c", -0.15, 0.33, -0.45, 0.6, -0.72, 0.75],
                ["c", -0.12, 0.06, -0.18, 0.09, -0.18, 0.12],
                ["c", 0, 0.03, 0.03, 0.15, 0.09, 0.24],
                ["c", 0.18, 0.45, 0.54, 0.87, 0.96, 1.08],
                ["c", 1.11, 0.57, 2.34, 0.18, 2.88, -0.9],
                ["c", 0.24, -0.51, 0.33, -1.11, 0.24, -1.83],
                ["c", -0.27, -1.92, -1.5, -3.54, -3.93, -5.13],
                ["c", -0.48, -0.33, -1.26, -0.78, -1.29, -0.78],
                ["c", -0.03, 0, -1.35, 2.19, -2.91, 4.89],
                ["l", -2.88, 4.89],
                ["l", -0.87, 0],
                ["l", -0.87, 0],
                ["l", 0.03, -0.06],
                ["c", 0.15, -0.21, 6.15, -10.41, 6.15, -10.44],
                ["c", 0, 0, -0.21, -0.15, -0.48, -0.3],
                ["c", -2.61, -1.44, -4.35, -3, -5.13, -4.62],
                ["c", -0.9, -1.89, -0.72, -4.02, 0.48, -5.52],
                ["c", 0.69, -0.84, 1.68, -1.41, 2.73, -1.53],
                ["z"],
                ["m", 8.76, 9.09],
                ["c", 0.03, -0.03, 0.15, -0.03, 0.27, -0.03],
                ["c", 0.33, 0.03, 0.57, 0.18, 0.72, 0.48],
                ["c", 0.09, 0.18, 0.09, 0.57, 0, 0.75],
                ["c", -0.09, 0.18, -0.21, 0.3, -0.36, 0.39],
                ["c", -0.15, 0.06, -0.21, 0.06, -0.39, 0.06],
                ["c", -0.21, 0, -0.27, 0, -0.39, -0.06],
                ["c", -0.3, -0.15, -0.48, -0.45, -0.48, -0.75],
                ["c", 0, -0.39, 0.24, -0.72, 0.63, -0.84],
                ["z"],
                ["m", -10.53, 2.61],
                ["c", 0.03, -0.03, 0.15, -0.03, 0.27, -0.03],
                ["c", 0.33, 0.03, 0.57, 0.18, 0.72, 0.48],
                ["c", 0.09, 0.18, 0.09, 0.57, 0, 0.75],
                ["c", -0.09, 0.18, -0.21, 0.3, -0.36, 0.39],
                ["c", -0.15, 0.06, -0.21, 0.06, -0.39, 0.06],
                ["c", -0.21, 0, -0.27, 0, -0.39, -0.06],
                ["c", -0.3, -0.15, -0.48, -0.45, -0.48, -0.75],
                ["c", 0, -0.39, 0.24, -0.72, 0.63, -0.84],
                ["z"]
            ],
            w: 15,
            h: 22.504
        },
        "scripts.coda": {
            d: [
                ["M", -0.21, -10.47],
                ["c", 0.18, -0.12, 0.42, -0.06, 0.54, 0.12],
                ["c", 0.06, 0.09, 0.06, 0.18, 0.06, 1.5],
                ["l", 0, 1.38],
                ["l", 0.18, 0],
                ["c", 0.39, 0.06, 0.96, 0.24, 1.38, 0.48],
                ["c", 1.68, 0.93, 2.82, 3.24, 3.03, 6.12],
                ["c", 0.03, 0.24, 0.03, 0.45, 0.03, 0.45],
                ["c", 0, 0.03, 0.6, 0.03, 1.35, 0.03],
                ["c", 1.5, 0, 1.47, 0, 1.59, 0.18],
                ["c", 0.09, 0.12, 0.09, 0.3, -0, 0.42],
                ["c", -0.12, 0.18, -0.09, 0.18, -1.59, 0.18],
                ["c", -0.75, 0, -1.35, 0, -1.35, 0.03],
                ["c", -0, 0, -0, 0.21, -0.03, 0.42],
                ["c", -0.24, 3.15, -1.53, 5.58, -3.45, 6.36],
                ["c", -0.27, 0.12, -0.72, 0.24, -0.96, 0.27],
                ["l", -0.18, -0],
                ["l", -0, 1.38],
                ["c", -0, 1.32, -0, 1.41, -0.06, 1.5],
                ["c", -0.15, 0.24, -0.51, 0.24, -0.66, -0],
                ["c", -0.06, -0.09, -0.06, -0.18, -0.06, -1.5],
                ["l", -0, -1.38],
                ["l", -0.18, -0],
                ["c", -0.39, -0.06, -0.96, -0.24, -1.38, -0.48],
                ["c", -1.68, -0.93, -2.82, -3.24, -3.03, -6.15],
                ["c", -0.03, -0.21, -0.03, -0.42, -0.03, -0.42],
                ["c", 0, -0.03, -0.6, -0.03, -1.35, -0.03],
                ["c", -1.5, -0, -1.47, -0, -1.59, -0.18],
                ["c", -0.09, -0.12, -0.09, -0.3, 0, -0.42],
                ["c", 0.12, -0.18, 0.09, -0.18, 1.59, -0.18],
                ["c", 0.75, -0, 1.35, -0, 1.35, -0.03],
                ["c", 0, -0, 0, -0.21, 0.03, -0.45],
                ["c", 0.24, -3.12, 1.53, -5.55, 3.45, -6.33],
                ["c", 0.27, -0.12, 0.72, -0.24, 0.96, -0.27],
                ["l", 0.18, -0],
                ["l", 0, -1.38],
                ["c", 0, -1.53, 0, -1.5, 0.18, -1.62],
                ["z"],
                ["m", -0.18, 6.93],
                ["c", 0, -2.97, 0, -3.15, -0.06, -3.15],
                ["c", -0.09, 0, -0.51, 0.15, -0.66, 0.21],
                ["c", -0.87, 0.51, -1.38, 1.62, -1.56, 3.51],
                ["c", -0.06, 0.54, -0.12, 1.59, -0.12, 2.16],
                ["l", 0, 0.42],
                ["l", 1.2, 0],
                ["l", 1.2, 0],
                ["l", 0, -3.15],
                ["z"],
                ["m", 1.17, -3.06],
                ["c", -0.09, -0.03, -0.21, -0.06, -0.27, -0.09],
                ["l", -0.12, 0],
                ["l", 0, 3.15],
                ["l", 0, 3.15],
                ["l", 1.2, 0],
                ["l", 1.2, 0],
                ["l", 0, -0.81],
                ["c", -0.06, -2.4, -0.33, -3.69, -0.93, -4.59],
                ["c", -0.27, -0.39, -0.66, -0.69, -1.08, -0.81],
                ["z"],
                ["m", -1.17, 10.14],
                ["l", 0, -3.15],
                ["l", -1.2, -0],
                ["l", -1.2, -0],
                ["l", 0, 0.81],
                ["c", 0.03, 0.96, 0.06, 1.47, 0.15, 2.13],
                ["c", 0.24, 2.04, 0.96, 3.12, 2.13, 3.36],
                ["l", 0.12, -0],
                ["l", 0, -3.15],
                ["z"],
                ["m", 3.18, -2.34],
                ["l", 0, -0.81],
                ["l", -1.2, 0],
                ["l", -1.2, 0],
                ["l", 0, 3.15],
                ["l", 0, 3.15],
                ["l", 0.12, 0],
                ["c", 1.17, -0.24, 1.89, -1.32, 2.13, -3.36],
                ["c", 0.09, -0.66, 0.12, -1.17, 0.15, -2.13],
                ["z"]
            ],
            w: 16.035,
            h: 21.062
        },
        "scripts.comma": {
            d: [
                ["M", 1.14, -4.62],
                ["c", 0.3, -0.12, 0.69, -0.03, 0.93, 0.15],
                ["c", 0.12, 0.12, 0.36, 0.45, 0.51, 0.78],
                ["c", 0.9, 1.77, 0.54, 4.05, -1.08, 6.75],
                ["c", -0.36, 0.63, -0.87, 1.38, -0.96, 1.44],
                ["c", -0.18, 0.12, -0.42, 0.06, -0.54, -0.12],
                ["c", -0.09, -0.18, -0.09, -0.3, 0.12, -0.6],
                ["c", 0.96, -1.44, 1.44, -2.97, 1.38, -4.35],
                ["c", -0.06, -0.93, -0.3, -1.68, -0.78, -2.46],
                ["c", -0.27, -0.39, -0.33, -0.63, -0.24, -0.96],
                ["c", 0.09, -0.27, 0.36, -0.54, 0.66, -0.63],
                ["z"]
            ],
            w: 3.042,
            h: 9.237
        },
        "scripts.roll": {
            d: [
                ["M", 1.95, -6],
                ["c", 0.21, -0.09, 0.36, -0.09, 0.57, 0],
                ["c", 0.39, 0.15, 0.63, 0.39, 1.47, 1.35],
                ["c", 0.66, 0.75, 0.78, 0.87, 1.08, 1.05],
                ["c", 0.75, 0.45, 1.65, 0.42, 2.4, -0.06],
                ["c", 0.12, -0.09, 0.27, -0.27, 0.54, -0.6],
                ["c", 0.42, -0.54, 0.51, -0.63, 0.69, -0.63],
                ["c", 0.09, 0, 0.3, 0.12, 0.36, 0.21],
                ["c", 0.09, 0.12, 0.12, 0.3, 0.03, 0.42],
                ["c", -0.06, 0.12, -3.15, 3.9, -3.3, 4.08],
                ["c", -0.06, 0.06, -0.18, 0.12, -0.27, 0.18],
                ["c", -0.27, 0.12, -0.6, 0.06, -0.99, -0.27],
                ["c", -0.27, -0.21, -0.42, -0.39, -1.08, -1.14],
                ["c", -0.63, -0.72, -0.81, -0.9, -1.17, -1.08],
                ["c", -0.36, -0.18, -0.57, -0.21, -0.99, -0.21],
                ["c", -0.39, 0, -0.63, 0.03, -0.93, 0.18],
                ["c", -0.36, 0.15, -0.51, 0.27, -0.9, 0.81],
                ["c", -0.24, 0.27, -0.45, 0.51, -0.48, 0.54],
                ["c", -0.12, 0.09, -0.27, 0.06, -0.39, 0],
                ["c", -0.24, -0.15, -0.33, -0.39, -0.21, -0.6],
                ["c", 0.09, -0.12, 3.18, -3.87, 3.33, -4.02],
                ["c", 0.06, -0.06, 0.18, -0.15, 0.24, -0.21],
                ["z"]
            ],
            w: 10.817,
            h: 6.125
        },
        "scripts.prall": {
            d: [
                ["M", -4.38, -3.69],
                ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06],
                ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95],
                ["l", 1.53, 1.83],
                ["c", 0.03, -0, 0.57, -0.84, 1.23, -1.83],
                ["c", 1.14, -1.68, 1.23, -1.83, 1.35, -1.89],
                ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06],
                ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95],
                ["l", 1.53, 1.83],
                ["l", 0.48, -0.69],
                ["c", 0.51, -0.78, 0.54, -0.84, 0.69, -0.9],
                ["c", 0.42, -0.18, 0.87, 0.15, 0.81, 0.6],
                ["c", -0.03, 0.12, -0.3, 0.51, -1.5, 2.37],
                ["c", -1.38, 2.07, -1.5, 2.22, -1.62, 2.28],
                ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06],
                ["c", -0.3, 0, -0.27, 0.03, -1.89, -1.95],
                ["l", -1.53, -1.83],
                ["c", -0.03, 0, -0.57, 0.84, -1.23, 1.83],
                ["c", -1.14, 1.68, -1.23, 1.83, -1.35, 1.89],
                ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06],
                ["c", -0.3, 0, -0.27, 0.03, -1.89, -1.95],
                ["l", -1.53, -1.83],
                ["l", -0.48, 0.69],
                ["c", -0.51, 0.78, -0.54, 0.84, -0.69, 0.9],
                ["c", -0.42, 0.18, -0.87, -0.15, -0.81, -0.6],
                ["c", 0.03, -0.12, 0.3, -0.51, 1.5, -2.37],
                ["c", 1.38, -2.07, 1.5, -2.22, 1.62, -2.28],
                ["z"]
            ],
            w: 15.011,
            h: 7.5
        },
        "scripts.mordent": {
            d: [
                ["M", -0.21, -4.95],
                ["c", 0.27, -0.15, 0.63, 0, 0.75, 0.27],
                ["c", 0.06, 0.12, 0.06, 0.24, 0.06, 1.44],
                ["l", 0, 1.29],
                ["l", 0.57, -0.84],
                ["c", 0.51, -0.75, 0.57, -0.84, 0.69, -0.9],
                ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06],
                ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95],
                ["l", 1.53, 1.83],
                ["l", 0.48, -0.69],
                ["c", 0.51, -0.78, 0.54, -0.84, 0.69, -0.9],
                ["c", 0.42, -0.18, 0.87, 0.15, 0.81, 0.6],
                ["c", -0.03, 0.12, -0.3, 0.51, -1.5, 2.37],
                ["c", -1.38, 2.07, -1.5, 2.22, -1.62, 2.28],
                ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06],
                ["c", -0.3, 0, -0.27, 0.03, -1.83, -1.89],
                ["c", -0.81, -0.99, -1.5, -1.8, -1.53, -1.86],
                ["c", -0.06, -0.03, -0.06, -0.03, -0.12, 0.03],
                ["c", -0.06, 0.06, -0.06, 0.15, -0.06, 2.28],
                ["c", -0, 1.95, -0, 2.25, -0.06, 2.34],
                ["c", -0.18, 0.45, -0.81, 0.48, -1.05, 0.03],
                ["c", -0.03, -0.06, -0.06, -0.24, -0.06, -1.41],
                ["l", -0, -1.35],
                ["l", -0.57, 0.84],
                ["c", -0.54, 0.78, -0.6, 0.87, -0.72, 0.93],
                ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06],
                ["c", -0.3, 0, -0.27, 0.03, -1.89, -1.95],
                ["l", -1.53, -1.83],
                ["l", -0.48, 0.69],
                ["c", -0.51, 0.78, -0.54, 0.84, -0.69, 0.9],
                ["c", -0.42, 0.18, -0.87, -0.15, -0.81, -0.6],
                ["c", 0.03, -0.12, 0.3, -0.51, 1.5, -2.37],
                ["c", 1.38, -2.07, 1.5, -2.22, 1.62, -2.28],
                ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06],
                ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95],
                ["l", 1.53, 1.83],
                ["c", 0.03, -0, 0.06, -0.06, 0.09, -0.09],
                ["c", 0.06, -0.12, 0.06, -0.15, 0.06, -2.28],
                ["c", -0, -1.92, -0, -2.22, 0.06, -2.31],
                ["c", 0.06, -0.15, 0.15, -0.24, 0.3, -0.3],
                ["z"]
            ],
            w: 15.011,
            h: 10.012
        },
        "flags.u8th": {
            d: [
                ["M", -0.42, 3.75],
                ["l", 0, -3.75],
                ["l", 0.21, 0],
                ["l", 0.21, 0],
                ["l", 0, 0.18],
                ["c", 0, 0.3, 0.06, 0.84, 0.12, 1.23],
                ["c", 0.24, 1.53, 0.9, 3.12, 2.13, 5.16],
                ["l", 0.99, 1.59],
                ["c", 0.87, 1.44, 1.38, 2.34, 1.77, 3.09],
                ["c", 0.81, 1.68, 1.2, 3.06, 1.26, 4.53],
                ["c", 0.03, 1.53, -0.21, 3.27, -0.75, 5.01],
                ["c", -0.21, 0.69, -0.51, 1.5, -0.6, 1.59],
                ["c", -0.09, 0.12, -0.27, 0.21, -0.42, 0.21],
                ["c", -0.15, 0, -0.42, -0.12, -0.51, -0.21],
                ["c", -0.15, -0.18, -0.18, -0.42, -0.09, -0.66],
                ["c", 0.15, -0.33, 0.45, -1.2, 0.57, -1.62],
                ["c", 0.42, -1.38, 0.6, -2.58, 0.6, -3.9],
                ["c", 0, -0.66, 0, -0.81, -0.06, -1.11],
                ["c", -0.39, -2.07, -1.8, -4.26, -4.59, -7.14],
                ["l", -0.42, -0.45],
                ["l", -0.21, 0],
                ["l", -0.21, 0],
                ["l", 0, -3.75],
                ["z"]
            ],
            w: 6.692,
            h: 22.59
        },
        "flags.u16th": {
            d: [
                ["M", -0.42, 7.5],
                ["l", 0, -7.5],
                ["l", 0.21, 0],
                ["l", 0.21, 0],
                ["l", 0, 0.39],
                ["c", 0.06, 1.08, 0.39, 2.19, 0.99, 3.39],
                ["c", 0.45, 0.9, 0.87, 1.59, 1.95, 3.12],
                ["c", 1.29, 1.86, 1.77, 2.64, 2.22, 3.57],
                ["c", 0.45, 0.93, 0.72, 1.8, 0.87, 2.64],
                ["c", 0.06, 0.51, 0.06, 1.5, 0, 1.92],
                ["c", -0.12, 0.6, -0.3, 1.2, -0.54, 1.71],
                ["l", -0.09, 0.24],
                ["l", 0.18, 0.45],
                ["c", 0.51, 1.2, 0.72, 2.22, 0.69, 3.42],
                ["c", -0.06, 1.53, -0.39, 3.03, -0.99, 4.53],
                ["c", -0.3, 0.75, -0.36, 0.81, -0.57, 0.9],
                ["c", -0.15, 0.09, -0.33, 0.06, -0.48, -0],
                ["c", -0.18, -0.09, -0.27, -0.18, -0.33, -0.33],
                ["c", -0.09, -0.18, -0.06, -0.3, 0.12, -0.75],
                ["c", 0.66, -1.41, 1.02, -2.88, 1.08, -4.32],
                ["c", 0, -0.6, -0.03, -1.05, -0.18, -1.59],
                ["c", -0.3, -1.2, -0.99, -2.4, -2.25, -3.87],
                ["c", -0.42, -0.48, -1.53, -1.62, -2.19, -2.22],
                ["l", -0.45, -0.42],
                ["l", -0.03, 1.11],
                ["l", 0, 1.11],
                ["l", -0.21, -0],
                ["l", -0.21, -0],
                ["l", 0, -7.5],
                ["z"],
                ["m", 1.65, 0.09],
                ["c", -0.3, -0.3, -0.69, -0.72, -0.9, -0.87],
                ["l", -0.33, -0.33],
                ["l", 0, 0.15],
                ["c", 0, 0.3, 0.06, 0.81, 0.15, 1.26],
                ["c", 0.27, 1.29, 0.87, 2.61, 2.04, 4.29],
                ["c", 0.15, 0.24, 0.6, 0.87, 0.96, 1.38],
                ["l", 1.08, 1.53],
                ["l", 0.42, 0.63],
                ["c", 0.03, 0, 0.12, -0.36, 0.21, -0.72],
                ["c", 0.06, -0.33, 0.06, -1.2, 0, -1.62],
                ["c", -0.33, -1.71, -1.44, -3.48, -3.63, -5.7],
                ["z"]
            ],
            w: 6.693,
            h: 26.337
        },
        "flags.u32nd": {
            d: [
                ["M", -0.42, 11.247],
                ["l", 0, -11.25],
                ["l", 0.21, 0],
                ["l", 0.21, 0],
                ["l", 0, 0.36],
                ["c", 0.09, 1.68, 0.69, 3.27, 2.07, 5.46],
                ["l", 0.87, 1.35],
                ["c", 1.02, 1.62, 1.47, 2.37, 1.86, 3.18],
                ["c", 0.48, 1.02, 0.78, 1.92, 0.93, 2.88],
                ["c", 0.06, 0.48, 0.06, 1.5, 0, 1.89],
                ["c", -0.09, 0.42, -0.21, 0.87, -0.36, 1.26],
                ["l", -0.12, 0.3],
                ["l", 0.15, 0.39],
                ["c", 0.69, 1.56, 0.84, 2.88, 0.54, 4.38],
                ["c", -0.09, 0.45, -0.27, 1.08, -0.45, 1.47],
                ["l", -0.12, 0.24],
                ["l", 0.18, 0.36],
                ["c", 0.33, 0.72, 0.57, 1.56, 0.69, 2.34],
                ["c", 0.12, 1.02, -0.06, 2.52, -0.42, 3.84],
                ["c", -0.27, 0.93, -0.75, 2.13, -0.93, 2.31],
                ["c", -0.18, 0.15, -0.45, 0.18, -0.66, 0.09],
                ["c", -0.18, -0.09, -0.27, -0.18, -0.33, -0.33],
                ["c", -0.09, -0.18, -0.06, -0.3, 0.06, -0.6],
                ["c", 0.21, -0.36, 0.42, -0.9, 0.57, -1.38],
                ["c", 0.51, -1.41, 0.69, -3.06, 0.48, -4.08],
                ["c", -0.15, -0.81, -0.57, -1.68, -1.2, -2.55],
                ["c", -0.72, -0.99, -1.83, -2.13, -3.3, -3.33],
                ["l", -0.48, -0.42],
                ["l", -0.03, 1.53],
                ["l", 0, 1.56],
                ["l", -0.21, 0],
                ["l", -0.21, 0],
                ["l", 0, -11.25],
                ["z"],
                ["m", 1.26, -3.96],
                ["c", -0.27, -0.3, -0.54, -0.6, -0.66, -0.72],
                ["l", -0.18, -0.21],
                ["l", 0, 0.42],
                ["c", 0.06, 0.87, 0.24, 1.74, 0.66, 2.67],
                ["c", 0.36, 0.87, 0.96, 1.86, 1.92, 3.18],
                ["c", 0.21, 0.33, 0.63, 0.87, 0.87, 1.23],
                ["c", 0.27, 0.39, 0.6, 0.84, 0.75, 1.08],
                ["l", 0.27, 0.39],
                ["l", 0.03, -0.12],
                ["c", 0.12, -0.45, 0.15, -1.05, 0.09, -1.59],
                ["c", -0.27, -1.86, -1.38, -3.78, -3.75, -6.33],
                ["z"],
                ["m", -0.27, 6.09],
                ["c", -0.27, -0.21, -0.48, -0.42, -0.51, -0.45],
                ["c", -0.06, -0.03, -0.06, -0.03, -0.06, 0.21],
                ["c", 0, 0.9, 0.3, 2.04, 0.81, 3.09],
                ["c", 0.48, 1.02, 0.96, 1.77, 2.37, 3.63],
                ["c", 0.6, 0.78, 1.05, 1.44, 1.29, 1.77],
                ["c", 0.06, 0.12, 0.15, 0.21, 0.15, 0.18],
                ["c", 0.03, -0.03, 0.18, -0.57, 0.24, -0.87],
                ["c", 0.06, -0.45, 0.06, -1.32, -0.03, -1.74],
                ["c", -0.09, -0.48, -0.24, -0.9, -0.51, -1.44],
                ["c", -0.66, -1.35, -1.83, -2.7, -3.75, -4.38],
                ["z"]
            ],
            w: 6.697,
            h: 32.145
        },
        "flags.u64th": {
            d: [
                ["M", -0.42, 15],
                ["l", 0, -15],
                ["l", 0.21, 0],
                ["l", 0.21, 0],
                ["l", 0, 0.36],
                ["c", 0.06, 1.2, 0.39, 2.37, 1.02, 3.66],
                ["c", 0.39, 0.81, 0.84, 1.56, 1.8, 3.09],
                ["c", 0.81, 1.26, 1.05, 1.68, 1.35, 2.22],
                ["c", 0.87, 1.5, 1.35, 2.79, 1.56, 4.08],
                ["c", 0.06, 0.54, 0.06, 1.56, -0.03, 2.04],
                ["c", -0.09, 0.48, -0.21, 0.99, -0.36, 1.35],
                ["l", -0.12, 0.27],
                ["l", 0.12, 0.27],
                ["c", 0.09, 0.15, 0.21, 0.45, 0.27, 0.66],
                ["c", 0.69, 1.89, 0.63, 3.66, -0.18, 5.46],
                ["l", -0.18, 0.39],
                ["l", 0.15, 0.33],
                ["c", 0.3, 0.66, 0.51, 1.44, 0.63, 2.1],
                ["c", 0.06, 0.48, 0.06, 1.35, 0, 1.71],
                ["c", -0.15, 0.57, -0.42, 1.2, -0.78, 1.68],
                ["l", -0.21, 0.27],
                ["l", 0.18, 0.33],
                ["c", 0.57, 1.05, 0.93, 2.13, 1.02, 3.18],
                ["c", 0.06, 0.72, 0, 1.83, -0.21, 2.79],
                ["c", -0.18, 1.02, -0.63, 2.34, -1.02, 3.09],
                ["c", -0.15, 0.33, -0.48, 0.45, -0.78, 0.3],
                ["c", -0.18, -0.09, -0.27, -0.18, -0.33, -0.33],
                ["c", -0.09, -0.18, -0.06, -0.3, 0.03, -0.54],
                ["c", 0.75, -1.5, 1.23, -3.45, 1.17, -4.89],
                ["c", -0.06, -1.02, -0.42, -2.01, -1.17, -3.15],
                ["c", -0.48, -0.72, -1.02, -1.35, -1.89, -2.22],
                ["c", -0.57, -0.57, -1.56, -1.5, -1.92, -1.77],
                ["l", -0.12, -0.09],
                ["l", 0, 1.68],
                ["l", 0, 1.68],
                ["l", -0.21, 0],
                ["l", -0.21, 0],
                ["l", 0, -15],
                ["z"],
                ["m", 0.93, -8.07],
                ["c", -0.27, -0.3, -0.48, -0.54, -0.51, -0.54],
                ["c", -0, 0, -0, 0.69, 0.03, 1.02],
                ["c", 0.15, 1.47, 0.75, 2.94, 2.04, 4.83],
                ["l", 1.08, 1.53],
                ["c", 0.39, 0.57, 0.84, 1.2, 0.99, 1.44],
                ["c", 0.15, 0.24, 0.3, 0.45, 0.3, 0.45],
                ["c", -0, 0, 0.03, -0.09, 0.06, -0.21],
                ["c", 0.36, -1.59, -0.15, -3.33, -1.47, -5.4],
                ["c", -0.63, -0.93, -1.35, -1.83, -2.52, -3.12],
                ["z"],
                ["m", 0.06, 6.72],
                ["c", -0.24, -0.21, -0.48, -0.42, -0.51, -0.45],
                ["l", -0.06, -0.06],
                ["l", 0, 0.33],
                ["c", 0, 1.2, 0.3, 2.34, 0.93, 3.6],
                ["c", 0.45, 0.9, 0.96, 1.68, 2.25, 3.51],
                ["c", 0.39, 0.54, 0.84, 1.17, 1.02, 1.44],
                ["c", 0.21, 0.33, 0.33, 0.51, 0.33, 0.48],
                ["c", 0.06, -0.09, 0.21, -0.63, 0.3, -0.99],
                ["c", 0.06, -0.33, 0.06, -0.45, 0.06, -0.96],
                ["c", -0, -0.6, -0.03, -0.84, -0.18, -1.35],
                ["c", -0.3, -1.08, -1.02, -2.28, -2.13, -3.57],
                ["c", -0.39, -0.45, -1.44, -1.47, -2.01, -1.98],
                ["z"],
                ["m", 0, 6.72],
                ["c", -0.24, -0.21, -0.48, -0.39, -0.51, -0.42],
                ["l", -0.06, -0.06],
                ["l", 0, 0.33],
                ["c", 0, 1.41, 0.45, 2.82, 1.38, 4.35],
                ["c", 0.42, 0.72, 0.72, 1.14, 1.86, 2.73],
                ["c", 0.36, 0.45, 0.75, 0.99, 0.87, 1.2],
                ["c", 0.15, 0.21, 0.3, 0.36, 0.3, 0.36],
                ["c", 0.06, 0, 0.3, -0.48, 0.39, -0.75],
                ["c", 0.09, -0.36, 0.12, -0.63, 0.12, -1.05],
                ["c", -0.06, -1.05, -0.45, -2.04, -1.2, -3.18],
                ["c", -0.57, -0.87, -1.11, -1.53, -2.07, -2.49],
                ["c", -0.36, -0.33, -0.84, -0.78, -1.08, -1.02],
                ["z"]
            ],
            w: 6.682,
            h: 39.694
        },
        "flags.d8th": {
            d: [
                ["M", 5.67, -21.63],
                ["c", 0.24, -0.12, 0.54, -0.06, 0.69, 0.15],
                ["c", 0.06, 0.06, 0.21, 0.36, 0.39, 0.66],
                ["c", 0.84, 1.77, 1.26, 3.36, 1.32, 5.1],
                ["c", 0.03, 1.29, -0.21, 2.37, -0.81, 3.63],
                ["c", -0.6, 1.23, -1.26, 2.13, -3.21, 4.38],
                ["c", -1.35, 1.53, -1.86, 2.19, -2.4, 2.97],
                ["c", -0.63, 0.93, -1.11, 1.92, -1.38, 2.79],
                ["c", -0.15, 0.54, -0.27, 1.35, -0.27, 1.8],
                ["l", 0, 0.15],
                ["l", -0.21, -0],
                ["l", -0.21, -0],
                ["l", 0, -3.75],
                ["l", 0, -3.75],
                ["l", 0.21, 0],
                ["l", 0.21, 0],
                ["l", 0.48, -0.3],
                ["c", 1.83, -1.11, 3.12, -2.1, 4.17, -3.12],
                ["c", 0.78, -0.81, 1.32, -1.53, 1.71, -2.31],
                ["c", 0.45, -0.93, 0.6, -1.74, 0.51, -2.88],
                ["c", -0.12, -1.56, -0.63, -3.18, -1.47, -4.68],
                ["c", -0.12, -0.21, -0.15, -0.33, -0.06, -0.51],
                ["c", 0.06, -0.15, 0.15, -0.24, 0.33, -0.33],
                ["z"]
            ],
            w: 8.492,
            h: 21.691
        },
        "flags.ugrace": {
            d: [
                ["M", 6.03, 6.93],
                ["c", 0.15, -0.09, 0.33, -0.06, 0.51, 0],
                ["c", 0.15, 0.09, 0.21, 0.15, 0.3, 0.33],
                ["c", 0.09, 0.18, 0.06, 0.39, -0.03, 0.54],
                ["c", -0.06, 0.15, -10.89, 8.88, -11.07, 8.97],
                ["c", -0.15, 0.09, -0.33, 0.06, -0.48, 0],
                ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33],
                ["c", -0.09, -0.18, -0.06, -0.39, 0.03, -0.54],
                ["c", 0.06, -0.15, 10.89, -8.88, 11.07, -8.97],
                ["z"]
            ],
            w: 12.019,
            h: 9.954
        },
        "flags.dgrace": {
            d: [
                ["M", -6.06, -15.93],
                ["c", 0.18, -0.09, 0.33, -0.12, 0.48, -0.06],
                ["c", 0.18, 0.09, 14.01, 8.04, 14.1, 8.1],
                ["c", 0.12, 0.12, 0.18, 0.33, 0.18, 0.51],
                ["c", -0.03, 0.21, -0.15, 0.39, -0.36, 0.48],
                ["c", -0.18, 0.09, -0.33, 0.12, -0.48, 0.06],
                ["c", -0.18, -0.09, -14.01, -8.04, -14.1, -8.1],
                ["c", -0.12, -0.12, -0.18, -0.33, -0.18, -0.51],
                ["c", 0.03, -0.21, 0.15, -0.39, 0.36, -0.48],
                ["z"]
            ],
            w: 15.12,
            h: 9.212
        },
        "flags.d16th": {
            d: [
                ["M", 6.84, -22.53],
                ["c", 0.27, -0.12, 0.57, -0.06, 0.72, 0.15],
                ["c", 0.15, 0.15, 0.33, 0.87, 0.45, 1.56],
                ["c", 0.06, 0.33, 0.06, 1.35, 0, 1.65],
                ["c", -0.06, 0.33, -0.15, 0.78, -0.27, 1.11],
                ["c", -0.12, 0.33, -0.45, 0.96, -0.66, 1.32],
                ["l", -0.18, 0.27],
                ["l", 0.09, 0.18],
                ["c", 0.48, 1.02, 0.72, 2.25, 0.69, 3.3],
                ["c", -0.06, 1.23, -0.42, 2.28, -1.26, 3.45],
                ["c", -0.57, 0.87, -0.99, 1.32, -3, 3.39],
                ["c", -1.56, 1.56, -2.22, 2.4, -2.76, 3.45],
                ["c", -0.42, 0.84, -0.66, 1.8, -0.66, 2.55],
                ["l", 0, 0.15],
                ["l", -0.21, -0],
                ["l", -0.21, -0],
                ["l", 0, -7.5],
                ["l", 0, -7.5],
                ["l", 0.21, -0],
                ["l", 0.21, -0],
                ["l", 0, 1.14],
                ["l", 0, 1.11],
                ["l", 0.27, -0.15],
                ["c", 1.11, -0.57, 1.77, -0.99, 2.52, -1.47],
                ["c", 2.37, -1.56, 3.69, -3.15, 4.05, -4.83],
                ["c", 0.03, -0.18, 0.03, -0.39, 0.03, -0.78],
                ["c", 0, -0.6, -0.03, -0.93, -0.24, -1.5],
                ["c", -0.06, -0.18, -0.12, -0.39, -0.15, -0.45],
                ["c", -0.03, -0.24, 0.12, -0.48, 0.36, -0.6],
                ["z"],
                ["m", -0.63, 7.5],
                ["c", -0.06, -0.18, -0.15, -0.36, -0.15, -0.36],
                ["c", -0.03, 0, -0.03, 0.03, -0.06, 0.06],
                ["c", -0.06, 0.12, -0.96, 1.02, -1.95, 1.98],
                ["c", -0.63, 0.57, -1.26, 1.17, -1.44, 1.35],
                ["c", -1.53, 1.62, -2.28, 2.85, -2.55, 4.32],
                ["c", -0.03, 0.18, -0.03, 0.54, -0.06, 0.99],
                ["l", 0, 0.69],
                ["l", 0.18, -0.09],
                ["c", 0.93, -0.54, 2.1, -1.29, 2.82, -1.83],
                ["c", 0.69, -0.51, 1.02, -0.81, 1.53, -1.29],
                ["c", 1.86, -1.89, 2.37, -3.66, 1.68, -5.82],
                ["z"]
            ],
            w: 8.475,
            h: 22.591
        },
        "flags.d32nd": {
            d: [
                ["M", 6.794, -29.13],
                ["c", 0.27, -0.12, 0.57, -0.06, 0.72, 0.15],
                ["c", 0.12, 0.12, 0.27, 0.63, 0.36, 1.11],
                ["c", 0.33, 1.59, 0.06, 3.06, -0.81, 4.47],
                ["l", -0.18, 0.27],
                ["l", 0.09, 0.15],
                ["c", 0.12, 0.24, 0.33, 0.69, 0.45, 1.05],
                ["c", 0.63, 1.83, 0.45, 3.57, -0.57, 5.22],
                ["l", -0.18, 0.3],
                ["l", 0.15, 0.27],
                ["c", 0.42, 0.87, 0.6, 1.71, 0.57, 2.61],
                ["c", -0.06, 1.29, -0.48, 2.46, -1.35, 3.78],
                ["c", -0.54, 0.81, -0.93, 1.29, -2.46, 3],
                ["c", -0.51, 0.54, -1.05, 1.17, -1.26, 1.41],
                ["c", -1.56, 1.86, -2.25, 3.36, -2.37, 5.01],
                ["l", 0, 0.33],
                ["l", -0.21, -0],
                ["l", -0.21, -0],
                ["l", 0, -11.25],
                ["l", 0, -11.25],
                ["l", 0.21, 0],
                ["l", 0.21, 0],
                ["l", 0, 1.35],
                ["l", 0.03, 1.35],
                ["l", 0.78, -0.39],
                ["c", 1.38, -0.69, 2.34, -1.26, 3.24, -1.92],
                ["c", 1.38, -1.02, 2.28, -2.13, 2.64, -3.21],
                ["c", 0.15, -0.48, 0.18, -0.72, 0.18, -1.29],
                ["c", 0, -0.57, -0.06, -0.9, -0.24, -1.47],
                ["c", -0.06, -0.18, -0.12, -0.39, -0.15, -0.45],
                ["c", -0.03, -0.24, 0.12, -0.48, 0.36, -0.6],
                ["z"],
                ["m", -0.63, 7.2],
                ["c", -0.09, -0.18, -0.12, -0.21, -0.12, -0.15],
                ["c", -0.03, 0.09, -1.02, 1.08, -2.04, 2.04],
                ["c", -1.17, 1.08, -1.65, 1.56, -2.07, 2.04],
                ["c", -0.84, 0.96, -1.38, 1.86, -1.68, 2.76],
                ["c", -0.21, 0.57, -0.27, 0.99, -0.3, 1.65],
                ["l", 0, 0.54],
                ["l", 0.66, -0.33],
                ["c", 3.57, -1.86, 5.49, -3.69, 5.94, -5.7],
                ["c", 0.06, -0.39, 0.06, -1.2, -0.03, -1.65],
                ["c", -0.06, -0.39, -0.24, -0.9, -0.36, -1.2],
                ["z"],
                ["m", -0.06, 7.2],
                ["c", -0.06, -0.15, -0.12, -0.33, -0.15, -0.45],
                ["l", -0.06, -0.18],
                ["l", -0.18, 0.21],
                ["l", -1.83, 1.83],
                ["c", -0.87, 0.9, -1.77, 1.8, -1.95, 2.01],
                ["c", -1.08, 1.29, -1.62, 2.31, -1.89, 3.51],
                ["c", -0.06, 0.3, -0.06, 0.51, -0.09, 0.93],
                ["l", 0, 0.57],
                ["l", 0.09, -0.06],
                ["c", 0.75, -0.45, 1.89, -1.26, 2.52, -1.74],
                ["c", 0.81, -0.66, 1.74, -1.53, 2.22, -2.16],
                ["c", 1.26, -1.53, 1.68, -3.06, 1.32, -4.47],
                ["z"]
            ],
            w: 8.475,
            h: 29.191
        },
        "flags.d64th": {
            d: [
                ["M", 7.08, -32.88],
                ["c", 0.3, -0.12, 0.66, -0.03, 0.78, 0.24],
                ["c", 0.18, 0.33, 0.27, 2.1, 0.15, 2.64],
                ["c", -0.09, 0.39, -0.21, 0.78, -0.39, 1.08],
                ["l", -0.15, 0.3],
                ["l", 0.09, 0.27],
                ["c", 0.03, 0.12, 0.09, 0.45, 0.12, 0.69],
                ["c", 0.27, 1.44, 0.18, 2.55, -0.3, 3.6],
                ["l", -0.12, 0.33],
                ["l", 0.06, 0.42],
                ["c", 0.27, 1.35, 0.33, 2.82, 0.21, 3.63],
                ["c", -0.12, 0.6, -0.3, 1.23, -0.57, 1.8],
                ["l", -0.15, 0.27],
                ["l", 0.03, 0.42],
                ["c", 0.06, 1.02, 0.06, 2.7, 0.03, 3.06],
                ["c", -0.15, 1.47, -0.66, 2.76, -1.74, 4.41],
                ["c", -0.45, 0.69, -0.75, 1.11, -1.74, 2.37],
                ["c", -1.05, 1.38, -1.5, 1.98, -1.95, 2.73],
                ["c", -0.93, 1.5, -1.38, 2.82, -1.44, 4.2],
                ["l", 0, 0.42],
                ["l", -0.21, -0],
                ["l", -0.21, -0],
                ["l", 0, -15],
                ["l", 0, -15],
                ["l", 0.21, -0],
                ["l", 0.21, -0],
                ["l", 0, 1.86],
                ["l", 0, 1.89],
                ["c", 0, -0, 0.21, -0.03, 0.45, -0.09],
                ["c", 2.22, -0.39, 4.08, -1.11, 5.19, -2.01],
                ["c", 0.63, -0.54, 1.02, -1.14, 1.2, -1.8],
                ["c", 0.06, -0.3, 0.06, -1.14, -0.03, -1.65],
                ["c", -0.03, -0.18, -0.06, -0.39, -0.09, -0.48],
                ["c", -0.03, -0.24, 0.12, -0.48, 0.36, -0.6],
                ["z"],
                ["m", -0.45, 6.15],
                ["c", -0.03, -0.18, -0.06, -0.42, -0.06, -0.54],
                ["l", -0.03, -0.18],
                ["l", -0.33, 0.3],
                ["c", -0.42, 0.36, -0.87, 0.72, -1.68, 1.29],
                ["c", -1.98, 1.38, -2.25, 1.59, -2.85, 2.16],
                ["c", -0.75, 0.69, -1.23, 1.44, -1.47, 2.19],
                ["c", -0.15, 0.45, -0.18, 0.63, -0.21, 1.35],
                ["l", 0, 0.66],
                ["l", 0.39, -0.18],
                ["c", 1.83, -0.9, 3.45, -1.95, 4.47, -2.91],
                ["c", 0.93, -0.9, 1.53, -1.83, 1.74, -2.82],
                ["c", 0.06, -0.33, 0.06, -0.87, 0.03, -1.32],
                ["z"],
                ["m", -0.27, 4.86],
                ["c", -0.03, -0.21, -0.06, -0.36, -0.06, -0.36],
                ["c", 0, -0.03, -0.12, 0.09, -0.24, 0.24],
                ["c", -0.39, 0.48, -0.99, 1.08, -2.16, 2.19],
                ["c", -1.47, 1.38, -1.92, 1.83, -2.46, 2.49],
                ["c", -0.66, 0.87, -1.08, 1.74, -1.29, 2.58],
                ["c", -0.09, 0.42, -0.15, 0.87, -0.15, 1.44],
                ["l", 0, 0.54],
                ["l", 0.48, -0.33],
                ["c", 1.5, -1.02, 2.58, -1.89, 3.51, -2.82],
                ["c", 1.47, -1.47, 2.25, -2.85, 2.4, -4.26],
                ["c", 0.03, -0.39, 0.03, -1.17, -0.03, -1.71],
                ["z"],
                ["m", -0.66, 7.68],
                ["c", 0.03, -0.15, 0.03, -0.6, 0.03, -0.99],
                ["l", 0, -0.72],
                ["l", -0.27, 0.33],
                ["l", -1.74, 1.98],
                ["c", -1.77, 1.92, -2.43, 2.76, -2.97, 3.9],
                ["c", -0.51, 1.02, -0.72, 1.77, -0.75, 2.91],
                ["c", 0, 0.63, 0, 0.63, 0.06, 0.6],
                ["c", 0.03, -0.03, 0.3, -0.27, 0.63, -0.54],
                ["c", 0.66, -0.6, 1.86, -1.8, 2.31, -2.31],
                ["c", 1.65, -1.89, 2.52, -3.54, 2.7, -5.16],
                ["z"]
            ],
            w: 8.485,
            h: 32.932
        },
        "clefs.C": {
            d: [
                ["M", 0.06, -14.94],
                ["l", 0.09, -0.06],
                ["l", 1.92, 0],
                ["l", 1.92, 0],
                ["l", 0.09, 0.06],
                ["l", 0.06, 0.09],
                ["l", 0, 14.85],
                ["l", 0, 14.82],
                ["l", -0.06, 0.09],
                ["l", -0.09, 0.06],
                ["l", -1.92, 0],
                ["l", -1.92, 0],
                ["l", -0.09, -0.06],
                ["l", -0.06, -0.09],
                ["l", 0, -14.82],
                ["l", 0, -14.85],
                ["z"],
                ["m", 5.37, 0],
                ["c", 0.09, -0.06, 0.09, -0.06, 0.57, -0.06],
                ["c", 0.45, 0, 0.45, 0, 0.54, 0.06],
                ["l", 0.06, 0.09],
                ["l", 0, 7.14],
                ["l", 0, 7.11],
                ["l", 0.09, -0.06],
                ["c", 0.18, -0.18, 0.72, -0.84, 0.96, -1.2],
                ["c", 0.3, -0.45, 0.66, -1.17, 0.84, -1.65],
                ["c", 0.36, -0.9, 0.57, -1.83, 0.6, -2.79],
                ["c", 0.03, -0.48, 0.03, -0.54, 0.09, -0.63],
                ["c", 0.12, -0.18, 0.36, -0.21, 0.54, -0.12],
                ["c", 0.18, 0.09, 0.21, 0.15, 0.24, 0.66],
                ["c", 0.06, 0.87, 0.21, 1.56, 0.57, 2.22],
                ["c", 0.51, 1.02, 1.26, 1.68, 2.22, 1.92],
                ["c", 0.21, 0.06, 0.33, 0.06, 0.78, 0.06],
                ["c", 0.45, -0, 0.57, -0, 0.84, -0.06],
                ["c", 0.45, -0.12, 0.81, -0.33, 1.08, -0.6],
                ["c", 0.57, -0.57, 0.87, -1.41, 0.99, -2.88],
                ["c", 0.06, -0.54, 0.06, -3, 0, -3.57],
                ["c", -0.21, -2.58, -0.84, -3.87, -2.16, -4.5],
                ["c", -0.48, -0.21, -1.17, -0.36, -1.77, -0.36],
                ["c", -0.69, 0, -1.29, 0.27, -1.5, 0.72],
                ["c", -0.06, 0.15, -0.06, 0.21, -0.06, 0.42],
                ["c", 0, 0.24, 0, 0.3, 0.06, 0.45],
                ["c", 0.12, 0.24, 0.24, 0.39, 0.63, 0.66],
                ["c", 0.42, 0.3, 0.57, 0.48, 0.69, 0.72],
                ["c", 0.06, 0.15, 0.06, 0.21, 0.06, 0.48],
                ["c", 0, 0.39, -0.03, 0.63, -0.21, 0.96],
                ["c", -0.3, 0.6, -0.87, 1.08, -1.5, 1.26],
                ["c", -0.27, 0.06, -0.87, 0.06, -1.14, 0],
                ["c", -0.78, -0.24, -1.44, -0.87, -1.65, -1.68],
                ["c", -0.12, -0.42, -0.09, -1.17, 0.09, -1.71],
                ["c", 0.51, -1.65, 1.98, -2.82, 3.81, -3.09],
                ["c", 0.84, -0.09, 2.46, 0.03, 3.51, 0.27],
                ["c", 2.22, 0.57, 3.69, 1.8, 4.44, 3.75],
                ["c", 0.36, 0.93, 0.57, 2.13, 0.57, 3.36],
                ["c", -0, 1.44, -0.48, 2.73, -1.38, 3.81],
                ["c", -1.26, 1.5, -3.27, 2.43, -5.28, 2.43],
                ["c", -0.48, -0, -0.51, -0, -0.75, -0.09],
                ["c", -0.15, -0.03, -0.48, -0.21, -0.78, -0.36],
                ["c", -0.69, -0.36, -0.87, -0.42, -1.26, -0.42],
                ["c", -0.27, -0, -0.3, -0, -0.51, 0.09],
                ["c", -0.57, 0.3, -0.81, 0.9, -0.81, 2.1],
                ["c", -0, 1.23, 0.24, 1.83, 0.81, 2.13],
                ["c", 0.21, 0.09, 0.24, 0.09, 0.51, 0.09],
                ["c", 0.39, -0, 0.57, -0.06, 1.26, -0.42],
                ["c", 0.3, -0.15, 0.63, -0.33, 0.78, -0.36],
                ["c", 0.24, -0.09, 0.27, -0.09, 0.75, -0.09],
                ["c", 2.01, -0, 4.02, 0.93, 5.28, 2.4],
                ["c", 0.9, 1.11, 1.38, 2.4, 1.38, 3.84],
                ["c", -0, 1.5, -0.3, 2.88, -0.84, 3.96],
                ["c", -0.78, 1.59, -2.19, 2.64, -4.17, 3.15],
                ["c", -1.05, 0.24, -2.67, 0.36, -3.51, 0.27],
                ["c", -1.83, -0.27, -3.3, -1.44, -3.81, -3.09],
                ["c", -0.18, -0.54, -0.21, -1.29, -0.09, -1.74],
                ["c", 0.15, -0.6, 0.63, -1.2, 1.23, -1.47],
                ["c", 0.36, -0.18, 0.57, -0.21, 0.99, -0.21],
                ["c", 0.42, 0, 0.63, 0.03, 1.02, 0.21],
                ["c", 0.42, 0.21, 0.84, 0.63, 1.05, 1.05],
                ["c", 0.18, 0.36, 0.21, 0.6, 0.21, 0.96],
                ["c", -0, 0.3, -0, 0.36, -0.06, 0.51],
                ["c", -0.12, 0.24, -0.27, 0.42, -0.69, 0.72],
                ["c", -0.57, 0.42, -0.69, 0.63, -0.69, 1.08],
                ["c", -0, 0.24, -0, 0.3, 0.06, 0.45],
                ["c", 0.12, 0.21, 0.3, 0.39, 0.57, 0.54],
                ["c", 0.42, 0.18, 0.87, 0.21, 1.53, 0.15],
                ["c", 1.08, -0.15, 1.8, -0.57, 2.34, -1.32],
                ["c", 0.54, -0.75, 0.84, -1.83, 0.99, -3.51],
                ["c", 0.06, -0.57, 0.06, -3.03, -0, -3.57],
                ["c", -0.12, -1.47, -0.42, -2.31, -0.99, -2.88],
                ["c", -0.27, -0.27, -0.63, -0.48, -1.08, -0.6],
                ["c", -0.27, -0.06, -0.39, -0.06, -0.84, -0.06],
                ["c", -0.45, 0, -0.57, 0, -0.78, 0.06],
                ["c", -1.14, 0.27, -2.01, 1.17, -2.46, 2.49],
                ["c", -0.21, 0.57, -0.3, 0.99, -0.33, 1.65],
                ["c", -0.03, 0.51, -0.06, 0.57, -0.24, 0.66],
                ["c", -0.12, 0.06, -0.27, 0.06, -0.39, 0],
                ["c", -0.21, -0.09, -0.21, -0.15, -0.24, -0.75],
                ["c", -0.09, -1.92, -0.78, -3.72, -2.01, -5.19],
                ["c", -0.18, -0.21, -0.36, -0.42, -0.39, -0.45],
                ["l", -0.09, -0.06],
                ["l", -0, 7.11],
                ["l", -0, 7.14],
                ["l", -0.06, 0.09],
                ["c", -0.09, 0.06, -0.09, 0.06, -0.54, 0.06],
                ["c", -0.48, 0, -0.48, 0, -0.57, -0.06],
                ["l", -0.06, -0.09],
                ["l", -0, -14.82],
                ["l", -0, -14.85],
                ["z"]
            ],
            w: 20.31,
            h: 29.97
        },
        "clefs.F": {
            d: [
                ["M", 6.3, -7.8],
                ["c", 0.36, -0.03, 1.65, 0, 2.13, 0.03],
                ["c", 3.6, 0.42, 6.03, 2.1, 6.93, 4.86],
                ["c", 0.27, 0.84, 0.36, 1.5, 0.36, 2.58],
                ["c", 0, 0.9, -0.03, 1.35, -0.18, 2.16],
                ["c", -0.78, 3.78, -3.54, 7.08, -8.37, 9.96],
                ["c", -1.74, 1.05, -3.87, 2.13, -6.18, 3.12],
                ["c", -0.39, 0.18, -0.75, 0.33, -0.81, 0.36],
                ["c", -0.06, 0.03, -0.15, 0.06, -0.18, 0.06],
                ["c", -0.15, 0, -0.33, -0.18, -0.33, -0.33],
                ["c", 0, -0.15, 0.06, -0.21, 0.51, -0.48],
                ["c", 3, -1.77, 5.13, -3.21, 6.84, -4.74],
                ["c", 0.51, -0.45, 1.59, -1.5, 1.95, -1.95],
                ["c", 1.89, -2.19, 2.88, -4.32, 3.15, -6.78],
                ["c", 0.06, -0.42, 0.06, -1.77, 0, -2.19],
                ["c", -0.24, -2.01, -0.93, -3.63, -2.04, -4.71],
                ["c", -0.63, -0.63, -1.29, -1.02, -2.07, -1.2],
                ["c", -1.62, -0.39, -3.36, 0.15, -4.56, 1.44],
                ["c", -0.54, 0.6, -1.05, 1.47, -1.32, 2.22],
                ["l", -0.09, 0.21],
                ["l", 0.24, -0.12],
                ["c", 0.39, -0.21, 0.63, -0.24, 1.11, -0.24],
                ["c", 0.3, 0, 0.45, 0, 0.66, 0.06],
                ["c", 1.92, 0.48, 2.85, 2.55, 1.95, 4.38],
                ["c", -0.45, 0.99, -1.41, 1.62, -2.46, 1.71],
                ["c", -1.47, 0.09, -2.91, -0.87, -3.39, -2.25],
                ["c", -0.18, -0.57, -0.21, -1.32, -0.03, -2.28],
                ["c", 0.39, -2.25, 1.83, -4.2, 3.81, -5.19],
                ["c", 0.69, -0.36, 1.59, -0.6, 2.37, -0.69],
                ["z"],
                ["m", 11.58, 2.52],
                ["c", 0.84, -0.21, 1.71, 0.3, 1.89, 1.14],
                ["c", 0.3, 1.17, -0.72, 2.19, -1.89, 1.89],
                ["c", -0.99, -0.21, -1.5, -1.32, -1.02, -2.25],
                ["c", 0.18, -0.39, 0.6, -0.69, 1.02, -0.78],
                ["z"],
                ["m", 0, 7.5],
                ["c", 0.84, -0.21, 1.71, 0.3, 1.89, 1.14],
                ["c", 0.21, 0.87, -0.3, 1.71, -1.14, 1.89],
                ["c", -0.87, 0.21, -1.71, -0.3, -1.89, -1.14],
                ["c", -0.21, -0.84, 0.3, -1.71, 1.14, -1.89],
                ["z"]
            ],
            w: 20.153,
            h: 23.142
        },
        "clefs.G": {
            d: [
                ["M", 9.69, -37.41],
                ["c", 0.09, -0.09, 0.24, -0.06, 0.36, 0],
                ["c", 0.12, 0.09, 0.57, 0.6, 0.96, 1.11],
                ["c", 1.77, 2.34, 3.21, 5.85, 3.57, 8.73],
                ["c", 0.21, 1.56, 0.03, 3.27, -0.45, 4.86],
                ["c", -0.69, 2.31, -1.92, 4.47, -4.23, 7.44],
                ["c", -0.3, 0.39, -0.57, 0.72, -0.6, 0.75],
                ["c", -0.03, 0.06, 0, 0.15, 0.18, 0.78],
                ["c", 0.54, 1.68, 1.38, 4.44, 1.68, 5.49],
                ["l", 0.09, 0.42],
                ["l", 0.39, -0],
                ["c", 1.47, 0.09, 2.76, 0.51, 3.96, 1.29],
                ["c", 1.83, 1.23, 3.06, 3.21, 3.39, 5.52],
                ["c", 0.09, 0.45, 0.12, 1.29, 0.06, 1.74],
                ["c", -0.09, 1.02, -0.33, 1.83, -0.75, 2.73],
                ["c", -0.84, 1.71, -2.28, 3.06, -4.02, 3.72],
                ["l", -0.33, 0.12],
                ["l", 0.03, 1.26],
                ["c", 0, 1.74, -0.06, 3.63, -0.21, 4.62],
                ["c", -0.45, 3.06, -2.19, 5.49, -4.47, 6.21],
                ["c", -0.57, 0.18, -0.9, 0.21, -1.59, 0.21],
                ["c", -0.69, -0, -1.02, -0.03, -1.65, -0.21],
                ["c", -1.14, -0.27, -2.13, -0.84, -2.94, -1.65],
                ["c", -0.99, -0.99, -1.56, -2.16, -1.71, -3.54],
                ["c", -0.09, -0.81, 0.06, -1.53, 0.45, -2.13],
                ["c", 0.63, -0.99, 1.83, -1.56, 3, -1.53],
                ["c", 1.5, 0.09, 2.64, 1.32, 2.73, 2.94],
                ["c", 0.06, 1.47, -0.93, 2.7, -2.37, 2.97],
                ["c", -0.45, 0.06, -0.84, 0.03, -1.29, -0.09],
                ["l", -0.21, -0.09],
                ["l", 0.09, 0.12],
                ["c", 0.39, 0.54, 0.78, 0.93, 1.32, 1.26],
                ["c", 1.35, 0.87, 3.06, 1.02, 4.35, 0.36],
                ["c", 1.44, -0.72, 2.52, -2.28, 2.97, -4.35],
                ["c", 0.15, -0.66, 0.24, -1.5, 0.3, -3.03],
                ["c", 0.03, -0.84, 0.03, -2.94, -0, -3],
                ["c", -0.03, -0, -0.18, -0, -0.36, 0.03],
                ["c", -0.66, 0.12, -0.99, 0.12, -1.83, 0.12],
                ["c", -1.05, -0, -1.71, -0.06, -2.61, -0.3],
                ["c", -4.02, -0.99, -7.11, -4.35, -7.8, -8.46],
                ["c", -0.12, -0.66, -0.12, -0.99, -0.12, -1.83],
                ["c", -0, -0.84, -0, -1.14, 0.15, -1.92],
                ["c", 0.36, -2.28, 1.41, -4.62, 3.3, -7.29],
                ["l", 2.79, -3.6],
                ["c", 0.54, -0.66, 0.96, -1.2, 0.96, -1.23],
                ["c", -0, -0.03, -0.09, -0.33, -0.18, -0.69],
                ["c", -0.96, -3.21, -1.41, -5.28, -1.59, -7.68],
                ["c", -0.12, -1.38, -0.15, -3.09, -0.06, -3.96],
                ["c", 0.33, -2.67, 1.38, -5.07, 3.12, -7.08],
                ["c", 0.36, -0.42, 0.99, -1.05, 1.17, -1.14],
                ["z"],
                ["m", 2.01, 4.71],
                ["c", -0.15, -0.3, -0.3, -0.54, -0.3, -0.54],
                ["c", -0.03, 0, -0.18, 0.09, -0.3, 0.21],
                ["c", -2.4, 1.74, -3.87, 4.2, -4.26, 7.11],
                ["c", -0.06, 0.54, -0.06, 1.41, -0.03, 1.89],
                ["c", 0.09, 1.29, 0.48, 3.12, 1.08, 5.22],
                ["c", 0.15, 0.42, 0.24, 0.78, 0.24, 0.81],
                ["c", 0, 0.03, 0.84, -1.11, 1.23, -1.68],
                ["c", 1.89, -2.73, 2.88, -5.07, 3.15, -7.53],
                ["c", 0.09, -0.57, 0.12, -1.74, 0.06, -2.37],
                ["c", -0.09, -1.23, -0.27, -1.92, -0.87, -3.12],
                ["z"],
                ["m", -2.94, 20.7],
                ["c", -0.21, -0.72, -0.39, -1.32, -0.42, -1.32],
                ["c", 0, 0, -1.2, 1.47, -1.86, 2.37],
                ["c", -2.79, 3.63, -4.02, 6.3, -4.35, 9.3],
                ["c", -0.03, 0.21, -0.03, 0.69, -0.03, 1.08],
                ["c", 0, 0.69, 0, 0.75, 0.06, 1.11],
                ["c", 0.12, 0.54, 0.27, 0.99, 0.51, 1.47],
                ["c", 0.69, 1.38, 1.83, 2.55, 3.42, 3.42],
                ["c", 0.96, 0.54, 2.07, 0.9, 3.21, 1.08],
                ["c", 0.78, 0.12, 2.04, 0.12, 2.94, -0.03],
                ["c", 0.51, -0.06, 0.45, -0.03, 0.42, -0.3],
                ["c", -0.24, -3.33, -0.72, -6.33, -1.62, -10.08],
                ["c", -0.09, -0.39, -0.18, -0.75, -0.18, -0.78],
                ["c", -0.03, -0.03, -0.42, -0, -0.81, 0.09],
                ["c", -0.9, 0.18, -1.65, 0.57, -2.22, 1.14],
                ["c", -0.72, 0.72, -1.08, 1.65, -1.05, 2.64],
                ["c", 0.06, 0.96, 0.48, 1.83, 1.23, 2.58],
                ["c", 0.36, 0.36, 0.72, 0.63, 1.17, 0.9],
                ["c", 0.33, 0.18, 0.36, 0.21, 0.42, 0.33],
                ["c", 0.18, 0.42, -0.18, 0.9, -0.6, 0.87],
                ["c", -0.18, -0.03, -0.84, -0.36, -1.26, -0.63],
                ["c", -0.78, -0.51, -1.38, -1.11, -1.86, -1.83],
                ["c", -1.77, -2.7, -0.99, -6.42, 1.71, -8.19],
                ["c", 0.3, -0.21, 0.81, -0.48, 1.17, -0.63],
                ["c", 0.3, -0.09, 1.02, -0.3, 1.14, -0.3],
                ["c", 0.06, -0, 0.09, -0, 0.09, -0.03],
                ["c", 0.03, -0.03, -0.51, -1.92, -1.23, -4.26],
                ["z"],
                ["m", 3.78, 7.41],
                ["c", -0.18, -0.03, -0.36, -0.06, -0.39, -0.06],
                ["c", -0.03, 0, 0, 0.21, 0.18, 1.02],
                ["c", 0.75, 3.18, 1.26, 6.3, 1.5, 9.09],
                ["c", 0.06, 0.72, 0, 0.69, 0.51, 0.42],
                ["c", 0.78, -0.36, 1.44, -0.96, 1.98, -1.77],
                ["c", 1.08, -1.62, 1.2, -3.69, 0.3, -5.55],
                ["c", -0.81, -1.62, -2.31, -2.79, -4.08, -3.15],
                ["z"]
            ],
            w: 19.051,
            h: 57.057
        },
        "clefs.perc": {
            d: [
                ["M", 5.07, -7.44],
                ["l", 0.09, -0.06],
                ["l", 1.53, 0],
                ["l", 1.53, 0],
                ["l", 0.09, 0.06],
                ["l", 0.06, 0.09],
                ["l", 0, 7.35],
                ["l", 0, 7.32],
                ["l", -0.06, 0.09],
                ["l", -0.09, 0.06],
                ["l", -1.53, -0],
                ["l", -1.53, -0],
                ["l", -0.09, -0.06],
                ["l", -0.06, -0.09],
                ["l", 0, -7.32],
                ["l", 0, -7.35],
                ["z"],
                ["m", 6.63, 0],
                ["l", 0.09, -0.06],
                ["l", 1.53, 0],
                ["l", 1.53, 0],
                ["l", 0.09, 0.06],
                ["l", 0.06, 0.09],
                ["l", 0, 7.35],
                ["l", 0, 7.32],
                ["l", -0.06, 0.09],
                ["l", -0.09, 0.06],
                ["l", -1.53, -0],
                ["l", -1.53, -0],
                ["l", -0.09, -0.06],
                ["l", -0.06, -0.09],
                ["l", 0, -7.32],
                ["l", 0, -7.35],
                ["z"]
            ],
            w: 9.99,
            h: 14.97
        },
        "timesig.common": {
            d: [
                ["M", 6.66, -7.826],
                ["c", 0.72, -0.06, 1.41, -0.03, 1.98, 0.09],
                ["c", 1.2, 0.27, 2.34, 0.96, 3.09, 1.92],
                ["c", 0.63, 0.81, 1.08, 1.86, 1.14, 2.73],
                ["c", 0.06, 1.02, -0.51, 1.92, -1.44, 2.22],
                ["c", -0.24, 0.09, -0.3, 0.09, -0.63, 0.09],
                ["c", -0.33, -0, -0.42, -0, -0.63, -0.06],
                ["c", -0.66, -0.24, -1.14, -0.63, -1.41, -1.2],
                ["c", -0.15, -0.3, -0.21, -0.51, -0.24, -0.9],
                ["c", -0.06, -1.08, 0.57, -2.04, 1.56, -2.37],
                ["c", 0.18, -0.06, 0.27, -0.06, 0.63, -0.06],
                ["l", 0.45, 0],
                ["c", 0.06, 0.03, 0.09, 0.03, 0.09, 0],
                ["c", 0, 0, -0.09, -0.12, -0.24, -0.27],
                ["c", -1.02, -1.11, -2.55, -1.68, -4.08, -1.5],
                ["c", -1.29, 0.15, -2.04, 0.69, -2.4, 1.74],
                ["c", -0.36, 0.93, -0.42, 1.89, -0.42, 5.37],
                ["c", 0, 2.97, 0.06, 3.96, 0.24, 4.77],
                ["c", 0.24, 1.08, 0.63, 1.68, 1.41, 2.07],
                ["c", 0.81, 0.39, 2.16, 0.45, 3.18, 0.09],
                ["c", 1.29, -0.45, 2.37, -1.53, 3.03, -2.97],
                ["c", 0.15, -0.33, 0.33, -0.87, 0.39, -1.17],
                ["c", 0.09, -0.24, 0.15, -0.36, 0.3, -0.39],
                ["c", 0.21, -0.03, 0.42, 0.15, 0.39, 0.36],
                ["c", -0.06, 0.39, -0.42, 1.38, -0.69, 1.89],
                ["c", -0.96, 1.8, -2.49, 2.94, -4.23, 3.18],
                ["c", -0.99, 0.12, -2.58, -0.06, -3.63, -0.45],
                ["c", -0.96, -0.36, -1.71, -0.84, -2.4, -1.5],
                ["c", -1.11, -1.11, -1.8, -2.61, -2.04, -4.56],
                ["c", -0.06, -0.6, -0.06, -2.01, 0, -2.61],
                ["c", 0.24, -1.95, 0.9, -3.45, 2.01, -4.56],
                ["c", 0.69, -0.66, 1.44, -1.11, 2.37, -1.47],
                ["c", 0.63, -0.24, 1.47, -0.42, 2.22, -0.48],
                ["z"]
            ],
            w: 13.038,
            h: 15.697
        },
        "timesig.cut": {
            d: [
                ["M", 6.24, -10.44],
                ["c", 0.09, -0.06, 0.09, -0.06, 0.48, -0.06],
                ["c", 0.36, 0, 0.36, 0, 0.45, 0.06],
                ["l", 0.06, 0.09],
                ["l", 0, 1.23],
                ["l", 0, 1.26],
                ["l", 0.27, 0],
                ["c", 1.26, 0, 2.49, 0.45, 3.48, 1.29],
                ["c", 1.05, 0.87, 1.8, 2.28, 1.89, 3.48],
                ["c", 0.06, 1.02, -0.51, 1.92, -1.44, 2.22],
                ["c", -0.24, 0.09, -0.3, 0.09, -0.63, 0.09],
                ["c", -0.33, -0, -0.42, -0, -0.63, -0.06],
                ["c", -0.66, -0.24, -1.14, -0.63, -1.41, -1.2],
                ["c", -0.15, -0.3, -0.21, -0.51, -0.24, -0.9],
                ["c", -0.06, -1.08, 0.57, -2.04, 1.56, -2.37],
                ["c", 0.18, -0.06, 0.27, -0.06, 0.63, -0.06],
                ["l", 0.45, -0],
                ["c", 0.06, 0.03, 0.09, 0.03, 0.09, -0],
                ["c", 0, -0.03, -0.45, -0.51, -0.66, -0.69],
                ["c", -0.87, -0.69, -1.83, -1.05, -2.94, -1.11],
                ["l", -0.42, 0],
                ["l", 0, 7.17],
                ["l", 0, 7.14],
                ["l", 0.42, 0],
                ["c", 0.69, -0.03, 1.23, -0.18, 1.86, -0.51],
                ["c", 1.05, -0.51, 1.89, -1.47, 2.46, -2.7],
                ["c", 0.15, -0.33, 0.33, -0.87, 0.39, -1.17],
                ["c", 0.09, -0.24, 0.15, -0.36, 0.3, -0.39],
                ["c", 0.21, -0.03, 0.42, 0.15, 0.39, 0.36],
                ["c", -0.03, 0.24, -0.21, 0.78, -0.39, 1.2],
                ["c", -0.96, 2.37, -2.94, 3.9, -5.13, 3.9],
                ["l", -0.3, 0],
                ["l", 0, 1.26],
                ["l", 0, 1.23],
                ["l", -0.06, 0.09],
                ["c", -0.09, 0.06, -0.09, 0.06, -0.45, 0.06],
                ["c", -0.39, 0, -0.39, 0, -0.48, -0.06],
                ["l", -0.06, -0.09],
                ["l", 0, -1.29],
                ["l", 0, -1.29],
                ["l", -0.21, -0.03],
                ["c", -1.23, -0.21, -2.31, -0.63, -3.21, -1.29],
                ["c", -0.15, -0.09, -0.45, -0.36, -0.66, -0.57],
                ["c", -1.11, -1.11, -1.8, -2.61, -2.04, -4.56],
                ["c", -0.06, -0.6, -0.06, -2.01, 0, -2.61],
                ["c", 0.24, -1.95, 0.93, -3.45, 2.04, -4.59],
                ["c", 0.42, -0.39, 0.78, -0.66, 1.26, -0.93],
                ["c", 0.75, -0.45, 1.65, -0.75, 2.61, -0.9],
                ["l", 0.21, -0.03],
                ["l", 0, -1.29],
                ["l", 0, -1.29],
                ["z"],
                ["m", -0.06, 10.44],
                ["c", 0, -5.58, 0, -6.99, -0.03, -6.99],
                ["c", -0.15, 0, -0.63, 0.27, -0.87, 0.45],
                ["c", -0.45, 0.36, -0.75, 0.93, -0.93, 1.77],
                ["c", -0.18, 0.81, -0.24, 1.8, -0.24, 4.74],
                ["c", 0, 2.97, 0.06, 3.96, 0.24, 4.77],
                ["c", 0.24, 1.08, 0.66, 1.68, 1.41, 2.07],
                ["c", 0.12, 0.06, 0.3, 0.12, 0.33, 0.15],
                ["l", 0.09, 0],
                ["l", 0, -6.96],
                ["z"]
            ],
            w: 13.038,
            h: 20.97
        },
        "0": {
            d: [
                ["M", 4.83, -14.97],
                ["c", 0.33, -0.03, 1.11, 0, 1.47, 0.06],
                ["c", 1.68, 0.36, 2.97, 1.59, 3.78, 3.6],
                ["c", 1.2, 2.97, 0.81, 6.96, -0.9, 9.27],
                ["c", -0.78, 1.08, -1.71, 1.71, -2.91, 1.95],
                ["c", -0.45, 0.09, -1.32, 0.09, -1.77, 0],
                ["c", -0.81, -0.18, -1.47, -0.51, -2.07, -1.02],
                ["c", -2.34, -2.07, -3.15, -6.72, -1.74, -10.2],
                ["c", 0.87, -2.16, 2.28, -3.42, 4.14, -3.66],
                ["z"],
                ["m", 1.11, 0.87],
                ["c", -0.21, -0.06, -0.69, -0.09, -0.87, -0.06],
                ["c", -0.54, 0.12, -0.87, 0.42, -1.17, 0.99],
                ["c", -0.36, 0.66, -0.51, 1.56, -0.6, 3],
                ["c", -0.03, 0.75, -0.03, 4.59, -0, 5.31],
                ["c", 0.09, 1.5, 0.27, 2.4, 0.6, 3.06],
                ["c", 0.24, 0.48, 0.57, 0.78, 0.96, 0.9],
                ["c", 0.27, 0.09, 0.78, 0.09, 1.05, -0],
                ["c", 0.39, -0.12, 0.72, -0.42, 0.96, -0.9],
                ["c", 0.33, -0.66, 0.51, -1.56, 0.6, -3.06],
                ["c", 0.03, -0.72, 0.03, -4.56, -0, -5.31],
                ["c", -0.09, -1.47, -0.27, -2.37, -0.6, -3.03],
                ["c", -0.24, -0.48, -0.54, -0.78, -0.93, -0.9],
                ["z"]
            ],
            w: 10.78,
            h: 14.959
        },
        "1": {
            d: [
                ["M", 3.3, -15.06],
                ["c", 0.06, -0.06, 0.21, -0.03, 0.66, 0.15],
                ["c", 0.81, 0.39, 1.08, 0.39, 1.83, 0.03],
                ["c", 0.21, -0.09, 0.39, -0.15, 0.42, -0.15],
                ["c", 0.12, 0, 0.21, 0.09, 0.27, 0.21],
                ["c", 0.06, 0.12, 0.06, 0.33, 0.06, 5.94],
                ["c", 0, 3.93, 0, 5.85, 0.03, 6.03],
                ["c", 0.06, 0.36, 0.15, 0.69, 0.27, 0.96],
                ["c", 0.36, 0.75, 0.93, 1.17, 1.68, 1.26],
                ["c", 0.3, 0.03, 0.39, 0.09, 0.39, 0.3],
                ["c", 0, 0.15, -0.03, 0.18, -0.09, 0.24],
                ["c", -0.06, 0.06, -0.09, 0.06, -0.48, 0.06],
                ["c", -0.42, -0, -0.69, -0.03, -2.1, -0.24],
                ["c", -0.9, -0.15, -1.77, -0.15, -2.67, -0],
                ["c", -1.41, 0.21, -1.68, 0.24, -2.1, 0.24],
                ["c", -0.39, -0, -0.42, -0, -0.48, -0.06],
                ["c", -0.06, -0.06, -0.06, -0.09, -0.06, -0.24],
                ["c", 0, -0.21, 0.06, -0.27, 0.36, -0.3],
                ["c", 0.75, -0.09, 1.32, -0.51, 1.68, -1.26],
                ["c", 0.12, -0.27, 0.21, -0.6, 0.27, -0.96],
                ["c", 0.03, -0.18, 0.03, -1.59, 0.03, -4.29],
                ["c", 0, -3.87, 0, -4.05, -0.06, -4.14],
                ["c", -0.09, -0.15, -0.18, -0.24, -0.39, -0.24],
                ["c", -0.12, -0, -0.15, 0.03, -0.21, 0.06],
                ["c", -0.03, 0.06, -0.45, 0.99, -0.96, 2.13],
                ["c", -0.48, 1.14, -0.9, 2.1, -0.93, 2.16],
                ["c", -0.06, 0.15, -0.21, 0.24, -0.33, 0.24],
                ["c", -0.24, 0, -0.42, -0.18, -0.42, -0.39],
                ["c", 0, -0.06, 3.27, -7.62, 3.33, -7.74],
                ["z"]
            ],
            w: 8.94,
            h: 15.058
        },
        "2": {
            d: [
                ["M", 4.23, -14.97],
                ["c", 0.57, -0.06, 1.68, 0, 2.34, 0.18],
                ["c", 0.69, 0.18, 1.5, 0.54, 2.01, 0.9],
                ["c", 1.35, 0.96, 1.95, 2.25, 1.77, 3.81],
                ["c", -0.15, 1.35, -0.66, 2.34, -1.68, 3.15],
                ["c", -0.6, 0.48, -1.44, 0.93, -3.12, 1.65],
                ["c", -1.32, 0.57, -1.8, 0.81, -2.37, 1.14],
                ["c", -0.57, 0.33, -0.57, 0.33, -0.24, 0.27],
                ["c", 0.39, -0.09, 1.26, -0.09, 1.68, 0],
                ["c", 0.72, 0.15, 1.41, 0.45, 2.1, 0.9],
                ["c", 0.99, 0.63, 1.86, 0.87, 2.55, 0.75],
                ["c", 0.24, -0.06, 0.42, -0.15, 0.57, -0.3],
                ["c", 0.12, -0.09, 0.3, -0.42, 0.3, -0.51],
                ["c", 0, -0.09, 0.12, -0.21, 0.24, -0.24],
                ["c", 0.18, -0.03, 0.39, 0.12, 0.39, 0.3],
                ["c", 0, 0.12, -0.15, 0.57, -0.3, 0.87],
                ["c", -0.54, 1.02, -1.56, 1.74, -2.79, 2.01],
                ["c", -0.42, 0.09, -1.23, 0.09, -1.62, 0.03],
                ["c", -0.81, -0.18, -1.32, -0.45, -2.01, -1.11],
                ["c", -0.45, -0.45, -0.63, -0.57, -0.96, -0.69],
                ["c", -0.84, -0.27, -1.89, 0.12, -2.25, 0.9],
                ["c", -0.12, 0.21, -0.21, 0.54, -0.21, 0.72],
                ["c", 0, 0.12, -0.12, 0.21, -0.27, 0.24],
                ["c", -0.15, 0, -0.27, -0.03, -0.33, -0.15],
                ["c", -0.09, -0.21, 0.09, -1.08, 0.33, -1.71],
                ["c", 0.24, -0.66, 0.66, -1.26, 1.29, -1.89],
                ["c", 0.45, -0.45, 0.9, -0.81, 1.92, -1.56],
                ["c", 1.29, -0.93, 1.89, -1.44, 2.34, -1.98],
                ["c", 0.87, -1.05, 1.26, -2.19, 1.2, -3.63],
                ["c", -0.06, -1.29, -0.39, -2.31, -0.96, -2.91],
                ["c", -0.36, -0.33, -0.72, -0.51, -1.17, -0.54],
                ["c", -0.84, -0.03, -1.53, 0.42, -1.59, 1.05],
                ["c", -0.03, 0.33, 0.12, 0.6, 0.57, 1.14],
                ["c", 0.45, 0.54, 0.54, 0.87, 0.42, 1.41],
                ["c", -0.15, 0.63, -0.54, 1.11, -1.08, 1.38],
                ["c", -0.63, 0.33, -1.2, 0.33, -1.83, 0],
                ["c", -0.24, -0.12, -0.33, -0.18, -0.54, -0.39],
                ["c", -0.18, -0.18, -0.27, -0.3, -0.36, -0.51],
                ["c", -0.24, -0.45, -0.27, -0.84, -0.21, -1.38],
                ["c", 0.12, -0.75, 0.45, -1.41, 1.02, -1.98],
                ["c", 0.72, -0.72, 1.74, -1.17, 2.85, -1.32],
                ["z"]
            ],
            w: 10.764,
            h: 14.993
        },
        "3": {
            d: [
                ["M", 3.78, -14.97],
                ["c", 0.3, -0.03, 1.41, 0, 1.83, 0.06],
                ["c", 2.22, 0.3, 3.51, 1.32, 3.72, 2.91],
                ["c", 0.03, 0.33, 0.03, 1.26, -0.03, 1.65],
                ["c", -0.12, 0.84, -0.48, 1.47, -1.05, 1.77],
                ["c", -0.27, 0.15, -0.36, 0.24, -0.45, 0.39],
                ["c", -0.09, 0.21, -0.09, 0.36, 0, 0.57],
                ["c", 0.09, 0.15, 0.18, 0.24, 0.51, 0.39],
                ["c", 0.75, 0.42, 1.23, 1.14, 1.41, 2.13],
                ["c", 0.06, 0.42, 0.06, 1.35, 0, 1.71],
                ["c", -0.18, 0.81, -0.48, 1.38, -1.02, 1.95],
                ["c", -0.75, 0.72, -1.8, 1.2, -3.18, 1.38],
                ["c", -0.42, 0.06, -1.56, 0.06, -1.95, 0],
                ["c", -1.89, -0.33, -3.18, -1.29, -3.51, -2.64],
                ["c", -0.03, -0.12, -0.03, -0.33, -0.03, -0.6],
                ["c", 0, -0.36, 0, -0.42, 0.06, -0.63],
                ["c", 0.12, -0.3, 0.27, -0.51, 0.51, -0.75],
                ["c", 0.24, -0.24, 0.45, -0.39, 0.75, -0.51],
                ["c", 0.21, -0.06, 0.27, -0.06, 0.6, -0.06],
                ["c", 0.33, 0, 0.39, 0, 0.6, 0.06],
                ["c", 0.3, 0.12, 0.51, 0.27, 0.75, 0.51],
                ["c", 0.36, 0.33, 0.57, 0.75, 0.6, 1.2],
                ["c", 0, 0.21, 0, 0.27, -0.06, 0.42],
                ["c", -0.09, 0.18, -0.12, 0.24, -0.54, 0.54],
                ["c", -0.51, 0.36, -0.63, 0.54, -0.6, 0.87],
                ["c", 0.06, 0.54, 0.54, 0.9, 1.38, 0.99],
                ["c", 0.36, 0.06, 0.72, 0.03, 0.96, -0.06],
                ["c", 0.81, -0.27, 1.29, -1.23, 1.44, -2.79],
                ["c", 0.03, -0.45, 0.03, -1.95, -0.03, -2.37],
                ["c", -0.09, -0.75, -0.33, -1.23, -0.75, -1.44],
                ["c", -0.33, -0.18, -0.45, -0.18, -1.98, -0.18],
                ["c", -1.35, 0, -1.41, 0, -1.5, -0.06],
                ["c", -0.18, -0.12, -0.24, -0.39, -0.12, -0.6],
                ["c", 0.12, -0.15, 0.15, -0.15, 1.68, -0.15],
                ["c", 1.5, 0, 1.62, 0, 1.89, -0.15],
                ["c", 0.18, -0.09, 0.42, -0.36, 0.54, -0.57],
                ["c", 0.18, -0.42, 0.27, -0.9, 0.3, -1.95],
                ["c", 0.03, -1.2, -0.06, -1.8, -0.36, -2.37],
                ["c", -0.24, -0.48, -0.63, -0.81, -1.14, -0.96],
                ["c", -0.3, -0.06, -1.08, -0.06, -1.38, 0.03],
                ["c", -0.6, 0.15, -0.9, 0.42, -0.96, 0.84],
                ["c", -0.03, 0.3, 0.06, 0.45, 0.63, 0.84],
                ["c", 0.33, 0.24, 0.42, 0.39, 0.45, 0.63],
                ["c", 0.03, 0.72, -0.57, 1.5, -1.32, 1.65],
                ["c", -1.05, 0.27, -2.1, -0.57, -2.1, -1.65],
                ["c", 0, -0.45, 0.15, -0.96, 0.39, -1.38],
                ["c", 0.12, -0.21, 0.54, -0.63, 0.81, -0.81],
                ["c", 0.57, -0.42, 1.38, -0.69, 2.25, -0.81],
                ["z"]
            ],
            w: 9.735,
            h: 14.967
        },
        "4": {
            d: [
                ["M", 8.64, -14.94],
                ["c", 0.27, -0.09, 0.42, -0.12, 0.54, -0.03],
                ["c", 0.09, 0.06, 0.15, 0.21, 0.15, 0.3],
                ["c", -0.03, 0.06, -1.92, 2.31, -4.23, 5.04],
                ["c", -2.31, 2.73, -4.23, 4.98, -4.26, 5.01],
                ["c", -0.03, 0.06, 0.12, 0.06, 2.55, 0.06],
                ["l", 2.61, 0],
                ["l", 0, -2.37],
                ["c", 0, -2.19, 0.03, -2.37, 0.06, -2.46],
                ["c", 0.03, -0.06, 0.21, -0.18, 0.57, -0.42],
                ["c", 1.08, -0.72, 1.38, -1.08, 1.86, -2.16],
                ["c", 0.12, -0.3, 0.24, -0.54, 0.27, -0.57],
                ["c", 0.12, -0.12, 0.39, -0.06, 0.45, 0.12],
                ["c", 0.06, 0.09, 0.06, 0.57, 0.06, 3.96],
                ["l", 0, 3.9],
                ["l", 1.08, 0],
                ["c", 1.05, 0, 1.11, 0, 1.2, 0.06],
                ["c", 0.24, 0.15, 0.24, 0.54, 0, 0.69],
                ["c", -0.09, 0.06, -0.15, 0.06, -1.2, 0.06],
                ["l", -1.08, 0],
                ["l", 0, 0.33],
                ["c", 0, 0.57, 0.09, 1.11, 0.3, 1.53],
                ["c", 0.36, 0.75, 0.93, 1.17, 1.68, 1.26],
                ["c", 0.3, 0.03, 0.39, 0.09, 0.39, 0.3],
                ["c", 0, 0.15, -0.03, 0.18, -0.09, 0.24],
                ["c", -0.06, 0.06, -0.09, 0.06, -0.48, 0.06],
                ["c", -0.42, 0, -0.69, -0.03, -2.1, -0.24],
                ["c", -0.9, -0.15, -1.77, -0.15, -2.67, 0],
                ["c", -1.41, 0.21, -1.68, 0.24, -2.1, 0.24],
                ["c", -0.39, 0, -0.42, 0, -0.48, -0.06],
                ["c", -0.06, -0.06, -0.06, -0.09, -0.06, -0.24],
                ["c", 0, -0.21, 0.06, -0.27, 0.36, -0.3],
                ["c", 0.75, -0.09, 1.32, -0.51, 1.68, -1.26],
                ["c", 0.21, -0.42, 0.3, -0.96, 0.3, -1.53],
                ["l", 0, -0.33],
                ["l", -2.7, 0],
                ["c", -2.91, 0, -2.85, 0, -3.09, -0.15],
                ["c", -0.18, -0.12, -0.3, -0.39, -0.27, -0.54],
                ["c", 0.03, -0.06, 0.18, -0.24, 0.33, -0.45],
                ["c", 0.75, -0.9, 1.59, -2.07, 2.13, -3.03],
                ["c", 0.33, -0.54, 0.84, -1.62, 1.05, -2.16],
                ["c", 0.57, -1.41, 0.84, -2.64, 0.9, -4.05],
                ["c", 0.03, -0.63, 0.06, -0.72, 0.24, -0.81],
                ["l", 0.12, -0.06],
                ["l", 0.45, 0.12],
                ["c", 0.66, 0.18, 1.02, 0.24, 1.47, 0.27],
                ["c", 0.6, 0.03, 1.23, -0.09, 2.01, -0.33],
                ["z"]
            ],
            w: 11.795,
            h: 14.994
        },
        "5": {
            d: [
                ["M", 1.02, -14.94],
                ["c", 0.12, -0.09, 0.03, -0.09, 1.08, 0.06],
                ["c", 2.49, 0.36, 4.35, 0.36, 6.96, -0.06],
                ["c", 0.57, -0.09, 0.66, -0.06, 0.81, 0.06],
                ["c", 0.15, 0.18, 0.12, 0.24, -0.15, 0.51],
                ["c", -1.29, 1.26, -3.24, 2.04, -5.58, 2.31],
                ["c", -0.6, 0.09, -1.2, 0.12, -1.71, 0.12],
                ["c", -0.39, 0, -0.45, 0, -0.57, 0.06],
                ["c", -0.09, 0.06, -0.15, 0.12, -0.21, 0.21],
                ["l", -0.06, 0.12],
                ["l", 0, 1.65],
                ["l", 0, 1.65],
                ["l", 0.21, -0.21],
                ["c", 0.66, -0.57, 1.41, -0.96, 2.19, -1.14],
                ["c", 0.33, -0.06, 1.41, -0.06, 1.95, 0],
                ["c", 2.61, 0.36, 4.02, 1.74, 4.26, 4.14],
                ["c", 0.03, 0.45, 0.03, 1.08, -0.03, 1.44],
                ["c", -0.18, 1.02, -0.78, 2.01, -1.59, 2.7],
                ["c", -0.72, 0.57, -1.62, 1.02, -2.49, 1.2],
                ["c", -1.38, 0.27, -3.03, 0.06, -4.2, -0.54],
                ["c", -1.08, -0.54, -1.71, -1.32, -1.86, -2.28],
                ["c", -0.09, -0.69, 0.09, -1.29, 0.57, -1.74],
                ["c", 0.24, -0.24, 0.45, -0.39, 0.75, -0.51],
                ["c", 0.21, -0.06, 0.27, -0.06, 0.6, -0.06],
                ["c", 0.33, 0, 0.39, 0, 0.6, 0.06],
                ["c", 0.3, 0.12, 0.51, 0.27, 0.75, 0.51],
                ["c", 0.36, 0.33, 0.57, 0.75, 0.6, 1.2],
                ["c", 0, 0.21, 0, 0.27, -0.06, 0.42],
                ["c", -0.09, 0.18, -0.12, 0.24, -0.54, 0.54],
                ["c", -0.18, 0.12, -0.36, 0.3, -0.42, 0.33],
                ["c", -0.36, 0.42, -0.18, 0.99, 0.36, 1.26],
                ["c", 0.51, 0.27, 1.47, 0.36, 2.01, 0.27],
                ["c", 0.93, -0.21, 1.47, -1.17, 1.65, -2.91],
                ["c", 0.06, -0.45, 0.06, -1.89, 0, -2.31],
                ["c", -0.15, -1.2, -0.51, -2.1, -1.05, -2.55],
                ["c", -0.21, -0.18, -0.54, -0.36, -0.81, -0.39],
                ["c", -0.3, -0.06, -0.84, -0.03, -1.26, 0.06],
                ["c", -0.93, 0.18, -1.65, 0.6, -2.16, 1.2],
                ["c", -0.15, 0.21, -0.27, 0.3, -0.39, 0.3],
                ["c", -0.15, 0, -0.3, -0.09, -0.36, -0.18],
                ["c", -0.06, -0.09, -0.06, -0.15, -0.06, -3.66],
                ["c", 0, -3.39, 0, -3.57, 0.06, -3.66],
                ["c", 0.03, -0.06, 0.09, -0.15, 0.15, -0.18],
                ["z"]
            ],
            w: 10.212,
            h: 14.997
        },
        "6": {
            d: [
                ["M", 4.98, -14.97],
                ["c", 0.36, -0.03, 1.2, 0, 1.59, 0.06],
                ["c", 0.9, 0.15, 1.68, 0.51, 2.25, 1.05],
                ["c", 0.57, 0.51, 0.87, 1.23, 0.84, 1.98],
                ["c", -0.03, 0.51, -0.21, 0.9, -0.6, 1.26],
                ["c", -0.24, 0.24, -0.45, 0.39, -0.75, 0.51],
                ["c", -0.21, 0.06, -0.27, 0.06, -0.6, 0.06],
                ["c", -0.33, 0, -0.39, 0, -0.6, -0.06],
                ["c", -0.3, -0.12, -0.51, -0.27, -0.75, -0.51],
                ["c", -0.39, -0.36, -0.57, -0.78, -0.57, -1.26],
                ["c", 0, -0.27, 0, -0.3, 0.09, -0.42],
                ["c", 0.03, -0.09, 0.18, -0.21, 0.3, -0.3],
                ["c", 0.12, -0.09, 0.3, -0.21, 0.39, -0.27],
                ["c", 0.09, -0.06, 0.21, -0.18, 0.27, -0.24],
                ["c", 0.06, -0.12, 0.09, -0.15, 0.09, -0.33],
                ["c", 0, -0.18, -0.03, -0.24, -0.09, -0.36],
                ["c", -0.24, -0.39, -0.75, -0.6, -1.38, -0.57],
                ["c", -0.54, 0.03, -0.9, 0.18, -1.23, 0.48],
                ["c", -0.81, 0.72, -1.08, 2.16, -0.96, 5.37],
                ["l", 0, 0.63],
                ["l", 0.3, -0.12],
                ["c", 0.78, -0.27, 1.29, -0.33, 2.1, -0.27],
                ["c", 1.47, 0.12, 2.49, 0.54, 3.27, 1.29],
                ["c", 0.48, 0.51, 0.81, 1.11, 0.96, 1.89],
                ["c", 0.06, 0.27, 0.06, 0.42, 0.06, 0.93],
                ["c", 0, 0.54, 0, 0.69, -0.06, 0.96],
                ["c", -0.15, 0.78, -0.48, 1.38, -0.96, 1.89],
                ["c", -0.54, 0.51, -1.17, 0.87, -1.98, 1.08],
                ["c", -1.14, 0.3, -2.4, 0.33, -3.24, 0.03],
                ["c", -1.5, -0.48, -2.64, -1.89, -3.27, -4.02],
                ["c", -0.36, -1.23, -0.51, -2.82, -0.42, -4.08],
                ["c", 0.3, -3.66, 2.28, -6.3, 4.95, -6.66],
                ["z"],
                ["m", 0.66, 7.41],
                ["c", -0.27, -0.09, -0.81, -0.12, -1.08, -0.06],
                ["c", -0.72, 0.18, -1.08, 0.69, -1.23, 1.71],
                ["c", -0.06, 0.54, -0.06, 3, 0, 3.54],
                ["c", 0.18, 1.26, 0.72, 1.77, 1.8, 1.74],
                ["c", 0.39, -0.03, 0.63, -0.09, 0.9, -0.27],
                ["c", 0.66, -0.42, 0.9, -1.32, 0.9, -3.24],
                ["c", 0, -2.22, -0.36, -3.12, -1.29, -3.42],
                ["z"]
            ],
            w: 9.956,
            h: 14.982
        },
        "7": {
            d: [
                ["M", 0.21, -14.97],
                ["c", 0.21, -0.06, 0.45, 0, 0.54, 0.15],
                ["c", 0.06, 0.09, 0.06, 0.15, 0.06, 0.39],
                ["c", 0, 0.24, 0, 0.33, 0.06, 0.42],
                ["c", 0.06, 0.12, 0.21, 0.24, 0.27, 0.24],
                ["c", 0.03, 0, 0.12, -0.12, 0.24, -0.21],
                ["c", 0.96, -1.2, 2.58, -1.35, 3.99, -0.42],
                ["c", 0.15, 0.12, 0.42, 0.3, 0.54, 0.45],
                ["c", 0.48, 0.39, 0.81, 0.57, 1.29, 0.6],
                ["c", 0.69, 0.03, 1.5, -0.3, 2.13, -0.87],
                ["c", 0.09, -0.09, 0.27, -0.3, 0.39, -0.45],
                ["c", 0.12, -0.15, 0.24, -0.27, 0.3, -0.3],
                ["c", 0.18, -0.06, 0.39, 0.03, 0.51, 0.21],
                ["c", 0.06, 0.18, 0.06, 0.24, -0.27, 0.72],
                ["c", -0.18, 0.24, -0.54, 0.78, -0.78, 1.17],
                ["c", -2.37, 3.54, -3.54, 6.27, -3.87, 9],
                ["c", -0.03, 0.33, -0.03, 0.66, -0.03, 1.26],
                ["c", 0, 0.9, 0, 1.08, 0.15, 1.89],
                ["c", 0.06, 0.45, 0.06, 0.48, 0.03, 0.6],
                ["c", -0.06, 0.09, -0.21, 0.21, -0.3, 0.21],
                ["c", -0.03, 0, -0.27, -0.06, -0.54, -0.15],
                ["c", -0.84, -0.27, -1.11, -0.3, -1.65, -0.3],
                ["c", -0.57, 0, -0.84, 0.03, -1.56, 0.27],
                ["c", -0.6, 0.18, -0.69, 0.21, -0.81, 0.15],
                ["c", -0.12, -0.06, -0.21, -0.18, -0.21, -0.3],
                ["c", 0, -0.15, 0.6, -1.44, 1.2, -2.61],
                ["c", 1.14, -2.22, 2.73, -4.68, 5.1, -8.01],
                ["c", 0.21, -0.27, 0.36, -0.48, 0.33, -0.48],
                ["c", 0, 0, -0.12, 0.06, -0.27, 0.12],
                ["c", -0.54, 0.3, -0.99, 0.39, -1.56, 0.39],
                ["c", -0.75, 0.03, -1.2, -0.18, -1.83, -0.75],
                ["c", -0.99, -0.9, -1.83, -1.17, -2.31, -0.72],
                ["c", -0.18, 0.15, -0.36, 0.51, -0.45, 0.84],
                ["c", -0.06, 0.24, -0.06, 0.33, -0.09, 1.98],
                ["c", 0, 1.62, -0.03, 1.74, -0.06, 1.8],
                ["c", -0.15, 0.24, -0.54, 0.24, -0.69, 0],
                ["c", -0.06, -0.09, -0.06, -0.15, -0.06, -3.57],
                ["c", 0, -3.42, 0, -3.48, 0.06, -3.57],
                ["c", 0.03, -0.06, 0.09, -0.12, 0.15, -0.15],
                ["z"]
            ],
            w: 10.561,
            h: 15.093
        },
        "8": {
            d: [
                ["M", 4.98, -14.97],
                ["c", 0.33, -0.03, 1.02, -0.03, 1.32, 0],
                ["c", 1.32, 0.12, 2.49, 0.6, 3.21, 1.32],
                ["c", 0.39, 0.39, 0.66, 0.81, 0.78, 1.29],
                ["c", 0.09, 0.36, 0.09, 1.08, 0, 1.44],
                ["c", -0.21, 0.84, -0.66, 1.59, -1.59, 2.55],
                ["l", -0.3, 0.3],
                ["l", 0.27, 0.18],
                ["c", 1.47, 0.93, 2.31, 2.31, 2.25, 3.75],
                ["c", -0.03, 0.75, -0.24, 1.35, -0.63, 1.95],
                ["c", -0.45, 0.66, -1.02, 1.14, -1.83, 1.53],
                ["c", -1.8, 0.87, -4.2, 0.87, -6, 0.03],
                ["c", -1.62, -0.78, -2.52, -2.16, -2.46, -3.66],
                ["c", 0.06, -0.99, 0.54, -1.77, 1.8, -2.97],
                ["c", 0.54, -0.51, 0.54, -0.54, 0.48, -0.57],
                ["c", -0.39, -0.27, -0.96, -0.78, -1.2, -1.14],
                ["c", -0.75, -1.11, -0.87, -2.4, -0.3, -3.6],
                ["c", 0.69, -1.35, 2.25, -2.25, 4.2, -2.4],
                ["z"],
                ["m", 1.53, 0.69],
                ["c", -0.42, -0.09, -1.11, -0.12, -1.38, -0.06],
                ["c", -0.3, 0.06, -0.6, 0.18, -0.81, 0.3],
                ["c", -0.21, 0.12, -0.6, 0.51, -0.72, 0.72],
                ["c", -0.51, 0.87, -0.42, 1.89, 0.21, 2.52],
                ["c", 0.21, 0.21, 0.36, 0.3, 1.95, 1.23],
                ["c", 0.96, 0.54, 1.74, 0.99, 1.77, 1.02],
                ["c", 0.09, 0, 0.63, -0.6, 0.99, -1.11],
                ["c", 0.21, -0.36, 0.48, -0.87, 0.57, -1.23],
                ["c", 0.06, -0.24, 0.06, -0.36, 0.06, -0.72],
                ["c", 0, -0.45, -0.03, -0.66, -0.15, -0.99],
                ["c", -0.39, -0.81, -1.29, -1.44, -2.49, -1.68],
                ["z"],
                ["m", -1.44, 8.07],
                ["l", -1.89, -1.08],
                ["c", -0.03, 0, -0.18, 0.15, -0.39, 0.33],
                ["c", -1.2, 1.08, -1.65, 1.95, -1.59, 3],
                ["c", 0.09, 1.59, 1.35, 2.85, 3.21, 3.24],
                ["c", 0.33, 0.06, 0.45, 0.06, 0.93, 0.06],
                ["c", 0.63, -0, 0.81, -0.03, 1.29, -0.27],
                ["c", 0.9, -0.42, 1.47, -1.41, 1.41, -2.4],
                ["c", -0.06, -0.66, -0.39, -1.29, -0.9, -1.65],
                ["c", -0.12, -0.09, -1.05, -0.63, -2.07, -1.23],
                ["z"]
            ],
            w: 10.926,
            h: 14.989
        },
        "9": {
            d: [
                ["M", 4.23, -14.97],
                ["c", 0.42, -0.03, 1.29, 0, 1.62, 0.06],
                ["c", 0.51, 0.12, 0.93, 0.3, 1.38, 0.57],
                ["c", 1.53, 1.02, 2.52, 3.24, 2.73, 5.94],
                ["c", 0.18, 2.55, -0.48, 4.98, -1.83, 6.57],
                ["c", -1.05, 1.26, -2.4, 1.89, -3.93, 1.83],
                ["c", -1.23, -0.06, -2.31, -0.45, -3.03, -1.14],
                ["c", -0.57, -0.51, -0.87, -1.23, -0.84, -1.98],
                ["c", 0.03, -0.51, 0.21, -0.9, 0.6, -1.26],
                ["c", 0.24, -0.24, 0.45, -0.39, 0.75, -0.51],
                ["c", 0.21, -0.06, 0.27, -0.06, 0.6, -0.06],
                ["c", 0.33, -0, 0.39, -0, 0.6, 0.06],
                ["c", 0.3, 0.12, 0.51, 0.27, 0.75, 0.51],
                ["c", 0.39, 0.36, 0.57, 0.78, 0.57, 1.26],
                ["c", 0, 0.27, 0, 0.3, -0.09, 0.42],
                ["c", -0.03, 0.09, -0.18, 0.21, -0.3, 0.3],
                ["c", -0.12, 0.09, -0.3, 0.21, -0.39, 0.27],
                ["c", -0.09, 0.06, -0.21, 0.18, -0.27, 0.24],
                ["c", -0.06, 0.12, -0.06, 0.15, -0.06, 0.33],
                ["c", 0, 0.18, 0, 0.24, 0.06, 0.36],
                ["c", 0.24, 0.39, 0.75, 0.6, 1.38, 0.57],
                ["c", 0.54, -0.03, 0.9, -0.18, 1.23, -0.48],
                ["c", 0.81, -0.72, 1.08, -2.16, 0.96, -5.37],
                ["l", 0, -0.63],
                ["l", -0.3, 0.12],
                ["c", -0.78, 0.27, -1.29, 0.33, -2.1, 0.27],
                ["c", -1.47, -0.12, -2.49, -0.54, -3.27, -1.29],
                ["c", -0.48, -0.51, -0.81, -1.11, -0.96, -1.89],
                ["c", -0.06, -0.27, -0.06, -0.42, -0.06, -0.96],
                ["c", 0, -0.51, 0, -0.66, 0.06, -0.93],
                ["c", 0.15, -0.78, 0.48, -1.38, 0.96, -1.89],
                ["c", 0.15, -0.12, 0.33, -0.27, 0.42, -0.36],
                ["c", 0.69, -0.51, 1.62, -0.81, 2.76, -0.93],
                ["z"],
                ["m", 1.17, 0.66],
                ["c", -0.21, -0.06, -0.57, -0.06, -0.81, -0.03],
                ["c", -0.78, 0.12, -1.26, 0.69, -1.41, 1.74],
                ["c", -0.12, 0.63, -0.15, 1.95, -0.09, 2.79],
                ["c", 0.12, 1.71, 0.63, 2.4, 1.77, 2.46],
                ["c", 1.08, 0.03, 1.62, -0.48, 1.8, -1.74],
                ["c", 0.06, -0.54, 0.06, -3, 0, -3.54],
                ["c", -0.15, -1.05, -0.51, -1.53, -1.26, -1.68],
                ["z"]
            ],
            w: 9.959,
            h: 14.986
        },
        f: {
            d: [
                ["M", 9.93, -14.28],
                ["c", 1.53, -0.18, 2.88, 0.45, 3.12, 1.5],
                ["c", 0.12, 0.51, 0, 1.32, -0.27, 1.86],
                ["c", -0.15, 0.3, -0.42, 0.57, -0.63, 0.69],
                ["c", -0.69, 0.36, -1.56, 0.03, -1.83, -0.69],
                ["c", -0.09, -0.24, -0.09, -0.69, 0, -0.87],
                ["c", 0.06, -0.12, 0.21, -0.24, 0.45, -0.42],
                ["c", 0.42, -0.24, 0.57, -0.45, 0.6, -0.72],
                ["c", 0.03, -0.33, -0.09, -0.39, -0.63, -0.42],
                ["c", -0.3, 0, -0.45, 0, -0.6, 0.03],
                ["c", -0.81, 0.21, -1.35, 0.93, -1.74, 2.46],
                ["c", -0.06, 0.27, -0.48, 2.25, -0.48, 2.31],
                ["c", 0, 0.03, 0.39, 0.03, 0.9, 0.03],
                ["c", 0.72, 0, 0.9, 0, 0.99, 0.06],
                ["c", 0.42, 0.15, 0.45, 0.72, 0.03, 0.9],
                ["c", -0.12, 0.06, -0.24, 0.06, -1.17, 0.06],
                ["l", -1.05, 0],
                ["l", -0.78, 2.55],
                ["c", -0.45, 1.41, -0.87, 2.79, -0.96, 3.06],
                ["c", -0.87, 2.37, -2.37, 4.74, -3.78, 5.91],
                ["c", -1.05, 0.9, -2.04, 1.23, -3.09, 1.08],
                ["c", -1.11, -0.18, -1.89, -0.78, -2.04, -1.59],
                ["c", -0.12, -0.66, 0.15, -1.71, 0.54, -2.19],
                ["c", 0.69, -0.75, 1.86, -0.54, 2.22, 0.39],
                ["c", 0.06, 0.15, 0.09, 0.27, 0.09, 0.48],
                ["c", -0, 0.24, -0.03, 0.27, -0.12, 0.42],
                ["c", -0.03, 0.09, -0.15, 0.18, -0.27, 0.27],
                ["c", -0.09, 0.06, -0.27, 0.21, -0.36, 0.27],
                ["c", -0.24, 0.18, -0.36, 0.36, -0.39, 0.6],
                ["c", -0.03, 0.33, 0.09, 0.39, 0.63, 0.42],
                ["c", 0.42, 0, 0.63, -0.03, 0.9, -0.15],
                ["c", 0.6, -0.3, 0.96, -0.96, 1.38, -2.64],
                ["c", 0.09, -0.42, 0.63, -2.55, 1.17, -4.77],
                ["l", 1.02, -4.08],
                ["c", -0, -0.03, -0.36, -0.03, -0.81, -0.03],
                ["c", -0.72, 0, -0.81, 0, -0.93, -0.06],
                ["c", -0.42, -0.18, -0.39, -0.75, 0.03, -0.9],
                ["c", 0.09, -0.06, 0.27, -0.06, 1.05, -0.06],
                ["l", 0.96, 0],
                ["l", 0, -0.09],
                ["c", 0.06, -0.18, 0.3, -0.72, 0.51, -1.17],
                ["c", 1.2, -2.46, 3.3, -4.23, 5.34, -4.5],
                ["z"]
            ],
            w: 16.155,
            h: 19.445
        },
        m: {
            d: [
                ["M", 2.79, -8.91],
                ["c", 0.09, 0, 0.3, -0.03, 0.45, -0.03],
                ["c", 0.24, 0.03, 0.3, 0.03, 0.45, 0.12],
                ["c", 0.36, 0.15, 0.63, 0.54, 0.75, 1.02],
                ["l", 0.03, 0.21],
                ["l", 0.33, -0.3],
                ["c", 0.69, -0.69, 1.38, -1.02, 2.07, -1.02],
                ["c", 0.27, 0, 0.33, 0, 0.48, 0.06],
                ["c", 0.21, 0.09, 0.48, 0.36, 0.63, 0.6],
                ["c", 0.03, 0.09, 0.12, 0.27, 0.18, 0.42],
                ["c", 0.03, 0.15, 0.09, 0.27, 0.12, 0.27],
                ["c", 0, 0, 0.09, -0.09, 0.18, -0.21],
                ["c", 0.33, -0.39, 0.87, -0.81, 1.29, -0.99],
                ["c", 0.78, -0.33, 1.47, -0.21, 2.01, 0.33],
                ["c", 0.3, 0.33, 0.48, 0.69, 0.6, 1.14],
                ["c", 0.09, 0.42, 0.06, 0.54, -0.54, 3.06],
                ["c", -0.33, 1.29, -0.57, 2.4, -0.57, 2.43],
                ["c", 0, 0.12, 0.09, 0.21, 0.21, 0.21],
                ["c", 0.24, -0, 0.75, -0.3, 1.2, -0.72],
                ["c", 0.45, -0.39, 0.6, -0.45, 0.78, -0.27],
                ["c", 0.18, 0.18, 0.09, 0.36, -0.45, 0.87],
                ["c", -1.05, 0.96, -1.83, 1.47, -2.58, 1.71],
                ["c", -0.93, 0.33, -1.53, 0.21, -1.8, -0.33],
                ["c", -0.06, -0.15, -0.06, -0.21, -0.06, -0.45],
                ["c", 0, -0.24, 0.03, -0.48, 0.6, -2.82],
                ["c", 0.42, -1.71, 0.6, -2.64, 0.63, -2.79],
                ["c", 0.03, -0.57, -0.3, -0.75, -0.84, -0.48],
                ["c", -0.24, 0.12, -0.54, 0.39, -0.66, 0.63],
                ["c", -0.03, 0.09, -0.42, 1.38, -0.9, 3],
                ["c", -0.9, 3.15, -0.84, 3, -1.14, 3.15],
                ["l", -0.15, 0.09],
                ["l", -0.78, 0],
                ["c", -0.6, 0, -0.78, 0, -0.84, -0.06],
                ["c", -0.09, -0.03, -0.18, -0.18, -0.18, -0.27],
                ["c", 0, -0.03, 0.36, -1.38, 0.84, -2.97],
                ["c", 0.57, -2.04, 0.81, -2.97, 0.84, -3.12],
                ["c", 0.03, -0.54, -0.3, -0.72, -0.84, -0.45],
                ["c", -0.24, 0.12, -0.57, 0.42, -0.66, 0.63],
                ["c", -0.06, 0.09, -0.51, 1.44, -1.05, 2.97],
                ["c", -0.51, 1.56, -0.99, 2.85, -0.99, 2.91],
                ["c", -0.06, 0.12, -0.21, 0.24, -0.36, 0.3],
                ["c", -0.12, 0.06, -0.21, 0.06, -0.9, 0.06],
                ["c", -0.6, 0, -0.78, 0, -0.84, -0.06],
                ["c", -0.09, -0.03, -0.18, -0.18, -0.18, -0.27],
                ["c", 0, -0.03, 0.45, -1.38, 0.99, -2.97],
                ["c", 1.05, -3.18, 1.05, -3.18, 0.93, -3.45],
                ["c", -0.12, -0.27, -0.39, -0.3, -0.72, -0.15],
                ["c", -0.54, 0.27, -1.14, 1.17, -1.56, 2.4],
                ["c", -0.06, 0.15, -0.15, 0.3, -0.18, 0.36],
                ["c", -0.21, 0.21, -0.57, 0.27, -0.72, 0.09],
                ["c", -0.09, -0.09, -0.06, -0.21, 0.06, -0.63],
                ["c", 0.48, -1.26, 1.26, -2.46, 2.01, -3.21],
                ["c", 0.57, -0.54, 1.2, -0.87, 1.83, -1.02],
                ["z"]
            ],
            w: 14.687,
            h: 9.126
        },
        p: {
            d: [
                ["M", 1.92, -8.7],
                ["c", 0.27, -0.09, 0.81, -0.06, 1.11, 0.03],
                ["c", 0.54, 0.18, 0.93, 0.51, 1.17, 0.99],
                ["c", 0.09, 0.15, 0.15, 0.33, 0.18, 0.36],
                ["l", -0, 0.12],
                ["l", 0.3, -0.27],
                ["c", 0.66, -0.6, 1.35, -1.02, 2.13, -1.2],
                ["c", 0.21, -0.06, 0.33, -0.06, 0.78, -0.06],
                ["c", 0.45, 0, 0.51, 0, 0.84, 0.09],
                ["c", 1.29, 0.33, 2.07, 1.32, 2.25, 2.79],
                ["c", 0.09, 0.81, -0.09, 2.01, -0.45, 2.79],
                ["c", -0.54, 1.26, -1.86, 2.55, -3.18, 3.03],
                ["c", -0.45, 0.18, -0.81, 0.24, -1.29, 0.24],
                ["c", -0.69, -0.03, -1.35, -0.18, -1.86, -0.45],
                ["c", -0.3, -0.15, -0.51, -0.18, -0.69, -0.09],
                ["c", -0.09, 0.03, -0.18, 0.09, -0.18, 0.12],
                ["c", -0.09, 0.12, -1.05, 2.94, -1.05, 3.06],
                ["c", 0, 0.24, 0.18, 0.48, 0.51, 0.63],
                ["c", 0.18, 0.06, 0.54, 0.15, 0.75, 0.15],
                ["c", 0.21, 0, 0.36, 0.06, 0.42, 0.18],
                ["c", 0.12, 0.18, 0.06, 0.42, -0.12, 0.54],
                ["c", -0.09, 0.03, -0.15, 0.03, -0.78, 0],
                ["c", -1.98, -0.15, -3.81, -0.15, -5.79, 0],
                ["c", -0.63, 0.03, -0.69, 0.03, -0.78, 0],
                ["c", -0.24, -0.15, -0.24, -0.57, 0.03, -0.66],
                ["c", 0.06, -0.03, 0.48, -0.09, 0.99, -0.12],
                ["c", 0.87, -0.06, 1.11, -0.09, 1.35, -0.21],
                ["c", 0.18, -0.06, 0.33, -0.18, 0.39, -0.3],
                ["c", 0.06, -0.12, 3.24, -9.42, 3.27, -9.6],
                ["c", 0.06, -0.33, 0.03, -0.57, -0.15, -0.69],
                ["c", -0.09, -0.06, -0.12, -0.06, -0.3, -0.06],
                ["c", -0.69, 0.06, -1.53, 1.02, -2.28, 2.61],
                ["c", -0.09, 0.21, -0.21, 0.45, -0.27, 0.51],
                ["c", -0.09, 0.12, -0.33, 0.24, -0.48, 0.24],
                ["c", -0.18, 0, -0.36, -0.15, -0.36, -0.3],
                ["c", 0, -0.24, 0.78, -1.83, 1.26, -2.55],
                ["c", 0.72, -1.11, 1.47, -1.74, 2.28, -1.92],
                ["z"],
                ["m", 5.37, 1.47],
                ["c", -0.27, -0.12, -0.75, -0.03, -1.14, 0.21],
                ["c", -0.75, 0.48, -1.47, 1.68, -1.89, 3.15],
                ["c", -0.45, 1.47, -0.42, 2.34, 0, 2.7],
                ["c", 0.45, 0.39, 1.26, 0.21, 1.83, -0.36],
                ["c", 0.51, -0.51, 0.99, -1.68, 1.38, -3.27],
                ["c", 0.3, -1.17, 0.33, -1.74, 0.15, -2.13],
                ["c", -0.09, -0.15, -0.15, -0.21, -0.33, -0.3],
                ["z"]
            ],
            w: 14.689,
            h: 13.127
        },
        r: {
            d: [
                ["M", 6.33, -9.12],
                ["c", 0.27, -0.03, 0.93, 0, 1.2, 0.06],
                ["c", 0.84, 0.21, 1.23, 0.81, 1.02, 1.53],
                ["c", -0.24, 0.75, -0.9, 1.17, -1.56, 0.96],
                ["c", -0.33, -0.09, -0.51, -0.3, -0.66, -0.75],
                ["c", -0.03, -0.12, -0.09, -0.24, -0.12, -0.3],
                ["c", -0.09, -0.15, -0.3, -0.24, -0.48, -0.24],
                ["c", -0.57, 0, -1.38, 0.54, -1.65, 1.08],
                ["c", -0.06, 0.15, -0.33, 1.17, -0.9, 3.27],
                ["c", -0.57, 2.31, -0.81, 3.12, -0.87, 3.21],
                ["c", -0.03, 0.06, -0.12, 0.15, -0.18, 0.21],
                ["l", -0.12, 0.06],
                ["l", -0.81, 0.03],
                ["c", -0.69, 0, -0.81, 0, -0.9, -0.03],
                ["c", -0.09, -0.06, -0.18, -0.21, -0.18, -0.3],
                ["c", 0, -0.06, 0.39, -1.62, 0.9, -3.51],
                ["c", 0.84, -3.24, 0.87, -3.45, 0.87, -3.72],
                ["c", 0, -0.21, 0, -0.27, -0.03, -0.36],
                ["c", -0.12, -0.15, -0.21, -0.24, -0.42, -0.24],
                ["c", -0.24, 0, -0.45, 0.15, -0.78, 0.42],
                ["c", -0.33, 0.36, -0.45, 0.54, -0.72, 1.14],
                ["c", -0.03, 0.12, -0.21, 0.24, -0.36, 0.27],
                ["c", -0.12, 0, -0.15, 0, -0.24, -0.06],
                ["c", -0.18, -0.12, -0.18, -0.21, -0.06, -0.54],
                ["c", 0.21, -0.57, 0.42, -0.93, 0.78, -1.32],
                ["c", 0.54, -0.51, 1.2, -0.81, 1.95, -0.87],
                ["c", 0.81, -0.03, 1.53, 0.3, 1.92, 0.87],
                ["l", 0.12, 0.18],
                ["l", 0.09, -0.09],
                ["c", 0.57, -0.45, 1.41, -0.84, 2.19, -0.96],
                ["z"]
            ],
            w: 9.41,
            h: 9.132
        },
        s: {
            d: [
                ["M", 4.47, -8.73],
                ["c", 0.09, 0, 0.36, -0.03, 0.57, -0.03],
                ["c", 0.75, 0.03, 1.29, 0.24, 1.71, 0.63],
                ["c", 0.51, 0.54, 0.66, 1.26, 0.36, 1.83],
                ["c", -0.24, 0.42, -0.63, 0.57, -1.11, 0.42],
                ["c", -0.33, -0.09, -0.6, -0.36, -0.6, -0.57],
                ["c", 0, -0.03, 0.06, -0.21, 0.15, -0.39],
                ["c", 0.12, -0.21, 0.15, -0.33, 0.18, -0.48],
                ["c", 0, -0.24, -0.06, -0.48, -0.15, -0.6],
                ["c", -0.15, -0.21, -0.42, -0.24, -0.75, -0.15],
                ["c", -0.27, 0.06, -0.48, 0.18, -0.69, 0.36],
                ["c", -0.39, 0.39, -0.51, 0.96, -0.33, 1.38],
                ["c", 0.09, 0.21, 0.42, 0.51, 0.78, 0.72],
                ["c", 1.11, 0.69, 1.59, 1.11, 1.89, 1.68],
                ["c", 0.21, 0.39, 0.24, 0.78, 0.15, 1.29],
                ["c", -0.18, 1.2, -1.17, 2.16, -2.52, 2.52],
                ["c", -1.02, 0.24, -1.95, 0.12, -2.7, -0.42],
                ["c", -0.72, -0.51, -0.99, -1.47, -0.6, -2.19],
                ["c", 0.24, -0.48, 0.72, -0.63, 1.17, -0.42],
                ["c", 0.33, 0.18, 0.54, 0.45, 0.57, 0.81],
                ["c", 0, 0.21, -0.03, 0.3, -0.33, 0.51],
                ["c", -0.33, 0.24, -0.39, 0.42, -0.27, 0.69],
                ["c", 0.06, 0.15, 0.21, 0.27, 0.45, 0.33],
                ["c", 0.3, 0.09, 0.87, 0.09, 1.2, -0],
                ["c", 0.75, -0.21, 1.23, -0.72, 1.29, -1.35],
                ["c", 0.03, -0.42, -0.15, -0.81, -0.54, -1.2],
                ["c", -0.24, -0.24, -0.48, -0.42, -1.41, -1.02],
                ["c", -0.69, -0.42, -1.05, -0.93, -1.05, -1.47],
                ["c", 0, -0.39, 0.12, -0.87, 0.3, -1.23],
                ["c", 0.27, -0.57, 0.78, -1.05, 1.38, -1.35],
                ["c", 0.24, -0.12, 0.63, -0.27, 0.9, -0.3],
                ["z"]
            ],
            w: 6.632,
            h: 8.758
        },
        z: {
            d: [
                ["M", 2.64, -7.95],
                ["c", 0.36, -0.09, 0.81, -0.03, 1.71, 0.27],
                ["c", 0.78, 0.21, 0.96, 0.27, 1.74, 0.3],
                ["c", 0.87, 0.06, 1.02, 0.03, 1.38, -0.21],
                ["c", 0.21, -0.15, 0.33, -0.15, 0.48, -0.06],
                ["c", 0.15, 0.09, 0.21, 0.3, 0.15, 0.45],
                ["c", -0.03, 0.06, -1.26, 1.26, -2.76, 2.67],
                ["l", -2.73, 2.55],
                ["l", 0.54, 0.03],
                ["c", 0.54, 0.03, 0.72, 0.03, 2.01, 0.15],
                ["c", 0.36, 0.03, 0.9, 0.06, 1.2, 0.09],
                ["c", 0.66, 0, 0.81, -0.03, 1.02, -0.24],
                ["c", 0.3, -0.3, 0.39, -0.72, 0.27, -1.23],
                ["c", -0.06, -0.27, -0.06, -0.27, -0.03, -0.39],
                ["c", 0.15, -0.3, 0.54, -0.27, 0.69, 0.03],
                ["c", 0.15, 0.33, 0.27, 1.02, 0.27, 1.5],
                ["c", 0, 1.47, -1.11, 2.7, -2.52, 2.79],
                ["c", -0.57, 0.03, -1.02, -0.09, -2.01, -0.51],
                ["c", -1.02, -0.42, -1.23, -0.48, -2.13, -0.54],
                ["c", -0.81, -0.06, -0.96, -0.03, -1.26, 0.18],
                ["c", -0.12, 0.06, -0.24, 0.12, -0.27, 0.12],
                ["c", -0.27, 0, -0.45, -0.3, -0.36, -0.51],
                ["c", 0.03, -0.06, 1.32, -1.32, 2.91, -2.79],
                ["l", 2.88, -2.73],
                ["c", -0.03, 0, -0.21, 0.03, -0.42, 0.06],
                ["c", -0.21, 0.03, -0.78, 0.09, -1.23, 0.12],
                ["c", -1.11, 0.12, -1.23, 0.15, -1.95, 0.27],
                ["c", -0.72, 0.15, -1.17, 0.18, -1.29, 0.09],
                ["c", -0.27, -0.18, -0.21, -0.75, 0.12, -1.26],
                ["c", 0.39, -0.6, 0.93, -1.02, 1.59, -1.2],
                ["z"]
            ],
            w: 8.573,
            h: 8.743
        },
        "+": {
            d: [
                ["M", 3.48, -11.19],
                ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0],
                ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3],
                ["l", 0.06, 0.15],
                ["l", 0, 1.29],
                ["l", 0, 1.29],
                ["l", 1.29, 0],
                ["c", 1.23, 0, 1.29, 0, 1.41, 0.06],
                ["c", 0.06, 0.03, 0.15, 0.09, 0.18, 0.12],
                ["c", 0.12, 0.09, 0.21, 0.33, 0.21, 0.48],
                ["c", 0, 0.15, -0.09, 0.39, -0.21, 0.48],
                ["c", -0.03, 0.03, -0.12, 0.09, -0.18, 0.12],
                ["c", -0.12, 0.06, -0.18, 0.06, -1.41, 0.06],
                ["l", -1.29, 0],
                ["l", 0, 1.29],
                ["c", 0, 1.23, 0, 1.29, -0.06, 1.41],
                ["c", -0.09, 0.18, -0.15, 0.24, -0.3, 0.33],
                ["c", -0.21, 0.09, -0.39, 0.09, -0.57, 0],
                ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33],
                ["c", -0.06, -0.12, -0.06, -0.18, -0.06, -1.41],
                ["l", 0, -1.29],
                ["l", -1.29, 0],
                ["c", -1.23, 0, -1.29, 0, -1.41, -0.06],
                ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33],
                ["c", -0.09, -0.18, -0.09, -0.36, 0, -0.54],
                ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33],
                ["l", 0.15, -0.06],
                ["l", 1.26, 0],
                ["l", 1.29, 0],
                ["l", 0, -1.29],
                ["c", 0, -1.23, 0, -1.29, 0.06, -1.41],
                ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33],
                ["z"]
            ],
            w: 7.507,
            h: 7.515
        },
        ",": {
            d: [
                ["M", 1.32, -3.36],
                ["c", 0.57, -0.15, 1.17, 0.03, 1.59, 0.45],
                ["c", 0.45, 0.45, 0.6, 0.96, 0.51, 1.89],
                ["c", -0.09, 1.23, -0.42, 2.46, -0.99, 3.93],
                ["c", -0.3, 0.72, -0.72, 1.62, -0.78, 1.68],
                ["c", -0.18, 0.21, -0.51, 0.18, -0.66, -0.06],
                ["c", -0.03, -0.06, -0.06, -0.15, -0.06, -0.18],
                ["c", 0, -0.06, 0.12, -0.33, 0.24, -0.63],
                ["c", 0.84, -1.8, 1.02, -2.61, 0.69, -3.24],
                ["c", -0.12, -0.24, -0.27, -0.36, -0.75, -0.6],
                ["c", -0.36, -0.15, -0.42, -0.21, -0.6, -0.39],
                ["c", -0.69, -0.69, -0.69, -1.71, 0, -2.4],
                ["c", 0.21, -0.21, 0.51, -0.39, 0.81, -0.45],
                ["z"]
            ],
            w: 3.452,
            h: 8.143
        },
        "-": {
            d: [
                ["M", 0.18, -5.34],
                ["c", 0.09, -0.06, 0.15, -0.06, 2.31, -0.06],
                ["c", 2.46, 0, 2.37, 0, 2.46, 0.21],
                ["c", 0.12, 0.21, 0.03, 0.42, -0.15, 0.54],
                ["c", -0.09, 0.06, -0.15, 0.06, -2.28, 0.06],
                ["c", -2.16, 0, -2.22, 0, -2.31, -0.06],
                ["c", -0.27, -0.15, -0.27, -0.54, -0.03, -0.69],
                ["z"]
            ],
            w: 5.001,
            h: 0.81
        },
        ".": {
            d: [
                ["M", 1.32, -3.36],
                ["c", 1.05, -0.27, 2.1, 0.57, 2.1, 1.65],
                ["c", 0, 1.08, -1.05, 1.92, -2.1, 1.65],
                ["c", -0.9, -0.21, -1.5, -1.14, -1.26, -2.04],
                ["c", 0.12, -0.63, 0.63, -1.11, 1.26, -1.26],
                ["z"]
            ],
            w: 3.413,
            h: 3.402
        }
    };
    this.printSymbol = function(c, h, d, g, b) {
        if (!a[d]) {
            return null
        }
        var e = this.pathClone(a[d].d);
        e[0][1] += c;
        e[0][2] += h;
        var f = g.path().attr({
            path: e,
            stroke: "none",
            fill: "#000000",
            "class": b
        });
        return f
    };
    this.getPathForSymbol = function(b, g, e, d, c) {
        d = d || 1;
        c = c || 1;
        if (!a[e]) {
            return null
        }
        var f = this.pathClone(a[e].d);
        if (d !== 1 || c !== 1) {
            this.pathScale(f, d, c)
        }
        f[0][1] += b;
        f[0][2] += g;
        return f
    };
    this.getSymbolWidth = function(b) {
        if (a[b]) {
            return a[b].w
        }
        return 0
    };
    this.getSymbolHeight = function(b) {
        if (a[b]) {
            return a[b].h
        }
        return 0
    };
    this.getSymbolAlign = function(b) {
        if (b.substring(0, 7) === "scripts" && b !== "scripts.roll") {
            return "center"
        }
        return "left"
    };
    this.pathClone = function(g) {
        var d = [];
        for (var c = 0, e = g.length; c < e; c++) {
            d[c] = [];
            for (var b = 0, f = g[c].length; b < f; b++) {
                d[c][b] = g[c][b]
            }
        }
        return d
    };
    this.pathScale = function(h, f, d) {
        for (var c = 0, e = h.length; c < e; c++) {
            var k = h[c];
            var b, g;
            for (b = 1, g = k.length; b < g; b++) {
                k[b] *= (b % 2) ? f : d
            }
        }
    };
    this.getYCorr = function(b) {
        switch (b) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "+":
                return -3;
            case "timesig.common":
            case "timesig.cut":
                return -1;
            case "flags.d32nd":
                return -1;
            case "flags.d64th":
                return -2;
            case "flags.u32nd":
                return 1;
            case "flags.u64th":
                return 3;
            case "rests.whole":
                return 1;
            case "rests.half":
                return -1;
            case "rests.8th":
                return -1;
            case "rests.quarter":
                return -2;
            case "rests.16th":
                return -1;
            case "rests.32nd":
                return -1;
            case "rests.64th":
                return -1;
            default:
                return 0
        }
    }
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.getDuration = function(a) {
    var b = 0;
    if (a.duration) {
        b = a.duration
    }
    return b
};
ABCJS.write.getDurlog = function(a) {
    if (a === undefined) {
        return 0
    }
    return Math.floor(Math.log(a) / Math.log(2))
};
ABCJS.write.Layout = function(b, a) {
    this.glyphs = b;
    this.isBagpipes = a;
    this.chartable = {
        rest: {
            0: "rests.whole",
            1: "rests.half",
            2: "rests.quarter",
            3: "rests.8th",
            4: "rests.16th",
            5: "rests.32nd",
            6: "rests.64th",
            7: "rests.128th"
        },
        note: {
            "-1": "noteheads.dbl",
            0: "noteheads.whole",
            1: "noteheads.half",
            2: "noteheads.quarter",
            3: "noteheads.quarter",
            4: "noteheads.quarter",
            5: "noteheads.quarter",
            6: "noteheads.quarter"
        },
        uflags: {
            3: "flags.u8th",
            4: "flags.u16th",
            5: "flags.u32nd",
            6: "flags.u64th"
        },
        dflags: {
            3: "flags.d8th",
            4: "flags.d16th",
            5: "flags.d32nd",
            6: "flags.d64th"
        }
    };
    this.slurs = {};
    this.ties = [];
    this.slursbyvoice = {};
    this.tiesbyvoice = {};
    this.endingsbyvoice = {};
    this.s = 0;
    this.v = 0;
    this.stafflines = 5;
    this.tripletmultiplier = 1
};
ABCJS.write.Layout.prototype.getCurrentVoiceId = function() {
    return "s" + this.s + "v" + this.v
};
ABCJS.write.Layout.prototype.pushCrossLineElems = function() {
    this.slursbyvoice[this.getCurrentVoiceId()] = this.slurs;
    this.tiesbyvoice[this.getCurrentVoiceId()] = this.ties;
    this.endingsbyvoice[this.getCurrentVoiceId()] = this.partstartelem
};
ABCJS.write.Layout.prototype.popCrossLineElems = function() {
    this.slurs = this.slursbyvoice[this.getCurrentVoiceId()] || {};
    this.ties = this.tiesbyvoice[this.getCurrentVoiceId()] || [];
    this.partstartelem = this.endingsbyvoice[this.getCurrentVoiceId()]
};
ABCJS.write.Layout.prototype.getElem = function() {
    if (this.abcline.length <= this.pos) {
        return null
    }
    return this.abcline[this.pos]
};
ABCJS.write.Layout.prototype.getNextElem = function() {
    if (this.abcline.length <= this.pos + 1) {
        return null
    }
    return this.abcline[this.pos + 1]
};
ABCJS.write.Layout.prototype.printABCLine = function(a) {
    this.minY = 2;
    this.staffgroup = new ABCJS.write.StaffGroupElement();
    for (this.s = 0; this.s < a.length; this.s++) {
        this.printABCStaff(a[this.s])
    }
    return this.staffgroup
};

function adjustChordVerticalPosition(h) {
    var c = 16;
    var l = [];
    for (var g = 0; g < h.voices.length; g++) {
        for (var f = 0; f < h.voices[g].children.length; f++) {
            var d = h.voices[g].children[f];
            if (d.top + 5 > c) {
                c = d.top + 5
            }
            for (var e = 0; e < d.children.length; e++) {
                var a = d.children[e];
                if (a.type === "chord") {
                    l.push(a)
                }
            }
        }
    }
    for (g = 0; g < l.length; g++) {
        var b = l[g];
        if (b.top < c) {
            b.top = c;
            b.pitch = c;
            b.bottom = c;
            if (b.parent.top < c) {
                b.parent.top = c
            }
        }
    }
}
ABCJS.write.Layout.prototype.printABCStaff = function(a) {
    var b = "";
    if (a.bracket) {
        b += "bracket " + a.bracket + " "
    }
    if (a.brace) {
        b += "brace " + a.brace + " "
    }
    for (this.v = 0; this.v < a.voices.length; this.v++) {
        this.voice = new ABCJS.write.VoiceElement(this.v, a.voices.length);
        if (this.v === 0) {
            this.voice.barfrom = (a.connectBarLines === "start" || a.connectBarLines === "continue");
            this.voice.barto = (a.connectBarLines === "continue" || a.connectBarLines === "end")
        } else {
            this.voice.duplicate = true
        }
        if (a.title && a.title[this.v]) {
            this.voice.header = a.title[this.v]
        }
        this.voice.addChild(this.printClef(a.clef));
        this.voice.addChild(this.printKeySignature(a.key));
        if (a.meter) {
            this.voice.addChild(this.printTimeSignature(a.meter))
        }
        this.printABCVoice(a.voices[this.v]);
        this.staffgroup.addVoice(this.voice, this.s, this.stafflines)
    }
    adjustChordVerticalPosition(this.staffgroup)
};
ABCJS.write.Layout.prototype.printABCVoice = function(b) {
    this.popCrossLineElems();
    this.stemdir = (this.isBagpipes) ? "down" : null;
    this.abcline = b;
    if (this.partstartelem) {
        this.partstartelem = new ABCJS.write.EndingElem("", null, null);
        this.voice.addOther(this.partstartelem)
    }
    for (var a in this.slurs) {
        if (this.slurs.hasOwnProperty(a)) {
            this.slurs[a] = new ABCJS.write.TieElem(null, null, this.slurs[a].above, this.slurs[a].force);
            this.voice.addOther(this.slurs[a])
        }
    }
    for (var c = 0; c < this.ties.length; c++) {
        this.ties[c] = new ABCJS.write.TieElem(null, null, this.ties[c].above, this.ties[c].force);
        this.voice.addOther(this.ties[c])
    }
    for (this.pos = 0; this.pos < this.abcline.length; this.pos++) {
        var d = this.printABCElement();
        for (c = 0; c < d.length; c++) {
            this.voice.addChild(d[c])
        }
    }
    this.pushCrossLineElems()
};
ABCJS.write.Layout.prototype.printABCElement = function() {
    var d = [];
    var b = this.getElem();
    switch (b.el_type) {
        case "note":
            d = this.printBeam();
            break;
        case "bar":
            d[0] = this.printBarLine(b);
            if (this.voice.duplicate) {
                d[0].invisible = true
            }
            break;
        case "meter":
            d[0] = this.printTimeSignature(b);
            if (this.voice.duplicate) {
                d[0].invisible = true
            }
            break;
        case "clef":
            d[0] = this.printClef(b);
            if (this.voice.duplicate) {
                d[0].invisible = true
            }
            break;
        case "key":
            d[0] = this.printKeySignature(b);
            if (this.voice.duplicate) {
                d[0].invisible = true
            }
            break;
        case "stem":
            this.stemdir = b.direction;
            break;
        case "part":
            var a = new ABCJS.write.AbsoluteElement(b, 0, 0, "part");
            a.addChild(new ABCJS.write.RelativeElement(b.title, 0, 0, 18, {
                type: "text",
                attributes: {
                    "font-weight": "bold",
                    "font-size": "" + 16 * this.printer.scale + "px",
                    "font-family": "serif"
                }
            }));
            d[0] = a;
            break;
        default:
            var c = new ABCJS.write.AbsoluteElement(b, 0, 0, "unsupported");
            c.addChild(new ABCJS.write.RelativeElement("element type " + b.el_type, 0, 0, 0, {
                type: "debug"
            }));
            d[0] = c
    }
    return d
};
ABCJS.write.Layout.prototype.printBeam = function() {
    var e = [];
    if (this.getElem().startBeam && !this.getElem().endBeam) {
        var f = new ABCJS.write.BeamElem(this.stemdir);
        var b = this.pos;
        var c;
        while (this.getElem()) {
            c = this.printNote(this.getElem(), true, true);
            f.add(c);
            if (this.getElem().endBeam) {
                break
            }
            this.pos++
        }
        var a = f.calcDir();
        this.pos = b;
        f = new ABCJS.write.BeamElem(a ? "up" : "down");
        var d = this.stemdir;
        this.stemdir = a ? "up" : "down";
        while (this.getElem()) {
            c = this.printNote(this.getElem(), true);
            e.push(c);
            f.add(c);
            if (this.getElem().endBeam) {
                break
            }
            this.pos++
        }
        this.stemdir = d;
        this.voice.addOther(f)
    } else {
        e[0] = this.printNote(this.getElem())
    }
    return e
};
ABCJS.write.sortPitch = function(c) {
    var a;
    do {
        a = true;
        for (var d = 0; d < c.pitches.length - 1; d++) {
            if (c.pitches[d].pitch > c.pitches[d + 1].pitch) {
                a = false;
                var b = c.pitches[d];
                c.pitches[d] = c.pitches[d + 1];
                c.pitches[d + 1] = b
            }
        }
    } while (!a)
};
ABCJS.write.Layout.prototype.printNote = function(L, d, S) {
    var o = null;
    var a = null;
    this.roomtaken = 0;
    this.roomtakenright = 0;
    var D = 0;
    var U = "";
    var B = null;
    var q = [];
    var I, O, l;
    var b, R, Q, e;
    var r = ABCJS.write.getDuration(L);
    if (r === 0) {
        r = 0.25;
        d = true
    }
    var v = Math.floor(Math.log(r) / Math.log(2));
    var W = 0;
    for (var f = Math.pow(2, v), P = f / 2; f < r; W++, f += P, P /= 2) {}
    if (L.startTriplet) {
        if (L.startTriplet === 2) {
            this.tripletmultiplier = 3 / 2
        } else {
            this.tripletmultiplier = (L.startTriplet - 1) / L.startTriplet
        }
    }
    var g = new ABCJS.write.AbsoluteElement(L, r * this.tripletmultiplier, 1, "note");
    if (L.rest) {
        var k = 7;
        if (this.stemdir === "down") {
            k = 3
        }
        if (this.stemdir === "up") {
            k = 11
        }
        switch (L.rest.type) {
            case "whole":
                U = this.chartable.rest[0];
                L.averagepitch = k;
                L.minpitch = k;
                L.maxpitch = k;
                W = 0;
                break;
            case "rest":
                U = this.chartable.rest[-v];
                L.averagepitch = k;
                L.minpitch = k;
                L.maxpitch = k;
                break;
            case "invisible":
            case "spacer":
                U = ""
        }
        if (!S) {
            o = this.printNoteHead(g, U, {
                verticalPos: k
            }, null, 0, -this.roomtaken, null, W, 0, 1)
        }
        if (o) {
            g.addHead(o)
        }
        this.roomtaken += this.accidentalshiftx;
        this.roomtakenright = Math.max(this.roomtakenright, this.dotshiftx)
    } else {
        ABCJS.write.sortPitch(L);
        var n = 0;
        for (I = 0, l = L.pitches.length; I < l; I++) {
            n += L.pitches[I].verticalPos
        }
        L.averagepitch = n / L.pitches.length;
        L.minpitch = L.pitches[0].verticalPos;
        this.minY = Math.min(L.minpitch, this.minY);
        L.maxpitch = L.pitches[L.pitches.length - 1].verticalPos;
        var V = (L.averagepitch >= 6) ? "down" : "up";
        if (this.stemdir) {
            V = this.stemdir
        }
        for (I = (V === "down") ? L.pitches.length - 2 : 1;
            (V === "down") ? I >= 0 : I < L.pitches.length; I = (V === "down") ? I - 1 : I + 1) {
            var w = L.pitches[(V === "down") ? I + 1 : I - 1];
            var E = L.pitches[I];
            var F = (V === "down") ? w.pitch - E.pitch : E.pitch - w.pitch;
            if (F <= 1 && !w.printer_shift) {
                E.printer_shift = (F) ? "different" : "same";
                if (E.verticalPos > 11 || E.verticalPos < 1) {
                    q.push(E.verticalPos - (E.verticalPos % 2))
                }
                if (V === "down") {
                    this.roomtaken = this.glyphs.getSymbolWidth(this.chartable.note[-v]) + 2
                } else {
                    D = this.glyphs.getSymbolWidth(this.chartable.note[-v]) + 2
                }
            }
        }
        this.accidentalSlot = [];
        for (I = 0; I < L.pitches.length; I++) {
            if (!d) {
                if ((V === "down" && I !== 0) || (V === "up" && I !== l - 1)) {
                    B = null
                } else {
                    B = this.chartable[(V === "down") ? "dflags" : "uflags"][-v]
                }
                U = this.chartable.note[-v]
            } else {
                U = "noteheads.quarter"
            }
            L.pitches[I].highestVert = L.pitches[I].verticalPos;
            var j = (this.stemdir === "up" || V === "up") && I === 0;
            var J = (this.stemdir === "down" || V === "down") && I === l - 1;
            if (!S && (j || J)) {
                if (L.startSlur || l === 1) {
                    L.pitches[I].highestVert = L.pitches[l - 1].verticalPos;
                    if (this.stemdir === "up" || V === "up") {
                        L.pitches[I].highestVert += 6
                    }
                }
                if (L.startSlur) {
                    if (!L.pitches[I].startSlur) {
                        L.pitches[I].startSlur = []
                    }
                    for (O = 0; O < L.startSlur.length; O++) {
                        L.pitches[I].startSlur.push(L.startSlur[O])
                    }
                }
                if (!S && L.endSlur) {
                    L.pitches[I].highestVert = L.pitches[l - 1].verticalPos;
                    if (this.stemdir === "up" || V === "up") {
                        L.pitches[I].highestVert += 6
                    }
                    if (!L.pitches[I].endSlur) {
                        L.pitches[I].endSlur = []
                    }
                    for (O = 0; O < L.endSlur.length; O++) {
                        L.pitches[I].endSlur.push(L.endSlur[O])
                    }
                }
            }
            if (!S) {
                o = this.printNoteHead(g, U, L.pitches[I], V, 0, -this.roomtaken, B, W, D, 1)
            }
            if (o) {
                g.addHead(o)
            }
            this.roomtaken += this.accidentalshiftx;
            this.roomtakenright = Math.max(this.roomtakenright, this.dotshiftx)
        }
        if (!d && v <= -1) {
            R = (V === "down") ? L.minpitch - 7 : L.minpitch + 1 / 3;
            if (R > 6 && !this.stemdir) {
                R = 6
            }
            Q = (V === "down") ? L.maxpitch - 1 / 3 : L.maxpitch + 7;
            if (Q < 6 && !this.stemdir) {
                Q = 6
            }
            e = (V === "down" || g.heads.length === 0) ? 0 : g.heads[0].w;
            b = (V === "down") ? 1 : -1;
            g.addExtra(new ABCJS.write.RelativeElement(null, e, 0, R, {
                type: "stem",
                pitch2: Q,
                linewidth: b
            }));
            this.minY = Math.min(R, this.minY);
            this.minY = Math.min(Q, this.minY)
        }
    }
    if (L.lyric !== undefined) {
        var K = "";
        ABCJS.parse.each(L.lyric, function(c) {
            K += c.syllable + c.divider + "\n"
        });
        g.addRight(new ABCJS.write.RelativeElement(K, 0, K.length * 5, 0, {
            type: "debugLow"
        }))
    }
    if (!S && L.gracenotes !== undefined) {
        var u = 3 / 5;
        var h = null;
        if (L.gracenotes.length > 1) {
            h = new ABCJS.write.BeamElem("grace", this.isBagpipes)
        }
        var T = [];
        for (O = L.gracenotes.length - 1; O >= 0; O--) {
            this.roomtaken += 10;
            T[O] = this.roomtaken;
            if (L.gracenotes[O].accidental) {
                this.roomtaken += 7
            }
        }
        for (O = 0; O < L.gracenotes.length; O++) {
            var t = L.gracenotes[O].verticalPos;
            B = (h) ? null : this.chartable.uflags[(this.isBagpipes) ? 5 : 3];
            a = this.printNoteHead(g, "noteheads.quarter", L.gracenotes[O], "up", -T[O], -T[O], B, 0, 0, u);
            g.addExtra(a);
            if (L.gracenotes[O].acciaccatura) {
                var z = L.gracenotes[O].verticalPos + 7 * u;
                var N = h ? 5 : 6;
                g.addRight(new ABCJS.write.RelativeElement("flags.ugrace", -T[O] + N, 0, z, {
                    scalex: u,
                    scaley: u
                }))
            }
            if (h) {
                var m = {
                    heads: [a],
                    abcelem: {
                        averagepitch: t,
                        minpitch: t,
                        maxpitch: t
                    },
                    duration: (this.isBagpipes) ? 1 / 32 : 1 / 16
                };
                h.add(m)
            } else {
                R = t + 1 / 3 * u;
                Q = t + 7 * u;
                e = a.dx + a.w;
                b = -0.6;
                g.addExtra(new ABCJS.write.RelativeElement(null, e, 0, R, {
                    type: "stem",
                    pitch2: Q,
                    linewidth: b
                }))
            }
            if (O === 0 && !this.isBagpipes && !(L.rest && (L.rest.type === "spacer" || L.rest.type === "invisible"))) {
                this.voice.addOther(new ABCJS.write.TieElem(a, o, false, true))
            }
        }
        if (h) {
            this.voice.addOther(h)
        }
    }
    if (!S && L.decoration) {
        var s = this.printDecoration(L.decoration, L.maxpitch, (o) ? o.w : 0, g, this.roomtaken, V, L.minpitch);
        if (s) {
            g.klass = "mark"
        }
    }
    if (L.barNumber) {
        g.addChild(new ABCJS.write.RelativeElement(L.barNumber, -10, 0, 0, {
            type: "debug"
        }))
    }
    for (O = L.maxpitch; O > 11; O--) {
        if (O % 2 === 0 && !L.rest) {
            g.addChild(new ABCJS.write.RelativeElement(null, -2, this.glyphs.getSymbolWidth(U) + 4, O, {
                type: "ledger"
            }))
        }
    }
    for (O = L.minpitch; O < 1; O++) {
        if (O % 2 === 0 && !L.rest) {
            g.addChild(new ABCJS.write.RelativeElement(null, -2, this.glyphs.getSymbolWidth(U) + 4, O, {
                type: "ledger"
            }))
        }
    }
    for (O = 0; O < q.length; O++) {
        var C = this.glyphs.getSymbolWidth(U);
        if (V === "down") {
            C = -C
        }
        g.addChild(new ABCJS.write.RelativeElement(null, C - 2, this.glyphs.getSymbolWidth(U) + 4, q[O], {
            type: "ledger"
        }))
    }
    if (L.chord !== undefined) {
        for (O = 0; O < L.chord.length; O++) {
            var H = 0;
            var G;
            switch (L.chord[O].position) {
                case "left":
                    this.roomtaken += 7;
                    H = -this.roomtaken;
                    G = L.averagepitch;
                    g.addExtra(new ABCJS.write.RelativeElement(L.chord[O].name, H, this.glyphs.getSymbolWidth(L.chord[O].name[0]) + 4, G, {
                        type: "text"
                    }));
                    break;
                case "right":
                    this.roomtakenright += 4;
                    H = this.roomtakenright;
                    G = L.averagepitch;
                    g.addRight(new ABCJS.write.RelativeElement(L.chord[O].name, H, this.glyphs.getSymbolWidth(L.chord[O].name[0]) + 4, G, {
                        type: "text"
                    }));
                    break;
                case "below":
                    G = L.minpitch - 4;
                    if (G > -3) {
                        G = -3
                    }
                    var M = L.chord[O].name.split("\n");
                    for (var A = 0; A < M.length; A++) {
                        g.addChild(new ABCJS.write.RelativeElement(M[A], H, 0, G, {
                            type: "text"
                        }));
                        G -= 3
                    }
                    break;
                default:
                    if (L.chord[O].rel_position) {
                        g.addChild(new ABCJS.write.RelativeElement(L.chord[O].name, H + L.chord[O].rel_position.x, 0, L.minpitch + L.chord[O].rel_position.y / ABCJS.write.spacing.STEP, {
                            type: "text"
                        }))
                    } else {
                        g.addChild(new ABCJS.write.RelativeElement(L.chord[O].name, H, 0, 0, {
                            type: "chord"
                        }))
                    }
            }
        }
    }
    if (L.startTriplet) {
        this.triplet = new ABCJS.write.TripletElem(L.startTriplet, o, null, true);
        if (!S) {
            this.voice.addOther(this.triplet)
        }
    }
    if (L.endTriplet && this.triplet) {
        this.triplet.anchor2 = o;
        this.triplet = null;
        this.tripletmultiplier = 1
    }
    return g
};
ABCJS.write.Layout.prototype.printNoteHead = function(m, z, A, o, h, e, u, p, x, B) {
    var k = A.verticalPos;
    var d;
    var v;
    this.accidentalshiftx = 0;
    this.dotshiftx = 0;
    if (z === undefined) {
        m.addChild(new ABCJS.write.RelativeElement("pitch is undefined", 0, 0, 0, {
            type: "debug"
        }))
    } else {
        if (z === "") {
            d = new ABCJS.write.RelativeElement(null, 0, 0, k)
        } else {
            var n = h;
            if (A.printer_shift) {
                var r = (A.printer_shift === "same") ? 1 : 0;
                n = (o === "down") ? -this.glyphs.getSymbolWidth(z) * B + r : this.glyphs.getSymbolWidth(z) * B - r
            }
            d = new ABCJS.write.RelativeElement(z, n, this.glyphs.getSymbolWidth(z) * B, k, {
                scalex: B,
                scaley: B,
                extreme: ((o === "down") ? "below" : "above")
            });
            if (u) {
                var g = k + ((o === "down") ? -7 : 7) * B;
                if (B === 1 && (o === "down") ? (g > 6) : (g < 6)) {
                    g = 6
                }
                var q = (o === "down") ? h : h + d.w - 0.6;
                m.addRight(new ABCJS.write.RelativeElement(u, q, this.glyphs.getSymbolWidth(u) * B, g, {
                    scalex: B,
                    scaley: B
                }))
            }
            this.dotshiftx = d.w + x - 2 + 5 * p;
            for (; p > 0; p--) {
                var a = (1 - Math.abs(k) % 2);
                m.addRight(new ABCJS.write.RelativeElement("dots.dot", d.w + x - 2 + 5 * p, this.glyphs.getSymbolWidth("dots.dot"), k + a))
            }
        }
    }
    if (d) {
        d.highestVert = A.highestVert
    }
    if (A.accidental) {
        var b;
        switch (A.accidental) {
            case "quartersharp":
                b = "accidentals.halfsharp";
                break;
            case "dblsharp":
                b = "accidentals.dblsharp";
                break;
            case "sharp":
                b = "accidentals.sharp";
                break;
            case "quarterflat":
                b = "accidentals.halfflat";
                break;
            case "flat":
                b = "accidentals.flat";
                break;
            case "dblflat":
                b = "accidentals.dblflat";
                break;
            case "natural":
                b = "accidentals.nat"
        }
        var l = false;
        var w = e;
        for (var s = 0; s < this.accidentalSlot.length; s++) {
            if (k - this.accidentalSlot[s][0] >= 6) {
                this.accidentalSlot[s][0] = k;
                w = this.accidentalSlot[s][1];
                l = true;
                break
            }
        }
        if (l === false) {
            w -= (this.glyphs.getSymbolWidth(b) * B + 2);
            this.accidentalSlot.push([k, w]);
            this.accidentalshiftx = (this.glyphs.getSymbolWidth(b) * B + 2)
        }
        m.addExtra(new ABCJS.write.RelativeElement(b, w, this.glyphs.getSymbolWidth(b), k, {
            scalex: B,
            scaley: B
        }))
    }
    if (A.endTie) {
        if (this.ties[0]) {
            this.ties[0].anchor2 = d;
            this.ties = this.ties.slice(1, this.ties.length)
        }
    }
    if (A.startTie) {
        var t = new ABCJS.write.TieElem(d, null, (this.stemdir === "down" || o === "down") && this.stemdir !== "up", (this.stemdir === "down" || this.stemdir === "up"));
        this.ties[this.ties.length] = t;
        this.voice.addOther(t);
        m.startTie = true
    }
    if (A.endSlur) {
        for (v = 0; v < A.endSlur.length; v++) {
            var y = A.endSlur[v];
            var f;
            if (this.slurs[y]) {
                f = this.slurs[y].anchor2 = d;
                delete this.slurs[y]
            } else {
                f = new ABCJS.write.TieElem(null, d, o === "down", (this.stemdir === "up" || o === "down") && this.stemdir !== "down", this.stemdir);
                this.voice.addOther(f)
            }
            if (this.startlimitelem) {
                f.startlimitelem = this.startlimitelem
            }
        }
    }
    if (A.startSlur) {
        for (v = 0; v < A.startSlur.length; v++) {
            var y = A.startSlur[v].label;
            var f = new ABCJS.write.TieElem(d, null, (this.stemdir === "down" || o === "down") && this.stemdir !== "up", false);
            this.slurs[y] = f;
            this.voice.addOther(f)
        }
    }
    return d
};
ABCJS.write.Layout.prototype.printDecoration = function(l, k, t, n, a, r, f) {
    var q;
    var v;
    var j;
    var y;
    var s = [];
    var A = (k > 9) ? k + 3 : 12;
    var h;
    var o = false;
    var m = this.minY - 4;
    var x;
    a = a || 0;
    if (k === 5) {
        A = 14
    }
    var g = false;
    for (x = 0; x < l.length; x++) {
        if (l[x] === "staccato" || l[x] === "tenuto" || l[x] === "accent") {
            var u = "scripts." + l[x];
            if (l[x] === "accent") {
                u = "scripts.sforzato"
            }
            if (h === undefined) {
                h = (r === "down") ? k + 2 : f - 2
            } else {
                h = (r === "down") ? h + 2 : h - 2
            }
            if (l[x] === "accent") {
                if (r === "up") {
                    h--
                } else {
                    h++
                }
            } else {
                switch (h) {
                    case 2:
                    case 4:
                    case 6:
                    case 8:
                    case 10:
                        if (r === "up") {
                            h--
                        } else {
                            h++
                        }
                        break
                }
            }
            if (k > 9) {
                A++
            }
            var c = t / 2;
            if (this.glyphs.getSymbolAlign(u) !== "center") {
                c -= (this.glyphs.getSymbolWidth(q) / 2)
            }
            n.addChild(new ABCJS.write.RelativeElement(u, c, this.glyphs.getSymbolWidth(u), h))
        }
        if (l[x] === "slide" && n.heads[0]) {
            var z = n.heads[0].pitch;
            var d = new ABCJS.write.RelativeElement("", -a - 15, 0, z - 1);
            var b = new ABCJS.write.RelativeElement("", -a - 5, 0, z + 1);
            n.addChild(d);
            n.addChild(b);
            this.voice.addOther(new ABCJS.write.TieElem(d, b, false))
        }
    }
    if (h + 2 > A) {
        A = h + 2
    }
    for (x = 0; x < l.length; x++) {
        o = false;
        switch (l[x]) {
            case "trill":
                q = "scripts.trill";
                break;
            case "roll":
                q = "scripts.roll";
                break;
            case "irishroll":
                q = "scripts.roll";
                break;
            case "marcato":
                q = "scripts.umarcato";
                break;
            case "marcato2":
                q = "scriopts.dmarcato";
                break;
            case "turn":
                q = "scripts.turn";
                break;
            case "uppermordent":
                q = "scripts.prall";
                break;
            case "pralltriller":
                q = "scripts.prall";
                break;
            case "mordent":
            case "lowermordent":
                q = "scripts.mordent";
                break;
            case "staccato":
            case "accent":
            case "tenuto":
            case "slide":
                continue;
            case "downbow":
                q = "scripts.downbow";
                break;
            case "upbow":
                q = "scripts.upbow";
                break;
            case "fermata":
                q = "scripts.ufermata";
                break;
            case "invertedfermata":
                o = true;
                q = "scripts.dfermata";
                break;
            case "breath":
                q = ",";
                break;
            case "umarcato":
                q = "scripts.umarcato";
                break;
            case "coda":
                q = "scripts.coda";
                break;
            case "segno":
                q = "scripts.segno";
                break;
            case "/":
                v = ["flags.ugrace", 1];
                continue;
            case "//":
                v = ["flags.ugrace", 2];
                continue;
            case "///":
                v = ["flags.ugrace", 3];
                continue;
            case "////":
                v = ["flags.ugrace", 4];
                continue;
            case "p":
            case "mp":
            case "pp":
            case "ppp":
            case "pppp":
            case "f":
            case "ff":
            case "fff":
            case "ffff":
            case "sfz":
            case "mf":
                var w = new ABCJS.write.DynamicDecoration(n, l[x]);
                this.voice.addOther(w);
                continue;
            case "mark":
                g = true;
                continue;
            case "diminuendo(":
                ABCJS.write.Layout.prototype.startDiminuendoX = n;
                j = undefined;
                continue;
            case "diminuendo)":
                j = {
                    start: ABCJS.write.Layout.prototype.startDiminuendoX,
                    stop: n
                };
                ABCJS.write.Layout.prototype.startDiminuendoX = undefined;
                continue;
            case "crescendo(":
                ABCJS.write.Layout.prototype.startCrescendoX = n;
                y = undefined;
                continue;
            case "crescendo)":
                y = {
                    start: ABCJS.write.Layout.prototype.startCrescendoX,
                    stop: n
                };
                ABCJS.write.Layout.prototype.startCrescendoX = undefined;
                continue;
            default:
                s[s.length] = l[x];
                continue
        }
        if (o) {
            h = m;
            m -= 5
        } else {
            h = A;
            A += 5
        }
        var c = t / 2;
        if (this.glyphs.getSymbolAlign(q) !== "center") {
            c -= (this.glyphs.getSymbolWidth(q) / 2)
        }
        n.addChild(new ABCJS.write.RelativeElement(q, c, this.glyphs.getSymbolWidth(q), h))
    }
    if (v) {
        h = (r === "down") ? k + 1 : k + 9;
        c = t / 2;
        c += (r === "down") ? -5 : 3;
        for (var e = 0; e < v[1]; e++) {
            h -= 1;
            n.addChild(new ABCJS.write.RelativeElement(v[0], c, this.glyphs.getSymbolWidth(v[0]), h))
        }
    }
    if (j) {
        var p = new ABCJS.write.CrescendoElem(j.start, j.stop, ">");
        this.voice.addOther(p)
    }
    if (y) {
        var B = new ABCJS.write.CrescendoElem(y.start, y.stop, "<");
        this.voice.addOther(B)
    }
    if (s.length > 0) {
        n.addChild(new ABCJS.write.RelativeElement(s.join(","), 0, 0, 0, {
            type: "debug"
        }))
    }
    return g
};
ABCJS.write.Layout.prototype.printBarLine = function(c) {
    var i = new ABCJS.write.AbsoluteElement(c, 0, 10, "bar");
    var d = null;
    var j = 0;
    var a = (c.type === "bar_right_repeat" || c.type === "bar_dbl_repeat");
    var e = (c.type !== "bar_left_repeat" && c.type !== "bar_thick_thin" && c.type !== "bar_invisible");
    var f = (c.type === "bar_right_repeat" || c.type === "bar_dbl_repeat" || c.type === "bar_left_repeat" || c.type === "bar_thin_thick" || c.type === "bar_thick_thin");
    var g = (c.type === "bar_left_repeat" || c.type === "bar_thick_thin" || c.type === "bar_thin_thin" || c.type === "bar_dbl_repeat");
    var b = (c.type === "bar_left_repeat" || c.type === "bar_dbl_repeat");
    if (a || b) {
        for (var h in this.slurs) {
            if (this.slurs.hasOwnProperty(h)) {
                this.slurs[h].endlimitelem = i
            }
        }
        this.startlimitelem = i
    }
    if (a) {
        i.addRight(new ABCJS.write.RelativeElement("dots.dot", j, 1, 7));
        i.addRight(new ABCJS.write.RelativeElement("dots.dot", j, 1, 5));
        j += 6
    }
    if (e) {
        d = new ABCJS.write.RelativeElement(null, j, 1, 2, {
            type: "bar",
            pitch2: 10,
            linewidth: 0.6
        });
        i.addRight(d)
    }
    if (c.type === "bar_invisible") {
        d = new ABCJS.write.RelativeElement(null, j, 1, 2, {
            type: "none",
            pitch2: 10,
            linewidth: 0.6
        });
        i.addRight(d)
    }
    if (c.decoration) {
        this.printDecoration(c.decoration, 12, (f) ? 3 : 1, i, 0, "down", 2)
    }
    if (f) {
        j += 4;
        d = new ABCJS.write.RelativeElement(null, j, 4, 2, {
            type: "bar",
            pitch2: 10,
            linewidth: 4
        });
        i.addRight(d);
        j += 5
    }
    if (this.partstartelem && c.endEnding) {
        this.partstartelem.anchor2 = d;
        this.partstartelem = null
    }
    if (g) {
        j += 3;
        d = new ABCJS.write.RelativeElement(null, j, 1, 2, {
            type: "bar",
            pitch2: 10,
            linewidth: 0.6
        });
        i.addRight(d)
    }
    if (b) {
        j += 3;
        i.addRight(new ABCJS.write.RelativeElement("dots.dot", j, 1, 7));
        i.addRight(new ABCJS.write.RelativeElement("dots.dot", j, 1, 5))
    }
    if (c.startEnding) {
        this.partstartelem = new ABCJS.write.EndingElem(c.startEnding, d, null);
        this.voice.addOther(this.partstartelem)
    }
    return i
};
ABCJS.write.Layout.prototype.printClef = function(e) {
    var f = "clefs.G";
    var c = 0;
    var d = new ABCJS.write.AbsoluteElement(e, 0, 10, "staff-extra");
    switch (e.type) {
        case "treble":
            break;
        case "tenor":
            f = "clefs.C";
            break;
        case "alto":
            f = "clefs.C";
            break;
        case "bass":
            f = "clefs.F";
            break;
        case "treble+8":
            c = 1;
            break;
        case "tenor+8":
            f = "clefs.C";
            c = 1;
            break;
        case "bass+8":
            f = "clefs.F";
            c = 1;
            break;
        case "alto+8":
            f = "clefs.C";
            c = 1;
            break;
        case "treble-8":
            c = -1;
            break;
        case "tenor-8":
            f = "clefs.C";
            c = -1;
            break;
        case "bass-8":
            f = "clefs.F";
            c = -1;
            break;
        case "alto-8":
            f = "clefs.C";
            c = -1;
            break;
        case "none":
            f = "";
            break;
        case "perc":
            f = "clefs.perc";
            break;
        default:
            d.addChild(new ABCJS.write.RelativeElement("clef=" + e.type, 0, 0, 0, {
                type: "debug"
            }))
    }
    var b = 10;
    if (f !== "") {
        d.addRight(new ABCJS.write.RelativeElement(f, b, this.glyphs.getSymbolWidth(f), e.clefPos))
    }
    if (c !== 0) {
        var g = 2 / 3;
        var a = (this.glyphs.getSymbolWidth(f) - this.glyphs.getSymbolWidth("8") * g) / 2;
        d.addRight(new ABCJS.write.RelativeElement("8", b + a, this.glyphs.getSymbolWidth("8") * g, (c > 0) ? 16 : -2, {
            scalex: g,
            scaley: g
        }))
    }
    if (e.stafflines === 0) {
        this.stafflines = 0
    } else {
        this.stafflines = e.stafflines
    }
    return d
};
ABCJS.write.Layout.prototype.printKeySignature = function(c) {
    var b = new ABCJS.write.AbsoluteElement(c, 0, 10, "staff-extra");
    var a = 0;
    if (c.accidentals) {
        ABCJS.parse.each(c.accidentals, function(e) {
            var d = (e.acc === "sharp") ? "accidentals.sharp" : (e.acc === "natural") ? "accidentals.nat" : "accidentals.flat";
            b.addRight(new ABCJS.write.RelativeElement(d, a, this.glyphs.getSymbolWidth(d), e.verticalPos));
            a += this.glyphs.getSymbolWidth(d) + 2
        }, this)
    }
    this.startlimitelem = b;
    return b
};
ABCJS.write.Layout.prototype.printTimeSignature = function(c) {
    var b = new ABCJS.write.AbsoluteElement(c, 0, 20, "staff-extra");
    if (c.type === "specified") {
        for (var a = 0; a < c.value.length; a++) {
            if (a !== 0) {
                b.addRight(new ABCJS.write.RelativeElement("+", a * 20 - 9, this.glyphs.getSymbolWidth("+"), 7))
            }
            if (c.value[a].den) {
                b.addRight(new ABCJS.write.RelativeElement(c.value[a].num, a * 20, this.glyphs.getSymbolWidth(c.value[a].num.charAt(0)) * c.value[a].num.length, 9));
                b.addRight(new ABCJS.write.RelativeElement(c.value[a].den, a * 20, this.glyphs.getSymbolWidth(c.value[a].den.charAt(0)) * c.value[a].den.length, 5))
            } else {
                b.addRight(new ABCJS.write.RelativeElement(c.value[a].num, a * 20, this.glyphs.getSymbolWidth(c.value[a].num.charAt(0)) * c.value[a].num.length, 7))
            }
        }
    } else {
        if (c.type === "common_time") {
            b.addRight(new ABCJS.write.RelativeElement("timesig.common", 0, this.glyphs.getSymbolWidth("timesig.common"), 7))
        } else {
            if (c.type === "cut_time") {
                b.addRight(new ABCJS.write.RelativeElement("timesig.cut", 0, this.glyphs.getSymbolWidth("timesig.cut"), 7))
            }
        }
    }
    this.startlimitelem = b;
    return b
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.RelativeElement = function(f, b, a, e, d) {
    d = d || {};
    this.x = 0;
    this.c = f;
    this.dx = b;
    this.w = a;
    this.pitch = e;
    this.scalex = d.scalex || 1;
    this.scaley = d.scaley || 1;
    this.type = d.type || "symbol";
    this.pitch2 = d.pitch2;
    this.linewidth = d.linewidth;
    this.attributes = d.attributes;
    this.top = e + ((d.extreme === "above") ? 7 : 0);
    this.bottom = e - ((d.extreme === "below") ? 7 : 0)
};
ABCJS.write.RelativeElement.prototype.draw = function(b, a, c) {
    this.x = a + this.dx;
    switch (this.type) {
        case "symbol":
            if (this.c === null) {
                return null
            }
            this.graphelem = b.printSymbol(this.x, this.pitch, this.c, this.scalex, this.scaley, b.addClasses("symbol"));
            break;
        case "debug":
            this.graphelem = b.debugMsg(this.x, this.c);
            break;
        case "debugLow":
            this.graphelem = b.printLyrics(this.x, this.c);
            break;
        case "chord":
            this.graphelem = b.printText(this.x, this.pitch, this.c, "start", "chord");
            break;
        case "text":
            this.graphelem = b.printText(this.x, this.pitch, this.c, "start", "annotation");
            break;
        case "bar":
            this.graphelem = b.printStem(this.x, this.linewidth, b.calcY(this.pitch), (c) ? c : b.calcY(this.pitch2));
            break;
        case "stem":
            this.graphelem = b.printStem(this.x, this.linewidth, b.calcY(this.pitch), b.calcY(this.pitch2));
            break;
        case "ledger":
            this.graphelem = b.printStaveLine(this.x, this.x + this.w, this.pitch);
            break
    }
    if (this.scalex !== 1 && this.graphelem) {
        this.graphelem.scale(this.scalex, this.scaley, this.x, b.calcY(this.pitch))
    }
    if (this.attributes) {
        this.graphelem.attr(this.attributes)
    }
    return this.graphelem
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.StaffGroupElement = function() {
    this.voices = [];
    this.staffs = [];
    this.stafflines = []
};
ABCJS.write.StaffGroupElement.prototype.addVoice = function(c, b, a) {
    this.voices[this.voices.length] = c;
    if (!this.staffs[b]) {
        this.staffs[this.staffs.length] = {
            top: 0,
            highest: 7,
            lowest: 7
        };
        this.stafflines[this.stafflines.length] = a
    }
    c.staff = this.staffs[b]
};
ABCJS.write.StaffGroupElement.prototype.finished = function() {
    for (var a = 0; a < this.voices.length; a++) {
        if (!this.voices[a].layoutEnded()) {
            return false
        }
    }
    return true
};
ABCJS.write.StaffGroupElement.prototype.layout = function(h, f, a) {
    this.spacingunits = 0;
    this.minspace = 1000;
    var m = f.paddingleft * f.scale;
    var b = 0;
    for (var e = 0; e < this.voices.length; e++) {
        if (this.voices[e].header) {
            var q = f.paper.text(100 * f.scale, -10 * f.scale, this.voices[e].header).attr({
                "font-size": 12 * f.scale,
                "font-family": "serif",
                "font-weight": "bold"
            });
            b = Math.max(b, q.getBBox().width);
            q.remove()
        }
    }
    m = m + b * (1 / f.scale) * 1.1;
    this.startx = m;
    var d = 0;
    if (a) {
        console.log("init layout")
    }
    for (e = 0; e < this.voices.length; e++) {
        this.voices[e].beginLayout(m)
    }
    var l = 0;
    while (!this.finished()) {
        d = null;
        for (e = 0; e < this.voices.length; e++) {
            if (!this.voices[e].layoutEnded() && (!d || this.voices[e].getDurationIndex() < d)) {
                d = this.voices[e].getDurationIndex()
            }
        }
        if (a) {
            console.log("currentduration: ", d)
        }
        var o = [];
        var n = [];
        for (e = 0; e < this.voices.length; e++) {
            if (this.voices[e].getDurationIndex() !== d) {
                n.push(this.voices[e])
            } else {
                o.push(this.voices[e]);
                if (a) {
                    console.log("in: voice ", e)
                }
            }
        }
        l = 0;
        var p = 0;
        for (e = 0; e < o.length; e++) {
            if (o[e].getNextX() > m) {
                m = o[e].getNextX();
                l = o[e].getSpacingUnits();
                p = o[e].spacingduration
            }
        }
        this.spacingunits += l;
        this.minspace = Math.min(this.minspace, l);
        for (e = 0; e < o.length; e++) {
            var g = o[e].layoutOneItem(m, h);
            var r = g - m;
            if (r > 0) {
                m = g;
                for (var c = 0; c < e; c++) {
                    o[c].shiftRight(r)
                }
            }
        }
        for (e = 0; e < n.length; e++) {
            n[e].spacingduration -= p;
            n[e].updateNextX(m, h)
        }
        for (e = 0; e < o.length; e++) {
            var k = o[e];
            k.updateIndices()
        }
    }
    for (e = 0; e < this.voices.length; e++) {
        if (this.voices[e].getNextX() > m) {
            m = this.voices[e].getNextX();
            l = this.voices[e].getSpacingUnits()
        }
    }
    this.spacingunits += l;
    this.w = m;
    for (e = 0; e < this.voices.length; e++) {
        this.voices[e].w = this.w
    }
};
ABCJS.write.StaffGroupElement.prototype.draw = function(e, h) {
    this.y = h;
    for (var d = 0; d < this.staffs.length; d++) {
        var c = this.staffs[d].highest - ((d === 0) ? 20 : 15);
        var b = this.staffs[d].lowest - ((d === this.staffs.length - 1) ? 0 : 0);
        this.staffs[d].top = h;
        if (c > 0) {
            h += c * ABCJS.write.spacing.STEP
        }
        this.staffs[d].y = h;
        h += ABCJS.write.spacing.STAVEHEIGHT * 0.9;
        if (b < 0) {
            h -= b * ABCJS.write.spacing.STEP
        }
        this.staffs[d].bottom = h;
        if (this.stafflines[d] !== 0) {
            e.y = this.staffs[d].y;
            if (this.stafflines[d] === undefined) {
                this.stafflines[d] = 5
            }
            e.printStave(this.startx, this.w, this.stafflines[d])
        }
    }
    this.height = h - this.y;
    var g = 0;
    e.measureNumber = null;
    for (d = 0; d < this.voices.length; d++) {
        this.voices[d].draw(e, g);
        g = this.voices[d].barbottom
    }
    e.measureNumber = null;
    if (this.staffs.length > 1) {
        e.y = this.staffs[0].y;
        var f = e.calcY(10);
        e.y = this.staffs[this.staffs.length - 1].y;
        var a = e.calcY(2);
        e.printStem(this.startx, 0.6, f, a)
    }
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.TieElem = function(d, b, a, c) {
    this.anchor1 = d;
    this.anchor2 = b;
    this.above = a;
    this.force = c
};
ABCJS.write.TieElem.prototype.draw = function(c, e, a) {
    var d;
    var b;
    if (this.startlimitelem) {
        e = this.startlimitelem.x + this.startlimitelem.w
    }
    if (this.endlimitelem) {
        a = this.endlimitelem.x
    }
    if (!this.force && this.anchor2 && this.anchor2.pitch === this.anchor2.top) {
        this.above = true
    }
    if (this.anchor1) {
        e = this.anchor1.x;
        d = this.above ? this.anchor1.highestVert : this.anchor1.pitch;
        if (!this.anchor2) {
            b = this.above ? this.anchor1.highestVert : this.anchor1.pitch
        }
    }
    if (this.anchor2) {
        a = this.anchor2.x;
        b = this.above ? this.anchor2.highestVert : this.anchor2.pitch;
        if (!this.anchor1) {
            d = this.above ? this.anchor2.highestVert : this.anchor2.pitch
        }
    }
    c.drawArc(e, a, d, b, this.above)
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.TripletElem = function(d, c, b, a) {
    this.anchor1 = c;
    this.anchor2 = b;
    this.above = a;
    this.number = d
};
ABCJS.write.TripletElem.prototype.draw = function(d, g, c) {
    if (this.anchor1 && this.anchor2) {
        var f = this.above ? 16 : -1;
        if (this.anchor1.parent.beam && this.anchor1.parent.beam === this.anchor2.parent.beam) {
            var b = this.anchor1.parent.beam;
            this.above = b.asc;
            f = b.pos
        } else {
            this.drawLine(d, d.calcY(f))
        }
        var e = this.anchor1.x + this.anchor2.x;
        var a = 0;
        if (b) {
            if (this.above) {
                e += (this.anchor2.w + this.anchor1.w);
                a = 4
            } else {
                a = -4
            }
        } else {
            e += this.anchor2.w
        }
        d.printText(e / 2, f + a, this.number, "middle", "triplet").attr({
            "font-size": "10px",
            "font-style": "italic"
        })
    }
};
ABCJS.write.TripletElem.prototype.drawLine = function(c, e) {
    var b;
    var d = this.anchor1.x;
    b = ABCJS.write.sprintf("M %f %f L %f %f", d, e, d, e + 5);
    c.printPath({
        path: b,
        stroke: "#000000",
        "class": c.addClasses("triplet")
    });
    var a = this.anchor2.x + this.anchor2.w;
    b = ABCJS.write.sprintf("M %f %f L %f %f", a, e, a, e + 5);
    c.printPath({
        path: b,
        stroke: "#000000",
        "class": c.addClasses("triplet")
    });
    b = ABCJS.write.sprintf("M %f %f L %f %f", d, e, (d + a) / 2 - 5, e);
    c.printPath({
        path: b,
        stroke: "#000000",
        "class": c.addClasses("triplet")
    });
    b = ABCJS.write.sprintf("M %f %f L %f %f", (d + a) / 2 + 5, e, a, e);
    c.printPath({
        path: b,
        stroke: "#000000",
        "class": c.addClasses("triplet")
    })
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.VoiceElement = function(b, a) {
    this.children = [];
    this.beams = [];
    this.otherchildren = [];
    this.w = 0;
    this.duplicate = false;
    this.voicenumber = b;
    this.voicetotal = a
};
ABCJS.write.VoiceElement.prototype.addChild = function(c) {
    if (c.type === "bar") {
        var b = true;
        for (var a = 0; b && a < this.children.length; a++) {
            if (this.children[a].type !== "staff-extra") {
                b = false
            }
        }
        if (!b) {
            this.beams.push("bar");
            this.otherchildren.push("bar")
        }
    }
    this.children[this.children.length] = c
};
ABCJS.write.VoiceElement.prototype.addOther = function(a) {
    if (a instanceof ABCJS.write.BeamElem) {
        this.beams.push(a)
    } else {
        this.otherchildren.push(a)
    }
};
ABCJS.write.VoiceElement.prototype.updateIndices = function() {
    if (!this.layoutEnded()) {
        this.durationindex += this.children[this.i].duration;
        if (this.children[this.i].duration === 0) {
            this.durationindex = Math.round(this.durationindex * 64) / 64
        }
        this.i++
    }
};
ABCJS.write.VoiceElement.prototype.layoutEnded = function() {
    return (this.i >= this.children.length)
};
ABCJS.write.VoiceElement.prototype.getDurationIndex = function() {
    return this.durationindex - (this.children[this.i] && (this.children[this.i].duration > 0) ? 0 : 5e-7)
};
ABCJS.write.VoiceElement.prototype.getSpacingUnits = function() {
    return (this.minx < this.nextx) ? Math.sqrt(this.spacingduration * 8) : 0
};
ABCJS.write.VoiceElement.prototype.getNextX = function() {
    return Math.max(this.minx, this.nextx)
};
ABCJS.write.VoiceElement.prototype.beginLayout = function(a) {
    this.i = 0;
    this.durationindex = 0;
    this.ii = this.children.length;
    this.startx = a;
    this.minx = a;
    this.nextx = a;
    this.spacingduration = 0
};
ABCJS.write.VoiceElement.prototype.layoutOneItem = function(a, d) {
    var c = this.children[this.i];
    if (!c) {
        return 0
    }
    var b = a - this.minx;
    if (b < c.getExtraWidth()) {
        a += c.getExtraWidth() - b
    }
    c.x = a;
    this.spacingduration = c.duration;
    this.minx = a + c.getMinWidth();
    if (this.i !== this.ii - 1) {
        this.minx += c.minspacing
    }
    this.updateNextX(a, d);
    this.staff.highest = Math.max(c.top, this.staff.highest);
    this.staff.lowest = Math.min(c.bottom, this.staff.lowest);
    return a
};
ABCJS.write.VoiceElement.prototype.updateNextX = function(a, b) {
    this.nextx = a + (b * Math.sqrt(this.spacingduration * 8))
};
ABCJS.write.VoiceElement.prototype.shiftRight = function(a) {
    var b = this.children[this.i];
    if (!b) {
        return
    }
    b.x += a;
    this.minx += a;
    this.nextx += a
};
ABCJS.write.VoiceElement.prototype.draw = function(f, e) {
    var a = this.w - 1;
    f.y = this.staff.y;
    f.staffbottom = this.staff.bottom;
    this.barbottom = f.calcY(2);
    f.measureNumber = null;
    if (this.header) {
        var g = 12 - (this.voicenumber + 1) * (12 / (this.voicetotal + 1));
        var c = (this.startx - f.paddingleft) / 2 + f.paddingleft;
        c = c * f.scale;
        f.paper.text(c, f.calcY(g) * f.scale, this.header).attr({
            "font-size": 12 * f.scale,
            "font-family": "serif",
            "font-weight": "bold",
            "class": f.addClasses("staff-extra voice-name")
        })
    }
    for (var d = 0, h = this.children.length; d < h; d++) {
        var b = this.children[d];
        var k = false;
        if (b.type !== "staff-extra" && f.measureNumber === null) {
            f.measureNumber = 0;
            k = true
        }
        b.draw(f, (this.barto || d === h - 1) ? e : 0);
        if (b.type === "bar" && !k) {
            f.measureNumber++
        }
    }
    f.measureNumber = 0;
    ABCJS.parse.each(this.beams, function(i) {
        if (i === "bar") {
            f.measureNumber++
        } else {
            i.draw(f)
        }
    });
    f.measureNumber = 0;
    var j = this;
    ABCJS.parse.each(this.otherchildren, function(i) {
        if (i === "bar") {
            f.measureNumber++
        } else {
            i.draw(f, j.startx + 10, a)
        }
    })
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.spacing = function() {};
ABCJS.write.spacing.FONTEM = 360;
ABCJS.write.spacing.FONTSIZE = 30;
ABCJS.write.spacing.STEP = ABCJS.write.spacing.FONTSIZE * 93 / 720;
ABCJS.write.spacing.SPACE = 10;
ABCJS.write.spacing.TOPNOTE = 20;
ABCJS.write.spacing.STAVEHEIGHT = 100;
ABCJS.write.Printer = function(b, a) {
    a = a || {};
    this.y = 0;
    this.paper = b;
    this.space = 3 * ABCJS.write.spacing.SPACE;
    this.glyphs = new ABCJS.write.Glyphs();
    this.listeners = [];
    this.selected = [];
    this.ingroup = false;
    this.scale = a.scale || 1;
    this.staffwidth = a.staffwidth || 740;
    this.paddingtop = a.paddingtop || 15;
    this.paddingbottom = a.paddingbottom || 30;
    this.paddingright = a.paddingright || 50;
    this.paddingleft = a.paddingleft || 15;
    this.editable = a.editable || false;
    this.usingSvg = (SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? true : false);
    if (this.usingSvg && a.add_classes) {
        Raphael._availableAttrs["class"] = ""
    }
};
ABCJS.write.Printer.prototype.addClasses = function(b) {
    var a = [];
    if (b.length > 0) {
        a.push(b)
    }
    if (this.lineNumber !== null) {
        a.push("l" + this.lineNumber)
    }
    if (this.measureNumber !== null) {
        a.push("m" + this.measureNumber)
    }
    return a.join(" ")
};
ABCJS.write.Printer.prototype.notifySelect = function(b) {
    this.clearSelection();
    this.selected = [b];
    b.highlight();
    for (var a = 0; a < this.listeners.length; a++) {
        this.listeners[a].highlight(b.abcelem)
    }
};
ABCJS.write.Printer.prototype.notifyChange = function(b) {
    for (var a = 0; a < this.listeners.length; a++) {
        this.listeners[a].modelChanged()
    }
};
ABCJS.write.Printer.prototype.clearSelection = function() {
    for (var a = 0; a < this.selected.length; a++) {
        this.selected[a].unhighlight()
    }
    this.selected = []
};
ABCJS.write.Printer.prototype.addSelectListener = function(a) {
    this.listeners[this.listeners.length] = a
};
ABCJS.write.Printer.prototype.rangeHighlight = function(b, d) {
    this.clearSelection();
    for (var i = 0; i < this.staffgroups.length; i++) {
        var f = this.staffgroups[i].voices;
        for (var g = 0; g < f.length; g++) {
            var a = f[g].children;
            for (var c = 0; c < a.length; c++) {
                var h = a[c].abcelem.startChar;
                var e = a[c].abcelem.endChar;
                if ((d > h && b < e) || ((d === b) && d === e)) {
                    this.selected[this.selected.length] = a[c];
                    a[c].highlight()
                }
            }
        }
    }
};
ABCJS.write.Printer.prototype.beginGroup = function() {
    this.path = [];
    this.lastM = [0, 0];
    this.ingroup = true
};
ABCJS.write.Printer.prototype.addPath = function(c) {
    c = c || [];
    if (c.length === 0) {
        return
    }
    c[0][0] = "m";
    c[0][1] -= this.lastM[0];
    c[0][2] -= this.lastM[1];
    this.lastM[0] += c[0][1];
    this.lastM[1] += c[0][2];
    this.path.push(c[0]);
    for (var a = 1, b = c.length; a < b; a++) {
        if (c[a][0] === "m") {
            this.lastM[0] += c[a][1];
            this.lastM[1] += c[a][2]
        }
        this.path.push(c[a])
    }
};
ABCJS.write.Printer.prototype.endGroup = function(a) {
    this.ingroup = false;
    if (this.path.length === 0) {
        return null
    }
    var b = this.paper.path().attr({
        path: this.path,
        stroke: "none",
        fill: "#000000",
        "class": this.addClasses(a)
    });
    if (this.scale !== 1) {
        b.scale(this.scale, this.scale, 0, 0)
    }
    return b
};
ABCJS.write.Printer.prototype.printStaveLine = function(x1, x2, pitch) {
    var isIE =
        /*@cc_on!@*/
        false;
    var dy = 0.35;
    var fill = "#000000";
    if (isIE) {
        dy = 1;
        fill = "#666666"
    }
    var y = this.calcY(pitch);
    var pathString = ABCJS.write.sprintf("M %f %f L %f %f L %f %f L %f %f z", x1, y - dy, x2, y - dy, x2, y + dy, x1, y + dy);
    var ret = this.paper.path().attr({
        path: pathString,
        stroke: "none",
        fill: fill,
        "class": this.addClasses("staff")
    }).toBack();
    if (this.scale !== 1) {
        ret.scale(this.scale, this.scale, 0, 0)
    }
    return ret
};
ABCJS.write.Printer.prototype.printStem = function(x, dx, y1, y2) {
    if (dx < 0) {
        var tmp = y2;
        y2 = y1;
        y1 = tmp
    }
    var isIE =
        /*@cc_on!@*/
        false;
    var fill = "#000000";
    if (isIE && dx < 1) {
        dx = 1;
        fill = "#666666"
    }
    if (~~x === x) {
        x += 0.05
    }
    var pathArray = [
        ["M", x, y1],
        ["L", x, y2],
        ["L", x + dx, y2],
        ["L", x + dx, y1],
        ["z"]
    ];
    if (!isIE && this.ingroup) {
        this.addPath(pathArray)
    } else {
        var ret = this.paper.path().attr({
            path: pathArray,
            stroke: "none",
            fill: fill,
            "class": this.addClasses("stem")
        }).toBack();
        if (this.scale !== 1) {
            ret.scale(this.scale, this.scale, 0, 0)
        }
        return ret
    }
};
ABCJS.write.Printer.prototype.printText = function(a, e, d, c, f) {
    c = c || "start";
    var b = this.paper.text(a * this.scale, this.calcY(e) * this.scale, d).attr({
        "text-anchor": c,
        "font-size": 12 * this.scale,
        "class": this.addClasses(f)
    });
    return b
};
ABCJS.write.Printer.prototype.printSymbol = function(k, d, c, g, f, j) {
    var b;
    if (!c) {
        return null
    }
    if (c.length > 0 && c.indexOf(".") < 0) {
        var h = this.paper.set();
        var l = 0;
        for (var e = 0; e < c.length; e++) {
            var a = this.glyphs.getYCorr(c.charAt(e));
            b = this.glyphs.printSymbol(k + l, this.calcY(d + a), c.charAt(e), this.paper, j);
            if (b) {
                h.push(b);
                l += this.glyphs.getSymbolWidth(c.charAt(e))
            } else {
                this.debugMsg(k, "no symbol:" + c)
            }
        }
        if (this.scale !== 1) {
            h.scale(this.scale, this.scale, 0, 0)
        }
        return h
    } else {
        var a = this.glyphs.getYCorr(c);
        if (this.ingroup) {
            this.addPath(this.glyphs.getPathForSymbol(k, this.calcY(d + a), c, g, f))
        } else {
            b = this.glyphs.printSymbol(k, this.calcY(d + a), c, this.paper, j);
            if (b) {
                if (this.scale !== 1) {
                    b.scale(this.scale, this.scale, 0, 0)
                }
                return b
            } else {
                this.debugMsg(k, "no symbol:" + c)
            }
        }
        return null
    }
};
ABCJS.write.Printer.prototype.printPath = function(b) {
    var a = this.paper.path().attr(b);
    if (this.scale !== 1) {
        a.scale(this.scale, this.scale, 0, 0)
    }
    return a
};
ABCJS.write.Printer.prototype.drawArc = function(n, m, q, p, o) {
    n = n + 6;
    m = m + 4;
    q = q + ((o) ? 1.5 : -1.5);
    p = p + ((o) ? 1.5 : -1.5);
    var c = this.calcY(q);
    var b = this.calcY(p);
    var h = m - n;
    var g = b - c;
    var f = Math.sqrt(h * h + g * g);
    var e = h / f;
    var d = g / f;
    var u = f / 3.5;
    var i = ((o) ? -1 : 1) * Math.min(25, Math.max(4, u));
    var l = n + u * e - i * d;
    var t = c + u * d + i * e;
    var j = m - u * e - i * d;
    var r = b - u * d + i * e;
    var a = 2;
    var k = ABCJS.write.sprintf("M %f %f C %f %f %f %f %f %f C %f %f %f %f %f %f z", n, c, l, t, j, r, m, b, j - a * d, r + a * e, l - a * d, t + a * e, n, c);
    var s = this.paper.path().attr({
        path: k,
        stroke: "none",
        fill: "#000000",
        "class": this.addClasses("slur")
    });
    if (this.scale !== 1) {
        s.scale(this.scale, this.scale, 0, 0)
    }
    return s
};
ABCJS.write.Printer.prototype.debugMsg = function(a, b) {
    return this.paper.text(a, this.y, b).scale(this.scale, this.scale, 0, 0).attr({
        "class": this.addClasses("debug-msg")
    })
};
ABCJS.write.Printer.prototype.debugMsgLow = function(a, b) {
    return this.paper.text(a, this.calcY(this.layouter.minY - 7), b).attr({
        "font-family": "serif",
        "font-size": 12,
        "text-anchor": "begin",
        "class": this.addClasses("debug-msg")
    }).scale(this.scale, this.scale, 0, 0)
};
ABCJS.write.Printer.prototype.printLyrics = function(a, c) {
    var b = this.paper.text(a, this.calcY(this.layouter.minY - 7), c).attr({
        "font-family": "Times New Roman",
        "font-weight": "bold",
        "font-size": 14,
        "text-anchor": "begin",
        "class": this.addClasses("lyrics")
    }).scale(this.scale, this.scale, 0, 0);
    b[0].setAttribute("class", "abc-lyric");
    return b
};
ABCJS.write.Printer.prototype.calcY = function(a) {
    return this.y + ((ABCJS.write.spacing.TOPNOTE - a) * ABCJS.write.spacing.STEP)
};
ABCJS.write.Printer.prototype.printStave = function(a, d, b) {
    if (b === 1) {
        this.printStaveLine(a, d, 6);
        return
    }
    for (var c = 0; c < b; c++) {
        this.printStaveLine(a, d, (c + 1) * 2)
    }
};
ABCJS.write.Printer.prototype.printABC = function(a) {
    if (a[0] === undefined) {
        a = [a]
    }
    this.y = 0;
    for (var b = 0; b < a.length; b++) {
        this.printTune(a[b])
    }
};
ABCJS.write.Printer.prototype.printTempo = function(t, k, q, h, e, j) {
    var f = {
        "text-anchor": "start",
        "font-size": 12 * e.scale,
        "font-weight": "bold",
        "class": this.addClasses("tempo")
    };
    if (t.preString) {
        var o = k.text(j * e.scale, h * e.scale + 20 * e.scale, t.preString).attr(f);
        j += (o.getBBox().width + 20 * e.scale)
    }
    if (t.duration) {
        var g = 0.75 * e.scale;
        var w = 14.5;
        var a = t.duration[0];
        var n = new ABCJS.write.AbsoluteElement(t, a, 1, "tempo");
        var u = Math.floor(Math.log(a) / Math.log(2));
        var r = 0;
        for (var m = Math.pow(2, u), i = m / 2; m < a; r++, m += i, i /= 2) {}
        var z = q.chartable.note[-u];
        var v = q.chartable.uflags[-u];
        var p = q.printNoteHead(n, z, {
            verticalPos: w
        }, "up", 0, 0, v, r, 0, g);
        n.addHead(p);
        if (a < 1) {
            var d = w + 1 / 3 * g;
            var b = w + 7 * g;
            var l = p.dx + p.w;
            var s = -0.6 * e.scale;
            n.addExtra(new ABCJS.write.RelativeElement(null, l, 0, d, {
                type: "stem",
                pitch2: b,
                linewidth: s
            }))
        }
        n.x = j * (1 / e.scale);
        n.draw(e, null);
        j += (n.w + 5 * e.scale);
        o = k.text(j, h * e.scale + 20 * e.scale, "= " + t.bpm).attr(f);
        j += o.getBBox().width + 10 * e.scale
    }
    if (t.postString) {
        k.text(j, h * e.scale + 20 * e.scale, t.postString).attr(f)
    }
    h += 15 * e.scale;
    return h
};
ABCJS.write.Printer.prototype.printTune = function(abctune) {
    this.lineNumber = null;
    this.measureNumber = null;
    this.layouter = new ABCJS.write.Layout(this.glyphs, abctune.formatting.bagpipes);
    this.layouter.printer = this;
    if (abctune.media === "print") {
        var m = abctune.formatting.topmargin === undefined ? 54 : abctune.formatting.topmargin;
        this.y += m
    } else {
        this.y += this.paddingtop
    }
    if (abctune.formatting.staffwidth) {
        this.width = abctune.formatting.staffwidth
    } else {
        this.width = this.staffwidth
    }
    this.width += this.paddingleft;
    if (abctune.formatting.scale) {
        this.scale = abctune.formatting.scale
    }
    if (abctune.metaText.title) {
        this.paper.text(this.width * this.scale / 2, this.y, abctune.metaText.title).attr({
            "font-size": 20 * this.scale,
            "font-family": "serif",
            "class": this.addClasses("title meta-top")
        })
    }
    this.y += 20 * this.scale;
    if (abctune.lines[0] && abctune.lines[0].subtitle) {
        this.printSubtitleLine(abctune.lines[0]);
        this.y += 20 * this.scale
    }
    if (abctune.metaText.rhythm) {
        this.paper.text(this.paddingleft, this.y, abctune.metaText.rhythm).attr({
            "text-anchor": "start",
            "font-style": "italic",
            "font-family": "serif",
            "font-size": 12 * this.scale,
            "class": this.addClasses("meta-top")
        });
        !(abctune.metaText.author || abctune.metaText.origin || abctune.metaText.composer) && (this.y += 15 * this.scale)
    }
    var composerLine = "";
    if (abctune.metaText.composer) {
        composerLine += abctune.metaText.composer
    }
    if (abctune.metaText.origin) {
        composerLine += " (" + abctune.metaText.origin + ")"
    }
    if (composerLine.length > 0) {
        this.paper.text(this.width * this.scale, this.y, composerLine).attr({
            "text-anchor": "end",
            "font-style": "italic",
            "font-family": "serif",
            "font-size": 12 * this.scale,
            "class": this.addClasses("meta-top")
        });
        this.y += 15
    }
    if (abctune.metaText.author) {
        this.paper.text(this.width * this.scale, this.y, abctune.metaText.author).attr({
            "text-anchor": "end",
            "font-style": "italic",
            "font-family": "serif",
            "font-size": 12 * this.scale,
            "class": this.addClasses("meta-top")
        });
        this.y += 15
    }
    if (abctune.metaText.tempo && !abctune.metaText.tempo.suppress) {
        this.y = this.printTempo(abctune.metaText.tempo, this.paper, this.layouter, this.y, this, 50, -1);
        this.y += 20 * this.scale
    }
    this.staffgroups = [];
    var maxwidth = this.width;
    for (var line = 0; line < abctune.lines.length; line++) {
        this.lineNumber = line;
        var abcline = abctune.lines[line];
        if (abcline.staff) {
            staffgroup = this.printStaffLine(abctune, abcline, line);

            if (staffgroup.w > maxwidth) {
                maxwidth = staffgroup.w
            }
        } else {
            if (abcline.subtitle && line !== 0) {
                this.printSubtitleLine(abcline);
                this.y += 20 * this.scale
            } else {
                if (abcline.text) {
                    if (typeof abcline.text === "string") {
                        this.paper.text(100, this.y, "TEXT: " + abcline.text).attr({
                            "class": this.addClasses("defined-text")
                        })
                    } else {
                        var str = "";
                        for (var i = 0; i < abcline.text.length; i++) {
                            str += " FONT " + abcline.text[i].text
                        }
                        this.paper.text(100, this.y, "TEXT: " + str).attr({
                            "class": this.addClasses("defined-text")
                        })
                    }
                    this.y += 20 * this.scale
                }
            }
        }
    }
    this.lineNumber = null;
    this.measureNumber = null;
    var extraText = "";
    var text2;
    var height;
    if (abctune.metaText.partOrder) {
        extraText += "Part Order: " + abctune.metaText.partOrder + "\n"
    }
    if (abctune.metaText.unalignedWords) {
        for (var j = 0; j < abctune.metaText.unalignedWords.length; j++) {
            if (typeof abctune.metaText.unalignedWords[j] === "string") {
                extraText += abctune.metaText.unalignedWords[j] + "\n"
            } else {
                for (var k = 0; k < abctune.metaText.unalignedWords[j].length; k++) {
                    extraText += " FONT " + abctune.metaText.unalignedWords[j][k].text
                }
                extraText += "\n"
            }
        }
        text2 = this.paper.text(this.paddingleft * this.scale + 50 * this.scale, this.y * this.scale + 25 * this.scale, extraText).attr({
            "text-anchor": "start",
            "font-family": "serif",
            "font-size": 17 * this.scale,
            "class": this.addClasses("meta-bottom")
        });
        height = text2.getBBox().height + 17 * this.scale;
        text2.translate(0, height / 2);
        this.y += height;
        extraText = ""
    }
    if (abctune.metaText.book) {
        extraText += "Book: " + abctune.metaText.book + "\n"
    }
    if (abctune.metaText.source) {
        extraText += "Source: " + abctune.metaText.source + "\n"
    }
    if (abctune.metaText.discography) {
        extraText += "Discography: " + abctune.metaText.discography + "\n"
    }
    if (abctune.metaText.notes) {
        extraText += "Notes: " + abctune.metaText.notes + "\n"
    }
    if (abctune.metaText.transcription) {
        extraText += "Transcription: " + abctune.metaText.transcription + "\n"
    }
    if (abctune.metaText.history) {
        extraText += "History: " + abctune.metaText.history + "\n"
    }
    if (abctune.metaText["abc-copyright"]) {
        extraText += "Copyright: " + abctune.metaText["abc-copyright"] + "\n"
    }
    if (abctune.metaText["abc-creator"]) {
        extraText += "Creator: " + abctune.metaText["abc-creator"] + "\n"
    }
    if (abctune.metaText["abc-edited-by"]) {
        extraText += "Edited By: " + abctune.metaText["abc-edited-by"] + "\n"
    }
    text2 = this.paper.text(this.paddingleft, this.y * this.scale + 25 * this.scale, extraText).attr({
        "text-anchor": "start",
        "font-family": "serif",
        "font-size": 17 * this.scale,
        "class": this.addClasses("meta-bottom")
    });
    height = text2.getBBox().height;
    if (!height) {
        height = 25 * this.scale
    }
    text2.translate(0, height / 2);
    this.y += 25 * this.scale + height * this.scale;
    var sizetoset = {
        w: (maxwidth + this.paddingright) * this.scale,
        h: (this.y + this.paddingbottom) * this.scale
    };
    this.paper.setSize(sizetoset.w, sizetoset.h);
    var isIE =
        /*@cc_on!@*/
        false;
    if (isIE) {
        this.paper.canvas.parentNode.style.width = sizetoset.w + "px";
        this.paper.canvas.parentNode.style.height = "" + sizetoset.h + "px"
    } else {
        this.paper.canvas.parentNode.setAttribute("style", "width:" + sizetoset.w + "px")
    }
};
ABCJS.write.Printer.prototype.printSubtitleLine = function(a) {
    this.paper.text(this.width / 2, this.y, a.subtitle).attr({
        "font-size": 16,
        "class": "text meta-top"
    }).scale(this.scale, this.scale, 0, 0)
};

function centerWholeRests(b) {
    for (var e = 0; e < b.length; e++) {
        var g = b[e];
        for (var c = 1; c < g.children.length - 1; c++) {
            var a = g.children[c];
            if (a.abcelem.rest && a.abcelem.rest.type === "whole") {
                var f = g.children[c - 1];
                var h = g.children[c + 1];
                var d = (h.x - f.x) / 2 + f.x;
                a.x = d - a.w / 2
            }
        }
    }
}
ABCJS.write.Printer.prototype.printStaffLine = function(g, d, b) {
    var h = this.layouter.printABCLine(d.staff);
    var c = this.space;
    for (var f = 0; f < 3; f++) {
        h.layout(c, this, false);
        if (b && b === g.lines.length - 1 && h.w / this.width < 0.66 && !g.formatting.stretchlast) {
            break
        }
        var a = h.spacingunits * c;
        var e = h.w - a;
        if (h.spacingunits > 0) {
            c = (this.width - e) / h.spacingunits;
            if (c * h.minspace > 50) {
                c = 50 / h.minspace
            }
        }
    }
    centerWholeRests(h.voices);
    h.draw(this, this.y);
    this.staffgroups[this.staffgroups.length] = h;
    this.y = h.y + h.height;
    this.y += ABCJS.write.spacing.STAVEHEIGHT * 0.2;
    return h
};
if (!ABCJS) {
    ABCJS = {}
}
if (!ABCJS.write) {
    ABCJS.write = {}
}
ABCJS.write.sprintf = function() {
    var g = 0,
        e, h = arguments[g++],
        k = [],
        d, j, l, b;
    while (h) {
        if (d = /^[^\x25]+/.exec(h)) {
            k.push(d[0])
        } else {
            if (d = /^\x25{2}/.exec(h)) {
                k.push("%")
            } else {
                if (d = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(h)) {
                    if (((e = arguments[d[1] || g++]) == null) || (e == undefined)) {
                        throw ("Too few arguments.")
                    }
                    if (/[^s]/.test(d[7]) && (typeof(e) != "number")) {
                        throw ("Expecting number but found " + typeof(e))
                    }
                    switch (d[7]) {
                        case "b":
                            e = e.toString(2);
                            break;
                        case "c":
                            e = String.fromCharCode(e);
                            break;
                        case "d":
                            e = parseInt(e);
                            break;
                        case "e":
                            e = d[6] ? e.toExponential(d[6]) : e.toExponential();
                            break;
                        case "f":
                            e = d[6] ? parseFloat(e).toFixed(d[6]) : parseFloat(e);
                            break;
                        case "o":
                            e = e.toString(8);
                            break;
                        case "s":
                            e = ((e = String(e)) && d[6] ? e.substring(0, d[6]) : e);
                            break;
                        case "u":
                            e = Math.abs(e);
                            break;
                        case "x":
                            e = e.toString(16);
                            break;
                        case "X":
                            e = e.toString(16).toUpperCase();
                            break
                    }
                    e = (/[def]/.test(d[7]) && d[2] && e > 0 ? "+" + e : e);
                    l = d[3] ? d[3] == "0" ? "0" : d[3].charAt(1) : " ";
                    b = d[5] - String(e).length;
                    j = d[5] ? str_repeat(l, b) : "";
                    k.push(d[4] ? e + j : j + e)
                } else {
                    throw ("Huh ?!")
                }
            }
        }
        h = h.substring(d[0].length)
    }
    return k.join("")
};