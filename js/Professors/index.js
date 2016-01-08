module.exports = function( _interface ){
    
    addProfessor( 'date', require('./date')( _interface ) );
    addProfessor( 'email', require('./email')( _interface )  );
    addProfessor( 'message', require('./message')( _interface ) );
    addProfessor( 'name', require('./name')( _interface) );
    addProfessor( 'phone', require('./phone') ( _interface) );
    addProfessor( 'zipcode', require('./zipcode')(_interface) );
    
};
    