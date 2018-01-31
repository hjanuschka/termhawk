var Blessed = require('blessed')
var DiffComment = function(options) {
    if (!(this instanceof Blessed.Node)) {
        return new DiffComment(options)
    }

    options = options || {}
    options.shrink = true
    Blessed.Element.call(this, options)
}

DiffComment.prototype = Object.create(Blessed.Element.prototype)
DiffComment.prototype.type = 'diff-comment'

// Define a instance property called `messages` that will store the message list.
DiffComment.prototype._lines = []
DiffComment.prototype._messages = ["a","b"]
DiffComment.prototype._selectedLine = 0
DiffComment.prototype._selectedPath = ''

/**
 * Add a message to the history.
 * @param {String} msg
 */
DiffComment.prototype.setDiff = function(diff) {
    var self = this
    self._lines = diff.split("\n")


}

DiffComment.prototype.render = function() {
    // Set the widget content.
    this.setContent(this._lines.join('\n'))

    // Call the super.
    return this._render()
}

module.exports = DiffComment
