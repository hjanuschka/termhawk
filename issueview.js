var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')

class IssueView {
    constructor(root,client, payload) {
        this.root = root
        this.payload = payload
        this.client = client
        this.state = {issue: false}
    }
    focus() {
        this.box.focus()
    }
    setState(state) {
        this.state = state
        this.reRender()
    }
    reRender() {
        var self = this
        if(self.state.issue) {
            marked.setOptions({
            //  Define custom renderer
                renderer: new TerminalRenderer()
            })

            var cnt = "{#00ff00-fg}Issue:{/} {underline}" + this.state.issue.title + "{/}\n"
            cnt += "{#00ff00-fg}User:{/} {underline}" + this.state.issue.user.login + "{/}\n"
            cnt += "{#00ff00-fg}State:{/} {underline}" + this.state.issue.state + "{/}\n"
            cnt += "{#00ff00-fg}Created:{/} {underline}" + this.state.issue.created_at + "{/} Modified: {underline}" + this.state.issue.updated_at + "{/}\n"
            cnt += "Labels: \n"

            this.state.issue.labels.forEach(function(label) {
                cnt += "{#" + label.color + "-bg}{white-fg}" + label.name + "{/},"
            });

            cnt += '\n\n'
            cnt += marked(this.state.issue.body)

            cnt += "Comments: \n\n"
            this.state.comments.forEach(function(comment) {
                cnt += "\n";
                cnt += marked(comment.body);
                cnt += "\n";
            });
            self.box.setContent(cnt)
            //self.box.setContent(JSON.stringify(this.state.comments, null, 2))

          

        }
        self.box.focus()
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
                'bg': '#272822',
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
        issue.info(function(error, issue_detail) {
            var newState = self.state;
            newState.issue = issue_detail;
            issue.comments(function(err, comments) {
                newState.comments = comments;
                self.setState(newState)
            })

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
