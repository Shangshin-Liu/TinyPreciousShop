<template>
  <div class="product-listing-page">
    <div class="listing-header">
      <h2 class="page-title">{{ getCategoryEmoji(filters.category) }} {{ getCategoryPageTitle(filters.category) }}</h2>
      <!-- 管理員新增商品按鈕 -->
      <button 
        v-if="isAdmin" 
        class="btn-cute btn-primary add-product-btn" 
        @click="$emit('edit-product', null)"
      >
        ➕ 新增上架商品
      </button>
    </div>

    <!-- 手機版篩選器展開/收合按鈕 -->
    <div class="filter-toggle-container">
      <button 
        class="filter-toggle-btn"
        @click="isFilterExpanded = !isFilterExpanded"
        aria-label="展開或收合篩選條件"
      >
        🔍 {{ isFilterExpanded ? '收合篩選條件' : '展開篩選條件' }}
      </button>
    </div>

    <div class="listing-layout">
      <!-- 左側篩選器 -->
      <aside class="filter-sidebar card-cute" :class="{ 'mobile-hidden': !isFilterExpanded }">
        <h3 class="filter-title">🔍 篩選小物</h3>
        
        <!-- 模糊搜尋 (搜尋名稱) -->
        <div class="filter-group">
          <label for="search-input">搜尋名稱</label>
          <input 
            id="search-input"
            type="text" 
            v-model="filters.searchQuery" 
            placeholder="輸入關鍵字..." 
            class="input-cute"
          />
        </div>

        <!-- 價格篩選 (已售出分頁不顯示) -->
        <div class="filter-group" v-if="filters.category !== 'sold'">
          <label>價格區間</label>
          <div class="filter-options">
            <button 
              class="filter-opt-btn" 
              :class="{ active: filters.priceRange === 'all' }"
              @click="filters.priceRange = 'all'"
            >
              不限金額
            </button>
            <button 
              class="filter-opt-btn" 
              :class="{ active: filters.priceRange === 'under-200' }"
              @click="filters.priceRange = 'under-200'"
            >
              $200 以下
            </button>
            <button 
              class="filter-opt-btn" 
              :class="{ active: filters.priceRange === '200-400' }"
              @click="filters.priceRange = '200-400'"
            >
              $200 - $400
            </button>
            <button 
              class="filter-opt-btn" 
              :class="{ active: filters.priceRange === 'over-400' }"
              @click="filters.priceRange = 'over-400'"
            >
              $400 以上
            </button>
          </div>
        </div>

        <!-- 物況篩選 (已售出分頁不顯示) -->
        <div class="filter-group" v-if="filters.category !== 'sold'">
          <label>物品狀況</label>
          <div class="filter-options">
            <button 
              class="filter-opt-btn" 
              :class="{ active: filters.condition === 'all' }"
              @click="filters.condition = 'all'"
            >
              不限物況
            </button>
            <button 
              class="filter-opt-btn" 
              :class="{ active: filters.condition === 'new' }"
              @click="filters.condition = 'new'"
            >
              全新小物
            </button>
            <button 
              class="filter-opt-btn" 
              :class="{ active: filters.condition === 'used' }"
              @click="filters.condition = 'used'"
            >
              二手挖寶
            </button>
          </div>
        </div>

        <button class="btn-cute btn-secondary reset-btn" @click="resetFilters">
          🔄 重設篩選條件
        </button>
      </aside>

      <!-- 右側商品網格 -->
      <main class="products-container">
        <div v-if="filteredProducts.length === 0" class="no-products card-cute">
          <span class="no-products-icon">📦</span>
          <h3>沒有找到符合條件的小物...</h3>
          <p>試試看調整篩選條件吧！</p>
        </div>

        <div v-else class="grid-products">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="product-card"
            @click="$emit('view-product', product.id)"
          >
            <!-- 隱藏暗門編輯鉛筆 (已售出項目不可編輯) -->
            <button 
              v-if="isAdmin && product.status !== 'sold'" 
              class="edit-pencil-btn" 
              @click.stop="emit('edit-product', product)"
              title="編輯商品"
              aria-label="編輯商品"
            >
              ✏️
            </button>

            <div class="product-img-wrapper">
              <!-- 收藏愛心按鈕 (已售出不可收藏也不顯示此按鈕) -->
              <button 
                v-if="product.status !== 'sold'"
                class="favorite-heart-btn"
                :class="{ 'is-favorited': isProductFavorited(product) }"
                @click.stop="emit('toggle-favorite', product)"
                :title="isProductFavorited(product) ? '取消收藏' : '加入收藏'"
                :aria-label="isProductFavorited(product) ? '取消收藏' : '加入收藏'"
              >
                {{ isProductFavorited(product) ? '❤️' : '🤍' }}
              </button>

              <img :src="product.image_urls.split(',')[0]" :alt="product.product_name" class="product-img" />
              <div v-if="product.status === 'sold'" class="sold-overlay">
                <span class="sold-text">已售出</span>
              </div>
            </div>

            <div class="product-info">
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span class="badge badge-pink category-tag">{{ getCategoryLabel(product.category) }}</span>
                <span v-if="product.status === 'hidden'" class="badge badge-sold" style="font-size: 0.75rem; padding: 2px 8px;">隱藏中</span>
                <span v-if="getProductFavoritesCount(product) > 0" class="badge badge-mint category-tag" style="background-color: var(--bg-mint); border-color: #A3D9C9;">🔥 關注度：{{ getProductFavoritesCount(product) }}</span>
              </div>
              <h3 class="product-name" :title="product.product_name">{{ product.product_name }}</h3>
              
              <div class="product-footer">
                <span class="product-price">NT$ {{ product.price }}</span>
                <span class="detail-link-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed, ref } from 'vue';

