var Blessed = require('blessed')
var DiffComment = require('./diff-comment')
var fs = require('fs')

var screen = Blessed.screen({
    smartCSR: true,
    useBCE: true
})

var diff = require('./diff-comment')
var d = Blessed.list({
    height: '100%',
    padding: 1,
    tags: true,
    border: 'line',
    width: '40%',
    parent: screen,
    keys: true,
    //width: '80%',
    vi: true,
    mouse: true,
    style: {
        border: {
            fg: 'red'
        },
        header: {
            fg: 'blue',
            bold: true
        },
        selected: {
            bg: 'blue'
        }
    }
})

function diffPosition(lines, offset) {
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

var diff_data = fs.readFileSync('./demo.diff', 'utf8')
//d.setDiff(diff_data.toString())
var lines = diff_data.toString().split('\n')
lines.forEach(function(l) {
    d.addItem(l)
})
d.focus()
d.on('select', function(item, idx) {
    var found = diffPosition(lines, idx)
    console.log(found)
})

screen.key('q', function() {
    return screen.destroy()
})
screen.render()
