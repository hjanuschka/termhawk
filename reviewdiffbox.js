var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')
var EventEmitter = require('events')
var ReplyBox = require('./replybox')
var theme = require('./theme')


class ReviewDiffBox extends EventEmitter {

    constructor(root, driver, payload) {

        super()
        this.root = root
        this.payload = payload
        this.driver = driver
        this.reviews = {}
    }
    removeMe() {
        var self = this
        self.root.remove(self.box)
        self.root.screen.render()
    }
    setDiff(diff) {
        var self = this
        self.lines = diff.split('\n')

    }
    setReviews(re) {
        this.reviews = re
    }
    diffPosition(lines, offset) {
        var line_to_find = lines[offset]
        //Loop Up to Find diff
        var i = 0
        var pathname = ''
        var file_start = 0
        for (i = offset; i >= 0; i--) {
            var matches = lines[i].match(/^diff \-\-git a\/(.*) b\//)
            if (matches) {
                pathname = matches[1]
                file_start = i
                break
            }
        }
        var hunk_start = 0
        for (i = file_start; i < lines.length - 1; i++) {
            if (lines[i].match(/^@@/)) {
                hunk_start = i + 1
                break
            }
        }
        var found_line_nr = 1
        for (i = hunk_start; i < lines.length - 1; i++) {

            if (lines[i] == line_to_find) {
                break
            }
            found_line_nr++
        }
        var finalPayload = {
            pathname: pathname,
            nr: found_line_nr
        }
        return finalPayload
    }

    reRenderDiff(in_idx) {
        var self = this
        var color = ''
        self.box.clearItems()
        self.lines.forEach(function(l, idx) {
            if (self.reviews[idx]) {
                color = '{#ffa500-bg}{black-fg} '

            }
            self.box.addItem(color + l + '{/}')
            color = ''
        })

        if (in_idx) {
            self.box.select(in_idx)
        }
        self.box.focus()
        self.root.screen.render()
    }

    createView() {
        var self = this
        self.box = blessed.list({
            height: '100%',
            padding: 1,
            tags: true,
            border: 'line',
            width: '100%',
            parent: self.root,
            keys: true,
            //width: '80%',
            vi: true,
            mouse: true,
            label: 'Code Review',
            style: theme.styles.box
        })


        this.root.screen.hawk.addHistory(self.box)
        self.box.key(['s'], function() {
            self.emit('review_done', self.reviews)
						 self.root.screen.hawk.goBack()
        })


        self.box.key(['d'], function() {
            delete self.reviews[self.box.selected]
            self.reRenderDiff(self.box.selected)
        })
        self.box.on('select', function(item, idx) {
            var found = self.diffPosition(self.lines, idx)
            var _replybox = new ReplyBox(self.root, null, {
                id: 'Review'
            })
            if (self.reviews[idx]) {

                _replybox.setPrefilledValue(self.reviews[idx].comment)

            }

            _replybox.setCustomSubmit(function(data) {

                self.reviews[idx] = {
                    payload: found,
                    comment: data.text
                }

						 		self.root.screen.hawk.goBack()
                self.reRenderDiff(idx)

            })
            _replybox.createView()
        })
        self.reRenderDiff()
        self.box.focus()
        self.root.render()


    }
}


module.exports = ReviewDiffBox
