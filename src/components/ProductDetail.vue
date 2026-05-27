<template>
  <div class="product-detail-page">
    <div class="back-nav">
      <button class="back-btn" @click="$emit('go-back')">← 返回商品列表</button>
    </div>

    <div v-if="product" class="detail-layout">
      <!-- 左側：主圖與縮圖畫廊 -->
      <div class="gallery-container">
        <!-- 編輯鉛筆 (已售出項目不可編輯) -->
        <button 
          v-if="isAdmin && product.status !== 'sold'" 
          class="edit-pencil-btn" 
          @click.stop="$emit('edit-product', product)"
          title="編輯商品"
          aria-label="編輯商品"
        >
          ✏️
        </button>

        <div class="main-image-wrapper card-cute">
          <img :src="activeImage" :alt="product.product_name" class="main-image" />
          <div v-if="product.status === 'sold'" class="sold-overlay">
            <span class="sold-text">已售出</span>
          </div>
        </div>

        <!-- 縮圖畫廊 -->
        <div class="thumbnail-gallery" v-if="imagesList.length > 0">
          <div 
            v-for="(img, idx) in imagesList" 
            :key="idx"
            class="thumbnail-wrapper"
            :class="{ active: activeImage === img }"
            @click="activeImage = img"
          >
            <img :src="img" :alt="product.product_name + ' 細節 ' + (idx + 1)" class="thumbnail-img" />
          </div>
        </div>
      </div>

      <!-- 右側：商品資訊 -->
      <div class="info-container">
        <div class="info-header">
          <span class="badge badge-pink category-tag">{{ getCategoryLabel(product.category) }}</span>
          <span v-if="product.status === 'hidden'" class="badge badge-sold">已隱藏</span>
        </div>

        <h1 class="product-title">{{ product.product_name }}</h1>
        <div class="price-tag">NT$ {{ product.price }}</div>

        <!-- 動態關注度顯示 -->
        <div v-if="getProductFavoritesCount > 0" class="detail-interest-badge">
          <span>🔥 目前關注度：{{ getProductFavoritesCount }} 人收藏</span>
        </div>

        <!-- 商品規格區 -->
        <div class="specs-box card-cute">
          <h3 class="specs-title">📐 商品規格</h3>
          <div class="specs-grid">
            <div class="spec-item">
              <span class="spec-label">材質：</span>
              <span class="spec-val">{{ product.material || '未標示' }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">尺寸：</span>
              <span class="spec-val">{{ product.dimensions || '未標示' }}</span>
            </div>
          </div>
        </div>

        <!-- 商品描述 -->
        <div class="description-box">
          <h3 class="desc-title">🌸 寶物故事與物況</h3>
          <p class="desc-text">{{ product.condition }}</p>
        </div>

        <!-- 操作按鈕 -->
        <div class="action-buttons">
          <button 
            class="btn-cute favorite-detail-btn"
            :class="[
              product.status === 'sold' ? 'btn-disabled' : (isProductFavorited ? 'btn-secondary' : 'btn-primary')
            ]"
            :disabled="product.status === 'sold'"
            @click="emit('toggle-favorite', product)"
          >
            {{ product.status === 'sold' ? '❤️ 已售出 (不可收藏)' : (isProductFavorited ? '💔 移除收藏' : '❤️ 收藏此商品') }}
          </button>
        </div>

        <!-- 免責說明區 (置底特殊底色) -->
        <div class="disclaimer-box">
          <h4>💡 二手小物購買小提醒</h4>
          <ul>
            <li>本小舖商品多為個人二手收藏或手作品，可能有些微歲月痕跡。</li>
            <li>商品照片皆為實物拍攝，由於光線及螢幕顯色不同，可能存在輕微色差。</li>
            <li>二手商品售出後恕不接受退換貨，請仔細確認尺寸與物況再行下單唷！</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="not-found card-cute">
      <h2>找不到該商品的資料 😰</h2>
      <button class="btn-cute btn-primary" @click="$emit('go-back')">回商品列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    default: null
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

const emit = defineEmits(['go-back', 'edit-product', 'toggle-favorite']);

const isProductFavorited = computed(() => {
  if (!props.product || !props.favorites) return false;
  return props.favorites.some(item => item.id === props.product.id);
});

const getProductFavoritesCount = computed(() => {
  if (!props.product) return 0;
  const base = parseInt(props.product.favoritesCount) || 0;
  return isProductFavorited.value ? base + 1 : base;
});

