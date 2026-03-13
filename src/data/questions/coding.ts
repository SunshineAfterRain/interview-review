import { Question } from '../../types/question';

export const codingQuestions: Question[] = [
  {
    id: 'coding-001',
    category: 'coding',
    title: '实现数组扁平化',
    difficulty: 'easy',
    tags: ['JavaScript', '数组', '递归'],
    question: '实现一个 flatten 函数，将多维数组转换为一维数组。例如：[1, [2, [3, [4]], 5]] => [1, 2, 3, 4, 5]',
    questionType: 'coding',
    answer: `// 方法一：递归实现
function flatten(arr) {
  const result = [];
  
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  
  return result;
}

// 方法二：使用 reduce
function flattenReduce(arr) {
  return arr.reduce((acc, item) => {
    return acc.concat(Array.isArray(item) ? flattenReduce(item) : item);
  }, []);
}

// 方法三：使用 flat() 方法 (ES2019)
function flattenFlat(arr) {
  return arr.flat(Infinity);
}`,
    codingConfig: {
      language: 'javascript',
      starterCode: `// 实现数组扁平化函数
function flatten(arr) {
  // 在这里编写你的代码
  
}

// 测试代码会调用 solution 函数
const solution = flatten;`,
      testCases: [
        {
          input: [1, [2, [3, [4]], 5]],
          expectedOutput: [1, 2, 3, 4, 5],
          description: '多层嵌套数组'
        },
        {
          input: [[1, 2], [3, 4]],
          expectedOutput: [1, 2, 3, 4],
          description: '二维数组'
        },
        {
          input: [1, 2, 3],
          expectedOutput: [1, 2, 3],
          description: '一维数组'
        },
        {
          input: [],
          expectedOutput: [],
          description: '空数组'
        },
        {
          input: [1, [2], [[3]], [[[4]]]],
          expectedOutput: [1, 2, 3, 4],
          description: '不规则嵌套'
        }
      ],
      timeLimit: 1000
    },
    scoreDimensions: [
      { name: '正确性', maxScore: 60, weight: 0.6, description: '测试用例通过率' },
      { name: '代码质量', maxScore: 20, weight: 0.2, description: '代码风格和可读性' },
      { name: '效率', maxScore: 20, weight: 0.2, description: '执行效率' }
    ],
    createdAt: '2024-01-01'
  },
  {
    id: 'coding-002',
    category: 'coding',
    title: '实现防抖函数',
    difficulty: 'medium',
    tags: ['JavaScript', '函数', '性能优化'],
    question: '实现一个 debounce 防抖函数，在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时。',
    questionType: 'coding',
    answer: `function debounce(func, wait, immediate = false) {
  let timer = null;
  
  return function(...args) {
    const context = this;
    
    // 如果是立即执行模式
    if (immediate) {
      // 如果没有定时器，说明是第一次触发或已经执行完毕
      const callNow = !timer;
      
      // 无论如何都设置定时器
      timer = setTimeout(() => {
        timer = null;
      }, wait);
      
      // 如果是第一次触发，立即执行
      if (callNow) {
        func.apply(context, args);
      }
    } else {
      // 清除之前的定时器
      clearTimeout(timer);
      
      // 设置新的定时器
      timer = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    }
  };
}`,
    codingConfig: {
      language: 'javascript',
      starterCode: `// 实现防抖函数
function debounce(func, wait, immediate = false) {
  // 在这里编写你的代码
  
}

// 测试代码会调用 solution 函数
const solution = debounce;`,
      testCases: [
        {
          input: { wait: 100, calls: [0, 50, 100, 150] },
          expectedOutput: { callCount: 1, callTime: 250 },
          description: '多次调用只执行一次'
        }
      ],
      timeLimit: 2000
    },
    scoreDimensions: [
      { name: '正确性', maxScore: 60, weight: 0.6, description: '功能正确性' },
      { name: '代码质量', maxScore: 25, weight: 0.25, description: '代码风格和边界处理' },
      { name: '功能完整性', maxScore: 15, weight: 0.15, description: '是否支持立即执行' }
    ],
    createdAt: '2024-01-02'
  },
  {
    id: 'coding-003',
    category: 'coding',
    title: '实现深拷贝',
    difficulty: 'hard',
    tags: ['JavaScript', '对象', '递归'],
    question: '实现一个 deepClone 函数，能够深拷贝对象、数组、Date、RegExp、Map、Set 等类型，并处理循环引用。',
    questionType: 'coding',
    answer: `function deepClone(obj, hash = new WeakMap()) {
  // 处理 null 和非对象类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 处理 Map
  if (obj instanceof Map) {
    const cloneMap = new Map();
    hash.set(obj, cloneMap);
    obj.forEach((value, key) => {
      cloneMap.set(deepClone(key, hash), deepClone(value, hash));
    });
    return cloneMap;
  }
  
  // 处理 Set
  if (obj instanceof Set) {
    const cloneSet = new Set();
    hash.set(obj, cloneSet);
    obj.forEach(value => {
      cloneSet.add(deepClone(value, hash));
    });
    return cloneSet;
  }
  
  // 处理数组和普通对象
  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);
  
  // 处理 Symbol 键
  const symbolKeys = Object.getOwnPropertySymbols(obj);
  for (const symKey of symbolKeys) {
    clone[symKey] = deepClone(obj[symKey], hash);
  }
  
  // 处理普通键
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], hash);
    }
  }
  
  return clone;
}`,
    codingConfig: {
      language: 'javascript',
      starterCode: `// 实现深拷贝函数
function deepClone(obj, hash = new WeakMap()) {
  // 在这里编写你的代码
  
}

// 测试代码会调用 solution 函数
const solution = deepClone;`,
      testCases: [
        {
          input: { a: 1, b: { c: 2 } },
          expectedOutput: { a: 1, b: { c: 2 } },
          description: '简单对象'
        },
        {
          input: [1, [2, 3], { a: 4 }],
          expectedOutput: [1, [2, 3], { a: 4 }],
          description: '嵌套数组'
        },
        {
          input: new Date('2024-01-01'),
          expectedOutput: new Date('2024-01-01'),
          description: 'Date对象'
        }
      ],
      timeLimit: 1000
    },
    scoreDimensions: [
      { name: '正确性', maxScore: 50, weight: 0.5, description: '基本类型处理' },
      { name: '完整性', maxScore: 30, weight: 0.3, description: '特殊类型处理' },
      { name: '健壮性', maxScore: 20, weight: 0.2, description: '循环引用处理' }
    ],
    createdAt: '2024-01-03'
  },
  {
    id: 'coding-004',
    category: 'coding',
    title: '实现 Promise.all',
    difficulty: 'medium',
    tags: ['JavaScript', 'Promise', '异步'],
    question: '实现一个 Promise.all 方法，接收一个 Promise 数组，当所有 Promise 都 resolve 时返回结果数组，有一个 reject 就立即 reject。',
    questionType: 'coding',
    answer: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('promises must be an array'));
    }
    
    const result = [];
    let resolvedCount = 0;
    const len = promises.length;
    
    // 如果数组为空，直接返回空数组
    if (len === 0) {
      return resolve(result);
    }
    
    promises.forEach((promise, index) => {
      // 处理非 Promise 值
      Promise.resolve(promise)
        .then(value => {
          result[index] = value;
          resolvedCount++;
          
          if (resolvedCount === len) {
            resolve(result);
          }
        })
        .catch(reject);
    });
  });
}`,
    codingConfig: {
      language: 'javascript',
      starterCode: `// 实现 Promise.all
