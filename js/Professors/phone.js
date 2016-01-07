_interface.addProfessor('phone-number', function(elem){
    Speechology.speak("Please say the area code of your phone number", true, function(areaCodeTranscript){
        var saved = this;
        areaCodeTranscript = this.removeNonDigits(areaCodeTranscript);
        elem.value = areaCodeTranscript;
        if (areaCodeTranscript.length !== 3 && !isNaN(Number(areaCodeTranscript)))
            this.unclear("Your area code must be 3 digits long.");
        else{
            Speechology.speak("Please say the remaining 7 digits of your phone number", true, function(remainingTranscript){
                remainingTranscript = this.removeNonDigits(remainingTranscript);
                elem.value = areaCodeTranscript + remainingTranscript;
                if (remainingTranscript.length !== 7 && !isNaN(Number(remainingTranscript)))
                    this.unclear();
                else
                    saved.confirm(this.spellOut(areaCodeTranscript + remainingTranscript));
            });
        }
    });
});