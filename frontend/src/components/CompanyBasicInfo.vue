<template>
  <div class="basic-layout">
    <!-- 左侧公司选择栏 -->
    <aside class="company-panel">
      <div class="company-panel-title">⭐ 选择一家公司</div>
      <div class="company-list">
        <button
          v-for="c in companies"
          :key="c.key"
          class="company-item"
          :class="{ active: activeKey === c.key }"
          @click="activeKey = c.key"
          :style="{ '--company-color': c.color }"
        >
          <div class="company-logo">
            <span>{{ c.badge }}</span>
          </div>
          <div class="company-text">
            <div class="company-name-zh">{{ c.nameZh }}</div>
            <div class="company-name-en">{{ c.nameEn }}</div>
            <div class="company-extra">总部：{{ c.hqCity }}</div>
          </div>
        </button>
      </div>
    </aside>

    <!-- 右侧信息展示区 -->
    <section class="info-panel">
      <header class="info-header">
        <h2 class="info-title">
          {{ activeCompany.nameZh }} · {{ activeCompany.nameEn }}
        </h2>
        <p class="info-tagline">
          {{ activeCompany.tagline }}
        </p>
      </header>

      <div class="info-grid">
        <!-- 基础信息 -->
        <article class="info-card wide">
          <div class="info-card-title">总部城市 & 典型业务线</div>
          <div class="info-card-body">
            <p class="info-text-row">
              <span class="label">总部城市：</span>
              <span class="value">{{ activeCompany.hqCity }}</span>
            </p>
            <p class="info-text-row">
              <span class="label">核心园区：</span>
              <span class="value">{{ activeCompany.hqDetail }}</span>
            </p>
            <p class="info-text-row">
              <span class="label">典型岗位：</span>
              <span class="value">{{ activeCompany.mainRoles }}</span>
            </p>
          </div>
        </article>

        <!-- 主要业务 -->
        <article class="info-card">
          <div class="info-card-title">主要业务</div>
          <div class="info-card-body">
            <p class="info-highlight">
              {{ activeCompany.coreBizShort }}
            </p>
            <p class="info-paragraph">
              {{ activeCompany.coreBizDesc }}
            </p>
          </div>
        </article>

        <!-- 估算薪资 -->
        <article class="info-card">
          <div class="info-card-title">应届技术岗年包（估算）</div>
          <div class="info-card-body">
            <p class="salary-main">
              {{ activeCompany.salaryRange }}
            </p>
            <p class="salary-note">
              {{ activeCompany.salaryNote }}
            </p>
            <p class="info-paragraph">
              {{ activeCompany.salaryExtra }}
            </p>
          </div>
        </article>

        <!-- 办公城市 -->
        <article class="info-card">
          <div class="info-card-title">主要办公城市</div>
          <div class="info-card-body">
            <p class="info-text-row">
              <span class="label">核心城市：</span>
              <span class="value">{{ activeCompany.officeCities.join('、') }}</span>
            </p>
            <p class="info-paragraph">
              {{ activeCompany.officeDesc }}
            </p>
          </div>
        </article>

        <!-- 团队氛围 -->
        <article class="info-card">
          <div class="info-card-title">团队风格 / 工作氛围（主观印象）</div>
          <div class="info-card-body">
            <p class="info-paragraph">
              {{ activeCompany.cultureDesc }}
            </p>
            <p class="info-paragraph subtle">
              说明：仅根据公开评价、网络帖子与课程调研的综合印象，用于课堂讨论，不代表官方观点。
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const companies = [
  {
    key: 'tencent',
    badge: '腾',
    color: '#2563eb',
    nameZh: '腾讯',
    nameEn: 'Tencent',
    hqCity: '深圳',
    hqDetail: '深圳·后海 / 深圳湾科技生态园一带',
    mainRoles: '后端 / C++ / Go、后台服务、IM、多媒体、云原生、音视频、Android / iOS 等',
    coreBizShort: '社交、游戏、云、广告',
    coreBizDesc:
      '以微信 / QQ 等社交产品为底盘，叠加游戏发行与自研、广告、电商与腾讯云，现金流稳定、业务线丰富，是综合型“超级平台公司”。',
    salaryRange: '40 ~ 45 万 / 年',
    salaryNote:
      '以北上广深的开发岗为估算区间（底薪 + 年终 + 可能的股票），不同城市和业务线差异较大，仅做粗略参考。',
    salaryExtra:
      '通常研发主干业务（如微信、PCG、TEG 等）待遇略高，实习转正和绩效表现会影响年终奖和股票发放节奏。',
    officeCities: ['深圳', '北京', '上海', '成都', '广州', '西安'],
    officeDesc:
      '一线城市（深 / 北 / 上）业务线最全、机会最多；成都 / 广州 / 西安等城市也有成熟研发中心，适合希望在新一线长期发展的同学。',
    cultureDesc:
      '整体工程化体系比较完善，重视代码质量和稳定性。节奏不算最“狠”的 996，但在核心业务团队仍然存在较强的上线压力，偏业务线的团队加班会更多。'
  },
  {
    key: 'bytedance',
    badge: '字',
    color: '#06b6d4',
    nameZh: '字节跳动',
    nameEn: 'ByteDance',
    hqCity: '北京',
    hqDetail: '北京·望京 / 未来科学城区域',
    mainRoles: '推荐算法、数据平台、后端 / 服务端、前端、客户端、AIGC 相关岗位等',
    coreBizShort: '内容分发、短视频、电商、AIGC',
    coreBizDesc:
      '以抖音 / 今日头条为核心流量入口，围绕内容分发、电商闭环、企业服务和 AIGC 产品展开，技术驱动氛围浓、算法基建完备，是推荐与大数据方向的热门选择。',
    salaryRange: '42 ~ 48 万 / 年',
    salaryNote:
      '估算的是一线城市技术岗的总包中位数，包含绩效与一定比例的股票或年终。',
    salaryExtra:
      '整体给薪相对激进，绩效与团队业务增长高度绑定；新人如果对算法 / 大数据 / AIGC 兴趣浓厚，可以优先关注。',
    officeCities: ['北京', '上海', '深圳', '杭州', '广州', '成都'],
    officeDesc:
      '北京仍然是最核心的研发中心；上海 / 杭州在电商与本地生活方向布局较多，深圳更多偏商业化与综合业务线。',
    cultureDesc:
      '节奏普遍偏快，是同学们印象里的“高压高回报”代表之一。强调数据驱动和 owner 意识，项目推进效率高，但也需要更好的抗压能力和自我管理能力。'
  },
  {
    key: 'alibaba',
    badge: '阿',
    color: '#f97316',
    nameZh: '阿里巴巴',
    nameEn: 'Alibaba',
    hqCity: '杭州',
    hqDetail: '杭州·西溪园区 / 滨江园区一带',
    mainRoles: '电商平台研发、搜索与推荐、支付安全、云计算、数据库等基础设施',
    coreBizShort: '电商、支付、云计算',
    coreBizDesc:
      '以淘系电商和支付宝生态为核心，叠加阿里云、菜鸟物流等业务板块，是电商与云计算方向的重要阵地，内部技术积累深厚。',
    salaryRange: '38 ~ 45 万 / 年',
    salaryNote: '估算以杭州 / 上海研发岗位为主，P6 级别上下浮动较大。',
    salaryExtra:
      '整体薪资随业务调整略有波动，但云 / 基础设施方向依然有不错的长期成长空间；校招生如果喜欢底层工程和电商场景，可以重点关注。',
    officeCities: ['杭州', '上海', '北京', '深圳', '成都', '广州'],
    officeDesc:
      '杭州是绝对的大本营；上海在云与国际化业务比重较高，北京则偏基础设施和部分创新业务。',
    cultureDesc:
      '组织调整较为频繁，需要适应变化与轮岗；许多团队延续了“中台 + 战队”的协作方式，工程规范成熟，但历史系统较多，上手初期会有一定复杂度。'
  },
  {
    key: 'pdd',
    badge: '多',
    color: '#ef4444',
    nameZh: '拼多多',
    nameEn: 'PDD',
    hqCity: '上海',
    hqDetail: '上海·张江 / 陆家嘴一带',
    mainRoles: '电商交易、搜索推荐、供应链技术、跨境 Temu 等',
    coreBizShort: '高性价比电商、跨境电商',
    coreBizDesc:
      '通过“多实惠、多乐趣”的电商模式快速崛起，近年来在 Temu 跨境业务上投入巨大，是增长速度非常快的公司之一。',
    salaryRange: '45 ~ 55 万 / 年',
    salaryNote:
      '技术岗总包在一线厂中偏高梯队，但与工作强度和业务目标完成度强绑定。',
    salaryExtra:
      '绩效拉开差距明显，业务成长期机会多；适合愿意在高压环境下冲刺、对电商和跨境链路有兴趣的同学。',
    officeCities: ['上海'],
    officeDesc:
      '主要集中在上海，办公地点相对集中，团队间沟通成本低；也意味着大多数岗位需要在上海长期发展。',
    cultureDesc:
      '业内公认节奏非常快、目标导向极强的一家公司，强调结果与业务价值，对个人执行力要求高，工作与生活节奏需要自己权衡。'
  },
  {
    key: 'xiaomi',
    badge: '米',
    color: '#fb923c',
    nameZh: '小米',
    nameEn: 'Xiaomi',
    hqCity: '北京',
    hqDetail: '北京·亦庄 / 海淀区域',
    mainRoles: '手机与 IoT 系统、操作系统、车机 / 汽车、互联网服务等',
    coreBizShort: '智能手机、IoT、智能汽车',
    coreBizDesc:
      '从手机与 MIUI 起家，延展到 IoT 生态和智能汽车，软硬一体、产品线丰富，是偏“工程 +产品 + 硬件融合”的代表企业。',
    salaryRange: '35 ~ 42 万 / 年',
    salaryNote:
      '智能汽车与核心系统团队会有略高区间，不同业务线差异明显。',
    salaryExtra:
      '如果对嵌入式系统、操作系统内核、车机 / 汽车软件等方向感兴趣，小米会是很好的综合练手机会。',
    officeCities: ['北京', '上海', '武汉'],
    officeDesc:
      '北京仍然是核心研发中心；上海更多承载部分互联网与汽车相关业务，武汉有部分研发团队布局。',
    cultureDesc:
      '整体氛围相对工程师友好，强调“做感动人心、价格厚道的好产品”，在产品打磨与工程质量上会有比较高要求，加班强度视项目节奏而定。'
  },
  {
    key: 'netease',
    badge: '网',
    color: '#dc2626',
    nameZh: '网易',
    nameEn: 'NetEase',
    hqCity: '杭州',
    hqDetail: '杭州·滨江园区',
    mainRoles: '游戏研发、音乐与内容社区、教育与云音乐生态',
    coreBizShort: '游戏、内容社区、音乐',
    coreBizDesc:
      '在端游 / 手游领域积累深厚，云音乐、LOFTER 等产品有较强社区氛围，总体更偏内容与游戏方向，对美术与产品体验要求高。',
    salaryRange: '35 ~ 40 万 / 年',
    salaryNote: '以游戏和云音乐方向的研发岗位为主，具体视项目组而定。',
    salaryExtra:
      '游戏收入波动会带来项目组调整，需要适应项目生命周期；对游戏和内容产品有热情的同学会较有归属感。',
    officeCities: ['杭州', '广州', '上海', '北京'],
    officeDesc:
      '杭州是大本营，广州在游戏方面力量也很强；上海和北京则有部分创新业务与平台支持团队。',
    cultureDesc:
      '较看重审美与产品品味，项目之间差异很大；有些团队节奏适中，有些项目上线阶段会非常忙，需要结合具体岗位了解。'
  },
  {
    key: 'meituan',
    badge: '团',
    color: '#22c55e',
    nameZh: '美团',
    nameEn: 'Meituan',
    hqCity: '北京',
    hqDetail: '北京·望京 / 朝阳区域',
    mainRoles: '本地生活、到店 / 到家、外卖配送、地图与调度算法等',
    coreBizShort: '本地生活服务平台',
    coreBizDesc:
      '围绕“吃喝玩乐行”的本地生活场景构建综合平台，对算法和工程架构要求都比较高，是实际工程难度较大的公司之一。',
    salaryRange: '38 ~ 45 万 / 年',
    salaryNote:
      '外卖 / 到店等核心 BU 的技术岗待遇较有竞争力，不同城市和事业群之间差异存在。',
    salaryExtra:
      '有大量偏算法的调度 / 推荐问题，也有复杂的工程体系（订单、物流、骑手等），适合希望在“复杂业务 + 算法落地”中成长的同学。',
    officeCities: ['北京', '上海', '成都', '深圳'],
    officeDesc:
      '北京为核心，上海和成都在本地生活和创新业务上的比重逐渐提升；深圳有部分支付与金融相关团队。',
    cultureDesc:
      '整体节奏偏快，但比“极致 996”略温和一些；非常强调业务sense和对用户需求的理解，业务同学与技术同学协作紧密。'
  },
  {
    key: 'jd',
    badge: '京',
    color: '#f97373',
    nameZh: '京东',
    nameEn: 'JD.com',
    hqCity: '北京',
    hqDetail: '北京·亦庄园区',
    mainRoles: '零售电商、物流技术、仓储与供应链系统、金融科技等',
    coreBizShort: '零售电商、物流基础设施',
    coreBizDesc:
      '以自营电商和强大的物流网络著称，仓储、配送和供应链系统工程复杂度高，是做“大型分布式系统 + 物流场景”的好去处。',
    salaryRange: '36 ~ 42 万 / 年',
    salaryNote:
      '北京 / 上海研发岗为主，仓储与物流算法方向整体待遇略高。',
    salaryExtra:
      '如果希望深入理解从下单到收货全链路的系统设计，京东会提供丰富的真实场景；但也需要适应大规模历史系统和较多的线上运维压力。',
    officeCities: ['北京', '上海', '广州', '深圳', '成都', '西安'],
    officeDesc:
      '北京为主；上海 / 广州 / 深圳在零售与物流金融业务上也有较多团队分布，新一线城市则承载部分技术中心和运营中心职能。',
    cultureDesc:
      '目标导向明显，强调执行与落地；物流相关团队在大促等节点会有明显的“战役节奏”，平时强度中等偏上。'
  },
  {
    key: 'baidu',
    badge: '度',
    color: '#3b82f6',
    nameZh: '百度',
    nameEn: 'Baidu',
    hqCity: '北京',
    hqDetail: '北京·上地 / 西二旗区域',
    mainRoles: '搜索与广告、地图、自动驾驶、云与大模型相关岗位等',
    coreBizShort: '搜索、广告、自动驾驶、大模型',
    coreBizDesc:
      '在搜索与广告业务基础上，布局自动驾驶、智能云与大模型等方向，是国内最早大规模投入自动驾驶和 AI 平台化的公司之一。',
    salaryRange: '36 ~ 43 万 / 年',
    salaryNote:
      'AI 平台与自动驾驶等方向会略高一些，传统搜索 / 广告线相对稳定。',
    salaryExtra:
      '对算法与平台工程同学比较友好，可以接触到搜索、NLP、CV 等多种 AI 相关场景；适合想在“平台 + 算法 + 工程”交叉地带发展的同学。',
    officeCities: ['北京', '上海', '深圳', '广州'],
    officeDesc:
      '北京是核心研发基地；上海 / 深圳在云与大模型生态布局较多，自动驾驶团队主要集中在北京等少数城市。',
    cultureDesc:
      '技术氛围较浓，AI 相关团队科研味道比较重；但组织结构相对复杂，需要适应大公司节奏和横向协调成本。'
  }
]

