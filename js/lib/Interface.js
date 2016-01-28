var vars = require('./Variables'),
    funcs = require('./Functions');

module.exports = {

    speak: function( text, cb ){
        return funcs.textToSpeech( text, false, cb );
    },

    ask: function( text, cb ){
        return funcs.textToSpeech( text, true, cb );
    },

    parse: function( selector ){
        
        var elements = funcs.handleQuerySelector( selector );
        
        if ( elements ) 
            return new funcs.section( elements );
    },

    addProfessor: function(name, fun){
        vars.professors[name] = fun;
    },

    next: funcs.next,

    disableNext: function(){
        vars.nextEnabled = false;
    },

    pause: funcs.pause,

    continue: function(){ 
        if (vars.currentTextToSpeech)
            vars.currentTextToSpeech.speak();
    },

    on: function(){ funcs.on.apply(null, arguments); },

    compatible: true
};