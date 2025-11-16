window.throttle = (func, limit) => {
  let lastFunc, lastRan;

  return (...args) => {
    const context = this;
    if (!lastRan || Date.now() - lastRan >= limit) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        func.apply(context, args);
        lastRan = Date.now();
      }, limit - (Date.now() - lastRan));
    }
  };
};

(function () {
  // A Simple EventListener
  [Element, Document, Window].forEach((target) => {
    target.prototype._addEventListener = target.prototype.addEventListener;
    target.prototype._removeEventListener =
      target.prototype.removeEventListener;
    target.prototype.addEventListener = target.prototype.on = function (
      name,
      listener,
      options
    ) {
      this.__listeners__ = this.__listeners__ || {};
      this.__listeners__[name] = this.__listeners__[name] || [];

      // Check if the listener is already added
      for (let [l, o] of this.__listeners__[name]) {
        if (l === listener && JSON.stringify(o) === JSON.stringify(options)) {
          return this; // Listener is already added, do nothing
        }
      }
      this.__listeners__[name].push([listener, options]);
      this._addEventListener(name, listener, options);
      return this;
    };
    target.prototype.removeEventListener = target.prototype.off = function (
      name,
      listener,
      options
    ) {
      if (!this.__listeners__ || !this.__listeners__[name]) {
        return this;
      }
      if (!listener) {
        // remove all event listeners
        this.__listeners__[name].forEach(([listener, options]) => {
          this.removeEventListener(name, listener, options);
        });
        delete this.__listeners__[name];
        return this;
      }
      this._removeEventListener(name, listener, options);
      this.__listeners__[name] = this.__listeners__[name].filter(
        ([l, o]) =>
          l !== listener || JSON.stringify(o) !== JSON.stringify(options)
      );
      if (this.__listeners__[name].length === 0) {
        delete this.__listeners__[name];
      }
      return this;
    };
  });
  // Simple Selector
  window._$ = (selector) => document.querySelector(selector);
  window._$$ = (selector) => document.querySelectorAll(selector);

  // dark_mode
  const themeButton = document.createElement("a");
  themeButton.className = "nav-icon dark-mode-btn";
  _$("#sub-nav").append(themeButton);

  const osMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  function setTheme(config) {
    const isAuto = config === "auto";
    const isDark = config === "true" || (isAuto && osMode);

    document.documentElement.setAttribute("data-theme", isDark ? "dark" : null);
    localStorage.setItem("dark_mode", config);

    themeButton.id = `nav-${
      config === "true"
        ? "moon"
        : config === "false"
        ? "sun"
        : "circle-half-stroke"
    }-btn`;

    document.body.dispatchEvent(
      new CustomEvent(`${isDark ? "dark" : "light"}-theme-set`)
    );
  }
  const savedMode =
    localStorage.getItem("dark_mode") ||
    document.documentElement.getAttribute("data-theme-mode") ||
    "auto";
  setTheme(savedMode);

  themeButton.addEventListener(
    "click",
    throttle(() => {
      const modes = ["auto", "false", "true"];
      const nextMode =
        modes[(modes.indexOf(localStorage.getItem("dark_mode")) + 1) % 3];
      setTheme(nextMode);
    }, 1000)
  );

  let oldScrollTop = 0;
  document.addEventListener("scroll", () => {
    let scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const diffY = scrollTop - oldScrollTop;
    window.diffY = diffY;
    oldScrollTop = scrollTop;
    if (diffY < 0) {
      _$("#header-nav").classList.remove("header-nav-hidden");
    } else {
      _$("#header-nav").classList.add("header-nav-hidden");
    }
  });

  if (window.Pace) {
    Pace.on("done", () => {
      Pace.sources[0].elements = [];
    });
  }

  // generateScheme
  if (window.materialTheme) {
    const extractor = new materialTheme.ColorThemeExtractor({
      needTransition: false,
    });
    function appendStylesheet() {
      const existingStyle = _$("#reimu-generated-theme-style");
      if (existingStyle) {
        return;
      }
      const css = `
    :root {
      --red-0: var(--md-sys-color-primary-light);
      --red-1: color-mix(in srgb, var(--md-sys-color-primary-light) 90%, white);
      --red-2: color-mix(in srgb, var(--md-sys-color-primary-light) 75%, white);
      --red-3: color-mix(in srgb, var(--md-sys-color-primary-light) 55%, white);
      --red-4: color-mix(in srgb, var(--md-sys-color-primary-light) 40%, white);
      --red-5: color-mix(in srgb, var(--md-sys-color-primary-light) 15%, white);
      --red-5-5: color-mix(in srgb, var(--md-sys-color-primary-light) 10%, white);
      --red-6: color-mix(in srgb, var(--md-sys-color-primary-light) 5%, white);
    
      --color-border: var(--red-3);
      --color-link: var(--red-1);
      --color-meta-shadow: var(--red-6);
      --color-h2-after: var(--red-1);
      --color-red-6-shadow: var(--red-2);
      --color-red-3-shadow: var(--red-3);
    }
    
    [data-theme="dark"]:root {
      --red-0: var(--red-1);
      --red-1: color-mix(in srgb, var(--md-sys-color-primary-dark) 90%, white);
      --red-2: color-mix(in srgb, var(--md-sys-color-primary-dark) 80%, white);
      --red-3: color-mix(in srgb, var(--md-sys-color-primary-dark) 75%, white);
      --red-4: color-mix(in srgb, var(--md-sys-color-primary-dark) 30%, transparent);
      --red-5: color-mix(in srgb, var(--md-sys-color-primary-dark) 20%, transparent);
      --red-5-5: color-mix(in srgb, var(--md-sys-color-primary-dark) 10%, transparent);
      --red-6: color-mix(in srgb, var(--md-sys-color-primary-dark) 5%, transparent);
      
      --color-border: var(--red-5);
    }
    `;

      const style = document.createElement("style");
      style.id = "reimu-generated-theme-style";
      style.textContent = css;
      document.body.appendChild(style);
    }
    async function generateScheme(imageFile) {
      const scheme = await extractor.generateThemeSchemeFromImage(imageFile);
      document.documentElement.style.setProperty(
        "--md-sys-color-primary-light",
        extractor.hexFromArgb(scheme.schemes.light.props.primary)
      );
      document.documentElement.style.setProperty(
        "--md-sys-color-primary-dark",
        extractor.hexFromArgb(scheme.schemes.dark.props.primary)
      );

      const existingStyle = _$("#reimu-generated-theme-style");
      if (existingStyle) {
        return;
      }
      appendStylesheet();
    }

    window.generateSchemeHandler = () => {
      if (window.bannerElement?.src) {
        if (window.bannerElement.complete) {
          generateScheme(bannerElement);
        } else {
          window.bannerElement.addEventListener(
            "load",
            () => {
              generateScheme(bannerElement);
            },
            { once: true }
          );
        }
      } else if (window.bannerElement?.style.background) {
        const rgba = window.bannerElement.style.background.match(/\d+/g);
        const scheme = extractor.generateThemeScheme({
          r: parseInt(rgba[0]),
          g: parseInt(rgba[1]),
          b: parseInt(rgba[2]),
        });
        document.documentElement.style.setProperty(
          "--md-sys-color-primary-light",
          extractor.hexFromArgb(scheme.schemes.light.props.primary)
        );
        document.documentElement.style.setProperty(
          "--md-sys-color-primary-dark",
          extractor.hexFromArgb(scheme.schemes.dark.props.primary)
        );
        appendStylesheet();
      }
    };
  }
})();

