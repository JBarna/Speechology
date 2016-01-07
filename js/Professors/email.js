_interface.addProfessor('email', function(elem){
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
});