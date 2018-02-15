var fetch = require('node-fetch')
var blessed = require('blessed')
var theme = require('./theme')

class DiffBox {

    constructor(root, driver, payload) {

        this.root = root
        this.payload = payload
        this.driver = driver
    }

    createView() {
        var self = this
        var data = [
            ['sha', 'commiter', 'message']





        ]
        var diffBox = blessed.box({
            'parent': self.root,
            'border': 'line',
            'scrollable': true,
            alwaysScroll: true,

            scrollbar: {
                style: {
                    bg: 'red'
                }
            },

            'tags': true,
            'keys': true,
            'label': 'Diff',
            'vi': true,
            'align': 'left',
            'wrap': true,
            'left': 'center',
            'content': 'Diff loading....',
            'top': 'center',
            'height': '80%',
            'mouse': true,
            'width': '80%',
            shadow: true,
            style: theme.styles.box
        })
        this.root.screen.hawk.addHistory(diffBox)
        diffBox.focus()
        self.root.screen.render()


        fetch(self.payload.diff_url)
            .then(function(res) {
                return res.text()
            })
            .then(function(diff_in) {
                var diff = []
                diff_in.split('\n').forEach(function(l) {
                    var color = '{white-fg}'
                    if (l.match(/^\-/)) {
                        color = '{red-fg}'
                    }
                    if (l.match(/^\+/)) {
                        color = '{green-fg}'
                    }
                    diff.push(color + l + '{/}')

                })
                diffBox.setContent('' + diff.join('\n') + '')
                self.root.screen.render()



            })
    }
}


module.exports = DiffBox
