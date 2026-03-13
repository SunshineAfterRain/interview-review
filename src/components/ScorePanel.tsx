import React, { useState, useEffect } from 'react';
import { ScoreResult } from '../types/question';

interface ScorePanelProps {
  score?: ScoreResult;
  userAnswer?: string;
  correctAnswer?: string;
  questionType: 'theory' | 'coding';
  onScoreCalculated?: (score: ScoreResult) => void;
}

// 理论题评分函数
const scoreTheoryAnswer = (
  userAnswer: string,
  correctAnswer: string
): ScoreResult => {
  const userKeywords = extractKeywords(userAnswer);
  const correctKeywords = extractKeywords(correctAnswer);
  
  // 计算关键词覆盖率
  const matchedKeywords = userKeywords.filter(k => 
    correctKeywords.some(ck => ck.includes(k) || k.includes(ck))
  );
  const coverage = correctKeywords.length > 0 
    ? matchedKeywords.length / correctKeywords.length 
    : 0;
  
  // 完整性评分 (40分)
  const completenessScore = Math.round(coverage * 40);
  
  // 准确性评分 (30分) - 基于答案长度和关键词匹配
  const accuracyScore = Math.round(
    (coverage * 0.7 + Math.min(userAnswer.length / correctAnswer.length, 1) * 0.3) * 30
  );
  
  // 表达清晰度 (20分) - 基于段落结构和标点
  const structureScore = analyzeStructure(userAnswer);
  const clarityScore = Math.round(structureScore * 20);
  
  // 关键词使用 (10分)
  const keywordScore = Math.round(Math.min(matchedKeywords.length / 5, 1) * 10);
  
  const totalScore = completenessScore + accuracyScore + clarityScore + keywordScore;
  
  return {
    totalScore,
    maxScore: 100,
    dimensions: [
      {
        name: '完整性',
        score: completenessScore,
        maxScore: 40,
        feedback: generateCompletenessFeedback(coverage)
      },
      {
        name: '准确性',
        score: accuracyScore,
        maxScore: 30,
        feedback: generateAccuracyFeedback(coverage, userAnswer.length, correctAnswer.length)
      },
      {
        name: '表达清晰度',
        score: clarityScore,
        maxScore: 20,
        feedback: generateClarityFeedback(structureScore)
      },
      {
        name: '关键词覆盖',
        score: keywordScore,
        maxScore: 10,
        feedback: `覆盖了 ${matchedKeywords.length}/${correctKeywords.length} 个关键词`
      }
    ],
    passedTests: matchedKeywords.length,
    totalTests: correctKeywords.length,
    suggestions: generateTheorySuggestions(coverage, structureScore, userAnswer)
  };
};

// 提取关键词
const extractKeywords = (text: string): string[] => {
  // 移除常见停用词
  const stopWords = new Set(['的', '是', '在', '和', '了', '有', '不', '这', '我', '他', '她', '它', '们', '与', '及', '等', '或', '但', '如', '而', '也', '就', '都', '会', '能', '要', '可', '对', '被', '把', '让', '给', '向', '从', '到', '为', '以', '因', '由', '于', '之', '所', '者', '其', '此', '那', '什', '么', '怎', '哪', '谁', '何', '几', '多', '少', '很', '太', '更', '最', '已', '还', '又', '再', '才', '只', '就', '已', '经', '正', '在', '将', '要', '应', '该', '应', '当', '须', '必', '需', '须', '得', '着', '过', '来', '去', '起', '开', '出', '入', '进', '上', '下', '前', '后', '左', '右', '里', '外', '中', '内', '间', '时', '地', '处', '所', '数', '量', '度', '点', '些', '个', '种', '类', '件', '项', '次', '回', '遍', '番', '下', '上', '里', '外', '前', '后', '左', '右', '东', '西', '南', '北', '中', '内', '间', '时', '地', '处', '所', '数', '量', '度', '点', '些', '个', '种', '类', '件', '项', '次', '回', '遍', '番']);
  
  const keywords = text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));
  
  return [...new Set(keywords)];
};

// 分析文本结构
const analyzeStructure = (text: string): number => {
  let score = 1;
  
  // 检查是否有段落分隔
  const paragraphs = text.split(/\n\n+/);
  if (paragraphs.length > 1) score += 0.2;
  
  // 检查是否有列表结构
  if (text.match(/[0-9]+\./) || text.match(/[一二三四五六七八九十]+[、.．]/)) {
    score += 0.2;
  }
  
  // 检查是否有代码块
  if (text.includes('```') || text.includes('`')) {
    score += 0.1;
  }
  
  // 检查句子长度是否合理
  const sentences = text.split(/[。！？.!?]/);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  if (avgLength > 10 && avgLength < 100) {
    score += 0.1;
  }
  
  return Math.min(score, 1);
};