const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  initialCategory: {
    type: String,
    default: 'accessories'
  },
  favorites: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['view-product', 'edit-product', 'toggle-favorite']);

const isProductFavorited = (product) => {
  return props.favorites.some(item => item.id === product.id);
};

const getProductFavoritesCount = (product) => {
  const base = parseInt(product.favoritesCount) || 0;
  return isProductFavorited(product) ? base + 1 : base;
};

// 手機版篩選器展開狀態，預設為收合 (false)
const isFilterExpanded = ref(false);

const filters = reactive({
  category: props.initialCategory,
  priceRange: 'all',
  condition: 'all',
  searchQuery: ''
});

// 當 props 的 initialCategory 改變時（例如點擊導覽列），同步更新篩選器
watch(() => props.initialCategory, (newVal) => {
  filters.category = newVal === 'all' ? 'accessories' : newVal;
  // 切換分類時，收合手機版篩選器
  isFilterExpanded.value = false;
});

const resetFilters = () => {
  filters.priceRange = 'all';
  filters.condition = 'all';
  filters.searchQuery = '';
};

const getCategoryLabel = (cat) => {
  const labels = {
    accessories: '飾品館',
    plushies: '娃娃區',
    grocery: '雜貨小舖',
    sold: '已售出'
  };
  return labels[cat] || cat;
};

const getCategoryPageTitle = (cat) => {
  const titles = {
    accessories: '尋寶小舖 • 飾品館',
    plushies: '尋寶小舖 • 娃娃區',
    grocery: '尋寶小舖 • 雜貨小舖',
    sold: '已售出商品專區'
  };
  return titles[cat] || '尋寶小舖';
};

const getCategoryEmoji = (cat) => {
  const emojis = {
    accessories: '💍',
    plushies: '🧸',
    grocery: '☕',
    sold: '🎉'
  };
  return emojis[cat] || '✨';
};

