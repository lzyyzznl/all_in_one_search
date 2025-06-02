<template>
  <div class="settings-container">
    <header class="settings-header">
      <h1>🔧 插件设置</h1>
      <p>配置浏览器收藏夹历史记录搜索器的各项设置</p>
    </header>
    
    <!-- 成功提示 -->
    <div v-if="showSaveSuccess" class="save-success-message">
      ✅ 设置已保存成功！
    </div>
    
    <div class="settings-content">
      <!-- 快捷键设置 -->
      <div class="setting-section">
        <h2>⌨️ 快捷键设置</h2>
        <p class="section-desc">当前插件的快捷键配置，您可以在浏览器扩展管理页面中修改这些快捷键。</p>
        
        <div class="shortcut-list">
          <div class="shortcut-item" v-for="shortcut in shortcuts" :key="shortcut.name">
            <div class="shortcut-info">
              <strong>{{ shortcut.description }}</strong>
              <div class="shortcut-key">
                <kbd v-for="key in shortcut.shortcut.split('+')" :key="key">
                  {{ formatKey(key) }}
                </kbd>
              </div>
            </div>
            <div class="shortcut-status">
              <span :class="['status-badge', shortcut.shortcut ? 'active' : 'inactive']">
                {{ shortcut.shortcut || '未设置' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="shortcut-help">
          <h3>📖 如何修改快捷键：</h3>
          <ol>
            <li>在Chrome中访问 <code>chrome://extensions/shortcuts</code></li>
            <li>找到"浏览器收藏夹历史记录搜索器"</li>
            <li>点击快捷键输入框，按下您想要的快捷键组合</li>
            <li>点击确定保存</li>
          </ol>
          <button class="open-shortcuts-btn" @click="openShortcutsPage">
            🚀 打开快捷键设置页面
          </button>
        </div>
      </div>

      <!-- 搜索设置 -->
      <div class="setting-section">
        <h2>🔍 搜索设置</h2>
        <p class="section-desc">自定义搜索行为和显示选项</p>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="searchSettings.autoFocus"
              @change="saveSearchSettings"
            />
            启动时自动聚焦搜索框
          </label>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            默认搜索结果数量
          </label>
          <select v-model.number="searchSettings.defaultMaxResults" @change="saveSearchSettings">
            <option :value="25">25条</option>
            <option :value="50">50条</option>
            <option :value="100">100条</option>
            <option :value="200">200条</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            默认排序方式
          </label>
          <select v-model="searchSettings.defaultSortBy" @change="saveSearchSettings">
            <option value="relevance">相关性</option>
            <option value="recent">最近访问</option>
            <option value="frequency">访问频率</option>
          </select>
        </div>
      </div>

      <!-- 关于 -->
      <div class="setting-section">
        <h2>ℹ️ 关于插件</h2>
        <div class="about-info">
          <div class="info-item">
            <strong>版本：</strong> 1.0.0
          </div>
          <div class="info-item">
            <strong>开发框架：</strong> WXT + Vue 3 + TypeScript
          </div>
          <div class="info-item">
            <strong>功能特性：</strong>
            <ul>
              <li>🔍 模糊搜索收藏夹和历史记录</li>
              <li>📁 按域名智能分组显示</li>
              <li>⚡ 实时搜索，响应迅速</li>
              <li>⭐ 历史记录一键收藏</li>
              <li>🆕 新标签页完整搜索界面</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

// 显示保存成功消息
const showSaveSuccess = ref(false);

// 快捷键列表
const shortcuts = ref([
  {
    name: '_execute_action',
    description: '打开收藏夹历史记录搜索器',
    shortcut: 'Ctrl+Shift+S'
  }
]);

// 搜索设置
const searchSettings = reactive({
  autoFocus: true,
  defaultMaxResults: 50,
  defaultSortBy: 'relevance'
});

// 格式化快捷键显示
const formatKey = (key: string) => {
  const keyMap: { [key: string]: string } = {
    'Ctrl': 'Ctrl',
    'Alt': 'Alt',
    'Shift': 'Shift',
    'Meta': '⌘',
    'Command': '⌘',
    'Space': '空格'
  };
  return keyMap[key] || key;
};

// 加载快捷键设置
const loadShortcuts = async () => {
  try {
    const commands = await chrome.commands.getAll();
    shortcuts.value = shortcuts.value.map(shortcut => {
      const command = commands.find(cmd => cmd.name === shortcut.name);
      return {
        ...shortcut,
        shortcut: command?.shortcut || '未设置'
      };
    });
  } catch (error) {
    console.error('加载快捷键失败:', error);
  }
};

// 打开浏览器快捷键设置页面
const openShortcutsPage = () => {
  chrome.tabs.create({
    url: 'chrome://extensions/shortcuts'
  });
};

// 加载搜索设置
const loadSearchSettings = async () => {
  try {
    const result = await chrome.storage.local.get(['searchSettings']);
    if (result.searchSettings) {
      Object.assign(searchSettings, result.searchSettings);
    }
  } catch (error) {
    console.error('加载搜索设置失败:', error);
  }
};

// 显示保存成功消息
const showSaveSuccessMessage = () => {
  showSaveSuccess.value = true;
  setTimeout(() => {
    showSaveSuccess.value = false;
  }, 3000); // 3秒后隐藏
};

// 保存搜索设置
const saveSearchSettings = async () => {
  try {
    await chrome.storage.local.set({ searchSettings: searchSettings });
    console.log('搜索设置已保存:', searchSettings);
    
    // 显示保存成功提示
    showSaveSuccessMessage();
  } catch (error) {
    console.error('保存搜索设置失败:', error);
    alert('保存设置失败，请重试');
  }
};

// 组件挂载时加载设置
onMounted(async () => {
  await loadShortcuts();
  await loadSearchSettings();
});
</script>

<style lang="less" scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.settings-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  
  h1 {
    color: #333;
    margin: 0 0 8px 0;
    font-size: 2rem;
  }
  
  p {
    color: #666;
    margin: 0;
    font-size: 1.1rem;
  }
}

.save-success-message {
  background: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  
  h2 {
    color: #333;
    margin: 0 0 8px 0;
    font-size: 1.5rem;
  }
  
  .section-desc {
    color: #666;
    margin: 0 0 20px 0;
    font-size: 0.95rem;
  }
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.shortcut-info {
  strong {
    display: block;
    color: #333;
    margin-bottom: 4px;
  }
}

.shortcut-key {
  display: flex;
  gap: 2px;
  
  kbd {
    background: #333;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
  }
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.active {
    background: #d4edda;
    color: #155724;
  }
  
  &.inactive {
    background: #f8d7da;
    color: #721c24;
  }
}

.shortcut-help {
  padding: 16px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
  
  h3 {
    margin: 0 0 12px 0;
    color: #1565c0;
  }
  
  ol {
    margin: 0 0 16px 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 4px;
      color: #333;
    }
  }
  
  code {
    background: rgba(0,0,0,0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
  }
}

.open-shortcuts-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  
  &:hover {
    background: #1976d2;
  }
}

.setting-item {
  margin-bottom: 16px;
  
  .setting-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    
    input[type="checkbox"] {
      margin: 0;
    }
  }
  
  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    margin-top: 4px;
  }
}

.about-info {
  .info-item {
    margin-bottom: 12px;
    
    strong {
      color: #333;
    }
    
    ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 4px;
        color: #666;
      }
    }
  }
}
</style>
