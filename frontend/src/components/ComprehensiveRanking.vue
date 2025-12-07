<template>
  <section class="ranking-section">
    <!-- 顶部标题说明 -->
    <div class="ranking-header">
      <div>
        <h2 class="ranking-title">综合推荐排名</h2>
        <p class="ranking-subtitle">
        综合薪资水平、成长空间与工作强度，对头部大厂做出的主观综合推荐榜。
        简单权重示意：
        <span class="weight-em">
            50% 薪资待遇 + 30% 成长发展 + 20% 生活质量 / 强度
        </span>
        </p>
      </div>
      <div class="ranking-badge">
        综合视角 · 非官方排名
      </div>
    </div>

    <!-- 排名列表 -->
    <ol class="ranking-list">
      <li
        v-for="item in rankingList"
        :key="item.key"
        class="ranking-item"
        :class="{
          'is-top1': item.rank === 1,
          'is-top2': item.rank === 2,
          'is-top3': item.rank === 3
        }"
      >
        <!-- 左侧：名次 + 公司信息 -->
        <div class="ranking-main">
          <div class="ranking-no">
            <span class="ranking-no-text">NO.{{ item.rank }}</span>
          </div>

          <div class="ranking-company">
            <div class="ranking-name-row">
              <span
                class="ranking-logo"
                :style="{ backgroundColor: item.color }"
              >
                {{ item.badge }}
              </span>
              <div class="ranking-name-text">
                <div class="ranking-name-zh">
                  {{ item.nameZh }}
                  <span class="ranking-tag-level">{{ item.level }} 级推荐</span>
                </div>
                <div class="ranking-name-en">{{ item.nameEn }}</div>
              </div>
            </div>

            <div class="ranking-tags">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="ranking-chip"
              >
                {{ tag }}
              </span>
            </div>

            <p class="ranking-desc">
              {{ item.desc }}
            </p>
          </div>
        </div>

        <!-- 右侧：三维度小条形图 -->
        <div class="ranking-score-panel">
          <div class="score-row">
            <span class="score-label">💰 薪资 / 上限</span>
            <div class="score-bar-wrap">
              <div class="score-bar-bg">
                <div
                  class="score-bar-fill salary"
                  :style="{ width: item.salaryScore * 10 + '%' }"
                />
              </div>
              <span class="score-value">{{ item.salaryScore.toFixed(1) }}/10</span>
            </div>
          </div>

          <div class="score-row">
            <span class="score-label">📈 成长空间</span>
            <div class="score-bar-wrap">
              <div class="score-bar-bg">
                <div
                  class="score-bar-fill growth"
                  :style="{ width: item.growthScore * 10 + '%' }"
                />
              </div>
              <span class="score-value">{{ item.growthScore.toFixed(1) }}/10</span>
            </div>
          </div>

          <div class="score-row">
            <span class="score-label">🌿 工作生活平衡</span>
            <div class="score-bar-wrap">
              <div class="score-bar-bg">
                <div
                  class="score-bar-fill life"
                  :style="{ width: item.lifeScore * 10 + '%' }"
                />
              </div>
              <span class="score-value">{{ item.lifeScore.toFixed(1) }}/10</span>
            </div>
          </div>
        </div>
      </li>
    </ol>

    <p class="ranking-footer-tip">
      注：仅基于本项目的薪资样本、城市生活成本与公开舆论做出的
      <strong>主观综合推荐</strong>，不同人可以根据「钱 / 稳定 / 生活质量」调整自己的权重。
    </p>
  </section>
</template>

