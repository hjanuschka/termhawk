var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')
var EventEmitter = require('events')


class ReplyBox extends EventEmitter {

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
            label: 'Compose Reply for #' + self.payload.id,
            left: 'center',
            top: 'center',
            width: '80%',
            height: '80%',
            border: 'line',
            content: 'foobar',
            scrollable: true,
        })
        self.form.on('submit', function(data) {
            var method = 'createIssueComment'
            var reply_payload = {
                body: data.text
            }
            if(self.type == 'pr_review') {
                method = 'createPullCommentReply'
                reply_payload.in_reply_to = self.reply_to
            }
            self.driver[method](self.payload.repo, self.payload.id,reply_payload
            ).then(result => {
                self.emit('hawk_done')
                self.root.remove(self.form)
                self.root.screen.render()
            })
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
            left: 'center',
            top: 3,
            name: 'text'
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
            left: 'center',
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

        submit.on('press', function() {
            self.form.submit()
        })

        text.on('focus', function() {
            text.readInput()
        })
        self.form.focus()
        text.key('C-e', function() {
            //text.readEditor(function(err, data) {})
        })

        self.root.screen.render()

    }
}


module.exports = ReplyBox