// 初始化时钟
document.addEventListener('DOMContentLoaded', function() {
    // 检查主题配置
    const clockConfig = window.themeConfig?.digital_clock || {};
    
    // 如果时钟被禁用，则不初始化
    if (clockConfig.enable === false) {
        return;
    }
    
    // 查找EJS中已存在的时钟容器
    let clockContainer = document.getElementById('sidebar-clock');
    
    // 如果没找到ID，尝试查找类名
    if (!clockContainer) {
        clockContainer = document.querySelector('.digital-clock-container');
    }
    
    // 如果仍然没找到，则创建新容器
    if (!clockContainer) {
        const sidebarMenu = document.querySelector('.sidebar-menu');
        if (sidebarMenu) {
            clockContainer = document.createElement('div');
            clockContainer.className = 'digital-clock-container';
            clockContainer.id = 'sidebar-clock';
            sidebarMenu.parentNode.insertBefore(clockContainer, sidebarMenu.nextSibling);
        }
    }
    
    // 只有在找到或创建了容器时才初始化时钟
    if (clockContainer && !clockContainer.hasChildNodes()) {
        const clock = new DigitalClock({
            format: clockConfig.format || '24h',
            showDate: clockConfig.show_date !== false,
            showSeconds: clockConfig.show_seconds !== false,
            showWeek: clockConfig.show_week !== false,
            theme: clockConfig.theme || 'auto',
            animation: clockConfig.animation !== false,
            locale: clockConfig.locale || 'zh-CN'
        });
        
        const clockElement = clock.init();
        clockContainer.appendChild(clockElement);
        
        // 如果启用了霓虹灯效果
        if (clockConfig.neon_effect) {
            clock.element.classList.add('digital-clock--neon');
        }
        
        // 监听主题变化
        document.body.addEventListener('dark-theme-set', function() {
            if (clockConfig.theme === 'auto') {
                clock.setTheme('dark');
            }
        });
        
        document.body.addEventListener('light-theme-set', function() {
            if (clockConfig.theme === 'auto') {
                clock.setTheme('light');
            }
        });
        
        // 初始主题设置
        let currentTheme = 'dark';
        if (clockConfig.theme === 'auto') {
            currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        } else if (clockConfig.theme === 'light' || clockConfig.theme === 'dark') {
            currentTheme = clockConfig.theme;
        }
        clock.setTheme(currentTheme);
    }
});

