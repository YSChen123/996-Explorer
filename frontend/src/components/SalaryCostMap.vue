<template> 
  <div id="salary-dashboard" class="dashboard-container">
    
    <!-- ① 公司卡片区域（挪到最上面） -->
    <div class="company-grid-section">
      <h3 class="section-title">🏢 大厂薪资情报 & 范围 (点击切换地图)</h3>
      
      <div class="company-grid">
        <div 
          v-for="c in companiesWithStats" 
          :key="c.key"
          class="company-card"
          :class="{ 'is-active': activeCompanyKey === c.key }"
          :style="{ '--brand-color': c.color }"
          @click="activeCompanyKey = c.key"
        >
          <div class="card-header">
            <div class="logo-box">{{ c.badge }}</div>
            <div class="name-box">
              <div class="cn-name">{{ c.nameZh }}</div>
              <div class="hq-tag">总部: {{ c.hq }}</div>
            </div>
            <div v-if="activeCompanyKey === c.key" class="viewing-tag">当前查看</div>
          </div>
          
          <div class="card-body">
            <div class="info-item">
              <span class="label">💼 典型业务</span>
              <span class="value text-truncate" :title="c.business">{{ c.business }}</span>
            </div>
            <div class="info-item">
              <span class="label">💰 年包范围</span>
              <span class="value salary-range">{{ c.minSalary }}w - {{ c.maxSalary }}w</span>
            </div>
          </div>

          <div class="card-bg-decoration"></div>
        </div>
      </div>
    </div>

    <!-- ② 地图区域（放到下面） -->
    <div class="map-section card-shadow">
      <div class="section-header">
        <div class="header-left">
          <span class="company-badge" :style="{ backgroundColor: currentCompany.color }">
            {{ currentCompany.nameZh }}
          </span>
          <h2>真实薪资性价比分布</h2>
        </div>
        <div class="header-right">
          <span class="highlight-text">
            数据来源: 对标
          </span>
        </div>
      </div>

      <div class="chart-wrapper">
        <v-chart 
          v-if="isMapLoaded" 
          class="map-chart" 
          :option="mapOption" 
          autoresize 
        />
        <div v-else class="loading-text">正在加载地图数据...</div>
        
        <div class="map-legend">
          <div class="legend-row">
            <span class="dot size-dot"></span>
            <span>大小：年盈余 (薪资 - 成本)</span>
          </div>
          <div class="legend-row">
            <span class="bar color-bar"></span>
            <span>颜色：生活成本 (蓝低 → 红高)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import chinaJson from '../assets/chinamap.json' 

// 状态
const isMapLoaded = ref(false)
const activeCompanyKey = ref('huawei')

