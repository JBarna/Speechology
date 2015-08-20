// webspeech
var speechology = (function(){
    "use strict";
    
    //check compatibility
    if (!('webkitSpeechRecognition' in window) || !('speechSynthesis' in window)){
        return {compatible: false};
    }
    
    
    //--------------------------------- variables --------------------------------
    var __professors = {};
    var __currentSpeechToText;
    var __currentTextToSpeech;
    var __isRunning = false; 
    var __currentSection = null;
    
    //callbacks
    var __callbacks = {
        'audioStart': [],
        'audioEnd': [],
        'voiceCaptureStart': [],
        'voiceCaptureEnd': [],
        'voiceCaptureResult': [],
    };

    // -------------------------------- private functions -------------------------
    var _log = console.log.bind(console, "SPEECHOLOGY DEBUG: ");
        
    var _emit = function(eventName){
        var args = Array.prototype.slice.call(arguments, 1);
        for (var cb of __callbacks[eventName]){
            if(cb.apply(null, args))
                return true;
        }
    };
    
    var _on = function(eventName, cb){
      
        if (typeof cb !== 'function'){
            throw new Error("callback for event " + eventName + " must be a function.");
            return;
        }
      
        var found = false;
      
        for (var event in __callbacks){
            if (event === eventName){
                found = true;
                __callbacks[event].push(cb);
            }
        }
      
        if (!found) throw new Error("Incorrect speechology.on event name: " + eventName);
    };
    
    var _endHelper = function(cb){
        return function(e){ 
            if (__isRunning) cb(e); 
        };
    };
    
    var _captureVoice = function(utteranceHandle, cb){
        var recognition = new webkitSpeechRecognition(); 
        var successfull = false;
        var notAllowed = false;
        var transcript; 
        
        var handle = {
            recognition: recognition,
            
            confirm: function(modifiedTranscript, yesCB){ 
                
                //since both arguments are optional... check to see if first one is function.
                if (typeof modifiedTranscript === "function"){
                    yesCB = modifiedTranscript;
                    modifiedTranscript = transcript;
                } else
                    modifiedTranscript = modifiedTranscript || transcript;
                
                _speak("I heard, " + modifiedTranscript + ". Is this correct? Say yes or no", true, 
                       function(transcript){
                    this.yesno(function(){ yesCB? yesCB() : speechology.next(); }, 
                                 function(){ utteranceHandle.speak(); }
                    );
                });
            },
            yesno: function(yesCB, noCB){
                if (transcript.indexOf('no') > -1)
                    noCB ? noCB() : _next();
                else if (transcript.indexOf('ye') > -1)
                    yesCB();
                else
                    handle.unclear();
            },
            
            unclear: function(message){
                _speak(message || "Sorry, I didn't catch that.", false, function(){ 
                    utteranceHandle.speak(); 
                }); 
            },
            //helper methods
            removeSpaces: function(stringInput){
                return stringInput.replace(/\s/g, '');
            },
            spellOut: function(stringInput){
                var spelled = "";
                for (var letter of stringInput)
                    spelled += ", " + letter;
                spelled += ", ";
                return spelled;
            },
            removeNonDigits: function(stringInput){
                return stringInput.replace(/[^0-9]+/g, '');  
            }
            
        };
        
        //set the start time
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
                    _speak("The microphone is blocked on this webpage. Please enable the microphone.");
                //TODO, the not allowed speech will play when you hit continue
                else if (e.timeStamp - recognition.startTime < 1000)
                    recognition.start();
                else
                    handle.unclear();
            }
        });
        
        recognition.start();
    };
    
    var _speak = function(textToSay, captureVoice, cb){
        var utterance = new SpeechSynthesisUtterance(textToSay);
        
        //handle for utterance
        var handle = {
            utterance: utterance,
            speak: function(){ 
                //must use a timeout or the onend function won't be called... its weird
                //relevant StackOverflow: http://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working#
                setTimeout(function(){ window.speechSynthesis.speak(utterance); }, 1000);
                __currentTextToSpeech = handle;
                __isRunning = true;
                _emit('audioStart', textToSay);
            },
            captureVoice: function(cb){ _captureVoice(handle, cb); },
            yesno: function(yes, no){ 
                _captureVoice(handle, function(){
                    this.yesno(yes, no);
                });
            }
        };
        
        utterance.onerror = function(e){ _log("utterance.onerror", e); };
        utterance.onend = _endHelper(function(){
            _emit("audioEnd");
            if (cb){
                if (captureVoice)
                    handle.captureVoice(cb);
                else
                    cb.call(handle);
            } else
                speechology.next();
        });
        
        handle.speak();
    };
    
    var _pause = function(){ 
        __isRunning = false;
        if (__currentSpeechToText)
            __currentSpeechToText.recognition.abort();
        speechSynthesis.cancel();
    };

    
    // --------------------------- section 'class' --------------------------------
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
        setTimeout(function(){ 
            __currentSection = _this;
            _this._next();
        }, 1000); 
    
    };
        
    Section.prototype._next = function(){
        if (this.__speechQueueIndex < this.__speechQueue.length){
            var fun = this.__speechQueue[this.__speechQueueIndex].fun;
            var elem = this.__speechQueue[this.__speechQueueIndex].element;
            fun(elem);
            
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
    
    //------------------------------- pre-built callbacks ------------------------------
    _on('voiceCaptureResult', function(transcript){
        if (transcript.indexOf('next') > -1){
            _next();
            return true;
        }
    });
    
    //------------------------------- public functions -----------------------------------
    var _interface = {
        speak: function(){
            _speak.apply(null, arguments);
        },
        
        parse: function(element, conditionalFunction){
            var save = element;
            
            console.log(element);
            
            if (typeof element === "string")
                element = document.querySelectorAll(element);
            
            //user passed a single element in, need to format to array
            else if (!element.length){
                element = [element];
            }
            
            if (element.length !== 0)
                return new Section(element, conditionalFunction);
            else
                console.error("No speechology elements found in: " , save); 
        },
        
        addProfessor: function(name, fun){
            __professors[name] = fun;
        },
        
        next: function(){
            console.log(__currentSection);
            if (__currentSection){
                __currentSection.__speechQueueIndex++;
                __currentSection._next();
            }
        },
        
        pause: function(){ _pause(); },
            
        continue: function(){ 
            if (__currentTextToSpeech)
                __currentTextToSpeech.speak();
        },
            
        on: function(){ _on.apply(null, arguments); },
        
        compatible: true
    };
    
    //------------------------------- pre-built professors -----------------------------
    _interface.addProfessor('name', function(elem){
        speechology.speak("Please spell your " + elem.getAttribute('data-name') + " name", true,
                      function(transcript){
            transcript = this.removeSpaces(transcript);
            elem.value = transcript;
            this.confirm(transcript + " spelled, " + this.spellOut(transcript));
        });
    });
    
    _interface.addProfessor('email', function(elem){
        speechology.speak("Please spell your email address up to the at symbol", true, 
                          function(firstTranscript){
            firstTranscript = this.removeSpaces(firstTranscript);
            elem.value = firstTranscript;
            this.confirm(this.spellOut(firstTranscript).replace(/\./g, "dot, "), function(){
                elem.value = (firstTranscript += '@');
                speechology.speak("Please say or spell the remaining part of your email address", true, 
                              function(lastTranscript){
                    lastTranscript = this.removeSpaces(lastTranscript.replace('at', ""));
                    elem.value = firstTranscript + lastTranscript;
                    this.confirm(lastTranscript.replace(/\./g, "dot, "));
                });
            });
        });     
    });
    
    _interface.addProfessor('phone-number', function(elem){
        speechology.speak("Please say the area code of your phone number", true, function(areaCodeTranscript){
            var saved = this;
            areaCodeTranscript = this.removeNonDigits(areaCodeTranscript);
            elem.value = areaCodeTranscript;
            if (areaCodeTranscript.length !== 3 && !isNaN(Number(areaCodeTranscript)))
                this.unclear("Your area code must be 3 digits long.");
            else{
                speechology.speak("Please say the remaining 7 digits of your phone number", true, function(remainingTranscript){
                    remainingTranscript = this.removeNonDigits(remainingTranscript);
                    elem.value = areaCodeTranscript + remainingTranscript;
                    if (remainingTranscript.length !== 7 && !isNaN(Number(remainingTranscript)))
                        this.unclear();
                    else
                        saved.confirm(this.spellOut(areaCodeTranscript + remainingTranscript));
                });
            }
        });
    });
    
    _interface.addProfessor('zipcode', function(elem){
        speechology.speak("Please say your zip code.", true, function(transcript){
            transcript = this.removeNonDigits(transcript).substring(0,5);
            elem.value = transcript;
            if (transcript.length === 5)
                this.confirm();
            else
                this.unclear();
        });
    });
    
    _interface.addProfessor("message", function(elem){
        speechology.speak("Would you like to add an additional message? Say yes or no.", true, function(t){
            this.yesno(function(){
                speechology.speak("Say your message now", true, function(messageTranscript){
                    var saved = this;
                    elem.value = messageTranscript;
                    speechology.speak("Would you like to play back the message?", true, function(transcript){
                        this.yesno(function(){
                            saved.confirm();
                        });
                    });
                });
            });
        });
    });
        
    return _interface;
})();