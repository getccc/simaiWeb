import type { LGraphNode, IWidget } from '@comfyorg/litegraph'
import { Editor as TiptapEditor } from '@tiptap/core'
import TiptapStarterKit from '@tiptap/starter-kit'
import { Markdown as TiptapMarkdown } from 'tiptap-markdown'
import TiptapLink from '@tiptap/extension-link'

const wind:any = window
const graph = wind["graph"];
const canvas = wind["canvas"];
// app.   node.   canvas.   graph.

export type ComfyWidgetConstructor = (
    node: LGraphNode,
    inputName: string,
    inputData: any,
    app?: any,
    widgetName?: string
) => { widget: IWidget; minWidth?: number; minHeight?: number }
const IS_CONTROL_WIDGET = Symbol()
const HAS_EXECUTED = Symbol()
let controlValueRunBefore = false

export function updateControlWidgetLabel(widget:any) {
  let replacement = 'after'
  let find = 'before'
  if (controlValueRunBefore) {
    ;[find, replacement] = [replacement, find]
  }
  widget.label = (widget.label ?? widget.name).replace(find, replacement)
}

function isSlider(display:any, app:any) {
    // --注释代码
    // if (app.ui.settings.getSettingValue('Comfy.DisableSliders')) {
    //   return 'number'
    // }
    return display === 'slider' ? 'slider' : 'number'
}
function getNumberDefaults(inputData:any, defaultStep:any, precision:any, enable_rounding:any) {
  let defaultVal = inputData[1]['default']
  let { min, max, step, round } = inputData[1]

  if (defaultVal == undefined) defaultVal = 0
  if (min == undefined) min = 0
  if (max == undefined) max = 2048
  if (step == undefined) step = defaultStep
  // precision is the number of decimal places to show.
  // by default, display the the smallest number of decimal places such that changes of size step are visible.
  if (precision == undefined) {
    precision = Math.max(-Math.floor(Math.log10(step)), 0)
  }

  if (enable_rounding && (round == undefined || round === true)) {
    // by default, round the value to those decimal places shown.
    round = Math.round(1000000 * Math.pow(0.1, precision)) / 1000000
  }

  return {
    val: defaultVal,
    config: { min, max, step: 10.0 * step, round, precision }
  }
}
function createIntWidget(node:any, inputName:any, inputData:any, app:any, isSeedInput: boolean = false) {
    const control = inputData[1]?.control_after_generate
    if (!isSeedInput && control) {
      return seedWidget( node, inputName, inputData, app, typeof control === 'string' ? control : undefined )
    }
  
    let widgetType = isSlider(inputData[1]['display'], app)
    const { val, config } = getNumberDefaults(inputData, 1, 0, true)
    Object.assign(config, { precision: 0 })
    return {
      widget: node.addWidget(
        widgetType,
        inputName,
        val,
        function (v:any) {
          const s = this.options.step / 10
          let sh = this.options.min % s
          if (isNaN(sh)) {
            sh = 0
          }
          this.value = Math.round((v - sh) / s) * s + sh
        },
        config
      )
    }
}

function addMultilineWidget(node:any, name: string, opts:any, app: any) {
    const inputEl = document.createElement('textarea')
    inputEl.className = 'comfy-multiline-input'
    inputEl.value = opts.defaultVal
    inputEl.placeholder = opts.placeholder || name
    // --注释代码
    // if (app.vueAppReady) {
      // inputEl.spellcheck = useSettingStore().get('Comfy.TextareaWidget.Spellcheck')
      inputEl.spellcheck = false
    // }
  
    const widget = node.addDOMWidget(name, 'customtext', inputEl, {
      getValue() {
        return inputEl.value
      },
      setValue(v:any) {
        inputEl.value = v
      }
    })
    widget.inputEl = inputEl
  
    inputEl.addEventListener('input', () => {
      widget.callback?.(widget.value)
    })
    // --注释代码
    inputEl.addEventListener('pointerdown', (event: PointerEvent) => {
      if (event.button === 1) {
        canvas.processMouseDown(event)
      }
    })
  
    inputEl.addEventListener('pointermove', (event: PointerEvent) => {
      if ((event.buttons & 4) === 4) {
        canvas.processMouseMove(event)
      }
    })
  
    inputEl.addEventListener('pointerup', (event: PointerEvent) => {
      if (event.button === 1) {
        canvas.processMouseUp(event)
      }
    })
  
    return { minWidth: 400, minHeight: 200, widget }
}

