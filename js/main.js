// webspeech
window.Speechology = (function(){
    "use strict";
    
    //check compatibility
    if (!('webkitSpeechRecognition' in window) || !('speechSynthesis' in window)){
        return { compatible: false };
    }
    
    require('./Professors');
    require('./lib/Pre-Built-callbacks');
    
    return require('./lib/Interface');
        
})();