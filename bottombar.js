var blessed = require('blessed')
var theme = require('./theme')

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
    setStatus(t) {
      if(!this.view) return;
      this.view.setContent(t);
      this.view.screen.render();
    }
    createView() {
        var self = this
        this.view = blessed.box({
            parent: this.root,
            bottom: 0,
            left: 0,
            right: 0,
            padding: {
                top: 0
            },
            height:  1,
            autoCommandKeys: true,
            border: 0,
            padding: 0,
            vi: true,
            tags: true,
            content: 'Home',
            style: {
                bg: 'red',
                fg: 'white',
            },
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
