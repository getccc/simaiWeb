import {
  LGraphCanvas,
  LGraph,
  LGraphNode,
  LiteGraph,
  LGraphEventMode,
} from "@comfyorg/litegraph";
//   import { useSettingStore } from '@/stores/settingStore'
let wind: any = window;
let graphList = wind["graph"];
// const serializeGraph = (graph: LGraph = graphList)=> {
//     const sortNodes = useSettingStore().get('Comfy.Workflow.SortNodeIdOnSave')
//     return graph.serialize({ sortNodes })
//   }

const workflowFunc = (graph: any = graphList) => {
  let workflow: any = {
    config: graph.config,
    extra: graph.config,
    groups: graph.groups,
    last_node_id: graph.last_node_id,
    last_link_id: graph.last_link_id,
    nodes: graph.nodes,
    links: graph.links,
    version: graph._version,
  };
  workflow.nodes = workflow.nodes.map((item: any) => {
    let obj = {
      flags: item.flags,
      id: item.id,
      inputs:
        !item.inputs?.length || !item.outputs
          ? []
          : item.inputs.map((element: any) => {
              return {
                links: element.links,
                name: element.name,
                type: element.type,
              };
            }),
      mode: item.mode,
      outputs:
        !item.outputs?.length || !item.outputs
          ? []
          : item.outputs.map((element: any) => {
              return {
                links: element.links,
                name: element.name,
                type: element.type,
              };
            }),
      pos: item._pos,
      properties: item.properties, //
      showAdvanced: item.showAdvanced,
      size: item._size,
      type: item.type,
      widgets_values:
        !item.widgets?.length || !item.outputs
          ? []
          : item.widgets.map((element: any) => {
              return element.value;
            }),
    };
    return obj;
  });
  return workflow;
};
export async function graphToPrompt(
  graph: any = graphList,
  clean: boolean = true
): Promise<{ workflow: any; output: any }> {
  for (const outerNode of graph.computeExecutionOrder(false)) {
    if (outerNode.widgets) {
      for (const widget of outerNode.widgets) {
        widget.beforeQueued?.();
      }
    }
    const innerNodes = outerNode.getInnerNodes
      ? outerNode.getInnerNodes()
      : [outerNode];
    for (const node of innerNodes) {
      if (node.isVirtualNode) {
        if (node.applyToGraph) {
          node.applyToGraph();
        }
      }
    }
  }
  const workflow = workflowFunc(graph); // 假设 serializeGraph 是一个可用的函数
  for (const node of workflow.nodes) {
    for (const slot of node.inputs) {
      delete slot.localized_name;
    }
    for (const slot of node.outputs) {
      delete slot.localized_name;
    }
  }
  const output: any = {};
  for (const outerNode of graph.computeExecutionOrder(false)) {
    const skipNode =
      outerNode.mode === LGraphEventMode.NEVER ||
      outerNode.mode === LGraphEventMode.BYPASS;
    const innerNodes =
      !skipNode && outerNode.getInnerNodes
        ? outerNode.getInnerNodes()
        : [outerNode];
    for (const node of innerNodes) {
      if (node.isVirtualNode) {
        continue;
      }
      if (
        node.mode === LGraphEventMode.NEVER ||
        node.mode === LGraphEventMode.BYPASS
      ) {
        continue;
      }
      const inputs: any = {};
      const widgets = node.widgets;
      if (widgets) {
        for (const i in widgets) {
          const widget = widgets[i];
          if (!widget.options || widget.options.serialize !== false) {
            inputs[widget.name] = widget.serializeValue
              ? await widget.serializeValue(node, i)
              : widget.value;
          }
        }
      }
      for (let i in node.inputs) {
        let parent = node.getInputNode(i);
        if (parent) {
          let link = node.getInputLink(i);
          while (
            parent.mode === LGraphEventMode.BYPASS ||
            parent.isVirtualNode
          ) {
            let found = false;
            if (parent.isVirtualNode) {
              link = parent.getInputLink(link.origin_slot);
              if (link) {
                parent = parent.getInputNode(link.target_slot);
                if (parent) {
                  found = true;
                }
              }
            } else if (link && parent.mode === LGraphEventMode.BYPASS) {
              let all_inputs = [link.origin_slot];
              if (parent.inputs) {
                all_inputs = all_inputs.concat(Object.keys(parent.inputs));
                for (let parent_input in all_inputs) {
                  parent_input = all_inputs[parent_input];
                  if (
                    parent.inputs[parent_input]?.type === node.inputs[i].type
                  ) {
                    link = parent.getInputLink(parent_input);
                    if (link) {
                      parent = parent.getInputNode(parent_input);
                    }
                    found = true;
                    break;
                  }
                }
              }
            }
            if (!found) {
              break;
            }
          }
          if (link) {
            if (parent?.updateLink) {
              link = parent.updateLink(link);
            }
            if (link) {
              inputs[node.inputs[i].name] = [
                String(link.origin_id),
                parseInt(link.origin_slot),
              ];
            }
          }
        }
      }
      const node_data = {
        inputs,
        class_type: node.comfyClass,
        _meta: {
          title: node.title,
        },
      };
      output[String(node.id)] = node_data;
    }
  }
  if (clean) {
    for (const o in output) {
      for (const i in output[o].inputs) {
        if (
          Array.isArray(output[o].inputs[i]) &&
          output[o].inputs[i].length === 2 &&
          !output[output[o].inputs[i][0]]
        ) {
          delete output[o].inputs[i];
        }
      }
    }
  }
  return { workflow, output };
}
