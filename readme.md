# Speechology.js
---
##### [Speechology.js](https://jbarna.github.io/Speechology/) is a JavaScript library that puts the power of the [Web Speech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html) directly in your hands. Speechology.js provides voice and audio interfaces to your website, for those users who need it . [See an example](https://jbarna.github.io/Speechology/)

## Why?
Web is becoming the *universal platform* for applications, yet lacks some of the most essential accessibility tools. **Using Speechology.js you can target:** Blind, visualy impaired, motor skilled challenged, and cognitively challenged, *all while providing a new interface for regular users.*

## How easy is it?
1. Include Speechology.js in your HTML: 
```html
<script src="Speechology.js"></script>
```
2. Attach Speechology.js Professors to your HTML elements: 
```html
<input type='num' data-professor='phone-number'/>
```
3. Tell Speechology.js where to look in your webpage for these tags: 
```javascript
var form = Speechology.parse('#myForm');
```
4. Start Speechology.js! 
```javascript
form.run();
```

## Quick Links
* [Overview](#overview)
* [What are Speechology.js professors?][1]
* [Pre-included professors][2]
* [How to make your own professors][3]
* [Speechology API][4]
* [Speech and Voice Recognition API][5]
* [Parser API][6]
* [Events][7]
* [License](#license)

## Overview
Speechology.js comes in **two parts**. 
1. An incredibly easy API for saying and capturing voice, like `Speechology.speak('the user will hear this!');`
2. Parser which finds your HTML elements with `data-professor` attributes, connects them with your speech and voice recognition API calls, and runs them all in a natural sequence. 

You can use one part of Speechology.js entirely without using the other, or you can use both to customize your webpage even farther!

## What are Speechology.js professors?
Professors of Speechology specialize in one type of speech. For example, a professor might have details on how to capture the email from a user. Another professor might know how to capture the phone number from a user. In order to connect these professors to your HTML, add `data-professor` attributes to the target elements. *Here is an example that will capture the email of a user through voice:* `<input type="email" data-professor="email"/>`. Listed below are all the [pre-included professors][2] you can attach to your HTML elements, or learn [how to build your own][3]

## Pre-included Professors
These Professors are ready out of the box. Just drop the `data-professor` attribute with one of these values onto your elements and watch them work. 

* **name** - A professor specializing in asking for a person's name. *Requires an additional attribute*: `data-name`, whos value should be either first, middle, or last. *Example:* `<input type='text' data-professor='name' data-name='first'/>`. Because names must be spelled out, it is impossible to capture an entire name at once. It must be broken up into it's respective parts (first, middle, last).
* **email** - A professor specializing in asking for a person's email address. *Example:* `<input type='email' data-professor='email'/>`
* **phone-number** - A professor specializing in asking for a person's 10 digit phone number. *Example:* `<input type='tel' data-professor='phone-number'/>`
* **zipcode** - A professor specializing in asking for a person's 5 digit zip code. *Example:* `<input type='text' data-professor='zipcode'/>`
* **message** - A professor specializing in asking a person if they would like to add an additional message. *Example:* `<textarea data-professor='message'></textarea>`
* **date** - A professor specializing in asking for a specific date. *Requires an additional attribute:* `data-date`, which is the question that is asked to receive the date. *Example:* `<input type='date' data-professor='date' data-date='please say your date of birth.'/>` 

## How to make your own professors
Need a professor that you don't see pre-included? Follow the steps below and make one! 
1. Use [the voice and speech recognition API][5] to build a set of speeches and voice recognitions that acheive a goal. Note that here, `element` is the HTML element that the `data-professor` attribute was attached to.
``` javascript
var callback = function(element){
    Speechology.speak("Whats up?? Say something and I'll hear it!", true,
        function(whatTheUserSaid){
            //update the value of the input element
            element.value = whatTheUserSaid; 
    });
};
```
2. Give a name to your new professor, attach the callback to its name, and add the professor to Speechology.js.
```javascript
Speechology.addProfessor('whats-up', callback);
```
3. Now you can use the `whats-up` professor with your HTML!
```html
<input type='text' data-professor='whats-up'/>
```
**If you build a professor that you feel other people will use, please include a pull-request with your addition so it can be added to the pre-included professors!**

## Speechology.js API
The API is composed of three parts
1. [General API](#general-api)
2. [Speech and Voice Recognition API][5]
3. [Parser API][6]

## General API
#### Speechology.compatible
A boolean. True if Speech Recognition and Speech Synthesis are available in the browser, false otherwise. 

#### Speechology.pause()
Immediately cancels all text-to-speech and voice recognition. 

#### Speechology.continue()
Starts speaking from the last text-to-speech spoken.

#### Speechology.on(eventName, callBack)
Registers callbacks for [Speechology events][7].

## Speech and Voice Recognition API
* You begin by speaking to the user
* After speaking to them, you can do certain things
* After hearing from them, you can do certain things

#### Speechology.next()
If you are building your own professors, you must remember to call this function in your callbacks. Otherwise, Speechology.js will not know when to move onto the next parsed element.

#### Speechology.disableNext()
If you are using the Speech and Voice Recognition API independent of Speechology Professors, you must call this function to stop Speechology.js from calling the next parsed element.

##### Note : The `this` keyword
Most of the functions in this API are available at different times through the `this` keyword, depending which callback the code is in. The only exception is the `Speechology.speak` function, which is the starting point of it all. 

### Speechology.speak(text_to_say, [follow_up_with_voice], callback)
**Every Speechology.js interaction must begin with this function**. The first argument is the text the computer will say to the user and is required. The second argument is an optional boolean, which tells Speechology.js to capture the user's voice when the text-to-speech is finished. The last argument is a callback function, and if the second optional argument was a true expression, the callback will be passed a single argument of the transcript that was captured from the user.

Passing `true` in the second argument is the same as coding this yourself:
```javascript
Speechology.speak("text to say", function(){
    this.captureVoice(function(transcript){
        console.log("the user said this: ", transcript);
    });
});

// versus using the optional second argument
Speechology.speak("text to say", true, function(transcript){
    console.log("the user said this: ", transcript);
});
```
## Available after you've spoken to the user (but before you've heard from them)
#### this.utterance
This is a reference to the underlying utterance object used with the Web Speech API.

#### this.captureVoice(callback)
Starts voice recognition and provides the callback with a transcript of what was heard.
*Example:* 
```javascript
Speechology.speak("Say something", function(){
    this.captureVoice(function(transcript){
        if (transcript === "I'm giving up on you") breakup();
    });
});
```

#### this.speak()
Re-starts the text-to-speech

#### this.yesno(yesCallback, [noCallback])
Starts voice recongition then checks to see if they said 'yes' or 'no'. 
Identical to:
```javascript
this.captureVoice(function(whatTheUserSaid){
    this.yesno(yesCallback, noCallback);
});
```
But it can be called prior to capturing the voice for convenience

## After you've captured voice from the user
#### this.recognition
A reference to the underlying WebkitSpeechRecognition. 

#### this.confirm([modifiedTranscript], [yesCallback])
This function will read the transcript (or `modifiedTranscript` if provided), back to the user and ask if it is correct. If yes, it will move on to the next parsed element (or call the `yesCallback` if provided). If the user said no, it will repeat the original text-to-speech and start the process over.

*Example:* 
```javascript
Speechology.speak("What's your name?", true, function(transcript){
    //confirm by spelling the name back out for them
    this.confirm(this.spellOut(transcript), function(){ 
        //optional callback if they say 'yes'
        Speechology.next();
    });
});
```

#### this.yesno(yesCallback, [noCallBack])
This function checks the transcript for 'yes', or 'no', and calls the callbacks accordingly. 
* `noCallBack`: If this is not provided, the default action is to call `Speechology.next()`
*Example:* 
```javascript
Speechology.speak("Are you a male?", true, function(whatTheUserSaid){
    var yes = function(){ 
        console.log("Yup, it's a dude"); 
        Speechology.next(); 
    };
    this.yesno(yes);
});
```

#### this.unclear([messageToUser])
Let's say you asked the user for their zipcode, but they only said 4 digits. You can use this function to tell them that their zipcode needs to be 5 digits long, and then ask them the original question again.
* `messageToUser`: If this is not provided, it defaults to `"Sorry, I didn't catch that."`

*Example:*
```javascript
Speechology.speak("Please say your zip code", true, function(usersZipCode){
    if (usersZipCode.length < 5)
        this.unclear("Your zipcode must be 5 digits long.");
    else
        //correct zip code
});
```

#### this.removeSpaces([stringToScan])
Useful when a user is asked to spell something out: Sometimes the browser will add spaces between the letters/numbers. Returns a modified string.
* `stringToScan`: If not provided, this defaults to the transcript the user said.

#### this.spellOut([stringToScan])
Useful when confirming what a user said, this function will add spaces between each letter/number to force the browser's text-to-speech to spell it out. Returns a modified string.
* `stringToScan`: If not provided, this defaults to the transcript the user said.

#### this.removeNonDigits([stringToScan])
Useful when a user is asked a numerical input. Returns a modified string.
* `stringToScan`: If not provided, this defaults to the transcript the user said.

## Parser API
#### Speechology.parse([HTML_to_parse])
This function will parse your HTML for data-professor attributes and store/return those in a queue-like object. `HTMl_to_parse` can be a: 
* `String`: A css-selector string, exactly like jQuery.
* `Element or array of elements`: HTMl elements themselves, or an array of them.
* `Nothing`: Defaults to the `document` object and scans your entire web page.

##### Returns a Speechology.js Section instance, which has the following methods: 
###### section.run()
Tells this section to start executing the professors in its queue. Also used to continue execution if it was previously stopped.

###### section.onFinish(callback)
Adds this callback function to an array of callbacks, which are executed when this section has no more professors left to run.

#### Speechology.addProfessor(professorName, professorFunction)
This function registers a newly created professor with Speechology.js. Speechology professors should be added prior to using the `Speechology.parse` function.

* `professorFunction`: Will be called with one argument: the element that the `data-professor` attribute was attached to. 

See more information on professors at [How to Make Your Own Professor][3]

## Events
Event handlers can be added through the `Speechology.on()` function.

#### audioStart
Fired when the browser starts speaking the text-to-speech. Takes one argument, the text that is being spoken.

*Example:*
```javascript
Speechology.on('audioStart', function(text){
    alert("You're going to hear this!" + text);
});

Speechology.speak("Text being spoken");
```

#### audioEnd
Fired when the browser finishes speaking the text-to-speech. Takes one argument, the text that was spoken

#### voiceCaptureResult
Fired when the browser returns a voice recognition from the user. **This can be used to halt execution of the normal callback** if the function returns `true`.
*Here is an example that listens for the user saying `pause` and pauses Speechology:* 
```javascript
Speechology.on('voiceCaptureResult', 
    function(whatTheUserSaid, speechHandle, voiceRecognitionHandle){
        if (whatTheUserSaid.indexOf('pause') > -1){
            Speechology.pause();
            return true;
        }
});
```
* `speechHandle`: A reference to all the functions available [after the browser has spoken][5]
* `voiceRecognitionHandle`: A reference to all the functions available [after the browser has listened][5]

#### voiceCaptureStart
Fires when the browser starts listening for the user's voice.

#### voiceCaptureEnd
Fires when the browser stops listening for the user's voice, no matter what the reason.

# License
The MIT License (MIT)

Copyright (c) 2015 Joel Barna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[1]: #what-are-speechologyjs-professors
[2]: #pre-included-professors
[3]: #how-to-make-your-own-professors
[4]: #speechologyjs-api
[5]: #speech-and-voice-recognition-api
[6]: #parser-api
[7]: #events