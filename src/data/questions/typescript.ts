import { Question } from '../../types/question';

export const typescriptQuestions: Question[] = [
  {
    id: 'ts-001',
    category: 'typescript',
    questionType: 'theory',
    title: 'TypeScript 类型推断机制',
    difficulty: 'easy',
    tags: ['TypeScript', '类型系统', '类型推断'],
    question: '请解释 TypeScript 的类型推断机制，并说明以下代码中变量的类型是如何推断的？什么情况下需要显式类型注解？',
    answer: `**TypeScript 类型推断机制：**

TypeScript 编译器会在没有显式类型注解时自动推断变量的类型，这是 TypeScript 的核心特性之一。

**类型推断的四种情况：**

1. **变量初始化推断**
   - 根据初始值推断类型
   - \`let x = 10\` 推断为 number
   - \`let arr = [1, 2, 3]\` 推断为 number[]

2. **最佳通用类型推断**
   - 从多个候选类型中推断出最合适的类型
   - \`let arr = [1, 'hello', true]\` 推断为 (number | string | boolean)[]
   - 当候选类型有公共基类时，会推断为基类

3. **上下文类型推断**
   - 根据使用位置推断类型
   - 事件处理函数的参数类型
   - 回调函数的参数类型

4. **返回值类型推断**
   - 根据函数体内的 return 语句推断返回值类型

**需要显式类型注解的情况：**
1. 函数参数（必须注解，无法推断）
2. 函数返回值（提高可读性，避免意外）
3. 复杂对象结构（接口定义更清晰）
4. 联合类型或交叉类型（推断可能不准确）
5. 泛型约束（需要明确约束条件）
6. 当推断结果不符合预期时`,
    codeExamples: [
      {
        language: 'typescript',
        description: '类型推断示例',
        code: `// ==================== 1. 变量初始化推断 ====================

// 基本类型推断
let x = 10;              // 推断为 number
let str = 'hello';       // 推断为 string
let bool = true;         // 推断为 boolean
let nothing = null;      // 推断为 any（严格模式下为 null）
let notDefined = undefined; // 推断为 any（严格模式下为 undefined）

// 数组推断
let arr = [1, 2, 3];     // 推断为 number[]
let mixed = [1, 'hello', true]; // 推断为 (number | string | boolean)[]

// 对象推断
let obj = { a: 1, b: 2 }; // 推断为 { a: number; b: number }

// ==================== 2. 最佳通用类型推断 ====================

// 当数组元素类型不同时，推断为联合类型数组
let mixedArray = [1, 'hello', true];
// 等价于: let mixedArray: (number | string | boolean)[]

// 类继承的情况
class Animal { name: string = ''; }
class Dog extends Animal { breed: string = ''; }
class Cat extends Animal { meow: () => void = () => {}; }

// 推断为 Animal[]（最佳通用类型）
let pets = [new Dog(), new Cat()]; // Animal[]

// ==================== 3. 上下文类型推断 ====================

// 事件处理函数 - event 类型自动推断
window.addEventListener('click', (event) => {
  // event 自动推断为 MouseEvent
  console.log(event.clientX, event.clientY);
});

// 数组方法回调 - 参数类型自动推断
const numbers = [1, 2, 3, 4, 5];
numbers.forEach((num) => {
  // num 自动推断为 number
  console.log(num.toFixed(2));
});

// Promise 回调
Promise.resolve('hello').then((value) => {
  // value 自动推断为 string
  console.log(value.toUpperCase());
});

// ==================== 4. 返回值类型推断 ====================

// 根据返回值推断
function add(a: number, b: number) {
  return a + b; // 返回值推断为 number
}

// 多个返回值，推断为联合类型
function getValue(flag: boolean) {
  if (flag) {
    return 42; // number
  }
  return 'default'; // string
}
// 返回值推断为 number | string

// ==================== 5. 需要显式注解的情况 ====================

// 函数参数必须注解
function greet(name: string): string {
  return \`Hello, \${name}\`;
}

// 复杂对象类型 - 使用接口更清晰
interface User {
  id: number;
  name: string;
  email?: string; // 可选属性
  readonly createdAt: Date; // 只读属性
}

const user: User = {
  id: 1,
  name: 'Alice',
  createdAt: new Date()
};

// 联合类型 - 推断可能不准确
let id: number | string = 123;
id = 'abc'; // OK

// 字面量类型 - 需要显式指定
let direction: 'left' | 'right' = 'left';
// direction = 'up'; // Error`,
      },
      {
        language: 'typescript',
        description: '类型断言与类型守卫',
        code: `// ==================== 类型断言 ====================

/**
 * 类型断言：告诉编译器"我知道这个类型"
 * 两种语法：as 语法（推荐）和尖括号语法
 */

// 1. as 语法（推荐，JSX 兼容）
let someValue: unknown = 'hello world';
let strLength: number = (someValue as string).length;

// 2. 尖括号语法（JSX 中不兼容）
let someValue2: unknown = 'hello world';
let strLength2: number = (<string>someValue2).length;

// 3. 非空断言 (!)
// 告诉编译器值一定不为 null 或 undefined
function processValue(value: string | null) {
  // 使用 ! 断言 value 不为 null
  console.log(value!.toUpperCase());
}

// 4. 双重断言（危险，避免使用）
let value: unknown = 'hello';
// 不推荐：绕过了类型检查
let num = value as unknown as number;

// 5. const 断言
// 将类型推断为更具体的字面量类型
const arr = [1, 2, 3] as const;
// readonly [1, 2, 3] - 只读元组

const obj = { name: 'Alice' } as const;
// { readonly name: 'Alice' } - 只读对象

// ==================== 类型守卫 ====================

/**
 * 类型守卫：在运行时检查类型，在编译时确定类型范围
 */

// 1. typeof 类型守卫
function process(value: string | number) {
  if (typeof value === 'string') {
    // 这里 value 被窄化为 string
    console.log(value.toUpperCase());
  } else {
    // 这里 value 被窄化为 number
    console.log(value.toFixed(2));
  }
}

// 2. instanceof 类型守卫
class Dog { bark() { console.log('Woof!'); } }
class Cat { meow() { console.log('Meow!'); } }

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// 3. in 操作符类型守卫
interface Bird { fly(): void; layEggs(): void; }
interface Fish { swim(): void; layEggs(): void; }

function move(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly();
  } else {
    animal.swim();
  }
}

// 4. 自定义类型守卫（is 关键字）
interface User {
  id: number;
  name: string;
}

function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string'
  );
}

function processUser(data: unknown) {
  if (isUser(data)) {
    // data 被窄化为 User 类型
    console.log(data.name);
  }
}

// 5. 可辨识联合（Discriminated Unions）
type Shape = 
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rectangle'; width: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    case 'rectangle':
      return shape.width * shape.height;
  }
}`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Type Inference',
      'TypeScript Deep Dive',
    ],
    createdAt: '2024-01-15',
  },
  {
    id: 'ts-002',
    category: 'typescript',
    questionType: 'theory',
    title: 'interface 和 type 的区别',
    difficulty: 'easy',
    tags: ['TypeScript', 'interface', 'type', '类型别名'],
    question: '请解释 TypeScript 中 interface 和 type 的区别？在什么情况下应该使用哪一个？',
    answer: `**interface 和 type 的主要区别：**

1. **扩展方式不同**
   - interface 使用 extends 继承
   - type 使用交叉类型 &

2. **声明合并**
   - interface 支持同名合并（声明合并）
   - type 不支持同名重复声明

3. **类型能力**
   - type 可以表示联合类型、元组、映射类型等
   - interface 只能描述对象类型

4. **implements**
   - 两者都可以被类实现
   - interface 更符合传统 OOP 概念

**使用建议：**
- 优先使用 interface（可扩展、可合并、更符合 OOP）
- 需要联合类型、元组、映射类型时使用 type
- React Props/State 推荐使用 type
- 需要声明合并时使用 interface`,
    codeExamples: [
      {
        language: 'typescript',
        description: 'interface 与 type 对比',
        code: `// ==================== interface ====================

/**
 * 接口定义
 * - 描述对象的形状
 * - 可以扩展和实现
 * - 支持声明合并
 */

// 1. 基本定义
interface User {
  id: number;
  name: string;
}

// 2. 接口扩展 - 使用 extends
interface Admin extends User {
  role: string;
  permissions: string[];
}

const admin: Admin = {
  id: 1,
  name: 'Alice',
  role: 'admin',
  permissions: ['read', 'write']
};

// 3. 声明合并（同名接口会自动合并）
interface User {
  email: string;
}

interface User {
  age: number;
}

// User 现在有 id, name, email, age 四个属性
const user: User = {
  id: 1,
  name: 'Bob',
  email: 'bob@example.com',
  age: 25
};

// 4. 可索引签名
interface StringArray {
  [index: number]: string;
}

const arr: StringArray = ['a', 'b', 'c'];

// 5. 函数类型
interface SearchFunc {
  (source: string, subString: string): boolean;
}

const search: SearchFunc = (src, sub) => src.includes(sub);

// ==================== type ====================

/**
 * 类型别名
 * - 可以表示任何类型
 * - 更灵活，支持联合类型、元组等
 * - 不支持声明合并
 */

// 1. 基本定义
type User2 = {
  id: number;
  name: string;
};

// 2. 类型扩展 - 使用交叉类型 &
type Admin2 = User2 & {
  type: 'admin';
  permissions: string[];
};

// 3. 联合类型（type 独有能力）
type ID = number | string;
type Status = 'pending' | 'active' | 'inactive';

// 4. 元组类型（type 独有能力）
type Point = [x: number, y: number];
type ThreeDPoint = [x: number, y: number, z: number];

const point: Point = [1, 2];

// 5. 映射类型（type 独有能力）
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 6. 条件类型（type 独有能力）
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// ==================== 使用场景对比 ====================

// 场景1：定义对象类型 - 推荐使用 interface
interface Product {
  id: string;
  name: string;
  price: number;
}

// 场景2：定义联合类型 - 必须使用 type
type Role = 'admin' | 'user' | 'guest';
type Result = Success | Error;

// 场景3：定义元组 - 必须使用 type
type Coordinate = [latitude: number, longitude: number];

// 场景4：需要声明合并 - 必须使用 interface
// 例如扩展第三方库的类型
interface Window {
  customProperty: string;
}

// 场景5：React Props - 推荐使用 type
type Props = {
  title: string;
  onClick: () => void;
};`,
      },
      {
        language: 'typescript',
        description: '实际应用示例',
        code: `// ==================== 类实现 ====================

// interface 可以被类实现
interface Serializable {
  serialize(): string;
}

interface Comparable {
  compareTo(other: this): number;
}

// 实现多个接口
class User implements Serializable, Comparable {
  constructor(
    public id: number,
    public name: string
  ) {}
  
  serialize(): string {
    return JSON.stringify({ id: this.id, name: this.name });
  }
  
  compareTo(other: User): number {
    return this.id - other.id;
  }
}

// type 也可以被类实现
type Entity = {
  id: number;
  createdAt: Date;
};

class Product implements Entity {
  id: number = 0;
  createdAt: Date = new Date();
}

// ==================== 扩展现有类型 ====================

// 使用 interface 扩展
interface Animal {
  name: string;
  eat(): void;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

// 使用 type 扩展
type Animal2 = {
  name: string;
  eat(): void;
};

type Dog2 = Animal2 & {
  breed: string;
  bark(): void;
};

// ==================== 工具类型示例 ====================

// 使用 type 创建工具类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 使用 interface 定义配置
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

// 使用 type 创建变体
type PartialConfig = Partial<Config>;
type ReadonlyConfig = Readonly<Config>;

// ==================== 最佳实践 ====================

// 1. 公共 API 使用 interface（支持扩展）
export interface UserService {
  getUser(id: string): Promise<User>;
  updateUser(user: User): Promise<void>;
}

// 2. 内部类型使用 type（更灵活）
type CacheEntry = {
  data: unknown;
  timestamp: number;
  ttl: number;
};

type Cache = Map<string, CacheEntry>;

// 3. 联合类型使用 type
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// 4. 复杂类型组合
interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
}

type RepositoryConfig = {
  connectionString: string;
  maxConnections: number;
};

type Repository<T> = BaseRepository<T> & {
  config: RepositoryConfig;
};`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Interfaces',
      'TypeScript 官方文档 - Type Aliases',
    ],
    createdAt: '2024-01-16',
  },
  {
    id: 'ts-003',
    category: 'typescript',
    questionType: 'theory',
    title: '泛型基础与约束',
    difficulty: 'medium',
    tags: ['TypeScript', '泛型', '泛型约束'],
    question: '请解释 TypeScript 中泛型的概念，如何使用泛型约束？泛型在函数、接口、类中的应用场景有哪些？',
    answer: `**泛型的概念：**

泛型（Generics）是指在定义函数、接口或类时，不预先指定具体类型，而是在使用时再指定类型的一种特性。

**泛型的优势：**
1. 代码复用 - 同一逻辑适用于多种类型
2. 类型安全 - 保持类型检查能力
3. 灵活性 - 使用时确定具体类型

**泛型约束：**
通过 extends 关键字限制泛型的范围，确保泛型具有某些属性或方法。

**应用场景：**
1. 函数 - 创建通用函数
2. 接口 - 定义通用接口
3. 类 - 创建通用类
4. 工具类型 - 类型转换`,
    codeExamples: [
      {
        language: 'typescript',
        description: '泛型函数',
        code: `// 1. 基本泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 使用方式
let output1 = identity<string>('hello'); // 显式指定类型
let output2 = identity(123); // 类型推断

// 2. 泛型数组
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// 3. 多个类型参数
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const result = pair('name', 'Alice'); // [string, string]

// 4. 泛型约束
interface Lengthwise {
  length: number;
}

// 约束 T 必须有 length 属性
function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello'); // OK，string 有 length
logLength([1, 2, 3]); // OK，array 有 length
logLength({ length: 10 }); // OK，对象有 length
// logLength(123); // Error，number 没有 length

// 5. 使用 keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 25 };
const name = getProperty(user, 'name'); // string
const age = getProperty(user, 'age'); // number
// getProperty(user, 'email'); // Error: 'email' 不是 'name' | 'age'`,
      },
      {
        language: 'typescript',
        description: '泛型接口和类',
        code: `// 1. 泛型接口
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

class Box<T> implements Container<T> {
  constructor(public value: T) {}
  
  getValue(): T {
    return this.value;
  }
  
  setValue(value: T): void {
    this.value = value;
  }
}

const stringBox = new Box('hello');
const numberBox = new Box(123);

// 2. 泛型类
class Stack<T> {
  private items: T[] = [];
  
  push(item: T): void {
    this.items.push(item);
  }
  
  pop(): T | undefined {
    return this.items.pop();
  }
  
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop()); // 2

// 3. 泛型工厂函数
function createInstance<T>(ctor: new (...args: any[]) => T, ...args: any[]): T {
  return new ctor(...args);
}

class Person {
  constructor(public name: string) {}
}

const person = createInstance(Person, 'Alice');

// 4. 泛型默认类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

const response: ApiResponse<string> = {
  code: 200,
  data: 'success',
  message: 'OK'
};`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Generics',
      'TypeScript Deep Dive - Generics',
    ],
    createdAt: '2024-01-17',
  },
  {
    id: 'ts-004',
    category: 'typescript',
    questionType: 'theory',
    title: '条件类型（Conditional Types）',
    difficulty: 'medium',
    tags: ['TypeScript', '条件类型', 'infer'],
    question: '请解释 TypeScript 中的条件类型是什么？如何使用 infer 关键字进行类型推断？条件类型有哪些实际应用？',
    answer: `**条件类型概念：**

条件类型根据条件表达式决定类型，类似于三元运算符：
\`T extends U ? X : Y\`

**infer 关键字：**
在条件类型的 extends 子句中，使用 infer 声明一个类型变量，可以从类型中提取部分类型。

**内置条件类型：**
- Exclude<T, U> - 从 T 中排除 U
- Extract<T, U> - 从 T 中提取 U
- NonNullable<T> - 排除 null 和 undefined
- ReturnType<T> - 获取函数返回类型
- Parameters<T> - 获取函数参数类型
- InstanceType<T> - 获取构造函数实例类型`,
    codeExamples: [
      {
        language: 'typescript',
        description: '条件类型基础',
        code: `// 1. 基本条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// 2. 分布式条件类型
// 当 T 是联合类型时，条件类型会分布到每个成员
type ToArray<T> = T extends any ? T[] : never;

type StrArr = ToArray<string>; // string[]
type NumArr = ToArray<number>; // number[]
type Mixed = ToArray<string | number>; // string[] | number[]

// 3. Exclude 和 Extract 实现
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;

type T1 = MyExclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
type T2 = MyExtract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'

// 4. NonNullable 实现
type MyNonNullable<T> = T extends null | undefined ? never : T;

type T3 = MyNonNullable<string | null | undefined>; // string

// 5. 实际应用：根据类型选择不同行为
type TypeName<T> = 
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object';

const typeName: TypeName<string> = 'string';
const typeName2: TypeName<number[]> = 'object';`,
      },
      {
        language: 'typescript',
        description: 'infer 关键字',
        code: `// 1. ReturnType 实现 - 获取函数返回类型
type MyReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : any;

function foo(): string {
  return 'hello';
}

type FooReturn = MyReturnType<typeof foo>; // string

// 2. Parameters 实现 - 获取函数参数类型
type MyParameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

function bar(x: number, y: string): void {}

type BarParams = MyParameters<typeof bar>; // [number, string]

// 3. 获取 Promise 返回类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type PromiseResult = UnwrapPromise<Promise<string>>; // string
type NormalValue = UnwrapPromise<number>; // number

// 4. 获取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never;

type ArrElement = ElementType<string[]>; // string
type TupleElement = ElementType<[number, string]>; // number | string

// 5. 获取对象属性类型
type PropertyType<T, K extends keyof T> = T extends { [P in K]: infer V } ? V : never;

interface User {
  id: number;
  name: string;
}

type IdType = PropertyType<User, 'id'>; // number
type NameType = PropertyType<User, 'name'>; // string

// 6. 获取构造函数实例类型
type MyInstanceType<T extends new (...args: any) => any> = 
  T extends new (...args: any) => infer R ? R : any;

class Person {
  constructor(public name: string) {}
}

type PersonInstance = MyInstanceType<typeof Person>; // Person`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Conditional Types',
      'TypeScript 官方文档 - Type Inference in Conditional Types',
    ],
    createdAt: '2024-01-18',
  },
  {
    id: 'ts-005',
    category: 'typescript',
    questionType: 'theory',
    title: '映射类型（Mapped Types）',
    difficulty: 'medium',
    tags: ['TypeScript', '映射类型', '工具类型'],
    question: '请解释 TypeScript 中的映射类型是什么？如何创建自定义映射类型？内置的工具类型如 Partial、Required、Readonly 是如何实现的？',
    answer: `**映射类型概念：**

映射类型建立在索引签名的语法之上，用于从一个旧类型创建一个新类型。语法：
\`type NewType = { [P in K]: T }\`

**映射类型的能力：**
1. 遍历类型的所有属性
2. 修改属性的类型
3. 添加或移除修饰符（readonly、?）
4. 重命名属性键

**内置工具类型实现原理：**
- Partial<T> - 所有属性变为可选
- Required<T> - 所有属性变为必选
- Readonly<T> - 所有属性变为只读
- Pick<T, K> - 选取部分属性
- Omit<T, K> - 排除部分属性
- Record<K, T> - 创建对象类型`,
    codeExamples: [
      {
        language: 'typescript',
        description: '映射类型基础',
        code: `// 1. 基本映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type ReadonlyUser = Readonly<User>;
// { readonly id: number; readonly name: string; readonly email: string; }

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

// 2. 移除修饰符
type Required<T> = {
  [P in keyof T]-?: T[P]; // -? 移除可选修饰符
};

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]; // -readonly 移除只读修饰符
};

// 3. Pick 和 Omit
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type UserIdAndName = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }

type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string; }

// 4. Record
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type UserMap = Record<string, User>;
// { [x: string]: User }`,
      },
      {
        language: 'typescript',
        description: '高级映射类型',
        code: `// 1. 类型转换映射
type Stringify<T> = {
  [P in keyof T]: string;
};

interface Numbers {
  a: number;
  b: number;
}

type Strings = Stringify<Numbers>;
// { a: string; b: string; }

// 2. 条件映射类型
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type NullableUser = Nullable<User>;
// { id: number | null; name: string | null; email: string | null; }

// 3. 深度映射类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface Config {
  database: {
    host: string;
    port: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

type PartialConfig = DeepPartial<Config>;
// 所有层级都是可选的

// 4. 重命名属性键
type AppendKey<T, U extends string> = {
  [P in keyof T as \`\${string & P}\${U}\`]: T[P];
};

interface Original {
  name: string;
  age: number;
}

type Appended = AppendKey<Original, 'Field'>;
// { nameField: string; ageField: number; }

// 5. 过滤属性
type OnlyStrings<T> = {
  [P in keyof T as T[P] extends string ? P : never]: T[P];
};

interface Mixed {
  name: string;
  age: number;
  email: string;
  active: boolean;
}

type StringProps = OnlyStrings<Mixed>;
// { name: string; email: string; }

// 6. Getter/Setter 生成
type Getters<T> = {
  [P in keyof T as \`get\${Capitalize<string & P>}\`]: () => T[P];
};

type Setters<T> = {
  [P in keyof T as \`set\${Capitalize<string & P>}\`]: (value: T[P]) => void;
};

type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string; getEmail: () => string; }`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Mapped Types',
      'TypeScript 官方文档 - Utility Types',
    ],
    createdAt: '2024-01-19',
  },
  {
    id: 'ts-006',
    category: 'typescript',
    questionType: 'theory',
    title: '类型体操：DeepReadonly 实现',
    difficulty: 'hard',
    tags: ['TypeScript', '类型体操', '递归类型'],
    question: '请实现一个 DeepReadonly 泛型类型，将对象及其所有嵌套属性都变为只读。',
    answer: `**DeepReadonly 的实现思路：**

1. **基础情况**：如果类型不是对象，直接返回
2. **递归处理**：遍历对象的所有属性，对每个属性值递归应用 DeepReadonly
3. **特殊处理**：处理数组、函数等特殊类型

**关键点：**
- 使用条件类型判断是否需要递归
- 使用映射类型遍历属性
- 处理数组和函数的特殊情况
- 避免循环引用导致的无限递归`,
    codeExamples: [
      {
        language: 'typescript',
        description: 'DeepReadonly 实现',
        code: `// 基础版本
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? DeepReadonly<T[P]> 
    : T[P];
};

// 改进版本：处理数组和函数
type DeepReadonlyV2<T> = {
  readonly [P in keyof T]: T[P] extends Function
    ? T[P]  // 函数保持原样
    : T[P] extends Array<infer U>
    ? ReadonlyArray<DeepReadonlyV2<U>>  // 数组递归处理
    : T[P] extends object
    ? DeepReadonlyV2<T[P]>  // 对象递归处理
    : T[P];  // 基本类型
};

// 使用示例
interface User {
  name: string;
  profile: {
    age: number;
    address: {
      city: string;
      street: string;
    };
  };
  hobbies: string[];
}

type ReadonlyUser = DeepReadonlyV2<User>;

const user: ReadonlyUser = {
  name: 'Alice',
  profile: {
    age: 25,
    address: {
      city: 'Beijing',
      street: 'Main St'
    }
  },
  hobbies: ['reading', 'coding']
};

// 以下操作都会报错
// user.name = 'Bob'; // Error
// user.profile.age = 26; // Error
// user.profile.address.city = 'Shanghai'; // Error
// user.hobbies.push('gaming'); // Error`,
      },
      {
        language: 'typescript',
        description: '更完善的实现',
        code: `// 完善版本：处理更多边界情况
type DeepReadonlyComplete<T> = T extends Function
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepReadonlyComplete<U>>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonlyComplete<K>, DeepReadonlyComplete<V>>
  : T extends Set<infer V>
  ? ReadonlySet<DeepReadonlyComplete<V>>
  : T extends object
  ? { readonly [P in keyof T]: DeepReadonlyComplete<T[P]> }
  : T;

// 测试用例
interface ComplexObject {
  fn: () => void;
  arr: number[][];
  map: Map<string, { value: number }>;
  set: Set<{ id: number }>;
  nested: {
    deep: {
      value: string;
    };
  };
}

type ReadonlyComplex = DeepReadonlyComplete<ComplexObject>;

// 实用工具：深度不可变类型
type Immutable<T> = DeepReadonlyComplete<T>;

// 使用场景：Redux State
interface AppState {
  user: {
    id: number;
    name: string;
    preferences: {
      theme: 'light' | 'dark';
      language: string;
    };
  };
  posts: Array<{
    id: number;
    title: string;
    comments: string[];
  }>;
}

type ImmutableState = Immutable<AppState>;

// 在 reducer 中使用
function reducer(state: ImmutableState, action: any): ImmutableState {
  // state 是完全不可变的，必须返回新对象
  return {
    ...state,
    user: {
      ...state.user,
      name: 'New Name'
    }
  };
}`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Recursive Types',
      'TypeScript 类型体操挑战',
    ],
    createdAt: '2024-01-20',
  },
  {
    id: 'ts-007',
    category: 'typescript',
    questionType: 'theory',
    title: '类型体操：DeepPartial 实现',
    difficulty: 'hard',
    tags: ['TypeScript', '类型体操', '递归类型'],
    question: '请实现一个 DeepPartial 泛型类型，将对象及其所有嵌套属性都变为可选。',
    answer: `**DeepPartial 的实现思路：**

1. **基础情况**：基本类型直接返回本身（可选对基本类型无意义）
2. **递归处理**：遍历对象的所有属性，对每个属性值递归应用 DeepPartial
3. **特殊处理**：处理数组、元组等特殊类型

**与 Partial 的区别：**
- Partial 只处理第一层属性
- DeepPartial 递归处理所有嵌套层级`,
    codeExamples: [
      {
        language: 'typescript',
        description: 'DeepPartial 实现',
        code: `// 基础版本
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object 
    ? DeepPartial<T[P]> 
    : T[P];
};

// 改进版本：处理数组和函数
type DeepPartialV2<T> = T extends Function
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartialV2<U>>
  : T extends object
  ? {
      [P in keyof T]?: DeepPartialV2<T[P]>;
    }
  : T;

// 使用示例
interface Config {
  host: string;
  port: number;
  database: {
    name: string;
    username: string;
    password: string;
    options: {
      ssl: boolean;
      timeout: number;
    };
  };
}

type PartialConfig = DeepPartialV2<Config>;

// 所有层级都是可选的
const config1: PartialConfig = {};
const config2: PartialConfig = {
  host: 'localhost'
};
const config3: PartialConfig = {
  database: {
    name: 'mydb',
    options: {
      ssl: true
    }
  }
};`,
      },
      {
        language: 'typescript',
        description: '实际应用场景',
        code: `// 1. 配置合并
function mergeConfig<T extends object>(
  defaultConfig: T,
  userConfig: DeepPartial<T>
): T {
  // 深度合并逻辑
  const result = { ...defaultConfig };
  
  for (const key in userConfig) {
    if (userConfig[key] !== undefined) {
      if (
        typeof userConfig[key] === 'object' &&
        !Array.isArray(userConfig[key])
      ) {
        result[key] = mergeConfig(
          result[key],
          userConfig[key] as DeepPartial<T[typeof key]>
        );
      } else {
        (result as any)[key] = userConfig[key];
      }
    }
  }
  
  return result;
}

// 2. 表单数据类型
interface UserForm {
  personal: {
    firstName: string;
    lastName: string;
    age: number;
  };
  contact: {
    email: string;
    phone: string;
    address: {
      city: string;
      street: string;
    };
  };
}

// 更新时只需要提供部分字段
type UserFormUpdate = DeepPartial<UserForm>;

function updateUser(userId: string, updates: UserFormUpdate) {
  // 只更新提供的字段
}

updateUser('1', {
  personal: {
    age: 26
  }
});

// 3. API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 部分更新响应
type PartialApiResponse<T> = DeepPartial<ApiResponse<T>>;

// 4. 结合 Required 使用
type DeepRequired<T> = T extends Function
  ? T
  : T extends Array<infer U>
  ? Array<DeepRequired<U>>
  : T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>;
    }
  : T;

// 确保所有字段都有值
type CompleteConfig = DeepRequired<PartialConfig>;`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Partial',
      'TypeScript 类型体操挑战',
    ],
    createdAt: '2024-01-21',
  },
  {
    id: 'ts-008',
    category: 'typescript',
    questionType: 'theory',
    title: '类型体操：UnionToIntersection',
    difficulty: 'hard',
    tags: ['TypeScript', '类型体操', '联合类型', '交叉类型'],
    question: '请实现 UnionToIntersection 泛型类型，将联合类型转换为交叉类型。例如：A | B 转换为 A & B。',
    answer: `**UnionToIntersection 的原理：**

这个类型转换利用了 TypeScript 的**逆变**特性：
1. 联合类型在函数参数位置是逆变的
2. 当把联合类型作为函数参数时，TypeScript 会推断为交叉类型
3. 通过 infer 提取这个交叉类型

**核心公式：**
\`(U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never\`

**应用场景：**
- 合并多个对象类型
- 构建复杂的配置类型
- 类型推导和转换`,
    codeExamples: [
      {
        language: 'typescript',
        description: 'UnionToIntersection 实现',
        code: `// 核心实现
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends ((k: infer I) => void)
  ? I
  : never;

// 原理解析：
// 1. U extends any ? (k: U) => void : never
//    将联合类型的每个成员映射为函数类型
//    A | B => ((k: A) => void) | ((k: B) => void)

// 2. 函数参数的逆变特性
//    ((k: A) => void) | ((k: B) => void) extends ((k: infer I) => void)
//    此时 I 会被推断为 A & B

// 使用示例
type Union = { a: string } | { b: number };
type Intersection = UnionToIntersection<Union>;
// { a: string } & { b: number }

const obj: Intersection = {
  a: 'hello',
  b: 123
};

// 另一个例子
type Props = { id: number } | { name: string } | { active: boolean };
type AllProps = UnionToIntersection<Props>;
// { id: number } & { name: string } & { active: boolean }

const item: AllProps = {
  id: 1,
  name: 'Alice',
  active: true
};`,
      },
      {
        language: 'typescript',
        description: '实际应用场景',
        code: `// 1. 合并配置对象
type DefaultConfig = {
  host: string;
  port: number;
};

type DbConfig = {
  database: string;
  username: string;
};

type CacheConfig = {
  cacheEnabled: boolean;
  cacheTTL: number;
};

// 使用联合类型定义可选配置
type OptionalConfigs = DefaultConfig | DbConfig | CacheConfig;

// 转换为交叉类型，得到完整配置
type FullConfig = UnionToIntersection<OptionalConfigs>;

// 2. 构建复杂对象类型
type BaseProps = {
  id: string;
  createdAt: Date;
};

type UserProps = {
  name: string;
  email: string;
};

type AdminProps = {
  role: 'admin';
  permissions: string[];
};

type AdminUser = UnionToIntersection<BaseProps | UserProps | AdminProps>;

const admin: AdminUser = {
  id: '1',
  createdAt: new Date(),
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  permissions: ['read', 'write', 'delete']
};

// 3. 提取联合类型的最后一个
type LastOfUnion<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;

type Test = 'a' | 'b' | 'c';
type Last = LastOfUnion<Test>; // 'c' (实际可能是任意一个)

// 4. 将联合类型转为元组（高级用法）
type UnionToTuple<T> = (
  T extends any ? (t: T) => T : never
) extends (t: infer U) => infer R
  ? [...UnionToTuple<Exclude<T, R>>, R]
  : [];

type Tuple = UnionToTuple<'a' | 'b' | 'c'>;
// ['a', 'b', 'c'] (顺序可能不同)`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Union and Intersection Types',
      'TypeScript 类型体操挑战',
    ],
    createdAt: '2024-01-22',
  },
  {
    id: 'ts-009',
    category: 'typescript',
    questionType: 'theory',
    title: '类型守卫与类型窄化',
    difficulty: 'medium',
    tags: ['TypeScript', '类型守卫', '类型窄化', '类型安全'],
    question: '请解释 TypeScript 中的类型守卫（Type Guards）和类型窄化（Type Narrowing）是什么？有哪些常见的类型守卫方式？',
    answer: `**类型守卫概念：**

类型守卫是一些表达式，它们在运行时检查类型，并在编译时确定类型范围。

**类型窄化概念：**

TypeScript 根据代码逻辑，在特定的代码块中缩小变量的类型范围。

**常见的类型守卫方式：**
1. typeof - 检查基本类型
2. instanceof - 检查类实例
3. in 操作符 - 检查属性是否存在
4. 字面量类型检查
5. 自定义类型守卫（is 关键字）
6. 断言函数（asserts 关键字）`,
    codeExamples: [
      {
        language: 'typescript',
        description: '类型守卫方式',
        code: `// 1. typeof 类型守卫
function process(value: string | number) {
  if (typeof value === 'string') {
    // 这里 value 被窄化为 string
    console.log(value.toUpperCase());
  } else {
    // 这里 value 被窄化为 number
    console.log(value.toFixed(2));
  }
}

// 2. instanceof 类型守卫
class Dog {
  bark() { console.log('Woof!'); }
}

class Cat {
  meow() { console.log('Meow!'); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// 3. in 操作符
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function move(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly();
  } else {
    animal.swim();
  }
}

// 4. 字面量类型检查
type Success = { status: 'success'; data: string };
type Error = { status: 'error'; message: string };

function handleResult(result: Success | Error) {
  if (result.status === 'success') {
    console.log(result.data);
  } else {
    console.log(result.message);
  }
}`,
      },
      {
        language: 'typescript',
        description: '自定义类型守卫',
        code: `// 1. 自定义类型守卫（is 关键字）
interface User {
  id: number;
  name: string;
}

function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string'
  );
}

function processUser(data: unknown) {
  if (isUser(data)) {
    // data 被窄化为 User 类型
    console.log(data.name);
  } else {
    console.log('Invalid user data');
  }
}

// 2. 断言函数（asserts 关键字）
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Value is not a string');
  }
}

function processString(value: unknown) {
  assertIsString(value);
  // 这里 value 被窄化为 string
  console.log(value.toUpperCase());
}

// 3. 数组类型守卫
function isStringArray(arr: unknown[]): arr is string[] {
  return arr.every(item => typeof item === 'string');
}

function processArray(arr: unknown[]) {
  if (isStringArray(arr)) {
    // arr 是 string[]
    arr.forEach(s => console.log(s.toUpperCase()));
  }
}

// 4. 可辨识联合
type Shape = 
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rectangle'; width: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    case 'rectangle':
      return shape.width * shape.height;
  }
}

// 5. 穷尽检查
function getAreaExhaustive(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    default:
      // 如果新增类型但忘记处理，这里会报错
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Narrowing',
      'TypeScript 官方文档 - Type Guards',
    ],
    createdAt: '2024-01-23',
  },
  {
    id: 'ts-010',
    category: 'typescript',
    questionType: 'theory',
    title: '装饰器的实现与应用',
    difficulty: 'medium',
    tags: ['TypeScript', '装饰器', '元编程', 'AOP'],
    question: '请解释 TypeScript 中装饰器的概念和分类？如何实现类装饰器、方法装饰器、属性装饰器和参数装饰器？',
    answer: `**装饰器概念：**

装饰器是一种特殊类型的声明，它可以附加到类声明、方法、属性或参数上，以修改类的行为。装饰器使用 @expression 形式。

**装饰器分类：**
1. 类装饰器 - 应用于类构造函数
2. 方法装饰器 - 应用于方法
3. 属性装饰器 - 应用于属性
4. 参数装饰器 - 应用于参数
5. 访问器装饰器 - 应用于 getter/setter

**装饰器执行顺序：**
1. 参数装饰器 -> 方法装饰器 -> 属性装饰器 -> 类装饰器
2. 从下到上，从内到外

**应用场景：**
- 日志记录
- 性能监控
- 权限控制
- 缓存
- 依赖注入`,
    codeExamples: [
      {
        language: 'typescript',
        description: '类装饰器',
        code: `// 类装饰器：接收类构造函数作为参数
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BankAccount {
  balance = 0;
  deposit(amount: number) {
    this.balance += amount;
  }
}

// 类装饰器工厂
function className(prefix: string) {
  return function<T extends { new (...args: any[]): {} }>(
    constructor: T
  ) {
    return class extends constructor {
      name = \`\${prefix}-\${constructor.name}\`;
    };
  };
}

@className('My')
class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const person = new Person('Alice');
console.log(person.name); // 'My-Person' (被装饰器覆盖)

// 实际应用：单例模式
function Singleton<T extends { new (...args: any[]): {} }>(
  constructor: T
) {
  let instance: any;
  
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) return instance;
      super(...args);
      instance = this;
    }
  };
}

@Singleton
class Database {
  constructor(public connectionString: string) {}
}

const db1 = new Database('conn1');
const db2 = new Database('conn2');
console.log(db1 === db2); // true`,
      },
      {
        language: 'typescript',
        description: '方法装饰器和属性装饰器',
        code: `// 方法装饰器
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(\`Calling \${propertyKey} with args:\`, args);
    const result = original.apply(this, args);
    console.log(\`Result:\`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }
}

// 属性装饰器
function DefaultValue(value: any) {
  return function(target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  };
}

class User {
  @DefaultValue('Guest')
  name!: string;
  
  @DefaultValue(0)
  age!: number;
}

// 参数装饰器
function Required(
  target: any,
  propertyKey: string,
  parameterIndex: number
) {
  const existingRequired: number[] = 
    Reflect.getOwnMetadata('required', target, propertyKey) || [];
  existingRequired.push(parameterIndex);
  Reflect.defineMetadata('required', existingRequired, target, propertyKey);
}

function Validate(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const required: number[] = 
      Reflect.getOwnMetadata('required', target, propertyKey) || [];
    
    for (const index of required) {
      if (args[index] === undefined || args[index] === null) {
        throw new Error(\`Argument at index \${index} is required\`);
      }
    }
    
    return original.apply(this, args);
  };
  
  return descriptor;
}

class UserService {
  @Validate
  createUser(@Required name: string, @Required email: string, age?: number) {
    return { name, email, age };
  }
}`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Decorators',
      'TypeScript 5.0 - ECMAScript Decorators',
    ],
    createdAt: '2024-01-24',
  },
  {
    id: 'ts-011',
    category: 'typescript',
    questionType: 'theory',
    title: 'TypeScript 模块系统与命名空间',
    difficulty: 'medium',
    tags: ['TypeScript', '模块', '命名空间', 'import'],
    question: '请解释 TypeScript 中的模块系统和命名空间的区别？如何正确使用 export、import？什么是声明合并？',
    answer: `**模块 vs 命名空间：**

1. **模块（Modules）**
   - 现代 TypeScript 推荐方式
   - 基于 ES6 模块语法
   - 每个文件是一个模块
   - 使用 import/export

2. **命名空间（Namespaces）**
   - 旧版 TypeScript 组织代码方式
   - 使用 namespace 关键字
   - 容易造成全局污染
   - 不推荐在新项目中使用

**声明合并：**
TypeScript 允许同名声明合并：
- 接口合并
- 类合并（需要构造函数签名）
- 枚举合并
- 命名空间与类/函数/枚举合并`,
    codeExamples: [
      {
        language: 'typescript',
        description: '模块系统',
        code: `// ========== utils.ts ==========
// 命名导出
export const PI = 3.14159;

export function add(a: number, b: number): number {
  return a + b;
}

export interface User {
  id: number;
  name: string;
}

export class Calculator {
  add(a: number, b: number) { return a + b; }
}

// 默认导出
export default class UserService {
  private users: User[] = [];
  
  add(user: User) {
    this.users.push(user);
  }
}

// ========== main.ts ==========
// 命名导入
import { PI, add, User, Calculator } from './utils';

// 默认导入
import UserService from './utils';

// 重命名导入
import { add as sum } from './utils';

// 全部导入
import * as Utils from './utils';
Utils.add(1, 2);

// 动态导入
async function loadModule() {
  const { add } = await import('./utils');
  add(1, 2);
}

// 类型导入
import type { User } from './utils';

// ========== re-export.ts ==========
export { add, User } from './utils';
export * from './utils';
export { default as UserService } from './utils';`,
      },
      {
        language: 'typescript',
        description: '声明合并',
        code: `// 1. 接口合并
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;
}

let box: Box = {
  height: 5,
  width: 6,
  scale: 10
};

// 2. 命名空间合并
namespace Animals {
  export class Dog {}
}

namespace Animals {
  export class Cat {}
}

// Animals 现在有 Dog 和 Cat

// 3. 命名空间与类合并
class Album {
  label: Album.AlbumLabel = new Album.AlbumLabel();
}

namespace Album {
  export class AlbumLabel {}
  export const defaultLabel = new AlbumLabel();
}

// 4. 命名空间与函数合并
function buildName(firstName: string, lastName: string) {
  return \`\${buildName.prefix}\${firstName} \${lastName}\`;
}

namespace buildName {
  export let prefix = 'Mr. ';
}

// 5. 命名空间与枚举合并
enum Color {
  Red,
  Green,
  Blue
}

namespace Color {
  export function fromHex(hex: string): Color {
    // ...
    return Color.Red;
  }
}

// 6. 扩展全局类型
declare global {
  interface Window {
    myCustomProperty: string;
  }
}

// 7. 模块扩展
declare module './utils' {
  interface User {
    age?: number;
  }
}`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Modules',
      'TypeScript 官方文档 - Namespaces',
      'TypeScript 官方文档 - Declaration Merging',
    ],
    createdAt: '2024-01-25',
  },
  {
    id: 'ts-012',
    category: 'typescript',
    questionType: 'theory',
    title: 'TypeScript 高级类型技巧',
    difficulty: 'hard',
    tags: ['TypeScript', '高级类型', '类型体操'],
    question: '请解释 TypeScript 中的一些高级类型技巧，如：模板字面量类型、递归类型、协变与逆变等概念。',
    answer: `**模板字面量类型：**
TypeScript 4.1+ 支持在类型中使用模板字面量语法，创建基于字符串的类型。

**递归类型：**
类型可以引用自身，用于处理树形结构、嵌套对象等。

**协变与逆变：**
- 协变：子类型可以赋值给父类型（返回值）
- 逆变：父类型可以赋值给子类型（参数）
- 不变：既不能协变也不能逆变

**这些概念的应用：**
- 字符串类型操作
- 深度类型处理
- 函数类型兼容性`,
    codeExamples: [
      {
        language: 'typescript',
        description: '模板字面量类型',
        code: `// 1. 基本模板字面量类型
type World = 'world';
type Greeting = \`hello \${World}\`; // 'hello world'

// 2. 联合类型展开
type EmailLocaleIDs = 'welcome_email' | 'email_heading';
type FooterLocaleIDs = 'footer_title' | 'footer_sendoff';

type AllLocaleIDs = \`\${EmailLocaleIDs | FooterLocaleIDs}_id\`;
// 'welcome_email_id' | 'email_heading_id' | 'footer_title_id' | 'footer_sendoff_id'

// 3. 字符串转换工具
type Lowercase<S extends string> = intrinsic;
type Uppercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

type Lower = Lowercase<'HELLO'>; // 'hello'
type Upper = Uppercase<'hello'>; // 'HELLO'
type Cap = Capitalize<'hello'>; // 'Hello'

// 4. 获取方法名
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; }

// 5. 事件处理器类型
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type EventHandler<T> = (event: T) => void;

type ClickEvent = { x: number; y: number };
type MouseEvent = EventName<'click'>; // 'onClick'

// 6. 替换字符串类型
type Replace<S extends string, From extends string, To extends string> =
  S extends \`\${infer Before}\${From}\${infer After}\`
    ? \`\${Before}\${To}\${After}\`
    : S;

type Replaced = Replace<'hello world', ' ', '-'>; // 'hello-world'`,
      },
      {
        language: 'typescript',
        description: '协变与逆变',
        code: `// 1. 协变（Covariance）
// 子类型可以赋值给父类型
let arr1: Array<string | number> = ['a', 1];
let arr2: Array<string> = ['a', 'b'];
arr1 = arr2; // OK - 数组是协变的

// 2. 逆变（Contravariance）
// 函数参数是逆变的
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

class Animal {
  name: string = '';
}

class Dog extends Animal {
  breed: string = '';
}

// 函数参数是逆变的
let animalHandler: AnimalHandler = (a: Animal) => console.log(a.name);
let dogHandler: DogHandler = (d: Dog) => console.log(d.breed);

// animalHandler = dogHandler; // Error! 逆变
dogHandler = animalHandler; // OK

// 3. 返回值是协变的
type AnimalFactory = () => Animal;
type DogFactory = () => Dog;

let animalFactory: AnimalFactory = () => new Animal();
let dogFactory: DogFactory = () => new Dog();

animalFactory = dogFactory; // OK - 返回值协变
// dogFactory = animalFactory; // Error!

// 4. 实际应用：事件处理
type EventHandler<T> = (event: T) => void;

interface MouseEvent {
  x: number;
  y: number;
}

interface ClickEvent extends MouseEvent {
  button: number;
}

// 更具体的事件处理器可以赋值给更通用的处理器
let mouseHandler: EventHandler<MouseEvent> = (e) => console.log(e.x, e.y);
let clickHandler: EventHandler<ClickEvent> = (e) => console.log(e.button);

clickHandler = mouseHandler; // OK - 逆变
// mouseHandler = clickHandler; // Error!

// 5. 双向协变（strictFunctionTypes: false）
// 不推荐，会降低类型安全性`,
      },
    ],
    references: [
      'TypeScript 官方文档 - Template Literal Types',
      'TypeScript 官方文档 - Type Compatibility',
    ],
    createdAt: '2024-01-26',
  },
];
