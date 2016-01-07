module.exports = function( _interface ){
    
    _interface.on('voiceCaptureResult', function(transcript){
        if (transcript.indexOf('next') > -1){
            _interface.next();
            return true;
        }
    });
    
}