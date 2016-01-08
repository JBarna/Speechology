var interface = require('../parts/Interface');

module.exports = function( elem ){
    
    interface.ask("Would you like to add an additional message? Say yes or no.", function(t){
        this.yesno(function(){
            interface.ask("Say your message now", function(messageTranscript){
                var saved = this;
                elem.value = messageTranscript;
                interface.ask("Would you like to play back the message?", function(transcript){
                    this.yesno(function(){
                        saved.confirm();
                    });
                });
            });
        });
    });
};