function promiseAll(promises) {
  // 在这里编写你的代码
  
}

// 测试代码会调用 solution 函数
const solution = promiseAll;`,
      testCases: [
        {
          input: [
            Promise.resolve(1),
            Promise.resolve(2),
            Promise.resolve(3)
          ],
          expectedOutput: [1, 2, 3],
          description: '所有Promise都resolve'
        }
      ],
      timeLimit: 2000
    },
    scoreDimensions: [
      { name: '正确性', maxScore: 60, weight: 0.6, description: '功能正确性' },
      { name: '边界处理', maxScore: 20, weight: 0.2, description: '空数组和异常处理' },
      { name: '代码质量', maxScore: 20, weight: 0.2, description: '代码风格' }
    ],
    createdAt: '2024-01-04'
  },
  {
    id: 'coding-005',
    category: 'coding',
    title: '实现发布订阅模式',
    difficulty: 'medium',
    tags: ['JavaScript', '设计模式', '事件'],
    question: '实现一个 EventEmitter 类，包含 on、off、emit、once 方法。',
    questionType: 'coding',
    answer: `class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }
  
  // 取消订阅
  off(event, callback) {
    if (!this.events[event]) return this;
    
    if (!callback) {
      // 如果没有提供回调，删除所有该事件的监听器
      delete this.events[event];
    } else {
      // 删除指定的回调
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    return this;
  }
  
  // 触发事件
  emit(event, ...args) {
    if (!this.events[event]) return this;
    
    this.events[event].forEach(callback => {
      callback.apply(this, args);
    });
    
    return this;
  }
  
  // 只订阅一次
  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(event, wrapper);
    };
    
    this.on(event, wrapper);
    return this;
  }
}`,
    codingConfig: {
      language: 'javascript',
      starterCode: `// 实现发布订阅模式
