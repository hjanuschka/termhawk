var blessed = require( 'blessed' )
var github = require( 'octonode' )

// Create a screen object.
var screen = blessed.screen( { 'smartCSR': true, autoPadding: false,
    fullUnicode: true,
    warnings: true} )

// screen.title = 'TermHawk';
var client = github.client( process.env.github_token )
var me = client.me()


function reRender() {
    box.content = 'aaA'
    //		console.log('RENDER');
    var data = [['repo', 'subject']]

    state.notifications.forEach( function(not) {
        data.push( [
            not.repository.full_name,
            not.subject.title
        ] )
    } )
    table.setData( data )
    screen.render()
    table.render()
}

var state = {
    'rerender': function() {
        reRender()
    }
}

me.notifications( {}, function( err, a ) {
    state.notifications = a
    state.rerender()
} )

screen.title = 'TermHawk'

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

//screen.append( box )

var table = blessed.listtable( {
    'parent': box,
    'data': [ [ 'Loading' ] ],
    'border': 'line',
    'tags': true,
    'keys': true,
    'vi': true,
    'left': 0,
    'top': 0,
    'align': 'left',
    'wrap': true,
    'right': 0,
		'bottom': 2,
    'width': 'shrink',
    'mouse': true,
    'style': {
        'border': { 'fg': 'cyan' },
        'header': {
            'fg': 'white',
            'bg': 'orange',
            'bold': true
        },
        'bg': 'blue',
        'cell': {
            'fg': 'white',
            'bg': 'blue',
            'selected': { 'bg': 'green', 'fg': 'black' }
        }
    }
} )

var bar = blessed.box({
  parent: screen,
  padding: 0,
  bottom: 0,
  border: 'bg',
  width: '100%',
  height: 'shrink',
  mouse: true,
  keys: true,
  style: {
    bg: 'green',
  },
	content: "test"
});




table.on('select', function(item,index) {
    var box1 = blessed.box( {
        'border': { 'type': 'line' },
        'parent': box,
        'content': JSON.stringify(state.notifications[index-1]),
        'height': '50%',
        'top': 'center',
        'left': 'center',
        'width': '50%',
        'style': {
            'bg': 'magenta',
            'border': { 'fg': '#f0f0f0' },
            'fg': 'white',
            'hover': { 'bg': 'green' }
        }
    } )
    box1.focus()
    box1.key( [
        'b'
    ], function( ch, key ) {
        box.remove(box1)
        screen.render()
        return 1
    } )

    screen.render()
    //screen.append(box);
})

//screen.append( table )

// Append our box to the screen.


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
