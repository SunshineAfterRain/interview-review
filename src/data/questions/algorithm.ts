import { Question } from '../../types/question';

export const algorithmQuestions: Question[] = [
  {
    id: 'algo-001',
    category: 'algorithm',
    questionType: 'coding',
    title: '两数之和',
    difficulty: 'easy',
    tags: ['算法', '哈希表', '数组'],
    question: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。你可以假设每种输入只会对应一个答案。',
    answer: `**题目分析：**
- 输入：整数数组 nums 和目标值 target
- 输出：两个数的索引，使它们的和等于 target
- 约束：每种输入只会对应一个答案，同一个元素不能使用两次

**解题思路：**

方法一：暴力枚举
- 双层循环枚举所有可能的数对
- 检查它们的和是否等于 target
- 时间复杂度 O(n²)，空间复杂度 O(1)

方法二：哈希表（推荐）
- 利用哈希表存储已遍历的数字及其索引
- 对于每个数字，检查 target - num 是否已存在
- 时间复杂度 O(n)，空间复杂度 O(n)

方法三：排序 + 双指针
- 先排序，再用双指针从两端向中间逼近
- 需要额外空间存储原始索引
- 时间复杂度 O(n log n)，空间复杂度 O(n)

**算法步骤（哈希表）：**
1. 创建一个哈希表存储已遍历的数字及其索引
2. 遍历数组，对于每个数字 num
3. 计算 complement = target - num
4. 如果 complement 在哈希表中，返回两个索引
5. 否则将 num 及其索引存入哈希表

**复杂度分析：**
- 时间复杂度：O(n)，只需遍历一次数组
- 空间复杂度：O(n)，最坏情况下需要存储 n-1 个元素`,
    codeExamples: [
      {
        language: 'javascript',
        description: '解法一：暴力枚举（适合面试时先给出基础解法）',
        code: `/**
 * 两数之和 - 暴力枚举法
 * 
 * 思路：枚举数组中的每一个数 x，寻找数组中是否存在 target - x
 * 
 * 优点：
 * 1. 思路简单直观，容易理解和实现
 * 2. 不需要额外空间
 * 
 * 缺点：
 * 1. 时间复杂度高，O(n²)
 * 2. 对于大规模数据效率低
 * 
 * @param {number[]} nums - 整数数组
 * @param {number} target - 目标和
 * @return {number[]} - 两个数的索引
 */
function twoSumBruteForce(nums, target) {
  // 外层循环：遍历第一个数
  for (let i = 0; i < nums.length; i++) {
    // 内层循环：遍历第二个数（从 i+1 开始，避免重复使用同一个元素）
    for (let j = i + 1; j < nums.length; j++) {
      // 检查两数之和是否等于目标值
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  
  // 未找到匹配的数对，返回空数组
  return [];
}

// 测试用例
console.log(twoSumBruteForce([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSumBruteForce([3, 2, 4], 6)); // [1, 2]
console.log(twoSumBruteForce([3, 3], 6)); // [0, 1]`,
      },
      {
        language: 'javascript',
        description: '解法二：哈希表（最优解，推荐）',
        code: `/**
 * 两数之和 - 哈希表法
 * 
 * 核心思想：利用哈希表 O(1) 的查找特性，将时间复杂度从 O(n²) 降到 O(n)
 * 
 * 关键洞察：
 * 对于数组中的每个元素 nums[i]，我们需要找到另一个元素 nums[j]
 * 使得 nums[i] + nums[j] = target
 * 即 nums[j] = target - nums[i]
 * 
 * 如果我们在遍历时，能够快速知道 target - nums[i] 是否存在，就能找到答案
 * 哈希表正好提供了 O(1) 的查找能力
 * 
 * @param {number[]} nums - 整数数组
 * @param {number} target - 目标和
 * @return {number[]} - 两个数的索引
 */
function twoSum(nums, target) {
  // 哈希表：存储 { 数字: 索引 } 的映射
  // 使用 Map 而不是 Object，因为 Map 的键可以是任意类型，且性能更好
  const map = new Map();
  
  // 遍历数组
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    // 计算需要的补数（complement）
    // 如果存在一个数与当前数相加等于 target，那个数就是 complement
    const complement = target - num;
    
    // 检查补数是否已在哈希表中
    // 如果存在，说明之前遍历过的某个数与当前数配对成功
    if (map.has(complement)) {
      // 返回 [补数的索引, 当前索引]
      // 注意：补数的索引一定小于当前索引
      return [map.get(complement), i];
    }
    
    // 将当前数字及其索引存入哈希表
    // 注意：先检查再存储，避免同一个元素被使用两次
    map.set(num, i);
  }
  
  // 未找到匹配的数对
  return [];
}

// 测试用例
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6)); // [1, 2]
console.log(twoSum([3, 3], 6)); // [0, 1]

// 边界情况测试
console.log(twoSum([1, 2], 3)); // [0, 1] - 最小有效输入
console.log(twoSum([-1, -2, -3, -4, -5], -8)); // [2, 4] - 负数`,
      },
      {
        language: 'javascript',
        description: '解法三：排序 + 双指针（适用于需要返回数值而非索引的情况）',
        code: `/**
 * 两数之和 - 排序 + 双指针法
 * 
 * 思路：
 * 1. 先将数组排序
 * 2. 使用双指针从两端向中间逼近
 * 3. 根据当前和与目标值的关系移动指针
 * 
 * 注意：此方法会改变数组顺序，如果需要返回原始索引，需要额外存储
 * 
 * @param {number[]} nums - 整数数组
 * @param {number} target - 目标和
 * @return {number[]} - 两个数的索引
 */
function twoSumTwoPointers(nums, target) {
  // 创建带有原始索引的数组
  const indexedNums = nums.map((num, index) => ({ num, index }));
  
  // 按数值排序
  indexedNums.sort((a, b) => a.num - b.num);
  
  // 双指针
  let left = 0;
  let right = indexedNums.length - 1;
  
  while (left < right) {
    const sum = indexedNums[left].num + indexedNums[right].num;
    
    if (sum === target) {
      // 找到答案，返回原始索引
      return [indexedNums[left].index, indexedNums[right].index].sort((a, b) => a - b);
    } else if (sum < target) {
      // 和太小，左指针右移
      left++;
    } else {
      // 和太大，右指针左移
      right--;
    }
  }
  
  return [];
}

// 测试
console.log(twoSumTwoPointers([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSumTwoPointers([3, 2, 4], 6)); // [1, 2]`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // 在这里编写你的代码
  
}

const solution = twoSum;`,
      testCases: [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1], description: '基本用例' },
        { input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2], description: '中间元素' },
        { input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1], description: '相同元素' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-01',
  },
  {
    id: 'algo-002',
    category: 'algorithm',
    questionType: 'coding',
    title: '反转链表',
    difficulty: 'easy',
    tags: ['算法', '链表', '双指针'],
    question: '给你单链表的头节点 head，请你反转链表，并返回反转后的链表。',
    answer: `**题目分析：**
- 输入：单链表的头节点
- 输出：反转后的链表头节点
- 约束：链表节点数目范围 [0, 5000]

**解题思路：**

方法一：迭代法（推荐）
- 使用三个指针：prev、curr、next
- 逐个反转节点的指向
- 时间复杂度 O(n)，空间复杂度 O(1)

方法二：递归法
- 递归到链表末尾，然后逐层返回时反转指针
- 代码简洁，但空间复杂度较高
- 时间复杂度 O(n)，空间复杂度 O(n)

方法三：头插法
- 创建虚拟头节点，逐个将节点插入头部
- 时间复杂度 O(n)，空间复杂度 O(1)

**算法步骤（迭代法）：**
1. 初始化 prev = null, curr = head
2. 遍历链表，每次：
   - 保存 next = curr.next
   - 反转指针：curr.next = prev
   - 移动：prev = curr, curr = next
3. 返回 prev（新的头节点）

**复杂度分析：**
- 时间复杂度：O(n)，需要遍历一次链表
- 空间复杂度：O(1)，只使用常数级别的额外空间`,
    codeExamples: [
      {
        language: 'javascript',
        description: '解法一：迭代法（推荐，最容易理解）',
        code: `/**
 * 链表节点定义
 */
function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}

/**
 * 反转链表 - 迭代法
 * 
 * 核心思想：
 * 遍历链表，逐个改变节点的指向，从指向下一个节点改为指向上一个节点
 * 
 * 图解过程：
 * 初始：1 -> 2 -> 3 -> 4 -> 5
 * 
 * 第一轮：prev=null, curr=1
 *   next = 2
 *   1.next = null  =>  null <- 1    2 -> 3 -> 4 -> 5
 *   prev = 1, curr = 2
 * 
 * 第二轮：prev=1, curr=2
 *   next = 3
 *   2.next = 1    =>  null <- 1 <- 2    3 -> 4 -> 5
 *   prev = 2, curr = 3
 * 
 * ... 以此类推
 * 
 * 最终：null <- 1 <- 2 <- 3 <- 4 <- 5
 * 返回 prev (值为 5 的节点)
 * 
 * @param {ListNode} head - 链表头节点
 * @return {ListNode} - 反转后的链表头节点
 */
function reverseList(head) {
  // prev 指向当前节点的前一个节点（初始为 null）
  let prev = null;
  // curr 指向当前正在处理的节点
  let curr = head;
  
  // 遍历链表直到末尾
  while (curr !== null) {
    // 步骤1：保存下一个节点的引用（因为即将断开）
    const next = curr.next;
    
    // 步骤2：反转指针 - 当前节点指向前一个节点
    curr.next = prev;
    
    // 步骤3：移动指针 - prev 和 curr 都向前移动一步
    prev = curr;  // prev 移动到当前节点
    curr = next;  // curr 移动到下一个节点
  }
  
  // 循环结束时，curr 为 null，prev 指向原链表的最后一个节点
  // 也就是反转后的头节点
  return prev;
}

// 辅助函数：创建链表
function createList(arr) {
  if (arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
  }
  return head;
}

// 辅助函数：打印链表
function printList(head) {
  const values = [];
  while (head !== null) {
    values.push(head.val);
    head = head.next;
  }
  console.log(values.join(' -> '));
}

// 测试
const list = createList([1, 2, 3, 4, 5]);
console.log('原链表：');
printList(list); // 1 -> 2 -> 3 -> 4 -> 5

const reversed = reverseList(list);
console.log('反转后：');
printList(reversed); // 5 -> 4 -> 3 -> 2 -> 1

// 边界测试
console.log('空链表：', reverseList(null)); // null
console.log('单节点：', reverseList(new ListNode(1))); // ListNode { val: 1, next: null }`,
      },
      {
        language: 'javascript',
        description: '解法二：递归法（代码简洁，但空间复杂度高）',
        code: `/**
 * 反转链表 - 递归法
 * 
 * 核心思想：
 * 1. 递归到链表末尾，找到新的头节点
 * 2. 在回溯过程中，逐个反转节点的指向
 * 
 * 递归过程图解（以 1 -> 2 -> 3 为例）：
 * 
 * 递（向下调用）：
 * reverseList(1) -> reverseList(2) -> reverseList(3) -> 返回 3
 * 
 * 归（向上返回）：
 * reverseList(3) 返回 3
 * reverseList(2) 中：
 *   head = 2
 *   newHead = 3
 *   执行：2.next.next = 2  =>  3 -> 2
 *   执行：2.next = null    =>  3 -> 2 -> null
 *   返回 3
 * reverseList(1) 中：
 *   head = 1
 *   newHead = 3
 *   执行：1.next.next = 1  =>  3 -> 2 -> 1
 *   执行：1.next = null    =>  3 -> 2 -> 1 -> null
 *   返回 3
 * 
 * @param {ListNode} head - 链表头节点
 * @return {ListNode} - 反转后的链表头节点
 */
function reverseListRecursive(head) {
  // 基线条件（Base Case）
  // 如果链表为空或只有一个节点，直接返回
  if (head === null || head.next === null) {
    return head;
  }
  
  // 递归反转剩余部分
  // newHead 是反转后的新头节点（原链表的最后一个节点）
  const newHead = reverseListRecursive(head.next);
  
  // 关键步骤：反转当前节点和下一个节点的指向
  // head.next 是当前节点的下一个节点
  // head.next.next = head 让下一个节点指向当前节点
  head.next.next = head;
  
  // 断开当前节点原来的指向，避免形成环
  head.next = null;
  
  // 返回新的头节点
  return newHead;
}

// 测试
function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}

const list = new ListNode(1, 
  new ListNode(2, 
    new ListNode(3, 
      new ListNode(4, 
        new ListNode(5)))));

const reversed = reverseListRecursive(list);
// 结果：5 -> 4 -> 3 -> 2 -> 1`,
      },
      {
        language: 'javascript',
        description: '解法三：头插法（使用虚拟头节点）',
        code: `/**
 * 反转链表 - 头插法
 * 
 * 核心思想：
 * 创建一个虚拟头节点，逐个将原链表的节点插入到虚拟头节点之后
 * 
 * 图解过程：
 * 原链表：1 -> 2 -> 3 -> 4 -> 5
 * 
 * 创建虚拟头节点：dummy -> null
 * 
 * 第一步：取出节点 1，插入 dummy 之后
 * dummy -> 1 -> null, 剩余：2 -> 3 -> 4 -> 5
 * 
 * 第二步：取出节点 2，插入 dummy 之后
 * dummy -> 2 -> 1 -> null, 剩余：3 -> 4 -> 5
 * 
 * 第三步：取出节点 3，插入 dummy 之后
 * dummy -> 3 -> 2 -> 1 -> null, 剩余：4 -> 5
 * 
 * ... 以此类推
 * 
 * 最终：dummy -> 5 -> 4 -> 3 -> 2 -> 1 -> null
 * 返回 dummy.next
 * 
 * @param {ListNode} head - 链表头节点
 * @return {ListNode} - 反转后的链表头节点
 */
function reverseListHeadInsert(head) {
  // 创建虚拟头节点，简化插入操作
  const dummy = new ListNode(0);
  let curr = head;
  
  while (curr !== null) {
    // 保存下一个节点的引用
    const next = curr.next;
    
    // 将 curr 插入到 dummy 之后
    curr.next = dummy.next;
    dummy.next = curr;
    
    // 移动到下一个节点
    curr = next;
  }
  
  // 返回虚拟头节点的下一个节点（真正的头节点）
  return dummy.next;
}

// 测试
function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}

const list = new ListNode(1, 
  new ListNode(2, 
    new ListNode(3)));

const reversed = reverseListHeadInsert(list);
// 结果：3 -> 2 -> 1`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  // 在这里编写你的代码
  
}

const solution = reverseList;`,
      testCases: [
        { input: { values: [1, 2, 3, 4, 5] }, expectedOutput: [5, 4, 3, 2, 1], description: '标准链表' },
        { input: { values: [1, 2] }, expectedOutput: [2, 1], description: '两个节点' },
        { input: { values: [] }, expectedOutput: [], description: '空链表' },
        { input: { values: [1] }, expectedOutput: [1], description: '单节点' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-02',
  },
  {
    id: 'algo-003',
    category: 'algorithm',
    questionType: 'coding',
    title: '有效的括号',
    difficulty: 'easy',
    tags: ['算法', '栈', '字符串'],
    question: '给定一个只包括 "("，")"，"{"，"}"，"["，"]" 的字符串 s，判断字符串是否有效。有效字符串需满足：左括号必须用相同类型的右括号闭合，左括号必须以正确的顺序闭合。',
    answer: `**题目分析：**
- 输入：只包含括号字符的字符串
- 输出：布尔值，表示括号是否有效
- 约束：字符串长度 [1, 10^4]，只包含括号字符

**解题思路：**

方法一：栈（推荐）
- 遇到左括号入栈，遇到右括号检查栈顶是否匹配
- 最后检查栈是否为空
- 时间复杂度 O(n)，空间复杂度 O(n)

方法二：栈 + 哈希表优化
- 使用哈希表存储括号映射关系
- 代码更简洁，可读性更好
- 时间复杂度 O(n)，空间复杂度 O(n)

方法三：字符串替换（不推荐）
- 不断替换成对的括号为空字符串
- 直到无法替换，检查结果是否为空
- 时间复杂度 O(n²)，效率较低

**算法步骤（栈）：**
1. 创建一个栈
2. 遍历字符串：
   - 遇到左括号，入栈
   - 遇到右括号，检查栈顶是否匹配
3. 最后检查栈是否为空

**复杂度分析：**
- 时间复杂度：O(n)，只需遍历一次字符串
- 空间复杂度：O(n)，最坏情况下栈存储 n/2 个左括号`,
    codeExamples: [
      {
        language: 'javascript',
        description: '解法一：栈（基础实现）',
        code: `/**
 * 有效的括号 - 栈解法
 * 
 * 核心思想：
 * 使用栈来匹配括号，后遇到的左括号要先匹配（后进先出）
 * 
 * 算法流程：
 * 1. 遇到左括号：入栈
 * 2. 遇到右括号：
 *    - 如果栈为空，说明没有匹配的左括号，返回 false
 *    - 如果栈顶元素不匹配，返回 false
 *    - 如果匹配，弹出栈顶元素
 * 3. 遍历结束后，栈应该为空
 * 
 * @param {string} s - 只包含括号的字符串
 * @return {boolean} - 是否有效
 */
function isValid(s) {
  // 使用数组模拟栈
  const stack = [];
  
  // 遍历字符串中的每个字符
  for (const char of s) {
    // 如果是左括号，入栈
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } 
    // 如果是右括号，检查是否匹配
    else if (char === ')') {
      // 栈为空或栈顶不是 '('，匹配失败
      if (stack.length === 0 || stack.pop() !== '(') {
        return false;
      }
    } 
    else if (char === '}') {
      if (stack.length === 0 || stack.pop() !== '{') {
        return false;
      }
    } 
    else if (char === ']') {
      if (stack.length === 0 || stack.pop() !== '[') {
        return false;
      }
    }
  }
  
  // 栈为空说明所有括号都匹配成功
  return stack.length === 0;
}

