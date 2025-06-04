<template>
  <div class="element-settings-container">
    <!-- 页面头部 -->
    <div class="settings-header">
      <h1 class="header-title">🔧 插件设置</h1>
      <p class="header-subtitle">配置浏览器收藏夹历史记录搜索器的各项设置</p>
    </div>
    
    <!-- 成功提示 -->
    <el-alert
      v-if="showSaveSuccess"
      title="设置已保存成功！"
      type="success"
      effect="dark"
      :closable="false"
      class="save-success-message"
    />
    
    <div class="settings-content">
      <!-- 快捷键设置 -->
      <el-card class="setting-section">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Tools /></el-icon>
            <h2 class="header-title">快捷键设置</h2>
          </div>
        </template>
        
        <p class="section-description">当前插件的快捷键配置，您可以在浏览器扩展管理页面中修改这些快捷键。</p>
        
        <el-table :data="shortcuts" stripe style="width: 100%">
          <el-table-column prop="description" label="功能" width="180" />
          <el-table-column label="快捷键">
            <template #default="{ row }">
              <el-space :size="4" wrap>
                <el-tag 
                  v-for="key in row.shortcut.split('+')" 
                  :key="key"
                  type="info"
                  effect="plain"
                  size="small"
                >
                  {{ formatKey(key) }}
                </el-tag>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="shortcut-help">
          <h3 class="help-title">📖 如何修改快捷键：</h3>
          <ol class="help-steps">
            <li>在Chrome中访问 <code>chrome://extensions/shortcuts</code></li>
            <li>找到"浏览器收藏夹历史记录搜索器"</li>
            <li>点击快捷键输入框，按下您想要的快捷键组合</li>
            <li>点击确定保存</li>
          </ol>
          <el-button type="primary" @click="openShortcutsPage">
            <el-icon><Setting /></el-icon>
            打开快捷键设置页面
          </el-button>
        </div>
      </el-card>

      <!-- 搜索设置 -->
      <el-card class="setting-section">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Search /></el-icon>
            <h2 class="header-title">搜索设置</h2>
          </div>
        </template>
        
        <p class="section-description">自定义搜索行为和显示选项</p>
        
        <el-form 
          :model="searchSettings" 
          label-width="160px"
          label-position="top"
        >
          <el-form-item label="默认搜索结果数量" prop="defaultMaxResults">
            <el-select 
              v-model="searchSettings.defaultMaxResults" 
              @change="saveSearchSettings"
              style="width: 100%"
            >
              <el-option label="25条" :value="25" />
              <el-option label="50条" :value="50" />
              <el-option label="100条" :value="100" />
              <el-option label="200条" :value="200" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="默认排序方式" prop="defaultSortBy">
            <el-select 
              v-model="searchSettings.defaultSortBy" 
              @change="saveSearchSettings"
              style="width: 100%"
            >
              <el-option label="相关性" value="relevance" />
              <el-option label="最近访问" value="recent" />
              <el-option label="访问频率" value="frequency" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 键盘导航设置 -->
      <el-card class="setting-section">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Tools /></el-icon>
            <h2 class="header-title">键盘导航设置</h2>
          </div>
        </template>
        
        <p class="section-description">自定义搜索结果中的键盘导航快捷键</p>
        
        <div class="navigation-keys-grid">
          <el-card class="key-setting-item" :body-style="{ padding: '16px', textAlign: 'center' }">
            <div class="key-label">
              <el-icon class="key-icon" size="24"><ArrowUp /></el-icon>
              <div class="key-text">向上选择</div>
            </div>
            <el-select v-model="navigationSettings.up" @change="saveNavigationSettings">
              <el-option label="↑ (方向键上)" value="ArrowUp" />
              <el-option label="K" value="KeyK" />
              <el-option label="W" value="KeyW" />
            </el-select>
          </el-card>
          
          <el-card class="key-setting-item" :body-style="{ padding: '16px', textAlign: 'center' }">
            <div class="key-label">
              <el-icon class="key-icon" size="24"><ArrowDown /></el-icon>
              <div class="key-text">向下选择</div>
            </div>
            <el-select v-model="navigationSettings.down" @change="saveNavigationSettings">
              <el-option label="↓ (方向键下)" value="ArrowDown" />
              <el-option label="J" value="KeyJ" />
              <el-option label="S" value="KeyS" />
            </el-select>
          </el-card>
          
          <el-card class="key-setting-item" :body-style="{ padding: '16px', textAlign: 'center' }">
            <div class="key-label">
              <el-icon class="key-icon" size="24"><Check /></el-icon>
              <div class="key-text">打开选中项</div>
            </div>
            <el-select v-model="navigationSettings.open" @change="saveNavigationSettings">
              <el-option label="Enter (回车键)" value="Enter" />
              <el-option label="Space (空格键)" value="Space" />
              <el-option label="O" value="KeyO" />
            </el-select>
          </el-card>
          
          <el-card class="key-setting-item" :body-style="{ padding: '16px', textAlign: 'center' }">
            <div class="key-label">
              <el-icon class="key-icon" size="24"><Close /></el-icon>
              <div class="key-text">关闭窗口</div>
            </div>
            <el-select v-model="navigationSettings.close" @change="saveNavigationSettings">
              <el-option label="Esc (退出键)" value="Escape" />
              <el-option label="Q" value="KeyQ" />
            </el-select>
          </el-card>
        </div>
        
        <el-alert 
          title="📝 提示："
          type="info"
          :closable="false"
          class="navigation-help"
        >
          <ul>
            <li>这些快捷键只在搜索结果页面中生效</li>
            <li>修改后即时生效，无需重启扩展</li>
            <li>建议选择不与浏览器默认快捷键冲突的按键</li>
          </ul>
        </el-alert>
      </el-card>

      <!-- 关于 -->
      <el-card class="setting-section">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><InfoFilled /></el-icon>
            <h2 class="header-title">关于插件</h2>
          </div>
        </template>
        
        <div class="about-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="版本">1.0.0</el-descriptions-item>
            <el-descriptions-item label="开发框架">WXT + Vue 3 + TypeScript + Element Plus</el-descriptions-item>
            <el-descriptions-item label="功能特性">
              <ul>
                <li>🔍 模糊搜索收藏夹和历史记录</li>
                <li>📁 按域名智能分组显示</li>
                <li>⚡ 实时搜索，响应迅速</li>
                <li>⭐ 历史记录一键收藏</li>
                <li>🆕 新标签页完整搜索界面</li>
                <li>🎨 Element Plus 现代化UI</li>
              </ul>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>
    
    <div class="settings-footer">
      <div class="footer-content">
        作者: lizeyu 如有问题请联系: 
        <a href="mailto:632795136@qq.com" class="footer-link">632795136@qq.com</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDown,
  ArrowUp,
  Check, Close,
  InfoFilled,
  Search,
  Setting,
  Tools
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

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
  defaultMaxResults: 50,
  defaultSortBy: 'relevance'
});

// 键盘导航设置
const navigationSettings = reactive({
  up: 'ArrowUp',
  down: 'ArrowDown',
  open: 'Enter',
  close: 'Escape'
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

// 加载键盘导航设置
const loadNavigationSettings = async () => {
  try {
    const result = await chrome.storage.local.get(['navigationSettings']);
    if (result.navigationSettings) {
      Object.assign(navigationSettings, result.navigationSettings);
    }
  } catch (error) {
    console.error('加载键盘导航设置失败:', error);
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
    ElMessage.error('保存设置失败，请重试');
  }
};

// 保存键盘导航设置
const saveNavigationSettings = async () => {
  try {
    await chrome.storage.local.set({ navigationSettings: navigationSettings });
    console.log('键盘导航设置已保存:', navigationSettings);
    
    // 显示保存成功提示
    showSaveSuccessMessage();
  } catch (error) {
    console.error('保存键盘导航设置失败:', error);
    ElMessage.error('保存设置失败，请重试');
  }
};

// 组件挂载时加载设置
onMounted(async () => {
  await loadShortcuts();
  await loadSearchSettings();
  await loadNavigationSettings();
});
</script>

<style lang="less" scoped>
@import '../entrypoints/styles/element-settings.less';
</style>
