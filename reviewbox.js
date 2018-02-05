var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')
var EventEmitter = require('events')

var fetch = require('node-fetch')
var theme = require('./theme')
var fs = require('fs')

var ReviewDiffBox = require('./reviewdiffbox')

class ReviewBox extends EventEmitter {

    constructor(root, driver, payload) {

        super()
        this.root = root
        this.payload = payload
        this.driver = driver
        this.reviews = {}
    }
    setType(type) {
        this.type = type
    }
    setDiffUrl(diff) {
        this.diffUrl = diff
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
        self.root.screen.hawk.addHistory(self.form)
        self.form.on('submit', function(data) {
            var state = 'PENDING'
            if (data.REQUEST_CHANGES) {
                state = 'REQUEST_CHANGES'
            }
            if (data.APPROVE) {
                state = 'APPROVE'
            }
            if (data.COMMENT) {
                state = 'COMMENT'
            }
            //console.log(data, self.reviews)
            self.driver.createPRReview(self.payload.repo, self.payload.id, {text: data.text,state: state, reviews: self.reviews})
                .then(function() {
                    self.root.remove(self.form)
                    self.root.screen.render()
                })
        })

        var set = blessed.radioset({
            parent: self.form,
            left: 2,
            top: 1,
            width: '40%',
            shrink: true,
            //padding: 1,
            //content: 'f',
            style: theme.styles.radioset
        })

        var radio1 = blessed.radiobutton({
            parent: set,
            mouse: true,
            keys: true,
            shrink: false,
            style: theme.styles.radiobutton,
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
            style: theme.styles.radiobutton,
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
            style: theme.styles.radiobutton,
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
        var cancel = blessed.button({
            parent: self.form,
            mouse: true,
            keys: true,
            shrink: true,
            padding: {
                left: 1,
                right: 1
            },
            left: 34,
            top: 20,
            name: 'cancel',
            content: 'cancel',
            style: {
                bg: 'blue',
                focus: {
                    bg: 'red'
                }
            }
        })



        var commentCount = blessed.text({
            parent: self.form,
            padding: {
                left: 1,
                right: 1
            },
            left: 24,
            top: 18,
            style: theme.styles.box,
            content: 'Comments in stash: ' + Object.keys(self.reviews).length,
        })

        cr.on('press', function() {
            self.root.screen.debug('PRESS')
            var diffViewer = new ReviewDiffBox(self.root, self.driver, {})
            fetch(self.diffUrl)
                .then(function(res) {
                    return res.text()
                })
                .then(function(diff_in) {
                    diffViewer.setReviews(self.reviews)
                    diffViewer.setDiff(diff_in)
                    diffViewer.createView()
                })



            diffViewer.on('review_done', function(data) {
                self.reviews = data
                commentCount.setContent('Comments in stash: ' + Object.keys(self.reviews).length)
            })
            // set already set reviews before showing
        })
        submit.on('press', function() {
            self.form.submit()
        })

        cancel.on('press', function() {
            self.root.remove(self.form)
            self.root.screen.render()
        })
        text.on('focus', function() {
            text.readInput()
        })

        text.key('C-e', function() {
            //text.readEditor(function(err, data) {})
        })
        self.root.screen.render()

    }
}


module.exports = ReviewBox
