var interface = require('../parts/Interface');

module.exports = function(elem){
    interface.ask("Please spell your " + (elem.getAttribute('data-name') || "") + " name",
                  function(transcript){
        transcript = this.removeSpaces(transcript);
        elem.value = transcript;
        this.confirm(transcript + " spelled, " + this.spellOut(transcript));
    });
};
