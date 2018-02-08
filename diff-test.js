var Blessed = require('blessed')
var fs = require('fs')
var ReviewDiffBox = require('./reviewdiffbox')

var screen = Blessed.screen({
    smartCSR: true,
    useBCE: true
})

screen.key('q', function() {
    return screen.destroy()
})


var diff_data = fs.readFileSync('./demo.diff', 'utf8')
var _reviewdiffbox = new ReviewDiffBox(screen, null, {})
_reviewdiffbox.setDiff(diff_data.toString())
_reviewdiffbox.createView()
screen.render()
