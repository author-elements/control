const Demo = new NGNX.VIEW.Registry({
  selector: '.demo',
  namespace: 'demo.',

  references: {
    content: 'main .content'
  },

  templates: {
    select: './js/templates/select.html'
  },

  init () {
    this.render('select', {}, this.ref.content.element)
  }
})
