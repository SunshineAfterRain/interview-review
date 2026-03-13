import { Question } from '../../types/question';

export const performanceQuestions: Question[] = [
  {
    id: 'perf-001',
    category: 'performance',
    title: '前端性能优化策略',
    difficulty: 'hard',
    tags: ['性能优化', '加载优化', '渲染优化', '网络优化'],
    question: '请全面介绍前端性能优化的策略，包括加载优化、渲染优化、网络优化等方面。',
    answer: `**性能优化指标：**

1. **FCP（First Contentful Paint）** - 首次内容绘制
2. **LCP（Largest Contentful Paint）** - 最大内容绘制
3. **FID（First Input Delay）** - 首次输入延迟
4. **CLS（Cumulative Layout Shift）** - 累积布局偏移
5. **TTI（Time to Interactive）** - 可交互时间

**加载优化：**

1. **资源压缩**
   - 代码压缩（JS/CSS）
   - 图片压缩和格式选择（WebP、AVIF）
   - Gzip/Brotli压缩

2. **代码分割**
   - 路由懒加载
   - 组件懒加载
   - 第三方库按需引入

3. **资源加载**
   - 预加载（preload、prefetch）
   - 懒加载（图片、组件）
   - CDN加速

**渲染优化：**

1. **减少重排重绘**
   - 批量修改DOM
   - 使用transform代替位置属性
   - 使用opacity代替visibility

2. **长列表优化**
   - 虚拟列表
   - 分页加载
   - 时间分片

3. **动画优化**
   - 使用CSS动画
   - will-change提升合成层
   - requestAnimationFrame

**网络优化：**

1. **HTTP缓存**
   - 强缓存（Cache-Control）
   - 协商缓存（ETag、Last-Modified）

2. **HTTP/2**
   - 多路复用
   - 头部压缩
   - 服务器推送

3. **减少请求**
   - 合并请求
   - 雪碧图
   - 内联关键资源`,
    codeExamples: [
      {
        language: 'html',
        description: '资源预加载和懒加载',
        code: `<!DOCTYPE html>
<html>
<head>
  <!-- 预加载关键资源 -->
  <link rel="preload" href="critical.css" as="style">
  <link rel="preload" href="main.js" as="script">
  
  <!-- 预连接到第三方域名 -->
  <link rel="preconnect" href="https://cdn.example.com">
  <link rel="dns-prefetch" href="https://cdn.example.com">
  
  <!-- 预获取未来可能需要的资源 -->
  <link rel="prefetch" href="next-page.js" as="script">
  
  <!-- 预渲染下一页 -->
  <link rel="prerender" href="https://example.com/next-page">
</head>
<body>
  <!-- 图片懒加载 -->
  <img 
    src="placeholder.jpg" 
    data-src="real-image.jpg" 
    loading="lazy"
    alt="Lazy loaded image"
  >
  
  <!-- 使用Intersection Observer实现懒加载 -->
  <script>
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px'
    });
    
    images.forEach(img => imageObserver.observe(img));
  </script>
</body>
</html>`,
      },
      {
        language: 'javascript',
        description: '虚拟列表实现',
        code: `class VirtualList {
  constructor(options) {
    const { 
      container, 
      itemHeight, 
      renderItem, 
      data 
    } = options;
    
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.data = data;
    this.visibleCount = Math.ceil(
      container.clientHeight / itemHeight
    );
    
    this.init();
  }
  
  init() {
    // 创建总高度容器
    this.wrapper = document.createElement('div');
    this.wrapper.style.height = \`\${this.data.length * this.itemHeight}px\`;
    this.wrapper.style.position = 'relative';
    
    // 创建可见区域容器
    this.content = document.createElement('div');
    this.content.style.position = 'absolute';
    this.content.style.top = '0';
    this.content.style.width = '100%';
    
    this.wrapper.appendChild(this.content);
    this.container.appendChild(this.wrapper);
    
    // 监听滚动
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    
    // 初始渲染
    this.render();
  }
  
  handleScroll() {
    requestAnimationFrame(() => this.render());
  }
  
  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount + 2,
      this.data.length
    );
    
    // 更新位置
    this.content.style.transform = \`translateY(\${startIndex * this.itemHeight}px)\`;
    
    // 渲染可见项
    const visibleItems = this.data.slice(startIndex, endIndex);
    this.content.innerHTML = visibleItems
      .map((item, i) => this.renderItem(item, startIndex + i))
      .join('');
  }
}

// 使用示例
const virtualList = new VirtualList({
  container: document.getElementById('list'),
  itemHeight: 50,
  data: Array.from({ length: 10000 }, (_, i) => ({ id: i, text: \`Item \${i}\` })),
  renderItem: (item) => \`<div style="height: 50px">\${item.text}</div>\`
});`,
      },
    ],
    references: [
      'Web Vitals - Google',
      '高性能网站建设指南',
    ],
    createdAt: '2024-01-30',
  },
  {
    id: 'perf-002',
    category: 'performance',
    title: 'Webpack性能优化',
    difficulty: 'hard',
    tags: ['Webpack', '构建优化', '打包优化', 'Tree Shaking'],
    question: '请介绍Webpack的性能优化策略，包括构建速度优化和打包体积优化。',
    answer: `**构建速度优化：**

1. **缩小搜索范围**
   - resolve.extensions
   - resolve.modules
   - resolve.alias
   - module.rules.exclude

2. **使用缓存**
   - cache-loader
   - babel-loader?cacheDirectory
   - hard-source-webpack-plugin

3. **多进程构建**
   - thread-loader
   - HappyPack

4. **DllPlugin**
   - 预编译第三方库
   - 减少重复编译

**打包体积优化：**

1. **Tree Shaking**
   - ES6模块静态分析
   - 删除未使用代码

2. **Scope Hoisting**
   - 作用域提升
   - 减少函数声明

3. **Code Splitting**
   - SplitChunksPlugin
   - 动态import

4. **压缩代码**
   - TerserPlugin
   - OptimizeCSSAssetsPlugin

5. **分析工具**
   - webpack-bundle-analyzer
   - speed-measure-webpack-plugin`,
    codeExamples: [
      {
        language: 'javascript',
        description: 'Webpack优化配置',
        code: `const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  
  // 构建速度优化
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    modules: [path.resolve(__dirname, 'node_modules')],
  },
  
  module: {
    rules: [
      {
        test: /\\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true, // 开启缓存
          },
        },
      },
    ],
  },
  
  // 打包体积优化
  optimization: {
    usedExports: true, // Tree Shaking
    concatenateModules: true, // Scope Hoisting
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true, // 多进程并行
        terserOptions: {
          compress: {
            drop_console: true, // 删除console
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\\\/]node_modules[\\\\/]/,
          priority: -10,
          name: 'vendors',
        },
        common: {
          minChunks: 2,
          priority: -20,
          name: 'common',
        },
      },
    },
  },
  
  plugins: [
    new BundleAnalyzerPlugin(), // 分析打包结果
  ],
};`,
      },
      {
        language: 'javascript',
        description: 'DllPlugin配置',
        code: `// webpack.dll.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    vendor: ['react', 'react-dom', 'lodash'],
  },
  output: {
    path: path.resolve(__dirname, 'dll'),
    filename: '[name].dll.js',
    library: '[name]_dll',
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_dll',
      path: path.resolve(__dirname, 'dll', '[name].manifest.json'),
    }),
  ],
};

// webpack.config.js
const webpack = require('webpack');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dll/vendor.manifest.json'),
    }),
    new AddAssetHtmlPlugin({
      filepath: path.resolve(__dirname, 'dll/*.dll.js'),
    }),
  ],
};`,
      },
    ],
    references: [
      'Webpack官方文档',
      '深入浅出Webpack',
    ],
    createdAt: '2024-01-31',
  },
];
