module.exports = function( elem ){
    
    Speechology.speak("Would you like to add an additional message? Say yes or no.", true, function(t){
        this.yesno(function(){
            Speechology.speak("Say your message now", true, function(messageTranscript){
                var saved = this;
                elem.value = messageTranscript;
                Speechology.speak("Would you like to play back the message?", true, function(transcript){
                    this.yesno(function(){
                        saved.confirm();
                    });
                });
            });
        });
    });
});