class EventEmitter {
  constructor() {
    // 在这里编写你的代码
    
  }
  
  on(event, callback) {
    
  }
  
  off(event, callback) {
    
  }
  
  emit(event, ...args) {
    
  }
  
  once(event, callback) {
    
  }
}

// 测试代码会调用 solution 函数
const solution = EventEmitter;`,
      testCases: [
        {
          input: 'on-emit',
          expectedOutput: { events: ['test'], called: true },
          description: '基本订阅和触发'
        }
      ],
      timeLimit: 1000
    },
    scoreDimensions: [
      { name: '功能完整性', maxScore: 50, weight: 0.5, description: '四个方法都实现' },
      { name: '正确性', maxScore: 30, weight: 0.3, description: '方法行为正确' },
      { name: '代码质量', maxScore: 20, weight: 0.2, description: '链式调用支持' }
    ],
    createdAt: '2024-01-05'
  },
  {
    id: 'coding-006',
    category: 'coding',
    title: '实现数组去重',
    difficulty: 'easy',
    tags: ['JavaScript', '数组', 'Set'],
    question: '实现一个 unique 函数，去除数组中的重复元素，支持多种数据类型。',
    questionType: 'coding',
    answer: `// 方法一：使用 Set
function unique(arr) {
  return [...new Set(arr)];
}

