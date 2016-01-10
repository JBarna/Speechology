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