var interface = require('../lib/Interface');

module.exports = function(elem){
    
    interface.ask("Please spell your email address up to the at symbol", function(firstSST){
        
        firstTranscript = firstSST.removeSpaces();
        elem.value = firstTranscript;
        
        firstSST.confirm( firstSST.spellOut( firstTranscript ).replace(/\./g, "dot, "), function(){
            elem.value = (firstTranscript += '@');
            interface.ask("Please say or spell the remaining part of your email address", function(lastSST){
                
                // incase they say the "@" symbol... we already added it so just get rid of it
                var lastTranscript = lastSST.removeSpaces( lastSST.transcript.replace('at', ""));
                
                elem.value = firstTranscript + lastTranscript;
                this.confirm( lastTranscript.replace(/\./g, "dot, "));
            });
        });
    });     
};
