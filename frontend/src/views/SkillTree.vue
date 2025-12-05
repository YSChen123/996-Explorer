<template>
  <div class="skill-galaxy-page">
    <div class="header">
      <h2>技能星系 · Tech Galaxy</h2>
      <p class="subtitle">拖拽节点 · 点击查看详情 · 点击热点跳转</p>
    </div>

    <div class="chart-wrapper">
      <div class="chart-container" ref="chartRef">
        <svg ref="svgRef" @click="bgClick"></svg>
      </div>

      <transition name="slide-fade">
        <div v-if="selectedNode" class="info-panel">
          <div class="panel-bg-glow" :style="{ background: getNodeColor(selectedNode) }"></div>
          <div class="panel-content">
            <div class="panel-header">
              <div class="panel-icon-svg" :style="{ borderColor: getNodeColor(selectedNode), color: getNodeColor(selectedNode) }">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path :d="iconPaths[selectedNode.data.iconType] || iconPaths['default']" />
                </svg>
              </div>
              <div class="panel-title-area">
                <div class="panel-title">{{ selectedNode.data.name }}</div>
                <div class="panel-tag" :style="{ borderColor: getNodeColor(selectedNode), color: getNodeColor(selectedNode) }">
                  {{ selectedNode.depth === 0 ? '核心' : (selectedNode.depth === 1 ? '岗位' : '技术栈') }}
                </div>
              </div>
              <button class="close-btn" @click="clearSelection">×</button>
            </div>
            
            <div class="panel-body">
              <div class="section-title">技术描述</div>
              <p class="desc-text">{{ selectedNode.data.desc || '暂无详细描述信息...' }}</p>
              
              <div class="stat-row" v-if="selectedNode.data.value">
                <span class="stat-label">⚡ 掌握程度</span>
                <div class="progress-bar">
                  <div class="progress-fill" 
                       :style="{ 
                         width: Math.min(100, selectedNode.data.value) + '%', 
                         background: `linear-gradient(90deg, ${getNodeColor(selectedNode)}, #fff)` 
                       }">
                  </div>
                </div>
              </div>

              <div class="related-skills" v-if="selectedNode.data.highlights && selectedNode.data.highlights.length">
                <div class="sub-title">📌 核心热点 (点击跳转)</div>
                <div class="tags">
                  <span 
                    v-for="(tag, index) in selectedNode.data.highlights" 
                    :key="index" 
                    class="skill-tag highlight-tag clickable"
                    :style="{ 
                      borderColor: getNodeColor(selectedNode), 
                      color: '#fff', 
                      background: hexToRgba(getNodeColor(selectedNode), 0.15) 
                    }"
                    @click.stop="handleHighlightClick(tag)"
                  >
                    {{ typeof tag === 'object' ? tag.name : tag }} 
                    <span class="link-icon">↗</span>
                  </span>
                </div>
              </div>

              <div class="related-skills" v-if="selectedNode.children || selectedNode._children">
                <div class="sub-title">🌌 包含星系</div>
                <div class="tags">
                  <span 
                    v-for="child in (selectedNode.children || selectedNode._children)" 
                    :key="child.data.name" 
                    class="skill-tag"
                    :style="{ borderColor: getNodeColor(child), color: getNodeColor(child) }"
                    @click.stop="selectNode(child)"
                  >
                    {{ child.data.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as d3 from 'd3';

// --- 图标路径 (基于 24x24 ViewBox) ---
const iconPaths = {
  'user': 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  'code': 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z', 
  'database': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
  'server': 'M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z',
  'cloud': 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z',
  'ai': 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm5.17 11.83c-.85 2.16-3.24 3.17-5.17 3.17-1.93 0-4.32-1-5.17-3.17-.42-1.08.3-2.17 1.47-2.17h7.4c1.17 0 1.89 1.09 1.47 2.17z',
  'tool': 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  'mobile': 'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z',
  'os': 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm-3-7l-3-3 3-3 1.41 1.41L11.83 11l1.59 1.59L12 14z',
  'default': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'
};

// --- 数据结构：支持 highlights 混合类型 ---
const treeData = {
  name: "Tech Stack",
  group: "Root",
  desc: "全栈技术图谱总览，包含后端、AI及工程化能力。",
  children: [
    {
      name: "后端架构",
      group: "Role",
      iconType: "user",
      desc: "负责设计高并发、高可用的分布式系统，处理海量请求与数据一致性。",
      highlights: ["系统设计", "性能优化", "微服务治理"],
      children: [
        {
          name: "底层原理",
          group: "底层原理与架构",
          iconType: "code",
          desc: "深入理解计算机系统运作机制。",
          children: [
            { 
              name: "OS内核", value: 90, group: "底层原理与架构", iconType: "os", 
              desc: "Linux内核机制、进程调度与内存管理。", 
              highlights: ["CFS调度", "PageCache", "VFS", "中断处理"] 
            },
            { 
              name: "网络协议", value: 85, group: "底层原理与架构", iconType: "server", 
              desc: "TCP/IP 协议栈深入理解。", 
              highlights: ["TCP拥塞控制", "HTTP2/3", "QUIC", "BGP"] 
            },
            { 
              name: "分布式", value: 80, group: "底层原理与架构", iconType: "cloud", 
              desc: "解决分布式环境下的共识与一致性问题。", 
              // 示例：混合使用对象（带URL）和字符串（自动搜索）
              highlights: [
                { name: "Paxos算法", url: "https://zh.wikipedia.org/wiki/Paxos算法" }, 
                { name: "Raft协议", url: "https://raft.github.io/" }, 
                "ZAB", 
                "CAP定理"
              ] 
            }
          ]
        },
        {
          name: "Java生态",
          group: "Java生态",
          iconType: "server",
          desc: "企业级应用开发核心技术栈。",
          children: [
            { 
              name: "JVM", value: 100, group: "Java生态", iconType: "code", 
              desc: "Java虚拟机深入调优。", 
              highlights: ["GC算法", "JIT编译", "类加载", "内存模型JMM"] 
            },
            { 
              name: "Spring", value: 95, group: "Java生态", iconType: "server", 
              desc: "Spring 全家桶应用与原理。", 
              highlights: [
                { name: "Spring官网", url: "https://spring.io/" },
                "IOC/AOP", "Spring Boot", "Spring Cloud"
              ] 
            },
            { 
              name: "Netty", value: 80, group: "Java生态", iconType: "network", 
              desc: "高性能异步事件驱动网络框架。", 
              highlights: ["Reactor模型", "零拷贝", "ByteBuf", "ChannelPipeline"] 
            }
          ]
        },
        {
          name: "存储系统",
          group: "数据库与大数据",
          iconType: "database",
          desc: "数据持久化与高速缓存方案。",
          children: [
            { name: "MySQL", value: 95, group: "数据库与大数据", iconType: "database", desc: "关系型数据库核心。", highlights: ["InnoDB引擎", "B+树索引", "MVCC", "事务隔离"] },
            { name: "Redis", value: 90, group: "数据库与大数据", iconType: "database", desc: "内存数据库与缓存。", highlights: ["持久化RDB/AOF", "Redis Cluster", "缓存击穿", "跳表"] }
          ]
        }
      ]
    },
    {
      name: "AI & Data",
      group: "Role",
      iconType: "ai",
      desc: "利用数据挖掘价值，构建智能应用。",
      highlights: ["模型训练", "ETL流程", "数据分析"],
      children: [
        {
          name: "AI Core",
          group: "人工智能与Python",
          iconType: "ai",
          desc: "人工智能核心算法与框架。",
          children: [
            { name: "Python", value: 95, group: "人工智能与Python", iconType: "code", desc: "AI 开发首选语言。", highlights: ["GIL", "Decorator", "NumPy", "Pandas"] },
            { name: "PyTorch", value: 85, group: "人工智能与Python", iconType: "ai", desc: "深度学习动态图框架。", highlights: [{name: "PyTorch官网", url: "https://pytorch.org/"}, "Autograd", "DDP分布式训练"] },
            { name: "LLM", value: 80, group: "人工智能与Python", iconType: "ai", desc: "大语言模型技术。", highlights: ["Transformer", "Attention", "Fine-tuning", "RAG"] }
          ]
        },
        {
          name: "Big Data",
          group: "数据库与大数据",
          iconType: "server",
          desc: "海量数据处理基础设施。",
          children: [
            { name: "Flink", value: 80, group: "数据库与大数据", iconType: "tool", desc: "低延迟流式计算引擎。", highlights: ["Watermark", "StateBackend", "Checkpoint"] },
            { name: "Spark", value: 75, group: "数据库与大数据", iconType: "tool", desc: "大规模数据处理引擎。", highlights: ["RDD", "SparkSQL", "Shuffle机制"] }
          ]
        }
      ]
    },
    {
      name: "工程化",
      group: "Role",
      iconType: "tool",
      desc: "提升研发效率与交付质量。",
      highlights: ["CI/CD", "容器化", "全栈开发"],
      children: [
        {
          name: "DevOps",
          group: "计算机基础与工程",
          iconType: "tool",
          desc: "开发运维一体化。",
          children: [
            { name: "Docker", value: 85, group: "计算机基础与工程", iconType: "cloud", desc: "容器虚拟化技术。", highlights: ["Image Layer", "Namespace", "Cgroup"] },
            { name: "K8s", value: 80, group: "计算机基础与工程", iconType: "cloud", desc: "容器编排事实标准。", highlights: ["Pod", "Service", "Ingress", "Helm"] }
          ]
        },
        {
          name: "Web前端",
          group: "前端与移动端",
          iconType: "mobile",
          desc: "现代前端交互开发。",
          children: [
            { name: "Vue3", value: 75, group: "前端与移动端", iconType: "code", desc: "渐进式 JavaScript 框架。", highlights: [{name: "Vue文档", url: "https://vuejs.org"}, "Composition API", "Proxy响应式", "Vite"] },
            { name: "React", value: 70, group: "前端与移动端", iconType: "code", desc: "构建用户界面的库。", highlights: ["Fiber", "Hooks", "Virtual DOM"] }
          ]
        }
      ]
    }
  ]
};

const chartRef = ref(null);
const svgRef = ref(null);
const selectedNode = ref(null);
let simulation = null;
let resizeObserver = null;

// --- 配色方案 ---
const groupColors = {
  "Root": "#ffffff",
  "Role": "#38bdf8", 
  "底层原理与架构": "#f472b6", 
  "C/C++与系统": "#fb923c", 
  "Java生态": "#818cf8", 
  "数据库与大数据": "#34d399", 
  "人工智能与Python": "#a78bfa", 
  "前端与移动端": "#fb7185", 
  "计算机基础与工程": "#fbbf24"
};

const getNodeColor = (d) => groupColors[d.data?.group] || groupColors[d.group] || "#94a3b8";

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// --- 核心热点跳转逻辑 ---
const handleHighlightClick = (tag) => {
  let url = '';
  if (typeof tag === 'object' && tag.url) {
    url = tag.url;
  } else {
    // 纯字符串则去搜索
    const keyword = typeof tag === 'object' ? tag.name : tag;
    url = `https://www.google.com/search?q=${encodeURIComponent(keyword + ' 技术原理')}`;
  }
  window.open(url, '_blank');
};

onMounted(async () => {
  await nextTick();
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          initChart(entry.contentRect.width, entry.contentRect.height);
        }
      }
    });
    resizeObserver.observe(chartRef.value);
  }
});