function addMarkdownWidget(node:any, name: string, opts:any, app: any) {
    TiptapMarkdown.configure({
      html: false,
      breaks: true,
      transformPastedText: true
    })
    const editor:any = new TiptapEditor({
      extensions: [TiptapStarterKit, TiptapMarkdown, TiptapLink],
      content: opts.defaultVal,
      editable: false
    })
  
    const inputEl:any = editor.options.element
    inputEl.classList.add('comfy-markdown')
    const textarea = document.createElement('textarea')
    inputEl.append(textarea)
  
    const widget = node.addDOMWidget(name, 'MARKDOWN', inputEl, {
      getValue() {
        return textarea.value
      },
      setValue(v:any) {
        textarea.value = v
        editor.commands.setContent(v)
      }
    })
    widget.inputEl = inputEl
  
    editor.options.element.addEventListener(
      'pointerdown',
      (event: PointerEvent) => {
        if (event.button !== 0) {
          // --注释代码
          canvas.processMouseDown(event)
          return
        }
        if (event.target instanceof HTMLAnchorElement) {
          return
        }
        inputEl.classList.add('editing')
        setTimeout(() => {
          textarea.focus()
        }, 0)
      }
    )
  
    textarea.addEventListener('blur', () => {
      inputEl.classList.remove('editing')
    })
  
    textarea.addEventListener('change', () => {
      editor.commands.setContent(textarea.value)
      widget.callback?.(widget.value)
    })
  
    inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
      event.stopPropagation()
    })
    // --注释代码
    inputEl.addEventListener('pointerdown', (event: PointerEvent) => {
      if (event.button === 1) {
        canvas.processMouseDown(event)
      }
    })
  
    inputEl.addEventListener('pointermove', (event: PointerEvent) => {
      if ((event.buttons & 4) === 4) {
        canvas.processMouseMove(event)
      }
    })
  
    inputEl.addEventListener('pointerup', (event: PointerEvent) => {
      if (event.button === 1) {
        canvas.processMouseUp(event)
      }
    })
  
    return { minWidth: 400, minHeight: 200, widget }
}

export function addValueControlWidget(node:any, targetWidget:any, defaultValue = 'randomize', values:any, widgetName:any, inputData:any) {
    let name = inputData[1]?.control_after_generate
    if (typeof name !== 'string') {
      name = widgetName
    }
    const widgets = addValueControlWidgets(
      node,
      targetWidget,
      defaultValue,
      {
        addFilterList: false,
        controlAfterGenerateName: name
      },
      inputData
    )
    return widgets[0]
}
  