// 测试用例
console.log(isValid('()')); // true
console.log(isValid('()[]{}')); // true
console.log(isValid('(]')); // false
console.log(isValid('([)]')); // false - 顺序错误
console.log(isValid('{[]}')); // true - 嵌套正确
console.log(isValid('((')); // false - 未闭合
console.log(isValid(')(')); // false - 先右后左`,
      },
      {
        language: 'javascript',
        description: '解法二：栈 + 哈希表（推荐，代码更简洁）',
        code: `/**
 * 有效的括号 - 栈 + 哈希表
 * 
 * 优化思路：
 * 使用哈希表存储右括号到左括号的映射
 * 代码更简洁，可读性更好
 * 
 * @param {string} s - 只包含括号的字符串
 * @return {boolean} - 是否有效
 */
function isValid(s) {
  // 栈：存储未匹配的左括号
  const stack = [];
  
  // 哈希表：右括号 -> 对应的左括号
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  // 遍历字符串
  for (const char of s) {
    // 如果是左括号，入栈
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      // 是右括号，检查栈顶是否匹配
      // map[char] 获取对应的左括号
      if (stack.pop() !== map[char]) {
        return false;
      }
    }
  }
  
  // 栈为空说明全部匹配
  return stack.length === 0;
}

// 更简洁的写法
function isValidConcise(s) {
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };
  
  for (const char of s) {
    // 如果 char 在 pairs 中，说明是右括号
    if (char in pairs) {
      // 弹出栈顶，检查是否匹配
      // 如果栈为空，stack.pop() 返回 undefined，不等于任何左括号
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    } else {
      // 左括号，入栈
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}

// 测试用例
console.log(isValidConcise('()')); // true
console.log(isValidConcise('()[]{}')); // true
console.log(isValidConcise('(]')); // false
console.log(isValidConcise('([)]')); // false
console.log(isValidConcise('{[]}')); // true`,
      },
      {
        language: 'javascript',
        description: '解法三：字符串替换（不推荐，效率低）',
        code: `/**
 * 有效的括号 - 字符串替换法
 * 
 * 思路：
 * 不断将成对的括号替换为空字符串
 * 如果最终结果为空，说明括号有效
 * 
 * 缺点：
 * 1. 时间复杂度 O(n²)，每次替换都要遍历整个字符串
 * 2. 对于深层嵌套的情况效率很低
 * 
 * @param {string} s - 只包含括号的字符串
 * @return {boolean} - 是否有效
 */
function isValidReplace(s) {
  // 记录替换前的长度，用于判断是否还需要继续替换
  let prevLength = s.length;
  
  // 循环替换成对的括号
  while (true) {
    // 替换所有成对的括号
    s = s.replace('()', '')
         .replace('{}', '')
         .replace('[]', '');
    
    // 如果长度没有变化，说明无法继续替换
    if (s.length === prevLength) {
      break;
    }
    
    prevLength = s.length;
  }
  
  // 如果最终为空字符串，说明所有括号都匹配
  return s.length === 0;
}

// 测试
console.log(isValidReplace('()')); // true
console.log(isValidReplace('()[]{}')); // true
console.log(isValidReplace('(]')); // false
console.log(isValidReplace('{[]}')); // true`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // 在这里编写你的代码
  
}

const solution = isValid;`,
      testCases: [
        { input: '()', expectedOutput: true, description: '简单括号' },
        { input: '()[]{}', expectedOutput: true, description: '多种括号' },
        { input: '(]', expectedOutput: false, description: '不匹配' },
        { input: '([)]', expectedOutput: false, description: '顺序错误' },
        { input: '{[]}', expectedOutput: true, description: '嵌套括号' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-03',
  },
  {
    id: 'algo-004',
    category: 'algorithm',
    questionType: 'coding',
    title: '最大子数组和',
    difficulty: 'medium',
    tags: ['算法', '动态规划', '数组'],
    question: '给你一个整数数组 nums，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。',
    answer: `**题目分析：**
- 输入：整数数组 nums（可能包含负数）
- 输出：连续子数组的最大和
- 约束：子数组至少包含一个元素

**解题思路：**

方法一：动态规划（Kadane算法，推荐）
- 维护当前位置的最大子数组和
- 状态转移：dp[i] = max(nums[i], dp[i-1] + nums[i])
- 可以优化空间复杂度为 O(1)
- 时间复杂度 O(n)，空间复杂度 O(1)

方法二：分治法
- 将数组分成左右两部分，最大和可能在左边、右边或跨越中间
- 递归求解，合并结果
- 时间复杂度 O(n log n)，空间复杂度 O(log n)

方法三：前缀和
- 计算前缀和，维护最小前缀和
- 当前前缀和减去最小前缀和即为以当前位置结尾的最大子数组和
- 时间复杂度 O(n)，空间复杂度 O(1)

**算法步骤（Kadane算法）：**
1. 初始化 maxSum = nums[0], currentSum = nums[0]
2. 遍历数组（从第二个元素开始）：
   - currentSum = max(nums[i], currentSum + nums[i])
   - maxSum = max(maxSum, currentSum)
3. 返回 maxSum

**复杂度分析：**
- 时间复杂度：O(n)，只需遍历一次数组
- 空间复杂度：O(1)，只使用常数级别的额外空间`,
    codeExamples: [
      {
        language: 'javascript',
        description: '解法一：动态规划 - Kadane算法（推荐）',
        code: `/**
 * 最大子数组和 - Kadane算法（动态规划）
 * 
 * 核心思想：
 * 遍历数组，对于每个位置，决定是继续扩展当前子数组，还是从当前位置重新开始
 * 
 * 状态定义：
 * dp[i] = 以 nums[i] 结尾的最大子数组和
 * 
 * 状态转移：
 * dp[i] = max(nums[i], dp[i-1] + nums[i])
 * - 如果 dp[i-1] > 0，加上它会让和更大，所以继续扩展
 * - 如果 dp[i-1] <= 0，加上它会让和变小或不变，不如从 nums[i] 重新开始
 * 
 * 空间优化：
 * 由于 dp[i] 只依赖于 dp[i-1]，可以用一个变量代替数组
 * 
 * @param {number[]} nums - 整数数组
 * @return {number} - 最大子数组和
 */
