// variables to be shared with the project

exports.professors = {};
exports.currentSpeechToText;
exports.currentTextToSpeech;
exports.isRunning = false; 
exports.currentSection = null;
exports.nextEnabled = true;
exports.lang = 'en-US';
exports.DEBUG = true;
exports.iconNum = 0;

//callbacks
exports.callbacks = {
    'audioStart': [],
    'audioEnd': [],
    'voiceCaptureStart': [],
    'voiceCaptureEnd': [],
    'voiceCaptureResult': [],
};