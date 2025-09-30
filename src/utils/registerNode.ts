import {
    LGraphCanvas, LGraph, LGraphNode, LiteGraph, LGraphEventMode,
} from '@comfyorg/litegraph'
import { normalizeI18nKey } from '@/utils/formatUtil'
import { widgets } from '@/utils/comfyWidgets'
import type { Vector4 } from '@comfyorg/litegraph'
  
const getWidgetType:any = (inputData: any, inputName: string) => {
  const type = inputData[0]

  if (Array.isArray(type)) {
    return 'COMBO'
  } else if (`${type}:${inputName}` in widgets) {
    return `${type}:${inputName}`
  } else if (type in widgets) {
    return type
  } else {
    return null
  }
}
// ---------------------------------------------------
let SIZE:any = undefined

interface Rect {
  height: number
  width: number
  x: number
  y: number
}
const elementWidgets = new Set()

function intersect(a: Rect, b: Rect): Vector4 | null {
  const x = Math.max(a.x, b.x)
  const num1 = Math.min(a.x + a.width, b.x + b.width)
  const y = Math.max(a.y, b.y)
  const num2 = Math.min(a.y + a.height, b.y + b.height)
  if (num1 >= x && num2 >= y) return [x, y, num1 - x, num2 - y]
  else return null
}

function getClipPath(
  node: LGraphNode,
  element: HTMLElement,
  canvasRect: DOMRect
): string {
  const wind:any = window
  const graph = wind["graph"];
  const canvas = wind["canvas"];
  const selectedNode: LGraphNode = Object.values(
    canvas.selected_nodes
  )[0] as LGraphNode
  if (selectedNode && selectedNode !== node) {
    const elRect = element.getBoundingClientRect()
    const MARGIN = 4
    const { offset, scale } = canvas.ds
    const { renderArea } = selectedNode

    // Get intersection in browser space
    const intersection = intersect(
      {
        x: elRect.left - canvasRect.left,
        y: elRect.top - canvasRect.top,
        width: elRect.width,
        height: elRect.height
      },
      {
        x: (renderArea[0] + offset[0] - MARGIN) * scale,
        y: (renderArea[1] + offset[1] - MARGIN) * scale,
        width: (renderArea[2] + 2 * MARGIN) * scale,
        height: (renderArea[3] + 2 * MARGIN) * scale
      }
    )

    if (!intersection) {
      return ''
    }

    // Convert intersection to canvas scale (element has scale transform)
    const clipX =
      (intersection[0] - elRect.left + canvasRect.left) / scale + 'px'
    const clipY = (intersection[1] - elRect.top + canvasRect.top) / scale + 'px'
    const clipWidth = intersection[2] / scale + 'px'
    const clipHeight = intersection[3] / scale + 'px'
    const path = `polygon(0% 0%, 0% 100%, ${clipX} 100%, ${clipX} ${clipY}, calc(${clipX} + ${clipWidth}) ${clipY}, calc(${clipX} + ${clipWidth}) calc(${clipY} + ${clipHeight}), ${clipX} calc(${clipY} + ${clipHeight}), ${clipX} 100%, 100% 100%, 100% 0%)`
    return path
  }
  return ''
}

