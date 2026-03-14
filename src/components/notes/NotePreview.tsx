import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { Note } from '../../types';
import './notes.css';

interface NotePreviewProps {
  note: Note;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

/**
 * 笔记预览组件
 */
export const NotePreview: React.FC<NotePreviewProps> = ({ 
  note, 
  onEdit, 
  onDelete,
  compact = false 
}) => {
  if (compact) {
    return (
      <div className="note-preview-compact">
        <div className="note-preview-header">
          <span className="note-date">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
          <div className="note-actions">
            {onEdit && (
              <button className="note-action-btn" onClick={onEdit} title="编辑">
                ✏️
              </button>
            )}
            {onDelete && (
              <button className="note-action-btn delete" onClick={onDelete} title="删除">
                🗑️
              </button>
            )}
          </div>
        </div>
        <div className="note-content-truncated">
          {note.content.slice(0, 100)}
          {note.content.length > 100 && '...'}
        </div>
        {note.tags.length > 0 && (
          <div className="note-tags">
            {note.tags.map(tag => (
              <span key={tag} className="note-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="note-preview">
      <div className="note-preview-header">
        <div className="note-meta">
          <span className="note-date">
            更新于 {new Date(note.updatedAt).toLocaleString()}
          </span>
          <span className="note-word-count">
            {note.content.length} 字
          </span>
        </div>
        <div className="note-actions">
          {onEdit && (
            <button className="note-action-btn" onClick={onEdit}>
              ✏️ 编辑
            </button>
          )}
          {onDelete && (
            <button className="note-action-btn delete" onClick={onDelete}>
              🗑️ 删除
            </button>
          )}
        </div>
      </div>

      {note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map(tag => (
            <span key={tag} className="note-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="note-content">
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
              return className ? (
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
          }}
        >
          {note.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

/**
 * 笔记列表组件
 */
export const NoteList: React.FC<{
  notes: Note[];
  onEdit?: (note: Note) => void;
  onDelete?: (note: Note) => void;
}> = ({ notes, onEdit, onDelete }) => {
  if (notes.length === 0) {
    return (
      <div className="note-list-empty">
        <div className="empty-icon">📝</div>
        <p>暂无笔记</p>
      </div>
    );
  }

  return (
    <div className="note-list">
      {notes.map(note => (
        <NotePreview
          key={note.id}
          note={note}
          compact
          onEdit={() => onEdit?.(note)}
          onDelete={() => onDelete?.(note)}
        />
      ))}
    </div>
  );
};