// ===== 0. 原始数据输入 (无需改动) =====
const rawCsvData = `
华为,url,深圳,本科,17,107.9万,10.5
字节跳动,url,北京,本科,2-2,92.5万,6.5
小米,url,上海,硕士,15,60万,4
腾讯,url,深圳,硕士,5(1-3),27万,0
腾讯,url,上海,博士,6(2-1),83.2万,0
字节跳动,url,杭州,硕士,2-1,68.4万,0
字节跳动,url,杭州,博士,2-1,70.5万,0
华为,url,北京,硕士,15,51.3万,3
美团,url,北京,硕士,L5,52.8万,1
阿里,url,杭州,硕士,P8,213万,8
字节跳动,url,上海,硕士,2-1,61.5万,0
华为,url,上海,硕士,15,40.5万,2.5
字节跳动,url,北京,硕士,2-1,480万,4
字节跳动,url,北京,硕士,3-1,223.5万,0
字节跳动,url,北京,硕士,1-2,48万,0
华为,url,深圳,硕士,14,40.5万,2.5
华为,url,杭州,硕士,15,47.2万,4
华为,url,上海,硕士,16,59.2万,5
字节跳动,url,上海,本科,2-1,39万,0
华为,url,上海,硕士,18,67.3万,0
华为,url,上海,硕士,18,95万,9
华为,url,上海,本科,13,24万,0
字节跳动,url,深圳,本科,1-2,48万,0
华为,url,深圳,硕士,16,61.4万,7
华为,url,深圳,硕士,17,74.3万,9
百度,url,北京,硕士,T6,150.4万,8
京东,url,北京,本科,P6,46.8万,6
华为,url,上海,硕士,14,40.6万,3
美团,url,北京,硕士,L7,80.6万,4
腾讯,url,深圳,本科,11(3-3),180.3万,9
华为,url,上海,硕士,14,35万,0
华为,url,北京,硕士,17,78.4万,6
华为,url,深圳,硕士,15,43.7万,6
华为,url,成都,硕士,14,29万,0
华为,url,西安,硕士,15,35万,0
华为,url,深圳,硕士,16,51.8万,6.5
华为,url,南京,硕士,17,82.6万,9
华为,url,杭州,硕士,16,72.9万,4.5
华为,url,成都,博士,17,87万,7
华为,url,深圳,硕士,13,22.4万,1
华为,url,南京,硕士,15,50.5万,5
华为,url,西安,本科,18,150万,12
华为,url,深圳,本科,18,117.1万,10.5
华为,url,深圳,硕士,15,42万,0
华为,url,东莞,本科,18,54万,8
华为,url,成都,本科,16,61.3万,6
华为,url,上海,本科,20,242.8万,19
华为,url,上海,硕士,16,52.4万,4.5
华为,url,深圳,硕士,17,81.8万,8.5
华为,url,上海,硕士,14,40万,1.5
华为,url,东莞,硕士,13,22.4万,0.5
华为,url,杭州,本科,13,34万,0
华为,url,深圳,博士,18,136万,6
华为,url,北京,本科,16,100.1万,7.5
华为,url,深圳,本科,14,39.1万,1.5
华为,url,深圳,硕士,15,40.3万,3
华为,url,深圳,本科,15,45万,6.5
华为,url,南京,本科,15,42万,7.5
华为,url,北京,本科,15,41.6万,2
华为,url,上海,本科,14,26万,0
华为,url,杭州,本科,17,108.2万,7
华为,url,南京,本科,18,117万,8
华为,url,武汉,硕士,16,39.2万,3
华为,url,深圳,硕士,15,42万,4
华为,url,杭州,硕士,17,95万,7
华为,url,上海,硕士,17,97.9万,9.5
华为,url,杭州,硕士,13,30万,0
华为,url,深圳,硕士,14,36.4万,1.5
华为,url,上海,硕士,13,30万,0
华为,url,杭州,硕士,14,33.6万,2.5
华为,url,深圳,本科,14,32万,3
华为,url,西安,本科,16,80万,7
华为,url,深圳,硕士,16,84.2万,6
华为,url,深圳,硕士,16,64.5万,7.5
华为,url,上海,硕士,16,58.4万,1.5
华为,url,深圳,硕士,17,102.8万,0
华为,url,沈阳,硕士,商务,44.5万,5.5
华为,url,深圳,本科,16,76.1万,8
华为,url,北京,本科,24,418万,21
华为,url,深圳,本科,19,205.8万,24
字节跳动,url,深圳,本科,2-1,24万,4
字节跳动,url,深圳,本科,2-1,51万,0
字节跳动,url,北京,硕士,2-2,70.1万,5
美团,url,北京,硕士,L6,49.6万,1
华为,url,上海,本科,16,56万,0
华为,url,上海,硕士,15,42万,2
百度,url,北京,本科,P6,69.2万,6
字节跳动,url,北京,本科,2-2,90万,8
华为,url,南京,本科,16,63.1万,0
华为,url,南京,硕士,16,70.4万,4
网易,url,上海,硕士,3-3,64.5万,0
京东,url,北京,本科,T8,112万,0
华为,url,成都,硕士,14,31.5万,0
华为,url,上海,硕士,16,56.8万,4
字节跳动,url,上海,本科,1-2,92.3万,1.5
字节跳动,url,杭州,硕士,1-2,39万,0
字节跳动,url,北京,硕士,1-1,22.5万,0
美团,url,北京,本科,L7,60.5万,4
字节跳动,url,深圳,本科,2-1,34.5万,5
华为,url,武汉,硕士,18,109.6万,6
华为,url,深圳,本科,17,110.1万,18
华为,url,东莞,博士,17,75.2万,0
字节跳动,url,杭州,硕士,2-1,40.8万,4.5
华为,url,深圳,硕士,17,97.4万,7
华为,url,深圳,本科,14,36.8万,0
华为,url,杭州,本科,17,77.6万,7
华为,url,杭州,博士,17,81.2万,6
美团,url,北京,硕士,L9,150万,14
腾讯,url,深圳,博士,8(2-3),93.6万,0
华为,url,上海,硕士,15,45万,1.5
阿里,url,广州,本科,P6,8.4万,0
华为,url,深圳,本科,15,52万,3
华为,url,西安,本科,14,32.8万,0
华为,url,北京,硕士,16,65.5万,5
华为,url,深圳,本科,16,70.6万,0
华为,url,东莞,硕士,15,39.7万,4.1
华为,url,杭州,本科,16,64.6万,7
华为,url,北京,硕士,16,77.9万,8
华为,url,深圳,本科,18,154.3万,8
华为,url,深圳,本科,15,50万,3
华为,url,上海,硕士,15,54.9万,2.5
华为,url,深圳,硕士,15,48.8万,1.55
华为,url,上海,硕士,14,35万,1.4
华为,url,杭州,硕士,16,49.5万,4
华为,url,南京,硕士,16,58.4万,9
华为,url,上海,硕士,14,35万,1
华为,url,深圳,本科,商务,25.2万,0
华为,url,东莞,硕士,16,66.1万,4.2
华为,url,武汉,硕士,16,65.6万,5
华为,url,上海,硕士,16,57.6万,3.5
华为,url,南京,硕士,17,53.2万,6
华为,url,上海,硕士,15,46.4万,3
华为,url,成都,硕士,15,42.5万,3
华为,url,杭州,博士,18,134万,4
华为,url,东莞,本科,17,103.6万,10
华为,url,深圳,硕士,15,60.4万,5
华为,url,东莞,硕士,14,33.6万,1
华为,url,深圳,本科,17,82.6万,8
华为,url,东莞,博士,16,71万,3
美团,url,上海,本科,L5,15.6万,0
华为,url,深圳,硕士,17,100.4万,40
美团,url,上海,本科,L8,102.9万,8
华为,url,深圳,硕士,15,44.8万,3.5
字节跳动,url,北京,硕士,3-1,74.5万,6.5
华为,url,东莞,硕士,15,39.2万,2
华为,url,深圳,硕士,15,35.2万,4.5
美团,url,北京,本科,L6,51.2万,1.5
美团,url,北京,本科,L6,48.1万,1
华为,url,深圳,博士,商务,48万,3
华为,url,杭州,本科,15,50万,8
华为,url,苏州,硕士,15,43.2万,1.5
华为,url,上海,本科,14,37.5万,0
腾讯,url,杭州,硕士,5(1-3),48万,0
华为,url,北京,博士,19,187.6万,3
腾讯,url,深圳,硕士,10(3-2),107.6万,6.5
华为,url,北京,本科,15,48.1万,2
华为,url,上海,硕士,15,58.2万,2.5
华为,url,东莞,硕士,16,75.5万,5
华为,url,深圳,硕士,14,35.2万,0
华为,url,南京,硕士,15,37.5万,2.5
腾讯,url,贵阳,本科,13(4-2),14.4万,0
华为,url,杭州,本科,14,33万,2.5
美团,url,北京,硕士,L7,49.6万,0
华为,url,上海,硕士,14,37.5万,0
华为,url,深圳,硕士,15,37.5万,0
华为,url,西安,硕士,15,42万,2.5
华为,url,杭州,本科,18,122.7万,10
华为,url,南京,硕士,14,31.5万,0
腾讯,url,北京,本科,4(1-2),33.6万,0
华为,url,西安,本科,18,112万,18
阿里,url,杭州,硕士,P6,57.4万,5
华为,url,杭州,本科,15,65万,38
华为,url,上海,硕士,13,32万,1.2
华为,url,东莞,硕士,16,78.4万,5
华为,url,香港,本科,17,141.8万,7
字节跳动,url,北京,硕士,2-2,77.5万,2
字节跳动,url,北京,本科,2-2,115万,0
字节跳动,url,北京,硕士,2-1,71.1万,3
美团,url,上海,本科,L5,32.6万,0
小米,url,墨西哥城,本科,--,16万,2
字节跳动,url,北京,本科,2-2,259.6万,14
华为,url,深圳,硕士,16,68万,7
华为,url,西安,本科,14,29.4万,2
腾讯,url,北京,硕士,10(3-2),139.5万,7
华为,url,上海,硕士,15,47.2万,1
腾讯,url,北京,本科,14(4-3),440万,2
网易,url,杭州,硕士,3-2,38.4万,5
百度,url,北京,本科,T4,44.8万,4
百度,url,北京,本科,T6,78.4万,11
华为,url,杭州,本科,15,50.4万,4
字节跳动,url,杭州,本科,3-2,273.5万,12
华为,url,成都,硕士,18,137.2万,17
华为,url,成都,硕士,18,93.6万,17
华为,url,深圳,本科,16,40.6万,0
字节跳动,url,深圳,本科,2-1,85万,7
华为,url,深圳,本科,15,27.3万,8
华为,url,上海,博士,16,66.9万,3.5
字节跳动,url,上海,硕士,2-2,120万,6
华为,url,深圳,硕士,15,43.5万,5
华为,url,西安,本科,15,42.6万,7
字节跳动,url,都伯林,硕士,2-1,68.4万,0
腾讯,url,北京,硕士,T10,135.5万,7
字节跳动,url,上海,本科,3-1,142.5万,12
腾讯,url,深圳,硕士,7(2-2),44.5万,2
华为,url,北京,博士,20,299万,0
网易,url,北京,硕士,3-3,51.2万,4
字节跳动,url,北京,硕士,3-1,118万,6.51
小米,url,北京,硕士,17,120万,5
网易,url,广州,本科,5-1,139.7万,10.5
华为,url,苏州,本科,14,35.2万,3
华为,url,上海,硕士,16,55.3万,4
拼多多,url,上海,硕士,员工,48.6万,0
字节跳动,url,杭州,本科,2-1,61.5万,7
美团,url,北京,硕士,L6,55.8万,0
美团,url,北京,硕士,L5,46.5万,0
美团,url,北京,本科,L7,63.9万,10
华为,url,成都,本科,15,56.2万,5
美团,url,杭州,本科,L6,31万,5
阿里,url,北京,本科,P7,123.2万,0
阿里,url,杭州,硕士,P7,110万,0
华为,url,上海,硕士,15,51万,1
美团,url,上海,本科,L7,52.7万,4
美团,url,北京,本科,L7,60.5万,0
阿里,url,杭州,硕士,P8,267.2万,10
华为,url,杭州,本科,15,39万,3
网易,url,广州,本科,4-1,54万,7
字节跳动,url,北京,本科,2-2,98万,8
网易,url,广州,硕士,3-3,47.5万,11
字节跳动,url,北京,硕士,1-2,51万,0
阿里,url,上海,硕士,P6,86.9万,4
腾讯,url,北京,本科,8(2-3),218万,3
京东,url,上海,本科,T8,174万,12
百度,url,深圳,硕士,T4,48万,2
网易,url,杭州,硕士,3-2,41.6万,1
字节跳动,url,北京,本科,2-1,45万,3
字节跳动,url,北京,本科,1-2,37.5万,1.5
字节跳动,url,深圳,本科,2-1,69万,3
京东,url,北京,硕士,P6,51.3万,3
华为,url,东莞,本科,18,129万,13
腾讯,url,北京,硕士,t6,70万,0
阿里,url,杭州,硕士,P6,74.2万,7
百度,url,北京,本科,T6,116万,7
腾讯,url,北京,硕士,10(3-2),147.5万,7
华为,url,上海,本科,18,150万,15
腾讯,url,上海,本科,10(3-2),97.3万,6.5
华为,url,深圳,硕士,18,140万,40
字节跳动,url,深圳,硕士,1-2,51万,0
美团,url,北京,硕士,L8,92.2万,5
小米,url,武汉,硕士,13,28.5万,0.5
京东,url,北京,硕士,测试开发,62.7万,4
字节跳动,url,北京,本科,2-1,40.5万,3
字节跳动,url,杭州,本科,1-2,42万,0
网易,url,杭州,本科,3-3,51.2万,0
腾讯,url,北京,硕士,12(4-1),208万,10
华为,url,深圳,本科,19,293.7万,14
字节跳动,url,北京,硕士,2-1,58.5万,2
字节跳动,url,北京,硕士,1-2,59万,0
阿里,url,北京,硕士,P7,111.5万,10
字节跳动,url,上海,本科,1-2,45万,0
华为,url,深圳,本科,16,64.4万,7
字节跳动,url,深圳,专科,1-2,18万,0
腾讯,url,广州,本科,9(3-1),62万,3
华为,url,东莞,硕士,16,79.6万,5
网易,url,广州,本科,4-1,52.7万,4
网易,url,广州,本科,3-3,45万,3.5
网易,url,广州,本科,3-3,35.2万,3
网易,url,广州,本科,3-2,32万,2
网易,url,广州,本科,3-1,27.2万,0
网易,url,广州,本科,2-3,22.4万,1
字节跳动,url,杭州,本科,3-1,317万,0
字节跳动,url,杭州,本科,3-1,228万,0
字节跳动,url,上海,硕士,2-1,86万,6
字节跳动,url,上海,硕士,2-1,80万,4.5
华为,url,深圳,硕士,17,86.6万,6
字节跳动,url,北京,本科,2-1,55.5万,0
京东,url,北京,硕士,T4,41.6万,3
京东,url,北京,本科,T7,94.5万,9
百度,url,北京,本科,T4,46.4万,5
百度,url,上海,硕士,T5,56万,4
京东,url,北京,本科,T8,111.2万,0
京东,url,北京,本科,T4,41.6万,3
百度,url,北京,硕士,T4,48万,3
腾讯,url,深圳,本科,10(3-2),57.6万,12
小米,url,北京,硕士,17,68万,0
字节跳动,url,北京,本科,2-2,101万,0
字节跳动,url,上海,硕士,2-2,63万,6
小米,url,北京,本科,16,54万,8.5
百度,url,北京,硕士,T4,44.9万,3
百度,url,北京,本科,P5,57.6万,2
网易,url,广州,本科,3-2,28.8万,8
阿里,url,杭州,硕士,P6,54.4万,4
字节跳动,url,北京,硕士,2-2,82.5万,4
腾讯,url,成都,本科,9(3-1),87万,3
阿里,url,杭州,本科,P6,66万,7
网易,url,杭州,本科,4-1,61.2万,5
阿里,url,杭州,硕士,P6,62.4万,6
华为,url,深圳,本科,14,36.8万,1
腾讯,url,北京,本科,7(2-2),45万,2
字节跳动,url,北京,硕士,3-1,122.5万,8
美团,url,上海,本科,L8,171万,0
京东,url,北京,本科,P5,60.8万,3
腾讯,url,深圳,硕士,8(2-3),43.5万,0
华为,url,香港,硕士,15,40.5万,3
华为,url,北京,本科,15,45万,3
京东,url,上海,硕士,T8,170万,7
美团,url,北京,硕士,L7,74.4万,4
字节跳动,url,上海,本科,2-1,66万,7
京东,url,北京,硕士,T7,100.7万,4
字节跳动,url,上海,本科,2-2,86万,9.5
字节跳动,url,北京,硕士,2-1,45万,2
百度,url,北京,硕士,T7,146.2万,0
百度,url,北京,硕士,T5,64万,3
字节跳动,url,上海,本科,1-2,43.5万,3
字节跳动,url,上海,本科,3-1,110万,7
京东,url,北京,本科,T6,66.5万,4
阿里,url,杭州,硕士,P7,82.2万,9
网易,url,北京,硕士,3-3,45万,7
华为,url,上海,硕士,15,44.8万,2
美团,url,北京,硕士,L7,118.4万,0
京东,url,北京,本科,T5,64.6万,3
腾讯,url,北京,本科,10(3-2),91.5万,12
阿里,url,北京,硕士,P6,57.8万,0
百度,url,北京,硕士,T4,46.4万,4
字节跳动,url,杭州,硕士,2-2,130万,0
字节跳动,url,北京,本科,2-2,66万,7
百度,url,北京,本科,T6,74.4万,9
字节跳动,url,北京,本科,1-1,60万,0.5
华为,url,北京,硕士,16,70.3万,3
百度,url,北京,本科,T6,88万,0
京东,url,北京,本科,P5,28.5万,7
百度,url,北京,本科,T7,130万,40
字节跳动,url,北京,硕士,2-2,107.5万,4.5
百度,url,北京,硕士,T7,182万,9
字节跳动,url,深圳,本科,2-1,45万,0
腾讯,url,深圳,本科,9(3-1),77.5万,4.5
字节跳动,url,北京,硕士,2-1,35万,0
美团,url,深圳,硕士,L7,70.1万,5
美团,url,北京,本科,L5,35.7万,0
阿里,url,杭州,本科,P7,91万,0
字节跳动,url,上海,硕士,2-1,75万,2.5
美团,url,北京,本科,L6,45万,0
阿里,url,北京,本科,P7,101.2万,0
阿里,url,上海,硕士,P5,48万,0
腾讯,url,深圳,博士,12(4-1),258.5万,15
腾讯,url,深圳,硕士,4(1-2),9.6万,0
小米,url,上海,本科,15,57万,0
阿里,url,杭州,本科,P6,49.5万,8
美团,url,北京,本科,L7,77.6万,0
美团,url,北京,本科,L7,54.3万,6
华为,url,成都,硕士,16,66万,7
字节跳动,url,深圳,本科,2-1,63.5万,4
阿里,url,上海,硕士,P6,51.2万,7
字节跳动,url,北京,硕士,3-2,157.5万,12
阿里,url,杭州,本科,P6,36.8万,5
字节跳动,url,深圳,硕士,1-2,42万,0
小米,url,南京,本科,16,46.4万,2.5
字节跳动,url,杭州,硕士,2-2,92万,7
阿里,url,杭州,本科,P7,145.3万,5.5
字节跳动,url,北京,硕士,2-1,59万,2
`

