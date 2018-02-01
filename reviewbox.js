var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')
var EventEmitter = require('events')
var theme = require('./theme')
var fs = require('fs')

var ReviewDiffBox = require('./reviewdiffbox')

class ReviewBox extends EventEmitter {

    constructor(root, driver, payload) {

        super()
        this.root = root
        this.payload = payload
        this.driver = driver
    }
    setType(type) {
        this.type = type
    }
    setReplyTo(id) {
        this.reply_to = id
    }
    createView() {
        var self = this
        self.form = blessed.form({
            parent: self.root,
            mouse: true,
            keys: true,
            vi: true,
            label: 'Compose Review for #' + self.payload.id,
            left: 'center',
            top: 'center',
            width: '80%',
            height: '80%',
            border: 'line',
            content: '',
            scrollable: true,
            shadow: true,
            style: theme.styles.box
        })
        self.form.on('submit', function(data) {
            console.log(data)
        })

        var set = blessed.radioset({
            parent: self.form,
            left: 2,
            top: 1,
            width: '40%',
            shrink: true,
            //padding: 1,
            //content: 'f',
            style: {
                bg: 'magenta'
            }
        })

        var radio1 = blessed.radiobutton({
            parent: set,
            mouse: true,
            keys: true,
            shrink: false,
            style: {
                bg: 'magenta'
            },
            height: 1,
            left: 0,
            top: 0,
            content: 'Approve',
            name: 'APPROVE'
        })

        var radio2 = blessed.radiobutton({
            parent: set,
            mouse: true,
            keys: true,
            shrink: true,
            style: {
                bg: 'magenta'
            },
            height: 1,
            left: 0,
            top: 1,
            content: 'Request Changes',
            name: 'REQUEST_CHANGES'
        })
        var radio3 = blessed.radiobutton({
            parent: set,
            mouse: true,
            keys: true,
            shrink: true,
            style: {
                bg: 'magenta'
            },
            height: 1,
            left: 0,
            top: 2,
            content: 'Comment',
            name: 'COMMENT'
        })




        var text = blessed.textarea({
            parent: self.form,
            mouse: true,
            vi: true,
            keys: true,
            style: {
                bg: 'blue'
            },
            height: 10,
            width: '80%',
            left: 2,
            top: 5,
            name: 'text'
        })
        text.on('focus', function() {
            text.readInput()
        })


        //var diffViewer = new ReviewDiffBox(self.form, self.driver, {})
        //var diff_data = fs.readFileSync('./demo.diff', 'utf8')
        //diffViewer.setDiff(diff_data.toString())
        //diffViewer.createView()

        self.form.focus()
        var cr = blessed.button({
            parent: self.form,
            mouse: true,
            keys: true,
            shrink: true,
            padding: {
                left: 1,
                right: 1
            },
            left: 10,
            top: 20,
            name: 'code review',
            content: 'code review',
            style: {
                bg: 'blue',
                focus: {
                    bg: 'red'
                }
            }
        })


        var submit = blessed.button({
            parent: self.form,
            mouse: true,
            keys: true,
            shrink: true,
            padding: {
                left: 1,
                right: 1
            },
            left: 24,
            top: 20,
            name: 'submit',
            content: 'submit',
            style: {
                bg: 'blue',
                focus: {
                    bg: 'red'
                }
            }
        })

        cr.on('press', function() {
            var diffViewer = new ReviewDiffBox(self.root, self.driver, {})
            var diff_data = fs.readFileSync('./demo.diff', 'utf8')
            diffViewer.setDiff(diff_data.toString())
            diffViewer.createView()
            //FIXME load diff,
            //add event once window is closed
            // set already set reviews before showing
        })
        submit.on('press', function() {
            self.form.submit()
        })

        text.on('focus', function() {
            text.readInput()
        })

        text.key('C-e', function() {
            //text.readEditor(function(err, data) {})
        })

        self.form.key(['h'], function() {
            self.root.remove(self.form)
            self.root.screen.render()
        })
        self.root.screen.render()

    }
}


module.exports = ReviewBox