const activeImage = ref('');

// 圖片清單
const imagesList = computed(() => {
  if (!props.product || !props.product.image_urls) return [];
  const list = props.product.image_urls.split(',').map(url => url.trim()).filter(Boolean);
  
  // 如果商品只有一張圖，我們就模擬多張細節圖（用原圖，以達到畫廊效果）
  if (list.length === 1) {
    return [list[0], list[0], list[0]];
  }
  return list;
});

// 當商品改變時，重設 activeImage 為第一張圖片
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    const list = newProduct.image_urls.split(',').map(url => url.trim()).filter(Boolean);
    activeImage.value = list[0] || '';
  }
}, { immediate: true });

const getCategoryLabel = (cat) => {
  const labels = {
    accessories: '飾品館',
    plushies: '娃娃區',
    grocery: '雜貨小舖'
  };
  return labels[cat] || cat;
};
</script>

<style scoped>
.product-detail-page {
  padding: 20px 0;
  text-align: left;
}

.back-nav {
  margin-bottom: 25px;
}

.back-btn {
  background: none;
  border: none;
  font-family: var(--font-cute);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-wood-light);
  cursor: pointer;
  transition: color 0.15s;
}

.back-btn:hover {
  color: var(--color-accent);
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(300px, 420px) 1fr;
  gap: 40px;
  align-items: start;
}

/* 左側：相簿 */
.gallery-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  overflow: hidden;
  background-color: #FFF;
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(90, 69, 53, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.sold-text {
  background-color: var(--color-sold);
  color: #FFF;
  border: var(--border-thin);
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 700;
  font-size: 1.25rem;
}

.thumbnail-gallery {
  display: flex;
  gap: 10px;
}

.thumbnail-wrapper {
  width: 70px;
  height: 70px;
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  background-color: #FFF;
  transition: transform 0.1s, border-color 0.15s;
}

.thumbnail-wrapper:hover {
  transform: translateY(-2px);
}

.thumbnail-wrapper.active {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--bg-pink);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右側資訊 */
.info-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-header {
  display: flex;
  gap: 10px;
}

.product-title {
  font-size: 2rem;
  line-height: 1.3;
}

.price-tag {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-accent);
}

/* 規格 */
.specs-box {
  background-color: var(--bg-cream);
  padding: 20px;
  box-shadow: none; /* 規格區極簡，但可用手繪厚邊框 */
}

.specs-title {
  font-size: 1.1rem;
  margin-bottom: 12px;
}

.specs-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spec-item {
  display: flex;
  font-size: 1rem;
}

.spec-label {
  font-weight: 700;
  color: var(--color-wood-light);
  width: 70px;
  flex-shrink: 0;
}

.spec-val {
  color: var(--color-wood);
}

/* 描述 */
.description-box {
  border-top: 1px dashed rgba(90, 69, 53, 0.15);
  border-bottom: 1px dashed rgba(90, 69, 53, 0.15);
  padding: 20px 0;
}

.desc-title {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.desc-text {
  font-size: 1rem;
  color: var(--color-wood);
  white-space: pre-wrap;
}

/* 動態關注度標籤 */
.detail-interest-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--bg-mint);
  border: var(--border-thin);
  border-radius: 50px;
  padding: 6px 16px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-wood);
  align-self: flex-start;
  margin-top: -5px;
  margin-bottom: 5px;
}

/* 按鈕 */
.action-buttons {
  display: block;
}

.favorite-detail-btn {
  width: 100%;
  padding: 14px 20px;
  font-size: 1.1rem;
}

/* 免責說明 */
.disclaimer-box {
  background-color: var(--bg-pink);
  border: var(--border-thin);
  border-radius: var(--radius-md);
  padding: 20px;
  font-size: 0.85rem;
}

.disclaimer-box h4 {
  font-size: 0.95rem;
  margin-bottom: 10px;
}

.disclaimer-box ul {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.disclaimer-box li {
  color: var(--color-wood-light);
  line-height: 1.4;
}

.not-found {
  padding: 60px 20px;
  text-align: center;
  background-color: #FFF;
}

.not-found h2 {
  margin-bottom: 20px;
}

/* Edit button egg */
.edit-pencil-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: var(--border-thick);
  background-color: var(--bg-cream);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 3px 3px 0px var(--color-wood);
  transition: transform 0.1s;
  font-size: 1.3rem;
}

.edit-pencil-btn:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>
