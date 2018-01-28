var blessed = require('blessed')
var notificationView = require('./notificationview.js')
var BottomBar = require('./bottombar.js')
var gitDriver = require('./github')

// Create a screen object.

//FIXME gitlab!
var driver = new gitDriver()


function marked(a) {
    return a;
}

function striptags(a) {
    return a
}

function walkComments(depth = 0, childs) {
    var self = this
    var cnt = ""
    var depthspacer = Array(depth).join("\t")
    childs.forEach(function(entryPayload) {

        if (entryPayload.type == 'event') {
            cnt += depthspacer + '──────────────────────────────────────\n'
            cnt += depthspacer + '{#00ff00-fg}User:{/} {underline}' + entryPayload.event.actor.login + '{/}\n'
            cnt += depthspacer + '{#00ff00-fg}Created:{/} {underline}' + entryPayload.event.created_at + '{/}\n'
            if (entryPayload.event.event == 'labeled') {
                cnt += depthspacer + " added label: {" + entryPayload.event.label.color + "}" + entryPayload.event.label.name + "{/}\n"
            }
        }
        if (entryPayload.comment.type == 'issue_comment') {

            cnt += depthspacer + '──────────────────────────────────────\n'
            cnt += depthspacer + '{#00ff00-fg}User:{/} {underline}' + entryPayload.comment.user.login + '{/}\n'
            cnt += depthspacer + '{#00ff00-fg}Created:{/} {underline}' + entryPayload.comment.created_at + '{/}\n'
            cnt += depthspacer + striptags(marked(entryPayload.comment.body)) + '\n'
        }
        if (entryPayload.comment.type == 'pr_review') {

            cnt += depthspacer + '──────────────────────────────────────\n'
            cnt += depthspacer + '{#00ff00-fg}User:{/} {underline}' + entryPayload.comment.user.login + '{/} submitted review: {underline}' + entryPayload.comment.submitted_at + '{/}\n'



            if (entryPayload.comment.diff_hunk) {
                var diff_lines = entryPayload.comment.diff_hunk.split("\n");
                diff_lines.forEach(function(l, idx) {
                    var color = "{white-fg}"
                    if (l.match(/^\-/)) {
                        color = "{red-fg}"
                    }
                    if (l.match(/^\+/)) {
                        color = "{green-fg}"
                    }
                    cnt += color + l + "{/}\n"
                    if (idx == entryPayload.comment.original_position) {
                        cnt += depthspacer + striptags(marked(entryPayload.comment.body)) + '\n'
                    }

                })
            } else {
                cnt += depthspacer + striptags(marked(entryPayload.comment.body)) + '\n'
            }


        }
        if (entryPayload.comment.type == 'pr_comment') {

            cnt += depthspacer + '──────────────────────────────────────\n'
            cnt += depthspacer + '{#00ff00-fg}User:{/} {underline}' + entryPayload.comment.user.login + '{/}\n'
            cnt += depthspacer + '{#00ff00-fg}Created:{/} {underline}' + entryPayload.comment.created_at + '{/}\n'
            if (entryPayload.comment.diff_hunk) {
                var diff_lines = entryPayload.comment.diff_hunk.split("\n");
                diff_lines.forEach(function(l, idx) {
                    var color = "{white-fg}"
                    if (l.match(/^\-/)) {
                        color = "{red-fg}"
                    }
                    if (l.match(/^\+/)) {
                        color = "{green-fg}"
                    }
                    cnt += color + l + "{/}\n"
                    if (idx == entryPayload.comment.original_position) {
                        cnt += striptags(marked(entryPayload.comment.body)) + '\n'
                    }

                })
            } else {
                cnt += depthspacer + striptags(marked(entryPayload.comment.body)) + '\n'
            }


        }


        console.log(entryPayload)
        if (entryPayload.children) {
            //console.error("CHILD", entryPayload)
            cnt += walkComments(depth, entryPayload.children)
        }
    })
    return cnt
}

//d = driver.loadIssueData('hjanuschka/termhawk', 1).then(function(dd) {
d = driver.getIssueTimeline('hjanuschka/termhawk', 1).then(function(dd) {
        var cnt = ""
        cnt += walkComments(0, dd.timeline)
        console.log(cnt)
    })
    .catch(function(e) {
        console.error(e)
    })
