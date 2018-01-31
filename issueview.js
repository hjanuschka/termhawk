var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')
var striptags = require('striptags')

var ReplyBox = require('./replybox')
var DiffBox = require('./diffbox')

var theme = require('./theme')
var chalk = require('chalk')

marked.setOptions({
    //  Define custom renderer
    renderer: new TerminalRenderer({codespan: chalk.red, code: chalk.red})

})


class IssueView {
    constructor(root, driver, payload) {
        this.root = root
        this.payload = payload
        this.driver = driver
        this.buttons = []
        this.selectedButton = 0
        this.offset = 2
        this.state = {
            issue: false
        }
    }
    focus() {
        this.box.focus()
    }
    setState(state) {
        this.offset = 2
        this.state = state
        this.reRender()
    }
    reRender() {
        var self = this

        if (self.state.issue) {

            var kind = 'Issue'
            var pr_info = ''
            if (this.state.issue.is_pr) {
                var mergeable = 'false'
                if (this.state.pr.mergeable) mergeable = 'true'
                kind = 'Pull Request'
                pr_info += '{underline}Mergable{/}:' + mergeable + '\n'
                pr_info += '{underline}Diff Stat{/}: Removes: {red-fg}' + this.state.pr.deletions + '{/} '

                pr_info += 'Adds: {green-fg}' + this.state.pr.additions + '{/} \n\n'


            }

            var cnt = '{#00ff00-fg}' + kind + ':{/} {underline}' + this.state.issue.title + '{/} #' + this.payload.id + '\n'
            cnt += '{#00ff00-fg}User:{/} {underline}' + this.state.issue.user.login + '{/}\n'
            cnt += '{#00ff00-fg}State:{/} {underline}' + this.state.issue.state + '{/}\n'
            cnt += '{#00ff00-fg}Created:{/} {underline}' + this.state.issue.created_at + '{/} Modified: {underline}' + this.state.issue.updated_at + '{/}\n'

            cnt += '--------------------------------------------------------------------------\n'
            cnt += pr_info + '\n'
            if (this.state.issue.labels) {
                cnt += 'Labels: \n'
                this.state.issue.labels.forEach(function(label) {
                    cnt += '{#' + label.color + '-bg}{white-fg}' + label.name + '{/},'
                })
            }

            cnt += '\n\n'
            cnt += striptags(marked(this.state.issue.body))



            var box1 = blessed.box({
                shrink: true,
                tags: true,
                border: 'line',
                width: '100%-3',
                height: 'shrink',
                padding: {
                    left: 2,
                    top: 2,
                    right: 0
                },
                parent: self.box,
                top: self.offset,
                shadow: true,
                left: 1,

                style: theme.styles.box,
                astyle: {
                    border: {
                        fg: theme.primary.bg,
                        bg: theme.primary.fg
                    },
                    bg: theme.primary.bg,
                    fg: theme.primary.fg
                }

            })

            box1.setContent(cnt)
            box1.parseContent()
            if (box1._clines) {
                self.offset += box1._clines.length + 3 + 2 + 1
            } else {
                self.offset = 0
            }


            self.walkComments(0, this.state.timeline)


            var btn1 = blessed.button({
                left: 'center',

                style: theme.styles.button,
                top: self.offset + 2 + 2,
                width: 'shrink',
                height: 1,
                tags: true,
                content: 'reply',
                mouse: true,
                keys: true,
                parent: self.box
            })
            btn1.on('press', function() {
                var _replybox = new ReplyBox(self.root, self.driver, self.payload)
                _replybox.createView()
            })
            self.buttons.push(btn1)
            self.selectedButton=-1



        }
        self.box.setContent('')
        self.box.focus()
        this.box.screen.render()
    }
    walkComments(depth = 0, childs, pointZero = 0) {
        var self = this

        var depthspacer = Array(depth).join('\t')
        depthspacer = ''
        childs.forEach(function(entryPayload) {

            var cnt = ''
            if (entryPayload.type == 'event') {
                if (['comment_deleted', 'subscribed', 'mentioned', 'referenced'].includes(entryPayload.event.event)) {
                    return
                }
                cnt += depthspacer + '{#00ff00-fg}User:{/} {underline}' + entryPayload.event.actor.login + '{/}\n'
                cnt += depthspacer + '{#00ff00-fg}Created:{/} {underline}' + entryPayload.event.created_at + '{/}\n'
                var handled = false
                if (entryPayload.event.event == 'labeled') {
                    cnt += depthspacer + ' added label: {#' + entryPayload.event.label.color + '-bg}' + entryPayload.event.label.name + '{/}\n'
                    handled = true

                }
                if (entryPayload.event.event == 'unlabeled') {
                    cnt += depthspacer + ' removed label: {#' + entryPayload.event.label.color + '-bg}' + entryPayload.event.label.name + '{/}\n'
                    handled = true

                }

                if (entryPayload.event.event == 'closed') {
                    cnt += depthspacer + '  clossed this! \n'
                    handled = true
                }

                if (entryPayload.event.event == 'renamed') {
                    cnt += depthspacer + ' Renamed from: \'' + entryPayload.event.rename.from + '\' \n'
                    cnt += depthspacer + '           to: \'' + entryPayload.event.rename.to + '\' \n'
                    handled = true
                }
                if (entryPayload.event.event == 'merged') {
                    cnt += depthspacer + ' merged this! \n'
                    handled = true
                }
                if (entryPayload.event.event == 'head_ref_deleted') {
                    cnt += depthspacer + ' PR branch removed \n'
                    handled = true
                }
                if (handled === false) {
                    cnt += depthspacer + ' ' + JSON.stringify(entryPayload.event, null, 2) + '\n'
                }

            }
            if (entryPayload.comment.type == 'issue_comment') {

                cnt += depthspacer + '{#00ff00-fg}User:{/} {underline}' + entryPayload.comment.user.login + '{/}\n'
                cnt += depthspacer + '{#00ff00-fg}Created:{/} {underline}' + entryPayload.comment.created_at + '{/}\n'
                cnt += depthspacer + '--------------------------------------------------------------------------\n'
                cnt += depthspacer + striptags(marked(entryPayload.comment.body)) + '\n'

            }
            if (entryPayload.comment.type == 'pr_review') {

                cnt += depthspacer + '{#00ff00-fg}User:{/} {underline}' + entryPayload.comment.user.login + '{/} submitted review: {underline}' + entryPayload.comment.submitted_at + '{/}\n'
                cnt += depthspacer + '{white-bg}{black-fg}Review Added{/}: ' + entryPayload.comment.state + '\n'
                cnt += depthspacer + '--------------------------------------------------------------------------\n'


                //depth = depth + 1
                depthspacer = Array(depth).join('\t')


                if (entryPayload.comment.diff_hunk && !entryPayload.comment.in_reply_to_id) {
                    var diff_lines = entryPayload.comment.diff_hunk.split('\n')
                    diff_lines.forEach(function(l, idx) {
                        var color = '{white-fg}'
                        if (l.match(/^\-/)) {
                            color = '{red-fg}'
                        }
                        if (l.match(/^\+/)) {
                            color = '{green-fg}'
                        }
                        cnt += depthspacer + color + l + '{/}\n'
                        if (idx == entryPayload.comment.original_position) {
                            cnt += depthspacer + striptags(marked(entryPayload.comment.body)) + '\n'
                        }

                    })
                } else {
                    cnt += depthspacer + striptags(marked(entryPayload.comment.body)) + '\n'
                }


            }
            if (entryPayload.comment.type == 'pr_comment') {

                cnt += depthspacer + '{#00ff00-fg}User:{/} {underline}' + entryPayload.comment.user.login + '{/}\n'
                cnt += depthspacer + '{#00ff00-fg}Created:{/} {underline}' + entryPayload.comment.created_at + '{/}\n'
                cnt += depthspacer + '--------------------------------------------------------------------------\n'
                if (entryPayload.comment.diff_hunk && !entryPayload.comment.in_reply_to_id) {
                    var diff_lines = entryPayload.comment.diff_hunk.split('\n')
                    diff_lines.forEach(function(l, idx) {
                        var color = '{black-bg}{white-fg}'
                        if (l.match(/^\-/)) {
                            color = '{black-bg}{red-fg}'
                        }
                        if (l.match(/^\+/)) {
                            color = '{black-bg}{green-fg}'
                        }
                        cnt += depthspacer + color + l + '{/}{/}\n'
                        if (idx == entryPayload.comment.original_position) {
                            cnt += depthspacer + striptags(marked(entryPayload.comment.body)) + '\n'
                        }

                    })
                } else {
                    cnt += depthspacer + striptags(marked(entryPayload.comment.body)) + '\n'
                }


            }




            var box2 = blessed.box({
                left: (depth * 1) + 1,
                width: '100%-' + (depth * 1) + 4,
                height: 'shrink',
                border: 'line',
                padding: {
                    left: 2,
                    top: 2,
                },
                tags: true,
                shrink: true,
                top: self.offset,
                content: cnt,
                shadow: true,
                parent: self.box,

                style: theme.styles.box,
                astyle: {
                    border: {
                        fg: theme.primary.bg,
                        bg: theme.primary.fg
                    },
                    bg: theme.primary.bg,
                    fg: theme.primary.fg
                }

            })

            box2.parseContent()
            if (box2 && box2._clines) {
                self.offset += box2._clines.length + 3 + 2 + 1
            } else {
                //FIXME double renderer?
                return
            }



            if (entryPayload.children && entryPayload.children.length > 0) {
                //console.error("CHILD", entryPayload)
                self.walkComments(depth + 1, entryPayload.children, 0)
                var btn1 = blessed.button({
                    left: 'center',

                    style: theme.styles.button,


                    top: self.offset - 3,
                    width: 'shrink',
                    height: 1,
                    tags: true,
                    content: 'reply',
                    mouse: true,
                    keys: true,
                    parent: self.box
                })
                btn1.reply_to = entryPayload.children[entryPayload.children.length - 1].comment.id
                btn1.on('press', function() {
                    var _replybox = new ReplyBox(self.root, self.driver, self.payload)
                    _replybox.setType('pr_review')
                    _replybox.setReplyTo(this.reply_to)
                    _replybox.createView()
                })
                self.buttons.push(btn1)
            }
        })
        //return cnt

    }
    createView() {
        this.box = blessed.box({
            'border': {
                'type': 'line'
            },
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
            'content': 'Loading....',
            'height': '100%-3',
            'width': '100%',
            'top': 0,
            'left': 0,
            'style': theme.styles.window,
            'astyle': {
                'bg': theme.styles.window,
                'border': {
                    'fg': theme.accent.fg,
                    'bg': theme.primary.bg
                },
                'fg': theme.primary.fg,
            }
        })
        this.box.enableInput()
        this.events()
        this.reRender()

        this.loadData()

    }
    loadData() {
        var self = this
        self.driver.getIssueTimeline(self.payload.repo, self.payload.id)
            .then(function(issueData) {
                self.setState(issueData)
            })
        return
    }
    remove() {
        this.root.remove(this.box)
        this.reRender()
    }
    renderDiffBox() {
        var _diffbox = new DiffBox(this.root, this.driver, {
            diff_url: this.state.issue.diff_url
        })
        _diffbox.createView()
    }

