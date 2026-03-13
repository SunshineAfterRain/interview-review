import { Question } from '../../types/question';

export const cssQuestions: Question[] = [
  {
    id: 'css-001',
    category: 'css',
    questionType: 'theory',
    title: 'BFC（块级格式化上下文）原理和应用',
    difficulty: 'medium',
    tags: ['BFC', '布局', '清除浮动', '外边距合并'],
    question: '请解释什么是BFC？BFC的触发条件有哪些？BFC有哪些应用场景？',
    answer: `**BFC（Block Formatting Context）概念：**

BFC是一个独立的渲染区域，只有Block-level box参与，它规定了内部的Block-level Box如何布局，并且与外部区域毫不相关。

**BFC的触发条件：**
1. html 根元素
2. float 的值不为 none
3. position 的值为 absolute 或 fixed
4. overflow 的值不为 visible
5. display 的值为 inline-block、table-cell、table-caption
6. display 的值为 flow-root（专门用于创建BFC）

**BFC的布局规则：**
1. 内部的Box会垂直方向，一个接一个地放置
2. Box垂直方向的距离由margin决定，属于同一个BFC的两个相邻Box的margin会发生重叠
3. 每个元素的margin box的左边，与包含块border box的左边相接触
4. BFC的区域不会与float box重叠
5. BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素
6. 计算BFC的高度时，浮动元素也参与计算

**应用场景：**
1. 清除浮动
2. 防止外边距合并
3. 实现自适应两栏布局`,
    codeExamples: [
      {
        language: 'html',
        description: 'BFC清除浮动',
        code: `<!-- 问题：父元素高度塌陷 -->
<style>
  .parent {
    border: 1px solid #000;
    /* 方式1：创建BFC */
    overflow: hidden;
    /* 或 display: flow-root; */
  }
  
  .child {
    float: left;
    width: 100px;
    height: 100px;
    background: red;
  }
</style>

<div class="parent">
  <div class="child"></div>
</div>

<!-- BFC计算高度时会包含浮动元素，解决高度塌陷问题 -->`,
      },
      {
        language: 'html',
        description: 'BFC防止外边距合并',
        code: `<style>
  /* 问题：相邻元素外边距合并 */
  .box1, .box2 {
    width: 100px;
    height: 100px;
    background: lightblue;
    margin: 20px;
  }
  
  /* 解决方案：将其中一个元素放入BFC容器 */
  .bfc-container {
    overflow: hidden; /* 创建BFC */
  }
</style>

<!-- 外边距会合并 -->
<div class="box1"></div>
<div class="box2"></div>

<!-- 外边距不会合并 -->
<div class="box1"></div>
<div class="bfc-container">
  <div class="box2"></div>
</div>`,
      },
      {
        language: 'html',
        description: 'BFC实现自适应两栏布局',
        code: `<style>
  .container {
    width: 100%;
  }
  
  .left {
    float: left;
    width: 200px;
    height: 300px;
    background: lightblue;
  }
  
  .right {
    /* 创建BFC，不会与浮动元素重叠 */
    overflow: hidden;
    /* 或 display: flow-root; */
    height: 300px;
    background: lightcoral;
  }
</style>

<div class="container">
  <div class="left">左侧固定宽度</div>
  <div class="right">右侧自适应宽度</div>
</div>

<!-- 原理：BFC区域不会与float box重叠，右侧会自动适应剩余宽度 -->`,
      },
    ],
    references: [
      'MDN - 块格式化上下文',
      'CSS世界 - 张鑫旭',
    ],
    createdAt: '2024-01-26',
  },
  {
    id: 'css-002',
    category: 'css',
    questionType: 'theory',
    title: 'Flex布局详解',
    difficulty: 'medium',
    tags: ['Flex', '弹性布局', '容器', '项目'],
    question: '请详细解释Flex布局的各个属性，以及如何使用Flex实现常见的布局需求？',
    answer: `**Flex布局概念：**

Flex是Flexible Box的缩写，意为"弹性布局"，用来为盒状模型提供最大的灵活性。

**容器属性：**

1. **flex-direction** - 主轴方向
   - row（默认）：水平方向，起点在左端
   - row-reverse：水平方向，起点在右端
   - column：垂直方向，起点在上沿
   - column-reverse：垂直方向，起点在下沿

2. **flex-wrap** - 换行方式
   - nowrap（默认）：不换行
   - wrap：换行，第一行在上方
   - wrap-reverse：换行，第一行在下方

3. **flex-flow** - direction + wrap 的简写

4. **justify-content** - 主轴对齐
   - flex-start、flex-end、center
   - space-between、space-around、space-evenly

5. **align-items** - 交叉轴对齐
   - flex-start、flex-end、center
   - baseline、stretch（默认）

6. **align-content** - 多根轴线对齐

**项目属性：**

1. **order** - 排列顺序
2. **flex-grow** - 放大比例
3. **flex-shrink** - 缩小比例
4. **flex-basis** - 初始大小
5. **flex** - grow + shrink + basis 的简写
6. **align-self** - 单个项目对齐方式`,
    codeExamples: [
      {
        language: 'css',
        description: 'Flexbox 布局示例',
        code: `/**\n * Flexbox 弹性盒子布局\n * \n * 核心概念：\n * - 主轴（main axis）：默认水平方向\n * - 交叉轴（cross axis）：默认垂直方向\n * - flex container：设置 display: flex 的容器\n * - flex item：容器的直接子元素\n */\n\n/* 基础容器设置 */\n.flex-container {\n  /* 开启 flex 布局 */\n  display: flex;\n  \n  /* 主轴方向 */\n  flex-direction: row;        /* 默认：水平从左到右 */\n  /* flex-direction: column;  /* 垂直从上到下 */\n  /* flex-direction: row-reverse; /* 水平从右到左 */\n  /* flex-direction: column-reverse; /* 垂直从下到上 */\n  \n  /* 主轴对齐方式 */\n  justify-content: flex-start;  /* 默认：起点对齐 */\n  /* justify-content: flex-end;    /* 终点对齐 */\n  /* justify-content: center;      /* 居中对齐 */\n  /* justify-content: space-between; /* 两端对齐，中间平分 */\n  /* justify-content: space-around;  /* 每个项目两侧间隔相等 */\n  /* justify-content: space-evenly;  /* 所有间隔完全相等 */\n  \n  /* 交叉轴对齐方式 */\n  align-items: stretch;  /* 默认：拉伸填满 */\n  /* align-items: flex-start; /* 起点对齐 */\n  /* align-items: center;     /* 居中对齐 */\n  /* align-items: baseline;   /* 基线对齐 */\n  \n  /* 换行方式 */\n  flex-wrap: nowrap;  /* 默认：不换行 */\n  /* flex-wrap: wrap;   /* 换行，第一行在上方 */\n  \n  /* 多行对齐 */\n  align-content: stretch;  /* 默认 */\n  /* align-content: center;  /* 整体居中 */\n  \n  /* 项目间距 */\n  gap: 10px;  /* 项目之间的间隔 */\n}\n\n/* Flex 项目属性 */\n.flex-item {\n  /* 放大比例：剩余空间分配 */\n  flex-grow: 0;  /* 默认：不放大 */\n  /* flex-grow: 1;  /* 等比例放大 */\n  \n  /* 缩小比例：空间不足时如何缩小 */\n  flex-shrink: 1;  /* 默认：等比例缩小 */\n  /* flex-shrink: 0;  /* 不缩小 */\n  \n  /* 基础大小 */\n  flex-basis: auto;  /* 默认：使用项目本身大小 */\n  /* flex-basis: 200px;  /* 固定基础大小 */\n  \n  /* 简写：flex: grow shrink basis */\n  flex: 0 1 auto;  /* 默认值 */\n  /* flex: 1; 等价于 flex: 1 1 0% */\n  \n  /* 单独覆盖交叉轴对齐 */\n  align-self: center;  /* 这个项目居中对齐 */\n  \n  /* 排序顺序 */\n  order: 0;  /* 默认：按源码顺序 */\n  /* order: -1;  /* 排到前面 */\n}\n\n/* 实用布局示例 */\n\n/* 1. 水平垂直居中 */\n.center-all {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n/* 2. 两端对齐导航栏 */\n.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n/* 3. 等宽卡片布局 */\n.card-container {\n  display: flex;\n  gap: 20px;\n}\n\n.card-container > * {\n  flex: 1;  /* 每个卡片等宽 */\n}\n\n/* 4. 圣杯布局 */\n.holy-grail {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n}\n\n.holy-grail main {\n  display: flex;\n  flex: 1;\n}\n\n.holy-grail .content {\n  flex: 1;  /* 中间内容区自适应 */\n}\n\n.holy-grail .sidebar {\n  flex: 0 0 200px;  /* 固定宽度侧边栏 */\n}`,
      },
      {
        language: 'html',
        description: 'Flex实现常见布局',
        code: `<!-- 圣杯布局 -->
<style>
  .holy-grail {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .header, .footer {
    height: 60px;
    background: lightblue;
  }
  
  .content {
    display: flex;
    flex: 1;
  }
  
  .main {
    flex: 1;
    background: lightgreen;
  }
  
  .nav, .ads {
    flex: 0 0 200px;
    background: lightcoral;
  }
  
  .nav { order: -1; }
</style>

<div class="holy-grail">
  <header class="header">Header</header>
  <div class="content">
    <main class="main">Main Content</main>
    <nav class="nav">Navigation</nav>
    <aside class="ads">Advertisements</aside>
  </div>
  <footer class="footer">Footer</footer>
</div>

<!-- 固定底栏 -->
<style>
  .sticky-footer {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .content {
    flex: 1;
  }
  
  .footer {
    height: 60px;
    background: lightblue;
  }
</style>

<div class="sticky-footer">
  <div class="content">Content</div>
  <footer class="footer">Footer</footer>
</div>`,
      },
    ],
    references: [
      'Flex布局教程 - 阮一峰',
      'MDN - Flexbox',
    ],
    createdAt: '2024-01-27',
  },
  {
    id: 'css-003',
    category: 'css',
    questionType: 'theory',
    title: 'CSS居中方案大全',
    difficulty: 'easy',
    tags: ['居中', '水平居中', '垂直居中', 'Flex'],
    question: '请列举CSS中实现元素水平垂直居中的各种方法，并比较它们的优缺点。',
    answer: `**水平居中：**

1. **行内元素**
   - text-align: center

2. **块级元素**
   - margin: 0 auto

3. **Flex布局**
   - justify-content: center

4. **绝对定位**
   - left: 50% + transform: translateX(-50%)

**垂直居中：**

1. **单行文本**
   - line-height = height

2. **Flex布局**
   - align-items: center

3. **绝对定位**
   - top: 50% + transform: translateY(-50%)

4. **table-cell**
   - display: table-cell + vertical-align: middle

**水平垂直居中：**

1. **Flex布局（推荐）**
2. **Grid布局**
3. **绝对定位 + transform**
4. **绝对定位 + margin: auto**
5. **table-cell + text-align**`,
    codeExamples: [
      {
        language: 'html',
        description: '水平垂直居中方案',
        code: `<!-- 1. Flex布局（推荐） -->
<style>
  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 300px;
    height: 300px;
    border: 1px solid #000;
  }
</style>

<div class="flex-center">
  <div>居中内容</div>
</div>

<!-- 2. Grid布局 -->
<style>
  .grid-center {
    display: grid;
    place-items: center;
    width: 300px;
    height: 300px;
    border: 1px solid #000;
  }
</style>

<div class="grid-center">
  <div>居中内容</div>
</div>

<!-- 3. 绝对定位 + transform -->
<style>
  .transform-center {
    position: relative;
    width: 300px;
    height: 300px;
    border: 1px solid #000;
  }
  
  .transform-center .child {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>

<div class="transform-center">
  <div class="child">居中内容</div>
</div>

<!-- 4. 绝对定位 + margin: auto -->
<style>
  .auto-center {
    position: relative;
    width: 300px;
    height: 300px;
    border: 1px solid #000;
  }
  
  .auto-center .child {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    width: 100px;
    height: 50px;
  }
</style>

<div class="auto-center">
  <div class="child">居中内容</div>
</div>`,
      },
    ],
    references: [
      'CSS居中完全指南',
      'MDN - CSS布局',
    ],
    createdAt: '2024-01-28',
  },
  {
    id: 'css-004',
    category: 'css',
    questionType: 'theory',
    title: 'CSS响应式设计和媒体查询',
    difficulty: 'medium',
    tags: ['响应式', '媒体查询', 'rem', 'vw/vh'],
    question: '请解释响应式设计的原理，如何使用媒体查询和移动端适配方案？',
    answer: `**响应式设计原则：**

1. **视口设置**
   - viewport meta标签
   - width=device-width, initial-scale=1.0

2. **媒体查询**
   - @media screen and (max-width: 768px)
   - 断点设置：移动优先 vs 桌面优先

3. **流式布局**
   - 百分比宽度
   - max-width限制

4. **弹性图片**
   - max-width: 100%
   - height: auto

**移动端适配方案：**

1. **rem方案**
   - 根据根元素字体大小计算
   - 配合flexible.js动态设置html字体大小

2. **vw/vh方案**
   - 1vw = 视口宽度的1%
   - 更直观，无需JS

3. **em方案**
   - 相对于父元素字体大小

**常用断点：**
- 手机：< 768px
- 平板：768px - 1024px
- 桌面：> 1024px`,
    codeExamples: [
      {
        language: 'html',
        description: '媒体查询示例',
        code: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" 
        content="width=device-width, initial-scale=1.0">
  <style>
    /* 移动优先 */
    .container {
      width: 100%;
      padding: 10px;
    }
    
    .item {
      width: 100%;
      margin-bottom: 10px;
    }
    
    /* 平板 */
    @media (min-width: 768px) {
      .container {
        max-width: 750px;
        margin: 0 auto;
      }
      
      .item {
        width: 48%;
        float: left;
        margin-right: 2%;
      }
    }
    
    /* 桌面 */
    @media (min-width: 1024px) {
      .container {
        max-width: 960px;
      }
      
      .item {
        width: 32%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
    <div class="item">Item 3</div>
  </div>
</body>
</html>`,
      },
      {
        language: 'css',
        description: 'rem适配方案',
        code: `/* rem适配方案 */
html {
  /* 设计稿宽度750px，分成10份，1rem = 75px */
  font-size: calc(100vw / 10);
}

/* 使用示例 */
.box {
  /* 设计稿上150px，转换为2rem */
  width: 2rem;
  height: 2rem;
  margin: 0.267rem; /* 20px */
}

/* vw适配方案（推荐） */
/* 设计稿750px，1px = 100vw/750 = 0.1333vw */
.box-vw {
  width: 20vw; /* 150px */
  height: 20vw;
  margin: 2.667vw; /* 20px */
}

/* 使用postcss-px-to-viewport插件自动转换 */
.box-auto {
  width: 150px; /* 自动转换为vw */
  height: 150px;
}`,
      },
    ],
    references: [
      'MDN - 媒体查询',
      '移动端适配方案总结',
    ],
    createdAt: '2024-01-29',
  },
];
