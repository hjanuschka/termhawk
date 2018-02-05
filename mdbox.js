var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')
var EventEmitter = require('events')
var fs = require('fs')
var theme = require("./theme")
var chalk = require("chalk")

marked.setOptions({
    //  Define custom renderer
    renderer: new TerminalRenderer({codespan: chalk.red, code: chalk.red})
})



class MDBox extends EventEmitter {

    constructor(root, driver, file) {

        super()
        this.root = root
        this.file = file
        this.driver = driver
    }
    createView() {
        var self = this
        self.box = blessed.box({
            parent: self.root,
            mouse: true,
            keys: true,
            shadow: true,
          style:theme.styles.box,
            vi: true,
            label: 'Termhawk',
            left: 'center',
            top: 'center',
            width: '80%',
            height: '80%',
            border: 'line',
            content: 'foobar',
            scrollable: true,
        })

        self.root.screen.hawk.addHistory(self.box)
        var about = fs.readFileSync(self.file, 'utf8')
        self.box.setContent(marked(about.toString()))

        self.box.focus()
        self.root.screen.render()

    }
}


module.exports = MDBox
