var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')
var striptags = require('striptags')
var fetch = require('node-fetch')
var issuecomments = require('./issuecomments')


class IssueView {
    constructor(root, driver, payload) {
        this.root = root
        this.payload = payload
        this.driver = driver
        this.state = {
            issue: false
        }
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

        if (self.state.issue) {
            marked.setOptions({
                //  Define custom renderer
                renderer: new TerminalRenderer()
            })

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
            cnt += pr_info + '\n'
            if (this.state.issue.labels) {
                cnt += 'Labels: \n'
                this.state.issue.labels.forEach(function(label) {
                    cnt += '{#' + label.color + '-bg}{white-fg}' + label.name + '{/},'
                })
            }

            cnt += '\n\n'
            cnt += striptags(marked(this.state.issue.body))

            cnt += 'Comments: \n\n'

            var comments = [].concat(this.state.issue_comments, this.state.pr_comments, this.state.pr_reviews)

            comments.sort(function(a, b) {
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                var a_date = a.created_at
                var b_date = b.created_at
                if (!a.created_at) {
                    a_date = a.submitted_at
                }
                if (!b.created_at) {
                    b_date = b.submitted_at
                }
                return new Date(a_date) - new Date(b_date)
            })

            comments = comments.filter(function(n) {
                if (n && n.in_reply_to_id) return false
                    //if (n && n.body == '') return false
                return n != undefined
            })
            var seen_reviews = {}
            comments.forEach(function(comment) {
                if (seen_reviews[comment.id] === true) {
                    return
                }
                seen_reviews[comment.id] = true
                var reviewed = false
                if (comment && comment.pull_request_review_id || comment.state) {
                    //comment.created_at = comment.submitted_at
                    reviewed = comment.state
                    if (!comment.created_at) comment.created_at = comment.submitted_at
                    self.state.pr_reviews.forEach(function(r) {
                        if (r.id == comment.pull_request_review_id) {
                            reviewed = r.state
                        }
                    })
                }
                cnt += '\n'
                cnt += '──────────────────────────────────────\n'
                cnt += '{#00ff00-fg}User:{/} {underline}' + comment.user.login + '{/}\n'
                if (reviewed) {
                    cnt += '{white-bg}{black-fg}Review Added{/}: ' + reviewed + '\n'
                }
                cnt += '{#00ff00-fg}Created:{/} {underline}' + comment.created_at + '{/}\n'
                cnt += '\n'



                self.state.pr_reviews.forEach(function(p) {
                    if (p.id == comment.pull_request_review_id) {
                        cnt += striptags(marked(p.body)) + '\n'
                        seen_reviews[p.id] = true
                    }
                })


                if (comment.diff_hunk) {
                    cnt += '{yellow-fg}' + comment.path + '{/}\n'
                    var diff_lines = comment.diff_hunk.split('\n')
                    diff_lines.forEach(function(l, idx) {
                            var color = '{white-fg}'
                            if (l.match(/^\-/)) {
                                color = '{red-fg}'
                            }
                            if (l.match(/^\+/)) {
                                color = '{green-fg}'
                            }
                            cnt += color + l + '{/}\n'
                            if (idx == comment.original_position) {}

                        })
                        //Find answers
                    self.state.pr_comments.forEach(function(pcomment) {
                        if (pcomment.in_reply_to_id == comment.id || pcomment.id == comment.id) {

                            cnt += '\t\t──────────────────────────────────────\n'
                            cnt += '\t\t{#00ff00-fg}User:{/} {underline}' + pcomment.user.login + '{/}\n'
                            cnt += '\t\t{#00ff00-fg}Created:{/} {underline}' + comment.created_at + '{/}\n'
                            striptags(marked(pcomment.body)).split('\n').forEach(function(l) {
                                cnt += '\t\t' + l + '\n'
                            })

                            seen_reviews[pcomment.id] = true
                        }
                    })
                } else {
                    cnt += striptags(marked(comment.body)) + '\n'
                    self.state.pr_comments.forEach(function(pcomment) {
                        if (pcomment.in_reply_to_id == comment.id) {

                            cnt += '\t\t──────────────────────────────────────\n'
                            cnt += '\t\t{#00ff00-fg}User:{/} {underline}' + pcomment.user.login + '{/}\n'
                            cnt += '\t\t{#00ff00-fg}Created:{/} {underline}' + comment.created_at + '{/}\n'

                            seen_reviews[pcomment.id] = true
                            striptags(marked(pcomment.body)).split('\n').forEach(function(l) {
                                cnt += '\t\t' + l + '\n'
                            })
                        }
                    })


                }



                //cnt += JSON.stringify(comment, null, 2);
                self.root.screen.debug(JSON.stringify(comment, null, 2))
                cnt += '\n'
            })

            self.box.setContent(cnt)
                //self.box.setContent(JSON.stringify(this.state.pr_comments, null, 2))



        }
        self.box.focus()
        this.box.screen.render()
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
            'style': {
                'bg': 'black',
                'border': {
                    'fg': '#f0f0f0'
                },
                'fg': 'white',
            }
        })
        this.box.enableInput()
        this.events()
        this.reRender()

        this.loadData()

    }
    loadData() {
        var self = this
        self.driver.loadIssueData(self.payload.repo, self.payload.id)
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
        var self = this
        var data = [
            ['sha', 'commiter', 'message']
        ]
        fetch(this.state.issue.diff_url)
            .then(function(res) {
                return res.text()
            })
            .then(function(diff_in) {
                var diff = ''
                diff_in.split('\n').forEach(function(l) {
                    var color = '{white-fg}'
                    if (l.match(/^\-/)) {
                        color = '{red-fg}'
                    }
                    if (l.match(/^\+/)) {
                        color = '{green-fg}'
                    }
                    diff += color + l + '{/}\n'

                })
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
                    'content': diff,
                    'top': 'center',
                    'height': '80%',
                    'mouse': true,
                    'width': '80%',
                    'style': {
                        'border': {
                            'fg': 'white'
                        },
                        'header': {
                            'fg': 'black',
                            'bg': '#FD971F',
                            'bold': true
                        },
                        'bg': 'black',
                    }
                })
                diffBox.key(['h'], function() {
                    self.root.remove(diffBox)
                    self.box.screen.render()
                })
                diffBox.focus()
                self.box.screen.render()


            })
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
        this.box.key(['h'], function(ch, key) {
            self.remove()
            self.state = {
                issue: false
            }
            self.box.screen.render()
        })
    }
}

module.exports = IssueView
