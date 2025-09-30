<template>
  <div class="etc_menu">
    <div
      :class="store.menuName === 'simModeling' ? 'menu_selected' : 'menu_unselected'"
      @click="handleMenuClick('simModeling')"
    >
      <img :src="store.menuName === 'simModeling' ? imgd : imgc" class="menu_icon" />
      仿真建模
    </div>
    <div
      :class="store.menuName === 'simAnalysis' ? 'menu_selected' : 'menu_unselected'"
      @click="handleMenuClick('simAnalysis')"
    >
      <img :src="store.menuName === 'simAnalysis' ? imgf : imge" class="menu_icon" />
      仿真分析
    </div>
    <div
      :class="store.menuName === '3DSim' ? 'menu_selected' : 'menu_unselected'"
      @click="handleMenuClick('3DSim')"
    >
      <img :src="store.menuName === '3DSim' ? imgh : imgg" class="menu_icon" />
      3D仿真
    </div>
  </div>
</template>
<script setup lang="ts">
import { Etch } from "@/stores/etch";
import imgc from '@/assets/images/19.png';
import imgd from '@/assets/images/19_ac.png';
import imge from '@/assets/images/20.png';
import imgf from '@/assets/images/20_ac.png';
import imgg from '@/assets/images/21.png';
import imgh from '@/assets/images/21_ac.png';

const store = Etch()

const handleMenuClick = (menu: string) => {
  store.saveMenuName(menu)
}

</script>
<style scoped>
.etc_menu {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 450px;
  height: 65px;
  margin-right: 300px;
}
.menu_icon {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}
.menu_selected {
  width: 130px;
  height: 32px;
  background: #FAFAFA;
  border-radius: 4px;
  border: 1px solid #D5DBE0;
  color: #2484FA;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.menu_unselected {
  width: 130px;
  height: 32px;
  background: #FAFAFA;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
</style>
