/*
Google Summer of Code 2012: Automagic Music Maker

Primarily written by Myles Borins
Strongly influenced by GSOC Mentor Colin Clark
Using the Infusion framework and Flocking Library

The Automagic Music Maker is distributed under the terms the MIT or GPL2 Licenses. 
Choose the license that best suits your project. The text of the MIT and GPL 
licenses are at the root of the Piano directory. 

*/

/*global jQuery, fluid, flock*/

var automm = automm || {};

(function () {
    "use strict";

    fluid.defaults("automm.arpeggiator", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "automm.arpeggiator.preInitFunction",
        postInitFunction: "automm.arpeggiator.postInitFunction",

        model: {
            interval: 500,
            scale: "major",
            mode: "ionian",
            pattern: [0, 2, 4],

            canon: {
                modes: {
                    ionian: 0,
                    dorian: 1,
                    phyrgian: 2,
                    lydian: 3,
                    mixolydian: 4,
                    aeolian: 5,
                    locrian: 6
                },
                scales: {
                    major: [2, 2, 1, 2, 2, 2, 1],
                    minor: [2, 2, 1, 2, 2, 1, 2]
                }
            }
        },

        events: {
            onNote: null,
            afterNote: null,
            metronomeEvent: null
        }
    });

    automm.arpeggiator.preInitFunction = function (that) {
        that.metronome = flock.enviro.shared.asyncScheduler;

        that.metronomeEvents = {};
        //  The below metronome are Web Workers running at a particular time interval
        //  They are by creating flock.
        // that.setMetronome = function (bpm) {
        //     
        // };

        that.startMetronome = function () {
            that.metronome.repeat(that.model.interval, that.events.metronomeEvent.fire);
        };

        that.stopMetronome = function () {
            that.motronome.clearRepeat(that.model.interval, that.events.metronomeEvent.fire);
        };

        that.startArpeggiator = function (root) {
            var count = 0,
                firstTime = true,

                metronomeEvent = function (root) {
                    var note = automm.whichNote(root, that.model.scales[that.model.scale],
                            that.model.modes[that.model.mode], that.model.pattern, count),
                        prevNote = count - 1;

                    if (prevNote === -1) {
                        prevNote = count.length - 1;
                    }

                    prevNote = automm.whichNote(root, that.model.scales[that.model.scale],
                            that.model.modes[that.model.mode], that.model.pattern, prevNote);

                    if (!firstTime) {
                        that.events.afterNote.fire(prevNote);
                    } else {
                        firstTime = false;
                    }

                    this.events.onNote.fire(note);

                    if (count > that.model.pattern.length) {
                        count = 0;
                    } else {
                        count = count + 1;
                    }
                };

            if (that.metronomeEvents[that.model.interval] === undefined) {
                that.metronomeEvents[that.model.interval] = [];
            }

            that.metronomeEvents[root].push(metronomeEvent);
        };

        that.stopArpeggiator = function (note) {
            fluid.each(that.metronomeEvents[note], function (event) {
                that.removeMetronomeEvent(event);
            });
            that.metronomeEvents.length = 0;
        };

        that.setMetronomeEvent = function (callback) {
            that.events.metronomeEvent.addListener(callback);
        };

        that.removeMetronomeEvent = function (callback) {
            that.metronomeEvent.removeListener(callback);
        };

        // that.onNote = function (note) {
        //     
        // };
        // 
        // that.afterNote = function (note) {
        //     
        // };

    };

    automm.relativeScale = function (scale, mode) {
        var relativeScale = [],
            i;
        for (i = 0; i < scale.length; i = i + 1) {
            if (i === 0) {
                relativeScale[i] = 0;
            } else {
                relativeScale[i] = relativeScale[i - 1] + scale[(i - 1 + mode) % scale.length];
            }
        }

        return relativeScale;
    };

    automm.whichNote = function (root, scale, mode, pattern, count) {
        var relativeScale = automm.relativeScale(scale, mode),
            note = root + relativeScale[pattern[count]];

        return note;
    };

    automm.arpeggiator.postInitFunction = function (that) {
        that.startMetronome();
        // that.applier.modelChanged.addListener("interval", function (newModel, oldModel, changeSpec) {
        //     var path = changeSpec[0].path,
        //         oscPath = that.options.paramMap[path];
        //     that.polysynth.input(oscPath, newModel[path]);
        // });
    };
}());