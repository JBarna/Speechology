var interface = require('../parts/Interface');

interface.addProfessor( 'date', require('./date') );
interface.addProfessor( 'email', require('./email') );
interface.addProfessor( 'message', require('./message') );
interface.addProfessor( 'name', require('./name') );
interface.addProfessor( 'phone', require('./phone') );
interface.addProfessor( 'zipcode', require('./zipcode') );