function computeSize(size: [number, number]): void {
  if (this.widgets?.[0]?.last_y == null) return

  let y = this.widgets[0].last_y
  let freeSpace = size[1] - y

  let widgetHeight = 0
  let dom:any = []
  for (const w of this.widgets) {
    if (w.type === 'converted-widget') {
      // Ignore
      delete w.computedHeight
    } else if (w.computeSize) {
      widgetHeight += w.computeSize()[1] + 4
    } else if (w.element) {
      // Extract DOM widget size info
      const styles = getComputedStyle(w.element)
      let minHeight =
        w.options.getMinHeight?.() ??
        parseInt(styles.getPropertyValue('--comfy-widget-min-height'))
      let maxHeight =
        w.options.getMaxHeight?.() ??
        parseInt(styles.getPropertyValue('--comfy-widget-max-height'))

      let prefHeight =
        w.options.getHeight?.() ??
        styles.getPropertyValue('--comfy-widget-height')
      if (prefHeight.endsWith?.('%')) {
        prefHeight =
          size[1] *
          (parseFloat(prefHeight.substring(0, prefHeight.length - 1)) / 100)
      } else {
        prefHeight = parseInt(prefHeight)
        if (isNaN(minHeight)) {
          minHeight = prefHeight
        }
      }
      if (isNaN(minHeight)) {
        minHeight = 50
      }
      if (!isNaN(maxHeight)) {
        if (!isNaN(prefHeight)) {
          prefHeight = Math.min(prefHeight, maxHeight)
        } else {
          prefHeight = maxHeight
        }
      }
      dom.push({
        minHeight,
        prefHeight,
        w
      })
    } else {
      widgetHeight += LiteGraph.NODE_WIDGET_HEIGHT + 4
    }
  }

  freeSpace -= widgetHeight

  // Calculate sizes with all widgets at their min height
  const prefGrow = [] // Nodes that want to grow to their prefd size
  const canGrow = [] // Nodes that can grow to auto size
  let growBy = 0
  for (const d of dom) {
    freeSpace -= d.minHeight
    if (isNaN(d.prefHeight)) {
      canGrow.push(d)
      d.w.computedHeight = d.minHeight
    } else {
      const diff = d.prefHeight - d.minHeight
      if (diff > 0) {
        prefGrow.push(d)
        growBy += diff
        d.diff = diff
      } else {
        d.w.computedHeight = d.minHeight
      }
    }
  }

  if (this.imgs && !this.widgets.find((w:any) => w.name === '$$comfy_animation_preview')) {
    // Allocate space for image
    freeSpace -= 220
  }

  this.freeWidgetSpace = freeSpace

  if (freeSpace < 0) {
    // Not enough space for all widgets so we need to grow
    size[1] -= freeSpace
    this.graph.setDirtyCanvas(true)
  } else {
    // Share the space between each
    const growDiff = freeSpace - growBy
    if (growDiff > 0) {
      // All pref sizes can be fulfilled
      freeSpace = growDiff
      for (const d of prefGrow) {
        d.w.computedHeight = d.prefHeight
      }
    } else {
      // We need to grow evenly
      const shared = -growDiff / prefGrow.length
      for (const d of prefGrow) {
        d.w.computedHeight = d.prefHeight - shared
      }
      freeSpace = 0
    }

    if (freeSpace > 0 && canGrow.length) {
      // Grow any that are auto height
      const shared = freeSpace / canGrow.length
      for (const d of canGrow) {
        d.w.computedHeight += shared
      }
    }
  }

  // Position each of the widgets
  for (const w of this.widgets) {
    w.y = y
    if (w.computedHeight) {
      y += w.computedHeight
    } else if (w.computeSize) {
      y += w.computeSize()[1] + 4
    } else {
      y += LiteGraph.NODE_WIDGET_HEIGHT + 4
    }
  }
}

