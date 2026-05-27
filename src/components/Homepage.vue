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

    <!-- 分類區 -->
    <section class="categories-section">
      <h3 class="section-title">🍓 療癒分類</h3>
      <div class="categories-grid">
        <div class="category-card" @click="$emit('select-category', 'accessories')">
          <div class="category-icon">💍</div>
          <h4>飾品館</h4>
          <p>耳環 • 戒指 • 項鍊</p>
        </div>
        <div class="category-card card-pink" @click="$emit('select-category', 'plushies')">
          <div class="category-icon">🧸</div>
          <h4>娃娃區</h4>
          <p>軟綿綿 • 療癒玩偶</p>
        </div>
        <div class="category-card card-cream" @click="$emit('select-category', 'grocery')">
          <div class="category-icon">☕</div>
          <h4>雜貨小舖</h4>
          <p>精緻餐具 • 生活擺飾</p>
        </div>
      </div>
    </section>

    <!-- 熱門商品 -->
    <section class="recent-products-section">
      <h3 class="section-title">✨ 熱門商品</h3>
      <div class="grid-products">
        <div 
          v-for="product in hotProducts" 
          :key="product.id" 
          class="product-card"
          @click="$emit('view-product', product.id)"
        >
          <!-- 管理暗門編輯鉛筆 (已售出項目不可編輯) -->
          <button 
            v-if="isAdmin && product.status !== 'sold'" 
            class="edit-pencil-btn" 
            @click.stop="$emit('edit-product', product)"
            title="編輯商品"
            aria-label="編輯商品"
          >
            ✏️
          </button>

          <div class="product-img-wrapper">
            <img :src="product.image_urls.split(',')[0]" :alt="product.product_name" class="product-img" />
            <div v-if="product.status === 'sold'" class="sold-overlay">
              <span class="sold-text">已售出</span>
            </div>
          </div>
          <div class="product-info">
            <span class="badge badge-pink category-tag">{{ getCategoryLabel(product.category) }}</span>
            <h4 class="product-name" :title="product.product_name">{{ product.product_name }}</h4>
            
            <div class="product-footer">
              <span class="product-price">NT$ {{ product.price }}</span>
              <span class="detail-link-arrow">→</span>
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
  }
});

defineEmits(['select-category', 'view-product', 'edit-product']);

// 篩選 isHot === true 且狀態非 hidden 的前 4 個商品作為熱門商品
const hotProducts = computed(() => {
  return props.products
    .filter(p => p.isHot && (p.status === 'active' || p.status === 'sold'))
    .slice(0, 4);
});

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

/* Categories */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.category-card {
  background-color: #FFF;
  border: var(--border-thick);
  border-radius: var(--radius-lg);
  padding: 20px;
  cursor: pointer;
  box-shadow: var(--shadow-flat);
  transition: all 0.2s;
  text-align: center;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-flat-hover);
  background-color: #FFFDF0;
}

.category-card.card-pink {
  background-color: var(--bg-pink);
}
.category-card.card-pink:hover {
  background-color: #FFF2F2;
}

.category-card.card-cream {
  background-color: var(--bg-cream);
}
.category-card.card-cream:hover {
  background-color: #FFFDF0;
}

.category-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.category-card h4 {
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.category-card p {
  font-size: 0.8rem;
  color: var(--color-wood-light);
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .hero-section {
    padding: 30px 15px;
  }
  .hero-title {
    font-size: 1.8rem;
  }
}
</style>
