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