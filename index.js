var blessed = require('blessed')
var notificationView = require('./notificationview.js')
var BottomBar = require('./bottombar.js')
var gitDriver = require('./github')
var issueView = require('./issueview')
var MDBox = require('./mdbox')
var theme = require('./theme')
var SearchBox = require('./searchbox')

// Create a screen object.
var screen = blessed.screen({
    'smartCSR': true,
    autoPadding: false,
    fullUnicode: true,
    terminal: 'xterm-256color',
    debug: true,
    style: {
        bg: 'blue'
    },
    warnings: true
})
Array.prototype.last = function() {
    return this[this.length - 1]
}

var bottom_bar = new BottomBar(screen)
screen.hawk = {
    history: [],
    screen: screen,
    setStatus: function(t) {
        bottom_bar.setStatus(t)
    },
    front: function() {
        bottom_bar.view.setFront()
    },
    addHistory: function(el) {
        this.history.push(el)
    },
    goBack: function() {
        screen.debug('GO BACK')
        var popped = this.history.pop()
            //Remove top element
        this.screen.remove(popped)
            //focus prev.
        var el = this.history.last()
        screen.render()
        setTimeout(() => {
            el.focus()
        })

    }


}


screen.title = 'TermHawk'

//FIXME gitlab!
var driver = new gitDriver()


bottom_bar.createView()
screen.hawk.front()

if (process.env.issue_test) {
    var issue_view = new issueView(screen, driver, {
        repo: 'hjanuschka/termhawk',
        id: 1
    })
    issue_view.createView()
} else {

    var notify_view = new notificationView(screen, driver)
    notify_view.createTable()


}








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
    'C-s'
], function(ch, key) {
    var _searchBox = new SearchBox(screen, driver)
    _searchBox.createView()
})



screen.key([
    'S-h'
], function(ch, key) {
    var _MDBox = new MDBox(screen, driver, './help.md')
    _MDBox.createView()
})

screen.key(['h'], function() {
    screen.hawk.goBack()
    screen.debug(screen.hawk.history.length)
})

screen.key('S-d', screen.debugLog.toggle)

var a = [1, 2, 3]
screen.debug('log')
screen.debug(a)


screen.on('keypress', function(ch, key) {
    if (key.name == 'down' || key.name == 'up') {
        if (screen.focus !== screen.hawk.history.last()) {
            var l = screen.hawk.history.last()
            l.focus()
        }
    }
})

// Render the screen.
screen.render()
