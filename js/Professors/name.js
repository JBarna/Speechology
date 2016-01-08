module.exports = function( _interface ){
    return function(elem){
        _interface.ask("Please spell your " + (elem.getAttribute('data-name') || "") + " name",
                      function(transcript){
            transcript = this.removeSpaces(transcript);
            elem.value = transcript;
            this.confirm(transcript + " spelled, " + this.spellOut(transcript));
        });
    };
}