var interface = require('../lib/Interface');

module.exports = function(elem){
    
    interface.ask("Please say the area code of your phone number", function(areaCodeSST){

        areaCodeTranscript = areaCodeSST.removeNonDigits();
        
        elem.value = areaCodeTranscript;
        
        if (areaCodeTranscript.length !== 3 && !isNaN(Number(areaCodeTranscript)))
            areaCodeSST.unclear("Your area code must be 3 digits long.");
        else{
            
            interface.ask("Please say the remaining 7 digits of your phone number", function(restSST){
                remainingTranscript = restSST.removeNonDigits();
                elem.value = areaCodeTranscript + remainingTranscript;
                
                if (remainingTranscript.length !== 7 || isNaN( +remainingTranscript ))
                    this.unclear();
                else
                    areaCodeSST.confirm (restSST.spellOut(areaCodeTranscript + remainingTranscript));
            });
        }
    });
};