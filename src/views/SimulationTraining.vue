<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw } from 'vue';
import { Row, Col, InputSearch, Dropdown, Menu, MenuItem, Button, Progress, message } from "ant-design-vue";
import {
    EditOutlined,
    DeleteOutlined,
    AppstoreOutlined
} from '@ant-design/icons-vue';
import icona from '@/assets/images/12.png';
import iconb from '@/assets/images/13.png';

let searchVal = ref<string>('');

const onSearch = (searchValue: string) => {
    // console.log('use value', searchValue);
};

</script>

<template>
    <div class="header_box">
        <div>
            <div>仿真训练</div>
            <div>
                <InputSearch v-model:value="searchVal" placeholder="搜索仿真" enter-button="搜索" @search="onSearch"
                    class="search_input" />
            </div>
        </div>
    </div>

    <div class="num_view">
        <div class="num_item">
            <div>
                <div><img :src="icona" class="image_view" /></div>
                <div>进行中</div>
            </div>
            <div>
                <div>7</div>
                <div>个</div>
            </div>
        </div>
        <div class="num_item">
            <div>
                <div><img :src="iconb" class="image_view" /></div>
                <div>已完成</div>
            </div>
            <div>
                <div>2</div>
                <div>个</div>
            </div>
        </div>
    </div>

    <div class="content_box">
        <div v-for="(item, index) in 26" :key="index">
            <div class="item_box" @click.prevent>
                <div class="item_tit">
                    <div> 3D磁控溅射模拟器</div>
                    <div v-if="index==1||index==2" class="item_tit_green item_green_color">
                        <div class="item_green_background"></div>
                        <div>已完成</div>
                    </div>
                    <div v-else class="item_tit_blue item_blue_color">
                        <div class="item_blue_background"></div>
                        <div>运行中</div>
                    </div>
                </div>
                <div v-if="index==1||index==2" class="item_percentage item_green_color">100%已完成</div>
                <div v-else class="item_percentage item_blue_color">76%已完成</div>
                <div class="item_progress">
                    <div>
                        <div>迭代次数</div>
                        <div>7,600,000/<span>10,000,000</span></div>
                    </div>
                    <Progress :percent="index==1||index==2?100:76" :strokeColor="index==1||index==2?'#00AD18':'#2484FA'" :showInfo="false" class="progress_view"></Progress>
                </div>
                <div class="bottom_text">
                    <div><span>开始时间 :</span>2024/01/11  20:25:07</div>
                    <div><span>预计完成时间 :</span>2024/01/11  20:25:07</div>
                    <div><span>训练时长 :</span>34:40:21 (1.60天)</div>
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

::v-deep .search_input .ant-input-group .ant-input {
    width: 16.71rem;
    height: 2.28rem;
    font-size: 1rem;
    border-radius: 0 !important;
}

::v-deep .search_input .ant-input-group .ant-input-group-addon .ant-input-search-button {
    padding: 0;
    width: 4rem;
    height: 2.28rem;
    line-height: 2.28rem;
    border-radius: 0 !important;
    background: #2484FA;
}

::v-deep .search_input .ant-input-group .ant-input-group-addon .ant-input-search-button span {
    padding: 0;
    height: 2.28rem;
    line-height: 2.28rem;
    font-size: 1rem !important;
}

.num_view {
    margin: 0 2.14rem 1.42rem;
    display: flex;
    align-items: center;
}

.num_item {
    margin-right: 2.14rem;
    padding: 0 1.42rem;
    width: 25.28rem;
    height: 5.71rem;
    background: #fff;
    border-radius: 0.28rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.num_item>div:nth-child(1){
    display: flex;
    align-items: center;
}
.num_item>div:nth-child(1)>div:nth-child(1){
    margin-right: 0.71rem;
    width: 2.85rem;
    height: 2.85rem;
}
.num_item>div:nth-child(1)>div:nth-child(2){
    font-size: 1rem;
    color: #333;
}
.num_item>div:nth-child(2){
    display: flex;
    align-items: flex-end;
}
.num_item>div:nth-child(2)>div:nth-child(1){
    margin-right: 0.28rem;
    font-size: 2rem;
    color: #2484FA;
}
.num_item>div:nth-child(2)>div:nth-child(2){
    position: relative;
    top: -0.28rem;
    font-size: 0.85rem;
    color: #999;
}

.content_box {
    margin: 0 0 0 2.14rem;
    display: flex;
    flex-wrap: wrap;
}

.item_box {
    margin: 0 2.14rem 2.85rem 0;
    padding: 1.2rem 0;
    width: 25.28rem;
    height: 18.57rem;
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
.item_tit{
    padding: 0 1.42rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.item_tit>div:nth-child(1){
    flex: 1;
    font-size: 1.14rem;
    font-weight: 600;
    color: #1A1A1A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis
}
.item_tit>div:nth-child(2){
    display: flex;
    align-items: center;
    justify-content: center;
    width: 5.2rem;
    height: 2rem;
    border: 0.07rem solid #fff;
    border-radius: 100rem;
    font-size: 1rem;
}
.item_tit>div:nth-child(2)>div:nth-child(1){
    margin-right: 0.33rem;
    width: 0.57rem;
    height: 0.57rem;
    border-radius: 50rem;
}
.item_tit_blue{
    border: 0.07rem solid #2484FA !important;
    background: #E3EEFB;
}
.item_tit_green{
    border: 0.07rem solid #00AD18 !important;
    background: #E1F7E6;
}
.item_blue_color{
    color: #2484FA;
}
.item_green_color{
    color: #00AD18;
}
.item_blue_background{
    background: #2484FA;
}
.item_green_background{
    background: #00AD18;
}

.item_percentage{
    padding: 0.28rem 1.42rem 1.62rem;
    font-size: 2rem;
}

.item_progress{
    padding: 0 1.42rem 0.23rem;
}
.item_progress>div:nth-child(1){
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1rem;
    color: #666;
}
.item_progress>div:nth-child(1)>div:nth-child(2)>span{
    color: #999;
}
.progress_view{
    margin-top: -0.5rem;
}

.bottom_text{
    padding: 0 1.42rem;
}
.bottom_text>div{
    margin-bottom: 0.71rem;
    font-size: 1rem;
    color: #333;
}
.bottom_text>div>span{
    margin-right: 0.4rem;
    display: inline-block;
    color: #999;
}
</style>