// ===== 1. 基础配置 =====
const cityAnnualCost = {
  '香港': 25.0, '上海': 17.4, '北京': 16.2, '深圳': 14.4, 
  '杭州': 12.0, '广州': 10.8, '南京': 10.0, '苏州': 10.0, 
  '成都': 9.0,  '东莞': 9.0,  '西安': 8.0,  '武汉': 8.0,
  '沈阳': 7.0,  '贵阳': 6.5, '都伯林': 20.0, '墨西哥城': 10.0
}

const cityCoordMap = {
  '北京': [116.40, 39.90], '上海': [121.47, 31.23], '广州': [113.27, 23.13],
  '深圳': [114.06, 22.55], '杭州': [120.16, 30.25], '南京': [118.78, 32.04],
  '成都': [104.06, 30.67], '西安': [108.94, 34.34], '武汉': [114.31, 30.52],
  '东莞': [113.75, 23.02], '沈阳': [123.43, 41.80], '苏州': [120.58, 31.30],
  '香港': [114.16, 22.31], '贵阳': [106.63, 26.65]
}

// 修正后的品牌颜色
const companiesRaw = [
  { key: 'huawei',    nameZh: '华为',     badge: '菊', color: '#C7000B', hq: '深圳', business: 'ICT, 终端, 华为云' },
  { key: 'bytedance', nameZh: '字节跳动', badge: '字', color: '#325AB4', hq: '北京', business: '抖音, TikTok, 头条' },
  { key: 'tencent',   nameZh: '腾讯',     badge: '腾', color: '#0052D9', hq: '深圳', business: '微信, 游戏, 腾讯云' },
  { key: 'alibaba',   nameZh: '阿里',     badge: '阿', color: '#FF6A00', hq: '杭州', business: '淘宝, 阿里云, 菜鸟' },
  { key: 'meituan',   nameZh: '美团',     badge: '团', color: '#FFC300', hq: '北京', business: '到店, 到家, 优选' },
  { key: 'baidu',     nameZh: '百度',     badge: '度', color: '#2932E1', hq: '北京', business: '搜索, 智能云, 自动驾驶' },
  { key: 'jd',        nameZh: '京东',     badge: '京', color: '#E1251B', hq: '北京', business: '零售, 物流, 科技' },
  { key: 'xiaomi',    nameZh: '小米',     badge: '米', color: '#FF6700', hq: '北京', business: '手机, IoT, 汽车' },
  { key: 'netease',   nameZh: '网易',     badge: '网', color: '#C20C0C', hq: '杭州', business: '游戏, 云音乐, 有道' },
  { key: 'pdd',       nameZh: '拼多多',   badge: '多', color: '#E02E24', hq: '上海', business: '拼多多, Temu' }
]

