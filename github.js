var github = require('octonode')

class GithubDriver {
    constructor() {
        this.client = github.client(process.env.github_token)
    }
    markNotificationAsRead(id) {
        var self = this
        return new Promise(function(resolve, reject) {
            self.client.notification(id).markAsRead(function(error, items) {
                resolve()
            })

        })
    }
    getIssueTimeline(repo, id) {

        var self = this;
        return self.loadIssueData(repo, id)
            .then(function(issue_data) {



                var comments = [].concat(issue_data.issue_comments.filter(function(e) {
                    e.type = 'issue_comment';
                    return e
                }), issue_data.pr_reviews.filter(function(e) {
                    e.type = 'pr_review';
                    return e
                }), issue_data.issue_events.filter(function(e) {
                    e.type = 'events';
                    return e
                }))
                comments = comments.filter(function(n) {
                    //Kick out reply's - we only need reviews and issue-comments
                    //if(n && n.in_reply_to_id) return false
                    //  if(n.state == ' APPROVED') return false
                    return n != undefined
                })

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

                var comments_seen = {}
                var timeline = []
                comments.forEach(function(com) {

                    if (com.type == 'events') {
                        com.body = ""
                        com.state = "EVENT"
                        timeline.push({
                            event: com,
                            comment: com,
                            type: "event",
                            children: []
                        })
                        return;
                    }
                    if (comments_seen[com.id] === true) return;

                    var commentPayload = {
                        comment: com,
                        children: []
                    }
                    var skip_it = false

                    issue_data.pr_comments.forEach(function(pcomment) {

                        if (comments_seen[pcomment.id] === true) return;
                        if (pcomment.pull_request_review_id == com.id) {
                            var pr_comment = {
                                comment: pcomment,
                                children: []
                            };


                            issue_data.pr_comments.forEach(function(rcomment) {
                                if (comments_seen[rcomment.id] === true) return;
                                if (rcomment.in_reply_to_id == pcomment.id) {
                                    pr_comment.children.push({
                                        comment: rcomment,
                                        children: []
                                    })

                                    comments_seen[rcomment.id] = true


                                }
                            })
                            comments_seen[pcomment.id] = true
                            commentPayload.children.push(pr_comment);
                        }
                    })

                    comments_seen[com.id] = true
                    timeline.push(commentPayload)

                })
                timeline = timeline.filter(function(f) {
                    if (f && f.comment && f.comment.state == 'COMMENTED' && f.children.length == 0) return false
                    return f
                })


                issue_data.timeline = timeline
                return Promise.resolve(issue_data)
                console.log('===TIMELINE===')
                timeline.forEach(function(te) {
                    console.log('ID: ' + te.comment.id + '\t' + te.comment.state + '\t' + te.comment.body.substring(0, 20) + 'L: ' + te.children.length + "--_>" + te.comment.pull_request_review_id)

                    //console.log(JSON.stringify(te.comment, null, 2))
                    te.children.forEach(function(tec) {
                        console.log('\t\tID: ' + tec.comment.id + '\t' + tec.comment.state + '\t' + tec.comment.body.substring(0, 20) + " pr:" + tec.comment.pull_request_review_id + " rr:" + tec.comment.in_reply_to_id)
                        tec.children.forEach(function(tect) {
                            console.log('\t\t\tID: ' + tect.comment.id + '\t' + tect.comment.state + '\t' + tect.comment.body.substring(0, 20) + " pr:" + tect.comment.pull_request_review_id + " rr:" + tect.comment.in_reply_to_id)
                        })


                    })
                })


            })



    }
    getCommitsForPR(repo, id) {
        var pr = this.client.pr(repo, id)
            //var self = this
        return new Promise(function(resolve, reject) {
            pr.commits(function(error, commits) {
                //FIXME normalize
                var transformed = []
                commits.forEach(function(commit) {
                    transformed.push({
                        sha: commit.commit.tree.sha,
                        committer: {
                            name: commit.commit.committer.name
                        },
                        message: commit.commit.message
                    })
                })
                resolve(transformed)
            })
        })
    }
    loadIssueData(repo, id) {
        var self = this;
        var newState = {}
        return self.loadIssue(repo, id)
            .then(function(issue) {
                newState.issue = issue
                return Promise.resolve()

            })
            .then(() => {
                if (newState.is_pr) {
                    return self.loadPR(repo, id)
                } else {
                    return Promise.resolve([])
                }
            })
            .then(function(pr) {
                newState.pr = pr
                return Promise.resolve()
            })
            .then(() => {
                if (newState.is_pr) {
                    return self.loadPRReviews(repo, id)
                } else {
                    return Promise.resolve([])
                }
            })
            .then(function(pr_reviews) {
                newState.pr_reviews = pr_reviews
                return Promise.resolve()
            })
            .then(() => {

                if (newState.is_pr) {
                    return self.loadPRComments(repo, id)

                } else {
                    return Promise.resolve([])
                }
            })
            .then(function(pr_comments) {
                newState.pr_comments = pr_comments
                return Promise.resolve()
            })
            .then(() => self.loadIssueComments(repo, id))
            .then(function(issue_comments) {
                newState.issue_comments = issue_comments
                return Promise.resolve()
            })
            .then(() => self.loadIssueEvents(repo, id))
            .then(function(issue_events) {
                newState.issue_events = issue_events
                return Promise.resolve()
            })
            .then(function() {
                return Promise.resolve(newState)
            })


    }
    loadIssue(repo, id) {
        //Loads an Issue, and returns
        //issue
        //pr
        //and comments/timeline
        var self = this
        return new Promise(function(resolve, reject) {
            var issue = self.client.issue(repo, id)
            issue.info(function(error, issue_detail) {
                //FIXME: normalize
                if (issue_detail.pull_request) {
                    issue_detail.is_pr = true
                    issue_detail.diff_url = issue_detail.pull_request.diff_url
                }
                resolve(issue_detail)
            })
        })
    }
    loadIssueComments(repo, id) {
        var self = this
        return new Promise(function(resolve, reject) {
            var issue = self.client.issue(repo, id)
            issue.comments(function(error, comments) {
                if (error) {
                    resolve([])
                    return
                }
                //FIXME: normalize
                resolve(comments)
            })
        })


    }
    loadIssueEvents(repo, id) {
        var self = this
        return new Promise(function(resolve, reject) {
            var pr = self.client.get("/repos/" + repo + "/issues/" + id + "/events", {}, function(err, code, events) {
                resolve(events)
            })
        })

    }
    loadPRComments(repo, id) {
        var self = this
        return new Promise(function(resolve, reject) {
            var pr = self.client.pr(repo, id)
            pr.comments(function(error, comments) {
                //FIXME: normalize
                resolve(comments)
            })
        })


    }
    loadPRReviews(repo, id) {
        var self = this
        return new Promise(function(resolve, reject) {
            var pr = self.client.pr(repo, id)
            pr.reviews(function(error, reviews) {
                //FIXME: normalize
                resolve(reviews)
            })
        })

    }
    loadPR(repo, id) {
        //Loads an Issue, and returns
        //issue
        //pr
        //and comments/timeline
        var self = this
        return new Promise(function(resolve, reject) {
            var pr = self.client.pr(repo, id)
            pr.info(function(error, pr_detail) {
                //FIXME: normalize
                resolve(pr_detail)
            })
        })
    }

    getNotifications(options = {}) {
        var self = this
        return new Promise(function(resolve, reject) {
            self.client.me().notifications(options, function(err, notifications) {
                var transformed = []
                notifications.forEach(function(noti) {
                    var matches = noti.subject.url.match(/.*\/([0-9]+$)/)
                    transformed.push({
                        id: noti.id,
                        title: noti.subject.title,
                        repo: noti.repository.full_name,
                        target_id: matches[1]
                    })
                })
                resolve(transformed)
            })
        })

    }
}

module.exports = GithubDriver
