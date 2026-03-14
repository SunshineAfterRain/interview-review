import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { useNoteStore } from '../../stores/useNoteStore';
import type { Note } from '../../types';
import './notes.css';

interface NoteEditorProps {
  questionId: string;
  onSave?: (note: Note) => void;
  onCancel?: () => void;
}

/**
 * 笔记编辑器组件
 * 支持 Markdown 编辑和预览
 */
export const NoteEditor: React.FC<NoteEditorProps> = ({ questionId, onSave, onCancel }) => {
  const { getNoteByQuestion, createNote, updateNote, notes } = useNoteStore();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingNote, setExistingNote] = useState<Note | null>(null);

  // 加载现有笔记
  useEffect(() => {
    const note = getNoteByQuestion(questionId);
    if (note) {
      setContent(note.content);
      setTags(note.tags);
      setExistingNote(note);
    } else {
      setContent('');
      setTags([]);
      setExistingNote(null);
    }
  }, [questionId, getNoteByQuestion, notes]);

  // 保存笔记
  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    try {
      let note: Note;
      if (existingNote) {
        note = await updateNote(existingNote.id, content, tags);
      } else {
        note = await createNote(questionId, content, tags);
      }
      onSave?.(note);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, tags, existingNote, questionId, updateNote, createNote, onSave]);

  // 添加标签
  const handleAddTag = useCallback(() => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  // 移除标签
  const handleRemoveTag = useCallback((tag: string) => {
    setTags(tags.filter(t => t !== tag));
  }, [tags]);

  // 键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl/Cmd + S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    // Ctrl/Cmd + P 切换预览
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      setIsPreview(!isPreview);
    }
  }, [handleSave, isPreview]);

  // 标签输入键盘事件
  const handleTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  return (
    <div className="note-editor" onKeyDown={handleKeyDown}>
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button
            className={`toolbar-btn ${!isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(false)}
            title="编辑模式"
          >
            ✏️ 编辑
          </button>
          <button
            className={`toolbar-btn ${isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(true)}
            title="预览模式"
          >
            👁️ 预览
          </button>
        </div>
        
        <div className="toolbar-right">
          <span className="shortcut-hint">Ctrl+S 保存</span>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
          >
            {isSaving ? '保存中...' : existingNote ? '更新笔记' : '保存笔记'}
          </button>
          {onCancel && (
            <button className="cancel-btn" onClick={onCancel}>
              取消
            </button>
          )}
        </div>
      </div>

      {/* 标签区域 */}
      <div className="tags-section">
        <div className="tags-list">
          {tags.map(tag => (
            <span key={tag} className="tag-item">
              #{tag}
              <button
                className="tag-remove"
                onClick={() => handleRemoveTag(tag)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="tag-input-wrapper">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="添加标签..."
            className="tag-input"
          />
          <button className="add-tag-btn" onClick={handleAddTag}>
            添加
          </button>
        </div>
      </div>

      {/* 编辑/预览区域 */}
      {isPreview ? (
        <div className="note-preview-content">
          <NotePreviewContent content={content} />
        </div>
      ) : (
        <textarea
          className="note-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在此记录你的学习笔记...&#10;&#10;支持 Markdown 语法：&#10;- **粗体** *斜体*&#10;- # 标题&#10;- - 列表&#10;- ```代码块```&#10;- [链接](url)"
          autoFocus
        />
      )}

      {/* 底部信息 */}
      <div className="editor-footer">
        <span className="char-count">{content.length} 字符</span>
        {existingNote && (
          <span className="last-updated">
            上次更新：{new Date(existingNote.updatedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * 笔记预览内容组件
 */
export const NotePreviewContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
        p: ({ children }) => <p className="md-p">{children}</p>,
        ul: ({ children }) => <ul className="md-ul">{children}</ul>,
        ol: ({ children }) => <ol className="md-ol">{children}</ol>,
        li: ({ children }) => <li className="md-li">{children}</li>,
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <code className={`md-code-block ${className}`} {...props}>
              {children}
            </code>
          ) : (
            <code className="md-code-inline" {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="md-pre">{children}</pre>,
        blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="md-link">
            {children}
          </a>
        ),
        strong: ({ children }) => <strong className="md-strong">{children}</strong>,
        em: ({ children }) => <em className="md-em">{children}</em>,
      }}
    >
      {content || '*暂无内容*'}
    </ReactMarkdown>
  );
};
