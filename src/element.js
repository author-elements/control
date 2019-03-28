class AuthorFormControlElement extends AuthorBaseElement(HTMLElement) {
  constructor () {
    super(`{{TEMPLATE-STRING}}`)

    this.UTIL.defineAttributes({
      type: ''
    })

    this.UTIL.defineProperties({
      initialValue: {
        default: null
      },

      input: {
        private: true
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
      initDatalist: (input, datalist) => {
        this.type = 'select'

        if (!customElements.get('author-datalist')) {
          input.id = this.PRIVATE.guid
          datalist.id = `${input.id}_datalist`
          input.setAttribute('list', datalist.id)
          input.slot = input.slot || 'input'
          // select.setAttribute('role', 'menu')
          this.PRIVATE.input = input

          let titleEls = datalist.querySelectorAll('option[title]')
          titleEls.forEach(el => select.removeChild(el))

          Array.from(datalist.options).forEach(option => {
            if (option.hasAttribute('label') && option.getAttribute('label').trim() === '') {
              option.removeAttribute('label')
            }
          })

          return
        }

        let surrogate = document.createElement('author-datalist')
        surrogate.slot = 'input'

        Array.from(datalist.attributes).forEach(attr => {
          if (attr.specified) {
            surrogate.setAttribute(attr.name, attr.value)

            if (attr.name === 'autofocus') {
              datalist.removeAttribute(attr.name)
            }
          }
        })

        this.removeChild(datalist)
        this.removeChild(input)

        // Use a select as sourceElement to preserve option indexes, since
        // datalist doesn't assign indexes to child options
        let select = document.createElement('select')
        Array.from(datalist.children).forEach(option => select.add(option))

        surrogate.inject(input, select, this.PRIVATE.guid)
        this.appendChild(surrogate)
        this.PRIVATE.input = surrogate
      },

      initInput: input => {
        input.slot = input.slot || 'input'
        this.PRIVATE.input = input
        input.id = this.PRIVATE.guid
        this.initialValue = input.value

        if (this.PRIVATE.fieldInputTypes.indexOf(input.type) >= 0) {
          this.type = 'field'
        }

        if (this.PRIVATE.toggleInputTypes.indexOf(input.type) >= 0) {
          this.type = 'toggle'
        }
      },

      initLabel: label => {
        this.label = label
        label.slot = label.slot || 'label'
        label.htmlFor = this.PRIVATE.guid

        if (this.type === 'select') {
          this.label.addEventListener('click', (evt) => {
            this.input.focus()
          })
        }
      },

      initDefaultSelect: select => {
        select.id = this.PRIVATE.guid
        select.slot = select.slot || 'input'
        select.setAttribute('role', 'menu')
        this.PRIVATE.input = select

        // Purge incompatible attributes
        let titleEls = select.querySelectorAll('option[title]')
        titleEls.forEach(el => select.removeChild(el))

        Array.from(select.options).forEach(option => {
          if (option.hasAttribute('label') && option.getAttribute('label').trim() === '') {
            option.removeAttribute('label')
          }
        })
      },

      initMultipleSelectMenu: select => {
        this.type = 'select'
        this.initialValue = select.selectedOptions

        if (!customElements.get('author-select')) {
          return this.PRIVATE.initDefaultSelect(select)
        }

        this.PRIVATE.initSelectSurrogate(select, document.createElement('author-select'))
      },

      initSelectSurrogate: (original, surrogate) => {
        surrogate.slot = 'input'
        surrogate.id = this.PRIVATE.guid

        Array.from(original.attributes).forEach(attr => {
          if (attr.specified) {
            surrogate.setAttribute(attr.name, attr.value)

            if (attr.name === 'autofocus') {
              original.removeAttribute(attr.name)
            }
          }
        })

        this.removeChild(original)
        surrogate.inject(original, this.querySelectorAll('label'))

        this.appendChild(surrogate)
        this.PRIVATE.input = surrogate
      },

      initSelectMenu: select => {
        this.type = 'select'
        this.initialValue = select.selectedIndex

        if (!customElements.get('author-select')) {
          return this.PRIVATE.initDefaultSelect(select)
        }

        this.PRIVATE.initSelectSurrogate(select, document.createElement('author-select'))
      },

      transformChild: (node, index, collection) => {
        switch (node.nodeName) {
          case 'LABEL':
            return this.PRIVATE.initLabel(node)

          case 'INPUT':
            // Check if there is an additional element adjacent to the input
            if (collection[index + 1] === void 0) {
              return this.PRIVATE.initInput(node)
            }

            let adjacentElement = collection[index + 1].addedNodes.item(0);

            if (!adjacentElement || adjacentElement.nodeName !== 'DATALIST') {
              return this.PRIVATE.initInput(node)
            }

            return this.PRIVATE.initDatalist(node, adjacentElement)

          case 'TEXTAREA':
            return this.PRIVATE.initInput(node)

          case 'SELECT':
            if (!node.multiple) {
              return this.PRIVATE.initSelectMenu(node)
            }

            return this.PRIVATE.initMultipleSelectMenu(node)

          default:
            this.initialValue = node.value;
            return
        }
      }
    })

    this.UTIL.monitorChildren((mutations, observer) => {
      let filtered = mutations.filter(record => {
        let node = record.addedNodes.item(0)

        if (!node) {
          return false
        }

        return node.nodeType !== 3
      })

      filtered.forEach((record, index, array) => {
        let node = record.addedNodes.item(0)

        if (!node) {
          return
        }

        this.PRIVATE.transformChild(node, index, array)
      })

      observer.disconnect()
    })

    this.UTIL.registerListeners(this, {
      connected: () => this.PRIVATE.guid = this.UTIL.generateGuid('control_'),
      rendered: () => Array.from(this.children).forEach((child, index, array) => this.PRIVATE.transformChild(child, index, array))
    })
  }

  static get observedAttributes () {
    return ['disabled']
  }

  get input () {
    return this.PRIVATE.input
  }

  set input (input) {
    if (this.input) {
      return console.warn(`Setting <${this.localName}> child input programmatically is not allowed.`)
    }

    this.PRIVATE.input = input
  }
}

customElements.define('author-control', AuthorFormControlElement)

export default AuthorFormControlElement