// ===== 2. 数据处理逻辑 =====
const parsedData = ref({}) 
const totalDataCount = ref(0)

const processRawData = () => {
  const lines = rawCsvData.trim().split('\n')
  const result = {}
  let count = 0

  lines.forEach(line => {
    if (!line) return
    const parts = line.split(',')
    // CSV结构: 公司(0), url(1), 城市(2), 学历(3), 职级(4), 薪资(5), 经验(6)
    if (parts.length < 6) return

    let companyName = parts[0].trim()
    const city = parts[2].trim()
    const salaryStr = parts[5].trim()
    
    // 清洗薪资
    const salaryVal = parseFloat(salaryStr.replace('万', ''))
    if (isNaN(salaryVal)) return

    // 归一化公司名
    if (companyName.includes('阿里')) companyName = '阿里' 

    // 找到对应的 key
    const compConfig = companiesRaw.find(c => c.nameZh === companyName)
    if (compConfig) {
      const key = compConfig.key
      if (!result[key]) result[key] = {}
      if (!result[key][city]) result[key][city] = []
      result[key][city].push(salaryVal)
      count++
    }
  })
  parsedData.value = result
  totalDataCount.value = count
}

const companiesWithStats = computed(() => {
  return companiesRaw.map(c => {
    const cityMap = parsedData.value[c.key] || {}
    let allSalaries = []
    Object.values(cityMap).forEach(arr => allSalaries.push(...arr))
    
    let min = 0, max = 0, count = 0
    if (allSalaries.length > 0) {
      min = Math.min(...allSalaries).toFixed(0)
      max = Math.max(...allSalaries).toFixed(0)
      count = allSalaries.length
    }

    return { 
      ...c, 
      minSalary: min,
      maxSalary: max,
      sampleCount: count
    }
  })
})