export function addValueControlWidgets(node:any, targetWidget:any, defaultValue = 'randomize', options:any, inputData:any) {
    if (!defaultValue) defaultValue = 'randomize'
    if (!options) options = {}
  
    const getName = (defaultName:any, optionName:any) => {
      let name = defaultName
      if (options[optionName]) {
        name = options[optionName]
      } else if (typeof inputData?.[1]?.[defaultName] === 'string') {
        name = inputData?.[1]?.[defaultName]
      } else if (inputData?.[1]?.control_prefix) {
        name = inputData?.[1]?.control_prefix + ' ' + name
      }
      return name
    }
  
    const widgets = []
    const valueControl = node.addWidget(
      'combo',
      getName('control_after_generate', 'controlAfterGenerateName'),
      defaultValue,
      function () {},
      {
        values: ['fixed', 'increment', 'decrement', 'randomize'],
        serialize: false // Don't include this in prompt.
      }
    )
    valueControl.tooltip =
      'Allows the linked widget to be changed automatically, for example randomizing the noise seed.'
    valueControl[IS_CONTROL_WIDGET] = true
    updateControlWidgetLabel(valueControl)
    widgets.push(valueControl)
  
    const isCombo = targetWidget.type === 'combo'
    let comboFilter:any
    if (isCombo) {
      valueControl.options.values.push('increment-wrap')
    }
    if (isCombo && options.addFilterList !== false) {
      comboFilter = node.addWidget(
        'string',
        getName('control_filter_list', 'controlFilterListName'),
        '',
        function () {},
        {
          serialize: false // Don't include this in prompt.
        }
      )
      updateControlWidgetLabel(comboFilter)
      comboFilter.tooltip =
        "Allows for filtering the list of values when changing the value via the control generate mode. Allows for RegEx matches in the format /abc/ to only filter to values containing 'abc'."
  
      widgets.push(comboFilter)
    }
  
    const applyWidgetControl = () => {
      var v = valueControl.value
  
      if (isCombo && v !== 'fixed') {
        let values = targetWidget.options.values
        const filter = comboFilter?.value
        if (filter) {
          let check
          if (filter.startsWith('/') && filter.endsWith('/')) {
            try {
              const regex = new RegExp(filter.substring(1, filter.length - 1))
              check = (item:any) => regex.test(item)
            } catch (error) {
              console.error(
                'Error constructing RegExp filter for node ' + node.id,
                filter,
                error
              )
            }
          }
          if (!check) {
            const lower = filter.toLocaleLowerCase()
            check = (item:any) => item.toLocaleLowerCase().includes(lower)
          }
          values = values.filter((item:any) => check(item))
          if (!values.length && targetWidget.options.values.length) {
            console.warn(
              'Filter for node ' + node.id + ' has filtered out all items',
              filter
            )
          }
        }
        let current_index = values.indexOf(targetWidget.value)
        let current_length = values.length
  
        switch (v) {
          case 'increment':
            current_index += 1
            break
          case 'increment-wrap':
            current_index += 1
            if (current_index >= current_length) {
              current_index = 0
            }
            break
          case 'decrement':
            current_index -= 1
            break
          case 'randomize':
            current_index = Math.floor(Math.random() * current_length)
            break
          default:
            break
        }
        current_index = Math.max(0, current_index)
        current_index = Math.min(current_length - 1, current_index)
        if (current_index >= 0) {
          let value = values[current_index]
          targetWidget.value = value
          targetWidget.callback(value)
        }
      } else {
        //number
        let min = targetWidget.options.min
        let max = targetWidget.options.max
        // limit to something that javascript can handle
        max = Math.min(1125899906842624, max)
        min = Math.max(-1125899906842624, min)
        let range = (max - min) / (targetWidget.options.step / 10)
  
        //adjust values based on valueControl Behaviour
        switch (v) {
          case 'fixed':
            break
          case 'increment':
            targetWidget.value += targetWidget.options.step / 10
            break
          case 'decrement':
            targetWidget.value -= targetWidget.options.step / 10
            break
          case 'randomize':
            targetWidget.value =
              Math.floor(Math.random() * range) *
                (targetWidget.options.step / 10) +
              min
            break
          default:
            break
        }
        /*check if values are over or under their respective
         * ranges and set them to min or max.*/
        if (targetWidget.value < min) targetWidget.value = min
  
        if (targetWidget.value > max) targetWidget.value = max
        targetWidget.callback(targetWidget.value)
      }
    }
  
    valueControl.beforeQueued = () => {
      if (controlValueRunBefore) {
        // Don't run on first execution
        if (valueControl[HAS_EXECUTED]) {
          applyWidgetControl()
        }
      }
      valueControl[HAS_EXECUTED] = true
    }
  
    valueControl.afterQueued = () => {
      if (!controlValueRunBefore) {
        applyWidgetControl()
      }
    }
  
    return widgets
}
const seedWidget = (node:any, inputName:any, inputData: any, app:any, widgetName:any) => {
    const seed:any = createIntWidget(node, inputName, inputData, app, true)
    const seedControl = addValueControlWidget(
        node,
        seed.widget,
        'randomize',
        undefined,
        widgetName,
        inputData
    )

    seed.widget.linkedWidgets = [seedControl]
    return seed
}

