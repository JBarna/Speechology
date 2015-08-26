# Speechology.js
---
##### [Speechology.js](https://jbarna.github.io/Speechology/) is a JavaScript library that puts the power of the [Web Speech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html) directly in your hands. Speechology.js provides voice and audio interfaces to your website, for those users who need it . [See an example](https://jbarna.github.io/Speechology/)

## Why?
Web is becoming the *universal platform* for applications, yet lacks some of the most essential accessibility tools. **Using Speechology.js you can target:** Blind, visualy impaired, motor skilled challenged, and cognitively challenged**, *all while providing a new interface for regular users.*

## How easy is it?
1) Include Speechology.js in your HTML: `<script src="Speechology.js"></script>`
2) Attach Speechology.js Professors to your HTML elements: `<input type='num' data-professor='phone-number'`
3) Tell Speechology.js where to look in your webpage for these tags: `var form = Speechology.parse('#myForm');`
4) Start Speechology.js! `form.run();`

## Quick Links
* [Overview](#introduction)
* [What are Speechology.js professors?](#what-are-speechology.js-professors)
* [Pre-included professors](#pre-included-professors)
* [How to make your own professors](#how-to-make-your-own-professors)
* [Speech and Voice Recognition API]
* [License](#license)

## Overview
Speechology.js comes in **two parts**. 
1) [Easy API] for saying and capturing voice, like `Speechology.speak('the user will hear this!');
2) Parser which finds your HTML elements with `data-professor` attributes, connects them with your speech and voice recognition API calls, and runs them all in a natural sequence. 

You can use one part of Speechology.js entirely without using the other, or you can use both to customize your webpage even farther!

## What are Speechology.js professors?
Professors of Speechology specialize in one type of speech. For example, a professor might have details on how to capture the email from a user. Another professor might know how to capture the phone number from a user. In order to connect these professors to your HTML, add `data-professor` attributes to the target elements. *Here is an example that will capture the email of a user through voice:* `<input type="email" data-professor="email"/>`. Listed below are all the [pre-included professors](#pre-included-professors) you can attach to your HTML elements, or learn [how to build your own]

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
1) Use [our API] to build a set of speeches and voice recognitions that acheive a goal. Note that here, `element` is the HTML element that the `data-professor` attribute was attached to.
``` javascript
var callback = function(element){
    Speechology.speak("Whats up?? Say something and I'll hear it!", true,
        function(whatTheUserSaid){
            //update the value of the input element
            element.value = whatTheUserSaid; 
    });
};
```
2) Give a name to your new professor, attach the callback to its name, and add the professor to Speechology.js.
```javascript
Speechology.addProfessor('whats-up', callback);
```
3) Now you can use the `whats-up` professor with your HTML!
```html
<input type='text' data-professor='whats-up'/>
```
**If you build a professor that you feel other people will use, please include a pull-request with your addition so it can be added to the pre-included professors!**

## Speech and Voice Recognition API
### How are you using this API?
###### If you are building professors
You must remember to call `speechology.next()` when you are done in your callbacks. Otherwise Speechology.js will not know when to start the next parsed element.

###### If you are using this API outside of professors
If you are not using this API to build professors, and simply as a tool to speak to the user and capture their voice, you should call `speechology.disableNext()` prior to any other function calls.

##### The `this` keyword
Most of the functions in this API are available at different times through the `this` keyword, depending which callback the code is in. The only exception is the `Speechology.speak` function, which is the starting point of it all. 

### API
#### Speechology.speak(text_to_say, [follow_up_with_voice], callback)
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
#### this.utterance
This is a reference to the underlying utterance object used with the Web Speech API.
Only available after you have used `Speechology.speak` without the second boolean argument.

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
Only available after you have used `Speechology.speak` without the second boolean argument.

#### this.speak()
Only available after you have used `Speechology.speak` without the second boolean argument. This method will start reading the text out to the user.

#### this.recognition
A reference to the underlying WebkitSpeechRecognition. 
Only available after you have used `Speechology.speak` with a `true` second argument, or used `this.captureVoice`.

#### this.confirm([modifiedTranscript], [yesCallback])
This function will read the transcript back to the user and ask if it is correct. If yes, it will move on to the parsed element (or call the yesCallback), and if the user said no, it will repeat the original text-to-speech.

* `Modified transcript` is either a new string to confirm or it defaults to the original transcript heard from the user.
* `yesCallback` will be called if the user says yes. **You must call speechology.next() when you are done**

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
Only available after you have used `Speechology.speak` without the second boolean argument. This method will start reading the text out to the user.

#### this.yesno(yesCallback, [noCallBack])
This function checks the transcript for 'yes', or 'no', and calls the callbacks accordingly. Available after you have spoken to the user, regardless if you have captured voice.













