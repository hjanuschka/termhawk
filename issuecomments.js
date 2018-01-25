var marked = require('marked')
var TerminalRenderer = require('marked-terminal')
var blessed = require('blessed')
var striptags = require('striptags')
var fetch = require('node-fetch')


class IssueComments {
    constructor(client, repo, id) {
        this.client = client
        this.repo = repo
        this.id = id
        this.issueInfo = {}
    }
    loadIssue() {
        var self = this
        return new Promise(function(resolve, reject) {
            self.issue = self.client.issue(self.repo, self.id)
            self.issue.info(function(error, issue_detail) {
                self.issueInfo.detail = issue_detail
                if(issue_detail.pull_request) {
                    self.pr = self.client.pr(self.repo, self.id)
                    self.issueInfo.is_pr = true

                }
                resolve()
            })
        })
    }

    loadIssueComments() {
        var self = this
        return new Promise(function(resolve, reject) {
            self.issue.comments(function(e, comments) {
                self.issueInfo.comments = {issue: comments}
                resolve()
            })

        })
    }
    loadPR() {
        var self = this
        return new Promise(function(resolve, reject) {
            if(self.issueInfo.is_pr) {
                self.pr.info(function(e, pr_info) {
                    self.issueInfo.pr = pr_info
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }

    loadPRComments() {
        var self = this
        return new Promise(function(resolve, reject) {
            if(self.issueInfo.is_pr) {
                self.pr.comments(function(e, comments) {
                    self.issueInfo.comments.pr = comments
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }
    buildTimeline() {
        var self = this
        var timeline = [].concat(self.issueInfo.comments.issue, self.issueInfo.comments.pr, self.issueInfo.comments.pr_reviews)
        timeline.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            var a_date = a.created_at
            var b_date = b.created_at
            if(!a.created_at) {
                a_date = a.submitted_at
            }
            if(!b.created_at) {
                b_date = b.submitted_at
            }
            return new Date(b_date) - new Date(a_date)
        })
        self.issueInfo.timeline = timeline.reverse()
        return Promise.resolve()

    }
    loadPRReviews() {
        var self = this
        return new Promise(function(resolve, reject) {
            if(self.issueInfo.is_pr) {
                self.pr.reviews(function(e, comments) {
                    self.issueInfo.comments.pr_reviews = comments
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }
    load() {
        var self = this
        return self.loadIssue()
						.then(self.loadPR.bind(this))
            .then(self.loadIssueComments.bind(this))
            .then(self.loadPRComments.bind(this))
            .then(self.loadPRReviews.bind(this))
            .then(self.buildTimeline.bind(this))
            .then(function() {

                return Promise.resolve(self.issueInfo)
            })
            .catch(function(e) {
            })

    }



}

module.exports = IssueComments
