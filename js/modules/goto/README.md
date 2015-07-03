#goto

## scrolls to an anchor element
- adjusts the speed depending on the length to go (min and max customizable)
- go to hash in the same page or an another page
- gap customizable to consider fixed header or whatever
- vertical and horizontal directions (but you can't get both at the same time)

* **Authors**: idomusha

## Usage

### Add goto.min.js before your closing <body> tag, after jQuery (requires jQuery 1.7 +)
    <script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
    <script type="text/javascript" src="goto/goto.min.js"></script>

### Set options
Documentation will follow later (be patient).
```js
    GoTo.options = {
        gap: '50px',
        sLinks: 'a[href^="#"]'
    }
```

### Initialize GoTo
```js
    GoTo.init();
```

#### Next update
- Documentation for parameters and constraints (in particular for the horizontal scroll direction)
- plug imagesLoaded (wait images loaded before scroll)

## You can also grab GoTo using bower:
```
    bower install goto --save
```