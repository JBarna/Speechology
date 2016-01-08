$(document).ready(function(){
    
    if (Speechology.compatible){
        
        Speechology.addProfessor('myfield', function(elem){
            Speechology.ask("Say something for your field.", function(transcript){
                elem.value = transcript;
                this.confirm();
            });
        });

        Speechology.on('audioStart', function(text){
            console.log(text); 
        });
        
        myname = Speechology.parse('#name');
        email = Speechology.parse('#email');
        window.r = Speechology.parse(document);
    }
    
});