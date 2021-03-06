var Theme = {
    primary: {
        bg: '#272822',
        fg: 'white'
    },
    secondary: {
        bg: '#FD971F',
        fg: 'black'
    },
    accent: {
        bg: '#F92672',
        fg: 'black'
    },
    styles: {
        label: {
            bg: 'lightgrey',
            fg: 'black'
        },
        button: {
            bg: 'lightblue',
            fg: 'red',
            focus: {
                bg: 'red',
                fg: 'yellow'
            }
        },
        radioset: {
            bg: 'blue',
            fg: 'white'
        },
        radiobutton: {
            fg: 'white',
            bg: 'blue'
        },
        window: {
            shadow: 'red',
            bg: 'blue',
            fg: 'black',
            border: {
                bg: 'blue',
                fg: 'blue'
            },
            label: {
                fg: 'red',
                bg: 'lightgrey'
            },
            cell: {}

        },
        box: {
            shadow: 'red',
            bg: 'lightgrey',
            fg: 'black',
            border: {
                bg: 'lightgrey',
                fg: 'black'
            },
            label: {
                fg: 'red',
                bg: 'lightgrey'
            },
            selected: {
                bg: 'red',
                fg: 'white'
            },


            cell: {
                bg: 'lightgrey',
                fg: 'black',
                selected: {
                    bg: 'red',
                    fg: 'white'
                }

            }
        },
    }
}
module.exports = Theme
