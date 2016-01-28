module.exports = function( size ){
    
    return ["data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='",
            size,
            "' height='",
            size,
            "' viewBox='0 0 512 512'%3E%3Cpath d='M256 353.5c43.7 0 79-37.5 79-83.5V115.5c0-46-35.3-83.5-79-83.5s-79 37.5-79 83.5V270c0 46 35.3 83.5 79 83.5z'/%3E%3Cpath d='M367 192v79.7c0 60.2-49.8 109.2-110 109.2s-110-49-110-109.2V192h-19v79.7c0 67.2 53 122.6 120 127.5V462h-73v18h161v-18h-69v-62.8c66-4.9 117-60.3 117-127.5V192h-17z'/%3E%3C/svg%3E"]
            .join("");
    
}