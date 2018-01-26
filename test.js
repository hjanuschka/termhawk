var blessed = require('blessed')
var notificationView = require('./notificationview.js')
var BottomBar = require('./bottombar.js')
var gitDriver = require('./github')

// Create a screen object.

//FIXME gitlab!
var driver = new gitDriver()

d = driver.loadIssueData('hjanuschka/termhawk', 1).then(function(dd) {
    //        d = driver.loadIssueData('fastlane/fastlane', 11702).then(function(dd) {


    var comments = [].concat(dd.issue_comments, dd.pr_reviews, dd.pr_comments)
    comments = comments.filter(function(n) {
        if (n && n.in_reply_to_id) return false
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

        if (comments_seen[com.id] === true) return;

        var commentPayload = {
            comment: com,
            children: []
        }
        var skip_it = false
        dd.pr_reviews.forEach(function(rev) {
            if (comments_seen[rev.id] === true) {
                return
            }
            if (rev.id == com.pull_request_review_id) {
                commentPayload.comment = rev
                commentPayload.children.push({
                        comment: com,
                        children: []
                    })
                    //com = rev

                comments_seen[rev.id] = true

            }
        })



        dd.pr_comments.forEach(function(pcomment) {

            //if (comments_seen[pcomment.id] === true) return;
            if (pcomment.in_reply_to_id == com.id || pcomment.pull_request_review_id == com.id) {

                commentPayload.children.push({
                    comment: pcomment,
                    children: []
                })
                comments_seen[pcomment.id] = true
                comments_seen[pcomment.pull_request_review_id] = true
            }
        })

        comments_seen[com.id] = true
        comments_seen[com.pull_request_review_id] = true
        timeline.push(commentPayload)

    })

    console.log('===TIMELINE===')
    timeline.forEach(function(te) {
        console.log('ID: ' + te.comment.id + '\t' + te.comment.state + '\t' + te.comment.body.substring(0, 20) + 'L: ' + te.children.length + "--_>" + te.comment.pull_request_review_id)

        //console.log(JSON.stringify(te.comment, null, 2))
        te.children.forEach(function(tec) {
            console.log('\t\tID: ' + tec.comment.id + '\t' + tec.comment.state + '\t' + tec.comment.body.substring(0, 20))
        })
    })

})