onUnmounted(() => {
  if (simulation) simulation.stop();
  if (resizeObserver) resizeObserver.disconnect();
});

const selectNode = (d) => { selectedNode.value = d; };
const clearSelection = () => { selectedNode.value = null; };
const bgClick = (e) => {
  if (e.target.tagName === 'svg' || e.target.tagName === 'rect') clearSelection();
};

const initChart = (width, height) => {
  if (simulation) simulation.stop();
  const svg = d3.select(svgRef.value);
  svg.selectAll('*').remove(); 

  svg.attr('width', width).attr('height', height)
     .attr('viewBox', [-width/2, -height/2, width, height]);

  // 背景
  svg.append("rect")
     .attr("width", width * 4).attr("height", height * 4)
     .attr("x", -width * 2).attr("y", -height * 2)
     .attr("fill", "transparent")
     .on("click", bgClick);

  // 滤镜
  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "glow");
  glow.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
  const feMerge = glow.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  const container = svg.append('g');

  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (e) => container.attr('transform', e.transform));
  svg.call(zoom);

  const root = d3.hierarchy(treeData);
  const nodes = root.descendants();
  const links = root.links();

  nodes.forEach((d, i) => { d.id = "node-" + i; });

  d3.tree().size([height * 0.8, width * 0.6])(root);
  nodes.forEach(d => {
    const temp = d.x; d.x = d.y - width/4; d.y = temp - height/4; 
  });

  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100).strength(1))
    .force("charge", d3.forceManyBody().strength(-600))
    .force("collide", d3.forceCollide().radius(45))
    .force("x", d3.forceX(d => (d.depth - 1) * 250).strength(0.35))
    .force("y", d3.forceY(0).strength(0.08));

  const link = container.append("g")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.6)
    .attr("stroke", "#5f687a")
    .style("pointer-events", "none");

  const node = container.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", "node")
    .style("cursor", "grab")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("click", (e, d) => {
      e.stopPropagation();
      selectNode(d);
    });

  node.each(function(d) {
    const el = d3.select(this);
    const color = getNodeColor(d);
    
    // 呼吸光圈
    el.append("circle")
      .attr("r", d.depth === 0 ? 0 : (38 - d.depth * 5))
      .attr("fill", color).attr("fill-opacity", 0.1)
      .attr("class", "pulse-circle");

    // 实心核心
    el.append("circle")
      .attr("r", d.depth === 0 ? 0 : (16 - d.depth * 2))
      .attr("fill", "#0f172a").attr("stroke", color).attr("stroke-width", 2)
      .attr("filter", "url(#glow)");

    // --- 图标位置修正核心 ---
    if (d.depth > 0 && d.depth < 3) {
      // Scale: Role层 0.7, 技能层 0.5
      const scale = d.depth === 1 ? 0.7 : 0.5;
      
      el.append("path")
        .attr("d", iconPaths[d.data.iconType] || iconPaths['default'])
        .attr("fill", color)
        // 关键修复：居中图标
        .attr("transform", `translate(${-12 * scale}, ${-12 * scale}) scale(${scale})`) 
        .style("pointer-events", "none");
    }

    // 文字位置
    el.append("text")
      .text(d.data.name)
      .attr("dy", d.depth === 1 ? 40 : 32)
      .attr("text-anchor", "middle")
      .attr("fill", "#e2e8f0")
      .style("font-size", d.depth === 1 ? "14px" : "12px")
      .style("font-weight", d.depth === 1 ? "bold" : "normal")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)")
      .style("pointer-events", "none");
  });

  simulation.on("tick", () => {
    link.attr("d", d => {
      const sourceX = d.source.x, sourceY = d.source.y;
      const targetX = d.target.x, targetY = d.target.y;
      return `M${sourceX},${sourceY}C${(sourceX + targetX) / 2},${sourceY} ${(sourceX + targetX) / 2},${targetY} ${targetX},${targetY}`;
    }).attr("stroke", d => getNodeColor(d.target));

    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y; d3.select(this).style("cursor", "grabbing");
  }
  function dragged(event, d) {
    d.fx = event.x; d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null; d.fy = null; d3.select(this).style("cursor", "grab");
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&display=swap');

.skill-galaxy-page {
  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
  width: 100%; height: 100vh; position: relative; overflow: hidden;
  font-family: 'Exo 2', sans-serif; color: #e2e8f0;
}
.skill-galaxy-page::before {
  content: ""; position: absolute; top: 0; left: 0; width: 200%; height: 200%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  transform: perspective(500px) rotateX(60deg); pointer-events: none;
}
.header { position: absolute; top: 30px; left: 40px; pointer-events: none; z-index: 10; }
.header h2 {
  font-size: 2.5rem; margin: 0; letter-spacing: 2px;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(0, 242, 254, 0.3));
}
.subtitle { color: #64748b; font-size: 0.9rem; margin-top: 5px; opacity: 0.8; }
.chart-wrapper { width: 100%; height: 100%; position: relative; }
.chart-container { width: 100%; height: 100%; }

/* 面板样式 */
.info-panel {
  position: absolute; right: 30px; top: 30px; bottom: 30px; width: 380px;
  border-radius: 16px; overflow: hidden; z-index: 50;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.6);
  display: flex; flex-direction: column;
  background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.panel-bg-glow {
  position: absolute; top: -50px; left: -50px; width: 250px; height: 250px;
  border-radius: 50%; filter: blur(90px); opacity: 0.3; pointer-events: none;
}
.panel-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; }
.panel-header { padding: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; }
.panel-icon-svg {
  width: 52px; height: 52px; border-radius: 14px; border: 1px solid;
  background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3); margin-right: 16px; flex-shrink: 0;
}
.panel-title { font-size: 1.4rem; font-weight: bold; color: #fff; line-height: 1.2; }
.panel-tag { font-size: 0.75rem; border: 1px solid; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 6px; opacity: 0.8; }
.close-btn { margin-left: auto; background: none; border: none; color: #94a3b8; font-size: 1.6rem; cursor: pointer; }
.close-btn:hover { color: #fff; }

.panel-body { padding: 24px; flex: 1; overflow-y: auto; }
.section-title { font-size: 0.85rem; color: #94a3b8; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
.desc-text { line-height: 1.6; color: #cbd5e1; font-size: 0.95rem; margin-bottom: 24px; }
.stat-row { margin-bottom: 24px; }
.stat-label { font-size: 0.8rem; color: #94a3b8; margin-bottom: 8px; display: block; }
.progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; box-shadow: 0 0 10px currentColor; }

.sub-title { font-size: 0.85rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 12px; font-weight: bold; margin-top: 10px; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.skill-tag { 
  font-size: 0.85rem; padding: 5px 12px; border-radius: 6px; border: 1px solid; 
  background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center;
}
.skill-tag:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px); }

/* 热点标签样式 */
.highlight-tag { 
  font-weight: 600; border-width: 1px; cursor: pointer !important; padding-right: 8px; 
}
.highlight-tag:hover { background: rgba(255, 255, 255, 0.3) !important; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
.link-icon { font-size: 10px; margin-left: 4px; opacity: 0.7; font-family: sans-serif; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.4); opacity: 0.25; }
  100% { transform: scale(1); opacity: 0.1; }
}
:deep(.pulse-circle) { animation: pulse 3s infinite ease-in-out; transform-origin: center; }

.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateX(30px); opacity: 0; }
</style>