const currentCompany = computed(() => 
  companiesWithStats.value.find(c => c.key === activeCompanyKey.value) || companiesWithStats.value[0]
)

const currentMapData = computed(() => {
  const company = currentCompany.value
  const cityMap = parsedData.value[company.key] || {}
  
  return Object.keys(cityMap)
    .filter(city => cityCoordMap[city]) 
    .map(city => {
      const salaries = cityMap[city]
      const avgSalary = salaries.reduce((a, b) => a + b, 0) / salaries.length
      const cost = cityAnnualCost[city] || 10.0
      const surplus = avgSalary - cost 
      
      return {
        name: city,
        // value: [经度, 纬度, 盈余, 成本, 平均薪资, 样本数]
        value: [...cityCoordMap[city], surplus, cost, avgSalary, salaries.length]
      }
    })
    .sort((a, b) => b.value[2] - a.value[2])
})

const getSurplusColor = (val) => {
  if (val > 80) return '#ef4444' // 高盈余也给个红色系提示
  if (val > 40) return '#facc15' 
  return '#3b82f6'
}

// ===== 3. 生命周期 =====
onMounted(() => {
  // 1. 先处理薪资数据
  processRawData()

  // 2. 直接用本地导入的 chinaJson 注册地图
  echarts.registerMap('china', chinaJson)

  // 3. 标记地图已加载
  isMapLoaded.value = true
})

