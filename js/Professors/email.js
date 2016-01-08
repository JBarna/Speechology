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
