<template>
  <div class="header-section">
    <h2 class="title">大厂招聘类型分布与趋势分析</h2>
    <p class="description">
      探索各大厂对学生群体的"友好度"，分析校招、社招和实习岗位的分布比例及时间趋势
    </p>
  </div>
</template>

<script>
export default {
  name: 'HeaderSection'
};
</script>

<style scoped>
.header-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.title {
  color: #2d3748;
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.description {
  color: #718096;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }
}
</style>