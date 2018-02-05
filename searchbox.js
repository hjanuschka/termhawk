var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')
var EventEmitter = require('events')
var fs = require('fs')
var theme = require('./theme')
var chalk = require('chalk')

class SearchBox extends EventEmitter {

    constructor(root, driver, file) {

        super()
        this.root = root
        this.file = file
        this.driver = driver
    }
    createView() {
        var self = this
        self.box = blessed.box({
            parent: self.root,
            mouse: true,
            keys: true,
            shadow: true,
            style: theme.styles.box,
            vi: true,
            label: 'Repository search',
            left: 'center',
            top: 'center',
            width: '100%',
            height: '100%',
            inputOnFocus: true,
            border: 'line',
            content: '',
            scrollable: true,
        })
        var label = blessed.text({
            parent: self.box,
            mouse: true,
            keys: true,
            height: 1,
            width: 20,
            left: 1,
            top: 3,
            style: theme.styles.label,
            content: 'Search Repository...'
        })




        var textbox = blessed.textbox({
            parent: self.box,
            mouse: true,
            keys: true,
            style: {
                bg: 'blue'
            },
            height: 1,
            inputOnFocus: true,
            width: '100%',
            left: 1,
            top: 5,
            name: 'text'
        })
        var button = blessed.button({
            parent: self.box,
            mouse: true,
            keys: true,
            height: 1,
            width: 'shrink',
            left: 'center',
            top: 10,
            style: theme.styles.button,
            content: 'Search '
        })

var list = blessed.list({
            parent: self.box,
            mouse: true,
            keys: true,
            height: 10,
            width: '100%',
            left: 'center',
            top: 12,
            border: false,
            content: "",
            'style': theme.styles.box,
            padding: {
            left: 10,
            right: 10
            }
        })
        //list.setItems([1,2,34,5,6,7]);
        list.addItem("1");
        list.addItem("2");
        list.addItem("3");
        list.addItem("4");




        self.box.key(['h'], function() {
            self.root.remove(self.box)
            self.root.screen.render()
        })

        self.box.focus()
        self.root.screen.render()

    }
}


module.exports = SearchBox
