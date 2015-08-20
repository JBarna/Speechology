// webspeech
var speechology = (function(){
    "use strict";
    
    //check compatibility
    if (!('webkitSpeechRecognition' in window) || !('speechSynthesis' in window)){
        return {compatible: false};
    }
    
    
    //--------------------------------- variables --------------------------------
    var __professors = {};
    var __parsed = false;
    var __currentSpeechToText;
    var __currentTextToSpeech;
    var __isRunning = false; 
    var __runningAsQueue = false;
    var __sectionQueue = [];
    var __sectionQueueIndex = 0;
    var __currentSection;
    
    //callbacks
    var __callbacks = {
        'audioStart': [],
        'audioEnd': [],
        'voiceCaptureStart': [],
        'voiceCaptureEnd': [],
        'voiceCaptureResult': [],
        'allFinished': []
    };

    // -------------------------------- private functions -------------------------
    var _log = console.log.bind(console, "SPEECHOLOGY DEBUG: ");
    
    var _addProfessor = function(name, fun){
        __professors[name] = fun;
    };   
        
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
    
    var _next = function(){
        if
        if (__speechQueueIndex < __speechQueue.length){
            var skip = __speechQueue[__speechQueueIndex].fun(__speechQueue[__speechQueueIndex].element);
            if (skip) _next();
        } else
            _emit('allFinished');
    };
    
    var _back = function(){ 
        __speechQueueIndex--;
        if (__speechQueueIndex >= 0){
            var skip = __speechQueue[__speechQueueIndex].fun(__speechQueue[__speechQueueIndex].element)
            if (skip) back();
        }
    };
    
    var _pause = function(){
        __isRunning = false;
        if (__currentSpeechToText)
            __currentSpeechToText.recognition.abort();
        speechSynthesis.cancel();
    };
    
    var _continue = function(){
        if (__currentTextToSpeech)
            __currentTextToSpeech.speak();
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
        
    
    // --------------------------- section 'class' --------------------------------
    function section(startingElem, conditionalFunction){
        this.__speechQueueIndex = -1;
        this.__speechQueue = [];
        this.__conditionalFunction = conditionalFunction;
        this.__onFinish = [];
        
        //add our speech elements to the queue
        this._parse(startingElem);
    }
        
    //parent elem is an array-like structure of elements
    section.prototype._parse = function(elementsToParse){
        
        var pushSpeech = function(elem){
            if (this.__professors.hasOwnProperty(elem.getAttribute('data-professor')))
                this.__speechQueue.push({fun: this.__professors[elem.getAttribute('data-professor')], element: elem});
            else
                console.error("unknown professor name", elem.getAttribute('data-professor'));
        };
        
        Array.prototype.forEach.call(elementsToParse, function(superElem){
            
            if (superElem.hasAttribute('data-professor'));
                pushSpeech(superElem);

            var subElements = superElem.querySelectorAll('[data-professor]');
            Array.prototype.forEach.call(subElements, function(elem){
                pushSpeech(elem);
            });
        });
    };
    
    section.prototype.run = function(){
        
        __currentSection = this;
    };
    
    section.prototype._next = function(){
        
    
    section.prototype.onFinish = function(cb){
        this.__onFinish.push(cb);
    }
    
    //------------------------------- pre-built professors -----------------------------
    _addProfessor('name', function(elem){
        speechology.speak("Please spell your " + elem.getAttribute('data-name') + " name", true,
                      function(transcript){
            transcript = this.removeSpaces(transcript);
            elem.value = transcript;
            this.confirm(transcript + " spelled, " + this.spellOut(transcript));
        });
    });
    
    _addProfessor('email', function(elem){
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
    
    _addProfessor('phone-number', function(elem){
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
    
    _addProfessor('zipcode', function(elem){
        speechology.speak("Please say your zip code.", true, function(transcript){
            transcript = this.removeNonDigits(transcript).substring(0,5);
            elem.value = transcript;
            if (transcript.length === 5)
                this.confirm();
            else
                this.unclear();
        });
    });
    
    _addProfessor("message", function(elem){
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
        
        parse: function(element){
            __parsed = true;
            
            if (typeof element === "string")
                element = document.querySelectorAll(element);
            
            //user passed a single element in, need to format to array
            else if (!element.length)
                element = [].push(element);
            
            if (element.length !== 0){
                
                
            
        },
        addProfessor: function(){
            _addProfessor.apply(null, arguments);
        },
        
        next: function(){
            _next();
        },
        
        start: function(){ 
            if (!__parsed)
                _interface.parse(document);
            
            __runningAsQueue = true;
            _next(); 
        },
        
        pause: function(){ _pause(); },
            
        continue: function(){ _continue(); },
            
        on: function(){ _on.apply(null, arguments); },
        
        compatible: true
    };
    return _interface;
})();