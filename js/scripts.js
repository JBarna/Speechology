$(document).ready(function(){
    
    if (speechology.compatible){
        
        speechology.addProfessor('myfield', function(elem){
            speechology.speak("Say something for your field.", true, function(transcript){
                elem.value = transcript;
                this.confirm();
            });
        });

        speechology.on('audioStart', function(text){
            console.log(text); 
        });
        
        myname = speechology.parse('#name');
        email = speechology.parse('#email');
        window.r = speechology.parse(document);r.
    }
});