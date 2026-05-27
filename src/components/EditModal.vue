<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')" aria-label="關閉編輯視窗">×</button>
      <h3 class="modal-title">📝 {{ editedProduct.id ? '編輯商品資訊' : '新增上架商品' }}</h3>
      
      <form @submit.prevent="handleSave" class="edit-form">
        <div class="form-group">
          <label for="edit-name">商品名稱</label>
          <input
            id="edit-name"
            type="text"
            v-model="editedProduct.product_name"
            class="input-cute"
            required
          />
        </div>

        <div class="form-group-row">
          <div class="form-group">
            <label for="edit-price">價格 (NTD)</label>
            <input
              id="edit-price"
              type="number"
              v-model.number="editedProduct.price"
              class="input-cute"
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label for="edit-status">商品狀態</label>
            <select id="edit-status" v-model="editedProduct.status" class="input-cute">
              <option value="active">上架中 (Active)</option>
              <option value="hidden">隱藏 (Hidden)</option>
              <option value="sold">已售出 (Sold)</option>
            </select>
          </div>
        </div>

        <!-- 是否設為熱門商品 -->
        <div class="form-group" style="flex-direction: row; align-items: center; gap: 8px; margin: 5px 0;">
          <input
            id="edit-is-hot"
            type="checkbox"
            v-model="editedProduct.isHot"
            style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--color-accent);"
          />
          <label for="edit-is-hot" style="cursor: pointer; margin-bottom: 0; user-select: none; color: var(--color-wood);">🔥 設為熱門商品</label>
        </div>

        <!-- 分類選擇 -->
        <div class="form-group">
          <label for="edit-category">商品分類</label>
          <select id="edit-category" v-model="editedProduct.category" class="input-cute" required>
            <option value="accessories">💍 飾品館</option>
            <option value="plushies">🧸 娃娃區</option>
            <option value="grocery">☕ 雜貨小舖</option>
          </select>
        </div>

        <div class="form-group">
          <label for="edit-material">材質</label>
          <input
            id="edit-material"
            type="text"
            v-model="editedProduct.material"
            class="input-cute"
          />
        </div>

        <div class="form-group">
          <label for="edit-dimensions">尺寸</label>
          <input
            id="edit-dimensions"
            type="text"
            v-model="editedProduct.dimensions"
            class="input-cute"
          />
        </div>

        <div class="form-group">
          <label for="edit-image">圖片路徑 (多張以逗號分隔)</label>
          <input
            id="edit-image"
            type="text"
            v-model="editedProduct.image_urls"
            class="input-cute"
            placeholder="/images/cat_earrings.png"
            required
          />
        </div>

        <div class="form-group">
          <label for="edit-condition">物況描述</label>
          <textarea
            id="edit-condition"
            v-model="editedProduct.condition"
            class="input-cute"
            rows="3"
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <button 
            v-if="editedProduct.id" 
            type="button" 
            class="btn-cute delete-btn" 
            @click="handleDelete"
          >
            🗑️ 刪除商品
          </button>
          <button type="button" class="btn-cute btn-secondary" @click="$emit('close')">取消</button>
          <button type="submit" class="btn-cute btn-primary">儲存修改</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    default: () => ({
      id: '',
      product_name: '',
      category: 'accessories',
      price: 0,
      material: '',
      dimensions: '',
      condition: '',
      image_urls: '/images/cat_earrings.png',
      status: 'active',
      isHot: false
    })
  }
});

const emit = defineEmits(['close', 'save', 'delete']);

// 複製一份資料以免直接修改 prop
const editedProduct = reactive(props.product ? { ...props.product } : {
  id: '',
  product_name: '',
  category: 'accessories',
  price: 0,
  material: '',
  dimensions: '',
  condition: '',
  image_urls: '/images/cat_earrings.png',
  status: 'active',
  isHot: false
});

const handleSave = () => {
  emit('save', { ...editedProduct });
};

const handleDelete = () => {
  if (confirm(`確定要刪除「${editedProduct.product_name}」嗎？此動作將同步移出試算表且無法復原唷！`)) {
    emit('delete', editedProduct.id);
  }
};
</script>

<style scoped>
.modal-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.form-group-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

label {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-wood-light);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px;
  align-items: center;
}

.delete-btn {
  background-color: #FFF2F2;
  border-color: #FF8A8A;
  color: #D32F2F;
  margin-right: auto;
}

.delete-btn:hover {
  background-color: #FFE3E3;
}
</style>
