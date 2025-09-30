<script setup lang="ts">
import { watch, ref, defineProps, onMounted } from "vue";
import {} from "ant-design-vue";
import { useRouter, useRoute } from "vue-router";
import { BookFilled } from "@ant-design/icons-vue";
import twobgm from "@/assets/images/01.png";
import asvg from "@/assets/images/02.png";
import bsvg from "@/assets/images/03.png";
import csvg from "@/assets/images/04.png";
import dsvg from "@/assets/images/05.png";
import esvg from "@/assets/images/06.png";
import fsvg from "@/assets/images/07.png";
import gsvg from "@/assets/images/08.png";
import { getProgectList } from "@/api/projects/index.ts";
import { Login } from "@/stores/user";
import { Sidebar } from "@/stores/sidebar";
import { storeToRefs } from "pinia";
const { projectNum, projectList } = storeToRefs(Sidebar());
defineProps<{}>();

const router = useRouter();
const route = useRoute();
const currentRoute = ref<any>(route.name);

watch(
  () => route.name,
  (newVal) => {
    currentRoute.value = newVal;
  }
);
const store = Login();
const store2 = Sidebar();
let projects: any = ref(); //项目总数
// 获取组织列表
// const getProgectFunc = () => {
//   let params = {
//     user_id: store.userId,
//     // "search_term":string
//   };
//   let data = getProgectList(params).then((res: any) => {
//     projects.value = res.data.length;
//     // console.log(projectsList, "5555");
//     store2.saveProjectNum(projects.value);
//   });
// };
onMounted(() => {
  //   getProgectFunc();
  store2.saveProjectList();
  //   console.log(projectList, "555");
});
</script>

<template>
  <div class="nav_cont">
    <div
      :class="[
        'one_item',
        currentRoute == 'projectmanagement' && 'one_item_ac',
      ]"
      @click="() => router.push('/')"
    >
      <div>
        <div>项目管理</div>
        <div class="one_num">{{ projectNum }}</div>
      </div>
      <div><img :src="asvg" class="one_icon" /></div>
      <div></div>
    </div>
    <div
      :class="['one_item', currentRoute == 'casecenter' && 'one_item_ac']"
      @click="() => router.push('/CaseCenter')"
    >
      <div>
        <div>案例中心</div>
        <div class="one_num">33</div>
      </div>
      <div><img :src="bsvg" class="one_icon" /></div>
      <div></div>
    </div>
    <div
      :class="['two_item', currentRoute == 'workflow' && 'two_item_ac']"
      @click="() => router.push('/WorkFlow')"
    >
      <div>
        <div>工作流</div>
        <div><img :src="csvg" class="one_icon" /></div>
      </div>
      <div>
        <div>创建仿真</div>
        <div>仿真训练</div>
        <div>运行仿真</div>
      </div>
      <div></div>
      <img :src="twobgm" class="two_bgm" />
    </div>
    <div
      :class="[
        'one_item',
        currentRoute == 'simulationtraining' && 'one_item_ac',
      ]"
      @click="() => router.push('/SimulationTraining')"
    >
      <div>
        <div>仿真训练</div>
        <div class="one_num">33</div>
      </div>
      <div><img :src="dsvg" class="one_icon" /></div>
      <div></div>
    </div>
    <div
      :class="['one_item', currentRoute == 'simulationstudio' && 'one_item_ac']"
      @click="() => router.push('/SimulationStudio')"
    >
      <div>
        <div>仿真工作室</div>
        <div class="one_num">33</div>
      </div>
      <div><img :src="esvg" class="one_icon" /></div>
      <div></div>
    </div>
    <div
      :class="[
        'two_item',
        ['dataset', 'plugin'].includes(currentRoute) && 'two_item_ac',
      ]"
      @click="() => router.push('/Resource/DataSet')"
    >
      <div>
        <div>资源</div>
        <div><img :src="fsvg" class="one_icon" /></div>
      </div>
      <div>
        <div
          @click="() => router.push('/Resource/DataSet')"
          :class="[currentRoute == 'dataset' && 't_ac']"
        >
          数据集
        </div>
        <div
          @click.stop="() => router.push('/Resource/PlugIn')"
          :class="[currentRoute == 'plugin' && 't_ac']"
        >
          插件
        </div>
      </div>
      <div></div>
      <img :src="twobgm" class="two_bgm" />
    </div>
    <div
      :class="['one_item', currentRoute == 'usermanagement' && 'one_item_ac']"
      @click="() => router.push('/UserManagement')"
    >
      <div>
        <div>用户管理</div>
        <div class="one_num">33</div>
      </div>
      <div><img :src="gsvg" class="one_icon" /></div>
      <div></div>
    </div>
  </div>
</template>

<style scoped>
.nav_cont {
  height: 100%;
  overflow-y: auto;
}
.nav_cont::-webkit-scrollbar {
  display: none; /* 隐藏滚动条 */
}

.one_item {
  position: relative;
  margin: 1.42rem 2.14rem;
  padding: 0 1.42rem;
  height: 5.14rem;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 0 0.28rem 0 rgba(0, 0, 0, 0.1);
  border-radius: 0.28rem;
  border: 0.07rem solid #d5dbe0;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}
.one_item > div:nth-child(1) {
  display: flex;
  align-items: center;
  font-size: 1.14rem;
  color: #1a1a1a;
}
.one_item > div:nth-child(1) > div:nth-child(1) {
  width: 6.428rem;
}
.one_icon {
  width: 2.28rem;
  height: 2.28rem;
  color: #2484fa;
  -webkit-user-drag: none;
}
.one_num {
  font-size: 2rem;
  color: #2484fa;
}
.one_item > div:nth-child(3) {
  position: absolute;
  top: 0;
  left: 0;
  width: 0.28rem;
  height: 100%;
  background: #fff;
}
.one_item_ac > div:nth-child(3) {
  background: #2484fa;
}

.two_item {
  position: relative;
  margin: 1.42rem 2.14rem;
  padding: 0 1.42rem;
  height: 8.28rem;
  background: #fff;
  box-shadow: 0 0 0.28rem 0 rgba(0, 0, 0, 0.1);
  border-radius: 0.28rem;
  border: 0.07rem solid #d5dbe0;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: center;
  flex-direction: column;
}
.two_item > div:nth-child(1) {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.two_item > div:nth-child(1) > div:nth-child(1) {
  font-size: 1.14rem;
  color: #1a1a1a;
}
.two_item > div:nth-child(2) {
  position: relative;
  z-index: 1;
  margin-top: 0.714rem;
  display: flex;
  align-items: center;
}
.two_item > div:nth-child(2) > div {
  margin-left: 0.71rem;
  flex: 1;
  height: 2.42rem;
  font-size: 1rem;
  text-align: center;
  color: #666;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.two_item > div:nth-child(2) > div:nth-child(1) {
  margin-left: 0 !important;
}
.two_bgm {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  -webkit-user-drag: none;
}
.two_item_ac > div:nth-child(3) {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 0.28rem;
  height: 100%;
  background: #fff;
}
.two_item_ac > div:nth-child(3) {
  background: #2484fa;
}

.t_ac {
  color: #2484fa !important;
  background: #e7f2ff !important;
}
</style>