function maxSubArray(nums) {
  // 边界条件
  if (nums.length === 0) return 0;
  
  // maxSum: 全局最大和
  let maxSum = nums[0];
  // currentSum: 以当前位置结尾的最大子数组和
  let currentSum = nums[0];
  
  // 从第二个元素开始遍历
  for (let i = 1; i < nums.length; i++) {
    // 核心状态转移方程
    // 选择：要么从当前元素重新开始，要么延续之前的子数组
    // 如果 currentSum > 0，说明之前的子数组有正贡献，可以继续
    // 如果 currentSum <= 0，说明之前的子数组没有正贡献，不如重新开始
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    
    // 更新全局最大值
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}

// 测试用例
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6，子数组 [4, -1, 2, 1]
console.log(maxSubArray([1])); // 1
console.log(maxSubArray([5, 4, -1, 7, 8])); // 23，整个数组
console.log(maxSubArray([-1, -2, -3])); // -1，所有元素都是负数时取最大的那个`,
      },
      {
        language: 'javascript',
        description: '解法一扩展：返回最大子数组的起止位置',
        code: `/**
 * 最大子数组和 - 返回起止位置
 * 
 * 在 Kadane 算法基础上，记录最大子数组的起止位置
 * 
 * @param {number[]} nums - 整数数组
 * @return {object} - 包含最大和、起始位置、结束位置
 */
function maxSubArrayWithIndex(nums) {
  if (nums.length === 0) return { maxSum: 0, start: -1, end: -1 };
  
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  // 记录位置
  let start = 0;      // 最大子数组的起始位置
  let end = 0;        // 最大子数组的结束位置
  let tempStart = 0;  // 当前子数组的起始位置
  
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > currentSum + nums[i]) {
      // 从当前位置重新开始
      currentSum = nums[i];
      tempStart = i;
    } else {
      // 继续扩展当前子数组
      currentSum += nums[i];
    }
    
    // 更新全局最大值和位置
    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }
  }
  
  return { maxSum, start, end };
}

// 测试
const result = maxSubArrayWithIndex([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
console.log(result); // { maxSum: 6, start: 3, end: 6 }
console.log('子数组:', [-2, 1, -3, 4, -1, 2, 1, -5, 4].slice(result.start, result.end + 1));
// 子数组: [4, -1, 2, 1]`,
      },
      {
        language: 'javascript',
        description: '解法二：分治法',
        code: `/**
 * 最大子数组和 - 分治法
 * 
 * 核心思想：
 * 将数组分成左右两部分，最大子数组和有三种情况：
 * 1. 完全在左半部分
 * 2. 完全在右半部分
 * 3. 跨越中点（左半部分的最大后缀 + 右半部分的最大前缀）
 * 
 * 时间复杂度：O(n log n)
 * 空间复杂度：O(log n) - 递归栈深度
 * 
 * @param {number[]} nums - 整数数组
 * @return {number} - 最大子数组和
 */
function maxSubArrayDivide(nums) {
  // 分治递归函数
  function divide(left, right) {
    // 基线条件：只有一个元素
    if (left === right) {
      return nums[left];
    }
    
    const mid = Math.floor((left + right) / 2);
    
    // 递归求解左右两部分的最大和
    const leftMax = divide(left, mid);
    const rightMax = divide(mid + 1, right);
    
    // 计算跨越中点的最大和
    // 左半部分的最大后缀和（从中点向左延伸）
    let leftSum = nums[mid];
    let leftMaxSum = nums[mid];
    for (let i = mid - 1; i >= left; i--) {
      leftSum += nums[i];
      leftMaxSum = Math.max(leftMaxSum, leftSum);
    }
    
    // 右半部分的最大前缀和（从中点向右延伸）
    let rightSum = nums[mid + 1];
    let rightMaxSum = nums[mid + 1];
    for (let i = mid + 2; i <= right; i++) {
      rightSum += nums[i];
      rightMaxSum = Math.max(rightMaxSum, rightSum);
    }
    
    // 跨越中点的最大和
    const crossMax = leftMaxSum + rightMaxSum;
    
    // 返回三种情况的最大值
    return Math.max(leftMax, rightMax, crossMax);
  }
  
  return divide(0, nums.length - 1);
}

// 测试
console.log(maxSubArrayDivide([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubArrayDivide([1])); // 1
console.log(maxSubArrayDivide([5, 4, -1, 7, 8])); // 23`,
      },
      {
        language: 'javascript',
        description: '解法三：前缀和法',
        code: `/**
 * 最大子数组和 - 前缀和法
 * 
 * 核心思想：
 * 子数组和 = 前缀和差值
 * 要使子数组和最大，需要：当前前缀和 - 最小前缀和 最大
 * 
 * 算法：
 * 1. 计算前缀和
 * 2. 维护最小前缀和
 * 3. 当前前缀和减去最小前缀和，即为以当前位置结尾的最大子数组和
 * 
 * @param {number[]} nums - 整数数组
 * @return {number} - 最大子数组和
 */
function maxSubArrayPrefix(nums) {
  if (nums.length === 0) return 0;
  
  let maxSum = nums[0];      // 最大子数组和
  let prefixSum = 0;          // 当前前缀和
  let minPrefixSum = 0;       // 最小前缀和（初始为0，表示空前缀）
  
  for (let i = 0; i < nums.length; i++) {
    prefixSum += nums[i];     // 更新前缀和
    
    // 当前前缀和减去最小前缀和，得到以当前位置结尾的最大子数组和
    // 注意：这里要先用 prefixSum - minPrefixSum，再更新 minPrefixSum
    maxSum = Math.max(maxSum, prefixSum - minPrefixSum);
    
    // 更新最小前缀和
    minPrefixSum = Math.min(minPrefixSum, prefixSum);
  }
  
  return maxSum;
}

// 测试
console.log(maxSubArrayPrefix([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubArrayPrefix([1])); // 1
console.log(maxSubArrayPrefix([5, 4, -1, 7, 8])); // 23`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // 在这里编写你的代码
  
}

const solution = maxSubArray;`,
      testCases: [
        { input: [-2, 1, -3, 4, -1, 2, 1, -5, 4], expectedOutput: 6, description: '标准用例' },
        { input: [1], expectedOutput: 1, description: '单元素' },
        { input: [5, 4, -1, 7, 8], expectedOutput: 23, description: '全正数' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-04',
  },
  {
    id: 'algo-005',
    category: 'algorithm',
    questionType: 'coding',
    title: '合并区间',
    difficulty: 'medium',
    tags: ['算法', '排序', '数组'],
    question: '以数组 intervals 表示若干个区间的集合，其中单个区间为 intervals[i] = [starti, endi]。请你合并所有重叠的区间，并返回一个不重叠的区间数组。',
    answer: `**题目分析：**
- 输入：区间数组，每个区间为 [start, end]
- 输出：合并后的不重叠区间数组
- 约束：区间可能无序，需要先排序

**解题思路：**

方法一：排序 + 合并（推荐）
- 先按区间起点排序
- 遍历区间，检查是否与上一个区间重叠
- 重叠则合并，不重叠则加入结果
- 时间复杂度 O(n log n)，空间复杂度 O(n)

方法二：排序 + 标记法
- 将所有起点和终点分别排序
- 遇到起点计数+1，遇到终点计数-1
- 计数从0变正时记录新区间起点，从正变0时记录终点
- 时间复杂度 O(n log n)，空间复杂度 O(n)

**算法步骤（排序合并）：**
1. 按区间起点排序
2. 初始化结果数组，放入第一个区间
3. 遍历剩余区间：
   - 如果当前区间与结果数组最后一个区间重叠，合并
   - 否则，将当前区间加入结果数组

**重叠判断：**
- 当前区间起点 <= 上一区间终点，则重叠
- 合并后的终点 = max(上一区间终点, 当前区间终点)

**复杂度分析：**
- 时间复杂度：O(n log n)，主要是排序
- 空间复杂度：O(n)，存储结果`,
    codeExamples: [
      {
        language: 'javascript',
        description: '解法一：排序 + 合并（推荐）',
        code: `/**
 * 合并区间 - 排序合并法
 * 
 * 核心思想：
 * 1. 先排序，保证区间按起点有序
 * 2. 遍历区间，检查是否与上一个区间重叠
 * 3. 重叠则合并，不重叠则作为新区间加入结果
 * 
 * 图解过程：
 * 输入：[[1,3], [2,6], [8,10], [15,18]]
 * 
 * 排序后：[[1,3], [2,6], [8,10], [15,18]]（已有序）
 * 
 * 处理过程：
 * - [1,3] 加入结果 -> [[1,3]]
 * - [2,6] 与 [1,3] 比较：2 <= 3，重叠！
 *   合并 -> [[1,6]]（终点取 max(3,6)=6）
 * - [8,10] 与 [1,6] 比较：8 > 6，不重叠
 *   加入结果 -> [[1,6], [8,10]]
 * - [15,18] 与 [8,10] 比较：15 > 10，不重叠
 *   加入结果 -> [[1,6], [8,10], [15,18]]
 * 
 * @param {number[][]} intervals - 区间数组
 * @return {number[][]} - 合并后的区间数组
 */
function merge(intervals) {
  // 边界条件：空数组或只有一个区间
  if (intervals.length <= 1) return intervals;
  
  // 按区间起点排序
  // 如果起点相同，按终点排序（可选优化）
  intervals.sort((a, b) => a[0] - b[0]);
  
  // 结果数组，初始放入第一个区间
  const result = [intervals[0]];
  
  // 遍历剩余区间
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    // 获取结果数组中最后一个区间
    const last = result[result.length - 1];
    
    // 检查是否重叠：当前区间起点 <= 上一区间终点
    if (current[0] <= last[1]) {
      // 重叠，合并区间
      // 更新终点为两个区间终点的最大值
      last[1] = Math.max(last[1], current[1]);
    } else {
      // 不重叠，将当前区间加入结果
      result.push(current);
    }
  }
  
  return result;
}

// 测试用例
console.log(merge([[1, 3], [2, 6], [8, 10], [15, 18]]));
// [[1, 6], [8, 10], [15, 18]]

console.log(merge([[1, 4], [4, 5]]));
// [[1, 5]] - 相邻区间合并

console.log(merge([[1, 4], [0, 4]]));
// [[0, 4]] - 包含关系

console.log(merge([[1, 4], [2, 3]]));
// [[1, 4]] - 完全包含

console.log(merge([[1, 4], [0, 0]]));
// [[0, 0], [1, 4]] - 不重叠`,
      },
      {
        language: 'javascript',
        description: '解法二：标记法（扫描线算法）',
        code: `/**
 * 合并区间 - 标记法（扫描线算法）
 * 
 * 核心思想：
 * 1. 将所有起点和终点分别标记
 * 2. 起点标记为 +1，终点标记为 -1
 * 3. 按位置排序后扫描
 * 4. 计数从 0 变正时，记录新区间的起点
 * 5. 计数从正变 0 时，记录区间终点
 * 
 * 图解：
 * 区间：[1,3], [2,6], [8,10]
 * 
 * 标记：
 * 位置:  1   2   3   6   8   10
 * 标记: +1  +1  -1  -1  +1  -1
 * 
 * 扫描：
 * 位置1: count=1 (0->1) -> 记录起点1
 * 位置2: count=2
 * 位置3: count=1
 * 位置6: count=0 (1->0) -> 记录终点6，区间[1,6]
 * 位置8: count=1 (0->1) -> 记录起点8
 * 位置10: count=0 (1->0) -> 记录终点10，区间[8,10]
 * 
 * @param {number[][]} intervals - 区间数组
 * @return {number[][]} - 合并后的区间数组
 */
function mergeSweepLine(intervals) {
  if (intervals.length <= 1) return intervals;
  
  // 创建标记数组
  const points = [];
  
  // 将每个区间的起点和终点分别标记
  for (const [start, end] of intervals) {
    points.push({ pos: start, delta: 1 });  // 起点标记 +1
    points.push({ pos: end, delta: -1 });   // 终点标记 -1
  }
  
  // 按位置排序，如果位置相同，起点在前（先加后减）
  points.sort((a, b) => {
    if (a.pos !== b.pos) return a.pos - b.pos;
    // 位置相同时，起点（+1）排在终点（-1）前面
    return b.delta - a.delta;
  });
  
  const result = [];
  let count = 0;  // 当前覆盖计数
  let start = null;  // 当前区间起点
  
  // 扫描所有点
  for (const point of points) {
    const prevCount = count;
    count += point.delta;
    
    // 从 0 变正：新区间开始
    if (prevCount === 0 && count > 0) {
      start = point.pos;
    }
    
    // 从正变 0：区间结束
    if (prevCount > 0 && count === 0) {
      result.push([start, point.pos]);
      start = null;
    }
  }
  
  return result;
}

// 测试
console.log(mergeSweepLine([[1, 3], [2, 6], [8, 10], [15, 18]]));
// [[1, 6], [8, 10], [15, 18]]`,
      },
      {
        language: 'javascript',
        description: '扩展：插入新区间',
        code: `/**
 * 插入区间 - 在已排序的不重叠区间中插入新区间
 * 
 * 这是合并区间的变体问题
 * 
 * @param {number[][]} intervals - 已排序的不重叠区间
 * @param {number[]} newInterval - 要插入的新区间
 * @return {number[][]} - 插入后的区间数组
 */
function insert(intervals, newInterval) {
  const result = [];
  let i = 0;
  const n = intervals.length;
  
  // 阶段1：将所有在新区间之前的区间加入结果
  while (i < n && intervals[i][1] < newInterval[0]) {
    result.push(intervals[i]);
    i++;
  }
  
  // 阶段2：合并所有与新区间重叠的区间
  // 更新新区间的起点和终点
  while (i < n && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
  }
  
  // 将合并后的新区间加入结果
  result.push(newInterval);
  
  // 阶段3：将剩余的区间加入结果
  while (i < n) {
    result.push(intervals[i]);
    i++;
  }
  
  return result;
}

// 测试
console.log(insert([[1, 3], [6, 9]], [2, 5]));
// [[1, 5], [6, 9]]

console.log(insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]));
// [[1, 2], [3, 10], [12, 16]]`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // 在这里编写你的代码
  
}

const solution = merge;`,
      testCases: [
        { input: [[1, 3], [2, 6], [8, 10], [15, 18]], expectedOutput: [[1, 6], [8, 10], [15, 18]], description: '标准用例' },
        { input: [[1, 4], [4, 5]], expectedOutput: [[1, 5]], description: '相邻区间' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-05',
  },
  {
    id: 'algo-006',
    category: 'algorithm',
    questionType: 'coding',
    title: '二叉树层序遍历',
    difficulty: 'medium',
    tags: ['算法', '树', 'BFS', '队列'],
    question: '给你二叉树的根节点 root，返回其节点值的层序遍历（即逐层地，从左到右访问所有节点）。',
    answer: `**题目分析：**
- 输入：二叉树根节点
- 输出：二维数组，每层节点值组成的数组
- 约束：按层遍历，从左到右

**解题思路：**

方法一：BFS（广度优先搜索，推荐）
- 使用队列实现层序遍历
- 每次处理一层的所有节点
- 时间复杂度 O(n)，空间复杂度 O(n)

