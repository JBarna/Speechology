module.exports = function( _interface ){
    return function( elem ){
    
        _interface.ask("Would you like to add an additional message? Say yes or no.", function(t){
            this.yesno(function(){
                _interface.ask("Say your message now", function(messageTranscript){
                    var saved = this;
                    elem.value = messageTranscript;
                    _interface.ask("Would you like to play back the message?", function(transcript){
                        this.yesno(function(){
                            saved.confirm();
                        });
                    });
                });
            });
        });
    };
}