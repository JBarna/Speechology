module.exports = Section;

function Section(startingElem){
        this.__speechQueueIndex = 0;
        this.__speechQueue = [];
        this.__onFinish = [];
        
        //add our speech elements to the queue
        this._parse(startingElem);
    }
        
    //parent elem is an array-like structure of elements
    Section.prototype._parse = function(elementsToParse){
        var _this = this;
        
        var pushSpeech = function(elem){
            if (__professors.hasOwnProperty(elem.getAttribute('data-professor')))
                _this.__speechQueue.push({fun: __professors[elem.getAttribute('data-professor')], element: elem});
            else
                console.error("unknown professor name", elem.getAttribute('data-professor'));
        };
        
        Array.prototype.forEach.call(elementsToParse, function(superElem){
            
            if (superElem.hasAttribute && superElem.hasAttribute('data-professor'))
                pushSpeech(superElem);

            var subElements = superElem.querySelectorAll('[data-professor]');
            Array.prototype.forEach.call(subElements, function(elem){
                pushSpeech(elem);
            });
        });
    };
    
    Section.prototype.run = function(){
        var _this = this;
        _pause(); //cancel other speeches if they're going on.
        
        //wait until the other speeches' callbacks have run their course before starting again
        /* the reason we decriment the speechQueueIndex by 1 is because, if the voice was paused at any point, 
        and this is re-run, we want to start back at the last speech. */
        
        setTimeout(function(){ 
            __currentSection = _this;
            __nextEnabled = true;
            _this.__speechQueueIndex--;
            _this._next();
        }, 1000); 
    
    };
        
    Section.prototype._next = function(){
        this.__speechQueueIndex++;
        if (this.__speechQueueIndex < this.__speechQueue.length){
            var fun = this.__speechQueue[this.__speechQueueIndex].fun;
            var elem = this.__speechQueue[this.__speechQueueIndex].element;
            
            if (!elem.disabled)
                fun(elem);
            else
                this._next();
        } else {
            //emit the finished event
            for (cb of this.__onFinish){
                cb();
            }
        }
    };
    
    Section.prototype.onFinish = function(cb){
        this.__onFinish.push(cb);
    }