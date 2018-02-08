var blessed = require('blessed')
var notificationView = require('./notificationview.js')
var BottomBar = require('./bottombar.js')
var gitDriver = require('./github')

// Create a screen object.

//FIXME gitlab!
var driver = new gitDriver()

driver.loadPRComments('fastlane/fastlane', 11418).then(function(d) {
    console.log(d)
})
