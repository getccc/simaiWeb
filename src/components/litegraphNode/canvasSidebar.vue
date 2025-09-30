<template>
  <div class="sidebar-box" :class="{ active: !launched }">
    <div class="contract" @click="lauchedFunc">
      <img :src="img_t" alt="拖拽" />
    </div>
    <div class="nodeList-box">
      <div v-for="item in nodeList" :key="item.type">
        <div>
          <img class="node-icon" :src="item.img" alt="拖拽" />
        </div>
        <div>{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import img_1 from "@/assets/images/canvasImg/canvas_01.png";
import img_2 from "@/assets/images/canvasImg/canvas_02.png";
import img_3 from "@/assets/images/canvasImg/canvas_03.png";
import img_4 from "@/assets/images/canvasImg/canvas_04.png";
import img_5 from "@/assets/images/canvasImg/canvas_05.png";
import img_t from "@/assets/images/canvasImg/canvas_06.png";
import { reactive, ref } from "vue";
const launched = ref(false);
const lauchedFunc = () => {
  launched.value = !launched.value;
};
// 节点列表
const nodeList = reactive([
  {
    title: "方程",
    type: "equation",
    img: img_1,
  },
  {
    title: "神经网络",
    type: "neuralNetwork",
    img: img_2,
  },
  {
    title: "数据集",
    type: "dataSet",
    img: img_3,
  },
  {
    title: "几何学",
    type: "geometry",
    img: img_4,
  },
  {
    title: "约束",
    type: "constraint",
    img: img_5,
  },
]);
</script>
<style scoped lang="less">
.sidebar-box {
  position: absolute;
  top: 22rem;
  left: 0rem;
  z-index: 10;
  width: 11.14rem;
  //   min-height: 17.14rem;
  background: white;
  box-shadow: 0 0.14rem 0.8rem 0 rgba(0, 0, 0, 0.2);
  transition: all 0.1s;
  &.active {
    // background: #fff;
    width: 0rem;
    .nodeList-box {
      > div {
        width: 0rem;
        display: none;
      }
    }
  }
  .contract {
    position: absolute;
    width: 1.43rem;
    height: 6rem;
    top: 50%;
    transform: translate(0, -50%);
    left: 100%;
    background: #f0f2f5;
    border: 0.07rem solid #d5dbe0;
    border-top-right-radius: 50%; /* 右上角的半圆 */
    border-bottom-right-radius: 50%; /* 右下角的半圆 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    > img {
      width: 1.14rem;
      height: 16px;
      user-select: none;
      pointer-events: none;
    }
  }

  .nodeList-box {
    min-height: 17.14rem;
    padding: 1.43rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    > div {
      width: 8.29rem;
      height: 2.29rem;
      border-radius: 0.29rem;
      background-color: gray;
      display: flex;
      line-height: 2.29rem;
      padding-left: 1.43rem;
      color: #ffffff;
      transition: all 0.5s;
      .node-icon {
        width: 1rem;
        margin-top: 0.7rem;
        margin-right: 0.57rem;
      }
    }
  }
}
</style>