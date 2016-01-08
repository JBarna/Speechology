var interface = require('../parts/Interface');

module.exports = function(elem){
    
    interface.ask("Please say your zip code.", function(transcript){
        transcript = this.removeNonDigits(transcript).substring(0,5);
        elem.value = transcript;
        if (transcript.length === 5)
            this.confirm();
        else
            this.unclear();

    });
};