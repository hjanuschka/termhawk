var blessed = require('blessed')
var notificationView = require('./notificationview.js')
var BottomBar = require('./bottombar.js')
var gitDriver = require('./github')

// Create a screen object.

//FIXME gitlab!
var driver = new gitDriver()

//d = driver.loadIssueData('hjanuschka/termhawk', 1).then(function(dd) {
            d = driver.loadIssueData('fastlane/fastlane', 11627).then(function(dd) {


    var comments = [].concat(dd.issue_comments, dd.pr_reviews)
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

      if (comments_seen[com.id] === true) return;

        var commentPayload = {
            comment: com,
            children: []
        }
        var skip_it = false

        dd.pr_comments.forEach(function(pcomment) {
            
          if (comments_seen[pcomment.id] === true) return;
            if (pcomment.pull_request_review_id == com.id ) {
              var pr_comment = {
                    comment: pcomment,
                    children: []
                };


              dd.pr_comments.forEach(function(rcomment) {
                if (comments_seen[rcomment.id] === true) return;
                if(rcomment.in_reply_to_id == pcomment.id) {
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
                if(f && f.comment.state == 'COMMENTED' && f.children.length == 0) return false
                return f
              })

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
