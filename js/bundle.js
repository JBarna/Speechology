(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var interface = require('../parts/Interface');

module.exports = function(elem){

    var question = elem.getAttribute('data-date');
    if (!question){
        console.error("Professor 'date' requires an additional attribute 'data-date' which specifies what question to ask the user. Moving to next question.");
        interface.next();
        return;
    }

    interface.ask(question, function(transcript){
        var _this = this;
        var year, month, day;
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        //go through what the person said and split it up
        for (var part of transcript.split(' ')){
            //try to parse to int
            var num = parseInt(part);
            if (isNaN(num)){
                //look for month
                for (var monthIndex in months){
                      if (part.indexOf(months[monthIndex].toLowerCase()) > -1){
                          month = Number(monthIndex) + 1;
                          if (month < 10)
                              month = "0" + month;
                      }
                  }
            } else {
                if ((num + "").length === 4)
                    year = num;
                else{
                    day = num;
                    if (day < 10)
                        day = "0" + day;
                }
            }
        }     


        var finish = function(){
            var final = year + '-' + month + '-' + day;
            elem.value = final;
            _this.confirm(final);
        };


        //see what isn't defined... then ask.
        var findNextDatePart = function(){

            var getYear = function(){
                interface.ask("Please say the year you were born", function(transcript){
                    if (transcript.length === 4 && !isNaN(Number(transcript))){
                        this.confirm(transcript, function(){
                            year = Number(transcript);
                            findNextDatePart();
                        });
                    }
                    else
                        this.unclear("Your year of birth must be four digits.");
                });
            };

            var getMonth = function(){
                interface.ask("Please say the month you were born.", function(transcript){
                    var found = false;
                      //loop through all the available months in the picker

                      for (var monthIndex in months){
                          if (transcript.indexOf(months[monthIndex].toLowerCase()) > -1){
                              month = Number(monthIndex) + 1;
                              if (month < 10)
                                  month = "0" + month;
                              found = true;
                          }
                      }
                    if (found)
                        findNextDatePart();
                    else
                        this.unclear();
                });
            };

            var getDay = function(){
            interface.ask("Please say the day you were born.", function(transcript){
                      day = parseInt(transcript);
                      if (day !== NaN && day < 32){
                          if (day < 10)
                              day = "0" + day;
                          this.confirm(transcript, function(){
                              findNextDatePart();
                          });
                      } else
                          this.unclear("Please say two digits, representing the day you were born.");
                  });
            };

            if (!year)
                getYear();
            else if (!month)
                getMonth();
            else if (!day)
                getDay();
            else{
                finish();
            }
        };

        if (!year || !month || !day)
            findNextDatePart();
        else 
            finish();
    });
};
},{"../parts/Interface":11}],2:[function(require,module,exports){
var interface = require('../parts/Interface');

module.exports = function(elem){
    interface.ask("Please spell your email address up to the at symbol", 
                      function(firstTranscript){
        firstTranscript = this.removeSpaces(firstTranscript);
        elem.value = firstTranscript;
        this.confirm(this.spellOut(firstTranscript).replace(/\./g, "dot, "), function(){
            elem.value = (firstTranscript += '@');
            interface.ask("Please say or spell the remaining part of your email address", 
                          function(lastTranscript){
                lastTranscript = this.removeSpaces(lastTranscript.replace('at', ""));
                elem.value = firstTranscript + lastTranscript;
                this.confirm(lastTranscript.replace(/\./g, "dot, "));
            });
        });
    });     
};

},{"../parts/Interface":11}],3:[function(require,module,exports){
var interface = require('../parts/Interface');

interface.addProfessor( 'date', require('./date') );
interface.addProfessor( 'email', require('./email') );
interface.addProfessor( 'message', require('./message') );
interface.addProfessor( 'name', require('./name') );
interface.addProfessor( 'phone', require('./phone') );
interface.addProfessor( 'zipcode', require('./zipcode') );

},{"../parts/Interface":11,"./date":1,"./email":2,"./message":4,"./name":5,"./phone":6,"./zipcode":7}],4:[function(require,module,exports){
var interface = require('../parts/Interface');

module.exports = function( elem ){
    
    interface.ask("Would you like to add an additional message? Say yes or no.", function(t){
        this.yesno(function(){
            interface.ask("Say your message now", function(messageTranscript){
                var saved = this;
                elem.value = messageTranscript;
                interface.ask("Would you like to play back the message?", function(transcript){
                    this.yesno(function(){
                        saved.confirm();
                    });
                });
            });
        });
    });
};

},{"../parts/Interface":11}],5:[function(require,module,exports){
var interface = require('../parts/Interface');

module.exports = function(elem){
    interface.ask("Please spell your " + (elem.getAttribute('data-name') || "") + " name",
                  function(transcript){
        transcript = this.removeSpaces(transcript);
        elem.value = transcript;
        this.confirm(transcript + " spelled, " + this.spellOut(transcript));
    });
};

},{"../parts/Interface":11}],6:[function(require,module,exports){
var interface = require('../parts/Interface');

module.exports = function(elem){
    interface.ask("Please say the area code of your phone number", function(areaCodeTranscript){
        var saved = this;
        areaCodeTranscript = this.removeNonDigits(areaCodeTranscript);
        elem.value = areaCodeTranscript;
        if (areaCodeTranscript.length !== 3 && !isNaN(Number(areaCodeTranscript)))
            this.unclear("Your area code must be 3 digits long.");
        else{
            interface.ask("Please say the remaining 7 digits of your phone number", function(remainingTranscript){
                remainingTranscript = this.removeNonDigits(remainingTranscript);
                elem.value = areaCodeTranscript + remainingTranscript;
                if (remainingTranscript.length !== 7 && !isNaN(Number(remainingTranscript)))
                    this.unclear();
                else
                    saved.confirm(this.spellOut(areaCodeTranscript + remainingTranscript));
            });
        }
    });
};
},{"../parts/Interface":11}],7:[function(require,module,exports){
var interface = require('../parts/Interface');

module.exports = function(elem){
    
    interface.ask("Please say your zip code.", function(transcript){
        transcript = this.removeNonDigits(transcript).substring(0,5);
        elem.value = transcript;
        if (transcript.length === 5)
            this.confirm();
        else
            this.unclear();

    });
};
},{"../parts/Interface":11}],8:[function(require,module,exports){
module.exports = function( size ){
    
    return ["data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='",
            size,
            "' height='",
            size,
            "' viewBox='0 0 512 512'%3E%3Cpath d='M256 353.5c43.7 0 79-37.5 79-83.5V115.5c0-46-35.3-83.5-79-83.5s-79 37.5-79 83.5V270c0 46 35.3 83.5 79 83.5z'/%3E%3Cpath d='M367 192v79.7c0 60.2-49.8 109.2-110 109.2s-110-49-110-109.2V192h-19v79.7c0 67.2 53 122.6 120 127.5V462h-73v18h161v-18h-69v-62.8c66-4.9 117-60.3 117-127.5V192h-17z'/%3E%3C/svg%3E"].join("");
    
}
},{}],9:[function(require,module,exports){
// webspeech
window.Speechology = (function(){
    "use strict";
    
    //check compatibility
    if (!('webkitSpeechRecognition' in window) || !('speechSynthesis' in window)){
        return { compatible: false };
    }
    
    require('./Professors');
    require('./parts/Pre-Built-callbacks');
    
    return require('./parts/Interface');
        
})();
},{"./Professors":3,"./parts/Interface":11,"./parts/Pre-Built-callbacks":12}],10:[function(require,module,exports){
module.exports = (function(){
    
    var vars = require('./Variables');

    var log = vars.DEBUG ? console.log.bind(console, "SPEECHOLOGY DEBUG: ") : function(){};

    var emit = function(eventName){
        var args = Array.prototype.slice.call(arguments, 1);
        for (var cb of vars.callbacks[eventName]){

            // if user cb returns true, stop executing callbacks
            if(cb.apply(null, args))
                return true;
        }
    };

    var on = function(eventName, cb){

        if (typeof eventName !== 'string')
            throw new Error("Event name " + eventName + " must be a string.");

        if (typeof cb !== 'function')
            throw new Error("Callback for event " + eventName + " must be a function.");

        if (!vars.callbacks.hasOwnProperty(eventName))
            throw new Error("Incorrect Speechology.on event name: " + eventName);

        vars.callbacks[eventName].push(cb);

    };

    /* ------------------
    * This is needed because when we "abort" a Speech to Text or
    * a Text to Speech, the end event still fires. We need a way
    * to know if we've aborted. So we make our own variable vars.isRunning  
    */ 
    var endHelper = function(cb){
        return function(e){ 
            if (vars.isRunning) cb(e); 
        };
    };

    var speechRecognition = function(utteranceHandle, cb){

        // Voice variables specific to this webkitSPeechRecognition instance
        var recognition = new webkitSpeechRecognition(); 
        recognition.lang = vars.lang;

        var successfull = false;
        var notAllowed = false;
        var transcript; 

        var handle = {
            recognition: recognition,

            confirm: function(modifiedTranscript, yesCB){ 

                // since both arguments are optional... check to see if first one is function.
                if (typeof modifiedTranscript === "function"){
                    yesCB = modifiedTranscript;
                    modifiedTranscript = transcript;
                } else
                    modifiedTranscript = modifiedTranscript || transcript;

                textToSpeech("I heard, " + modifiedTranscript + ". Is this correct? Say yes or no", true, 
                       function(transcript){
                    this.yesno(function(){ yesCB? yesCB() : Speechology.next(); }, 
                                 function(){ utteranceHandle.speak(); }
                    );
                });
            },
            yesno: function(yesCB, noCB){
                if (transcript.indexOf('no') > -1)
                    noCB ? noCB() : Speechology.next();
                else if (transcript.indexOf('ye') > -1)
                    yesCB();
                else
                    handle.unclear();
            },

            unclear: function(message){
                textToSpeech(message || "Sorry, I didn't catch that.", false, function(){
                    utteranceHandle.speak(); 
                }); 
            },
            //helper methods
            removeSpaces: function(stringInput){
                stringInput = stringInput || transcript;
                return stringInput.replace(/\s/g, '');
            },
            spellOut: function(stringInput){
                stringInput = stringInput || transcript;
                var spelled = "";
                for (var letter of stringInput)
                    spelled += ", " + letter;
                spelled += ", ";
                return spelled;
            },
            removeNonDigits: function(stringInput){
                stringInput = stringInput || transcript;
                return stringInput.replace(/[^0-9]+/g, '');  
            }

        };

        // set the start time
        recognition.onstart = function(e){ 
            recognition.startTime = e.timeStamp; 
            vars.currentSpeechToText = handle;
            emit('voiceCaptureStart');
        };


        recognition.onresult = endHelper(function(event){
              for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal){
                    successfull = true;
                    transcript = event.results[i][0].transcript.toLowerCase();
                    if (!emit('voiceCaptureResult', transcript, utteranceHandle, handle))
                        cb.call(handle, transcript);
                }
              }
          });

        recognition.onerror = endHelper(function(e){
            if (event.error === "not-allowed")
                notAllowed = true;
        });


        //fallback if it didn't work
        recognition.onend = endHelper(function(e){ 
            emit("voiceCaptureEnd");
            if (!successfull){
                //sometimes on mobile phones, the onnomatch event is thrown immediately. 
                // in that case, we don't want to repeat ourselves, just start listening again.
                if (notAllowed)
                    textToSpeech("The microphone is blocked on this webpage. Please enable the microphone.", false, function(){});
                //TODO, the not allowed speech will play when you hit continue
                else if (e.timeStamp - recognition.startTime < 1000)
                    recognition.start();
                else
                    handle.unclear();
            }
        });

        recognition.start();
        return recognition;
    };

    var textToSpeech = function(textToSay, weAreAsking , cb){

        var utterance = new SpeechSynthesisUtterance(textToSay);
        utterance.lang = vars.lang;

        //handle for utterance
        var handle = {
            utterance: utterance,
            speak: function(){ 

                // must use a timeout or the onend function won't be called... its weird
                // relevant StackOverflow: http://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working#

                setTimeout(function(){ 
                    window.speechSynthesis.speak(utterance); 
                    vars.currentTextToSpeech = handle;
                    vars.isRunning = true;
                    emit('audioStart', textToSay);
                }, 1000);
            },

            captureVoice: function(cb){ return speechRecognition(handle, cb); }

        };

        utterance.onerror = function(e){ log("utterance.onerror", e); };

        utterance.onend = endHelper(function(){

            emit("audioEnd", textToSay);

            if (cb){

                if (weAreAsking)
                    handle.captureVoice(cb);

                else
                    cb.call(handle);

            } else
                Speechology.next();
        });

        handle.speak();
        return utterance;
    };

    var pause = function(){ 

        vars.isRunning = false;
        if (vars.currentSpeechToText)
            vars.currentSpeechToText.recognition.abort();

        speechSynthesis.cancel();
    };

    var section = function( startingElem ){
        this.speechQueueIndex = 0;
        this.speechQueue = [];
        this.onFinish = [];

        //add our speech elements to the queue
        this.parse(startingElem);
    }

    // parent elem is an array-like structure of elements
    section.prototype.parse = function(elementsToParse){
        var _this = this;

        var pushSpeech = function(elem){
            if (vars.professors.hasOwnProperty(elem.getAttribute('data-professor')))
                _this.speechQueue.push({fun: vars.professors[elem.getAttribute('data-professor')], element: elem});
            else
                console.error("unknown professor name", elem.getAttribute('data-professor'));
        };

        Array.prototype.forEach.call(elementsToParse, function(superElem){

            if (superElem.hasAttribute && superElem.hasAttribute('data-professor'))
                pushSpeech(superElem);

            var subElements = superElem.querySelectorAll('[data-professor]');
            Array.prototype.forEach.call(subElements, function(elem){
                pushSpeech(elem);
            });
        });
    };

    section.prototype.run = function(){
        var _this = this;
        pause(); //cancel other speeches if they're going on.

        //wait until the other speeches' callbacks have run their course before starting again
        /* the reason we decriment the speechQueueIndex by 1 is because, if the voice was paused at any point, 
        and this is re-run, we want to start back at the last speech. */

        setTimeout(function(){ 
            currentSection = _this;
            nextEnabled = true;
            _this.speechQueueIndex--;
            _this.next();
        }, 1000); 

    };

    section.prototype.next = function(){
        this.speechQueueIndex++;
        if (this.speechQueueIndex < this.speechQueue.length){
            var fun = this.speechQueue[this.speechQueueIndex].fun;
            var elem = this.speechQueue[this.speechQueueIndex].element;

            if (!elem.disabled)
                fun(elem);
            else
                this.next();
        } else {
            //emit the finished event
            for (cb of this.onFinish){
                cb();
            }
        }
    };

    section.prototype.onFinish = function(cb){
        this.onFinish.push(cb);
    }
    
    var addImage = function(input){
        
        // grab position info on input elem
        var dems = input.getBoundingClientRect(),
            offset = dems.height / 4;
        
        // create new element
        var newElm = document.createElement('img');
        
        newElm.style.position = "absolute";
        newElm.style.left = dems.left + dems.width - (offset * 3) + "px";
        newElm.style.top = dems.top + offset + "px";
        
        newElm.src = require('../images/mic_off')(offset * 2);
        
        document.body.appendChild(newElm);
        
    }
    
    return {
        log: log,
        emit: emit,
        on: on,
        endHelper: endHelper,
        speechRecognition: speechRecognition,
        textToSpeech: textToSpeech,
        pause: pause,
        section: section,
        addImage: addImage
    };

})();

},{"../images/mic_off":8,"./Variables":13}],11:[function(require,module,exports){
var vars = require('./Variables'),
    funcs = require('./Functions');

module.exports = {

    speak: function( text, cb ){
        return funcs.textToSpeech( text, false, cb );
    },

    ask: function( text, cb ){
        return funcs.textToSpeech( text, true, cb );
    },

    parse: function(element){
        var save = element;

        if (element == null || element === "document")
            element = [document];

        else if (typeof element === "string")
            element = document.querySelectorAll(element);

        // user passed a single element in, need to format to array
        else if (!element.length)
            element = [element];

        if (element.length !== 0)
            return new funcs.section(element);
        else
            console.error("No Speechology elements found in: " , save); 
    },

    addProfessor: function(name, fun){
        vars.professors[name] = fun;
    },

    next: function(){
        if (vars.nextEnabled && vars.currentSection)
            vars.currentSection.funcs.next();

    },

    disableNext: function(){
        vars.nextEnabled = false;
    },

    pause: function(){ funcs.pause(); },

    continue: function(){ 
        if (vars.currentTextToSpeech)
            vars.currentTextToSpeech.speak();
    },

    on: function(){ funcs.on.apply(null, arguments); },
    
    addImage: funcs.addImage,

    compatible: true
};
},{"./Functions":10,"./Variables":13}],12:[function(require,module,exports){
module.exports = function( _interface ){
    
    _interface.on('voiceCaptureResult', function(transcript){
        if (transcript.indexOf('next') > -1){
            _interface.next();
            return true;
        }
    });
    
}
},{}],13:[function(require,module,exports){
// variables to be shared with the project

exports.professors = {};
exports.currentSpeechToText;
exports.currentTextToSpeech;
exports.isRunning = false; 
exports.currentSection = null;
exports.nextEnabled = true;
exports.lang = 'en-US';
exports.DEBUG = true;

//callbacks
exports.callbacks = {
    'audioStart': [],
    'audioEnd': [],
    'voiceCaptureStart': [],
    'voiceCaptureEnd': [],
    'voiceCaptureResult': [],
};
},{}]},{},[9]);
