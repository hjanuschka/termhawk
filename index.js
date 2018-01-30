var blessed = require('blessed')
var notificationView = require('./notificationview.js')
var BottomBar = require('./bottombar.js')
var gitDriver = require('./github')
var issueView = require('./issueview')

// Create a screen object.
var screen = blessed.screen({
    'smartCSR': true,
    autoPadding: false,
    fullUnicode: true,
    debug: true,
    warnings: true
})


screen.title = 'TermHawk'

//FIXME gitlab!
var driver = new gitDriver()


// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
    'border': {
        'type': 'line'
    },
    'parent': screen,
    'content': 'Hello {bold}world{/bold}!',
    'height': '100%',
    'width': '100%',
    'style': {
        'bg': 'magenta',
        'border': {
            'fg': '#f0f0f0'
        },
        'fg': 'white',
        'hover': {
            'bg': 'green'
        }
    }
})

screen.append(box)

if (process.env.issue_test) {
    var issue_view = new issueView(screen, driver, {repo: 'hjanuschka/termhawk', id:1})
    issue_view.createView()
    issue_view.focus()
} else {

    var notify_view = new notificationView(screen, driver)
    notify_view.createTable()


}

var bottom_bar = new BottomBar(screen)
bottom_bar.createView()





//Global Hotkeys

screen.key(['e'], function(ch, key) {
    notify_view.remove()
})
screen.key([
    'w'
], function(ch, key) {
    box.toggle()
    table.focus()
    screen.render()
})
// Quit on Escape, q, or Control-C.
screen.key([
    'escape',
    'q',
    'C-c'
], function(ch, key) {
    return process.exit(0)
})

// Focus our element.
box.focus()

// Render the screen.
screen.render()
