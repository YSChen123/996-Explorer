export const overtimeDetailData = [
  {
    company: '拼多多',
    avgLeaveTime: 22.8,      // 平均下班时间（24小时制，22.8表示22:48）
    weekendDays: 8,          // 月均周末加班天数
    annualLeaveUsage: 0.3,   // 年假使用率（0-1，越低说明越忙）
    satisfaction: 3.2,       // 员工满意度（1-10分）
    overtimeScore: 4.8,      // 加班强度分数（1-5分）
    description: '11116工作制常态，节假日经常加班，年假难休'
  },
  {
    company: '字节跳动',
    avgLeaveTime: 21.5,
    weekendDays: 4,
    annualLeaveUsage: 0.4,
    satisfaction: 6.1,
    overtimeScore: 4.2,
    description: '大小周已取消，但工作日加班仍普遍，项目节奏快'
  },
  {
    company: '京东',
    avgLeaveTime: 21.3,
    weekendDays: 3,
    annualLeaveUsage: 0.5,
    satisfaction: 6.5,
    overtimeScore: 4.0,
    description: '强东倡导拼搏文化，618/双11期间加班严重'
  },
  {
    company: '快手',
    avgLeaveTime: 21.2,
    weekendDays: 3,
    annualLeaveUsage: 0.6,
    satisfaction: 6.8,
    overtimeScore: 3.8,
    description: '主站和商业化部门加班多，其他部门相对平衡'
  },
  {
    company: '小米',
    avgLeaveTime: 20.8,
    weekendDays: 2,
    annualLeaveUsage: 0.7,
    satisfaction: 7.2,
    overtimeScore: 3.5,
    description: '硬件部门节奏稳定，互联网部门项目制加班'
  },
  {
    company: '阿里巴巴',
    avgLeaveTime: 20.7,
    weekendDays: 2,
    annualLeaveUsage: 0.65,
    satisfaction: 7.0,
    overtimeScore: 3.6,
    description: '不同事业部差异大，淘天、钉钉加班多，其他相对稳定'
  },
  {
    company: '腾讯',
    avgLeaveTime: 20.5,
    weekendDays: 1,
    annualLeaveUsage: 0.75,
    satisfaction: 7.8,
    overtimeScore: 3.0,
    description: '整体较为平衡，游戏部门（天美、光子）加班较多'
  },
  {
    company: '美团',
    avgLeaveTime: 20.6,
    weekendDays: 2,
    annualLeaveUsage: 0.7,
    satisfaction: 7.1,
    overtimeScore: 3.3,
    description: '外卖、到店等核心业务加班多，其他部门相对稳定'
  },
  {
    company: '百度',
    avgLeaveTime: 20.4,
    weekendDays: 1,
    annualLeaveUsage: 0.8,
    satisfaction: 7.5,
    overtimeScore: 2.9,
    description: '传统部门较为养老，AI、自动驾驶等新业务加班多'
  },
  {
    company: '网易',
    avgLeaveTime: 20.2,
    weekendDays: 1,
    annualLeaveUsage: 0.85,
    satisfaction: 8.1,
    overtimeScore: 2.5,
    description: '游戏部门项目期加班，其他部门较为平衡，食堂出名'
  }
];

// 辅助函数：将小数时间转换为时间字符串
export function formatTime(decimalTime) {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

// 辅助函数：根据满意度获取颜色
export function getScoreColor(score) {
  if (score >= 8) return '#1dd1a1';  // 优秀
  if (score >= 6) return '#48dbfb';  // 良好
  if (score >= 4) return '#feca57';  // 中等
  if (score >= 2) return '#ff9f43';  // 较差
  return '#ff6b81';  // 差
}