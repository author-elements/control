class AuthorFormControlElement extends AuthorBaseElement(HTMLElement) {
  constructor () {
    super(`{{TEMPLATE-STRING}}`)

    this.UTIL.defineAttributes({
      type: ''
    })

    this.UTIL.defineProperties({
      initialized: {
        private: true,
        default: false
      },

      initialValue: {
        default: null
      },

      labels: {
        readonly: true,
        get: () => this.PRIVATE.labelElements
      },

      labelElements: {
        private: true,
        default: []
      },

      datalist: {
        readonly: true,
        get: () => this.PRIVATE.datalistElement
      },

      datalistElement: {
        private: true,
        default: null
      },

      datalistSourceElement: {
        private: true,
        default: null
      },

      input: {
        readonly: true,
        get: () => this.PRIVATE.inputElement
      },

      inputElement: {
        private: true,
        default: null
      },

      inputSourceElement: {
        private: true,
        default: null
      },

      fieldInputTypes: {
        readonly: true,
        private: true,
        default: [
          'color',
          'date',
          'datetime-local',
          'email',
          'file',
          'hidden',
          'image',
          'month',
          'number',
          'password',
          'range',
          'reset',
          'search',
          'submit',
          'tel',
          'text',
          'time',
          'url',
          'week',
          'textarea'
        ]
      },

      toggleInputTypes: {
        readonly: true,
        private: true,
        default: [
          'checkbox',
          'radio'
        ],
      },

      supportedTypes: {
        readonly: true,
        private: true,
        default: [
          'field',
          'toggle',
          'select'
        ]
      }
    })

    this.UTIL.definePrivateMethods({
      catalogChild: node => {
        switch (node.nodeName) {
          case 'LABEL':
            node.htmlFor = this.PRIVATE.guid
            this.PRIVATE.labelElements.push(node)
            return

          case 'INPUT':
          case 'TEXTAREA':
            node.id = this.PRIVATE.guid
            this.PRIVATE.inputSourceElement = node
            return

          case 'SELECT':
            this.PRIVATE.inputSourceElement = node
            return

          case 'DATALIST':
            this.PRIVATE.datalistSourceElement = node
            return

          default: if (node.children.length > 0) {
            return Array.from(node.children).forEach(child => this.PRIVATE.catalogChild(child))
          }
        }
      },

      init: () => {
        this.initialValue = this.PRIVATE.inputSourceElement.value

        switch (this.PRIVATE.inputSourceElement.nodeName) {
          case 'INPUT':
            this.PRIVATE.inputElement = this.PRIVATE.inputSourceElement

            if (this.PRIVATE.datalistSourceElement) {
              this.type = 'datalist'

              if (!customElements.get('author-datalist')) {
                this.PRIVATE.initDefaultDatalist()
                break
              }

              this.PRIVATE.initAuthorDatalist()

            } else if (this.PRIVATE.fieldInputTypes.indexOf(this.PRIVATE.inputElement.type) >= 0) {
              this.type = 'field'
            } else if (this.PRIVATE.toggleInputTypes.indexOf(this.PRIVATE.inputElement.type) >= 0) {
              this.type = 'toggle'
            }

            break

          case 'TEXTAREA':
            this.PRIVATE.inputElement = this.PRIVATE.inputSourceElement
            this.type = 'textarea'
            break

          case 'SELECT':
            this.type = 'select'

            if (!customElements.get('author-select')) {
              this.PRIVATE.initDefaultSelect()
              break
            }

            this.PRIVATE.initAuthorSelect()
            break
        }

        this.PRIVATE.initialized = true
        this.emit('initialized')
      },

      initAuthorDatalist: () => {
        let { datalistSourceElement, inputElement, guid } = this.PRIVATE

        let authorDatalist = document.createElement('author-datalist')

        Array.from(datalistSourceElement.attributes).forEach(attr => {
          if (attr.specified) {
            authorDatalist.setAttribute(attr.name, attr.value)

            if (attr.name === 'autofocus') {
              datalistSourceElement.removeAttribute(attr.name)
            }
          }
        })

        this.removeChild(inputElement)

        // Use a select as sourceElement to preserve option indexes, since
        // datalist doesn't assign indexes to child options
        let surrogate = document.createElement('select')
        Array.from(datalistSourceElement.children).forEach(option => surrogate.add(option))
        surrogate.selectedIndex = -1

        authorDatalist.inject(inputElement, surrogate, guid)
        this.replaceChild(authorDatalist, datalistSourceElement)
        this.PRIVATE.input = authorDatalist
      },

      initDefaultDatalist: () => {
        let { datalistSourceElement, inputElement, guid } = this.PRIVATE

        datalistSourceElement.id = `${guid}_datalist`
        inputElement.setAttribute('list', datalistSourceElement.id)

        this.PRIVATE.datalistElement = datalistSourceElement
      },

      initDefaultSelect: () => {
        let { inputSourceElement } = this.PRIVATE

        inputSourceElement.id = this.PRIVATE.guid
        inputSourceElement.setAttribute('role', 'menu')

        this.PRIVATE.inputElement = inputSourceElement
      },

      initAuthorSelect: () => {
        let { inputSourceElement } = this.PRIVATE
        let authorSelect = document.createElement('author-select')

        authorSelect.id = this.PRIVATE.guid

        Array.from(inputSourceElement.attributes).forEach(attr => {
          if (attr.specified) {
            authorSelect.setAttribute(attr.name, attr.value)

            if (attr.name === 'autofocus') {
              inputSourceElement.removeAttribute(attr.name)
            }
          }
        })

        authorSelect.inject(inputSourceElement, this.labels)

        this.replaceChild(authorSelect, inputSourceElement)
        this.PRIVATE.inputElement = authorSelect

        // This is required for label clicks to focus author-select
        this.labels.forEach(label => {
          this.UTIL.registerListener(label, 'click', evt => this.PRIVATE.inputElement.focus())
        })
      }
    })

    this.UTIL.registerListeners(this, {
      connected: () => this.PRIVATE.guid = this.UTIL.generateGuid('control_'),
      rendered: () => {
        Array.from(this.children).forEach(child => this.PRIVATE.catalogChild(child))
        this.PRIVATE.init()
      }
    })
  }

  static get observedAttributes () {
    return ['disabled']
  }
}

customElements.define('author-control', AuthorFormControlElement)

export default AuthorFormControlElement
