<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw } from 'vue';
import { Row, Col, Menu, MenuItem, Button, message, Tooltip, RadioGroup, RadioButton } from "ant-design-vue";
import { useRouter, useRoute } from 'vue-router';
import {
    CloseOutlined
} from '@ant-design/icons-vue';

const router = useRouter();

</script>

<template>
    <div class="header_box">
        <div>
            <div>插件</div>
        </div>
    </div>

    <div class="content_box">
        <div v-for="(item, index) in 26" :key="index">
            <div class="item_box" @click.prevent>
                <div class="item_header">
                    <div>0% 等级</div>
                    <div><CloseOutlined /></div>
                </div>
                <div class="item_name">k-epsilon方程</div>
                <div class="item_bottom">
                    <Button class="item_btn">自定义方程</Button>
                </div>
            </div>
        </div>
    </div>
</template>


<style scoped>
.header_box {
  padding: 1.57rem 2.14rem 1.66rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header_box>div {
  display: flex;
  align-items: center;
}

.header_box>div:nth-child(1)>div:nth-child(1) {
  margin-right: 1.42rem;
  font-size: 1.42rem;
  color: #1A1A1A;
  user-select: none;
}

.content_box {
    margin: 0 0 0 2.14rem;
    display: flex;
    flex-wrap: wrap;
}

.item_box {
    margin: 0 1.42rem 1.42rem 0;
    width: 20.35rem;
    height: 10.42rem;
    background: #fff;
    border-radius: 0.28rem;
    border: 0.071rem solid #D5DBE0;
    display: flex;
    flex-direction: column;
    cursor: pointer;
}
.item_box:hover{
    box-shadow: 0 0.14rem 0.8rem 0 rgba(0,0,0,0.15);
}

.item_header{
    padding: 1rem 1.42rem 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #1A1A1A;
}
.item_header>div:nth-child(1){
    font-size: 1.14rem;
    font-weight: 600;
}
.item_header>div:nth-child(2){
    font-size: 1rem;
}
.item_name{
    padding: 0.28rem 1.42rem 1.14rem;
    font-size: 1rem;
    color: #333;
}
.item_bottom{
    margin: 0 1.42rem;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 0.07rem solid #D5DBE0;
}
.item_btn{
    width: 7.85rem;
    height: 2.28rem;
    font-size: 1rem;
    color: #2484FA;
    border-radius: 0.28rem;
    border: 0.07rem solid #2484FA;
}
</style>