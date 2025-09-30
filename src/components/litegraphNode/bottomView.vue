<script setup lang="ts">
import { watch, ref, defineProps } from 'vue';
import { Tooltip } from "ant-design-vue";
import { useRouter, useRoute } from 'vue-router';
import {
    PlusOutlined,
    MinusOutlined,
    ExpandOutlined,
    EyeOutlined
} from '@ant-design/icons-vue';
import imgb from '@/assets/images/18.png';
import imgc from '@/assets/images/19.png';
import imgd from '@/assets/images/19_ac.png';
import imge from '@/assets/images/20.png';
import imgf from '@/assets/images/20_ac.png';
import imgg from '@/assets/images/21.png';
import imgh from '@/assets/images/21_ac.png';

const router = useRouter();

defineProps<{
}>()

</script>

<template>
    <div class="bottom_view">
        <div class="bottom_ac">
            <div><img :src="true?imgd:imgc" class="bottom_icon" />构建仿真</div>
        </div>
        <div class="bottom_line"></div>
        <div>
            <div><img :src="false?imgf:imge" class="bottom_icon" />仿真训练</div>
        </div>
        <div class="bottom_line"></div>
        <div>
            <div><img :src="false?imgh:imgg" class="bottom_icon" />运行仿真</div>
        </div>
    </div>

    <div class="back_btn" @click="()=>router.go(-1)">
        <div class="back_icon_box"><img :src="imgb" class="back_icon" /></div>
        返回
    </div>
</template>

<style scoped>
.back_btn{
    position: absolute;
    bottom: 2.85rem;
    right: 5rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: #333;
    user-select: none;
    cursor: pointer;
}
.back_icon_box{
    margin-bottom: 0.57rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.85rem;
    height: 2.85rem;
    border-radius: 100rem;
    background: #fff;
    box-shadow: 0 0.14rem 1rem 0 rgba(0,0,0,0.3);
}
.back_icon{
    display: block;
    width: 1.2rem;
    height: 1.2rem;
    -webkit-user-drag: none;
}

.bottom_view{
    position: absolute;
    left: calc(50% - 19.92rem);
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 39.85rem;
    height: 4.28rem;
    background: #fff;
    border-radius: 100rem 100rem 0 0;
    border: 0.07rem solid #D5DBE0;
    border-bottom: 0 solid #D5DBE0;
    font-size: 1rem;
    color: #333;
    user-select: none;
}
.bottom_view>div>div{
    display: flex;
    align-items: center;
}
.bottom_icon{
    margin-right: 0.71rem;
    width: 1.42rem;
    height: 1.42rem;
    -webkit-user-drag: none;
}
.bottom_line{
    margin: 0 0.71rem;
    width: 4.28rem;
    height: 0.07rem;
    background: #2484FA;
}

.bottom_ac{
    color: #2484FA;
}
</style>
