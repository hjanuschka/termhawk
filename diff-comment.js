var Blessed = require('blessed')
var DiffComment = function(options) {
    if (!(this instanceof Blessed.Node)) {
        return new DiffComment(options)
    }

    var self = this
    options = options || {}
    options.shrink = true
    Blessed.Element.call(this, options)

    if (options.keys) {
        this.on('keypress', function(ch, key) {
            if (key.name === 'up' || (options.vi && key.name === 'k')) {
                self.up()
                self.screen.render()
                return
            }
            if (key.name === 'down' || (options.vi && key.name === 'j')) {
                self.down()
                self.screen.render()
                return
            }
            if (key.name === 'enter' ||
                (options.vi && key.name === 'l' && !key.shift)) {
                self.enterSelected()
                return
            }
            if (key.name === 'escape' || (options.vi && key.name === 'q')) {
                self.cancelSelected()
                return
            }
            if (options.vi && key.name === 'u' && key.ctrl) {
                self.move(-((self.height - self.iheight) / 2) | 0)
                self.screen.render()
                return
            }
            if (options.vi && key.name === 'd' && key.ctrl) {
                self.move((self.height - self.iheight) / 2 | 0)
                self.screen.render()
                return
            }
            if (options.vi && key.name === 'b' && key.ctrl) {
                self.move(-(self.height - self.iheight))
                self.screen.render()
                return
            }
            if (options.vi && key.name === 'f' && key.ctrl) {
                self.move(self.height - self.iheight)
                self.screen.render()
                return
            }
            if (options.vi && key.name === 'h' && key.shift) {
                self.move(self.childBase - self.selected)
                self.screen.render()
                return
            }
            if (options.vi && key.name === 'm' && key.shift) {
                // TODO: Maybe use Math.min(this.items.length,
                // ... for calculating visible items elsewhere.
                var visible = Math.min(
                    self.height - self.iheight,
                    self.items.length) / 2 | 0
                self.move(self.childBase + visible - self.selected)
                self.screen.render()
                return
            }
            if (options.vi && key.name === 'l' && key.shift) {
                // XXX This goes one too far on lists with an odd number of items.
                self.down(self.childBase +
                    Math.min(self.height - self.iheight, self.items.length) -
                    self.selected)
                self.screen.render()
                return
            }
            if (options.vi && key.name === 'g' && !key.shift) {
                self.select(0)
                self.screen.render()
                return
            }
            if (options.vi && key.name === 'g' && key.shift) {
                self.select(self.items.length - 1)
                self.screen.render()
                return
            }

            if (options.vi && (key.ch === '/' || key.ch === '?')) {
                if (typeof self.options.search !== 'function') {
                    return
                }
                return self.options.search(function(err, value) {
                    if (typeof err === 'string' || typeof err === 'function' ||
                        typeof err === 'number' || (err && err.test)) {
                        value = err
                        err = null
                    }
                    if (err || !value) return self.screen.render()
                    self.select(self.fuzzyFind(value, key.ch === '?'))
                    self.screen.render()
                })
            }
        })
    }
}

DiffComment.prototype.enterSelected = function(i) {
    if (i != null) this.select(i)
    this.emit('action', this.items[this.selected], this.selected)
    this.emit('select', this.items[this.selected], this.selected)
}

DiffComment.prototype = Object.create(Blessed.Element.prototype)
DiffComment.prototype.type = 'diff-comment'

// Define a instance property called `messages` that will store the message list.
DiffComment.prototype._lines = []
DiffComment.prototype._messages = ['a', 'b']
DiffComment.prototype._selectedLine = 0
DiffComment.prototype._selectedPath = ''

/**
 * Add a message to the history.
 * @param {String} msg
 */
DiffComment.prototype.setDiff = function(diff) {
    var self = this
    self._lines = diff.split('\n')


}

DiffComment.prototype.render = function() {
    // Set the widget content.
    this.setContent(this._lines.join('\n'))

    // Call the super.
    return this._render()
}

module.exports = DiffComment
