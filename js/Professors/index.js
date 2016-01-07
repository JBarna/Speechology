module.exports = function( addProfessor ){
    
    addProfessor( 'date', require('./date') );
    addProfessor( 'email', require('./email') );
    addProfessor( 'message', require('./message') );
    addProfessor( 'name', require('./name') );
    addProfessor( 'phone', require('./phone') );
    addProfessor( 'zipcode', require('./zipcode') );
    
};
    