<script setup>
// 这里直接写静态的综合评分（0~10），后面想调可以改这块
const rankingList = [
  {
    rank: 1,
    key: 'tencent',
    nameZh: '腾讯',
    nameEn: 'Tencent',
    badge: '腾',
    color: '#0052D9',
    level: 'S',
    salaryScore: 8.8,
    growthScore: 9.2,
    lifeScore: 7.8,
    tags: ['平台稳', '赛道多', '强度相对可控'],
    desc: '社交、游戏、云、广告等业务全面，技术平台成熟，强度相对温和，适合作为长期发展的“第一选择”。'
  },
  {
    rank: 2,
    key: 'bytedance',
    nameZh: '字节跳动',
    nameEn: 'ByteDance',
    badge: '字',
    color: '#325AB4',
    level: 'S',
    salaryScore: 9.6,
    growthScore: 9.0,
    lifeScore: 6.0,
    tags: ['高薪', '增长快', '压力大'],
    desc: '薪资和上限在大厂中非常激进，内容与广告业务高速迭代，适合愿意用 3~5 年高强度换履历与存款的人。'
  },
  {
    rank: 3,
    key: 'pdd',
    nameZh: '拼多多',
    nameEn: 'Pinduoduo',
    badge: '多',
    color: '#E02E24',
    level: 'A+',
    salaryScore: 9.8,
    growthScore: 8.8,
    lifeScore: 4.0,
    tags: ['极高年包', '极高强度', '电商增长'],
    desc: '电商与跨境增长极快，给钱非常凶，但强度与节奏同样极高，是典型的“用时间换钱”的代表。'
  },
  {
    rank: 4,
    key: 'alibaba',
    nameZh: '阿里',
    nameEn: 'Alibaba',
    badge: '阿',
    color: '#FF6A00',
    level: 'A',
    salaryScore: 8.6,
    growthScore: 8.4,
    lifeScore: 6.5,
    tags: ['电商底盘', '业务线多', '节奏中偏上'],
    desc: '电商、云、物流等业务线丰富，组织成熟，有内部流动空间，强度存在但整体更偏“卷中带稳”。'
  },
  {
    rank: 5,
    key: 'netease',
    nameZh: '网易',
    nameEn: 'NetEase',
    badge: '网',
    color: '#C20C0C',
    level: 'A',
    salaryScore: 7.8,
    growthScore: 7.8,
    lifeScore: 8.4,
    tags: ['生活质量相对友好', '游戏内容见长'],
    desc: '游戏和内容业务实力不错，整体节奏在大厂中相对友好，适合更看重生活质量、接受中上薪资的同学。'
  },
  {
    rank: 6,
    key: 'xiaomi',
    nameZh: '小米',
    nameEn: 'Xiaomi',
    badge: '米',
    color: '#FF6700',
    level: 'A-',
    salaryScore: 8.0,
    growthScore: 8.5,
    lifeScore: 6.8,
    tags: ['软硬结合', 'IoT / 汽车', '成长性好'],
    desc: '从手机扩展到 IoT 与汽车，对软硬结合、端侧智能和车有兴趣的人比较适合，强度中等偏上。'
  },
  {
    rank: 7,
    key: 'huawei',
    nameZh: '华为',
    nameEn: 'Huawei',
    badge: '菊',
    color: '#C7000B',
    level: 'A-',
    salaryScore: 9.0,
    growthScore: 8.7,
    lifeScore: 4.8,
    tags: ['高薪', '硬核平台', '强度很高'],
    desc: '通信、云与硬件等方向技术含金量高，样本分布城市广、薪资上限强，但工作强度与压力量也非常高。'
  },
  {
    rank: 8,
    key: 'baidu',
    nameZh: '百度',
    nameEn: 'Baidu',
    badge: '度',
    color: '#2932E1',
    level: 'B+',
    salaryScore: 7.8,
    growthScore: 7.9,
    lifeScore: 6.8,
    tags: ['搜索老牌', '有 AI 牌照'],
    desc: '在搜索、云与自动驾驶上有积累，整体节奏中等，适合想走 AI / 自动驾驶但又不想太卷的同学。'
  },
  {
    rank: 9,
    key: 'jd',
    nameZh: '京东',
    nameEn: 'JD.com',
    badge: '京',
    color: '#E1251B',
    level: 'B',
    salaryScore: 7.6,
    growthScore: 7.4,
    lifeScore: 6.2,
    tags: ['零售 / 物流', '业务贴地'],
    desc: '供应链和物流优势明显，技术岗位很多与零售业务深度绑定，适合希望更贴近实际商业场景的人。'
  },
  {
    rank: 10,
    key: 'meituan',
    nameZh: '美团',
    nameEn: 'Meituan',
    badge: '团',
    color: '#FFC300',
    level: 'B',
    salaryScore: 7.8,
    growthScore: 8.0,
    lifeScore: 5.8,
    tags: ['本地生活', '业务节奏快'],
    desc: '本地生活与到店到家龙头，业务线多、节奏快，对业务理解和执行力要求高，适合能接受较高业务压力的人。'
  }
]
</script>

