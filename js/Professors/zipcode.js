var interface = require('../lib/Interface');

module.exports = function(elem){
    
    interface.ask("Please say your zip code.", function( handle ){
        var transcript = handle.removeNonDigits().substring(0,5);
        elem.value = transcript;
        
        if (transcript.length === 5)
            handle.confirm();
        else
            handle.unclear();

    });
};