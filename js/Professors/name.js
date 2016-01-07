module.exports = function(elem){
    Speechology.speak("Please spell your " + (elem.getAttribute('data-name') || "") + " name", true,
                  function(transcript){
        transcript = this.removeSpaces(transcript);
        elem.value = transcript;
        this.confirm(transcript + " spelled, " + this.spellOut(transcript));
    });
};