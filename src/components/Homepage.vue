<template>
  <div class="homepage">
    <!-- Hero Banner -->
    <section class="hero-section">
      <div class="hero-content">
        <h2 class="hero-title">遇見屬於你的小幸運 ✨</h2>
        <p class="hero-subtitle">讓可愛的小物、溫柔的二手雜貨，再次溫暖你的日常生活。</p>
      </div>
      <div class="hero-decoration">
        <div class="cute-bubble bubble-1">🧸</div>
        <div class="cute-bubble bubble-2">💍</div>
        <div class="cute-bubble bubble-3">🌸</div>
      </div>
    </section>

    <!-- 熱門商品區塊 -->
    <section class="recent-products-section">
      <!-- 💍 飾品館熱門商品 -->
      <div class="category-hot-group">
        <h3 class="section-title">💍 飾品館熱門推薦</h3>
        <div v-if="accessoriesHotProducts.length === 0" class="no-hot-products card-cute">
          <span class="no-hot-emoji">💍</span>
          <p>目前沒有飾品館的熱門商品 🌸</p>
        </div>
        <div v-else :class="['hot-products-container', accessoriesHotProducts.length > 3 ? 'slider-mode' : 'center-mode']">
          <div 
            class="product-card"
            v-for="product in accessoriesHotProducts" 
            :key="product.id" 
            @click="emit('view-product', product.id)"
          >
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

              <img :src="getImageUrl(product.image_urls)" :alt="product.product_name" class="product-img" />
              <div v-if="product.status === 'sold'" class="sold-overlay">
                <span class="sold-text">已售出</span>
              </div>
            </div>
            <div class="product-info">
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span class="badge badge-pink category-tag">{{ getCategoryLabel(product.category) }}</span>
                <span v-if="getProductFavoritesCount(product) > 0" class="badge badge-mint category-tag" style="background-color: var(--bg-mint); border-color: #A3D9C9; font-size: 0.8rem; padding: 2px 10px;">🔥 關注度：{{ getProductFavoritesCount(product) }}</span>
              </div>
              <h4 class="product-name" :title="product.product_name">{{ product.product_name }}</h4>
              
              <div class="product-footer">
                <span class="product-price">NT$ {{ product.price }}</span>
                <span class="detail-link-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🧸 娃娃區熱門商品 -->
      <div class="category-hot-group">
        <h3 class="section-title">🧸 娃娃區熱門推薦</h3>
        <div v-if="plushiesHotProducts.length === 0" class="no-hot-products card-cute">
          <span class="no-hot-emoji">🧸</span>
          <p>目前沒有娃娃區的熱門商品 🌸</p>
        </div>
        <div v-else :class="['hot-products-container', plushiesHotProducts.length > 3 ? 'slider-mode' : 'center-mode']">
          <div 
            class="product-card"
            v-for="product in plushiesHotProducts" 
            :key="product.id" 
            @click="emit('view-product', product.id)"
          >
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

              <img :src="getImageUrl(product.image_urls)" :alt="product.product_name" class="product-img" />
              <div v-if="product.status === 'sold'" class="sold-overlay">
                <span class="sold-text">已售出</span>
              </div>
            </div>
            <div class="product-info">
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span class="badge badge-pink category-tag">{{ getCategoryLabel(product.category) }}</span>
                <span v-if="getProductFavoritesCount(product) > 0" class="badge badge-mint category-tag" style="background-color: var(--bg-mint); border-color: #A3D9C9; font-size: 0.8rem; padding: 2px 10px;">🔥 關注度：{{ getProductFavoritesCount(product) }}</span>
              </div>
              <h4 class="product-name" :title="product.product_name">{{ product.product_name }}</h4>
              
              <div class="product-footer">
                <span class="product-price">NT$ {{ product.price }}</span>
                <span class="detail-link-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ☕ 雜貨小舖熱門商品 -->
      <div class="category-hot-group">
        <h3 class="section-title">☕ 雜貨小舖熱門推薦</h3>
        <div v-if="groceryHotProducts.length === 0" class="no-hot-products card-cute">
          <span class="no-hot-emoji">☕</span>
          <p>目前沒有雜貨小舖的熱門商品 🌸</p>
        </div>
        <div v-else :class="['hot-products-container', groceryHotProducts.length > 3 ? 'slider-mode' : 'center-mode']">
          <div 
            class="product-card"
            v-for="product in groceryHotProducts" 
            :key="product.id" 
            @click="emit('view-product', product.id)"
          >
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

              <img :src="getImageUrl(product.image_urls)" :alt="product.product_name" class="product-img" />
              <div v-if="product.status === 'sold'" class="sold-overlay">
                <span class="sold-text">已售出</span>
              </div>
            </div>
            <div class="product-info">
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span class="badge badge-pink category-tag">{{ getCategoryLabel(product.category) }}</span>
                <span v-if="getProductFavoritesCount(product) > 0" class="badge badge-mint category-tag" style="background-color: var(--bg-mint); border-color: #A3D9C9; font-size: 0.8rem; padding: 2px 10px;">🔥 關注度：{{ getProductFavoritesCount(product) }}</span>
              </div>
              <h4 class="product-name" :title="product.product_name">{{ product.product_name }}</h4>
              
              <div class="product-footer">
                <span class="product-price">NT$ {{ product.price }}</span>
                <span class="detail-link-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  favorites: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-category', 'view-product', 'edit-product', 'toggle-favorite']);