export const registerNodeDef = async (nodeId: string, nodeData: any) => {
    const node:any = class ComfyNode extends LGraphNode {
      static comfyClass? = nodeData.name
      // TODO: change to "title?" once litegraph.d.ts has been updated
      static title = nodeData.display_name || nodeData.name
      static nodeData? = nodeData
      static category?: string

      addDOMWidget<T extends HTMLElement, V extends object | string>(name: string, type: string, element: T | any, options: any | any = {}): any {
        const wind:any = window
        const graph = wind["graph"];
        const canvas = wind["canvas"];
        const canvasContainer = wind['canvasContainer'];
        options = { hideOnZoom: true, selectOn: ['focus', 'click'], ...options }
      
        if (!element.parentElement) {
          canvasContainer.append(element)
        }
        element.hidden = true
        element.style.display = 'none'
      
        let mouseDownHandler:any
        if (element.blur) {
          mouseDownHandler = (event:any) => {
            if (!element.contains(event.target)) {
              element.blur()
            }
          }
          document.addEventListener('mousedown', mouseDownHandler)
        }
      
        const { nodeData } = this.constructor
        const tooltip = (nodeData?.input.required?.[name] ??
          nodeData?.input.optional?.[name])?.[1]?.tooltip
        if (tooltip && !element.title) {
          element.title = tooltip
        }
      
        const widget: any = {
          // in litegraph internally.
          type,
          name,
          get value(): V | any {
            return options.getValue?.() ?? undefined
          },
          set value(v: V) {
            options.setValue?.(v)
            widget.callback?.(widget.value)
          },
          draw: function (
            ctx: CanvasRenderingContext2D,
            node: LGraphNode,
            widgetWidth: number,
            y: number,
            widgetHeight: number
          ) {
            if (widget.computedHeight == null) {
              computeSize.call(node, (node.size as any))
            }

            const { offset, scale } = canvas.ds
      
            const hidden =
              (!!options.hideOnZoom && scale < 0.5) ||
              widget.computedHeight <= 0 ||
              widget.type === 'converted-widget' ||
              widget.type === 'hidden'
      
            element.dataset.shouldHide = hidden ? 'true' : 'false'
            const isInVisibleNodes = element.dataset.isInVisibleNodes === 'true'
            const isCollapsed = element.dataset.collapsed === 'true'
            const actualHidden = hidden || !isInVisibleNodes || isCollapsed
            const wasHidden = element.hidden
            element.hidden = actualHidden
            element.style.display = actualHidden ? 'none' : null
            if (actualHidden && !wasHidden) {
              widget.options.onHide?.(widget)
            }
            if (actualHidden) {
              return
            }
      
            const elRect = ctx.canvas.getBoundingClientRect()
            const margin = 10
            const top = node.pos[0] + offset[0] + margin
            const left = node.pos[1] + offset[1] + margin + y
      console.log(11)
            Object.assign(element.style, {
              transformOrigin: '0 0',
              transform: `scale(${scale})`,
              left: `${top * scale}px`,
              top: `${left * scale}px`,
              width: `${widgetWidth - margin * 2}px`,
              height: `${(widget.computedHeight ?? 50) - margin * 2}px`,
              position: 'absolute',
              zIndex: graph.nodes.indexOf(node),
              pointerEvents: canvas.read_only ? 'none' : 'auto'
            })
      
            // if (useSettingStore().get('Comfy.DOMClippingEnabled')) {
            if (true) {
              element.style.clipPath = getClipPath(node, element, elRect)
              element.style.willChange = 'clip-path'
            }
      
            this.options.onDraw?.(widget)
          },
          element,
          options,
          onRemove() {
            if (mouseDownHandler) {
              document.removeEventListener('mousedown', mouseDownHandler)
            }
            element.remove()
          }
        }
      
        for (const evt of options.selectOn) {
          element.addEventListener(evt, () => {
            canvas.selectNode(this)
            canvas.bringToFront(this)
          })
        }
      
        this.addCustomWidget(widget)
        elementWidgets.add(this)
      
        const collapse:any = this.collapse
        this.collapse = function () {
          collapse.apply(this, arguments)
          if (this.flags?.collapsed) {
            element.hidden = true
            element.style.display = 'none'
          }
          element.dataset.collapsed = this.flags?.collapsed ? 'true' : 'false'
        }
      
        const onRemoved:any = this.onRemoved
        this.onRemoved = function () {
          element.remove()
          elementWidgets.delete(this)
          onRemoved?.apply(this, arguments)
        }
      
        if (!SIZE) {
          SIZE = true
          const onResize = this.onResize
          this.onResize = function (size) {
            options.beforeResize?.call(widget, this)
            computeSize.call(this, (size as any))
            onResize?.apply(this, (arguments as any))
            options.afterResize?.call(widget, this)
          }
        }
      
        return widget
      }

      constructor(title?: string) {
        super(title as any)
        const requiredInputs = nodeData.input.required

        var inputs = nodeData['input']['required']
        if (nodeData['input']['optional'] != undefined) {
            inputs = Object.assign(
            {},
            nodeData['input']['required'],
            nodeData['input']['optional']
            )
        }
        const config: {
            minWidth: number
            minHeight: number
            widget?: any
        } = { minWidth: 1, minHeight: 1 }
        for (const inputName in inputs) {
            const _inputData = inputs[inputName]
            const type = _inputData[0]
            const options = _inputData[1] ?? {}
            const inputData = [type, options]
            const nameKey = `nodeDefs.${normalizeI18nKey(nodeData.name)}.inputs.${normalizeI18nKey(inputName)}.name`

            const inputIsRequired = requiredInputs && inputName in requiredInputs

            let widgetCreated = true
            const widgetType = getWidgetType(inputData, inputName)
            if (widgetType) {
            // 注释代码--
            if (widgetType === 'COMBO') {
              Object.assign(
                config,
                widgets.COMBO(this, inputName, inputData) || {}
              )
            } else {
              Object.assign(
                config,
                widgets[widgetType](this, inputName, inputData) || {}
              )
            }
            if (config.widget) {
              // config.widget.label = st(nameKey, inputName)
              config.widget.label = inputName
            }
            } else {
            // Node connection inputs
            const shapeOptions = inputIsRequired
                ? {}
                : { shape: LiteGraph.SlotShape.HollowCircle }
            const inputOptions = {
                ...shapeOptions,
                // localized_name: st(nameKey, inputName)
                localized_name: inputName
            }
            this.addInput(inputName, type, inputOptions)
            widgetCreated = false
            }

            if (widgetCreated && config?.widget) {
            config.widget.options ??= {}
            if (!inputIsRequired) {
                config.widget.options.inputIsOptional = true
            }
            if (inputData[1]?.forceInput) {
                config.widget.options.forceInput = true
            }
            if (inputData[1]?.defaultInput) {
                config.widget.options.defaultInput = true
            }
            if (inputData[1]?.advanced) {
                config.widget.advanced = true
            }
            if (inputData[1]?.hidden) {
                config.widget.hidden = true
            }
            }
        }

        for (const o in nodeData['output']) {
            let output = nodeData['output'][o]
            if (output instanceof Array) output = 'COMBO'
            const outputName = nodeData['output_name'][o] || output
            const outputIsList = nodeData['output_is_list'][o]
            const shapeOptions = outputIsList
            ? { shape: LiteGraph.GRID_SHAPE }
            : {}
            const nameKey = `nodeDefs.${normalizeI18nKey(nodeData.name)}.outputs.${o}.name`
            const typeKey = `dataTypes.${normalizeI18nKey(output)}`
            const outputOptions = {
            ...shapeOptions,
            // If the output name is different from the output type, use the output name.
            // e.g.
            // - type ("INT"); name ("Positive") => translate name
            // - type ("FLOAT"); name ("FLOAT") => translate type
            // localized_name: output !== outputName ? st(nameKey, outputName) : st(typeKey, outputName)
            localized_name: outputName
            }
            this.addOutput(outputName, output, outputOptions)
        }

        const s = this.computeSize()
        s[0] = Math.max(config.minWidth, s[0] * 1.5)
        s[1] = Math.max(config.minHeight, s[1])
        this.size = s
        this.serialize_widgets = true

        // 注释代码--
        // invokeExtensionsAsync('nodeCreated', this)
        }

        configure(data: any) {
        // Keep 'name', 'type', 'shape', and 'localized_name' information from the original node definition.
        const merge = (
            current: Record<string, any>,
            incoming: Record<string, any>
        ) => {
            const result = { ...incoming }
            if (current.widget === undefined && incoming.widget !== undefined) {
            // Field must be input as only inputs can be converted
            this.inputs.push(current as any)
            return incoming
            }
            for (const key of ['name', 'type', 'shape', 'localized_name']) {
            if (current[key] !== undefined) {
                result[key] = current[key]
            }
            }
            return result
        }
        for (const field of ['inputs', 'outputs']) {
            const slots = data[field] ?? []
            // console.log(data[field])
            data[field] = slots.map((slot:any, i:any) => 
            merge(data[field][i] ?? {}, slot)
            )
        }
        super.configure(data)
      }
    }
    node.prototype.comfyClass = nodeData.name
    node.prototype.onDrawBackground = function(ctx:any) {
      // 绘制节点背景颜色
      // ctx.fillStyle = "#fff";
      // ctx.fillRect(0, 0, this.size[0], this.size[1]);
    };

    // 注释代码--
    // this.#addNodeContextMenuHandler(node)
    // this.#addDrawBackgroundHandler(node)
    // this.#addNodeKeyHandler(node)

    // 注释代码--
    // await invokeExtensionsAsync('beforeRegisterNodeDef', node, nodeData)
    LiteGraph.registerNodeType(nodeId, node)
    // Note: Do not move this to the class definition, it will be overwritten
    node.category = nodeData.category
}

