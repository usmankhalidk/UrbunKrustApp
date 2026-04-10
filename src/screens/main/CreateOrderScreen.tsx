import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {
  Search,
  ChevronDown,
  User,
  Phone,
  FileText,
  ShoppingCart,
  Tag,
  UtensilsCrossed,
  X,
  MapPin,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { posService, PosMenuItem, PosCategory, PosDeal, PosTable, PosCounter, PosVariant } from '../../services/posService';
import { useCartStore } from '../../store/useCartStore';
import { ImageWithSkeleton } from '../../components/ImageWithSkeleton';

const TYPE_TABS = [
  { key: 'Menu Items', icon: 'utensils' },
  { key: 'Deals', icon: 'tag' },
];

const ORDER_TYPES = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];

const formatOrderTypeUI = (type: string) => type.replace('_', '-');

export const CreateOrderScreen = () => {
  const { colors } = useTheme();

  // Global Cart State
  const cart = useCartStore();
  const scrollRef = useRef<ScrollView>(null);

  // Data State
  const [categories, setCategories] = useState<PosCategory[]>([]);
  const [menuItems, setMenuItems] = useState<PosMenuItem[]>([]);
  const [deals, setDeals] = useState<PosDeal[]>([]);
  const [tables, setTables] = useState<PosTable[]>([]);
  const [counters, setCounters] = useState<PosCounter[]>([]); // Counters
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // UI Flow State
  const [activeTypeTab, setActiveTypeTab] = useState('Menu Items');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeOrderType, setActiveOrderType] = useState('DINE_IN');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedCounterId, setSelectedCounterId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Modal State
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [tableModalVisible, setTableModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PosMenuItem | null>(null);
  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, itemsRes, dealsRes, tablesRes, countRes] = await Promise.all([
        posService.getCategories(),
        posService.getMenuItems(),
        posService.getDeals(),
        posService.getTables(),
        posService.getCounters(),
      ]);

      if (catRes.success) setCategories(catRes.data || []);
      if (itemsRes.success) setMenuItems(itemsRes.data || []);
      if (dealsRes.success) setDeals(dealsRes.data || []);
      if (tablesRes.success) setTables(tablesRes.data || []);
      if (countRes.success) {
        setCounters(countRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch POS data', error);
      showToast('Failed to load menu data. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = (product: PosMenuItem) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      setVariantModalVisible(true);
    } else {
      // Add directly to cart
      cart.addItem({
        cartItemId: '', // assigned in store
        menuItemId: product.id,
        name: product.name,
        basePrice: parseFloat(product.price) || 0,
        quantity: 1,
        isDeal: false,
        dealId: null,
        variantInfo: null,
      });
      showToast(`Added ${product.name}`, 'success');
    }
  };

  const handleVariantSelect = (variant: PosVariant) => {
    if (selectedProduct) {
      cart.addItem({
        cartItemId: '',
        menuItemId: selectedProduct.id,
        name: selectedProduct.name,
        basePrice: parseFloat(selectedProduct.price) || 0,
        quantity: 1,
        isDeal: false,
        dealId: null,
        variantInfo: {
          variantId: variant.id,
          variantName: variant.name,
          priceModifier: parseFloat(variant.priceModifier) || 0,
        },
      });
      showToast(`Added ${selectedProduct.name} (${variant.name})`, 'success');
    }
    setVariantModalVisible(false);
    setSelectedProduct(null);
  };

  const handleDealPress = (deal: PosDeal) => {
    cart.addItem({
      cartItemId: '',
      menuItemId: deal.id, // For deals, using deal ID here works as placeholder
      name: deal.name,
      basePrice: parseFloat(deal.price) || 0,
      quantity: 1,
      isDeal: true,
      dealId: deal.id,
      variantInfo: null,
    });
    showToast(`Added ${deal.name}`, 'success');
  };

  const handlePlaceOrder = async () => {
    setAttemptedSubmit(true);
    
    if (cart.items.length === 0) {
      showToast('Basket is empty. Add items first.', 'error');
      return;
    }
    if (!selectedCounterId) {
      showToast('Please select a counter.', 'error');
      return;
    }
    if (activeOrderType === 'DINE_IN' && !selectedTableId) {
      showToast('Please select a table for Dine-in orders.', 'error');
      return;
    }
    if (!customerName.trim()) {
      showToast('Please enter customer name.', 'error');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Please enter customer phone.', 'error');
      return;
    }
    if (activeOrderType === 'DELIVERY' && !deliveryAddress.trim()) {
      showToast('Please provide a delivery address.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Construct Payload
      const itemsPayload = cart.items.map(item => ({
        menuItemId: item.isDeal ? item.menuItemId : item.menuItemId, // Note: Deal needs explicit handling on backend if different. Our payload example only showed menuItemId.
        variantId: item.variantInfo?.variantId || null,
        quantity: item.quantity,
        notes: "", 
      }));

      const payload = {
        counterId: selectedCounterId,
        tableId: activeOrderType === 'DINE_IN' ? selectedTableId : null,
        orderType: activeOrderType,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: activeOrderType === 'DELIVERY' ? deliveryAddress.trim() : null,
        notes: orderNotes.trim(),
        items: cart.items.filter(i => !i.isDeal).map(item => ({
          menuItemId: item.menuItemId,
          variantId: item.variantInfo?.variantId || null,
          quantity: item.quantity,
          notes: "",
        })),
        deals: cart.items.filter(i => i.isDeal).map(dealItem => ({
          dealId: dealItem.dealId,
          quantity: dealItem.quantity,
          notes: ""
        })),
      };

      const res = await posService.createOrder(payload);
      if (res.success) {
        showToast('Order placed successfully!', 'success');
        // Reset Form
        cart.clearCart();
        setCustomerName('');
        setCustomerPhone('');
        setOrderNotes('');
        setDeliveryAddress('');
        setSelectedTableId(null);
        setSelectedCounterId(null);
      } else {
        showToast(res.message || 'Failed to create order', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create order. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    if (activeCategory && item.categoryId !== activeCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredDeals = deals.filter(deal => {
    if (searchQuery && !deal.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        
        {/* ── TOP TABS (Menu / Deals) ── */}
        <View style={[styles.topTabsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {TYPE_TABS.map(({ key, icon }) => {
            const isActive = activeTypeTab === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.topTab,
                  isActive && { backgroundColor: colors.primary, borderRadius: moderateScale(18) },
                ]}
                onPress={() => {
                  setActiveTypeTab(key);
                  setSearchQuery('');
                }}
              >
                {icon === 'utensils' ? (
                  <UtensilsCrossed size={13} color={isActive ? '#FFF' : colors.subtext} style={{ marginRight: 4 }} />
                ) : (
                  <Tag size={13} color={isActive ? '#FFF' : colors.subtext} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.topTabText, { color: isActive ? '#FFF' : colors.subtext }]}>
                  {key === 'Deals' ? `Deals (${deals.length})` : key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── CATEGORY PILLS (Only for Menu Items) ── */}
        {activeTypeTab === 'Menu Items' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[
                styles.categoryPill,
                {
                  backgroundColor: activeCategory === null ? colors.primary : colors.surface,
                  borderColor: activeCategory === null ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveCategory(null)}
            >
              <Text style={[styles.categoryText, { color: activeCategory === null ? '#FFF' : colors.subtext }]}>
                All Items
              </Text>
            </TouchableOpacity>
            
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setActiveCategory(cat.id)}
                >
                  <Text style={[styles.categoryText, { color: isActive ? '#FFF' : colors.subtext }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── SEARCH ── */}
        <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search color={colors.subtext} size={15} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Search ${activeTypeTab.toLowerCase()}...`}
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ── PRODUCTS / DEALS GRID ── */}
        <View style={styles.productsGrid}>
          {activeTypeTab === 'Menu Items' ? (
            filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.productCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} activeOpacity={0.7} onPress={() => handleProductPress(item)}>
                  <View style={[styles.productImageBox, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                    {item.image ? (
                      <ImageWithSkeleton source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                      <UtensilsCrossed color={colors.subtext} size={28} opacity={0.4} />
                    )}
                    <View style={[styles.codeTag, { backgroundColor: colors.primary }]}>
                      <Text style={styles.codeTagText}>{item.itemCode?.toUpperCase() || 'ITEM'}</Text>
                    </View>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>RS. {item.price || '0'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{color: colors.subtext, marginVertical: 20, textAlign: 'center', width: '100%'}}>No items found.</Text>
            )
          ) : (
            filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => (
                <TouchableOpacity key={deal.id} style={[styles.productCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} activeOpacity={0.7} onPress={() => handleDealPress(deal)}>
                  <View style={[styles.productImageBox, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                    {(deal as any).image ? (
                      <ImageWithSkeleton source={{ uri: (deal as any).image }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                      <Tag color={colors.subtext} size={28} opacity={0.4} />
                    )}
                    <View style={[styles.codeTag, { backgroundColor: colors.secondary || colors.primary }]}>
                      <Text style={styles.codeTagText}>DEAL</Text>
                    </View>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{deal.name}</Text>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>RS. {deal.price}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
               <Text style={{color: colors.subtext, marginVertical: 20, textAlign: 'center', width: '100%'}}>No deals found.</Text>
            )
          )}
        </View>

        {/* ── CHECKOUT FORM ── */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Order Type Tabs */}
          <View style={[styles.orderTypeRow, { borderBottomColor: colors.border }]}>
            {ORDER_TYPES.map((type) => {
              const isActive = activeOrderType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.orderTypeTab, isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                  onPress={() => {
                    setActiveOrderType(type);
                    if (type !== 'DINE_IN') setSelectedTableId(null);
                  }}
                >
                  <Text style={[styles.orderTypeText, { color: isActive ? colors.primary : colors.subtext }]}>
                    {formatOrderTypeUI(type)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dropdowns */}
          <View style={styles.twoColRow}>
            <View style={styles.colGroup}>
              <Text style={[styles.fieldLabel, { color: (attemptedSubmit && !selectedCounterId) ? '#EF4444' : colors.subtext }]}>COUNTER *</Text>
              <TouchableOpacity style={[styles.selectBox, { borderColor: (attemptedSubmit && !selectedCounterId) ? '#EF4444' : colors.border }]} onPress={() => setCounterModalVisible(true)}>
                <Text style={[styles.selectText, { color: selectedCounterId ? colors.text : colors.subtext }]}>
                  {counters.find(c => c.id === selectedCounterId)?.name || 'Select Counter'}
                </Text>
                <ChevronDown color={(attemptedSubmit && !selectedCounterId) ? '#EF4444' : colors.subtext} size={14} />
              </TouchableOpacity>
            </View>

            {activeOrderType === 'DINE_IN' && (
              <View style={styles.colGroup}>
                <Text style={[styles.fieldLabel, { color: (attemptedSubmit && !selectedTableId) ? '#EF4444' : colors.subtext }]}>TABLE *</Text>
                <TouchableOpacity style={[styles.selectBox, { borderColor: (attemptedSubmit && !selectedTableId) ? '#EF4444' : colors.border }]} onPress={() => setTableModalVisible(true)}>
                  <Text style={[styles.selectText, { color: selectedTableId ? colors.text : colors.subtext }]}>
                    {tables.find(t => t.id === selectedTableId)?.tableNumber || 'Select Table'}
                  </Text>
                  <ChevronDown color={(attemptedSubmit && !selectedTableId) ? '#EF4444' : colors.subtext} size={14} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Name + Phone */}
          <View style={styles.twoColRow}>
            <View style={[styles.textFieldBox, { borderColor: (attemptedSubmit && !customerName.trim()) ? '#EF4444' : colors.border }]}>
              <User color={(attemptedSubmit && !customerName.trim()) ? '#EF4444' : colors.subtext} size={13} style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                placeholder="Name *"
                placeholderTextColor={(attemptedSubmit && !customerName.trim()) ? '#EF4444aa' : colors.subtext}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>
            <View style={[styles.textFieldBox, { borderColor: (attemptedSubmit && !customerPhone.trim()) ? '#EF4444' : colors.border }]}>
              <Phone color={(attemptedSubmit && !customerPhone.trim()) ? '#EF4444' : colors.subtext} size={13} style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                placeholder="Phone *"
                placeholderTextColor={(attemptedSubmit && !customerPhone.trim()) ? '#EF4444aa' : colors.subtext}
                keyboardType="phone-pad"
                value={customerPhone}
                onChangeText={setCustomerPhone}
              />
            </View>
          </View>

          {/* Delivery Address */}
          {activeOrderType === 'DELIVERY' && (
            <View style={[styles.textFieldBox, { borderColor: (attemptedSubmit && !deliveryAddress.trim()) ? '#EF4444' : colors.border, marginHorizontal: scale(12), marginTop: 0 }]}>
              <MapPin color={(attemptedSubmit && !deliveryAddress.trim()) ? '#EF4444' : colors.subtext} size={13} style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                placeholder="Delivery Address *"
                placeholderTextColor={(attemptedSubmit && !deliveryAddress.trim()) ? '#EF4444aa' : colors.subtext}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
            </View>
          )}

          {/* Notes */}
          <View style={[styles.textFieldBox, { borderColor: colors.border, marginHorizontal: scale(12), marginTop: 0 }]}>
            <FileText color={colors.subtext} size={13} style={{ marginRight: 6 }} />
            <TextInput
              style={[styles.fieldInput, { color: colors.text }]}
              placeholder="Order Notes"
              placeholderTextColor={colors.subtext}
              value={orderNotes}
              onChangeText={setOrderNotes}
            />
          </View>
        </View>

        {/* ── BASKET ── */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.basketHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.basketTitleRow}>
              <ShoppingCart color={colors.primary} size={17} style={{ marginRight: 6 }} />
              <Text style={[styles.basketTitle, { color: colors.text }]}>Current Basket</Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary }]}>
              <Text style={[styles.countBadgeText, { color: colors.primary }]}>{cart.items.length} Items</Text>
            </View>
          </View>

          {cart.items.length === 0 ? (
            <View style={styles.emptyBasket}>
              <ShoppingCart color={colors.border} size={moderateScale(42)} />
              <Text style={[styles.emptyBasketText, { color: colors.subtext }]}>Your basket is empty</Text>
            </View>
          ) : (
            <View style={styles.cartItemsList}>
              {cart.items.map((item) => {
                const itemPrice = item.basePrice + (item.variantInfo?.priceModifier || 0);
                return (
                  <View key={item.cartItemId} style={[styles.cartItemRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.cartItemInfo}>
                      <Text style={[styles.cartItemName, { color: colors.text }]}>{item.name}</Text>
                      {item.variantInfo && (
                        <Text style={[styles.cartItemVariant, { color: colors.primary }]}>{item.variantInfo.variantName?.toUpperCase()}</Text>
                      )}
                      <Text style={[styles.cartItemPrice, { color: '#10B981' }]}>Rs. {itemPrice}</Text>
                    </View>
                    
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View style={[styles.qtyController, { borderColor: colors.border }]}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => cart.updateQuantity(item.cartItemId, -1)}>
                          <Text style={[styles.qtyText, { color: colors.text }]}>-</Text>
                        </TouchableOpacity>
                        <Text style={[styles.qtyValue, { color: colors.text }]}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => cart.updateQuantity(item.cartItemId, 1)}>
                          <Text style={[styles.qtyText, { color: colors.text }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => cart.removeItem(item.cartItemId)} style={{ marginLeft: scale(10) }}>
                        <X color={colors.error || '#EF4444'} size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={[styles.totalsBlock, { borderTopColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.subtext }]}>Subtotal</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>Rs. {cart.getSubtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.subtext }]}>Service Charge (0%)</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>Rs. {cart.getServiceCharge().toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.subtext }]}>Tax (0%)</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>Rs. {cart.getTax().toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.secondary }]}>Global Discount (0%)</Text>
              <Text style={[styles.totalValue, { color: colors.secondary }]}>- Rs. {cart.getDiscount().toFixed(2)}</Text>
            </View>

            <View style={[styles.grandTotalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.grandTotalLabel, { color: colors.text }]}>TOTAL AMOUNT</Text>
              <Text style={[styles.grandTotalValue, { color: colors.primary }]}>Rs. {cart.getTotal().toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.placeOrderBtn,
                {
                  backgroundColor:
                    isSubmitting || cart.items.length === 0
                      ? colors.border
                      : colors.primary,
                },
              ]}
              activeOpacity={0.85}
              onPress={handlePlaceOrder}
              disabled={isSubmitting || cart.items.length === 0}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={[
                  styles.placeOrderText,
                  { color: cart.items.length === 0 ? colors.subtext : '#FFF' }
                ]}>PLACE ORDER  〉</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>


      </ScrollView>

      {/* ── VARIANT SELECTION MODAL ── */}
      <Modal
        visible={variantModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                SELECT VARIANT: {selectedProduct?.name?.toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => setVariantModalVisible(false)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: colors.subtext }]}>AVAILABLE VARIANTS</Text>
            <ScrollView style={{ maxHeight: verticalScale(300) }}>
              {selectedProduct?.variants?.map((variant) => {
                const modifier = parseFloat(variant.priceModifier) || 0;
                const basePrice = parseFloat(selectedProduct.price) || 0;
                const totalVariantPrice = basePrice + modifier;
                
                return (
                  <TouchableOpacity 
                    key={variant.id}
                    style={[styles.variantCard, { borderColor: colors.border }]}
                    onPress={() => handleVariantSelect(variant)}
                  >
                    <View>
                      <Text style={[styles.variantName, { color: colors.text }]}>{variant.name}</Text>
                      <Text style={[styles.variantDesc, { color: colors.subtext }]}>
                        Base: Rs. {basePrice} + Variant: Rs. {modifier}
                      </Text>
                    </View>
                    <Text style={[styles.variantPrice, { color: colors.primary }]}>Rs. {totalVariantPrice}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              onPress={() => setVariantModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* ── COUNTER SELECTION MODAL ── */}
      <Modal
        visible={counterModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>SELECT COUNTER</Text>
              <TouchableOpacity onPress={() => setCounterModalVisible(false)}>
                <X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: verticalScale(300) }}>
              {counters.map((count) => (
                <TouchableOpacity 
                  key={count.id}
                  style={[
                    styles.selectionItem, 
                    { borderColor: colors.border },
                    selectedCounterId === count.id && { backgroundColor: colors.primary + '11', borderColor: colors.primary }
                  ]}
                  onPress={() => {
                    setSelectedCounterId(count.id);
                    setCounterModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.selectionText, 
                    { color: colors.text },
                    selectedCounterId === count.id && { fontWeight: 'bold', color: colors.primary }
                  ]}>
                    {count.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              onPress={() => setCounterModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── TABLE SELECTION MODAL ── */}
      <Modal
        visible={tableModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>SELECT TABLE</Text>
              <TouchableOpacity onPress={() => setTableModalVisible(false)}>
                <X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: verticalScale(300) }}>
              {tables.map((table) => (
                <TouchableOpacity 
                  key={table.id}
                  style={[
                    styles.selectionItem, 
                    { borderColor: colors.border },
                    selectedTableId === table.id && { backgroundColor: colors.primary + '11', borderColor: colors.primary }
                  ]}
                  onPress={() => {
                    setSelectedTableId(table.id);
                    setTableModalVisible(false);
                  }}
                >
                  <View>
                    <Text style={[
                      styles.selectionText, 
                      { color: colors.text },
                      selectedTableId === table.id && { fontWeight: 'bold', color: colors.primary }
                    ]}>
                      Table {table.tableNumber}
                    </Text>
                    <Text style={[styles.variantDesc, { color: colors.subtext }]}>Capacity: {table.capacity} persons</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              onPress={() => setTableModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── IN-APP TOAST ── */}
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              backgroundColor:
                toast.type === 'success' ? '#10B981' :
                toast.type === 'error' ? '#EF4444' : '#3B82F6',
            },
          ]}
        >
          {toast.type === 'success' && <CheckCircle color="#FFF" size={16} style={{ marginRight: 8 }} />}
          {toast.type === 'error' && <AlertCircle color="#FFF" size={16} style={{ marginRight: 8 }} />}
          {toast.type === 'info' && <Info color="#FFF" size={16} style={{ marginRight: 8 }} />}
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}

      {/* ── FLOATING CART BAR ── */}
      {cart.items.length > 0 && (
        <View style={[styles.floatingCartBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View>
            <Text style={[styles.floatingCartTitle, { color: colors.text }]}>{cart.items.length} Items</Text>
            <Text style={[styles.floatingCartTotal, { color: colors.primary }]}>Total: Rs. {cart.getTotal().toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.floatingCartBtn, { backgroundColor: colors.primary }]}
            onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            <Text style={styles.floatingCartBtnText}>Review & Place</Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: scale(14) },
  topTabsRow: {
    flexDirection: 'row',
    borderRadius: moderateScale(22),
    borderWidth: 1,
    padding: moderateScale(3),
    marginBottom: verticalScale(12),
  },
  topTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(7),
  },
  topTabText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  categoryScroll: { marginBottom: verticalScale(10) },
  categoryScrollContent: { paddingVertical: 2 },
  categoryPill: {
    borderWidth: 1,
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(5),
    marginRight: scale(6),
  },
  categoryText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    height: verticalScale(38),
    marginBottom: verticalScale(14),
    gap: scale(6),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(12),
    height: '100%',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: verticalScale(14),
  },
  productCard: {
    width: '48%',
    borderWidth: 0.5,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageBox: {
    height: verticalScale(90),
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  codeTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: scale(5),
    paddingVertical: 2,
    borderBottomRightRadius: moderateScale(6),
  },
  codeTagText: { color: '#FFF', fontSize: moderateScale(9), fontWeight: 'bold' },
  productInfo: { padding: moderateScale(8) },
  productName: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginBottom: verticalScale(3),
    lineHeight: moderateScale(16),
  },
  productPrice: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  card: {
    borderWidth: 0.5,
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTypeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  orderTypeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  orderTypeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: scale(8),
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(12),
  },
  colGroup: { flex: 1 },
  fieldLabel: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: verticalScale(4),
  },
  selectBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: moderateScale(7),
    height: verticalScale(34),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(8),
  },
  selectText: {
    fontSize: moderateScale(13),
  },
  textFieldBox: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: moderateScale(7),
    height: verticalScale(34),
    alignItems: 'center',
    paddingHorizontal: scale(8),
    marginTop: verticalScale(6),
    marginBottom: verticalScale(10),
  },
  fieldInput: {
    flex: 1,
    fontSize: moderateScale(13),
    height: '100%',
  },
  basketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
  },
  basketTitleRow: { flexDirection: 'row', alignItems: 'center' },
  basketTitle: { fontSize: moderateScale(14), fontWeight: 'bold' },
  countBadge: {
    borderWidth: 1,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(5),
  },
  countBadgeText: { fontSize: moderateScale(11), fontWeight: '700' },
  emptyBasket: {
    paddingVertical: verticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBasketText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(13),
  },
  cartItemsList: {
    paddingHorizontal: scale(14),
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
  },
  cartItemInfo: { flex: 1, paddingRight: scale(10) },
  cartItemName: { fontSize: moderateScale(13), fontWeight: '700', marginBottom: 2 },
  cartItemVariant: { fontSize: moderateScale(10), fontWeight: '700', marginBottom: 2 },
  cartItemPrice: { fontSize: moderateScale(12), fontWeight: '600' },
  qtyController: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(6),
    height: verticalScale(28),
  },
  qtyBtn: { paddingHorizontal: scale(10), justifyContent: 'center' },
  qtyText: { fontSize: moderateScale(14), fontWeight: '600' },
  qtyValue: { fontSize: moderateScale(13), fontWeight: '700', minWidth: scale(14), textAlign: 'center' },
  totalsBlock: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(6),
  },
  totalLabel: { fontSize: moderateScale(12), fontWeight: '500' },
  totalValue: { fontSize: moderateScale(12), fontWeight: '600' },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(10),
    marginTop: verticalScale(4),
    borderTopWidth: 1,
    marginBottom: verticalScale(14),
  },
  grandTotalLabel: { fontSize: moderateScale(13), fontWeight: '900' },
  grandTotalValue: { fontSize: moderateScale(18), fontWeight: '900' },
  placeOrderBtn: {
    borderRadius: moderateScale(10),
    height: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: {
    color: '#FFF',
    fontSize: moderateScale(14),
    fontWeight: '900',
    letterSpacing: 1,
  },
  
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContent: {
    width: '100%',
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: verticalScale(12),
    marginBottom: verticalScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  modalSubtitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginBottom: verticalScale(12),
    letterSpacing: 0.5,
  },
  variantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  variantName: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    marginBottom: verticalScale(4),
  },
  variantDesc: {
    fontSize: moderateScale(11),
  },
  variantPrice: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  modalCancelText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  selectionItem: {
    padding: moderateScale(12),
    borderWidth: 1,
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(8),
  },
  selectionText: {
    fontSize: moderateScale(14),
  },
  toast: {
    position: 'absolute',
    bottom: verticalScale(16),
    left: scale(16),
    right: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#FFF',
    fontSize: moderateScale(13),
    fontWeight: '600',
    flex: 1,
  },
  floatingCartBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  floatingCartTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: 2,
  },
  floatingCartTotal: {
    fontSize: moderateScale(15),
    fontWeight: '900',
  },
  floatingCartBtn: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
  },
  floatingCartBtnText: {
    color: '#FFF',
    fontSize: moderateScale(13),
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});
