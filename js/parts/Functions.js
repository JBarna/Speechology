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
    
    return {
        log: log,
        emit: emit,
        on: on,
        endHelper: endHelper,
        speechRecognition: speechRecognition,
        textToSpeech: textToSpeech,
        pause: pause,
        section: section
    };

})();
