var interface = require('../lib/Interface');

module.exports = function( elem ){
    
    interface.ask("Would you like to add an additional message? Say yes or no.", function( sst ){
        sst.yesno(function( yes ){
            if ( yes ){
                interface.ask("Say your message now", function( messageSST ){
                    
                    elem.value = messageTranscript;
                    interface.ask("Would you like to play back the message?", function( sst ){
                        sst.yesno(function(){
                            messageSST.confirm();
                        });
                    });
                });
            } // end yes
        });
    });
};