// ===== 4. ECharts Option =====
const mapOption = computed(() => {
  const data = currentMapData.value
  const color = currentCompany.value.color

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 0, 
      textStyle: { color: '#333' },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border-radius: 8px; overflow: hidden; z-index: 1000;',
      formatter: params => {
        if (!params.value) return ''
        const [,, surplus, cost, avgSalary, count] = params.value
        return `
          <div style="width: 180px; font-family: sans-serif;">
            <div style="background:${color}; padding:8px 12px; color:#fff; font-weight:bold; font-size:14px;">
            </div>
            <div style="padding:12px; font-size:13px; color:#4b5563; line-height:1.8;">
              <div style="display:flex; justify-content:space-between;">
                <span>💰 平均年薪</span><span style="font-weight:700; color:#1f2937">${avgSalary.toFixed(1)}w</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>💸 生活成本</span><span style="color:#ef4444">-${cost.toFixed(1)}w</span>
              </div>
              <div style="margin-top:8px; padding-top:8px; border-top:1px dashed #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">平均盈余</span>
                <span style="font-size:15px; font-weight:800; color:#059669">
                  ${surplus.toFixed(1)}w
                </span>
              </div>
            </div>
          </div>
        `
      }
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.25,
      center: [105, 36],
      label: { show: true, fontSize: 10, color: '#9ca3af' },
      itemStyle: {
        areaColor: '#f9fafb', borderColor: '#d1d5db', borderWidth: 1
      },
      emphasis: {
        itemStyle: { areaColor: '#eff6ff', borderColor: color },
        label: { show: false }
      }
    },
    series: [
      {
        name: 'Bubbles',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        symbolSize: val => Math.max(8, Math.min(60, val[2] / 2.0)), 
        label: {
          show: true, position: 'bottom', formatter: '{b}',
          color: '#374151', fontSize: 11, fontWeight: 600,
          backgroundColor: 'rgba(255,255,255,0.7)', padding: [2, 4], borderRadius: 3
        },
        itemStyle: { 
          borderColor: '#fff', borderWidth: 1, opacity: 0.9,
          shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.2)'
        },
        data: data
      }
    ],
    // 视觉映射：修复颜色逻辑为 蓝 -> 黄 -> 红
    visualMap: {
      show: false, 
      dimension: 3, // 使用 Cost (成本) 列
      min: 6, max: 25,      
      // 蓝色(低成本) -> 黄色(中成本) -> 红色(高成本)
      inRange: { color: ['#3b82f6', '#facc15', '#ef4444'] } 
    }
  }
})
</script>