方法二：DFS（深度优先搜索）
- 递归遍历，记录当前层级
- 将节点值添加到对应层级的数组中
- 时间复杂度 O(n)，空间复杂度 O(h)，h 为树高

方法三：BFS（单队列优化）
- 使用 null 或计数器标记层级结束
- 减少内层循环
- 时间复杂度 O(n)，空间复杂度 O(n)

**算法步骤（BFS）：**
1. 如果根节点为空，返回空数组
2. 创建队列，初始放入根节点
3. 当队列不为空时：
   - 获取当前层的节点数量
   - 遍历当前层所有节点，收集值
   - 将子节点加入队列
4. 返回结果

**复杂度分析：**
- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(n)，队列最多存储一层节点`,
    codeExamples: [
      {
        language: 'javascript',
        description: '解法一：BFS 队列（推荐，最直观）',
        code: `/**
 * 二叉树节点定义
 */
function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

/**
 * 二叉树层序遍历 - BFS 队列法
 * 
 * 核心思想：
 * 使用队列实现广度优先搜索，每次处理一层的所有节点
 * 
 * 图解过程：
 *      3
 *     / \\
 *    9  20
 *      /  \\
 *     15   7
 * 
 * 初始：queue = [3], result = []
 * 
 * 第一轮：
 * - levelSize = 1
 * - 取出 3，currentLevel = [3]
 * - 加入子节点 9, 20
 * - queue = [9, 20], result = [[3]]
 * 
 * 第二轮：
 * - levelSize = 2
 * - 取出 9, currentLevel = [3, 9]
 * - 取出 20, currentLevel = [3, 9, 20]
 * - 加入子节点 15, 7
 * - queue = [15, 7], result = [[3], [9, 20]]
 * 
 * 第三轮：
 * - levelSize = 2
 * - 取出 15, currentLevel = [15]
 * - 取出 7, currentLevel = [15, 7]
 * - 无子节点
 * - queue = [], result = [[3], [9, 20], [15, 7]]
 * 
 * @param {TreeNode} root - 二叉树根节点
 * @return {number[][]} - 层序遍历结果
 */
