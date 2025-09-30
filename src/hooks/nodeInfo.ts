export function convertToLiteGraph(jsonData: any, liteGraphNode: any) {
  //   console.log(jsonData, liteGraphNode);

  // 提取 ComfyUI 节点的数据
  const inputData = jsonData.input?.required || [];
  const inputOrder = jsonData.input_order?.required || [];
  const outputData = jsonData.output || [];
  const outputIsList = jsonData.output_is_list || [];
  const outputName = jsonData.output_name || [];

  let maxInputWidth = 0; // 计算最大输入宽度
  let totalHeight = 0; // 计算节点的总高度

  // 将 ComfyUI 节点信息合并到现有的 LiteGraph 节点中
  liteGraphNode.title = jsonData.display_name || liteGraphNode.title;
  liteGraphNode.description = jsonData.description || liteGraphNode.description;
  liteGraphNode.category = jsonData.category || liteGraphNode.category;

  let options_item = JSON.parse(JSON.stringify(liteGraphNode.widgets[0]));
  liteGraphNode.widgets = [];
  //   console.log(liteGraphNode.widgets, "888");

  // 处理输入数据并将其添加到 LiteGraph 节点的输入列表中
  inputOrder.forEach((inputParam: any) => {
    if (inputData[inputParam]) {
      //   liteGraphNode.addInput(inputParam, inputData[inputParam]);
      //   console.log(inputParam, "888");

      let item = JSON.parse(JSON.stringify(options_item));
      item.name = inputParam;
      // item.type = Array.isArray(inputData[inputParam])
      //   ? inputData[inputParam][0]
      //   : inputData[inputParam];
      item.value = 0;
      liteGraphNode.widgets.push(item);
      console.log(liteGraphNode.widgets, "55655");

      // 更新最大输入宽度
      maxInputWidth = Math.max(maxInputWidth, item.name.length * 16); // 假设每个字符宽度为16
      totalHeight += 16; // 每个小部件占16像素的高度
    }
  });

  // 处理输出数据并将其添加到 LiteGraph 节点的输出列表中
  outputName.forEach((outputParam: any) => {
    outputData.forEach((item: any) => {
      liteGraphNode.addOutput(outputParam, item);
    });
  });
  //   if (outputData.length > 0) {
  //     liteGraphNode.outputs.push({
  //       name: outputName[0] || "output",
  //       type: "number", // 假设输出类型为 FLOAT
  //     });
  //   }

  // 可选：如果你需要添加自定义的代码或行为，可以在这里补充
  liteGraphNode.code = ""; // 根据需要补充函数代码

  // 计算总宽度
  let maxWidth = Math.max(maxInputWidth, 150); // 最小宽度为150
  liteGraphNode.size = [maxWidth + 20, totalHeight + 60]; // 额外加上20px和60px的间距

  return liteGraphNode;
}
