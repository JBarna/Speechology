var interface = require('../lib/Interface');

module.exports = function(elem){
    interface.ask("Please spell your " + (elem.getAttribute('data-name') || "") + " name", function( sst ){
        transcript = sst.removeSpaces();
        elem.value = transcript;
        sst.confirm(transcript + " spelled, " + sst.spellOut(transcript));
    });
};
