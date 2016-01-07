_interface.addProfessor('date', function(elem){

    var question = elem.getAttribute('data-date');
    if (!question){
        console.error("Professor 'date' requires an additional attribute 'data-date' which specifies what question to ask the user. Moving to next question.");
        Speechology.next();
        return;
    }

    Speechology.speak(question, true, function(transcript){
        var _this = this;
        var year, month, day;
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        //go through what the person said and split it up
        for (var part of transcript.split(' ')){
            //try to parse to int
            var num = parseInt(part);
            if (isNaN(num)){
                //look for month
                for (var monthIndex in months){
                      if (part.indexOf(months[monthIndex].toLowerCase()) > -1){
                          month = Number(monthIndex) + 1;
                          if (month < 10)
                              month = "0" + month;
                      }
                  }
            } else {
                if ((num + "").length === 4)
                    year = num;
                else{
                    day = num;
                    if (day < 10)
                        day = "0" + day;
                }
            }
        }     


        var finish = function(){
            var final = year + '-' + month + '-' + day;
            elem.value = final;
            _this.confirm(final);
        };


        //see what isn't defined... then ask.
        var findNextDatePart = function(){

            var getYear = function(){
                Speechology.speak("Please say the year you were born", true, function(transcript){
                    if (transcript.length === 4 && !isNaN(Number(transcript))){
                        this.confirm(transcript, function(){
                            year = Number(transcript);
                            findNextDatePart();
                        });
                    }
                    else
                        this.unclear("Your year of birth must be four digits.");
                });
            };

            var getMonth = function(){
                Speechology.speak("Please say the month you were born.", true, function(transcript){
                    var found = false;
                      //loop through all the available months in the picker

                      for (var monthIndex in months){
                          if (transcript.indexOf(months[monthIndex].toLowerCase()) > -1){
                              month = Number(monthIndex) + 1;
                              if (month < 10)
                                  month = "0" + month;
                              found = true;
                          }
                      }
                    if (found)
                        findNextDatePart();
                    else
                        this.unclear();
                });
            };

            var getDay = function(){
            Speechology.speak("Please say the day you were born.", true, function(transcript){
                      day = parseInt(transcript);
                      if (day !== NaN && day < 32){
                          if (day < 10)
                              day = "0" + day;
                          this.confirm(transcript, function(){
                              findNextDatePart();
                          });
                      } else
                          this.unclear("Please say two digits, representing the day you were born.");
                  });
            };

            if (!year)
                getYear();
            else if (!month)
                getMonth();
            else if (!day)
                getDay();
            else{
                finish();
            }
        };

        if (!year || !month || !day)
            findNextDatePart();
        else 
            finish();
    });
});