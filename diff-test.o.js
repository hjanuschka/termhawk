var Blessed = require('blessed')
var DiffComment = require('./diff-comment')
var ReplyBox = require('./replybox')
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
    width: '80%',
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

function reRenderDiff(in_idx) {
    var color = ''
    d.clearItems()
    lines.forEach(function(l, idx) {
        if (reviews[idx]) {
            color = '{#ffa500-bg}{black-fg} '

        }
        d.addItem(color + l + '{/}')
        color = ''
    })

    d.select(in_idx)
    d.focus()
    screen.render()
}

var diff_data = fs.readFileSync('./demo.diff', 'utf8')
//d.setDiff(diff_data.toString())
var lines = diff_data.toString().split('\n')
var reviews = {}
lines.forEach(function(l) {
    d.addItem(l)
})
d.focus()
d.key(['s'], function() {
    //FIXME ID - store to github
    //get other fields
    console.log(reviews)
})
d.key(['d'], function() {
    delete reviews[d.selected]
    reRenderDiff(d.selected)
})
d.on('select', function(item, idx) {
    var found = diffPosition(lines, idx)
    var _replybox = new ReplyBox(screen, null, {
        id: 'Review'
    })
    if (reviews[idx]) {

        _replybox.setPrefilledValue(reviews[idx].comment)

    }

    _replybox.setCustomSubmit(function(data) {

        reviews[idx] = {
            payload: found,
            comment: data.text
        }

        _replybox.removeMe()
        reRenderDiff(idx)

    })
    _replybox.createView()
})

screen.key('q', function() {
    return screen.destroy()
})
screen.render()