var safeImport = async (url, integrity) => {
  if (!integrity) {
    return import(url);
  }
  const response = await fetch(url);
  const moduleContent = await response.text();

  const actualHash = await crypto.subtle.digest(
    "SHA-384",
    new TextEncoder().encode(moduleContent)
  );
  const hashBase64 =
    "sha384-" + btoa(String.fromCharCode(...new Uint8Array(actualHash)));

  if (hashBase64 !== integrity) {
    throw new Error(`Integrity check failed for ${url}`);
  }

  const blob = new Blob([moduleContent], { type: "application/javascript" });
  const blobUrl = URL.createObjectURL(blob);
  const module = await import(blobUrl);
  URL.revokeObjectURL(blobUrl);

  return module;
};

// ==============================================
// 数字时钟 - 安知鱼风格
// ==============================================
class DigitalClock {
    constructor(options = {}) {
        this.options = {
            format: options.format || '24h', // '12h' 或 '24h'
            showDate: options.showDate !== false,
            showSeconds: options.showSeconds !== false,
            showWeek: options.showWeek !== false,
            theme: options.theme || 'dark', // 'dark' 或 'light'
            animation: options.animation !== false,
            locale: options.locale || 'zh-CN',
            ...options
        };
        
        this.element = null;
        this.isRunning = false;
        this.currentTime = new Date();
        
        this.weekDays = {
            'zh-CN': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            'en': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        };
        
        this.months = {
            'zh-CN': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        };
    }
    
    init() {
        this.createClockElement();
        this.startClock();
        return this.element;
    }
    
    createClockElement() {
        this.element = document.createElement('div');
        this.element.className = `digital-clock digital-clock--${this.options.theme}`;
        
        const html = `
            <div class="digital-clock__container">
                <div class="digital-clock__time">
                    <span class="digital-clock__hours">00</span>
                    <span class="digital-clock__separator">:</span>
                    <span class="digital-clock__minutes">00</span>
                    ${this.options.showSeconds ? '<span class="digital-clock__separator">:</span><span class="digital-clock__seconds">00</span>' : ''}
                    ${this.options.format === '12h' ? '<span class="digital-clock__period">AM</span>' : ''}
                </div>
                ${this.options.showDate ? `
                    <div class="digital-clock__date">
                        <span class="digital-clock__year">2024</span>
                        <span class="digital-clock__date-separator">-</span>
                        <span class="digital-clock__month">01</span>
                        <span class="digital-clock__date-separator">-</span>
                        <span class="digital-clock__day">01</span>
                    </div>
                ` : ''}
                ${this.options.showWeek ? `
                    <div class="digital-clock__week">
                        <span class="digital-clock__week-text">星期一</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.element.innerHTML = html;
        this.bindElements();
    }
    
    bindElements() {
        this.elements = {
            hours: this.element.querySelector('.digital-clock__hours'),
            minutes: this.element.querySelector('.digital-clock__minutes'),
            seconds: this.element.querySelector('.digital-clock__seconds'),
            period: this.element.querySelector('.digital-clock__period'),
            year: this.element.querySelector('.digital-clock__year'),
            month: this.element.querySelector('.digital-clock__month'),
            day: this.element.querySelector('.digital-clock__day'),
            weekText: this.element.querySelector('.digital-clock__week-text'),
            separators: this.element.querySelectorAll('.digital-clock__separator')
        };
    }
    
    startClock() {
        this.isRunning = true;
        this.updateTime();
        this.interval = setInterval(() => this.updateTime(), 1000);
    }
    
    stopClock() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    
    updateTime() {
        const now = new Date();
        
        // 更新时间
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        let period = '';
        
        if (this.options.format === '12h') {
            period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
        }
        
        this.updateElement(this.elements.hours, this.padZero(hours));
        this.updateElement(this.elements.minutes, this.padZero(minutes));
        
        if (this.options.showSeconds && this.elements.seconds) {
            this.updateElement(this.elements.seconds, this.padZero(seconds));
        }
        
        if (this.options.format === '12h' && this.elements.period) {
            this.updateElement(this.elements.period, period);
        }
        
        // 更新日期
        if (this.options.showDate) {
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            
            this.updateElement(this.elements.year, year);
            this.updateElement(this.elements.month, this.padZero(month));
            this.updateElement(this.elements.day, this.padZero(day));
        }
        
        // 更新星期
        if (this.options.showWeek && this.elements.weekText) {
            const weekDay = now.getDay();
            const weekText = this.weekDays[this.options.locale] || this.weekDays['zh-CN'];
            this.updateElement(this.elements.weekText, weekText[weekDay]);
        }
        
        // 分隔符动画
        if (this.options.animation) {
            this.animateSeparators();
        }
    }
    
    updateElement(element, value) {
        if (element && element.textContent !== value) {
            if (this.options.animation) {
                element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 100);
            }
            element.textContent = value;
        }
    }
    
    animateSeparators() {
        this.elements.separators.forEach(separator => {
            separator.style.opacity = '0.3';
            setTimeout(() => {
                separator.style.opacity = '1';
            }, 500);
        });
    }
    
    padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    setTheme(theme) {
        this.options.theme = theme;
        if (this.element) {
            this.element.className = `digital-clock digital-clock--${theme}`;
        }
    }
    
    setFormat(format) {
        this.options.format = format;
        this.updateTime();
    }
    
    destroy() {
        this.stopClock();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
