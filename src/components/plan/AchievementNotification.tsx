import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '../../types/plan';

interface AchievementNotificationProps {
  achievements: Achievement[];
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

/**
 * 成就通知组件 - 成就动画
 */
export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievements,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 当前显示的成就
  const currentAchievement = achievements[currentIndex];
  
  // 自动关闭
  useEffect(() => {
    if (autoClose && achievements.length > 0) {
      const timer = setTimeout(() => {
        if (currentIndex < achievements.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onClose();
        }
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, achievements.length, currentIndex, onClose]);
  
  // 手动关闭
  const handleClose = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };
  
  if (achievements.length === 0) return null;
  
  return (
    <AnimatePresence>
      {currentAchievement && (
        <motion.div
          className="achievement-notification-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="achievement-notification"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 光效背景 */}
            <div className="achievement-glow" />
            
            {/* 成就图标 */}
            <motion.div
              className="achievement-icon-wrapper"
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <span className="achievement-icon">{currentAchievement.icon}</span>
            </motion.div>
            
            {/* 成就信息 */}
            <motion.div
              className="achievement-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="achievement-title">成就解锁！</h3>
              <h4 className="achievement-name">{currentAchievement.name}</h4>
              <p className="achievement-desc">{currentAchievement.description}</p>
            </motion.div>
            
            {/* 进度指示器 */}
            {achievements.length > 1 && (
              <div className="achievement-progress">
                {achievements.map((_, index) => (
                  <span
                    key={index}
                    className={`progress-dot ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'completed' : ''}`}
                  />
                ))}
              </div>
            )}
            
            {/* 关闭按钮 */}
            <button className="achievement-close" onClick={handleClose}>
              {currentIndex < achievements.length - 1 ? '下一个' : '关闭'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 成就列表组件
 */
export const AchievementList: React.FC<{
  achievements: Achievement[];
  showAll?: boolean;
}> = ({ achievements, showAll = false }) => {
  const displayAchievements = showAll ? achievements : achievements.slice(0, 6);
  
  return (
    <div className="achievement-list">
      {displayAchievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          className={`achievement-item ${achievement.earnedAt ? 'earned' : 'locked'}`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="item-icon">{achievement.icon}</div>
          <div className="item-info">
            <h4 className="item-name">{achievement.name}</h4>
            <p className="item-desc">{achievement.description}</p>
            {achievement.earnedAt && (
              <span className="item-date">
                解锁于 {new Date(achievement.earnedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          {achievement.earnedAt && (
            <span className="item-badge">已解锁</span>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default AchievementNotification;
