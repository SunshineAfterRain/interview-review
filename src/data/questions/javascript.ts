import { Question } from '../../types/question';

export const javascriptQuestions: Question[] = [
  {
    id: 'js-001',
    category: 'javascript',
    questionType: 'theory',
    title: '什么是闭包？闭包的应用场景有哪些？',
    difficulty: 'medium',
    tags: ['闭包', '作用域', '内存管理'],
    question: '请解释什么是闭包（Closure），闭包的形成条件是什么？闭包有哪些实际应用场景？闭包可能导致什么问题？',
    answer: `闭包是指有权访问另一个函数作用域中变量的函数。创建闭包的常见方式是在一个函数内部创建另一个函数。

**闭包的形成条件：**
1. 函数嵌套
2. 内部函数引用了外部函数的变量
3. 内部函数被返回或传递到外部

**闭包的应用场景：**
1. 数据私有化和封装
2. 函数柯里化
3. 模块模式
4. 回调和事件处理
5. 防抖和节流
6. 缓存计算结果

**闭包可能导致的问题：**
1. 内存泄漏：闭包会引用外部函数的变量，导致这些变量无法被垃圾回收
2. 性能影响：过度使用闭包会导致内存占用增加

**解决方案：**
- 及时将不再使用的闭包引用置为 null
- 避免在循环中创建闭包（使用 let 或 IIFE）`,
    codeExamples: [
      {
        language: 'javascript',
        description: '闭包实现数据私有化',
        code: `/**
 * 闭包实现数据私有化
 * 
 * 核心原理：
 * 1. createCounter 函数创建了一个局部作用域
 * 2. count 变量在这个作用域内，外部无法直接访问
 * 3. 返回的对象中的方法形成了闭包，可以访问 count
 * 4. 这些方法成为了访问 count 的唯一途径
 */
function createCounter() {
  // 私有变量：存储在函数作用域中，外部无法直接访问
  let count = 0;
  
  // 返回一个对象，包含操作 count 的方法
  // 这些方法形成了闭包，因为它们引用了外部函数的变量
  return {
    // 增加计数
    increment() {
      count++; // 通过闭包访问并修改 count
      return count; // 返回新值
    },
    
    // 减少计数
    decrement() {
      count--;
      return count;
    },
    
    // 获取当前计数（只读访问）
    getCount() {
      return count;
    },
    
    // 重置计数
    reset() {
      count = 0;
      return count;
    }
  };
}

// 使用示例
const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount()); // 2
console.log(counter.count); // undefined - 无法直接访问私有变量
console.log(counter.reset()); // 0

// 每次调用 createCounter 都会创建新的闭包作用域
const counter2 = createCounter();
console.log(counter2.getCount()); // 0 - 独立的计数器`,
      },
      {
        language: 'javascript',
        description: '闭包实现函数柯里化',
        code: `/**
 * 函数柯里化（Currying）
 * 
 * 概念：将接受多个参数的函数转换为一系列接受单个参数的函数
 * 
 * 优点：
 * 1. 参数复用 - 可以创建预设参数的新函数
 * 2. 延迟执行 - 收集完所有参数后才执行
 * 3. 函数组合 - 便于函数式编程
 */
function curry(fn) {
  return function curried(...args) {
    // fn.length 是函数定义时的形参数量
    // 如果已收集的参数数量 >= 函数需要的参数数量，直接执行
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    
    // 否则返回一个新函数，继续收集参数
    // 使用闭包保存已收集的 args
    return function(...moreArgs) {
      // 递归调用，合并已收集的参数和新参数
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

// 示例：普通的三参数函数
function add(a, b, c) {
  return a + b + c;
}

// 转换为柯里化函数
const curriedAdd = curry(add);

// 多种调用方式
console.log(curriedAdd(1)(2)(3)); // 6 - 每次传一个参数
console.log(curriedAdd(1, 2)(3)); // 6 - 先传两个，再传一个
console.log(curriedAdd(1)(2, 3)); // 6 - 先传一个，再传两个
console.log(curriedAdd(1, 2, 3)); // 6 - 一次传完

// 实际应用：创建预设参数的函数
const add5 = curriedAdd(5); // 预设第一个参数为 5
console.log(add5(3)(2)); // 10 = 5 + 3 + 2

const add5and3 = add5(3); // 再预设第二个参数为 3
console.log(add5and3(2)); // 10 = 5 + 3 + 2`,
      },
      {
        language: 'javascript',
        description: '闭包实现防抖函数',
        interactiveDemo: 'debounce',
        code: `function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    if (timer) clearTimeout(timer);
    
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用示例
const handleSearch = debounce((value) => {
  console.log('搜索:', value);
}, 500);

// 连续输入时，只有最后一次会触发
handleSearch('h');
handleSearch('he');
handleSearch('hello'); // 500ms 后执行`,
      },
    ],
    references: [
      'MDN - 闭包',
      'JavaScript高级程序设计（第4版）',
    ],
    createdAt: '2024-01-15',
  },
  {
    id: 'js-002',
    category: 'javascript',
    questionType: 'theory',
    title: '解释JavaScript的事件循环机制',
    difficulty: 'hard',
    tags: ['事件循环', '异步', '宏任务', '微任务'],
    question: '请详细解释JavaScript的事件循环（Event Loop）机制，包括宏任务（Macro Task）和微任务（Micro Task）的执行顺序。',
    answer: `JavaScript是单线程语言，通过事件循环机制实现异步操作。

**事件循环的核心概念：**

1. **调用栈（Call Stack）**
   - 后进先出（LIFO）结构
   - 存储当前执行的函数调用

2. **任务队列（Task Queue）**
   - 宏任务队列（Macro Task Queue）
   - 微任务队列（Micro Task Queue）

3. **宏任务（Macro Task）**
   - script（整体代码）
   - setTimeout / setInterval
   - setImmediate（Node.js）
   - I/O 操作
   - UI 渲染

4. **微任务（Micro Task）**
   - Promise.then / catch / finally
   - process.nextTick（Node.js）
   - MutationObserver

**事件循环执行顺序：**
1. 执行同步代码（属于宏任务）
2. 执行栈为空时，检查微任务队列
3. 执行所有微任务
4. UI 渲染
5. 执行下一个宏任务
6. 重复步骤 2-5

**关键规则：**
- 每个宏任务执行完后，会执行所有微任务
- 微任务队列清空后，才会执行下一个宏任务`,
    codeExamples: [
      {
        language: 'javascript',
        description: '事件循环执行顺序',
        code: `/**
 * JavaScript 事件循环（Event Loop）
 * 
 * 执行顺序：
 * 1. 同步代码 -> 调用栈直接执行
 * 2. 微任务（Microtask）-> Promise.then, queueMicrotask, MutationObserver
 * 3. 宏任务（Macrotask）-> setTimeout, setInterval, I/O, UI渲染
 * 
 * 每个宏任务执行完后，会清空所有微任务队列
 */

console.log('1. 同步代码开始'); // 同步

// 宏任务1：setTimeout 回调放入宏任务队列
setTimeout(() => {
  console.log('2. setTimeout 宏任务');
  
  // 宏任务内的微任务
  Promise.resolve().then(() => {
    console.log('3. setTimeout 内的微任务');
  });
}, 0);

// 微任务1：Promise.then 放入微任务队列
Promise.resolve()
  .then(() => {
    console.log('4. 第一个微任务');
  })
  .then(() => {
    console.log('5. 第一个微任务链式调用');
  });

// 微任务2
Promise.resolve().then(() => {
  console.log('6. 第二个微任务');
});

// 宏任务2
setTimeout(() => {
  console.log('7. 第二个 setTimeout');
}, 0);

console.log('8. 同步代码结束');

/**
 * 执行结果：
 * 1. 同步代码开始
 * 8. 同步代码结束
 * 4. 第一个微任务
 * 6. 第二个微任务
 * 5. 第一个微任务链式调用
 * 2. setTimeout 宏任务
 * 3. setTimeout 内的微任务
 * 7. 第二个 setTimeout
 * 
 * 解释：
 * - 先执行所有同步代码（1, 8）
 * - 清空微任务队列（4, 6, 5）注意链式调用的顺序
 * - 执行第一个宏任务（2），然后清空其产生的微任务（3）
 * - 执行第二个宏任务（7）
 */`,
      },
      {
        language: 'javascript',
        description: '复杂的异步执行顺序',
        code: `async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// 执行顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout`,
      },
    ],
    references: [
      'Philip Roberts - What the heck is the event loop anyway?',
      'Tasks, microtasks, queues and schedules - Jake Archibald',
    ],
    createdAt: '2024-01-16',
  },
  {
    id: 'js-003',
    category: 'javascript',
    questionType: 'theory',
    title: '原型链和继承的实现方式',
    difficulty: 'hard',
    tags: ['原型链', '继承', 'prototype', '__proto__'],
    question: '请解释JavaScript中的原型链是什么？如何实现继承？ES6的class继承和ES5的继承有什么区别？',
    answer: `**原型链的概念：**

每个JavaScript对象都有一个原型对象（prototype），对象从原型继承方法和属性。原型对象也有自己的原型，这样层层向上直到一个对象的原型为 null，形成了原型链。

**关键属性：**
- \`__proto__\`：指向对象的原型（不推荐直接使用）
- \`prototype\`：函数特有的属性，用于构建新对象的原型
- \`Object.getPrototypeOf()\`：获取对象原型的标准方法

**继承的实现方式：**

1. **原型链继承**
   - 优点：简单
   - 缺点：引用类型属性被所有实例共享

2. **构造函数继承**
   - 优点：避免引用类型共享
   - 缺点：无法继承原型上的方法

3. **组合继承**
   - 结合原型链和构造函数继承
   - 缺点：调用了两次父类构造函数

4. **寄生组合继承（最优方案）**
   - 只调用一次父类构造函数
   - 避免了不必要的属性

**ES6 class 继承：**
- 语法糖，底层仍是原型链
- 使用 extends 和 super 关键字
- 必须先调用 super() 才能使用 this`,
    codeExamples: [
      {
        language: 'javascript',
        description: '原型链继承示例',
        code: `/**
 * JavaScript 原型链继承
 * 
 * 核心概念：
 * 1. 每个对象都有一个 __proto__ 属性，指向其构造函数的 prototype
 * 2. 当访问对象的属性时，会沿着原型链向上查找
 * 3. 原型链的终点是 Object.prototype，再往上就是 null
 */

// 父类构造函数
function Animal(name) {
  this.name = name;
}

// 在父类原型上添加方法
Animal.prototype.eat = function() {
  console.log(\`\${this.name} is eating\`);
};

// 子类构造函数
function Dog(name, breed) {
  // 调用父类构造函数，绑定 this
  // 相当于 super(name) 的效果
  Animal.call(this, name);
  this.breed = breed; // 子类特有的属性
}

// 关键步骤：设置原型链继承
// Object.create() 创建一个新对象，其 __proto__ 指向 Animal.prototype
Dog.prototype = Object.create(Animal.prototype);

// 修复 constructor 指向（重要！）
// 上一步会覆盖 constructor，需要手动修复
Dog.prototype.constructor = Dog;

// 在子类原型上添加方法
Dog.prototype.bark = function() {
  console.log(\`\${this.name} is barking: Woof!\`);
};

// 使用示例
const dog = new Dog('Buddy', 'Golden Retriever');
dog.eat(); // Buddy is eating - 继承自 Animal
dog.bark(); // Buddy is barking: Woof! - Dog 特有方法

console.log(dog.name); // Buddy
console.log(dog.breed); // Golden Retriever

// 检查原型链关系
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
console.log(dog instanceof Object); // true

// 原型链结构：
// dog -> Dog.prototype -> Animal.prototype -> Object.prototype -> null`,
      },
      {
        language: 'javascript',
        description: 'ES6 Class 继承',
        code: `/**
 * ES6 Class 继承
 * 
 * ES6 的 class 是语法糖，底层仍然是原型链继承
 * 但提供了更清晰、更接近传统面向对象语言的写法
 */

// 父类
class Animal {
  // 构造函数
  constructor(name) {
    this.name = name;
  }
  
  // 实例方法（定义在原型上）
  eat() {
    console.log(\`\${this.name} is eating\`);
  }
  
  // 静态方法（定义在类本身，不是实例上）
  static create(name) {
    return new Animal(name);
  }
}

// 子类继承父类
class Dog extends Animal {
  constructor(name, breed) {
    // 必须先调用 super()，否则 this 未定义
    // super() 调用父类的构造函数
    super(name);
    this.breed = breed; // 子类特有属性
  }
  
  // 重写父类方法
  eat() {
    // 可以调用父类的实现
    super.eat();
    console.log(\`\${this.name} finished eating\`);
  }
  
  // 子类特有方法
  bark() {
    console.log(\`\${this.name} says: Woof!\`);
  }
}

// 使用示例
const dog = new Dog('Buddy', 'Golden Retriever');
dog.eat(); // Buddy is eating, Buddy finished eating
dog.bark(); // Buddy says: Woof!

// instanceof 检查原型链
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true

// 静态方法继承
const animal = Animal.create('Generic');
console.log(animal.name); // Generic`,
      },
    ],
    references: [
      'JavaScript高级程序设计（第4版）- 第8章',
      'ES6标准入门 - class继承',
    ],
    createdAt: '2024-01-17',
  },
  {
    id: 'js-004',
    category: 'javascript',
    questionType: 'theory',
    title: 'Promise的实现原理和手写Promise',
    difficulty: 'hard',
    tags: ['Promise', '异步', 'A+规范'],
    question: '请解释Promise的工作原理，并手写实现一个符合Promise A+规范的Promise类。',
    answer: `**Promise的特点：**
1. 三种状态：pending、fulfilled、rejected
2. 状态一旦改变就不可逆
3. 支持链式调用
4. 异步执行，then方法会放入微任务队列

**Promise A+规范核心要点：**
1. 状态只能从 pending 转为 fulfilled 或 rejected
2. 必须有一个 then 方法
3. then 方法必须返回一个新的 Promise
4. 值的穿透：如果 onFulfilled 不是函数，必须忽略并向下传递
5. Promise 解决过程：处理 thenable 对象和 Promise 对象

**关键实现点：**
- 使用数组存储回调函数（支持多个 then）
- 异步执行回调（使用 setTimeout 模拟微任务）
- 链式调用返回新 Promise
- 值的传递和错误冒泡`,
    codeExamples: [
      {
        language: 'javascript',
        description: 'Promise 手写实现',
        code: `/**
 * Promise 手写实现（简化版）
 * 
 * Promise 是一个状态机，有三种状态：
 * - pending: 初始状态
 * - fulfilled: 操作成功
 * - rejected: 操作失败
 * 
 * 状态一旦改变就不可逆（pending -> fulfilled 或 pending -> rejected）
 */
class MyPromise {
  constructor(executor) {
    // 初始状态
    this.state = 'pending';
    // 成功的值
    this.value = undefined;
    // 失败的原因
    this.reason = undefined;
    // 成功回调队列（支持多个 .then）
    this.onFulfilledCallbacks = [];
    // 失败回调队列
    this.onRejectedCallbacks = [];
    
    // resolve 函数：将状态改为 fulfilled
    const resolve = (value) => {
      // 只有 pending 状态才能改变
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        // 执行所有成功回调
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    // reject 函数：将状态改为 rejected
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        // 执行所有失败回调
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    // 立即执行 executor，捕获同步错误
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  // then 方法：注册成功和失败回调
  then(onFulfilled, onRejected) {
    // 参数校验，确保是函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e; };
    
    // 返回新 Promise，支持链式调用
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        // 异步执行（模拟微任务）
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      // pending 状态时，将回调存入队列
      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    
    return promise2;
  }
}

// 使用示例
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('成功!'), 100);
});

promise
  .then(value => {
    console.log('第一个 then:', value);
    return '处理后的值';
  })
  .then(value => {
    console.log('第二个 then:', value);
  });

// 输出：
// 第一个 then: 成功!
// 第二个 then: 处理后的值`,
      },
      {
        language: 'javascript',
        description: 'Promise 使用示例',
        code: `// 测试手写的 Promise
const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(100);
  }, 1000);
});

p.then(value => {
  console.log('第一次 then:', value);
  return value * 2;
})
.then(value => {
  console.log('第二次 then:', value);
  return new MyPromise(resolve => {
    setTimeout(() => resolve(value + 50), 500);
  });
})
.then(value => {
  console.log('第三次 then:', value);
})
.catch(err => {
  console.error('错误:', err);
});

// 输出：
// 1秒后：第一次 then: 100
// 立即：第二次 then: 200
// 0.5秒后：第三次 then: 250`,
      },
    ],
    references: [
      'Promise A+ 规范',
      'MDN - Promise',
    ],
    createdAt: '2024-01-18',
  },
  {
    id: 'js-005',
    category: 'javascript',
    questionType: 'theory',
    title: '深拷贝的实现方式',
    difficulty: 'medium',
    tags: ['深拷贝', '递归', '对象复制'],
    question: '请解释深拷贝和浅拷贝的区别，并手写实现一个完整的深拷贝函数。',
    answer: `**浅拷贝：**
- 只复制对象的第一层属性
- 嵌套对象仍然共享引用
- 方法：Object.assign()、展开运算符 {...obj}、Array.prototype.slice()

**深拷贝：**
- 递归复制对象的所有层级
- 完全独立的副本，互不影响
- 方法：JSON.parse(JSON.stringify())、递归实现

**JSON 方式的局限性：**
1. 无法处理函数、undefined、Symbol
2. 无法处理循环引用
3. 无法处理正则、Date、Map、Set 等特殊对象
4. 会忽略对象的 constructor

**完整深拷贝需要考虑：**
- 基本类型直接返回
- 循环引用的处理（使用 WeakMap）
- 特殊对象的处理（Date、RegExp、Map、Set）
- 函数的处理
- Symbol 的处理`,
    codeExamples: [
      {
        language: 'javascript',
        description: '完整深拷贝实现',
        interactiveDemo: 'deep-clone',
        code: `function deepClone(obj, hash = new WeakMap()) {
  // null 或 undefined
  if (obj === null || obj === undefined) return obj;
  
  // 基本类型
  if (typeof obj !== 'object') return obj;
  
  // 循环引用
  if (hash.has(obj)) return hash.get(obj);
  
  // Date 对象
  if (obj instanceof Date) return new Date(obj);
  
  // RegExp 对象
  if (obj instanceof RegExp) return new RegExp(obj);
  
  // Map 对象
  if (obj instanceof Map) {
    const cloneMap = new Map();
    hash.set(obj, cloneMap);
    obj.forEach((value, key) => {
      cloneMap.set(deepClone(key, hash), deepClone(value, hash));
    });
    return cloneMap;
  }
  
  // Set 对象
  if (obj instanceof Set) {
    const cloneSet = new Set();
    hash.set(obj, cloneSet);
    obj.forEach(value => {
      cloneSet.add(deepClone(value, hash));
    });
    return cloneSet;
  }
  
  // 数组或普通对象
  const cloneObj = Array.isArray(obj) ? [] : {};
  hash.set(obj, cloneObj);
  
  // 处理 Symbol 键
  const symKeys = Object.getOwnPropertySymbols(obj);
  symKeys.forEach(symKey => {
    cloneObj[symKey] = deepClone(obj[symKey], hash);
  });
  
  // 处理普通键
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  
  return cloneObj;
}

// 测试用例
const obj = {
  name: 'test',
  date: new Date(),
  regex: /test/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  nested: { a: 1, b: { c: 2 } },
  arr: [1, 2, { d: 3 }],
  [Symbol('sym')]: 'symbol value'
};

obj.self = obj; // 循环引用

const cloned = deepClone(obj);
console.log(cloned);
console.log(cloned !== obj); // true
console.log(cloned.nested !== obj.nested); // true
console.log(cloned.self === cloned); // true - 循环引用正确处理`,
      },
    ],
    references: [
      'JavaScript高级程序设计（第4版）',
      'lodash - cloneDeep',
    ],
    createdAt: '2024-01-19',
  },
  {
    id: 'js-006',
    category: 'javascript',
    questionType: 'theory',
    title: 'this的指向和绑定规则',
    difficulty: 'medium',
    tags: ['this', 'call', 'apply', 'bind', '箭头函数'],
    question: '请解释JavaScript中this的绑定规则，以及call、apply、bind的区别和使用场景。',
    answer: `**this 的绑定规则（优先级从高到低）：**

1. **new 绑定**
   - 使用 new 关键字调用构造函数
   - this 指向新创建的对象

2. **显式绑定**
   - 使用 call、apply、bind 显式指定 this
   - call: 立即执行，参数列表
   - apply: 立即执行，参数数组
   - bind: 返回新函数，参数列表

3. **隐式绑定**
   - 作为对象的方法调用
   - this 指向调用该函数的对象
   - 注意：隐式丢失问题

4. **默认绑定**
   - 独立函数调用
   - 严格模式下 this 为 undefined
   - 非严格模式下 this 为 window

**箭头函数的 this：**
- 没有自己的 this
- 继承外层作用域的 this
- 无法通过 call、apply、bind 改变`,
    codeExamples: [
      {
        language: 'javascript',
        description: 'this 绑定规则示例',
        code: `// 1. new 绑定
function Person(name) {
  this.name = name;
}
const p = new Person('张三');
console.log(p.name); // 张三

// 2. 显式绑定
const obj = { name: '李四' };
function greet(greeting) {
  console.log(\`\${greeting}, \${this.name}\`);
}

greet.call(obj, '你好');    // 你好, 李四
greet.apply(obj, ['你好']);  // 你好, 李四

const boundGreet = greet.bind(obj);
boundGreet('你好');          // 你好, 李四

// 3. 隐式绑定
const person = {
  name: '王五',
  greet() {
    console.log(\`我是\${this.name}\`);
  }
};
person.greet(); // 我是王五

// 隐式丢失
const fn = person.greet;
fn(); // 我是undefined - 默认绑定

// 4. 默认绑定
function showThis() {
  'use strict';
  console.log(this);
}
showThis(); // undefined

// 5. 箭头函数
const arrow = {
  name: '赵六',
  greet: () => {
    console.log(this.name); // undefined - 继承外层 this
  },
  greet2() {
    const fn = () => console.log(this.name);
    fn(); // 赵六 - 继承 greet2 的 this
  }
};`,
      },
      {
        language: 'javascript',
        description: '手写 call、apply、bind',
        code: `// 手写 call
Function.prototype.myCall = function(context, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('Error');
  }
  
  context = context || window;
  const fn = Symbol();
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// 手写 apply
Function.prototype.myApply = function(context, args) {
  if (typeof this !== 'function') {
    throw new TypeError('Error');
  }
  
  context = context || window;
  const fn = Symbol();
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// 手写 bind
Function.prototype.myBind = function(context, ...args1) {
  if (typeof this !== 'function') {
    throw new TypeError('Error');
  }
  
  const fn = this;
  
  const boundFn = function(...args2) {
    // 作为构造函数调用时，this 指向新实例
    return fn.apply(
      this instanceof boundFn ? this : context,
      [...args1, ...args2]
    );
  };
  
  // 继承原型
  boundFn.prototype = Object.create(fn.prototype);
  
  return boundFn;
};

// 测试
const obj = { name: 'test' };
function show(...args) {
  console.log(this.name, ...args);
}

show.myCall(obj, 1, 2);    // test 1 2
show.myApply(obj, [1, 2]); // test 1 2
const bound = show.myBind(obj, 1);
bound(2);                  // test 1 2`,
      },
    ],
    references: [
      'You Don\'t Know JS - this & Object Prototypes',
      'JavaScript高级程序设计（第4版）',
    ],
    createdAt: '2024-01-20',
  },
];