// ----------------------------------------------------------------------------------
// --解析---------------------------------
// --outputs
class ComfyOutputSpec {
    constructor(
      public index: number,
      // Name is not unique for output params
      public name: string,
      public type: string,
      public is_list: boolean,
      public comboOptions?: any[],
      public tooltip?: string
    ) {}
}
class ComfyOutputsSpec {
    constructor(public outputs: ComfyOutputSpec[]) {}

    get all() {
        return this.outputs
    }
}
export const transformOutputSpec = (obj: any) => {
    const { output, output_is_list, output_name, output_tooltips } = obj
    const result = (output ?? []).map((type: string | any[], index: number) => {
        const typeString = Array.isArray(type) ? 'COMBO' : type

        return new ComfyOutputSpec(
            index,
            output_name?.[index],
            typeString,
            output_is_list?.[index],
            Array.isArray(type) ? type : undefined,
            output_tooltips?.[index]
        )
    })
    return new ComfyOutputsSpec(result)
}
// --
// --inputs
interface BaseInputSpec<T = any> {
    name: string
    type: string
    tooltip?: string
    default?: T
  
    forceInput?: boolean
}
interface ComboInputSpec extends BaseInputSpec<any> {
    type: 'COMBO'
    comboOptions: any[]
    controlAfterGenerate?: boolean
    imageUpload?: boolean
}
export class ComfyInputsSpec {
    required: Record<string, BaseInputSpec>
    optional: Record<string, BaseInputSpec>
    hidden?: Record<string, any>
  
