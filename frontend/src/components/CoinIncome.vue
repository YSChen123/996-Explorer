<template>
  <div class="coin-income-wrapper">
    <div class="instruction">
      各公司年度收入堆积图 (1金币 ≈ 10亿美元)
    </div>

    <!-- 底部公司标签（用 Vue 渲染，不再用 JS 动态插入） -->
    <div class="labels">
      <div
        v-for="c in companies"
        :key="c.name"
        class="company-label"
      >
        {{ c.name }}
        <span>${{ c.revenue }} B</span>
      </div>
    </div>

    <!-- Matter.js 渲染容器 -->
    <div class="canvas-container" ref="canvasContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite
} from 'matter-js';

// ====== 1. 配置公司收入（你可以改成从接口拿，再用 props 传进来） ======
const companies = [
  { name: '初创公司', revenue: 50 },
  { name: '成长型',   revenue: 220 },
  { name: '行业巨头', revenue: 800 },
  { name: '超级垄断', revenue: 2500 }
];

const REVENUE_PER_COIN = 10;
const COIN_RADIUS = 12;

// ====== 2. DOM 引用 & Matter 对象句柄 ======
const canvasContainer = ref(null);

let engine = null;
let render = null;
let runner = null;
let resizeHandler = null;

// ====== 3. 生成金币 SVG -> Base64 ======
const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
  <circle cx="30" cy="30" r="28" fill="#FFD700" stroke="#DAA520" stroke-width="3"/>
  <circle cx="30" cy="30" r="22" fill="none" stroke="#F0E68C" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="30" y="40" font-family="Arial, sans-serif" font-size="30" text-anchor="middle" fill="#B8860B" font-weight="bold">$</text>
</svg>`;
const coinImgSrc = 'data:image/svg+xml;base64,' + btoa(svgString);

// ====== 4. 初始化场景 ======
function initScene() {
  const container = canvasContainer.value;
  if (!container) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // 1) 创建引擎
  engine = Engine.create();
  engine.world.gravity.y = 1.1; // 稍微大一点，掉得快些

  // 2) 创建渲染器（canvas 会自动塞到 container 里）
  render = Render.create({
    element: container,
    engine,
    options: {
      width,
      height,
      wireframes: false,
      background: '#ffffff'
    }
  });

  const floorY = height - 20;

  // 3) 地板 + 左右墙 + 列之间的“分区墙”
  const floor = Bodies.rectangle(width / 2, floorY + 30, width, 60, {
    isStatic: true,
    friction: 1.0,
    render: { fillStyle: '#f8f8f8' }
  });

  const globalWallOpts = { isStatic: true, render: { visible: false } };
  const leftWall = Bodies.rectangle(-30, height / 2, 60, height * 2, globalWallOpts);
  const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height * 2, globalWallOpts);

  Composite.add(engine.world, [floor, leftWall, rightWall]);

  const colWidth = width / companies.length;

  const columnWallOpts = {
    isStatic: true,
    friction: 1.0,
    render: {
      fillStyle: '#f5f5f5',
      opacity: 0.8
    }
  };

  const columnWalls = [];
  for (let i = 1; i < companies.length; i++) {
    const x = i * colWidth;
    const wall = Bodies.rectangle(x, height / 2, 4, height + 100, columnWallOpts);
    columnWalls.push(wall);
  }
  Composite.add(engine.world, columnWalls);

  // 4) 金币工厂
  function createCoin(x, y) {
    return Bodies.circle(x, y, COIN_RADIUS, {
      restitution: 0.08,
      friction: 0.9,
      frictionStatic: 5,
      frictionAir: 0.02,
      density: 0.0015,
      render: {
        sprite: {
          texture: coinImgSrc,
          xScale: (COIN_RADIUS * 2) / 60,
          yScale: (COIN_RADIUS * 2) / 60
        }
      }
    });
  }

  // 5) 为每个公司发金币
  companies.forEach((company, index) => {
    const coinCount = Math.floor(company.revenue / REVENUE_PER_COIN);
    const centerX = index * colWidth + colWidth / 2;

    let count = 0;
    const dropInterval = setInterval(() => {
      if (count >= coinCount) {
        clearInterval(dropInterval);
        return;
      }

      const randomOffset = (Math.random() - 0.5) * (colWidth * 0.18);
      const coin = createCoin(
        centerX + randomOffset,
        -120 - Math.random() * 60
      );

      Composite.add(engine.world, coin);
      count++;
    }, 15);
  });

  // 6) 启动引擎
  engine.positionIterations = 8;
  engine.velocityIterations = 8;

  Render.run(render);
  runner = Runner.create();
  Runner.run(runner, engine);
}

onMounted(() => {
  initScene();

  // 简单处理一下 resize：直接刷新整个页面（偷个懒）
  resizeHandler = () => {
    // 这里如果不想整站刷新，可以自己写一套销毁+重建逻辑
    location.reload();
  };
  window.addEventListener('resize', resizeHandler);
});

onBeforeUnmount(() => {
  // 清理监听
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
  }

  // 关闭 Matter.js
  if (render) {
    Render.stop(render);
    if (render.canvas && render.canvas.parentNode) {
      render.canvas.parentNode.removeChild(render.canvas);
    }
  }
  if (runner) {
    Runner.stop(runner);
  }
  if (engine) {
    Engine.clear(engine);
  }
});
</script>

<style scoped>
.coin-income-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background-color: #ffffff;
  overflow: hidden;
}

/* Matter.js canvas 容器 */
.canvas-container {
  position: absolute;
  inset: 0;
}

/* 顶部标题 */
.instruction {
  position: absolute;
  top: 20px;
  width: 100%;
  text-align: center;
  color: #DAA520;
  font-size: 24px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  pointer-events: none;
}

/* 底部公司标签区域 */
.labels {
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  pointer-events: none;
  z-index: 10;
  border-top: 1px solid #eee;
}

.company-label {
  color: #333;
  text-align: center;
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  border-right: 1px dashed #eee;
}

.company-label:last-child {
  border-right: none;
}

.company-label span {
  display: block;
  font-size: 14px;
  color: #888;
  margin-top: 5px;
  font-weight: normal;
}
</style>
