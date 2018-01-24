var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')

class IssueView {
    constructor(root,client, payload) {
        this.root = root
        this.payload = payload
        this.client = client
    }
    focus() {
        this.box.focus()
    }
    setState(state) {
        this.state = state
        this.reRender()
    }
    reRender() {
        this.box.screen.render()
    }
    createView() {
        this.box = blessed.box( {
            'border': { 'type': 'line' },
            'parent': this.root,
            'scrollable': true,
            alwaysScroll: true,

            scrollbar: {
                style: {
                    bg: 'red'
                }
            },
            'tags': true,
            'mouse': true,
            'vi': true,
            'input': true,
            'keys': true,
            'content': 'Loading.... id:' + this.id,
            'height': '100%-3',
            'width': '100%',
            'top': 0,
            'left': 0,
            'style': {
                'bg': 'blue',
                'border': { 'fg': '#f0f0f0' },
                'fg': 'white',
            }
        } )
        this.box.enableInput()
        this.events()
        this.reRender()

        this.loadData()

    }
    loadData() {
        var self = this
        var issue = this.client.issue(this.payload.repo, this.payload.id)
        issue.info(function(error, issue) {
            marked.setOptions({
                //  Define custom renderer
                renderer: new TerminalRenderer()
            })
      
            var cnt = issue.title + '\n'
            cnt += '\n'
            cnt += issue.body
            self.box.setContent(marked(cnt))

            self.reRender()
            self.box.focus()
      
        })
    }
    remove() {
        this.root.remove(this.box)
        this.reRender()
    }
    events() {
        var self = this
        this.box.key(['h'], function(ch, key) {
            self.remove()
            self.reRender()
        })
    }
}

module.exports = IssueView
