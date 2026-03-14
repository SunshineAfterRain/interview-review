import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，记录错误并显示降级 UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // 在控制台输出错误信息
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认的错误 UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">!</div>
            <h2>出错了</h2>
            <p>抱歉，页面遇到了一些问题</p>
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>错误详情</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            <div className="error-actions">
              <button onClick={this.handleReset} className="retry-btn">
                重试
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="home-btn"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 页面级错误边界
 * 用于包裹页面组件，提供更简洁的错误提示
 */
export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error('Page error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="page-error-boundary">
          <div className="page-error-content">
            <div className="page-error-icon">:(</div>
            <h3>页面加载失败</h3>
            <p>请尝试刷新页面或返回首页</p>
            <div className="page-error-actions">
              <button onClick={this.handleReset}>重试</button>
              <button onClick={() => window.location.href = '/'}>返回首页</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 函数式组件错误回退 UI
 */
export const ErrorFallback: React.FC<{
  error?: Error;
  resetErrorBoundary?: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="error-boundary">
    <div className="error-content">
      <div className="error-icon">!</div>
      <h2>出错了</h2>
      <p>抱歉，页面遇到了一些问题</p>
      {import.meta.env.DEV && error && (
        <details className="error-details">
          <summary>错误详情</summary>
          <pre>{error.toString()}</pre>
        </details>
      )}
      <div className="error-actions">
        {resetErrorBoundary && (
          <button onClick={resetErrorBoundary} className="retry-btn">
            重试
          </button>
        )}
        <button 
          onClick={() => window.location.href = '/'} 
          className="home-btn"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
);
