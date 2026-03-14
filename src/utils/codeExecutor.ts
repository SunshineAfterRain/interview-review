/**
 * 安全代码执行器
 * 使用 Web Worker 沙箱隔离执行用户代码
 */

export interface ExecutionResult {
  result: any;
  error: string | null;
  time: number;
  timedOut: boolean;
}

export interface ExecutionOptions {
  timeLimit?: number;
}

/**
 * 安全代码执行器类
 * 使用 Web Worker 在隔离环境中执行代码
 */
export class SafeCodeExecutor {
  private worker: Worker | null = null;

  /**
   * 执行代码
   * @param code 要执行的代码字符串
   * @param input 输入参数
   * @param timeLimit 执行时间限制（毫秒），默认 5000ms
   */
  async execute(
    code: string,
    input: any,
    timeLimit: number = 5000
  ): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      // 创建 Worker 代码
      const workerCode = `
        self.onmessage = (e) => {
          const { code, input, timeLimit } = e.data;
          const startTime = performance.now();
          
          // 设置超时定时器
          const timeoutId = setTimeout(() => {
            self.postMessage({
              result: null,
              error: 'Execution timed out',
              time: timeLimit,
              timedOut: true,
            });
            self.close();
          }, timeLimit);
          
          try {
            // 在 Worker 中执行代码，隔离全局环境
            const executeFunc = new Function('input', \`
              try {
                \${code}
                if (typeof solution === 'function') {
                  return solution(input);
                }
                return null;
              } catch (e) {
                return { __error__: e.message };
              }
            \`);
            
            const result = executeFunc(input);
            const endTime = performance.now();
            
            clearTimeout(timeoutId);
            
            if (result && result.__error__) {
              self.postMessage({
                result: null,
                error: result.__error__,
                time: endTime - startTime,
                timedOut: false,
              });
            } else {
              self.postMessage({
                result,
                error: null,
                time: endTime - startTime,
                timedOut: false,
              });
            }
          } catch (e) {
            const endTime = performance.now();
            clearTimeout(timeoutId);
            self.postMessage({
              result: null,
              error: e.message,
              time: endTime - startTime,
              timedOut: false,
            });
          }
        };
      `;

      // 创建 Blob URL
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);

      try {
        this.worker = new Worker(workerUrl);

        // 设置消息处理
        this.worker.onmessage = (e) => {
          resolve(e.data as ExecutionResult);
          this.cleanup();
          URL.revokeObjectURL(workerUrl);
        };

        // 设置错误处理
        this.worker.onerror = (e) => {
          resolve({
            result: null,
            error: e.message || 'Worker error',
            time: 0,
            timedOut: false,
          });
          this.cleanup();
          URL.revokeObjectURL(workerUrl);
        };

        // 发送执行请求
        this.worker.postMessage({ code, input, timeLimit });
      } catch (e: any) {
        resolve({
          result: null,
          error: e.message || 'Failed to create worker',
          time: 0,
          timedOut: false,
        });
        URL.revokeObjectURL(workerUrl);
      }
    });
  }

  /**
   * 清理 Worker 资源
   */
  private cleanup() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * 终止执行器
   */
  terminate() {
    this.cleanup();
  }
}

/**
 * 创建一个单次使用的执行器实例
 */
export function createExecutor(): SafeCodeExecutor {
  return new SafeCodeExecutor();
}

/**
 * 快捷执行函数
 * @param code 要执行的代码
 * @param input 输入参数
 * @param timeLimit 时间限制
 */
export async function safeExecute(
  code: string,
  input: any,
  timeLimit: number = 5000
): Promise<ExecutionResult> {
  const executor = new SafeCodeExecutor();
  try {
    return await executor.execute(code, input, timeLimit);
  } finally {
    executor.terminate();
  }
}
