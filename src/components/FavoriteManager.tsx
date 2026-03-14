import React, { useState, useEffect } from 'react';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import type { FavoriteFolder } from '../types';
import './favorite.css';

interface FolderManagerProps {
  questionId?: string;
  onFolderChange?: () => void;
}

/**
 * 收藏夹管理组件
 */
export const FolderManager: React.FC<FolderManagerProps> = ({ questionId, onFolderChange }) => {
  const {
    folders,
    favorites,
    loadFolders,
    loadFavorites,
    createFolder,
    updateFolder,
    deleteFolder,
    addToFolder,
    removeFromFolder,
    isFavoriteInFolder,
  } = useFavoriteStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FavoriteFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#f7df1e');
  const [newFolderIcon, setNewFolderIcon] = useState('⭐');

  useEffect(() => {
    loadFolders();
    loadFavorites();
  }, [loadFolders, loadFavorites]);

  // 创建收藏夹
  const presetColors = [
    '#f7df1e', '#61dafb', '#52c41a', '#1890ff', 
    '#722ed1', '#eb2f96', '#fa8c16', '#13c2c2'
  ];

  // 预设图标
  const presetIcons = ['⭐', '📁', '🔖', '💡', '🎯', '📌', '🔥', '💎'];

  // 创建收藏夹
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    await createFolder(newFolderName, newFolderColor, newFolderIcon);
    setShowCreateModal(false);
    setNewFolderName('');
    setNewFolderColor('#f7df1e');
    setNewFolderIcon('⭐');
  };

  // 更新收藏夹
  const handleUpdateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;
    
    await updateFolder(editingFolder.id, {
      name: newFolderName,
      color: newFolderColor,
      icon: newFolderIcon,
    });
    setEditingFolder(null);
    setNewFolderName('');
  };

  // 删除收藏夹
  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('确定要删除此收藏夹吗？其中的收藏项也会被删除。')) {
      await deleteFolder(folderId);
      onFolderChange?.();
    }
  };

  // 切换收藏状态
  const handleToggleFavorite = async (folderId: string | null) => {
    if (!questionId) return;
    
    const isInFolder = isFavoriteInFolder(questionId, folderId);
    
    if (isInFolder) {
      await removeFromFolder(folderId, questionId);
    } else {
      await addToFolder(folderId, questionId);
    }
    
    onFolderChange?.();
  };

  // 开始编辑
  const startEdit = (folder: FavoriteFolder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color);
    setNewFolderIcon(folder.icon);
  };

  return (
    <div className="folder-manager">
      <div className="folder-manager-header">
        <h4>收藏夹管理</h4>
        <button 
          className="create-folder-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + 新建
        </button>
      </div>

      <div className="folder-list">
        {folders.map(folder => {
          const isAdded = questionId ? isFavoriteInFolder(questionId, folder.id) : false;
          const count = favorites.filter(f => f.folderId === folder.id).length;
          
          return (
            <div key={folder.id} className="folder-item">
              <div className="folder-info">
                <span className="folder-icon" style={{ color: folder.color }}>
                  {folder.icon}
                </span>
                <span className="folder-name">{folder.name}</span>
                <span className="folder-count">{count}</span>
              </div>
              
              <div className="folder-actions">
                {questionId && (
                  <button
                    className={`toggle-favorite-btn ${isAdded ? 'added' : ''}`}
                    onClick={() => handleToggleFavorite(folder.id)}
                  >
                    {isAdded ? '已收藏' : '收藏'}
                  </button>
                )}
                <button
                  className="edit-folder-btn"
                  onClick={() => startEdit(folder)}
                >
                  ✏️
                </button>
                <button
                  className="delete-folder-btn"
                  onClick={() => handleDeleteFolder(folder.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}

        {folders.length === 0 && (
          <div className="no-folders">
            <p>还没有收藏夹</p>
            <button onClick={() => setShowCreateModal(true)}>
              创建第一个收藏夹
            </button>
          </div>
        )}
      </div>

      {/* 创建收藏夹弹窗 */}
      {(showCreateModal || editingFolder) && (
        <div className="folder-modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setEditingFolder(null);
        }}>
          <div className="folder-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingFolder ? '编辑收藏夹' : '新建收藏夹'}</h3>
            
            <div className="form-group">
              <label>名称</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="输入收藏夹名称"
              />
            </div>

            <div className="form-group">
              <label>颜色</label>
              <div className="color-picker">
                {presetColors.map(color => (
                  <button
                    key={color}
                    className={`color-option ${newFolderColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewFolderColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>图标</label>
              <div className="icon-picker">
                {presetIcons.map(icon => (
                  <button
                    key={icon}
                    className={`icon-option ${newFolderIcon === icon ? 'selected' : ''}`}
                    onClick={() => setNewFolderIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingFolder(null);
                }}
              >
                取消
              </button>
              <button
                className="confirm-btn"
                onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                disabled={!newFolderName.trim()}
              >
                {editingFolder ? '更新' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 收藏夹选择器组件（用于题目详情页）
 */
export const FolderSelector: React.FC<{
  questionId: string;
  onToggle: () => void;
}> = ({ questionId, onToggle }) => {
  const {
    folders,
    loadFolders,
    addToFolder,
    removeFromFolder,
    isFavoriteInFolder,
  } = useFavoriteStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const handleToggle = async (folderId: string | null) => {
    const isInFolder = isFavoriteInFolder(questionId, folderId);
    
    if (isInFolder) {
      await removeFromFolder(folderId, questionId);
    } else {
      await addToFolder(folderId, questionId);
    }
    
    onToggle();
  };

  return (
    <div className="folder-selector">
      <button
        className="folder-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        📁 收藏到
      </button>

      {isOpen && (
        <div className="folder-selector-dropdown">
          {folders.map(folder => {
            const isAdded = isFavoriteInFolder(questionId, folder.id);
            
            return (
              <button
                key={folder.id}
                className={`folder-option ${isAdded ? 'selected' : ''}`}
                onClick={() => handleToggle(folder.id)}
              >
                <span style={{ color: folder.color }}>{folder.icon}</span>
                <span>{folder.name}</span>
                {isAdded && <span className="check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