    renderCommitBox() {
        var self = this
        var data = [
            ['sha', 'commiter', 'message']
        ]
        this.driver.getCommitsForPR(this.payload.repo, this.payload.id)
            .then(function(commits) {
                //Requires
                //sha
                //commiter name
                //message
                commits.forEach(function(commit) {
                    data.push([
                        commit.sha.substring(0, 5),
                        commit.committer.name,
                        commit.message
                    ])
                })
                var commitList = blessed.listtable({
                    'parent': self.root,
                    'data': data,
                    'border': 'line',
                    'tags': true,
                    'keys': true,
                    'vi': true,
                    'align': 'left',
                    'wrap': true,
                    'left': 'center',
                    'top': 'center',
                    'height': '50%',
                    'mouse': true,
                    'width': '50%',
                    style: theme.styles.box,
                    shadow: true,
                    'astyle': {
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
                commitList.key(['h'], function() {
                    self.root.remove(commitList)
                    self.box.screen.render()
                })


                commitList.focus()
                self.box.screen.render()

            })
    }

    events() {
        var self = this
        this.box.key(['z'], function(ch, key) {

            if (self.state.issue.is_pr) {
                self.renderCommitBox()
            }

        })

        this.box.key(['d'], function() {
            if (self.state.issue.is_pr) {
                self.renderDiffBox()
            }
        })
        this.box.key(['r'], function() {
            if (self.state.issue.is_pr) {
                self.renderReviewList()
            }
        })
        this.box.key(['S-r'], function() {
            var _replybox = new ReplyBox(self.root, self.driver, self.payload)
            _replybox.createView()
            _replybox.on('hawk_done', function() {
                //Fixme scroll to end
                self.loadData()
            })
        })
        this.box.key(['S-m'], function() {
            self.driver.merge(self.payload.repo, self.payload.id).then(function() {
                var msg = blessed.message({
                    parent: self.root,
                    border: 'line',
                    height: '20',
                    width: 'half',
                    top: 'center',
                    left: 'center',
                    label: ' {blue-fg}Merged!{/blue-fg} ',
                    tags: true,
                    keys: true,
                    hidden: true,
                    vi: true
                })
                msg.display('Merged This!', function(e, m) {
                    //FIXME something
                })
                self.root.screen.render()
            })

        })

        this.box.key(['h'], function(ch, key) {
            self.remove()
            self.state = {
                issue: false
            }
            self.box.screen.render()
        })

        this.box.on('element keypress', function(el, ch, key) {
            if (key.name === 'tab') {
                //console.log(self.buttons)

                if (self.selectedButton + 1 <= self.buttons.length - 1) {
                    self.selectedButton = self.selectedButton + 1

                } else {
                    self.selectedButton = 0
                }
                self.buttons[self.selectedButton].focus()
                self.root.screen.render()
            }
        })
    }
}

module.exports = IssueView
