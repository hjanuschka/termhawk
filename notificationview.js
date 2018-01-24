var blessed = require('blessed')
var IssueView = require('./issueview')

class NotificationView {
    constructor(root, client) {
        this.root = root
        this.client = client
    }
    setState(state) {
        this.state = state
        this.reRender()
    }
    reRender() {
        var data = [['repo', 'subject']]

        this.state.notifications.forEach( function(not) {
            data.push( [
                not.repository.full_name,
                not.subject.title
            ] )
        } )
        this.table.setData( data )

        this.root.screen.render()

    }
    loadData() {
        var self = this
        var me = self.client.me()
        //EMPTY out
        me.notifications( {}, function( err, a ) {
            self.setState({notifications: a})
        } )

    }
    createTable() {
        this.table = blessed.listtable( {
            'parent': this.root,
            'data': [ [ 'Loading' ] ],
            'border': 'line',
            'tags': true,
            'keys': true,
            'vi': true,
            'align': 'left',
            'wrap': true,
            'height': '100%-3',
            'mouse': true,
            'width': '100%',
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
        this.events()
        this.loadData()

    }
    remove() {
        this.root.remove(this.table)
        this.root.screen.render()
    }
    events() {
        var self = this
        //ghnotification.markAsRead(callback);
        this.table.key(['r'], function(ch, key) {
            var index =  self.table.selected
            var not = self.state.notifications[index-1]
            not.removed=true

            var notification = self.client.notification(not.id)
            notification.markAsRead(function(err, read) {
                //FIXME PATCH list remember selection and so on
            })

        })

        this.table.key(['C-r'], function(ch, key) {
            self.loadData()
        })
        this.table.on('select', function(item,index) {
            var not = self.state.notifications[index-1]


            var matches = not.subject.url.match(/.*\/([0-9]+$)/)
            var id = matches[1]
            var issue = new IssueView(self.root,self.client, {repo:not.repository.full_name, id: id, not: not})
            issue.createView()
            issue.focus()
        })

    }
}

module.exports = NotificationView