<style scoped>
.ranking-section {
  background: #f3f4f6;
  border-radius: 18px;
  padding: 22px 22px 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 顶部区域 */
.ranking-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.ranking-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  letter-spacing: 0.02em;
}

.ranking-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: #4b5563;
  max-width: 720px;
}

.ranking-subtitle strong {
  font-weight: 700;
  color: #111827;
}

.ranking-badge {
  font-size: 12px;
  color: #92400e;
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  border: 1px solid #facc15;
  border-radius: 999px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

/* 排名列表 */
.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 单条卡片 */
.ranking-item {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease,
    background 0.15s ease;
  overflow: hidden;
}

/* 左侧彩色条，增强“卡片感” */
.ranking-item::before {
  content: '';
  position: absolute;
  inset: 0;
  width: 5px;
  background: linear-gradient(180deg, #e5e7eb, #e5e7eb);
}

/* Top 1/2/3 变成奖牌色 */
.ranking-item.is-top1::before {
  background: linear-gradient(180deg, #f97316, #f59e0b);
}
.ranking-item.is-top2::before {
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
}
.ranking-item.is-top3::before {
  background: linear-gradient(180deg, #a855f7, #6366f1);
}

.ranking-item.is-top1 {
  border-color: #fed7aa;
  background: radial-gradient(circle at top left, #fff7ed, #ffffff);
}
.ranking-item.is-top2 {
  border-color: #bfdbfe;
  background: radial-gradient(circle at top left, #eff6ff, #ffffff);
}
.ranking-item.is-top3 {
  border-color: #e9d5ff;
  background: radial-gradient(circle at top left, #f5f3ff, #ffffff);
}

.ranking-item:hover {
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.14);
  transform: translateY(-3px);
  border-color: #cbd5f5;
}

/* 左半部分：名次 + 公司信息 */
.ranking-main {
  flex: 1;
  display: flex;
  gap: 14px;
  min-width: 0;
}

/* 名次圆角牌 */
.ranking-no {
  width: 70px;
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking-no-text {
  font-size: 14px;
  font-weight: 800;
  color: #374151;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f3f4f6;
  letter-spacing: 0.03em;
}

/* 公司信息主体 */
.ranking-company {
  flex: 1;
  min-width: 0;
}

.ranking-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

/* Logo 方块 */
.ranking-logo {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 20px;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.25);
}

.ranking-name-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.weight-em {
  font-weight: 700;
  color: #111827;
  white-space: nowrap;   /* 整段不拆开换行 */
}

.ranking-name-zh {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  display: flex;
  gap: 8px;
  align-items: center;
}

.ranking-tag-level {
  font-size: 12px;
  color: #1f2937;
  background: #e5e7eb;
  border-radius: 999px;
  padding: 2px 8px;
}

.ranking-name-en {
  font-size: 12px;
  color: #9ca3af;
}

/* 标签行 */
.ranking-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0 6px;
}

.ranking-chip {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
}

/* 描述文案 */
.ranking-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: #4b5563;
}

/* 右侧评分条区域 */
.ranking-score-panel {
  width: 280px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-left: 1px dashed #e5e7eb;
  padding-left: 14px;
}

/* 单行评分 */
.score-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.score-label {
  font-size: 12px;
  color: #6b7280;
}

.score-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-bar-bg {
  flex: 1;
  height: 7px;
  border-radius: 999px;
  background: #f3f4f6;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 999px;
  transform-origin: left center;
}
.score-bar-fill.salary {
  background: linear-gradient(90deg, #f97316, #ec4899);
}
.score-bar-fill.growth {
  background: linear-gradient(90deg, #22c55e, #14b8a6);
}
.score-bar-fill.life {
  background: linear-gradient(90deg, #38bdf8, #6366f1);
}

.score-value {
  font-size: 12px;
  color: #374151;
  min-width: 58px;
  text-align: right;
  font-weight: 600;
}

/* 底部说明 */
.ranking-footer-tip {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.ranking-footer-tip strong {
  font-weight: 600;
}

/* 响应式：窄屏改为上下排 */
@media (max-width: 900px) {
  .ranking-item {
    flex-direction: column;
  }

  .ranking-score-panel {
    width: 100%;
    min-width: 0;
    border-left: none;
    border-top: 1px dashed #e5e7eb;
    padding-left: 0;
    padding-top: 10px;
    margin-top: 6px;
  }
}
</style>