export const widgets: Record<string, ComfyWidgetConstructor> = {
    'INT:seed': seedWidget,
    'INT:noise_seed': seedWidget,
    FLOAT(node:any, inputName:any, inputData:any, app:any) {
      let widgetType: 'number' | 'slider' = isSlider(inputData[1]['display'], app)
      // --注释代码
      // let precision = app.ui.settings.getSettingValue(
      //   'Comfy.FloatRoundingPrecision'
      // )
      // let disable_rounding = app.ui.settings.getSettingValue(
      //   'Comfy.DisableFloatRounding'
      // )
      // if (precision == 0) precision = undefined
      let precision = undefined
      let disable_rounding = undefined
      const { val, config } = getNumberDefaults(inputData, 0.5, precision, !disable_rounding)
      return {
        widget: node.addWidget(
          widgetType,
          inputName,
          val,
          function (v:any) {
            if (config.round) {
              this.value =
                Math.round((v + Number.EPSILON) / config.round) * config.round
              if (this.value > config.max) this.value = config.max
              if (this.value < config.min) this.value = config.min
            } else {
              this.value = v
            }
          },
          config
        )
      }
    },
    INT(node:any, inputName:any, inputData:any, app:any) {
      return createIntWidget(node, inputName, inputData, app)
    },
    BOOLEAN(node:any, inputName:any, inputData:any) {
      let defaultVal = false
      let options:any = {}
      if (inputData[1]) {
        if (inputData[1].default) defaultVal = inputData[1].default
        if (inputData[1].label_on) options['on'] = inputData[1].label_on
        if (inputData[1].label_off) options['off'] = inputData[1].label_off
      }
      return {
        widget: node.addWidget('toggle', inputName, defaultVal, () => {}, options)
      }
    },
    STRING(node:any, inputName:any, inputData:any, app:any) {
      const defaultVal = inputData[1].default || ''
      const multiline = !!inputData[1].multiline
  
      let res
      if (multiline) {
        console.log(node)
        res = addMultilineWidget(
          node,
          inputName,
          { defaultVal, ...inputData[1] },
          app
        )
      } else {
        res = {
          widget: node.addWidget('text', inputName, defaultVal, () => {}, {})
        }
      }
  
      if (inputData[1].dynamicPrompts != undefined)
        res.widget.dynamicPrompts = inputData[1].dynamicPrompts
  
      return res
    },
    MARKDOWN(node:any, inputName:any, inputData:any, app:any) {
      const defaultVal = inputData[1].default || ''
  
      let res
      res = addMarkdownWidget(
        node,
        inputName,
        { defaultVal, ...inputData[1] },
        app
      )
      return res
    },
    COMBO(node:any, inputName:any, inputData:any) {
      const type = inputData[0]
      let defaultValue = type[0]
      if (inputData[1] && inputData[1].default) {
        defaultValue = inputData[1].default
      }
      const res = {
        widget: node.addWidget('combo', inputName, defaultValue, () => {}, {
          values: type
        })
      }
      if (inputData[1]?.control_after_generate) {
        // TODO make combo handle a widget node type?
        res.widget.linkedWidgets = addValueControlWidgets(
          node,
          res.widget,
          undefined,
          undefined,
          inputData
        )
      }
      return res
    },
    IMAGEUPLOAD(node: LGraphNode | any, inputName: string, inputData:any, app:any) {
      // TODO make image upload handle a custom node type?
      const imageWidget = node.widgets.find((w:any) => w.name === (inputData[1]?.widget ?? 'image'))
      let uploadWidget:any
  
      function showImage(name:any) {
        const img = new Image()
        img.onload = () => {
          node.imgs = [img]
          graph.setDirtyCanvas(true)
        }
        let folder_separator = name.lastIndexOf('/')
        let subfolder = ''
        if (folder_separator > -1) {
          subfolder = name.substring(0, folder_separator)
          name = name.substring(folder_separator + 1)
        }
        img.src = ''
        // --注释代码
        // api.apiURL(
        //   `/view?filename=${encodeURIComponent(name)}&type=input&subfolder=${subfolder}${app.getPreviewFormatParam()}${app.getRandParam()}`
        // )
        node.setSizeForImage?.()
      }
  
      var default_value = imageWidget.value
      Object.defineProperty(imageWidget, 'value', {
        set: function (value) {
          this._real_value = value
        },
  
        get: function () {
          if (!this._real_value) {
            return default_value
          }
  
          let value = this._real_value
          if (value.filename) {
            let real_value = value
            value = ''
            if (real_value.subfolder) {
              value = real_value.subfolder + '/'
            }
  
            value += real_value.filename
  
            if (real_value.type && real_value.type !== 'input')
              value += ` [${real_value.type}]`
          }
          return value
        }
      })
  
      // Add our own callback to the combo widget to render an image when it changes
      // TODO: Explain this?
      const cb = node.callback
      imageWidget.callback = function () {
        showImage(imageWidget.value)
        if (cb) {
          return cb.apply(this, arguments)
        }
      }
  
      // On load if we have a value then render the image
      // The value isnt set immediately so we need to wait a moment
      // No change callbacks seem to be fired on initial setting of the value
      requestAnimationFrame(() => {
        if (imageWidget.value) {
          showImage(imageWidget.value)
        }
      })
  
      async function uploadFile(file:any, updateNode:any, pasted = false) {
        try {
          // Wrap file in formdata so it includes filename
          const body = new FormData()
          body.append('image', file)
          if (pasted) body.append('subfolder', 'pasted')
          // --注释代码
          // const resp = await api.fetchApi('/upload/image', {
          //   method: 'POST',
          //   body
          // })
  
          // if (resp.status === 200) {
          //   const data = await resp.json()
          //   // Add the file to the dropdown list and update the widget value
          //   let path = data.name
          //   if (data.subfolder) path = data.subfolder + '/' + path
  
          //   if (!imageWidget.options.values.includes(path)) {
          //     imageWidget.options.values.push(path)
          //   }
  
          //   if (updateNode) {
          //     showImage(path)
          //     imageWidget.value = path
          //   }
          // } else {
          //   console.log(resp.status + ' - ' + resp.statusText)
          //   // useToastStore().addAlert(resp.status + ' - ' + resp.statusText)
          // }
        } catch (error) {
          console.log(error)
          // useToastStore().addAlert(error)
        }
      }
  
      const fileInput:any = document.createElement('input')
      Object.assign(fileInput, {
        type: 'file',
        accept: 'image/jpeg,image/png,image/webp',
        style: 'display: none',
        onchange: async () => {
          if (fileInput.files.length) {
            await uploadFile(fileInput.files[0], true)
          }
        }
      })
      document.body.append(fileInput)
  
      // Create the button widget for selecting the files
      uploadWidget = node.addWidget('button', inputName, 'image', () => {
        fileInput.click()
      })
      uploadWidget.label = 'choose file to upload'
      uploadWidget.serialize = false
  
      // Add handler to check if an image is being dragged over our node
      // @ts-expect-error
      node.onDragOver = function (e) {
        if (e.dataTransfer && e.dataTransfer.items) {
          const image = [...e.dataTransfer.items].find((f) => f.kind === 'file')
          return !!image
        }
  
        return false
      }
  
      // On drop upload files
      node.onDragDrop = function (e:any) {
        console.log('onDragDrop called')
        let handled = false
        for (const file of e.dataTransfer.files) {
          if (file.type.startsWith('image/')) {
            uploadFile(file, !handled) // Dont await these, any order is fine, only update on first one
            handled = true
          }
        }
  
        return handled
      }
  
      node.pasteFile = function (file:any) {
        if (file.type.startsWith('image/')) {
          const is_pasted =
            file.name === 'image.png' && file.lastModified - Date.now() < 2000
          uploadFile(file, true, is_pasted)
          return true
        }
        return false
      }
  
      return { widget: uploadWidget }
    }
}