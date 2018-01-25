var blessed = require('blessed')
var IssueView = require('./issueview')

class NotificationView {
    constructor(root, driver) {
        this.root = root
        this.driver = driver
        this.state = {
            storeIndex: false
        }
    }
    setState(state) {
        this.state = state
        this.reRender()
    }
    reRender() {
        var data = [
            ['repo', 'subject']
        ]

        this.table.setData(data)
        this.state.notifications.forEach(function(not) {
            data.push([
                not.repo,
                not.title
            ])

        })
        this.table.setData(data)
        if (this.state.storeIndex !== false) {

            this.table.select(this.state.storeIndex)
            this.state.storeIndex = false

        }

        this.table.render()
        this.root.screen.render()

    }
    loadData() {
        var self = this
        self.driver.getNotifications({})
            .then(function(notifications) {
                self.setState({
                    notifications: notifications,
                    storeIndex: false
                })
            })

    }
    createTable() {
        this.table = blessed.listtable({
            'parent': this.root,
            'data': [
                ['Loading']
            ],
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
                'border': {
                    'fg': 'white'
                },
                'header': {
                    'fg': 'black',
                    'bg': '#FD971F',
                    'bold': true
                },
                'bg': '#272822',
                'cell': {
                    'fg': 'white',
                    'bg': '#272822',
                    'selected': {
                        'bg': '#FD971f',
                        'fg': 'black'
                    }
                }
            }
        })
        this.events()
        this.loadData()

    }
    remove() {
        this.root.remove(this.table)
        this.root.screen.render()
    }
    events() {
        var self = this
        this.table.key(['r'], function(ch, key) {
            var index = self.table.selected
            var not = self.state.notifications[index - 1]


            if (!not || !not.id) {
                return
            }

            self.state.notifications.splice(index - 1, 1)
            self.setState({
                notifications: self.state.notifications,
                storeIndex: index
            })
            self.driver.markNotificationAsRead(not.id)
                .then(function(resp) {
                    //FIXME feedback
                })

        })

        this.table.key(['C-r'], function(ch, key) {
            self.loadData()

        })
        this.table.on('select', function(item, index) {
            var not = self.state.notifications[index - 1]

            var id = not.target_id;
            not.repo ='hjanuschka/termhawk'
            id=1;
            var issue = new IssueView(self.root, self.driver, {
                repo: not.repo,
                id: id
            })
            issue.createView()
            issue.focus()
        })

    }
}

module.exports = NotificationView
