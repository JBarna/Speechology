module.exports = function(elem){
    Speechology.speak("Please say your zip code.", true, function(transcript){
        transcript = this.removeNonDigits(transcript).substring(0,5);
        elem.value = transcript;
        if (transcript.length === 5)
            this.confirm();
        else
            this.unclear();
    });
};