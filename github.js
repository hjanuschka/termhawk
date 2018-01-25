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
                resolve(issue_detail)
            })
        })
    }
    loadIssueComments(repo, id) {
        var self = this
        return new Promise(function(resolve, reject) {
            var pr = self.client.pr(repo, id)
            pr.comments(function(error, comments) {
                //FIXME: normalize
                resolve(comments)
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
