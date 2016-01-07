(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(elem){

    var question = elem.getAttribute('data-date');
    if (!question){
        console.error("Professor 'date' requires an additional attribute 'data-date' which specifies what question to ask the user. Moving to next question.");
        Speechology.next();
        return;
    }

    Speechology.speak(question, true, function(transcript){
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
                Speechology.speak("Please say the year you were born", true, function(transcript){
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
                Speechology.speak("Please say the month you were born.", true, function(transcript){
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
            Speechology.speak("Please say the day you were born.", true, function(transcript){
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
},{}],2:[function(require,module,exports){
module.exports = function(elem){
    Speechology.speak("Please spell your email address up to the at symbol", true, 
                      function(firstTranscript){
        firstTranscript = this.removeSpaces(firstTranscript);
        elem.value = firstTranscript;
        this.confirm(this.spellOut(firstTranscript).replace(/\./g, "dot, "), function(){
            elem.value = (firstTranscript += '@');
            Speechology.speak("Please say or spell the remaining part of your email address", true, 
                          function(lastTranscript){
                lastTranscript = this.removeSpaces(lastTranscript.replace('at', ""));
                elem.value = firstTranscript + lastTranscript;
                this.confirm(lastTranscript.replace(/\./g, "dot, "));
            });
        });
    });     
};
},{}],3:[function(require,module,exports){
module.exports = function( addProfessor ){
    
    addProfessor( 'date', require('./date') );
    addProfessor( 'email', require('./email') );
    addProfessor( 'message', require('./message') );
    addProfessor( 'name', require('./name') );
    addProfessor( 'phone', require('./phone') );
    addProfessor( 'zipcode', require('./zipcode') );
    
};
    
},{"./date":1,"./email":2,"./message":4,"./name":5,"./phone":6,"./zipcode":7}],4:[function(require,module,exports){
module.exports = function( elem ){
    
    Speechology.speak("Would you like to add an additional message? Say yes or no.", true, function(t){
        this.yesno(function(){
            Speechology.speak("Say your message now", true, function(messageTranscript){
                var saved = this;
                elem.value = messageTranscript;
                Speechology.speak("Would you like to play back the message?", true, function(transcript){
                    this.yesno(function(){
                        saved.confirm();
                    });
                });
            });
        });
    });
};

},{}],5:[function(require,module,exports){
module.exports = function(elem){
    Speechology.speak("Please spell your " + (elem.getAttribute('data-name') || "") + " name", true,
                  function(transcript){
        transcript = this.removeSpaces(transcript);
        elem.value = transcript;
        this.confirm(transcript + " spelled, " + this.spellOut(transcript));
    });
};
},{}],6:[function(require,module,exports){
module.exports = function(elem){
    Speechology.speak("Please say the area code of your phone number", true, function(areaCodeTranscript){
        var saved = this;
        areaCodeTranscript = this.removeNonDigits(areaCodeTranscript);
        elem.value = areaCodeTranscript;
        if (areaCodeTranscript.length !== 3 && !isNaN(Number(areaCodeTranscript)))
            this.unclear("Your area code must be 3 digits long.");
        else{
            Speechology.speak("Please say the remaining 7 digits of your phone number", true, function(remainingTranscript){
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
},{}],7:[function(require,module,exports){
module.exports = function(elem){
    Speechology.speak("Please say your zip code.", true, function(transcript){
        transcript = this.removeNonDigits(transcript).substring(0,5);
        elem.value = transcript;
        if (transcript.length === 5)
            this.confirm();
        else
            this.unclear();
    });
};
},{}],8:[function(require,module,exports){
module.exports = function( _interface ){
    
    _interface.on('voiceCaptureResult', function(transcript){
        if (transcript.indexOf('next') > -1){
            _interface.next();
            return true;
        }
    });
    
}
},{}],9:[function(require,module,exports){
module.exports = Section;

function Section(startingElem){
        this.__speechQueueIndex = 0;
        this.__speechQueue = [];
        this.__onFinish = [];
        
        //add our speech elements to the queue
        this._parse(startingElem);
    }
        
    //parent elem is an array-like structure of elements
    Section.prototype._parse = function(elementsToParse){
        var _this = this;
        
        var pushSpeech = function(elem){
            if (__professors.hasOwnProperty(elem.getAttribute('data-professor')))
                _this.__speechQueue.push({fun: __professors[elem.getAttribute('data-professor')], element: elem});
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
    
    Section.prototype.run = function(){
        var _this = this;
        _pause(); //cancel other speeches if they're going on.
        
        //wait until the other speeches' callbacks have run their course before starting again
        /* the reason we decriment the speechQueueIndex by 1 is because, if the voice was paused at any point, 
        and this is re-run, we want to start back at the last speech. */
        
        setTimeout(function(){ 
            __currentSection = _this;
            __nextEnabled = true;
            _this.__speechQueueIndex--;
            _this._next();
        }, 1000); 
    
    };
        
    Section.prototype._next = function(){
        this.__speechQueueIndex++;
        if (this.__speechQueueIndex < this.__speechQueue.length){
            var fun = this.__speechQueue[this.__speechQueueIndex].fun;
            var elem = this.__speechQueue[this.__speechQueueIndex].element;
            
            if (!elem.disabled)
                fun(elem);
            else
                this._next();
        } else {
            //emit the finished event
            for (cb of this.__onFinish){
                cb();
            }
        }
    };
    
    Section.prototype.onFinish = function(cb){
        this.__onFinish.push(cb);
    }
},{}],10:[function(require,module,exports){
// webspeech
var Speechology = (function(){
    "use strict";
    
    //use this variable to control debugging.
    var DEBUG = true;
    
    //check compatibility
    if (!('webkitSpeechRecognition' in window) || !('speechSynthesis' in window)){
        return { compatible: false };
    }
    
    //--------------------------------- variables --------------------------------
    var __professors = {};
    var __currentSpeechToText;
    var __currentTextToSpeech;
    var __isRunning = false; 
    var __currentSection = null;
    var __nextEnabled = true;
    var __lang = 'en-US';
    
    //callbacks
    var __callbacks = {
        'audioStart': [],
        'audioEnd': [],
        'voiceCaptureStart': [],
        'voiceCaptureEnd': [],
        'voiceCaptureResult': [],
    };

    // -------------------------------- private functions -------------------------
    var _log = DEBUG ? console.log.bind(console, "SPEECHOLOGY DEBUG: ") : function(){};
        
    var _emit = function(eventName){
        var args = Array.prototype.slice.call(arguments, 1);
        for (var cb of __callbacks[eventName]){
            
            // if user cb returns true, stop executing callbacks
            if(cb.apply(null, args))
                return true;
        }
    };
    
    var _on = function(eventName, cb){
      
        if (typeof eventName !== 'string')
            throw new Error("Event name " + eventName + " must be a string.");
        
        if (typeof cb !== 'function')
            throw new Error("Callback for event " + eventName + " must be a function.");
        
        if (!__callbacks.hasOwnProperty(eventName))
            throw new Error("Incorrect Speechology.on event name: " + eventName);
      
        __callbacks[eventName].push(cb);
      
    };
    
    /* ------------------
    * This is needed because when we "abort" a Speech to Text or
    * a Text to Speech, the end event still fires. We need a way
    * to know if we've aborted. So we make our own variable __isRunning  
    */ 
    var _endHelper = function(cb){
        return function(e){ 
            if (__isRunning) cb(e); 
        };
    };
    
    var _speechRecognition = function(utteranceHandle, cb){
        
        // Voice variables specific to this webkitSPeechRecognition instance
        var recognition = new webkitSpeechRecognition(); 
        recognition.lang = __lang;
        
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

                _textToSpeech("I heard, " + modifiedTranscript + ". Is this correct? Say yes or no", true, 
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
                _textToSpeech(message || "Sorry, I didn't catch that.", false, function(){
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
            __currentSpeechToText = handle;
            _emit('voiceCaptureStart');
        };
        
        
        recognition.onresult = _endHelper(function(event){
              for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal){
                    successfull = true;
                    transcript = event.results[i][0].transcript.toLowerCase();
                    if (!_emit('voiceCaptureResult', transcript, utteranceHandle, handle))
                        cb.call(handle, transcript);
                }
              }
          });
        
        recognition.onerror = _endHelper(function(e){
            if (event.error === "not-allowed")
                notAllowed = true;
        });
                
        
        //fallback if it didn't work
        recognition.onend = _endHelper(function(e){ 
            _emit("voiceCaptureEnd");
            if (!successfull){
                //sometimes on mobile phones, the onnomatch event is thrown immediately. 
                // in that case, we don't want to repeat ourselves, just start listening again.
                if (notAllowed)
                    _textToSpeech("The microphone is blocked on this webpage. Please enable the microphone.", false, function(){});
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
    
    var _textToSpeech = function(textToSay, weAreAsking , cb){
        
        var utterance = new SpeechSynthesisUtterance(textToSay);
        utterance.lang = __lang;
        
        //handle for utterance
        var handle = {
            utterance: utterance,
            speak: function(){ 
                
                // must use a timeout or the onend function won't be called... its weird
                // relevant StackOverflow: http://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working#
                
                setTimeout(function(){ 
                    window.speechSynthesis.speak(utterance); 
                    __currentTextToSpeech = handle;
                    __isRunning = true;
                    _emit('audioStart', textToSay);
                }, 1000);
            },
            
            captureVoice: function(cb){ return _speechRecognition(handle, cb); }
            
        };
        
        utterance.onerror = function(e){ _log("utterance.onerror", e); };
        
        utterance.onend = _endHelper(function(){
            
            _emit("audioEnd", textToSay);
            
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
    
    var _pause = function(){ 
        
        __isRunning = false;
        if (__currentSpeechToText)
            __currentSpeechToText.recognition.abort();
        
        speechSynthesis.cancel();
    };
    
    var _section = require('./parts/Section');

    //------------------------------- public functions -----------------------------------
    var _interface = {
        
        speak: function( text, cb ){
            return _textToSpeech( text, false, cb );
        },
        
        ask: function( text, cb ){
            return _textToSpeech( text, true, cb );
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
                return new _section(element);
            else
                console.error("No Speechology elements found in: " , save); 
        },
        
        addProfessor: function(name, fun){
            __professors[name] = fun;
        },
        
        next: function(){
            if (__nextEnabled && __currentSection)
                __currentSection._next();
            
        },
        
        disableNext: function(){
            __nextEnabled = false;
        },
        
        pause: function(){ _pause(); },
            
        continue: function(){ 
            if (__currentTextToSpeech)
                __currentTextToSpeech.speak();
        },
            
        on: function(){ _on.apply(null, arguments); },
        
        compatible: true
    };
    
    // --------------------- add ons --------------------------------------------------
    require('./Professors')(_interface.addProfessor);
    require('./parts/Pre-Built-callbacks')(_interface);
    
    
    return _interface;
        
})();
},{"./Professors":3,"./parts/Pre-Built-callbacks":8,"./parts/Section":9}]},{},[10]);
