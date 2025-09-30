<template>
  <Layout class="layout_box">
    <LayoutHeader class="layout_header" v-if="currentRoute&&currentRoute!='login'">
      <Row class="layout_header_row" type="flex">
        <Col class="layout_header_col">
          <div class="layout_header_left">
            <div @dblclick="goHome">WeSim.AI</div>
            <div></div> 
            <div @dblclick="goHome">基于AI的半导体机台仿真平台</div>
          </div>
        </Col>
        <Col v-if="store.simName === 'etch'">
          <EtchMenu />
        </Col>
        <Col class="layout_header_col">
          <NavUserPop name="Lunar" />
        </Col>
      </Row>
    </LayoutHeader>
    <Layout>
      <LayoutSider class="layout_sider" v-if="navPath.includes(currentRoute)">
        <LeftNavigation />
      </LayoutSider>
      <LayoutContent class="layout_content">
        <RouterView />
      </LayoutContent>
    </Layout>
  </Layout>
  <!-- <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView /> -->
</template>
<script setup lang="ts">
import { watch, ref, defineProps } from 'vue';
import { Layout, LayoutHeader, LayoutSider, LayoutContent, Row, Col, Modal } from "ant-design-vue";
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import NavUserPop from '@/components/NavUserPop.vue';
import LeftNavigation from '@/components/LeftNavigation.vue';
import EtchMenu from './components/etching/EtchMenu.vue';
import { Etch } from '@/stores/etch';

const route = useRoute()
const router = useRouter();
const currentRoute = ref<any>(route.name);
const store = Etch()

const navPath:any = ['projectmanagement', 'casecenter', 'workflow', 'simulationtraining', 'simulationstudio', 'usermanagement', 'dataset', 'plugin']

const goHome:any = () => {
  if(currentRoute.value != 'projectmanagement') router.push('/')
}

watch(() => route.name, (newVal) => {
  currentRoute.value = newVal;
});

</script>
<style scoped>
.layout_box {
  width: 100%;
  height: 100%;
}
.layout_header {
  padding: 0 1.5rem;
  height: 4.57rem;
  background: #FFFFFF;
}
.layout_sider {
  max-width: none !important;
  min-width: 25.28rem !important;
  width: 25.28rem !important;
  background: #F0F1F2;
}
.layout_content {
  height: 100%;
  overflow: auto;
  background: #FAFAFA;
}

.layout_header_row{
  height: 100%;
  display: flex;
  justify-content: space-between;
}
.layout_header_col{
  line-height: 4.57rem !important;
}

.layout_header_left{
  display: flex;
  align-items: center;
  color: #1A1A1A;
  user-select: none;
}
.layout_header_left>div{
  cursor: pointer;
}
.layout_header_left>div:nth-child(1){
  font-size: 1.75rem;
  font-weight: 500;
  color: #2484FA;
}
.layout_header_left>div:nth-child(2){
  margin: 0 0.71rem;
  width: 0.07rem;
  height: 2.14rem;
  background: #DFDDDD;
}
.layout_header_left>div:nth-child(3){
  font-size: 1.42rem;
  font-weight: 500;
}

</style>