function levelOrder(root) {
  // 边界条件：空树
  if (!root) return [];
  
  // 结果数组
  const result = [];
  // 队列，初始放入根节点
  const queue = [root];
  
  // 当队列不为空时继续处理
  while (queue.length > 0) {
    // 获取当前层的节点数量
    // 这一步很关键，确保我们只处理当前层的节点
    const levelSize = queue.length;
    // 当前层的节点值数组
    const currentLevel = [];
    
    // 遍历当前层的所有节点
    for (let i = 0; i < levelSize; i++) {
      // 从队列头部取出节点
      const node = queue.shift();
      // 收集节点值
      currentLevel.push(node.val);
      
      // 将子节点加入队列尾部
      // 先左后右，保证从左到右的顺序
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    // 将当前层的结果加入总结果
    result.push(currentLevel);
  }
  
  return result;
}

// 测试
//      3
//     / \\
//    9  20
//      /  \\
//     15   7
const root = new TreeNode(3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);

console.log(levelOrder(root)); // [[3], [9, 20], [15, 7]]

// 边界测试
console.log(levelOrder(null)); // []
console.log(levelOrder(new TreeNode(1))); // [[1]]`,
      },
      {
        language: 'javascript',
        description: '解法二：DFS 递归',
        code: `/**
 * 二叉树层序遍历 - DFS 递归法
 * 
 * 核心思想：
 * 深度优先遍历，记录当前层级
 * 将节点值添加到对应层级的数组中
 * 
 * 注意：DFS 本身不是按层遍历，但可以通过记录层级来实现
 * 
 * @param {TreeNode} root - 二叉树根节点
 * @return {number[][]} - 层序遍历结果
 */
function levelOrderDFS(root) {
  // 结果数组
  const result = [];
  
  /**
   * DFS 辅助函数
   * @param {TreeNode} node - 当前节点
   * @param {number} level - 当前层级（从 0 开始）
   */
  function dfs(node, level) {
    // 递归终止条件
    if (!node) return;
    
    // 如果当前层级还没有对应的数组，创建一个
    if (result.length === level) {
      result.push([]);
    }
    
    // 将当前节点值添加到对应层级
    result[level].push(node.val);
    
    // 递归处理左右子树，层级 +1
    dfs(node.left, level + 1);
    dfs(node.right, level + 1);
  }
  
  // 从根节点开始，层级为 0
  dfs(root, 0);
  
  return result;
}

// 测试
function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

const root = new TreeNode(3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);

console.log(levelOrderDFS(root)); // [[3], [9, 20], [15, 7]]`,
      },
      {
        language: 'javascript',
        description: '扩展：锯齿形层序遍历',
        code: `/**
 * 二叉树锯齿形层序遍历
 * 
 * 要求：
 * - 第一层从左到右
 * - 第二层从右到左
 * - 第三层从左到右
 * - 以此类推...
 * 
 * 解法：在普通层序遍历基础上，根据层级决定是否反转
 * 
 * @param {TreeNode} root - 二叉树根节点
 * @return {number[][]} - 锯齿形层序遍历结果
 */
function zigzagLevelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  // 是否从左到右的标志
  let leftToRight = true;
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      
      if (leftToRight) {
        // 从左到右：正常添加
        currentLevel.push(node.val);
      } else {
        // 从右到左：添加到数组头部
        currentLevel.unshift(node.val);
      }
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
    // 切换方向
    leftToRight = !leftToRight;
  }
  
  return result;
}

// 测试
function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

//      3
//     / \\
//    9  20
//      /  \\
//     15   7
const root = new TreeNode(3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);

console.log(zigzagLevelOrder(root)); 
// [[3], [20, 9], [15, 7]]`,
      },
      {
        language: 'javascript',
        description: '扩展：二叉树右视图',
        code: `/**
 * 二叉树右视图
 * 
 * 要求：返回从右侧看二叉树能看到的节点值
 * 
 * 解法：层序遍历，每层最后一个节点就是右视图能看到的节点
 * 
 * @param {TreeNode} root - 二叉树根节点
 * @return {number[]} - 右视图节点值
 */
function rightSideView(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      
      // 如果是当前层的最后一个节点，加入结果
      if (i === levelSize - 1) {
        result.push(node.val);
      }
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return result;
}

// 测试
function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

//      1            <---
//    /   \\
//   2     3         <---
//    \\     \\
//     5     4       <---
const root = new TreeNode(1,
  new TreeNode(2, null, new TreeNode(5)),
  new TreeNode(3, null, new TreeNode(4))
);

console.log(rightSideView(root)); // [1, 3, 4]`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
function levelOrder(root) {
  // 在这里编写你的代码
  
}

const solution = levelOrder;`,
      testCases: [
        { input: { tree: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [[3], [9, 20], [15, 7]], description: '标准二叉树' },
        { input: { tree: [1] }, expectedOutput: [[1]], description: '单节点' },
        { input: { tree: [] }, expectedOutput: [], description: '空树' },
        { input: { tree: [1, 2, 3, 4, 5] }, expectedOutput: [[1], [2, 3], [4, 5]], description: '完全二叉树' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-06',
  },
  {
    id: 'algo-007',
    category: 'algorithm',
    questionType: 'coding',
    title: 'LRU 缓存',
    difficulty: 'medium',
    tags: ['算法', '哈希表', '双向链表', '设计'],
    question: '请你设计并实现一个满足 LRU (最近最少使用) 缓存约束的数据结构。实现 LRUCache 类：get(key) 和 put(key, value) 都要在 O(1) 时间复杂度内完成。',
    answer: `**题目分析：**
- 输入：容量 capacity，get/put 操作
- 输出：get 返回值，put 无返回
- 约束：get 和 put 都要 O(1) 时间复杂度

**解题思路：**

方法一：哈希表 + 双向链表（推荐）
- 哈希表：O(1) 查找节点
- 双向链表：O(1) 插入和删除
- 维护访问顺序：头部最新，尾部最旧
- 时间复杂度 O(1)，空间复杂度 O(capacity)

方法二：OrderedMap（JavaScript Map 保持插入顺序）
- 利用 Map 的有序特性
- 删除后重新插入实现移动到头部
- 时间复杂度 O(1)，空间复杂度 O(capacity)

**算法设计（哈希表 + 双向链表）：**
1. 哈希表存储 key -> Node 的映射
2. 双向链表维护访问顺序（头部最新，尾部最旧）
3. get 操作：查找节点，移动到头部
4. put 操作：
   - 存在：更新值，移动到头部
   - 不存在：创建节点，添加到头部，超出容量删除尾部

**复杂度分析：**
- 时间复杂度：get 和 put 都是 O(1)
- 空间复杂度：O(capacity)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '解法一：哈希表 + 双向链表（经典实现）',
        code: `/**
 * 双向链表节点
 * 
 * 为什么使用双向链表？
 * - 单向链表删除节点需要知道前驱节点，需要 O(n) 遍历
 * - 双向链表可以直接获取前驱节点，删除操作 O(1)
 */
class Node {
  constructor(key = 0, value = 0) {
    this.key = key;      // 存储 key，用于删除时从 map 中移除
    this.value = value;  // 存储值
    this.prev = null;    // 前驱节点
    this.next = null;    // 后继节点
  }
}

/**
 * LRU 缓存 - 哈希表 + 双向链表实现
 * 
 * 核心思想：
 * 1. 哈希表提供 O(1) 的查找能力
 * 2. 双向链表提供 O(1) 的插入和删除能力
 * 3. 链表头部表示最近使用，尾部表示最久未使用
 * 
 * 数据结构：
 * - map: { key -> Node } 快速查找
 * - 双向链表：维护访问顺序
 * 
 * 操作：
 * - get: 查找 -> 移动到头部
 * - put: 添加/更新 -> 移动到头部 -> 检查容量
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;  // 缓存容量
    this.map = new Map();      // 哈希表：key -> Node
    
    // 虚拟头尾节点（哨兵节点）
    // 好处：简化边界处理，不需要判断 null
    this.head = new Node();  // 虚拟头节点
    this.tail = new Node();  // 虚拟尾节点
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  
  /**
   * 获取值
   * 
   * 步骤：
   * 1. 从哈希表查找节点
   * 2. 如果存在，移动到头部（表示最近使用）
   * 3. 返回值
   * 
   * @param {number} key - 键
   * @return {number} - 值，不存在返回 -1
   */
  get(key) {
    if (!this.map.has(key)) return -1;
    
    const node = this.map.get(key);
    // 移动到头部（最近使用）
    this.moveToHead(node);
    return node.value;
  }
  
  /**
   * 设置值
   * 
   * 步骤：
   * 1. 如果 key 存在，更新值并移动到头部
   * 2. 如果 key 不存在：
   *    a. 创建新节点
   *    b. 添加到哈希表
   *    c. 添加到链表头部
   *    d. 检查容量，超出则删除尾部
   * 
   * @param {number} key - 键
   * @param {number} value - 值
   */
  put(key, value) {
    if (this.map.has(key)) {
      // key 存在，更新值并移动到头部
      const node = this.map.get(key);
      node.value = value;
      this.moveToHead(node);
    } else {
      // key 不存在，创建新节点
      const node = new Node(key, value);
      this.map.set(key, node);
      this.addToHead(node);
      
      // 检查容量
      if (this.map.size > this.capacity) {
        // 删除最久未使用的节点（尾部）
        const removed = this.removeTail();
        this.map.delete(removed.key);
      }
    }
  }
  
  // ========== 链表操作方法 ==========
  
  /**
   * 添加节点到头部
   * 
   * 图示：
   * head <-> tail
   * 变成：
   * head <-> node <-> tail
   */
  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  
  /**
   * 从链表中移除节点
   * 
   * 图示：
   * prev <-> node <-> next
   * 变成：
   * prev <-> next
   */
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  
  /**
   * 移动节点到头部
   * 
   * 步骤：
   * 1. 从原位置移除
   * 2. 添加到头部
   */
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  
  /**
   * 删除尾部节点（最久未使用）
   * 
   * @return {Node} - 被删除的节点
   */
  removeTail() {
    const node = this.tail.prev;  // 尾部前一个节点是真正的尾节点
    this.removeNode(node);
    return node;
  }
}

// 测试
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1)); // 1
cache.put(3, 3); // 淘汰 key=2
console.log(cache.get(2)); // -1
cache.put(4, 4); // 淘汰 key=1
console.log(cache.get(1)); // -1
console.log(cache.get(3)); // 3
console.log(cache.get(4)); // 4`,
      },
      {
        language: 'javascript',
        description: '解法二：JavaScript Map（简洁实现）',
        code: `/**
 * LRU 缓存 - JavaScript Map 实现
 * 
 * 原理：
 * JavaScript 的 Map 会保持键值对的插入顺序
 * 删除后重新插入，会将该项移到最后
 * 
 * 利用这个特性：
 * - 最新使用的项在 Map 的末尾
 * - 最久未使用的项在 Map 的开头
 * 
 * 注意：这种方法虽然简洁，但在某些 JS 引擎中可能有性能差异
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  /**
   * 获取值
   * 
   * 步骤：
   * 1. 如果不存在，返回 -1
   * 2. 如果存在，删除后重新插入（移到末尾）
   * 3. 返回值
   */
  get(key) {
    if (!this.cache.has(key)) return -1;
    
    // 删除后重新插入，移到末尾（表示最近使用）
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  /**
   * 设置值
   * 
   * 步骤：
   * 1. 如果存在，先删除
   * 2. 插入新值（在末尾）
   * 3. 如果超出容量，删除第一个（最久未使用）
   */
  put(key, value) {
    // 如果存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // 插入新值
    this.cache.set(key, value);
    
    // 检查容量
    if (this.cache.size > this.capacity) {
      // 删除第一个（最久未使用）
      // keys().next().value 获取第一个 key
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// 测试
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1)); // 1
cache.put(3, 3); // 淘汰 key=2
console.log(cache.get(2)); // -1
cache.put(4, 4); // 淘汰 key=1
console.log(cache.get(1)); // -1
console.log(cache.get(3)); // 3
console.log(cache.get(4)); // 4`,
      },
      {
        language: 'javascript',
        description: '扩展：LFU 缓存（最不经常使用）',
        code: `/**
 * LFU 缓存 - 最不经常使用
 * 
 * 区别于 LRU：
 * - LRU：最近最少使用，基于时间
 * - LFU：最不经常使用，基于频率
 * 
 * 当需要淘汰时，删除使用频率最低的
 * 如果有多个相同频率的，删除最久未使用的
 * 
 * 数据结构：
 * - keyMap: { key -> Node }
 * - freqMap: { freq -> DoubleLinkedList }
 * - minFreq: 当前最小频率
 */
class LFUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.size = 0;
    this.minFreq = 0;
    this.keyMap = new Map();  // key -> Node
    this.freqMap = new Map(); // freq -> DoubleLinkedList
  }
  
  get(key) {
    if (!this.keyMap.has(key)) return -1;
    
    const node = this.keyMap.get(key);
    this.updateFreq(node);
    return node.value;
  }
  
  put(key, value) {
    if (this.capacity === 0) return;
    
    if (this.keyMap.has(key)) {
      const node = this.keyMap.get(key);
      node.value = value;
      this.updateFreq(node);
    } else {
      if (this.size === this.capacity) {
        // 删除频率最低且最久未使用的
        const minList = this.freqMap.get(this.minFreq);
        const removed = minList.removeTail();
        this.keyMap.delete(removed.key);
        this.size--;
      }
      
      const node = new LFUNode(key, value);
      this.keyMap.set(key, node);
      this.addNodeToFreqList(node, 1);
      this.minFreq = 1;
      this.size++;
    }
  }
  
  updateFreq(node) {
    const oldFreq = node.freq;
    const oldList = this.freqMap.get(oldFreq);
    oldList.removeNode(node);
    
    // 如果旧频率列表为空且是最小频率，更新 minFreq
    if (oldList.isEmpty() && oldFreq === this.minFreq) {
      this.minFreq++;
    }
    
    node.freq++;
    this.addNodeToFreqList(node, node.freq);
  }
  
  addNodeToFreqList(node, freq) {
    if (!this.freqMap.has(freq)) {
      this.freqMap.set(freq, new DoubleLinkedList());
    }
    this.freqMap.get(freq).addToHead(node);
  }
}

class LFUNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.freq = 1;
    this.prev = null;
    this.next = null;
  }
}

class DoubleLinkedList {
  constructor() {
    this.head = new LFUNode();
    this.tail = new LFUNode();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  
  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  
  removeTail() {
    const node = this.tail.prev;
    this.removeNode(node);
    return node;
  }
  
  isEmpty() {
    return this.head.next === this.tail;
  }
}`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `class LRUCache {
  constructor(capacity) {
    // 在这里编写你的代码
    
  }
  
  get(key) {
    
  }
  
  put(key, value) {
    
  }
}

const solution = LRUCache;`,
      testCases: [
        { 
          input: { 
            capacity: 2,
            operations: [
              { type: 'put', key: 1, value: 1 },
              { type: 'put', key: 2, value: 2 },
              { type: 'get', key: 1 },
              { type: 'put', key: 3, value: 3 },
              { type: 'get', key: 2 },
              { type: 'put', key: 4, value: 4 },
              { type: 'get', key: 1 },
              { type: 'get', key: 3 },
              { type: 'get', key: 4 }
            ]
          }, 
          expectedOutput: [1, -1, -1, 3, 4], 
          description: '基本操作' 
        },
        { 
          input: { 
            capacity: 1,
            operations: [
              { type: 'put', key: 2, value: 1 },
              { type: 'get', key: 2 },
              { type: 'put', key: 3, value: 2 },
              { type: 'get', key: 2 },
              { type: 'get', key: 3 }
            ]
          }, 
          expectedOutput: [1, -1, 2], 
          description: '容量为1' 
        },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-07',
  },
  {
    id: 'algo-008',
    category: 'algorithm',
    questionType: 'coding',
    title: '最长递增子序列',
    difficulty: 'medium',
    tags: ['算法', '动态规划', '二分查找'],
    question: '给你一个整数数组 nums，找到其中最长严格递增子序列的长度。',
    answer: `**题目分析：**
- 输入：整数数组 nums
- 输出：最长严格递增子序列的长度
- 约束：子序列不要求连续，但要求严格递增

**解题思路：**

方法一：动态规划 O(n²)
- dp[i] 表示以 nums[i] 结尾的最长递增子序列长度
- dp[i] = max(dp[j] + 1) for all j < i where nums[j] < nums[i]
- 时间复杂度 O(n²)，空间复杂度 O(n)

方法二：二分查找 O(n log n)（推荐）
- 维护数组 tails，tails[i] 表示长度为 i+1 的递增子序列的最小末尾元素
- 对于每个元素，用二分查找找到它在 tails 中的位置
- 时间复杂度 O(n log n)，空间复杂度 O(n)

方法三：树状数组/线段树
- 将数值离散化后，用树状数组维护每个位置的最大长度
- 时间复杂度 O(n log n)，空间复杂度 O(n)

**算法步骤（动态规划）：**
1. 初始化 dp 数组，每个位置初始值为 1
2. 对于每个位置 i，遍历之前的所有位置 j
3. 如果 nums[j] < nums[i]，更新 dp[i] = max(dp[i], dp[j] + 1)
4. 返回 dp 数组的最大值

**复杂度分析：**
- 动态规划：时间 O(n²)，空间 O(n)
- 二分查找：时间 O(n log n)，空间 O(n)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '解法一：动态规划（容易理解）',
        code: `/**
 * 最长递增子序列 - 动态规划
 * 
 * 核心思想：
 * dp[i] = 以 nums[i] 结尾的最长递增子序列长度
 * 
 * 状态转移：
 * 对于每个 i，遍历所有 j < i
 * 如果 nums[j] < nums[i]，则 nums[i] 可以接在 nums[j] 后面
 * dp[i] = max(dp[i], dp[j] + 1)
 * 
 * 图解：
 * nums = [10, 9, 2, 5, 3, 7, 101, 18]
 * 
 * i=0: dp[0] = 1 (只有自己)
 * i=1: nums[1]=9 < nums[0]=10? 否，dp[1] = 1
 * i=2: nums[2]=2 < nums[0]=10? 是，dp[2] = max(1, dp[0]+1) = 2
 *      nums[2]=2 < nums[1]=9? 是，dp[2] = max(2, dp[1]+1) = 2
 *      但 2 < 10 且 2 < 9，所以 dp[2] = 1（没有更小的）
 * i=3: nums[3]=5 > nums[2]=2，dp[3] = dp[2]+1 = 2
 * ...
 * 
 * @param {number[]} nums - 整数数组
 * @return {number} - 最长递增子序列长度
 */
function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  
  // dp[i] = 以 nums[i] 结尾的最长递增子序列长度
  const dp = new Array(nums.length).fill(1);
  // 记录全局最大值
  let maxLen = 1;
  
  // 遍历每个位置
  for (let i = 1; i < nums.length; i++) {
    // 遍历 i 之前的所有位置
    for (let j = 0; j < i; j++) {
      // 如果 nums[j] < nums[i]，说明 nums[i] 可以接在 nums[j] 后面
      if (nums[j] < nums[i]) {
        // 更新 dp[i]
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    // 更新全局最大值
    maxLen = Math.max(maxLen, dp[i]);
  }
  
  return maxLen;
}

// 测试
console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3])); // 4
console.log(lengthOfLIS([7, 7, 7, 7, 7, 7, 7])); // 1`,
      },
      {
        language: 'javascript',
        description: '解法二：二分查找优化（推荐）',
        code: `/**
 * 最长递增子序列 - 二分查找优化
 * 
 * 核心思想：
 * 维护一个数组 tails，其中 tails[i] 表示长度为 i+1 的递增子序列的最小末尾元素
 * 
 * 关键洞察：
 * 1. tails 数组一定是严格递增的
 * 2. 对于新元素 num，用二分查找找到第一个 >= num 的位置
 * 3. 如果 num 比所有元素都大，则可以扩展最长子序列
 * 4. 否则，替换找到位置的元素（保持更小的末尾元素）
 * 
 * 为什么这样做？
 * - 末尾元素越小，后面能接的元素就越多
 * - 所以我们要尽可能让末尾元素变小
 * 
 * 图解：
 * nums = [10, 9, 2, 5, 3, 7, 101, 18]
 * 
 * 处理过程：
 * num=10: tails=[] -> tails=[10]
 * num=9:  9 < 10, 替换 -> tails=[9]
 * num=2:  2 < 9, 替换 -> tails=[2]
 * num=5:  5 > 2, 追加 -> tails=[2, 5]
 * num=3:  3 < 5, 替换 -> tails=[2, 3]
 * num=7:  7 > 3, 追加 -> tails=[2, 3, 7]
 * num=101: 101 > 7, 追加 -> tails=[2, 3, 7, 101]
 * num=18: 18 < 101, 替换 -> tails=[2, 3, 7, 18]
 * 
 * 最终 tails 长度为 4，即最长递增子序列长度
 * 注意：tails 不一定是实际的最长递增子序列，只是长度相同
 * 
 * @param {number[]} nums - 整数数组
 * @return {number} - 最长递增子序列长度
 */
function lengthOfLISBinary(nums) {
  // tails[i] = 长度为 i+1 的递增子序列的最小末尾元素
  const tails = [];
  
  for (const num of nums) {
    // 二分查找：找到第一个 >= num 的位置
    let left = 0;
    let right = tails.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    // left 就是 num 应该在的位置
    if (left === tails.length) {
      // num 比所有元素都大，可以扩展最长子序列
      tails.push(num);
    } else {
      // 替换，保持更小的末尾元素
      tails[left] = num;
    }
  }
  
  return tails.length;
}

// 使用 JavaScript 内置二分查找（更简洁）
function lengthOfLISBinarySimple(nums) {
  const tails = [];
  
  for (const num of nums) {
    // 二分查找第一个 >= num 的位置
    let left = 0, right = tails.length;
    while (left < right) {
      const mid = (left + right) >> 1;  // 位运算除以 2
      if (tails[mid] < num) left = mid + 1;
      else right = mid;
    }
    
    // 如果 left === tails.length，说明 num 比所有元素都大
    if (left === tails.length) tails.push(num);
    else tails[left] = num;
  }
  
  return tails.length;
}

// 测试
console.log(lengthOfLISBinary([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLISBinary([0, 1, 0, 3, 2, 3])); // 4
console.log(lengthOfLISBinary([7, 7, 7, 7, 7, 7, 7])); // 1`,
      },
      {
        language: 'javascript',
        description: '扩展：输出最长递增子序列本身',
        code: `/**
 * 输出最长递增子序列本身
 * 
 * 需要额外记录每个元素的前驱位置
 * 
 * @param {number[]} nums - 整数数组
 * @return {number[]} - 最长递增子序列
 */
function getLIS(nums) {
  if (nums.length === 0) return [];
  
  const n = nums.length;
  const dp = new Array(n).fill(1);
  const prev = new Array(n).fill(-1);  // 记录前驱位置
  
  let maxLen = 1;
  let maxIndex = 0;
  
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        prev[i] = j;  // 记录前驱
      }
    }
    
    if (dp[i] > maxLen) {
      maxLen = dp[i];
      maxIndex = i;
    }
  }
  
  // 回溯构造最长递增子序列
  const result = [];
  let index = maxIndex;
  while (index !== -1) {
    result.unshift(nums[index]);
    index = prev[index];
  }
  
  return result;
}

// 测试
console.log(getLIS([10, 9, 2, 5, 3, 7, 101, 18])); // [2, 3, 7, 18] 或 [2, 5, 7, 101]
console.log(getLIS([0, 1, 0, 3, 2, 3])); // [0, 1, 2, 3]`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function lengthOfLIS(nums) {
  // 在这里编写你的代码
  
}

const solution = lengthOfLIS;`,
      testCases: [
        { input: [10, 9, 2, 5, 3, 7, 101, 18], expectedOutput: 4, description: '标准用例' },
        { input: [0, 1, 0, 3, 2, 3], expectedOutput: 4, description: '重复元素' },
        { input: [7, 7, 7, 7, 7, 7, 7], expectedOutput: 1, description: '全部相同' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-08',
  },
  {
    id: 'algo-009',
    category: 'algorithm',
    questionType: 'coding',
    title: '接雨水',
    difficulty: 'hard',
    tags: ['算法', '双指针', '栈', '动态规划'],
    question: '给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。',
    answer: `**解题思路：**

方法一：双指针
- 左右两个指针向中间移动
- 记录左右两边的最大高度
- 较低的一边决定当前位置能接多少水

方法二：动态规划
- 预处理每个位置左右两边的最大高度
- 每个位置能接的水 = min(左边最大, 右边最大) - 当前高度

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：双指针 O(1)，动态规划 O(n)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '双指针解法',
        code: `/**
 * 接雨水 - 双指针
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  if (height.length === 0) return 0;
  
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;
  
  while (left < right) {
    if (height[left] < height[right]) {
      // 左边较低，处理左边
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      // 右边较低，处理右边
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }
  
  return water;
}

// 测试
console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5])); // 9`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // 在这里编写你的代码
  
}