// 方法二：使用 filter
function uniqueFilter(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

// 方法三：使用 reduce
function uniqueReduce(arr) {
  return arr.reduce((acc, item) => {
    if (!acc.includes(item)) {
      acc.push(item);
    }
    return acc;
  }, []);
}

// 方法四：处理引用类型
function uniqueDeep(arr) {
  const map = new Map();
  return arr.filter(item => {
    const key = typeof item === 'object' ? JSON.stringify(item) : item;
    if (map.has(key)) {
      return false;
    }
    map.set(key, true);
    return true;
  });
}`,
    codingConfig: {
      language: 'javascript',
      starterCode: `// 实现数组去重
function unique(arr) {
  // 在这里编写你的代码
  
}

// 测试代码会调用 solution 函数
const solution = unique;`,
      testCases: [
        {
          input: [1, 2, 2, 3, 3, 3],
          expectedOutput: [1, 2, 3],
          description: '基本数字去重'
        },
        {
          input: ['a', 'b', 'a', 'c'],
          expectedOutput: ['a', 'b', 'c'],
          description: '字符串去重'
        },
        {
          input: [1, '1', 1, '1'],
          expectedOutput: [1, '1'],
          description: '混合类型'
        },
        {
          input: [],
          expectedOutput: [],
          description: '空数组'
        }
      ],
      timeLimit: 500
    },
    scoreDimensions: [
      { name: '正确性', maxScore: 70, weight: 0.7, description: '测试用例通过率' },
      { name: '效率', maxScore: 20, weight: 0.2, description: '时间复杂度' },
      { name: '代码质量', maxScore: 10, weight: 0.1, description: '代码简洁性' }
    ],
    createdAt: '2024-01-06'
  },
  {
    id: 'coding-007',
    category: 'coding',
    title: '实现柯里化函数',
    difficulty: 'medium',
    tags: ['JavaScript', '函数式编程', '闭包'],
    question: '实现一个 curry 函数，将普通函数转换为柯里化函数。',
    questionType: 'coding',
    answer: `function curry(fn) {
  return function curried(...args) {
    // 如果传入的参数数量足够，直接调用原函数
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    
    // 否则返回一个新函数，等待更多参数
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

// 使用示例
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
console.log(curriedAdd(1, 2, 3)); // 6`,
    codingConfig: {
      language: 'javascript',
      starterCode: `// 实现柯里化函数
function curry(fn) {
  // 在这里编写你的代码
  
}

// 测试代码会调用 solution 函数
const solution = curry;`,
      testCases: [
        {
          input: { fn: 'add', args: [1, 2, 3] },
          expectedOutput: 6,
          description: '三参数函数'
        }
      ],
      timeLimit: 500
    },
    scoreDimensions: [
      { name: '正确性', maxScore: 60, weight: 0.6, description: '功能正确性' },
      { name: '灵活性', maxScore: 25, weight: 0.25, description: '支持多种调用方式' },
      { name: '代码质量', maxScore: 15, weight: 0.15, description: '代码风格' }
    ],
    createdAt: '2024-01-07'
  },
  {
    id: 'coding-008',
    category: 'coding',
    title: '实现数组排序算法',
    difficulty: 'medium',
    tags: ['JavaScript', '算法', '排序'],
    question: '实现一个快速排序算法。',
    questionType: 'coding',
    answer: `function quickSort(arr) {
  // 基线条件：数组长度小于等于1时直接返回
  if (arr.length <= 1) {
    return arr;
  }
  
  // 选择基准值（这里选择中间元素）
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];
  
  const left = [];
  const right = [];
  
  // 分区：小于基准的放左边，大于基准的放右边
  for (let i = 0; i < arr.length; i++) {
    if (i === pivotIndex) continue;
    
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  
  // 递归排序并合并
  return [...quickSort(left), pivot, ...quickSort(right)];
}

// 原地排序版本（更节省空间）
function quickSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr;
  
  const pivotIndex = partition(arr, left, right);
  
  quickSortInPlace(arr, left, pivotIndex - 1);
  quickSortInPlace(arr, pivotIndex + 1, right);
  
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;
  
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}`,
    codingConfig: {
      language: 'javascript',
      starterCode: `// 实现快速排序
function quickSort(arr) {
  // 在这里编写你的代码
  
}

// 测试代码会调用 solution 函数
const solution = quickSort;`,
      testCases: [
        {
          input: [3, 1, 4, 1, 5, 9, 2, 6],
          expectedOutput: [1, 1, 2, 3, 4, 5, 6, 9],
          description: '随机数组'
        },
        {
          input: [5, 4, 3, 2, 1],
          expectedOutput: [1, 2, 3, 4, 5],
          description: '逆序数组'
        },
        {
          input: [1, 2, 3, 4, 5],
          expectedOutput: [1, 2, 3, 4, 5],
          description: '已排序数组'
        },
        {
          input: [1],
          expectedOutput: [1],
          description: '单元素数组'
        },
        {
          input: [],
          expectedOutput: [],
          description: '空数组'
        }
      ],
      timeLimit: 1000
    },
    scoreDimensions: [
      { name: '正确性', maxScore: 60, weight: 0.6, description: '排序结果正确' },
      { name: '效率', maxScore: 25, weight: 0.25, description: '时间复杂度' },
      { name: '代码质量', maxScore: 15, weight: 0.15, description: '代码可读性' }
    ],
    createdAt: '2024-01-08'
  }
];