<style scoped>
/* ===== 1. 布局容器修复 (强制接管滚动) ===== */
.dashboard-container {
  /* 关键：将高度设为视口高度的 85% - 90%，留出顶部空间 */
  height: 85vh;
   width: 100%;
  
  /* 关键：由本组件自己产生滚动条，无视父级限制 */
  overflow-y: auto; 
  -webkit-overflow-scrolling: touch; /* 丝滑滚动 */
  
   display: flex;
   flex-direction: column;
   gap: 24px;
  
   padding: 24px;
  /* 关键：留出巨大的底部空间，防止被底部导航栏或浏览器边缘遮挡 */
  padding-bottom: 180px; 
  
   box-sizing: border-box;
   font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
   background-color: #f3f4f6;
   position: relative;
}


/* ===== 2. 地图区域 (调小高度) ===== */
.map-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  flex-shrink: 0; /* 防止被挤压 */
  
  /* 关键修改：高度固定为 450px，不要太高，把空间留给下面的列表 */
  height: 750px; 
  min-height: 450px; 
  
  display: flex;
  flex-direction: column;
}


.card-shadow {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap; 
  gap: 10px;
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; gap: 12px; }
.header-left h2 { font-size: 20px; color: #1f2937; margin: 0; font-weight: 700; }

.company-badge {
  color: white; padding: 6px 12px; border-radius: 6px; 
  font-weight: 600; font-size: 15px; letter-spacing: 1px;
}

.highlight-text { font-size: 12px; color: #9ca3af; }

.chart-wrapper { 
  flex: 1; 
  position: relative; 
  width: 100%;
  height: 100%; 
  overflow: hidden; 
}
.map-chart { width: 100%; height: 100%; }

.loading-text { 
  display: flex; align-items: center; justify-content: center; 
  height: 100%; width: 100%; color: #9ca3af; 
}

.map-legend {
  position: absolute; bottom: 30px; left: 30px; 
  background: rgba(255, 255, 255, 0.95);
  padding: 16px; border-radius: 10px; border: 1px solid #e5e7eb;
  font-size: 13px; color: #4b5563; pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.legend-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.legend-row:last-child { margin-bottom: 0; }
.dot { width: 12px; height: 12px; background: #9ca3af; border-radius: 50%; }
.bar { width: 50px; height: 8px; background: linear-gradient(to right, #3b82f6, #facc15, #ef4444); border-radius: 4px; }

/* ===== 3. 底部列表 ===== */
.company-grid-section {
  flex-shrink: 0; 
  margin-top: 10px;
}

.section-title { font-size: 18px; color: #374151; margin: 0 0 20px 4px; display: flex; align-items: center; gap: 8px; font-weight: 700; }

.company-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.company-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px; 
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.company-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.company-card.is-active {
  border-color: var(--brand-color);
  box-shadow: 0 0 0 2px var(--brand-color); 
  background: #fff;
}

.card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }

.logo-box {
  width: 48px; height: 48px;
  background: #f3f4f6; color: #6b7280;
  border-radius: 10px; 
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 20px;
  transition: background 0.3s, color 0.3s;
}

.company-card.is-active .logo-box {
  background: var(--brand-color);
  color: white;
}

.name-box { flex: 1; }
.cn-name { font-weight: 700; color: #111827; font-size: 16px; }
.hq-tag { font-size: 12px; color: #9ca3af; margin-top: 4px; }

.viewing-tag {
  font-size: 11px; color: var(--brand-color);
  background: #eff6ff; padding: 4px 8px; border-radius: 6px; font-weight: 600;
}

.card-body { display: flex; flex-direction: column; gap: 10px; }

.info-item { display: flex; justify-content: space-between; font-size: 13px; align-items: baseline; }
.label { color: #6b7280; }
.value { font-weight: 600; color: #374151; max-width: 160px; text-align: right; }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.salary-range { color: #059669; font-family: monospace; font-size: 14px; }

.card-bg-decoration {
  position: absolute; right: -15px; bottom: -15px;
  width: 80px; height: 80px;
  background: var(--brand-color);
  opacity: 0.05;
  border-radius: 50%;
  pointer-events: none;
}
</style>