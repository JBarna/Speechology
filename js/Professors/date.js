var interface = require('../lib/Interface');

module.exports = function(elem){

    var question = elem.getAttribute('data-date');
    if (!question){
        console.error("Professor 'date' requires an additional attribute 'data-date' which specifies what question to ask the user. Moving to next question.");
        interface.next();
        return;
    }

    interface.ask(question, function(sst){
        
        var year, month, day;
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        //go through what the person said and split it up
        for (var part of sst.transcript.split(' ')){
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
            sst.confirm(final);
        };


        //see what isn't defined... then ask.
        var findNextDatePart = function(){

            var getYear = function(){
                interface.ask("Please say the year you were born", function(sst){
                    if (sst.transcript.length === 4 && !isNaN(Number(sst.transcript))){
                        sst.confirm(function(){
                            year = +sst.transcript;
                            findNextDatePart();
                        });
                    }
                    else
                        sst.unclear("Your year of birth must be four digits.");
                });
            };

            var getMonth = function(){
                interface.ask("Please say the month you were born.", function(sst){
                    var found = false;
                      //loop through all the available months in the picker

                      for (var monthIndex in months){
                          if (sst.transcript.indexOf(months[monthIndex].toLowerCase()) > -1){
                              month = Number(monthIndex) + 1;
                              if (month < 10)
                                  month = "0" + month;
                              found = true;
                          }
                      }
                    if (found)
                        findNextDatePart();
                    else
                        sst.unclear();
                });
            };

            var getDay = function(){
            interface.ask("Please say the day you were born.", function(sst){
                      day = +sst.transcript;
                      if (day !== NaN && day < 32){
                          if (day < 10)
                              day = "0" + day;
                          sst.confirm(function(){
                              findNextDatePart();
                          });
                      } else
                          sst.unclear("Please say two digits, representing the day you were born.");
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
};