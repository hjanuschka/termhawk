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
      console.log(repo, id)
        return self.loadIssue(repo, id)
            .then(function(issue) {
                newState.issue = issue
                return Promise.resolve()

            })
            .then(() => self.loadPR(repo, id))
            .then(function(pr) {
                newState.pr = pr
                return Promise.resolve()
            })
            .then(() => self.loadPRReviews(repo, id))
            .then(function(pr_reviews) {
                newState.pr_reviews = pr_reviews
                return Promise.resolve()
            })
            .then(() => self.loadPRComments(repo, id))
            .then(function(pr_comments) {
                newState.pr_comments = pr_comments
                return Promise.resolve()
            })
            .then(() => self.loadIssueComments(repo, id))
            .then(function(issue_comments) {
                newState.issue_comments = issue_comments
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
                //FIXME: normalize
                resolve(comments)
            })
        })


    }
    loadIssueEvents(repo, id) {
        var self = this
        return new Promise(function(resolve, reject) {
            var pr = self.client.get("/repos/" + repo + "/" + id + "/issues/" + id + "/comments", {}, function(err, events) {
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
