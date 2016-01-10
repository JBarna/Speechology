// webspeech
window.Speechology = (function(){
    "use strict";
    
    //check compatibility
    if (!('webkitSpeechRecognition' in window) || !('speechSynthesis' in window)){
        return { compatible: false };
    }
    
    require('./Professors');
    require('./parts/Pre-Built-callbacks');
    
    return require('./parts/Interface');
        
})();