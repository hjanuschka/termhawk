var blessed = require('blessed')

class BottomBar {
    constructor(root) {
        this.root = root
    }
    setState(state) {
        this.state = state
        this.reRender()
    }
    reRender() {
        this.view.screen.render()
    }
    createView() {
        var self = this
        this.view = blessed.listbar({
            parent: this.root,
            bottom: 0,
            left: 0,
            right: 0,
            height:  3,
            mouse: true,
            keys: true,
            autoCommandKeys: true,
            border: 'bg',
            padding: 0,
            vi: true,
            style: {
                item: {
                    bg: 'magenta',
                    fg: 'white'
                    //focus: {asd asda
                    //  bg: 'blue'
                    //}
                },
                selected: {
                    bg: 'blue'
                }
            },
            commands: {
                'notifications': {
                    keys: ['n'],
                    callback: function() {
                        self.reRender()
                    }
                },
                'search': {
                    keys: ['s'],
                    callback: function() {
                        self.reRender()
                    }},
                'search': {
                    keys: ['s'],
                    callback: function() {
                        self.reRender()
                    }},
                'favorites': {
                    keys: ['f'],
                    callback: function() {
                        self.reRender()
                    }},
                'settings': {
                    keys: ['f'],
                    callback: function() {
                        self.reRender()
                    }},
            }
        })
        this.events()

    }
    remove() {
        this.root.remove(this.view)
        this.root.screen.render()
    }
    events() {
    }
}

module.exports = BottomBar
