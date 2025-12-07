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
          <div class="info-card-title">应届技术岗年包</div>
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
              说明：仅综合「大厂薪资地图 – 应届毕业生」以及公开评价、网络帖子等信息，用于课堂讨论，不代表官方立场或真实 offer。
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

/**
 * 薪资 / 岗位等信息：
 * 薪资部分是参考你给的「大厂薪资地图 – 应届毕业生」里的月薪区间 × 月数，
 * 做了一个大致的区间折算，方便写成自然语言。
 * 不是精准计算，更适合作为可视化说明文字。
 */
const companies = [
  {
    key: 'tencent',
    badge: '腾',
    color: '#2563eb',
    nameZh: '腾讯',
    nameEn: 'Tencent',
    tagline: '社交 + 游戏 + 云的综合型平台公司，适合想做大规模工程和基础设施的同学。',
    hqCity: '深圳',
    hqDetail: '深圳·后海 / 深圳湾科技生态园一带',
    mainRoles:
      '后端 / C++ / Go、IM 与多媒体、云原生平台、音视频、Android / iOS 等典型研发岗位',
    coreBizShort: '社交、游戏、云、广告',
    coreBizDesc:
      '以微信 / QQ 等社交产品为底盘，叠加游戏发行与自研、广告、电商与腾讯云，现金流稳定、业务线丰富，是综合型“超级平台公司”。',
    // 对应薪资地图里「鹅厂 技术岗 24–28K · 15 薪」，折算约 36–42W，这里稍微留一点宽裕。
    salaryRange: '≈ 36 ~ 45 万 / 年',
    salaryNote:
      '参考薪资地图中“鹅厂技术岗 24–28K · 15 薪”的区间折算（约 36–42W），这里向上留了一点空间，只做课堂用的粗略估算。',
    salaryExtra:
      '主干业务（微信、PCG、TEG 等）通常待遇略高，绩效和股票会拉开差距；不同城市 / 团队在加班和福利上差异也比较大。',
    officeCities: ['深圳', '北京', '上海', '成都', '广州', '西安'],
    officeDesc:
      '深 / 北 / 上是业务最集中的三地，成都 / 广州 / 西安聚集了不少中后台与工具团队，适合希望在新一线长期发展又想保留大厂平台的同学。',
    cultureDesc:
      '工程体系较成熟，重视稳定性与代码质量。整体不算最极端的 996，但核心业务节奏仍较快，临近大版本上线时会有明显的“冲刺期”。'
  },
  {
    key: 'bytedance',
    badge: '字',
    color: '#06b6d4',
    nameZh: '字节跳动',
    nameEn: 'ByteDance',
    tagline: '数据和算法驱动的内容巨头，“高压高回报”的代表之一。',
    hqCity: '北京',
    hqDetail: '北京·望京 / 未来科学城区域',
    mainRoles:
      '推荐算法、数据平台、后端 / 服务端、AIGC 相关工程、前端 / 客户端等',
    coreBizShort: '内容分发、短视频、电商、AIGC',
    coreBizDesc:
      '以抖音 / 今日头条为核心流量入口，围绕内容分发、电商闭环、企业服务和 AIGC 产品展开，技术氛围浓、算法基建完备，是推荐与大数据方向的热门选择。',
    // 对应“福报厂 / 宇宙厂”这一档，应届技术岗普遍在 40W+ 区间，这里给出略宽的范围。
    salaryRange: '≈ 40 ~ 50 万 / 年',
    salaryNote:
      '参考薪资地图中“福报厂 / 宇宙厂”技术岗 24–30K、16 薪及以上的档位，折算到 40W+，实际会随着业务线和绩效波动。',
    salaryExtra:
      '整体给薪相对激进，但绩效与业务增长强绑定。新人在算法 / 大数据 / AIGC 方向，如果能跟上节奏，成长和现金回报都比较可观。',
    officeCities: ['北京', '上海', '深圳', '杭州', '广州', '成都'],
    officeDesc:
      '北京仍是最大的研发中心；上海 / 杭州在电商与本地生活方向比重较高，深圳更多偏商业化与综合业务线。',
    cultureDesc:
      '节奏普遍偏快，强调数据驱动和 owner 意识，对个人执行力与自驱力要求高；适合愿意在高挑战环境下冲刺职业前几年的人。'
  },
  {
    key: 'alibaba',
    badge: '阿',
    color: '#f97316',
    nameZh: '阿里巴巴',
    nameEn: 'Alibaba',
    tagline: '电商 + 支付 + 云计算老牌大厂，工程基础扎实、业务线复杂。',
    hqCity: '杭州',
    hqDetail: '杭州·西溪园区 / 滨江园区一带',
    mainRoles:
      '电商平台研发、搜索与推荐、支付安全、云计算、数据库与分布式系统等',
    coreBizShort: '电商、支付、云计算',
    coreBizDesc:
      '以淘系电商和支付宝生态为核心，叠加阿里云、菜鸟物流等业务板块，是电商与云计算方向的重要阵地，内部在分布式系统和中间件方面积累深厚。',
    salaryRange: '≈ 38 ~ 45 万 / 年',
    salaryNote:
      '薪资地图中电商头部厂应届技术岗多在 24–28K、16 薪附近，折算约 38–45W；不同 BU（电商 / 云 / 本地生活）之间会有明显差异。',
    salaryExtra:
      '云计算与基础设施方向的长期成长机会仍然不错；校招生如果想做底层工程、分布式系统或电商场景，是一个比较经典的选择。',
    officeCities: ['杭州', '上海', '北京', '深圳', '成都', '广州'],
    officeDesc:
      '杭州是绝对大本营；上海在云与国际化业务中比重较高，北京则偏基础设施和创新业务，其他城市更多承载本地业务与技术中台。',
    cultureDesc:
      '组织和业务调整相对频繁，需要适应变化；工程规范成熟，但历史系统和技术债也比较多，上手初期需要花时间熟悉体系。'
  },
  {
    key: 'pdd',
    badge: '多',
    color: '#ef4444',
    nameZh: '拼多多',
    nameEn: 'PDD',
    tagline: '电商增速最快、强结果导向的大厂之一，薪资高、节奏也高。',
    hqCity: '上海',
    hqDetail: '上海·张江 / 陆家嘴一带',
    mainRoles:
      '电商交易系统、推荐搜索、供应链技术、风控、跨境 Temu 等',
    coreBizShort: '高性价比电商、跨境电商',
    coreBizDesc:
      '通过“多实惠、多乐趣”的电商模式快速崛起，近年来在 Temu 跨境业务上投入巨大，是增速非常快、业务变化也非常多的公司。',
    // 对应薪资图中“某厂 技术岗 32–40K · 18 薪”一档，折算 57–72W 左右。
    salaryRange: '≈ 57 ~ 72 万 / 年',
    salaryNote:
      '根据薪资地图中高档位技术岗 32–40K · 18 薪估算，总包大致在 57–72W；属于图里应届技术岗偏高的一档。',
    salaryExtra:
      '绩效拉开差距非常明显，业务成长期机会多；适合愿意在高压环境下冲刺，目标感比较强、希望快速积累存款和项目经验的同学。',
    officeCities: ['上海'],
    officeDesc:
      '目前研发岗位基本集中在上海，办公地点集中有利于内部沟通，但也意味着多数岗位都需要在上海长期生活和发展。',
    cultureDesc:
      '业内公认节奏极快、目标导向极强的公司，强调结果与业务价值；需要非常好的抗压能力和自我调节能力。'
  },
  {
    key: 'xiaomi',
    badge: '米',
    color: '#fb923c',
    nameZh: '小米',
    nameEn: 'Xiaomi',
    tagline: '软硬件一体的工程师文化，适合对系统、终端和车机感兴趣的人。',
    hqCity: '北京',
    hqDetail: '北京·亦庄 / 海淀区域',
    mainRoles: '手机与 IoT 系统、操作系统、车机 / 汽车、互联网服务等',
    coreBizShort: '智能手机、IoT、智能汽车',
    coreBizDesc:
      '从手机与 MIUI 起家，延展到 IoT 生态和智能汽车，软硬一体、产品线丰富，是偏“工程 + 产品 + 硬件融合”的代表企业。',
    salaryRange: '≈ 32 ~ 40 万 / 年',
    salaryNote:
      '薪资地图中中上档技术岗多在 20–26K、15–16 薪区间，折算约 32–40W；智能汽车与核心系统团队会略高一些。',
    salaryExtra:
      '如果对嵌入式系统、操作系统内核、车机 / 汽车软件等方向感兴趣，小米会有较完整的技术栈和真实场景可用来练级。',
    officeCities: ['北京', '上海', '武汉'],
    officeDesc:
      '北京是核心研发中心；上海承担部分互联网与汽车相关业务，武汉有若干研发中心布局，整体更适合愿意在北方 or 华东扎根的人。',
    cultureDesc:
      '整体氛围工程师友好，强调“做感动人心、价格厚道的好产品”，在产品体验和工程质量上要求都不低；加班强度随项目和产品节奏波动较大。'
  },
  {
    key: 'netease',
    badge: '网',
    color: '#dc2626',
    nameZh: '网易',
    nameEn: 'NetEase',
    tagline: '游戏和内容见长的老牌互联网公司，审美和产品品味要求高。',
    hqCity: '杭州',
    hqDetail: '杭州·滨江园区',
    mainRoles: '游戏研发、音乐与内容社区、教育与云音乐生态等',
    coreBizShort: '游戏、内容社区、音乐',
    coreBizDesc:
      '在端游 / 手游领域积累深厚，云音乐、LOFTER 等产品有较强社区氛围，总体更偏内容与游戏方向，对美术、产品体验与用户社区运营要求都比较高。',
    salaryRange: '≈ 30 ~ 38 万 / 年',
    salaryNote:
      '参考薪资地图中中等档技术岗 18–22K、16 薪区间，折算到 30–38W，具体会随游戏项目和业务线变化。',
    salaryExtra:
      '项目生命周期对个人体验影响很大，新品上线阶段会非常忙；对游戏和内容产品有热情的同学，往往能在这里找到归属感。',
    officeCities: ['杭州', '广州', '上海', '北京'],
    officeDesc:
      '杭州是大本营，广州在游戏方面力量也很强；上海和北京则有部分创新业务与平台团队，整体更偏“游戏 + 内容”。',
    cultureDesc:
      '看重审美与产品品味，不同项目组节奏差异很大；有的团队比较佛系，有的则在上线阶段压力拉满，需要结合具体项目了解。'
  },
  {
    key: 'meituan',
    badge: '团',
    color: '#22c55e',
    nameZh: '美团',
    nameEn: 'Meituan',
    tagline: '本地生活和到家服务的基础设施，算法 + 工程双高要求。',
    hqCity: '北京',
    hqDetail: '北京·望京 / 朝阳区域',
    mainRoles:
      '本地生活平台、外卖配送、地图与调度算法、供应链与餐饮系统等',
    coreBizShort: '本地生活服务平台',
    coreBizDesc:
      '围绕“吃喝玩乐行”的本地生活场景构建综合平台，对算法和工程架构要求都比较高，是实际工程复杂度很高的一家公司。',
    salaryRange: '≈ 35 ~ 45 万 / 年',
    salaryNote:
      '参考薪资地图中偏中上档的技术岗 22–26K、16 薪区间，折算约 35–45W，不同事业群和城市之间会有差异。',
    salaryExtra:
      '外卖 / 到店等核心 BU 算法和工程挑战都比较硬核；适合希望在“复杂业务 + 算法落地”中成长、并能接受一定业务压力的同学。',
    officeCities: ['北京', '上海', '成都', '深圳'],
    officeDesc:
      '北京为核心，上海和成都在本地生活与创新业务上的比重持续提升；深圳有部分支付与金融相关团队。',
    cultureDesc:
      '整体节奏偏快，但比极端 996 略温和；非常强调业务 sense 和对用户需求的理解，业务同学与技术同学之间协作紧密。'
  },
  {
    key: 'jd',
    badge: '京',
    color: '#f97373',
    nameZh: '京东',
    nameEn: 'JD.com',
    tagline: '自营电商 + 仓配网络，对分布式系统和物流调度感兴趣可重点关注。',
    hqCity: '北京',
    hqDetail: '北京·亦庄园区',
    mainRoles:
      '零售电商平台、物流与仓储系统、供应链优化、金融科技等',
    coreBizShort: '零售电商、物流基础设施',
    coreBizDesc:
      '以自营电商和强大的物流网络著称，仓储、配送和供应链系统工程复杂度高，是做“大型分布式系统 + 物流场景”的好去处。',
    salaryRange: '≈ 32 ~ 40 万 / 年',
    salaryNote:
      '对应薪资地图中技术岗 18–22K、15–16 薪一档，折算约 32–40W；物流与仓储相关岗位在大促等节点会有额外激励。',
    salaryExtra:
      '如果希望深入理解从下单到收货的全链路系统设计，京东能提供非常完整的实战场景；但也要接受大促节点“全天候待命”的现实。',
    officeCities: ['北京', '上海', '广州', '深圳', '成都', '西安'],
    officeDesc:
      '北京为主，上海 / 广州 / 深圳在零售与金融业务比重较高，新一线城市更多承担技术中心和运营中心职责。',
    cultureDesc:
      '目标导向明显，强调执行和落地；物流相关团队在大促期间会进入明显的“战役模式”，平时强度中等偏上。'
  },
  {
    key: 'baidu',
    badge: '度',
    color: '#3b82f6',
    nameZh: '百度',
    nameEn: 'Baidu',
    tagline: '搜索起家，重点押注自动驾驶、云计算和大模型的老牌 AI 公司。',
    hqCity: '北京',
    hqDetail: '北京·上地 / 西二旗区域',
    mainRoles:
      '搜索与广告、地图、自动驾驶、云与大模型平台、NLP / CV 等 AI 相关方向',
    coreBizShort: '搜索、广告、自动驾驶、大模型',
    coreBizDesc:
      '在搜索与广告业务基础上，布局自动驾驶、智能云与大模型等方向，是国内较早大规模投入自动驾驶和 AI 平台化的公司之一。',
    salaryRange: '≈ 36 ~ 43 万 / 年',
    salaryNote:
      '薪资地图中上游档位的技术岗多在 22–26K、16 薪附近，折算约 36–43W；AI 平台和自动驾驶方向会略高一些。',
    salaryExtra:
      '对算法与平台工程同学比较友好，可以接触到搜索、NLP、CV 等多个 AI 相关场景；适合想在“平台 + 算法 + 工程”交叉地带发展的同学。',
    officeCities: ['北京', '上海', '深圳', '广州'],
    officeDesc:
      '北京是核心研发基地；上海 / 深圳在云和大模型生态的布局较多，自动驾驶团队主要集中在北京等少数城市。',
    cultureDesc:
      '技术氛围较浓，AI 相关团队科研味道比较重；组织结构相对复杂，需要适应大公司节奏和横向沟通成本。'
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
  font-size: 22px;         /* 标题字体放大 */
  font-weight: 700;
  color: #111827;
}

.info-tagline {
  margin: 6px 0 0;
  font-size: 15px;         /* 副标题也稍微放大一点 */
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
  line-height: 1.8;
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