// 篩選邏輯重構
const filteredProducts = computed(() => {
  return props.products.filter(product => {
    // 1. 管理員可以看到 hidden，一般用戶只能看到 active 或已售出
    if (!props.isAdmin && product.status === 'hidden') {
      return false;
    }

    // 2. 售出分類與一般分類過濾
    if (filters.category === 'sold') {
      // 已售出分類：只列出已售出商品
      if (product.status !== 'sold') {
        return false;
      }
    } else {
      // 一般分類：排除已售出商品
      if (product.status === 'sold') {
        return false;
      }
      
      // 分類篩選
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }
    }

    // 3. 模糊關鍵字搜尋商品標題
    if (filters.searchQuery) {
      const query = filters.searchQuery.trim().toLowerCase();
      if (!product.product_name.toLowerCase().includes(query)) {
        return false;
      }
    }

    // 4. 價格篩選
    if (filters.category !== 'sold' && filters.priceRange !== 'all') {
      if (filters.priceRange === 'under-200' && product.price >= 200) {
        return false;
      } else if (filters.priceRange === '200-400' && (product.price < 200 || product.price > 400)) {
        return false;
      } else if (filters.priceRange === 'over-400' && product.price <= 400) {
        return false;
      }
    }

    // 5. 物況篩選
    if (filters.category !== 'sold' && filters.condition !== 'all') {
      const isNew = product.condition.includes('全新');
      if (filters.condition === 'new' && !isNew) {
        return false;
      } else if (filters.condition === 'used' && isNew) {
        return false;
      }
    }

    return true;
  });
});
</script>

<style scoped>
.product-listing-page {
  padding: 10px 0;
}

.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-title {
  font-size: 1.8rem;
  text-align: left;
}

.add-product-btn {
  font-size: 0.95rem;
  padding: 8px 20px;
}

.listing-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 30px;
  align-items: start;
}

/* 手機版折疊按鈕容器 */
.filter-toggle-container {
  display: none;
  justify-content: center;
  width: 100%;
  margin-bottom: 25px;
}

.filter-toggle-btn {
  background-color: #FFF;
  border: var(--border-thick);
  border-radius: var(--radius-lg);
  box-shadow: 3px 3px 0px var(--color-wood);
  color: var(--color-wood);
  font-family: var(--font-cute);
  font-weight: 700;
  font-size: 1rem;
  padding: 8px 32px;
  cursor: pointer;
  transition: all 0.1s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter-toggle-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0px var(--color-wood);
}

.filter-toggle-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px var(--color-wood);
}

/* 篩選側欄 */
.filter-sidebar {
  padding: 20px;
  background-color: var(--bg-cream);
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;
}

.filter-title {
  font-size: 1.2rem;
  margin-bottom: 2px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-wood);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-opt-btn {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: var(--border-thin);
  background-color: #FFF;
  color: var(--color-wood);
  font-family: var(--font-cute);
  font-weight: 700;
  font-size: 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.12s;
}

.filter-opt-btn:hover {
  background-color: var(--bg-pink);
  transform: translateX(3px);
}

.filter-opt-btn.active {
  background-color: var(--color-accent);
  color: #FFF;
}

.reset-btn {
  margin-top: 5px;
  font-size: 0.85rem;
  padding: 8px 16px;
}

/* 右側商品列表 */
.products-container {
  min-height: 400px;
}

.no-products {
  padding: 60px 40px;
  text-align: center;
  background-color: #FFF;
}

.no-products-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 12px;
}

.no-products h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
}

.no-products p {
  font-size: 0.9rem;
  color: var(--color-wood-light);
}

/* 收藏心形按鈕 */
.favorite-heart-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: var(--border-thin);
  background-color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 0px var(--color-wood);
  transition: transform 0.1s, background-color 0.15s;
  font-size: 0.95rem;
}

.favorite-heart-btn:hover {
  transform: scale(1.1);
  background-color: #FFF;
}

.favorite-heart-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px var(--color-wood);
}

.favorite-heart-btn.is-favorited {
  background-color: var(--bg-pink);
}

@media (max-width: 900px) {
  .listing-layout {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  .filter-toggle-container {
    display: flex;
  }
  .filter-sidebar.mobile-hidden {
    display: none !important;
  }
}
</style>