// 生成反馈信息
const generateCompletenessFeedback = (coverage: number): string => {
  if (coverage >= 0.8) return '答案非常完整，涵盖了大部分要点';
  if (coverage >= 0.6) return '答案较为完整，但遗漏了部分要点';
  if (coverage >= 0.4) return '答案不够完整，建议补充更多细节';
  return '答案不够完整，请重新审视题目要求';
};

const generateAccuracyFeedback = (coverage: number, userLen: number, correctLen: number): string => {
  const lenRatio = userLen / correctLen;
  if (coverage >= 0.7 && lenRatio >= 0.5) return '答案准确度较高';
  if (coverage >= 0.5) return '答案基本准确，但可以更精确';
  return '答案准确性有待提高';
};

const generateClarityFeedback = (score: number): string => {
  if (score >= 0.9) return '表达非常清晰，结构良好';
  if (score >= 0.7) return '表达较为清晰，建议增加段落结构';
  return '建议使用更清晰的结构表达观点';
};

const generateTheorySuggestions = (coverage: number, structureScore: number, answer: string): string[] => {
  const suggestions: string[] = [];
  
  if (coverage < 0.6) {
    suggestions.push('建议更全面地回答问题，覆盖更多关键点');
  }
  
  if (structureScore < 0.7) {
    suggestions.push('建议使用分点或分段的方式组织答案');
  }
  
  if (answer.length < 50) {
    suggestions.push('答案过于简短，建议展开说明');
  }
  
  if (!answer.includes('例如') && !answer.includes('比如') && !answer.includes('示例')) {
    suggestions.push('可以添加具体示例来增强说明');
  }
  
  return suggestions;
};

export const ScorePanel: React.FC<ScorePanelProps> = ({
  score,
  userAnswer = '',
  correctAnswer = '',
  questionType,
  onScoreCalculated
}) => {
  const [calculatedScore, setCalculatedScore] = useState<ScoreResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    if (questionType === 'theory' && userAnswer && correctAnswer) {
      const result = scoreTheoryAnswer(userAnswer, correctAnswer);
      setCalculatedScore(result);
      onScoreCalculated?.(result);
    } else if (score) {
      setCalculatedScore(score);
    }
  }, [score, userAnswer, correctAnswer, questionType, onScoreCalculated]);
  
  if (!calculatedScore) {
    return null;
  }
  
  const getScoreColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return 'excellent';
    if (ratio >= 0.6) return 'good';
    if (ratio >= 0.4) return 'average';
    return 'poor';
  };
  
  const getScoreEmoji = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.9) return '🏆';
    if (ratio >= 0.8) return '🌟';
    if (ratio >= 0.6) return '👍';
    if (ratio >= 0.4) return '💪';
    return '📚';
  };

  return (
    <div className="score-panel">
      <div className="score-header">
        <h4>评分结果</h4>
        <div className="total-score">
          <span className="score-emoji">{getScoreEmoji(calculatedScore.totalScore, calculatedScore.maxScore)}</span>
          <span className={`score-value ${getScoreColor(calculatedScore.totalScore, calculatedScore.maxScore)}`}>
            {calculatedScore.totalScore}
          </span>
          <span className="score-max">/ {calculatedScore.maxScore}</span>
        </div>
      </div>
      
      <div className="score-breakdown">
        {calculatedScore.dimensions.map((dim, index) => (
          <div key={index} className="score-dimension">
            <div className="dimension-header">
              <span className="dimension-name">{dim.name}</span>
              <span className={`dimension-score ${getScoreColor(dim.score, dim.maxScore)}`}>
                {dim.score}/{dim.maxScore}
              </span>
            </div>
            <div className="dimension-bar">
              <div 
                className={`dimension-fill ${getScoreColor(dim.score, dim.maxScore)}`}
                style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
              ></div>
            </div>
            <p className="dimension-feedback">{dim.feedback}</p>
          </div>
        ))}
      </div>
      
      {calculatedScore.suggestions.length > 0 && (
        <div className="score-suggestions">
          <h5>改进建议</h5>
          <ul>
            {calculatedScore.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button 
        className="toggle-details-btn"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? '收起详情' : '查看详情'}
      </button>
      
      {showDetails && (
        <div className="score-details">
          <div className="detail-item">
            <span className="detail-label">通过测试:</span>
            <span className="detail-value">
              {calculatedScore.passedTests} / {calculatedScore.totalTests}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">得分率:</span>
            <span className="detail-value">
              {((calculatedScore.totalScore / calculatedScore.maxScore) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
