# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 约束

所有对话和思考都必须使用中文输出，不允许使用英文

## Development Commands

### Build & Development

- `pnpm dev` - Start development server with Chrome browser extension
- `pnpm build` - Build production version
- `pnpm zip` - Package extension for distribution

### Package Management

- Uses `pnpm` (version 10.12.3) as package manager
- Main dependencies: Vue 3.5.17, Element Plus 2.9.11, TypeScript 5.8.3, UnoCSS 66.3.2
- Build tool: WXT 0.20.7 (browser extension framework)

## Project Architecture

### Core Technology Stack

- **Framework**: Vue 3 with Composition API (strict TypeScript)
- **Build Tool**: WXT (modern browser extension framework)
- **UI Library**: Element Plus with @element-plus/icons-vue
- **CSS Framework**: UnoCSS (atomic CSS - NO custom CSS allowed)
- **Package Manager**: pnpm

### Key Architecture Patterns

#### 1. Browser Extension Structure

- Uses WXT framework for modern browser extension development
- Supports Chrome Extension Manifest V3
- Entry points: `popup.html`, `settings.html`, `single_tab.html`, `file-browser.html`
- Background script handles global extension logic
- Content script for webpage interaction

#### 2. Composables-Based Architecture

Located in `utils/composables/`, these provide reusable reactive logic:

- `useSearch.ts` - Core search functionality with fuzzy matching
- `useBookmarks.ts` - Bookmark management and folder operations
- `useContentSearch.ts` - Content search across bookmarks, history, downloads
- `useSearchActions.ts` - Search result actions (open, copy, bookmark)
- `useNotification.ts` - Toast notifications and user feedback
- `useUI.ts` - UI state management and theming

#### 3. Search Engine Architecture

- **Multi-source search**: Bookmarks, browser history, download records
- **Fuzzy matching algorithm**: Supports Chinese/English mixed search with character sequence matching
- **Relevance scoring**: Weighted scoring based on title match, domain, visit count, file type
- **Domain-based grouping**: Results organized by domain with filtering
- **Time-based filtering**: Today, this week, this month, all time
- **Deduplication**: Bookmarks take precedence over history for same URLs

#### 4. Data Management

- **Browser APIs**: Uses `chrome.bookmarks`, `chrome.history`, `chrome.downloads`
- **Storage**: Local storage for search history (max 100 items) and user preferences
- **Search History**: Managed by `SearchHistoryManager` class with automatic deduplication
- **Type Safety**: Comprehensive TypeScript interfaces in `utils/types.ts`

#### 5. Component Structure

- **PopupApp.vue**: Main search interface with keyboard navigation
- **SearchControls.vue**: Search input, filters, and controls
- **SearchResultItem.vue**: Individual result display with actions
- **BookmarkDialog.vue**: Bookmark creation/editing modal
- **SettingsPage.vue**: Configuration interface
- **FileBrowserApp.vue**: File system browser (experimental feature)

## Code Style Requirements

### Vue.js Best Practices

- Use Composition API exclusively (no Options API)
- Implement strict TypeScript typing for all props and emits
- Keep components small and single-responsibility
- Use composables for reusable logic
- Implement proper lifecycle hooks

### CSS/Styling Rules

- **MANDATORY**: Use only UnoCSS framework - NO custom CSS allowed
- All styles must be atomic classes (e.g., `class="flex items-center p-4"`)
- Support both light and dark themes
- Use Element Plus components for UI consistency

### TypeScript Standards

- Use `interface` for object definitions, `type` for unions/intersections
- Avoid `any` - use `unknown` for uncertain types
- Enable strict mode (`strict: true`)
- Use descriptive names with helper verbs (`isLoading`, `hasError`)
- Implement proper error handling with custom error types

## Browser Extension Specific

### Permissions Required

- `bookmarks` - Read/write bookmark data
- `history` - Access browser history
- `downloads` - Access download records
- `storage` - Save user preferences and search history
- `tabs` - Open new tabs
- `commands` - Global keyboard shortcuts
- `activeTab` - Current tab operations

### WXT Configuration

- Vue module enabled via `@wxt-dev/module-vue`
- UnoCSS integration for styling
- Web accessible resources for search engine icons
- Chrome extension manifest V3 compliance

## Development Workflow

### Adding New Features

1. Create/update TypeScript interfaces in `utils/types.ts`
2. Implement business logic in appropriate composable
3. Update search algorithm in `utils/search.ts` if needed
4. Create/modify Vue components with proper TypeScript typing
5. Use only UnoCSS classes for styling
6. Test with both light and dark themes

### Search Algorithm Customization

- Fuzzy matching logic in `fuzzyMatch()` function
- Relevance scoring in `calculateRelevanceScore()` function
- Domain extraction and grouping in `searchBookmarksAndHistory()`
- Time filtering in `getTimeFilterStart()` function

### Storage Management

- Search history: `SearchHistoryManager` class
- User preferences: Browser storage API
- Maximum 100 search history items with automatic cleanup

## Important Notes

### Prohibited Practices

- Creating custom CSS (use UnoCSS only)
- Using Options API in Vue components
- Using `any` type in TypeScript
- Creating documentation files unless explicitly requested
- Directly manipulating DOM (use Vue reactivity)

### Performance Considerations

- Search debouncing (300ms delay)
- Lazy loading for large result sets
- Efficient domain-based grouping
- Memory-conscious search history management

### Browser Compatibility

- Chrome/Chromium-based browsers (primary target)
- Manifest V3 compliance
- Modern JavaScript features (ES2022+)
