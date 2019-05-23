const Demo = new NGNX.VIEW.Registry({
  selector: '.demo',
  namespace: 'demo.',

  references: {
    content: 'main .content',
    input: '#input',
    textarea: '#textarea',
    datalist: '#datalist',
    select: '#select',
    submitButton: 'button.submit'
  },

  templates: {
    select: './js/templates/select.html'
  },

  init () {
    window.input = this.ref.input
    window.textarea = this.ref.textarea
    window.datalist = this.ref.datalist
    window.select = this.ref.select

    input.on('invalid', evt => console.log(evt))

    // setTimeout(() => select.element.input.focus(), 2000)
    // this.render('select', {}, this.ref.content.element)
  }
})
