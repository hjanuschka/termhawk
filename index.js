var blessed = require( 'blessed' )
var github = require( 'octonode' )
var notificationView = require('./notificationview.js')
var BottomBar = require('./bottombar.js')

// Create a screen object.
var screen = blessed.screen( { 'smartCSR': true, autoPadding: false,
    fullUnicode: true,
debug: true,
    warnings: true} )


screen.title = 'TermHawk'

//FIXME gitlab!
var client = github.client( process.env.github_token )

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box( {
    'border': { 'type': 'line' },
    'parent': screen,
    'content': 'Hello {bold}world{/bold}!',
    'height': '100%',
    'width': '100%',
    'style': {
        'bg': 'magenta',
        'border': { 'fg': '#f0f0f0' },
        'fg': 'white',
        'hover': { 'bg': 'green' }
    }
} )

screen.append( box )

var notify_view = new notificationView(screen, client)
notify_view.createTable()



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
screen.key( [
    'escape',
    'q',
    'C-c'
], function( ch, key ) {
    return process.exit( 0 )
} )

// Focus our element.
box.focus()

// Render the screen.
screen.render()