const isProductFavorited = (product) => {
  return props.favorites.some(item => item.id === product.id);
};

const getProductFavoritesCount = (product) => {
  return parseInt(product.favoritesCount) || 0;
};

// 篩選各分類下 isHot === true 且狀態非 hidden 的熱門商品
const accessoriesHotProducts = computed(() => {
  return props.products.filter(p => p.isHot && p.category === 'accessories' && (p.status === 'active' || p.status === 'sold'));
});

const plushiesHotProducts = computed(() => {
  return props.products.filter(p => p.isHot && p.category === 'plushies' && (p.status === 'active' || p.status === 'sold'));
});

const groceryHotProducts = computed(() => {
  return props.products.filter(p => p.isHot && p.category === 'grocery' && (p.status === 'active' || p.status === 'sold'));
});

const getCategoryLabel = (cat) => {
  const labels = {
    accessories: '飾品館',
    plushies: '娃娃區',
    grocery: '雜貨小舖'
  };
  return labels[cat] || cat;
};

// 取得正確的圖片靜態資源 URL，防 GitHub Pages 破圖
const getImageUrl = (urlStr) => {
  if (!urlStr) return '';
  const firstUrl = urlStr.split(',')[0].trim();
  if (firstUrl.startsWith('http://') || firstUrl.startsWith('https://') || firstUrl.startsWith('data:')) {
    return firstUrl;
  }
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${firstUrl.replace(/^\//, '')}`;
};
</script>

<style scoped>
.homepage {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 10px 0;
}

/* Hero Section */
.hero-section {
  position: relative;
  background-color: var(--bg-cream);
  border: var(--border-thick);
  border-radius: var(--radius-lg);
  padding: 50px 30px;
  text-align: center;
  overflow: hidden;
  box-shadow: var(--shadow-flat);
}

.hero-title {
  font-size: 2.2rem;
  margin-bottom: 12px;
  color: var(--color-wood);
}

.hero-subtitle {
  font-size: 1rem;
  color: var(--color-wood-light);
  font-weight: 500;
  max-width: 550px;
  margin: 0 auto;
}

.hero-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.cute-bubble {
  position: absolute;
  font-size: 1.8rem;
  animation: float 4s ease-in-out infinite;
}

.bubble-1 { top: 20px; left: 20px; animation-delay: 0s; }
.bubble-2 { bottom: 20px; right: 30px; animation-delay: 1.5s; }
.bubble-3 { top: 30px; right: 50px; animation-delay: 0.7s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(8deg); }
}

/* Sections */
.section-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: left;
  border-bottom: 2px dashed var(--color-wood-light);
  padding-bottom: 8px;
}

/* 分類熱門商品群組 */
.category-hot-group {
  margin-bottom: 35px;
}

.category-hot-group:last-child {
  margin-bottom: 0;
}

/* 沒有熱門商品的空白狀態 */
.no-hot-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  border: 2px dashed var(--color-wood-light);
  border-radius: var(--radius-lg);
  background-color: var(--bg-cream);
  color: var(--color-wood-light);
  gap: 10px;
  text-align: center;
  transition: all 0.2s;
}

.no-hot-emoji {
  font-size: 2rem;
  opacity: 0.7;
}

/* 熱門商品容器 */
.hot-products-container {
  width: 100%;
}

/* 1. 左右滑動模式 (當數量 > 3 時) */
.hot-products-container.slider-mode {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 10px 4px 20px 4px; /* 留緩衝給卡片陰影與 hover 位移 */
  margin: -10px -4px -20px -4px;
  scrollbar-width: none; /* Firefox 隱藏滾動條 */
}

.hot-products-container.slider-mode::-webkit-scrollbar {
  display: none; /* Chrome/Safari 隱藏滾動條 */
}

.hot-products-container.slider-mode .product-card {
  flex: 0 0 calc(33.333% - 12px); /* 不論 PC/手機均一排 3 個 */
  min-width: 100px;
}

/* 2. 置中模式 (當數量 <= 3 時) */
.hot-products-container.center-mode {
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
  padding: 10px 0;
}

.hot-products-container.center-mode .product-card {
  flex: 0 1 calc(33.333% - 12px);
  max-width: 320px;
}

/* 響應式微調：調整 Gap 使一排三個卡片在窄螢幕下依然完美 */
@media (max-width: 768px) {
  .hot-products-container.slider-mode {
    gap: 8px;
  }
  .hot-products-container.slider-mode .product-card {
    flex: 0 0 calc(33.333% - 5.3px);
  }
  
  .hot-products-container.center-mode {
    gap: 8px;
  }
  .hot-products-container.center-mode .product-card {
    flex: 0 1 calc(33.333% - 5.3px);
  }
  .hero-section {
    padding: 30px 15px;
  }
  .hero-title {
    font-size: 1.8rem;
  }
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
</style>
