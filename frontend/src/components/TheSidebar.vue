<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-circle">9</div>
      <div class="logo-text">
        <div class="title">996-Explorer</div>
        <div class="subtitle">大厂就业可视化</div>
      </div>
    </div>

    <nav class="nav">
      <button class="nav-item">总体概览</button>
      <button class="nav-item">公司对比</button>
      <button class="nav-item">城市分析</button>
      <button class="nav-item">工作强度分析</button>
    </nav>

    <div class="sidebar-footer">
      <div class="footer-title">关于项目</div>
      <div class="footer-text">
        数据来源：招聘平台小样本采样 / 公开数据集<br />
        仅用于课程可视化作业分析。
      </div>
    </div>
  </aside>
</template>

<script setup>
// 暂时不需要逻辑，先做成静态侧边栏
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #020617;
  border-right: 1px solid rgba(148, 163, 184, 0.35);
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  box-sizing: border-box;
  color: #e5e7eb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 8px 8px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  margin-bottom: 12px;
}

.logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.logo-text {
  margin-left: 10px;
}

.logo-text .title {
  font-size: 15px;
  font-weight: 600;
}

.logo-text .subtitle {
  font-size: 12px;
  opacity: 0.75;
}

.nav {
  padding: 8px 4px;
  flex: 1;
  overflow-y: auto;
}

.nav-item {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 13px;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(148, 163, 184, 0.12);
}

.sidebar-footer {
  padding: 8px 8px 4px;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 11px;
  opacity: 0.8;
}

.footer-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.footer-text {
  line-height: 1.4;
}
</style>