const solution = trap;`,
      testCases: [
        { input: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], expectedOutput: 6, description: '标准用例' },
        { input: [4, 2, 0, 3, 2, 5], expectedOutput: 9, description: '凹槽' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-09',
  },
  {
    id: 'algo-010',
    category: 'algorithm',
    questionType: 'coding',
    title: '最小覆盖子串',
    difficulty: 'hard',
    tags: ['算法', '滑动窗口', '哈希表'],
    question: '给你一个字符串 s、一个字符串 t。返回 s 中涵盖 t 所有字符（包括重复字符）的最小子串。如果不存在，返回空字符串。',
    answer: `**解题思路：**

使用滑动窗口，维护一个窗口使其包含 t 的所有字符，然后尝试缩小窗口。

**算法步骤：**
1. 使用哈希表记录 t 中字符的计数
2. 左右指针扩展窗口
3. 当窗口包含所有字符时，尝试收缩左边界
4. 记录最小窗口

**复杂度分析：**
- 时间复杂度：O(|s| + |t|)
- 空间复杂度：O(|s| + |t|)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '滑动窗口解法',
        code: `/**
 * 最小覆盖子串
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
  if (s.length < t.length) return '';
  
  // 统计 t 中字符
  const need = new Map();
  for (const char of t) {
    need.set(char, (need.get(char) || 0) + 1);
  }
  
  let left = 0, right = 0;
  let valid = 0; // 满足条件的字符数
  let start = 0, len = Infinity;
  
  const window = new Map();
  
  while (right < s.length) {
    // 扩展窗口
    const char = s[right];
    right++;
    
    if (need.has(char)) {
      window.set(char, (window.get(char) || 0) + 1);
      if (window.get(char) === need.get(char)) {
        valid++;
      }
    }
    
    // 收缩窗口
    while (valid === need.size) {
      // 更新最小窗口
      if (right - left < len) {
        start = left;
        len = right - left;
      }
      
      const leftChar = s[left];
      left++;
      
      if (need.has(leftChar)) {
        if (window.get(leftChar) === need.get(leftChar)) {
          valid--;
        }
        window.set(leftChar, window.get(leftChar) - 1);
      }
    }
  }
  
  return len === Infinity ? '' : s.substring(start, start + len);
}

// 测试
console.log(minWindow('ADOBECODEBANC', 'ABC')); // 'BANC'
console.log(minWindow('a', 'a')); // 'a'
console.log(minWindow('a', 'aa')); // ''`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
  // 在这里编写你的代码
  
}

const solution = minWindow;`,
      testCases: [
        { input: { s: 'ADOBECODEBANC', t: 'ABC' }, expectedOutput: 'BANC', description: '标准用例' },
        { input: { s: 'a', t: 'a' }, expectedOutput: 'a', description: '单字符' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-10',
  },
  {
    id: 'algo-011',
    category: 'algorithm',
    questionType: 'coding',
    title: '编辑距离',
    difficulty: 'hard',
    tags: ['算法', '动态规划', '字符串'],
    question: '给你两个单词 word1 和 word2，请返回将 word1 转换成 word2 所使用的最少操作数。你可以对一个单词进行插入、删除、替换操作。',
    answer: `**解题思路：**

使用动态规划，dp[i][j] 表示 word1[0..i-1] 转换为 word2[0..j-1] 的最小操作数。

**状态转移：**
- 如果 word1[i-1] === word2[j-1]：dp[i][j] = dp[i-1][j-1]
- 否则：dp[i][j] = min(
    dp[i-1][j] + 1,    // 删除
    dp[i][j-1] + 1,    // 插入
    dp[i-1][j-1] + 1   // 替换
  )

**复杂度分析：**
- 时间复杂度：O(mn)
- 空间复杂度：O(mn)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '动态规划解法',
        code: `/**
 * 编辑距离
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  
  // dp[i][j] = word1[0..i-1] 转换为 word2[0..j-1] 的最小操作数
  const dp = Array.from({ length: m + 1 }, () => 
    new Array(n + 1).fill(0)
  );
  
  // 初始化：空字符串转换
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 删除
          dp[i][j - 1] + 1,     // 插入
          dp[i - 1][j - 1] + 1  // 替换
        );
      }
    }
  }
  
  return dp[m][n];
}

// 测试
console.log(minDistance('horse', 'ros')); // 3
console.log(minDistance('intention', 'execution')); // 5`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
function minDistance(word1, word2) {
  // 在这里编写你的代码
  
}

const solution = minDistance;`,
      testCases: [
        { input: { word1: 'horse', word2: 'ros' }, expectedOutput: 3, description: '标准用例' },
        { input: { word1: 'intention', word2: 'execution' }, expectedOutput: 5, description: '复杂用例' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-11',
  },
  {
    id: 'algo-012',
    category: 'algorithm',
    questionType: 'coding',
    title: '全排列',
    difficulty: 'medium',
    tags: ['算法', '回溯', '递归'],
    question: '给定一个不含重复数字的数组 nums，返回其所有可能的全排列。你可以按任意顺序返回答案。',
    answer: `**解题思路：**

使用回溯算法，依次选择每个数字作为排列的第一个元素，然后递归处理剩余元素。

**算法步骤：**
1. 维护一个路径数组 path
2. 维护一个已使用标记数组 used
3. 递归选择下一个数字
4. 回溯时撤销选择

**复杂度分析：**
- 时间复杂度：O(n * n!)
- 空间复杂度：O(n)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '回溯解法',
        code: `/**
 * 全排列
 * @param {number[]} nums
 * @return {number[][]}
 */
function permute(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  
  function backtrack() {
    // 终止条件：路径长度等于数组长度
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      // 跳过已使用的元素
      if (used[i]) continue;
      
      // 选择
      path.push(nums[i]);
      used[i] = true;
      
      // 递归
      backtrack();
      
      // 撤销选择（回溯）
      path.pop();
      used[i] = false;
    }
  }
  
  backtrack();
  return result;
}

// 测试
console.log(permute([1, 2, 3]));
// [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]

console.log(permute([0, 1]));
// [[0,1], [1,0]]`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permute(nums) {
  // 在这里编写你的代码
  
}

const solution = permute;`,
      testCases: [
        { input: [1, 2, 3], expectedOutput: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], description: '标准用例' },
        { input: [0, 1], expectedOutput: [[0, 1], [1, 0]], description: '两个元素' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-12',
  },
  {
    id: 'algo-013',
    category: 'algorithm',
    questionType: 'coding',
    title: '二分查找变体',
    difficulty: 'medium',
    tags: ['算法', '二分查找', '搜索'],
    question: '给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。请实现时间复杂度为 O(log n) 的算法。',
    answer: `**解题思路：**

使用二分查找，找到第一个大于等于目标值的位置。

**算法步骤：**
1. 初始化 left = 0, right = nums.length
2. 当 left < right 时：
   - mid = left + (right - left) / 2
   - 如果 nums[mid] >= target，right = mid
   - 否则 left = mid + 1
3. 返回 left

**复杂度分析：**
- 时间复杂度：O(log n)
- 空间复杂度：O(1)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '二分查找解法',
        code: `/**
 * 搜索插入位置
 * @param {number[]} nums - 排序数组
 * @param {number} target - 目标值
 * @return {number} - 索引或插入位置
 */
function searchInsert(nums, target) {
  let left = 0, right = nums.length;
  
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    
    if (nums[mid] >= target) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  
  return left;
}

/**
 * 查找第一个等于目标值的位置
 */
function findFirst(nums, target) {
  let left = 0, right = nums.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    
    if (nums[mid] === target) {
      result = mid;
      right = mid - 1; // 继续向左查找
    } else if (nums[mid] > target) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  
  return result;
}

/**
 * 查找最后一个等于目标值的位置
 */
function findLast(nums, target) {
  let left = 0, right = nums.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    
    if (nums[mid] === target) {
      result = mid;
      left = mid + 1; // 继续向右查找
    } else if (nums[mid] > target) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  
  return result;
}

// 测试
console.log(searchInsert([1, 3, 5, 6], 5)); // 2
console.log(searchInsert([1, 3, 5, 6], 2)); // 1
console.log(searchInsert([1, 3, 5, 6], 7)); // 4`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchInsert(nums, target) {
  // 在这里编写你的代码
  
}

const solution = searchInsert;`,
      testCases: [
        { input: { nums: [1, 3, 5, 6], target: 5 }, expectedOutput: 2, description: '存在目标值' },
        { input: { nums: [1, 3, 5, 6], target: 2 }, expectedOutput: 1, description: '插入中间' },
        { input: { nums: [1, 3, 5, 6], target: 7 }, expectedOutput: 4, description: '插入末尾' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-13',
  },
  {
    id: 'algo-014',
    category: 'algorithm',
    questionType: 'coding',
    title: '字符串解码',
    difficulty: 'medium',
    tags: ['算法', '栈', '字符串'],
    question: '给定一个经过编码的字符串，返回它解码后的字符串。编码规则为: k[encoded_string]，表示其中方括号内部的 encoded_string 正好重复 k 次。注意 k 保证为正整数。',
    answer: `**解题思路：**

使用两个栈，一个存储数字，一个存储字符串。遇到 '[' 时将当前字符串入栈，遇到 ']' 时出栈并拼接。

**算法步骤：**
1. 遍历字符串
2. 遇到数字：解析完整数字
3. 遇到 '['：将当前字符串和数字入栈
4. 遇到 ']'：出栈，拼接字符串
5. 遇到字母：追加到当前字符串

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：O(n)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '栈解法',
        code: `/**
 * 字符串解码
 * @param {string} s
 * @return {string}
 */
function decodeString(s) {
  const numStack = [];  // 数字栈
  const strStack = [];  // 字符串栈
  let currentStr = '';
  let currentNum = 0;
  
  for (const char of s) {
    if (char >= '0' && char <= '9') {
      // 解析数字
      currentNum = currentNum * 10 + parseInt(char);
    } else if (char === '[') {
      // 入栈
      numStack.push(currentNum);
      strStack.push(currentStr);
      currentNum = 0;
      currentStr = '';
    } else if (char === ']') {
      // 出栈并拼接
      const repeatTimes = numStack.pop();
      const prevStr = strStack.pop();
      currentStr = prevStr + currentStr.repeat(repeatTimes);
    } else {
      // 字母
      currentStr += char;
    }
  }
  
  return currentStr;
}

// 测试
console.log(decodeString('3[a]2[bc]')); // 'aaabcbc'
console.log(decodeString('3[a2[c]]')); // 'accaccacc'
console.log(decodeString('2[abc]3[cd]ef')); // 'abcabccdcdcdef'`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {string} s
 * @return {string}
 */
function decodeString(s) {
  // 在这里编写你的代码
  
}

const solution = decodeString;`,
      testCases: [
        { input: '3[a]2[bc]', expectedOutput: 'aaabcbc', description: '基本用例' },
        { input: '3[a2[c]]', expectedOutput: 'accaccacc', description: '嵌套' },
        { input: '2[abc]3[cd]ef', expectedOutput: 'abcabccdcdcdef', description: '混合' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-14',
  },
  {
    id: 'algo-015',
    category: 'algorithm',
    questionType: 'coding',
    title: '无重复字符的最长子串',
    difficulty: 'medium',
    tags: ['算法', '滑动窗口', '哈希表'],
    question: '给定一个字符串 s，请你找出其中不含有重复字符的最长子串的长度。',
    answer: `**解题思路：**

使用滑动窗口，维护一个不重复的字符窗口，用哈希集合记录窗口内的字符。

