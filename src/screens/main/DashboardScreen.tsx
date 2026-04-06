import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {
  ClipboardList,
  Search,
  ChevronDown,
  Plus,
  X,
  Calendar,
  User,
  Phone,
  MapPin,
  UtensilsCrossed,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChefHat,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { posService, PosOrder, PosCounter } from '../../services/posService';

const ORDER_TYPE_TABS = ['ALL', 'DINE_IN', 'TAKEAWAY', 'DELIVERY'];
const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED', 'CANCELLED'];
const LIMIT = 10;

const formatTypeLabel = (t: string) => {
  if (t === 'DINE_IN') return 'DINE IN';
  return t;
};

const getDateString = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const DATE_RANGES = [
  { label: 'Today', from: () => getDateString(0), to: () => getDateString(0) },
  { label: 'Last 2 Days', from: () => getDateString(1), to: () => getDateString(0) },
  { label: 'Last 7 Days', from: () => getDateString(6), to: () => getDateString(0) },
  { label: 'Last 30 Days', from: () => getDateString(29), to: () => getDateString(0) },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; Icon: any }> = {
  PENDING:   { color: '#F59E0B', bg: '#FFF7E6', Icon: Clock },
  CONFIRMED: { color: '#3B82F6', bg: '#EFF6FF', Icon: CheckCircle },
  PREPARING: { color: '#8B5CF6', bg: '#F5F3FF', Icon: ChefHat },
  COMPLETED: { color: '#10B981', bg: '#F0FDF4', Icon: CheckCircle },
  CANCELLED: { color: '#EF4444', bg: '#FFF5F5', Icon: XCircle },
};

const TYPE_TAG_CONFIG: Record<string, { color: string; bg: string }> = {
  DINE_IN:  { color: '#7C3AED', bg: '#EDE9FE' },
  TAKEAWAY: { color: '#0891B2', bg: '#ECFEFF' },
  DELIVERY: { color: '#EA580C', bg: '#FFF7ED' },
};

export const DashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  // Data
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [counters, setCounters] = useState<PosCounter[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [activeTypeTab, setActiveTypeTab] = useState('ALL');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [selectedCounter, setSelectedCounter] = useState<PosCounter | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState(DATE_RANGES[1]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string) => {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  // Load counters once
  useEffect(() => {
    posService.getCounters().then(res => {
      if (res.success) setCounters(res.data);
    }).catch(() => {});
  }, []);

  // Reload orders whenever filters change
  useEffect(() => {
    loadOrders(1, true);
  }, [activeTypeTab, activeStatus, selectedCounter, selectedDateRange]);

  const buildParams = (p: number) => ({
    page: p,
    limit: LIMIT,
    fromDate: selectedDateRange.from(),
    toDate: selectedDateRange.to(),
    ...(activeTypeTab !== 'ALL' && { orderType: activeTypeTab }),
    ...(activeStatus !== 'ALL' && { status: activeStatus }),
    ...(selectedCounter && { counterId: selectedCounter.id }),
  });

  const loadOrders = async (pageNum: number, reset: boolean) => {
    if (reset) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const res = await posService.getOrders(buildParams(pageNum));
      if (res.success) {
        const fetched = res.data.orders;
        setTotal(res.data.meta.total);
        setOrders(prev => reset ? fetched : [...prev, ...fetched]);
        setPage(pageNum);
        setHasMore(pageNum < res.data.meta.totalPages);
      }
    } catch {
      showToast('Failed to load orders. Check connection.');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      loadOrders(page + 1, false);
    }
  };

  const handleRefresh = () => loadOrders(1, true);

  // Filter by search client-side (on name / order number)
  const filteredOrders = searchQuery.trim()
    ? orders.filter(o =>
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  const renderOrderCard = ({ item }: { item: PosOrder }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const typeCfg = TYPE_TAG_CONFIG[item.orderType] || TYPE_TAG_CONFIG.TAKEAWAY;
    const StatusIcon = statusCfg.Icon;
    const itemSummary = item.items.map(i =>
      `${i.menuItem.name}${i.variant ? ` (${i.variant.name})` : ''} x${i.quantity}`
    ).join(', ');

    const createdAt = new Date(item.createdAt);
    const timeStr = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = createdAt.toLocaleDateString([], { day: '2-digit', month: 'short' });

    return (
      <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Card Top Row */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardTopLeft}>
            <Text style={[styles.orderNumber, { color: colors.text }]}>{item.orderNumber}</Text>
            {item.invoice && (
              <Text style={[styles.invoiceNum, { color: colors.subtext }]}>{item.invoice.invoiceNumber}</Text>
            )}
          </View>

          <View style={styles.cardTopRight}>
            {/* Type Badge */}
            <View style={[styles.typeBadge, { backgroundColor: typeCfg.bg }]}>
              <Text style={[styles.typeBadgeText, { color: typeCfg.color }]}>
                {formatTypeLabel(item.orderType)}
              </Text>
            </View>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <StatusIcon size={10} color={statusCfg.color} style={{ marginRight: 3 }} />
              <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>{item.status}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

        {/* Items summary */}
        <Text style={[styles.itemsSummary, { color: colors.subtext }]} numberOfLines={2}>
          {itemSummary || 'No items'}
        </Text>

        {/* Meta row */}
        <View style={styles.cardMetaRow}>
          {item.customerName ? (
            <View style={styles.metaItem}>
              <User size={11} color={colors.subtext} style={{ marginRight: 3 }} />
              <Text style={[styles.metaText, { color: colors.subtext }]}>{item.customerName}</Text>
            </View>
          ) : null}
          {item.customerPhone ? (
            <View style={styles.metaItem}>
              <Phone size={11} color={colors.subtext} style={{ marginRight: 3 }} />
              <Text style={[styles.metaText, { color: colors.subtext }]}>{item.customerPhone}</Text>
            </View>
          ) : null}
          {item.table ? (
            <View style={styles.metaItem}>
              <UtensilsCrossed size={11} color={colors.subtext} style={{ marginRight: 3 }} />
              <Text style={[styles.metaText, { color: colors.subtext }]}>Table {item.table.tableNumber}</Text>
            </View>
          ) : null}
          {item.deliveryAddress ? (
            <View style={styles.metaItem}>
              <MapPin size={11} color={colors.subtext} style={{ marginRight: 3 }} />
              <Text style={[styles.metaText, { color: colors.subtext }]} numberOfLines={1}>{item.deliveryAddress}</Text>
            </View>
          ) : null}
        </View>

        {/* Bottom Row: Total + Time */}
        <View style={styles.cardBottomRow}>
          <View style={styles.metaItem}>
            <Calendar size={11} color={colors.subtext} style={{ marginRight: 3 }} />
            <Text style={[styles.metaText, { color: colors.subtext }]}>{dateStr} · {timeStr}</Text>
          </View>
          <Text style={[styles.totalAmount, { color: colors.primary }]}>Rs. {item.total}</Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerLoaderText, { color: colors.subtext }]}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ClipboardList color={colors.border} size={moderateScale(40)} />
        <Text style={[styles.emptyText, { color: colors.subtext }]}>No orders found.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ClipboardList color={colors.primary} size={moderateScale(20)} />
          <Text style={[styles.titleBlack, { color: colors.text }]}> Order </Text>
          <Text style={[styles.titleOrange, { color: colors.primary }]}>Management</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          TRACKING {total} TOTAL ORDER{total !== 1 ? 'S' : ''}
        </Text>
      </View>

      {/* ── TYPE TABS ── */}
      <View style={styles.typeTabsWrap}>
        <View style={[styles.typeTabs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {ORDER_TYPE_TABS.map((tab) => {
            const isActive = activeTypeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.typeTab, isActive && { backgroundColor: colors.primary, borderRadius: moderateScale(7) }]}
                onPress={() => { setActiveTypeTab(tab); }}
              >
                <Text style={[styles.typeTabText, { color: isActive ? '#FFF' : colors.subtext }]}>
                  {formatTypeLabel(tab)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── SEARCH ── */}
      <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search color={colors.subtext} size={14} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by order # or customer..."
          placeholderTextColor={colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X color={colors.subtext} size={14} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── FILTER ROW ── */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setCounterModalVisible(true)}
        >
          <Text style={[styles.filterText, { color: selectedCounter ? colors.text : colors.subtext }]} numberOfLines={1}>
            {selectedCounter ? selectedCounter.name : 'All Counters'}
          </Text>
          <ChevronDown color={colors.subtext} size={13} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setDateModalVisible(true)}
        >
          <Calendar color={colors.subtext} size={13} style={{ marginRight: 4 }} />
          <Text style={[styles.filterText, { color: colors.text }]}>{selectedDateRange.label}</Text>
          <ChevronDown color={colors.subtext} size={13} />
        </TouchableOpacity>
      </View>

      {/* ── STATUS PILLS + ADD BTN ── */}
      <View style={styles.statusRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={s => s}
          contentContainerStyle={{ paddingLeft: scale(14), paddingRight: scale(14) }}
          renderItem={({ item: tab }) => {
            const isActive = activeStatus === tab;
            const cfg = STATUS_CONFIG[tab];
            return (
              <TouchableOpacity
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: isActive ? (cfg?.color || colors.primary) : colors.surface,
                    borderColor: isActive ? (cfg?.color || colors.primary) : colors.border,
                  },
                ]}
                onPress={() => setActiveStatus(tab)}
              >
                <Text style={[styles.statusPillText, { color: isActive ? '#FFF' : colors.subtext }]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── ORDERS LIST ── */}
      {isLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onRefresh={handleRefresh}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── COUNTER FILTER MODAL ── */}
      <Modal visible={counterModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>SELECT COUNTER</Text>
              <TouchableOpacity onPress={() => setCounterModalVisible(false)}>
                <X color={colors.text} size={18} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.selectItem, { borderColor: colors.border }, !selectedCounter && { backgroundColor: colors.primary + '11', borderColor: colors.primary }]}
              onPress={() => { setSelectedCounter(null); setCounterModalVisible(false); }}
            >
              <Text style={[styles.selectItemText, { color: !selectedCounter ? colors.primary : colors.text, fontWeight: !selectedCounter ? 'bold' : '400' }]}>
                All Counters
              </Text>
            </TouchableOpacity>
            {counters.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.selectItem, { borderColor: colors.border }, selectedCounter?.id === c.id && { backgroundColor: colors.primary + '11', borderColor: colors.primary }]}
                onPress={() => { setSelectedCounter(c); setCounterModalVisible(false); }}
              >
                <Text style={[styles.selectItemText, { color: selectedCounter?.id === c.id ? colors.primary : colors.text, fontWeight: selectedCounter?.id === c.id ? 'bold' : '400' }]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ── DATE FILTER MODAL ── */}
      <Modal visible={dateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>SELECT DATE RANGE</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                <X color={colors.text} size={18} />
              </TouchableOpacity>
            </View>
            {DATE_RANGES.map(range => (
              <TouchableOpacity
                key={range.label}
                style={[styles.selectItem, { borderColor: colors.border }, selectedDateRange.label === range.label && { backgroundColor: colors.primary + '11', borderColor: colors.primary }]}
                onPress={() => { setSelectedDateRange(range); setDateModalVisible(false); }}
              >
                <Text style={[styles.selectItemText, { color: selectedDateRange.label === range.label ? colors.primary : colors.text, fontWeight: selectedDateRange.label === range.label ? 'bold' : '400' }]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ── TOAST ── */}
      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <AlertCircle color="#FFF" size={15} style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(4),
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(2) },
  titleBlack: { fontSize: moderateScale(19), fontWeight: '900' },
  titleOrange: { fontSize: moderateScale(19), fontWeight: '900' },
  subtitle: { fontSize: moderateScale(9), fontWeight: '700', letterSpacing: 0.8 },

  typeTabsWrap: { paddingHorizontal: scale(14), paddingTop: verticalScale(8) },
  typeTabs: {
    flexDirection: 'row',
    borderRadius: moderateScale(9),
    borderWidth: 1,
    padding: 3,
    marginBottom: verticalScale(8),
  },
  typeTab: { flex: 1, alignItems: 'center', paddingVertical: verticalScale(7) },
  typeTabText: { fontSize: moderateScale(9), fontWeight: '700', letterSpacing: 0.3 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    height: verticalScale(36),
    gap: scale(6),
    marginHorizontal: scale(14),
    marginBottom: verticalScale(8),
  },
  searchInput: { flex: 1, fontSize: moderateScale(12), height: '100%' },

  filterRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginHorizontal: scale(14),
    marginBottom: verticalScale(8),
  },
  filterDropdown: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: moderateScale(8),
    height: verticalScale(34),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(8),
    gap: scale(4),
  },
  filterText: { flex: 1, fontSize: moderateScale(11) },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    paddingRight: scale(14),
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    marginRight: scale(5),
  },
  statusPillText: { fontSize: moderateScale(9), fontWeight: '700', letterSpacing: 0.3 },
  addBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(7),
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  listContent: { paddingHorizontal: scale(14), paddingBottom: verticalScale(20) },

  // ORDER CARD
  orderCard: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: verticalScale(8) },
  cardTopLeft: { flex: 1 },
  cardTopRight: { alignItems: 'flex-end', gap: verticalScale(4) },
  orderNumber: { fontSize: moderateScale(14), fontWeight: '800', marginBottom: 1 },
  invoiceNum: { fontSize: moderateScale(10) },

  typeBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: 2,
    borderRadius: moderateScale(4),
  },
  typeBadgeText: { fontSize: moderateScale(9), fontWeight: '700', letterSpacing: 0.3 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(7),
    paddingVertical: 2,
    borderRadius: moderateScale(4),
  },
  statusBadgeText: { fontSize: moderateScale(9), fontWeight: '700', letterSpacing: 0.3 },

  cardDivider: { height: 1, marginBottom: verticalScale(8) },

  itemsSummary: { fontSize: moderateScale(11), marginBottom: verticalScale(8), lineHeight: moderateScale(16) },

  cardMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(8), marginBottom: verticalScale(8) },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: moderateScale(10) },
  totalAmount: { fontSize: moderateScale(14), fontWeight: '800' },

  footerLoader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(12), gap: scale(6) },
  footerLoaderText: { fontSize: moderateScale(11) },

  emptyState: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(50),
    alignItems: 'center',
    gap: verticalScale(10),
    marginTop: verticalScale(10),
  },
  emptyText: { fontSize: moderateScale(13), textAlign: 'center' },

  // MODALS
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: scale(20) },
  modalBox: { width: '100%', borderRadius: moderateScale(12), padding: moderateScale(16) },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingBottom: verticalScale(10), marginBottom: verticalScale(12) },
  modalTitle: { fontSize: moderateScale(13), fontWeight: 'bold' },
  selectItem: { padding: moderateScale(11), borderWidth: 1, borderRadius: moderateScale(8), marginBottom: verticalScale(7) },
  selectItemText: { fontSize: moderateScale(13) },

  // TOAST
  toast: {
    position: 'absolute',
    bottom: verticalScale(16),
    left: scale(14),
    right: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(11),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  toastText: { color: '#FFF', fontSize: moderateScale(12), fontWeight: '600', flex: 1 },
});
