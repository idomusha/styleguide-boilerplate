#bring

## loads data with several options (cache, callback, progress bar ...)

* **Authors**: idomusha

## Usage

### Add bring.min.js before your closing <body> tag, after jQuery (requires jQuery 1.7 +)
    <script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
    <script type="text/javascoript" src="bring/bring.min.js"></script>

### Bring your data
All parameters are optional.
The order is important: to set third parameter, you must define the 2 previous parameters (until the next update).
```js
    /**
     * AJAX request
     * generic function to load data
     *
     * @method load
     * @param {String} url (default: The current page): A string containing the URL to which the request is sent (path relative to the 'ajax/' directory ).
     * @param {String} returned (default: Intelligent Guess (xml, json, script, or html)): The type of data that you're expecting back from the server.
     * @param {Function} success: A function to be called if the request succeeds.
     * @param {Object or String} param: Data to be sent to the server. It is converted to a query string, if not already a string.
     * @param {String} request (default: 'GET'): The type of request to make ("POST" or "GET").
     * @param {Boolean} [loader=false]: Active or not the pre-request callback function beforeSend.
     * @param {Boolean} [fail=false]: Active or not the error callback function (if the request fails).
     */
    var url : "path/page-to-load.html";
    var loader = function() {
        <!-- error callback function -->
    }
    var succeed = function(data) {
        <!-- success callback function -->
    }
    var fail = function() {
        <!-- error callback function -->
    }

    Bring.load(url, 'html', succeed, {}, 'GET', loader, fail);
```

#### Next update:
- set default functions in options
- parameters with objects (order does not matter anymore)

## You can also grab Bring using bower:
```
    bower install bring --save
```