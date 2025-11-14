/**
 * 流星特效JavaScript逻辑
 * 创建动态流星雨效果，支持性能优化和主题适配
 */

class MeteorShower {
  constructor() {
    this.container = null;
    this.meteors = [];
    this.config = {
      maxMeteors: 100,         // 同时存在的最大流星数量
      minInterval: 50,         // 创建流星的最小间隔（毫秒）
      maxInterval: 200,        // 创建流星的最大间隔（毫秒）
      minDuration: 1500,       // 流星动画的最小持续时间
      maxDuration: 4000,       // 流星动画的最大持续时间
      minSize: 12,             // 流星最小尺寸
      maxSize: 30,             // 流星最大尺寸
      enableOnMobile: false    // 是否在移动设备上启用
    };
    this.isRunning = false;
    this.animationFrame = null;
    this.lastCreationTime = 0;
    
    this.init();
  }

  /**
   * 初始化流星特效
   */
  init() {
    // 检查是否应该启用流星特效
    if (!this.shouldEnable()) {
      return;
    }

    // 获取流星容器
    this.container = document.getElementById('meteor-shower');
    if (!this.container) {
      console.warn('流星容器未找到');
      return;
    }

    // 监听主题变化
    this.observeThemeChanges();
    
    // 启动流星特效
    this.start();
  }

  /**
   * 检查是否应该启用流星特效
   */
  shouldEnable() {
    // 检查是否为移动设备
    if (window.innerWidth <= 768 && !this.config.enableOnMobile) {
      return false;
    }

    // 检查用户偏好（减少动画）
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return false;
    }

    return true;
  }

  /**
   * 启动流星特效
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.createMeteorLoop();
    console.log('流星特效已启动');
  }

  /**
   * 停止流星特效
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // 取消动画帧
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // 清除所有流星
    this.clearAllMeteors();
    console.log('流星特效已停止');
  }

  /**
   * 流星创建循环
   */
  createMeteorLoop() {
    if (!this.isRunning) return;

    const currentTime = Date.now();
    const timeSinceLastCreation = currentTime - this.lastCreationTime;

    // 检查是否可以创建新流星
    if (timeSinceLastCreation >= this.getRandomInterval() && 
        this.meteors.length < this.config.maxMeteors) {
      this.createMeteor();
      this.lastCreationTime = currentTime;
    }

    // 继续循环
    this.animationFrame = requestAnimationFrame(() => this.createMeteorLoop());
  }

  /**
   * 创建单个流星
   */
  createMeteor() {
    const meteor = document.createElement('div');
    meteor.className = 'meteor';
    
    // 随机化流星属性
    const size = this.getRandomSize();
    const duration = this.getRandomDuration();
    const startX = this.getRandomStartX();
    const delay = Math.random() * 0.5; // 随机延迟

    // 设置流星样式
    meteor.style.width = `${size}px`;
    meteor.style.height = `${size}px`;
    meteor.style.left = `${startX}px`;
    meteor.style.top = '-100px';
    meteor.style.animation = `meteor-fall ${duration}ms linear ${delay}s forwards`;

    // 添加到容器
    this.container.appendChild(meteor);
    this.meteors.push(meteor);

    // 动画结束后移除流星
    setTimeout(() => {
      this.removeMeteor(meteor);
    }, duration + delay * 1000);
  }

  /**
   * 移除流星
   */
  removeMeteor(meteor) {
    const index = this.meteors.indexOf(meteor);
    if (index > -1) {
      this.meteors.splice(index, 1);
    }
    
    if (meteor.parentNode) {
      meteor.parentNode.removeChild(meteor);
    }
  }

  /**
   * 清除所有流星
   */
  clearAllMeteors() {
    this.meteors.forEach(meteor => {
      if (meteor.parentNode) {
        meteor.parentNode.removeChild(meteor);
      }
    });
    this.meteors = [];
  }

  /**
   * 获取随机创建间隔
   */
  getRandomInterval() {
    return Math.random() * (this.config.maxInterval - this.config.minInterval) + this.config.minInterval;
  }

  /**
   * 获取随机动画持续时间
   */
  getRandomDuration() {
    return Math.random() * (this.config.maxDuration - this.config.minDuration) + this.config.minDuration;
  }

  /**
   * 获取随机尺寸
   */
  getRandomSize() {
    return Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize;
  }

  /**
   * 获取随机起始X坐标
   */
  getRandomStartX() {
    return Math.random() * (window.innerWidth + 200) - 100; // 从屏幕左侧外部到右侧外部，确保全屏覆盖
  }

  /**
   * 监听主题变化
   */
  observeThemeChanges() {
    // 监听data-theme属性变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          // 主题变化时可以重新调整流星样式
          this.adjustForTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  /**
   * 根据主题调整流星效果
   */
  adjustForTheme() {
    // 这里可以根据主题调整流星的颜色或其他属性
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // 可以通过CSS变量或其他方式动态调整
    this.meteors.forEach(meteor => {
      // 主题特定的调整逻辑
    });
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // 如果配置更改导致不应该启用特效，则停止
    if (!this.shouldEnable() && this.isRunning) {
      this.stop();
    } else if (this.shouldEnable() && !this.isRunning) {
      this.start();
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      meteorCount: this.meteors.length,
      config: this.config
    };
  }
}

// 页面加载完成后初始化流星特效
document.addEventListener('DOMContentLoaded', () => {
  // 创建全局流星特效实例
  window.meteorShower = new MeteorShower();
  
  // 提供全局控制方法
  window.toggleMeteorShower = () => {
    if (window.meteorShower.getStatus().isRunning) {
      window.meteorShower.stop();
    } else {
      window.meteorShower.start();
    }
  };
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    // 重新检查是否应该启用特效
    if (!window.meteorShower.shouldEnable() && window.meteorShower.getStatus().isRunning) {
      window.meteorShower.stop();
    } else if (window.meteorShower.shouldEnable() && !window.meteorShower.getStatus().isRunning) {
      window.meteorShower.start();
    }
  });
  
  // 页面可见性变化时的处理
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 页面隐藏时停止特效以节省资源
      window.meteorShower.stop();
    } else {
      // 页面显示时重新启动
      window.meteorShower.start();
    }
  });
});