const activeKey = ref('tencent')

const activeCompany = computed(
  () => companies.find((c) => c.key === activeKey.value) || companies[0]
)
</script>

<style scoped>
.basic-layout {
  display: flex;
  gap: 20px;
}

/* 左侧公司列表 */
.company-panel {
  width: 270px;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
}

.company-panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}

.company-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 520px;
  padding-right: 4px;
}

.company-item {
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 12px;
  border: 1px solid transparent;
  padding: 9px 10px;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
}

.company-item:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.company-item.active {
  background: var(--company-color);
  border-color: var(--company-color);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
}

.company-logo {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #374151;
  margin-right: 12px;
}

.company-item.active .company-logo {
  background: #ffffff;
  color: var(--company-color);
  border-color: #ffffff;
}

.company-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.company-name-zh {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.company-name-en,
.company-extra {
  font-size: 11px;
  color: #e5e7eb;
}

.company-item:not(.active) .company-name-en,
.company-item:not(.active) .company-extra {
  color: #6b7280;
}

.company-list::-webkit-scrollbar {
  width: 6px;
}
.company-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

/* 右侧信息区域 */
.info-panel {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
  padding: 18px 20px 18px;
  box-sizing: border-box;
}

.info-header {
  margin-bottom: 14px;
}

.info-title {
  margin: 0;
  font-size: 22px;         /* 放大标题字体 */
  font-weight: 700;
  color: #111827;
}

.info-tagline {
  margin: 6px 0 0;
  font-size: 14px;
  color: #4b5563;
}

/* 卡片布局 */
.info-grid {
  display: grid;
  grid-template-columns: 2fr 1.6fr;
  grid-auto-rows: minmax(120px, auto);
  gap: 12px;
}

.info-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 12px 14px;
  box-sizing: border-box;
}

.info-card.wide {
  grid-column: 1 / -1;
}

.info-card-title {
  font-size: 15px;         /* 卡片标题放大 */
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
}

.info-card-body {
  font-size: 14px;         /* 正文字体放大 */
  color: #374151;
  line-height: 1.7;
}

/* 行样式 */
.info-text-row {
  margin: 3px 0;
}

.label {
  font-weight: 600;
  color: #4b5563;
}

.value {
  color: #111827;
}

/* 高亮文本、薪资 */
.info-highlight {
  font-weight: 600;
  margin-bottom: 4px;
}

.info-paragraph {
  margin: 4px 0;
}

.info-paragraph.subtle {
  font-size: 12px;
  color: #9ca3af;
}

.salary-main {
  font-size: 20px;          /* 薪资数字更醒目 */
  font-weight: 700;
  color: #16a34a;
  margin: 2px 0 4px;
}

.salary-note {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

@media (max-width: 960px) {
  .basic-layout {
    flex-direction: column;
  }
  .company-panel {
    width: 100%;
    flex-direction: row;
  }
  .company-list {
    max-height: none;
    flex-direction: row;
    overflow-x: auto;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
