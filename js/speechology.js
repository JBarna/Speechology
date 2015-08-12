// webspeech
var speechology = (function(){
    "use strict";
    //check compatibility
    if (!('webkitSpeechRecognition' in window) || !('speechSynthesis' in window)){
        return {compatible: false};
    }
     
    
    //--------------------------------- variables --------------------------------
    var __speechQueueIndex = -1;
    var __speechQueue = [];
    var __professors = {};
    var __parsed = false;
    
    //callbacks
    var __callbacks = {
        'audioStart': [],
        'audioEnd': [],
        'voiceRecStart': [],
        'voiceRecEnd': [],
        'voiceResult': [],
        'finished': []
    };

    // -------------------------------- private functions -------------------------
    var _log = console.log.bind(console, "SPEECHOLOGY DEBUG: ");
    
    var _addProfessor = function(name, fun){
        __professors[name] = fun;
    };
    
    
    var _emit = function(eventName){
        var args = Array.prototype.slice.call(arguments, 1);
        for (cb of callbacks[eventName]){
            if(cb.apply(null, args))
                return true;
        }
    };
    
    var _parse = function(parentElem){
        var elements = parentElem.querySelectorAll('[data-prof-of]');
        Array.prototype.forEach.call(elements, function(elem){
            __speechQueue.push({fun: __professors[elem.getAttribute('data-prof-of')], element: elem});
        });
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
                    noCB();
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
        };
        
        
        recognition.onresult = function(event){
              for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal){
                    successfull = true;
                    transcript = event.results[i][0].transcript.toLowerCase();
                    cb.call(handle, transcript);
                }
              }
          };
        
        
        recognition.onerror = function(e){
            if (event.error === "not-allowed")
                notAllowed = true;
        };
                
        
        //fallback if it didn't work
        recognition.onend = function(e){ 
            if (!successfull){
                //sometimes on mobile phones, the onnomatch event is thrown immediately. 
                // in that case, we don't want to repeat ourselves, just start listening again.
                if (notAllowed)
                    _speak("The microphone is blocked on this webpage. Please enable the microphone.");
                else if (e.timeStamp - recognition.startTime < 1000)
                    recognition.start();
                else
                    handle.unclear();
            }
        };
        
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
            },
            captureVoice: function(cb){ _captureVoice(handle, cb); },
            yesno: function(yes, no){ 
                _captureVoice(handle, function(){
                    this.yesno(yes, no);
                });
            }
        };
        
        utterance.onerror = function(e){ console.log(e); };
        utterance.onend = function(){
            if (cb){
                if (captureVoice)
                    handle.captureVoice(cb);
                else
                    cb.call(handle);
            } else
                speechology.next();
        };
        
        _log("Hello", "this is a text", utterance);
        handle.speak();
    };
        
    
    //------------------------------- pre-built professors -----------------------------
    _addProfessor('name', function(elem){
        speechology.speak("Please spell your " + elem.getAttribute('data-prof-name') + " name", true,
                      function(transcript){
            transcript = this.removeSpaces(transcript);
            elem.value = transcript;
            this.confirm(transcript + " spelled, " + this.spellOut(transcript));
        });
    });
    
    _addProfessor('email', function(elem){
        speechology.speak("Please spell your email address up to the at symbol", true, function(firstTranscript){
            elem.value = firstTranscript;
            this.confirm(this.spellOut(firstTranscript).replace(/\./g, "dot, "), function(){
                elem.value = (firstTranscript += '@');
                speechology.speak("Please say or spell the remaining part of your email address", true, 
                              function(lastTranscript){
                    elem.value = firstTranscript + lastTranscript;
                    this.confirm(lastTranscript.replace(/\./g, "dot, "));
                });
            });
        });     
    });
    
    
    
    //------------------------------- public functions -----------------------------------
    var _interface = {
        speak: function(textToSay, captureVoice, cb){
            _speak(textToSay, captureVoice, cb);
        },
            
        parse: function(path){
            __parsed = true;
            if (typeof path === "string"){
                var elements = document.querySelectorAll(path);
                Array.prototype.forEach.call(elements, function(elem){
                    _parse(elem);
                });
            } else 
                _parse(document);
            
        },
        addProfessor: function(helperName, helperFunction){
            _addProfessor(helperName, helperFunction);
        },
        
        next: function(){
            __speechQueueIndex++;
            if (__speechQueueIndex < __speechQueue.length){
                __speechQueue[__speechQueueIndex].fun(__speechQueue[__speechQueueIndex].element);
            }
        },
        
        start: function(){ 
            if (!__parsed)
                _interface.parse();
            
            _interface.next(); 
        },
        
        compatible: true
    };
    return _interface;
})();