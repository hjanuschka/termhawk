var blessed = require("blessed")

class IssueView {
  constructor(root, id) {
    this.root = root;
    this.id = id;
  }
  focus() {
    this.box.focus();
  }
  setState(state) {
    this.state = state;
    this.reRender();
  }
  reRender() {
  }
  createView() {
    this.box = blessed.box( {
    'border': { 'type': 'line' },
    'parent': this.root,
      'tags': true,
    'content': 'Hello {bold}world{/bold}\nasdas\nasdasd!',
    'height': '100%-3',
    'width': '100%',
      'top': 0,
      'left': 0,
    'style': {
        'bg': 'yellow',
        'border': { 'fg': '#f0f0f0' },
        'fg': 'black',
        'hover': { 'bg': 'green' }
    }
    } )
    this.events();
    this.box.screen.render();

  }
  remove() {
    this.root.remove(this.box)
    this.root.screen.render();
  }
  events() {
    var self = this;
    this.box.key(["h"], function(ch, key) {
      self.remove();
    })
  }
}

module.exports = IssueView
