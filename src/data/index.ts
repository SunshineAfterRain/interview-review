import { Question } from '../types/question';
import { javascriptQuestions } from './questions/javascript';
import { reactQuestions } from './questions/react';
import { cssQuestions } from './questions/css';
import { performanceQuestions } from './questions/performance';
import { engineeringQuestions } from './questions/engineering';
import { resumeBasedQuestions } from './questions/resume-based';
import { codingQuestions } from './questions/coding';
import { typescriptQuestions } from './questions/typescript';
import { algorithmQuestions } from './questions/algorithm';

export const allQuestions: Question[] = [
  ...javascriptQuestions,
  ...reactQuestions,
  ...cssQuestions,
  ...performanceQuestions,
  ...engineeringQuestions,
  ...resumeBasedQuestions,
  ...codingQuestions,
  ...typescriptQuestions,
  ...algorithmQuestions,
];

export { javascriptQuestions, reactQuestions, cssQuestions, performanceQuestions, engineeringQuestions, resumeBasedQuestions, codingQuestions, typescriptQuestions, algorithmQuestions };
