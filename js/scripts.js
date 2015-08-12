$(document).ready(function(){
    
    speechology.addProfessor('myfield', function(elem){
        speechology.speak("Say something for your field.", true, function(transcript){
            elem.value = transcript;
            this.confirm();
        });
    });

    speechology.parse('#fff');
    speechology.start();
});