var blessed = require( 'blessed' )
var notificationView = require('./notificationview.js')
var BottomBar = require('./bottombar.js')
var gitDriver = require("./github")

// Create a screen object.

//FIXME gitlab!
var driver = new gitDriver();

d = driver.loadIssueData("hjanuschka/termhawk", 1).then(function(dd) {

  console.error(dd);
  process.exit;
})