**算法步骤：**
1. 使用双指针 left, right 表示窗口
2. 遍历字符串，扩展右边界
3. 如果字符重复，收缩左边界直到无重复
4. 记录最大窗口长度

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：O(min(m, n))，m 为字符集大小`,
    codeExamples: [
      {
        language: 'javascript',
        description: '滑动窗口解法',
        code: `/**
 * 无重复字符的最长子串
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  const charSet = new Set();
  let left = 0;
  let maxLen = 0;
  
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    
    // 如果字符重复，收缩左边界
    while (charSet.has(char)) {
      charSet.delete(s[left]);
      left++;
    }
    
    // 添加当前字符
    charSet.add(char);
    
    // 更新最大长度
    maxLen = Math.max(maxLen, right - left + 1);
  }
  
  return maxLen;
}

// 测试
console.log(lengthOfLongestSubstring('abcabcbb')); // 3
console.log(lengthOfLongestSubstring('bbbbb')); // 1
console.log(lengthOfLongestSubstring('pwwkew')); // 3`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // 在这里编写你的代码
  
}

const solution = lengthOfLongestSubstring;`,
      testCases: [
        { input: 'abcabcbb', expectedOutput: 3, description: '标准用例' },
        { input: 'bbbbb', expectedOutput: 1, description: '全部相同' },
        { input: 'pwwkew', expectedOutput: 3, description: '中间重复' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-15',
  },
  {
    id: 'algo-016',
    category: 'algorithm',
    questionType: 'coding',
    title: '三数之和',
    difficulty: 'medium',
    tags: ['算法', '双指针', '数组'],
    question: '给你一个整数数组 nums，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k，同时还满足 nums[i] + nums[j] + nums[k] == 0。请你返回所有和为 0 且不重复的三元组。',
    answer: `**解题思路：**

先排序，然后固定一个数，用双指针找另外两个数。

**算法步骤：**
1. 数组排序
2. 遍历数组，固定第一个数 nums[i]
3. 使用双指针 left, right 在 [i+1, n-1] 范围内找两数
4. 跳过重复元素避免重复结果

**复杂度分析：**
- 时间复杂度：O(n²)
- 空间复杂度：O(1)（不考虑输出）`,
    codeExamples: [
      {
        language: 'javascript',
        description: '双指针解法',
        code: `/**
 * 三数之和
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  const result = [];
  nums.sort((a, b) => a - b);
  
  for (let i = 0; i < nums.length - 2; i++) {
    // 跳过重复元素
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    
    // 如果最小的数大于 0，不可能有解
    if (nums[i] > 0) break;
    
    let left = i + 1;
    let right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        
        // 跳过重复元素
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  return result;
}

// 测试
console.log(threeSum([-1, 0, 1, 2, -1, -4]));
// [[-1, -1, 2], [-1, 0, 1]]

console.log(threeSum([0, 0, 0]));
// [[0, 0, 0]]`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // 在这里编写你的代码
  
}

const solution = threeSum;`,
      testCases: [
        { input: [-1, 0, 1, 2, -1, -4], expectedOutput: [[-1, -1, 2], [-1, 0, 1]], description: '标准用例' },
        { input: [0, 0, 0], expectedOutput: [[0, 0, 0]], description: '全零' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-16',
  },
  // ==================== 数组类题目 ====================
  {
    id: 'algo-017',
    category: 'algorithm',
    questionType: 'coding',
    title: '合并两个有序数组',
    difficulty: 'easy',
    tags: ['算法', '数组', '双指针'],
    question: '给你两个按非递减顺序排列的整数数组 nums1 和 nums2，另有两个整数 m 和 n，分别表示 nums1 和 nums2 中的元素数目。请你合并 nums2 到 nums1 中，使合并后的数组同样按非递减顺序排列。注意：最终合并后的数组不应由函数返回，而是存储在数组 nums1 中。',
    answer: `**解题思路：**

从后向前填充，避免额外的空间开销。

**算法步骤：**
1. 使用三个指针：i 指向 nums1 的末尾元素，j 指向 nums2 的末尾元素，k 指向合并后的末尾
2. 从后向前比较，将较大的元素放入 nums1 的末尾
3. 如果 nums2 还有剩余元素，继续填充

**复杂度分析：**
- 时间复杂度：O(m + n)
- 空间复杂度：O(1)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '从后向前填充',
        code: `/**
 * 合并两个有序数组
 * @param {number[]} nums1 - 第一个数组，有足够空间
 * @param {number} m - nums1 的元素数量
 * @param {number[]} nums2 - 第二个数组
 * @param {number} n - nums2 的元素数量
 * @return {void}
 */
function merge(nums1, m, nums2, n) {
  let i = m - 1;  // nums1 的最后一个元素
  let j = n - 1;  // nums2 的最后一个元素
  let k = m + n - 1;  // 合并后的最后一个位置
  
  // 从后向前填充
  while (i >= 0 && j >= 0) {
    if (nums1[i] > nums2[j]) {
      nums1[k--] = nums1[i--];
    } else {
      nums1[k--] = nums2[j--];
    }
  }
  
  // 如果 nums2 还有剩余，继续填充
  while (j >= 0) {
    nums1[k--] = nums2[j--];
  }
  
  // nums1 剩余的元素已经在正确位置，无需处理
}

// 测试
const nums1 = [1, 2, 3, 0, 0, 0];
merge(nums1, 3, [2, 5, 6], 3);
console.log(nums1); // [1, 2, 2, 3, 5, 6]

const nums2 = [1];
merge(nums2, 1, [], 0);
console.log(nums2); // [1]`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1, m, nums2, n) {
  // 在这里编写你的代码
  
}

const solution = merge;`,
      testCases: [
        { input: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 }, expectedOutput: [1, 2, 2, 3, 5, 6], description: '标准用例' },
        { input: { nums1: [1], m: 1, nums2: [], n: 0 }, expectedOutput: [1], description: 'nums2 为空' },
        { input: { nums1: [0], m: 0, nums2: [1], n: 1 }, expectedOutput: [1], description: 'nums1 为空' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-17',
  },
  {
    id: 'algo-018',
    category: 'algorithm',
    questionType: 'coding',
    title: '买卖股票的最佳时机',
    difficulty: 'easy',
    tags: ['算法', '数组', '动态规划'],
    question: '给定一个数组 prices，它的第 i 个元素 prices[i] 是一支给定股票第 i 天的价格。如果你最多只允许完成一笔交易（即买入和卖出一只股票一次），设计一个算法来计算你所能获取的最大利润。',
    answer: `**解题思路：**

遍历数组，记录最低价格，同时计算最大利润。

**算法步骤：**
1. 初始化最低价格为第一天的价格
2. 遍历数组，更新最低价格和最大利润
3. 最大利润 = max(当前价格 - 最低价格)

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：O(1)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '一次遍历',
        code: `/**
 * 买卖股票的最佳时机
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  if (prices.length < 2) return 0;
  
  let minPrice = prices[0];
  let maxProfit = 0;
  
  for (let i = 1; i < prices.length; i++) {
    // 更新最低价格
    minPrice = Math.min(minPrice, prices[i]);
    // 更新最大利润
    maxProfit = Math.max(maxProfit, prices[i] - minPrice);
  }
  
  return maxProfit;
}

// 测试
console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
console.log(maxProfit([7, 6, 4, 3, 1])); // 0
console.log(maxProfit([1, 2])); // 1`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // 在这里编写你的代码
  
}

const solution = maxProfit;`,
      testCases: [
        { input: [7, 1, 5, 3, 6, 4], expectedOutput: 5, description: '标准用例' },
        { input: [7, 6, 4, 3, 1], expectedOutput: 0, description: '价格递减' },
        { input: [1, 2], expectedOutput: 1, description: '两天' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-18',
  },
  // ==================== 链表类题目 ====================
  {
    id: 'algo-019',
    category: 'algorithm',
    questionType: 'coding',
    title: '合并两个有序链表',
    difficulty: 'easy',
    tags: ['算法', '链表', '递归'],
    question: '将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。',
    answer: `**解题思路：**

方法一：迭代法，使用虚拟头节点简化操作
方法二：递归法，比较两个节点值，递归处理剩余部分

**算法步骤（迭代）：**
1. 创建虚拟头节点
2. 比较两个链表的当前节点，将较小的接入结果链表
3. 处理剩余节点

**复杂度分析：**
- 时间复杂度：O(n + m)
- 空间复杂度：迭代 O(1)，递归 O(n + m)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '迭代解法',
        code: `/**
 * 链表节点定义
 */
function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}

/**
 * 合并两个有序链表 - 迭代法
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
  // 虚拟头节点
  const dummy = new ListNode(-1);
  let current = dummy;
  
  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }
  
  // 处理剩余节点
  current.next = list1 !== null ? list1 : list2;
  
  return dummy.next;
}

/**
 * 合并两个有序链表 - 递归法
 */
function mergeTwoListsRecursive(list1, list2) {
  if (list1 === null) return list2;
  if (list2 === null) return list1;
  
  if (list1.val <= list2.val) {
    list1.next = mergeTwoListsRecursive(list1.next, list2);
    return list1;
  } else {
    list2.next = mergeTwoListsRecursive(list1, list2.next);
    return list2;
  }
}

// 测试
// list1: 1 -> 2 -> 4
// list2: 1 -> 3 -> 4
// 结果: 1 -> 1 -> 2 -> 3 -> 4 -> 4`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}

/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
  // 在这里编写你的代码
  
}

const solution = mergeTwoLists;`,
      testCases: [
        { input: { list1: [1, 2, 4], list2: [1, 3, 4] }, expectedOutput: [1, 1, 2, 3, 4, 4], description: '标准用例' },
        { input: { list1: [], list2: [] }, expectedOutput: [], description: '两个空链表' },
        { input: { list1: [], list2: [0] }, expectedOutput: [0], description: '一个空链表' },
        { input: { list1: [1, 3, 5], list2: [2, 4, 6] }, expectedOutput: [1, 2, 3, 4, 5, 6], description: '交替链表' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-19',
  },
  {
    id: 'algo-020',
    category: 'algorithm',
    questionType: 'coding',
    title: '环形链表检测',
    difficulty: 'easy',
    tags: ['算法', '链表', '双指针'],
    question: '给你一个链表的头节点 head，判断链表中是否有环。如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。',
    answer: `**解题思路：**

使用快慢指针（Floyd 判圈算法）。

**算法步骤：**
1. 慢指针每次走一步，快指针每次走两步
2. 如果有环，快慢指针一定会相遇
3. 如果快指针到达末尾，说明无环

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：O(1)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '快慢指针',
        code: `/**
 * 链表节点定义
 */
function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}

/**
 * 环形链表检测
 * @param {ListNode} head
 * @return {boolean}
 */
function hasCycle(head) {
  if (head === null || head.next === null) {
    return false;
  }
  
  let slow = head;
  let fast = head;
  
  while (fast !== null && fast.next !== null) {
    slow = slow.next;        // 慢指针走一步
    fast = fast.next.next;   // 快指针走两步
    
    // 相遇说明有环
    if (slow === fast) {
      return true;
    }
  }
  
  return false;
}

/**
 * 找到环的入口节点
 * @param {ListNode} head
 * @return {ListNode}
 */
function detectCycle(head) {
  if (head === null || head.next === null) {
    return null;
  }
  
  let slow = head;
  let fast = head;
  let hasCycle = false;
  
  // 第一次相遇
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      hasCycle = true;
      break;
    }
  }
  
  if (!hasCycle) return null;
  
  // 找入口：一个从头开始，一个从相遇点开始
  slow = head;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }
  
  return slow;
}

// 测试
// 3 -> 2 -> 0 -> -4
//      ^         |
//      |_________|
const node1 = new ListNode(3);
const node2 = new ListNode(2);
const node3 = new ListNode(0);
const node4 = new ListNode(-4);
node1.next = node2;
node2.next = node3;
node3.next = node4;
node4.next = node2; // 形成环

console.log(hasCycle(node1)); // true`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}

/**
 * @param {ListNode} head
 * @return {boolean}
 */
function hasCycle(head) {
  // 在这里编写你的代码
  
}

const solution = hasCycle;`,
      testCases: [
        { input: { values: [3, 2, 0, -4], pos: 1 }, expectedOutput: true, description: '有环链表' },
        { input: { values: [1, 2], pos: 0 }, expectedOutput: true, description: '首尾相连' },
        { input: { values: [1], pos: -1 }, expectedOutput: false, description: '单节点无环' },
        { input: { values: [1, 2, 3, 4, 5], pos: -1 }, expectedOutput: false, description: '无环链表' },
        { input: { values: [], pos: -1 }, expectedOutput: false, description: '空链表' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-20',
  },
  // ==================== 树类题目 ====================
  {
    id: 'algo-021',
    category: 'algorithm',
    questionType: 'coding',
    title: '二叉树的前中后序遍历',
    difficulty: 'easy',
    tags: ['算法', '树', '递归', '栈'],
    question: '给定一个二叉树的根节点 root，返回它的前序、中序、后序遍历结果。',
    answer: `**解题思路：**

前序遍历：根 -> 左 -> 右
中序遍历：左 -> 根 -> 右
后序遍历：左 -> 右 -> 根