    constructor(obj: any) {
      this.required = ComfyInputsSpec.transformInputSpecRecord(obj.required ?? {})
      this.optional = ComfyInputsSpec.transformInputSpecRecord(obj.optional ?? {})
      this.hidden = obj.hidden
    }
  
    private static transformInputSpecRecord(
      record: Record<string, any>
    ): Record<string, BaseInputSpec> {
      const result: Record<string, BaseInputSpec> = {}
      for (const [key, value] of Object.entries(record)) {
        result[key] = ComfyInputsSpec.transformSingleInputSpec(key, value)
      }
      return result
    }
  
    private static isInputSpec(obj: any): boolean {
      return (
        Array.isArray(obj) &&
        obj.length >= 1 &&
        (typeof obj[0] === 'string' || Array.isArray(obj[0]))
      )
    }
  
    private static transformSingleInputSpec(
      name: string,
      value: any
    ): BaseInputSpec {
      if (!ComfyInputsSpec.isInputSpec(value)) return value
  
      const [typeRaw, _spec] = value
      const spec = _spec ?? {}
      const type = Array.isArray(typeRaw) ? 'COMBO' : value[0]
  
      switch (type) {
        case 'COMBO':
          return {
            name,
            type,
            ...spec,
            comboOptions: typeRaw,
            default: spec.default ?? typeRaw[0]
          } as ComboInputSpec
        case 'INT':
        case 'FLOAT':
        case 'BOOLEAN':
        case 'STRING':
        default:
          return { name, type, ...spec } as BaseInputSpec
      }
    }
  
    get all() {
      return [...Object.values(this.required), ...Object.values(this.optional)]
    }
  
    getInput(name: string): BaseInputSpec | undefined {
      return this.required[name] ?? this.optional[name]
    }
}
// -------------------------------------------------------------------
// 树状分组
export const buildTree = (items:any, key: (item:any) => string[]):any => {
    const root:any = {
      key: 'root',
      label: 'root',
      children: []
    }
    const map: Record<string,any> = {
      root: root
    }
    for (const item of items) {
      const keys = key(item)
      let parent = root
      for (let i = 0; i < keys?.length; i++) {
        const k = keys[i]
        // 'a/b/c/' represents an empty folder 'c' in folder 'b' in folder 'a'
        // 'a/b/c/' is split into ['a', 'b', 'c', '']
        if (k === '' && i === keys?.length - 1) break
  
        const id = parent.key + '/' + k
        if (!map[id]) {
          const node:any = {
            key: id,
            label: k,
            leaf: false,
            children: []
          }
          map[id] = node
          parent.children?.push(node)
        }
        parent = map[id]
      }
      parent.leaf = keys[keys?.length - 1] !== ''
      parent.data = item
    }
    return root
}