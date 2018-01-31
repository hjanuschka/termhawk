var Blessed = require('blessed')
var DiffComment = require('./diff-comment')

var screen = Blessed.screen({
    smartCSR: true,
    useBCE: true
})

var diff = require('./diff-comment')
var d = DiffComment({
    height: '100%',
    padding: 1,
    tags: true,
    border: 'line',
    width: '100%',
    parent: screen
})
screen.render()

