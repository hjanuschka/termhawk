var blessed = require('blessed')
var notificationView = require('./notificationview.js')
var BottomBar = require('./bottombar.js')
var gitDriver = require('./github')
var issueView = require('./issueview')
var MDBox = require('./mdbox')
var theme = require("./theme")

// Create a screen object.
var screen = blessed.screen({
    'smartCSR': true,
    autoPadding: false,
    fullUnicode: true,
    terminal: 'xterm-256color',
    debug: true,
    style: {
        bg: "blue"
    },
    warnings: true
})


screen.title = 'TermHawk'

//FIXME gitlab!
var driver = new gitDriver()



if (process.env.issue_test) {
    var issue_view = new issueView(screen, driver, {
        repo: 'hjanuschka/termhawk',
        id: 1
    })
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
    ], function(ch, key) {})
    // Quit on Escape, q, or Control-C.
screen.key([
    'escape',
    'q',
    'C-c'
], function(ch, key) {
    return process.exit(0)
})


screen.key([
    'S-a'
], function(ch, key) {
    var _MDBox = new MDBox(screen, driver, './about.md')
    _MDBox.createView()
})

screen.key([
    'S-h'
], function(ch, key) {
    var _MDBox = new MDBox(screen, driver, './help.md')
    _MDBox.createView()
})





// Render the screen.
screen.render()
