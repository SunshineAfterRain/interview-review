/**
 * 代码执行 Web Worker
 * 在隔离环境中安全执行用户代码
 */

interface ExecutionRequest {
  code: string;
  input: any;
  timeLimit: number;
}

interface ExecutionResult {
  result: any;
  error: string | null;
  time: number;
  timedOut: boolean;
}

self.onmessage = (e: MessageEvent<ExecutionRequest>) => {
  const { code, input, timeLimit = 5000 } = e.data;
  const startTime = performance.now();
  
  // 设置超时定时器
  const timeoutId = setTimeout(() => {
    self.postMessage({
      result: null,
      error: 'Execution timed out',
      time: timeLimit,
      timedOut: true,
    } as ExecutionResult);
    self.close();
  }, timeLimit);
  
  try {
    // 在 Worker 中执行代码，隔离全局环境
    const executeFunc = new Function('input', `
      try {
        ${code}
        if (typeof solution === 'function') {
          return solution(input);
        }
        return null;
      } catch (e) {
        return { __error__: e.message };
      }
    `);
    
    const result = executeFunc(input);
    const endTime = performance.now();
    
    clearTimeout(timeoutId);
    
    if (result && result.__error__) {
      self.postMessage({
        result: null,
        error: result.__error__,
        time: endTime - startTime,
        timedOut: false,
      } as ExecutionResult);
    } else {
      self.postMessage({
        result,
        error: null,
        time: endTime - startTime,
        timedOut: false,
      } as ExecutionResult);
    }
  } catch (e: any) {
    const endTime = performance.now();
    clearTimeout(timeoutId);
    self.postMessage({
      result: null,
      error: e.message,
      time: endTime - startTime,
      timedOut: false,
    } as ExecutionResult);
  }
};