**算法步骤：**
1. 递归实现：按照遍历顺序递归访问节点
2. 迭代实现：使用栈模拟递归过程

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：O(n)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '递归和迭代实现',
        code: `/**
 * 二叉树节点定义
 */
function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

/**
 * 前序遍历 - 递归
 */
function preorderTraversal(root) {
  const result = [];
  
  function traverse(node) {
    if (node === null) return;
    result.push(node.val);      // 根
    traverse(node.left);         // 左
    traverse(node.right);        // 右
  }
  
  traverse(root);
  return result;
}

/**
 * 前序遍历 - 迭代
 */
function preorderTraversalIterative(root) {
  const result = [];
  const stack = [];
  
  if (root !== null) {
    stack.push(root);
  }
  
  while (stack.length > 0) {
    const node = stack.pop();
    result.push(node.val);
    
    // 先右后左，保证左子树先处理
    if (node.right !== null) stack.push(node.right);
    if (node.left !== null) stack.push(node.left);
  }
  
  return result;
}

/**
 * 中序遍历 - 递归
 */
function inorderTraversal(root) {
  const result = [];
  
  function traverse(node) {
    if (node === null) return;
    traverse(node.left);         // 左
    result.push(node.val);      // 根
    traverse(node.right);        // 右
  }
  
  traverse(root);
  return result;
}

/**
 * 中序遍历 - 迭代
 */
function inorderTraversalIterative(root) {
  const result = [];
  const stack = [];
  let current = root;
  
  while (current !== null || stack.length > 0) {
    // 一直向左走
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }
    
    // 弹出并访问
    current = stack.pop();
    result.push(current.val);
    
    // 转向右子树
    current = current.right;
  }
  
  return result;
}

/**
 * 后序遍历 - 递归
 */
function postorderTraversal(root) {
  const result = [];
  
  function traverse(node) {
    if (node === null) return;
    traverse(node.left);         // 左
    traverse(node.right);        // 右
    result.push(node.val);      // 根
  }
  
  traverse(root);
  return result;
}

/**
 * 后序遍历 - 迭代
 */
function postorderTraversalIterative(root) {
  const result = [];
  const stack = [];
  
  if (root !== null) {
    stack.push(root);
  }
  
  while (stack.length > 0) {
    const node = stack.pop();
    result.unshift(node.val);  // 头部插入
    
    // 先左后右
    if (node.left !== null) stack.push(node.left);
    if (node.right !== null) stack.push(node.right);
  }
  
  return result;
}

// 测试
//     1
//    / \\
//   2   3
//  / \\
// 4   5
const root = new TreeNode(1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3)
);

console.log(preorderTraversal(root)); // [1, 2, 4, 5, 3]
console.log(inorderTraversal(root));  // [4, 2, 5, 1, 3]
console.log(postorderTraversal(root)); // [4, 5, 2, 3, 1]`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

/**
 * 前序遍历
 * @param {TreeNode} root
 * @return {number[]}
 */
function preorderTraversal(root) {
  // 在这里编写你的代码
  
}

const solution = preorderTraversal;`,
      testCases: [
        { input: { tree: [1, 2, 3, 4, 5] }, expectedOutput: [1, 2, 4, 5, 3], description: '前序遍历' },
        { input: { tree: [] }, expectedOutput: [], description: '空树' },
        { input: { tree: [1] }, expectedOutput: [1], description: '单节点' },
        { input: { tree: [1, null, 2, 3] }, expectedOutput: [1, 2, 3], description: '右子树' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-21',
  },
  {
    id: 'algo-022',
    category: 'algorithm',
    questionType: 'coding',
    title: '二叉树的最大深度',
    difficulty: 'easy',
    tags: ['算法', '树', '递归', 'DFS'],
    question: '给定一个二叉树 root，返回其最大深度。二叉树的最大深度是指从根节点到最远叶子节点的最长路径上的节点数。',
    answer: `**解题思路：**

方法一：递归（DFS）
- 最大深度 = max(左子树深度, 右子树深度) + 1

方法二：迭代（BFS）
- 层序遍历，记录层数

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：递归 O(h)，迭代 O(w)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '递归和迭代实现',
        code: `/**
 * 二叉树节点定义
 */
function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

/**
 * 最大深度 - 递归（DFS）
 * @param {TreeNode} root
 * @return {number}
 */
function maxDepth(root) {
  if (root === null) return 0;
  
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  
  return Math.max(leftDepth, rightDepth) + 1;
}

/**
 * 最大深度 - 迭代（BFS）
 */
function maxDepthBFS(root) {
  if (root === null) return 0;
  
  const queue = [root];
  let depth = 0;
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      if (node.left !== null) queue.push(node.left);
      if (node.right !== null) queue.push(node.right);
    }
    
    depth++;
  }
  
  return depth;
}

/**
 * 最小深度
 */
function minDepth(root) {
  if (root === null) return 0;
  
  // 叶子节点
  if (root.left === null && root.right === null) {
    return 1;
  }
  
  // 只有一个子节点
  if (root.left === null) {
    return minDepth(root.right) + 1;
  }
  if (root.right === null) {
    return minDepth(root.left) + 1;
  }
  
  // 两个子节点
  return Math.min(minDepth(root.left), minDepth(root.right)) + 1;
}

// 测试
//     3
//    / \\
//   9  20
//     /  \\
//    15   7
const root = new TreeNode(3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);

console.log(maxDepth(root)); // 3
console.log(minDepth(root)); // 2`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

/**
 * @param {TreeNode} root
 * @return {number}
 */
function maxDepth(root) {
  // 在这里编写你的代码
  
}

const solution = maxDepth;`,
      testCases: [
        { input: { tree: [3, 9, 20, null, null, 15, 7] }, expectedOutput: 3, description: '标准二叉树' },
        { input: { tree: [] }, expectedOutput: 0, description: '空树' },
        { input: { tree: [1] }, expectedOutput: 1, description: '单节点' },
        { input: { tree: [1, 2, 3, 4, null, null, 5] }, expectedOutput: 3, description: '不平衡树' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-22',
  },
  {
    id: 'algo-023',
    category: 'algorithm',
    questionType: 'coding',
    title: '验证二叉搜索树',
    difficulty: 'medium',
    tags: ['算法', '树', '递归', 'BST'],
    question: '给你一个二叉树的根节点 root，判断其是否是一个有效的二叉搜索树。二叉搜索树定义：左子树只包含小于当前节点的数，右子树只包含大于当前节点的数，并且所有左子树和右子树自身必须也是二叉搜索树。',
    answer: `**解题思路：**

方法一：递归验证，传递上下界
方法二：中序遍历，检查是否严格递增

**算法步骤（递归）：**
1. 每个节点必须在一个范围内 (min, max)
2. 左子树的上界是当前节点值
3. 右子树的下界是当前节点值

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：O(h)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '递归和中序遍历',
        code: `/**
 * 二叉树节点定义
 */
function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

/**
 * 验证二叉搜索树 - 递归
 * @param {TreeNode} root
 * @return {boolean}
 */
function isValidBST(root) {
  function validate(node, min, max) {
    if (node === null) return true;
    
    // 检查当前节点是否在范围内
    if (min !== null && node.val <= min) return false;
    if (max !== null && node.val >= max) return false;
    
    // 递归验证左右子树
    return validate(node.left, min, node.val) && 
           validate(node.right, node.val, max);
  }
  
  return validate(root, null, null);
}

/**
 * 验证二叉搜索树 - 中序遍历
 */
function isValidBSTInorder(root) {
  const stack = [];
  let current = root;
  let prev = null;
  
  while (current !== null || stack.length > 0) {
    // 一直向左走
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }
    
    current = stack.pop();
    
    // 检查是否严格递增
    if (prev !== null && current.val <= prev) {
      return false;
    }
    prev = current.val;
    
    current = current.right;
  }
  
  return true;
}

// 测试
//     5
//    / \\
//   1   4
//      / \\
//     3   6
const root1 = new TreeNode(5,
  new TreeNode(1),
  new TreeNode(4, new TreeNode(3), new TreeNode(6))
);
console.log(isValidBST(root1)); // false (3 小于 5)

//     2
//    / \\
//   1   3
const root2 = new TreeNode(2,
  new TreeNode(1),
  new TreeNode(3)
);
console.log(isValidBST(root2)); // true`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isValidBST(root) {
  // 在这里编写你的代码
  
}

const solution = isValidBST;`,
      testCases: [
        { input: { tree: [5, 1, 4, null, null, 3, 6] }, expectedOutput: false, description: '非BST' },
        { input: { tree: [2, 1, 3] }, expectedOutput: true, description: '有效BST' },
        { input: { tree: [] }, expectedOutput: true, description: '空树' },
        { input: { tree: [1] }, expectedOutput: true, description: '单节点' },
        { input: { tree: [10, 5, 15, null, null, 6, 20] }, expectedOutput: false, description: '右子树违反规则' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-23',
  },
  // ==================== 动态规划题目 ====================
  {
    id: 'algo-024',
    category: 'algorithm',
    questionType: 'coding',
    title: '爬楼梯',
    difficulty: 'easy',
    tags: ['算法', '动态规划', '递归'],
    question: '假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶？',
    answer: `**解题思路：**

这是一个经典的动态规划问题，本质是斐波那契数列。

**状态转移方程：**
dp[n] = dp[n-1] + dp[n-2]

**算法步骤：**
1. dp[1] = 1, dp[2] = 2
2. dp[i] = dp[i-1] + dp[i-2]

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：O(1)（优化后）`,
    codeExamples: [
      {
        language: 'javascript',
        description: '动态规划实现',
        code: `/**
 * 爬楼梯 - 动态规划
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  if (n <= 2) return n;
  
  let prev1 = 1;  // dp[i-2]
  let prev2 = 2;  // dp[i-1]
  
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev1 = prev2;
    prev2 = current;
  }
  
  return prev2;
}

/**
 * 爬楼梯 - 递归 + 记忆化
 */
function climbStairsMemo(n, memo = {}) {
  if (n <= 2) return n;
  if (memo[n]) return memo[n];
  
  memo[n] = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  return memo[n];
}

/**
 * 爬楼梯 - 矩阵快速幂（O(log n)）
 */
function climbStairsMatrix(n) {
  if (n <= 2) return n;
  
  function matrixMultiply(a, b) {
    return [
      [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
      [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]]
    ];
  }
  
  function matrixPow(mat, power) {
    let result = [[1, 0], [0, 1]]; // 单位矩阵
    while (power > 0) {
      if (power % 2 === 1) {
        result = matrixMultiply(result, mat);
      }
      mat = matrixMultiply(mat, mat);
      power = Math.floor(power / 2);
    }
    return result;
  }
  
  const mat = [[1, 1], [1, 0]];
  const result = matrixPow(mat, n);
  return result[0][0];
}

// 测试
console.log(climbStairs(2)); // 2
console.log(climbStairs(3)); // 3
console.log(climbStairs(5)); // 8`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // 在这里编写你的代码
  
}

const solution = climbStairs;`,
      testCases: [
        { input: 2, expectedOutput: 2, description: '2阶楼梯' },
        { input: 3, expectedOutput: 3, description: '3阶楼梯' },
        { input: 5, expectedOutput: 8, description: '5阶楼梯' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-24',
  },
  {
    id: 'algo-025',
    category: 'algorithm',
    questionType: 'coding',
    title: '零钱兑换',
    difficulty: 'medium',
    tags: ['算法', '动态规划', '完全背包'],
    question: '给你一个整数数组 coins，表示不同面额的硬币；以及一个整数 amount，表示总金额。计算并返回可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 -1。',
    answer: `**解题思路：**

这是一个完全背包问题，使用动态规划。

**状态转移方程：**
dp[i] = min(dp[i], dp[i - coin] + 1)

**算法步骤：**
1. 初始化 dp 数组，dp[0] = 0，其余为无穷大
2. 遍历每个金额，尝试每种硬币
3. 返回 dp[amount]

**复杂度分析：**
- 时间复杂度：O(amount * n)
- 空间复杂度：O(amount)`,
    codeExamples: [
      {
        language: 'javascript',
        description: '动态规划解法',
        code: `/**
 * 零钱兑换
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // dp[i] 表示凑成金额 i 所需的最少硬币数
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}

/**
 * 零钱兑换 - BFS 解法
 */
function coinChangeBFS(coins, amount) {
  if (amount === 0) return 0;
  
  const queue = [0];
  const visited = new Set([0]);
  let steps = 0;
  
  while (queue.length > 0) {
    const size = queue.length;
    steps++;
    
    for (let i = 0; i < size; i++) {
      const current = queue.shift();
      
      for (const coin of coins) {
        const next = current + coin;
        
        if (next === amount) {
          return steps;
        }
        
        if (next < amount && !visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
  }
  
  return -1;
}

// 测试
console.log(coinChange([1, 2, 5], 11)); // 3 (5+5+1)
console.log(coinChange([2], 3)); // -1
console.log(coinChange([1], 0)); // 0`,
      },
    ],
    codingConfig: {
      language: 'javascript',
      starterCode: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // 在这里编写你的代码
  
}

const solution = coinChange;`,
      testCases: [
        { input: { coins: [1, 2, 5], amount: 11 }, expectedOutput: 3, description: '标准用例' },
        { input: { coins: [2], amount: 3 }, expectedOutput: -1, description: '无法组成' },
        { input: { coins: [1], amount: 0 }, expectedOutput: 0, description: '金额为0' },
      ],
      timeLimit: 1000,
    },
    createdAt: '2024-01-25',
  },
];
