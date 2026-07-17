import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  StatusBar, 
  StyleSheet, 
  Platform, 
  Dimensions,
  Modal
} from 'react-native';
import { useStudent } from '../hooks/useStudent';
import { getStudentFees, FeeRecord } from '../services/fees';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FeesScreen = () => {
  const navigation = useNavigation();
  const { selectedStudent } = useStudent();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeRecord | null>(null);
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const headerBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardColor = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#F1F5F9';

  useEffect(() => {
    if (selectedStudent) {
      setLoading(true);
      getStudentFees(selectedStudent.id).then(data => {
        setFees(data);
        setLoading(false);
      });
    }
  }, [selectedStudent]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={[styles.loadingText, { color: subtextColor }]}>{t('loading')}</Text>
      </View>
    );
  }

  const unpaidCount = fees.filter(f => f.status === 'unpaid' || f.status === 'overdue').length;
  const totalOutstanding = fees
    .filter(f => f.status === 'unpaid' || f.status === 'overdue')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.headerWrapper, { backgroundColor: headerBg }]}>
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#ffffff', '#F8FAFC']}
          style={[styles.headerGradient, { borderBottomColor: borderColor }]}
        >
          <View style={[styles.headerTop, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
            <View>
              <Text style={[styles.headerTitle, { color: textColor }]}>{t('fees')}</Text>
              <Text style={[styles.headerSubtitle, { color: subtextColor }]}>{t('feeOverview')}</Text>
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Feather name="menu" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Premium Fee Summary Card */}
        <LinearGradient
          colors={['#0284c7', '#0369a1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.walletIconBg}>
              <MaterialCommunityIcons name="wallet" size={24} color="white" />
            </View>
            <View style={styles.statusBadgeLarge}>
              <Text style={styles.statusBadgeTextLarge}>
                {unpaidCount > 0 ? 'Action Required' : 'Account Clear'}
              </Text>
            </View>
          </View>
          <Text style={styles.outstandingLabel}>{t('totalDue')}</Text>
          <Text style={styles.outstandingAmount}>Rs. {totalOutstanding.toLocaleString()}</Text>
          
          <View style={styles.safetyInfo}>
            <Feather name="shield" size={16} color="#38BDF8" />
            <Text style={styles.safetyText}>
              {unpaidCount === 0 
                ? "All dues are settled for this session."
                : `${unpaidCount} payment(s) are currently pending.`}
            </Text>
          </View>
        </LinearGradient>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('recentTransactions')}</Text>
        </View>
        
        {fees.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={[styles.emptyIconBg, { backgroundColor: isDark ? 'rgba(2,132,199,0.2)' : '#F8FAFC' }]}>
              <Feather name="check-circle" size={48} color={isDark ? '#0284C7' : '#CBD5E1'} />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>No Records Found</Text>
            <Text style={[styles.emptyDesc, { color: subtextColor }]}>All clear! No fee vouchers have been generated for your account yet.</Text>
          </View>
        ) : (
          fees.map((fee) => {
            const isPaid = fee.status === 'paid';
            const isOverdue = fee.status === 'overdue';
            return (
              <View key={fee.id} style={[styles.voucherCard, { backgroundColor: cardColor, borderColor }]}>
                <View style={styles.voucherHeader}>
                  <View style={styles.voucherTitleSection}>
                    <Text style={[styles.voucherTitle, { color: textColor }]}>{fee.month} Voucher</Text>
                    <View style={styles.dateRow}>
                      <Feather name="calendar" size={12} color={subtextColor} />
                      <Text style={[styles.dateText, { color: subtextColor }]}>
                        Due: {new Date(fee.due_date).toLocaleDateString('en-GB')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.amountSection}>
                    <Text style={[styles.amountText, { color: textColor }]}>Rs. {fee.amount.toLocaleString()}</Text>
                    <View style={[
                      styles.statusBadgeSmall,
                      { backgroundColor: isPaid ? (isDark ? 'rgba(22,163,74,0.2)' : '#F0FDF4') : isOverdue ? (isDark ? 'rgba(239,68,68,0.2)' : '#FEF2F2') : (isDark ? 'rgba(249,115,22,0.2)' : '#FFF7ED') }
                    ]}>
                      <Text style={[
                        styles.statusBadgeTextSmall,
                        { color: isPaid ? (isDark ? '#4ade80' : '#166534') : isOverdue ? (isDark ? '#f87171' : '#991B1B') : (isDark ? '#fb923c' : '#9A3412') }
                      ]}>{fee.status === 'paid' ? t('paid') : fee.status === 'overdue' ? t('overdue') : t('pending')}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={[styles.divider, { backgroundColor: borderColor }]} />
                
                <View style={styles.voucherFooter}>
                  {isPaid ? (
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      style={[styles.receiptButton, { backgroundColor: isDark ? 'rgba(2,132,199,0.2)' : '#F0F9FF' }]}
                      onPress={() => setSelectedReceipt(fee)}
                    >
                      <Feather name="file-text" size={16} color="#0284C7" />
                      <Text style={styles.receiptText}>VIEW DETAILS</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.pendingIndicator}>
                      <Feather name="alert-circle" size={16} color={isOverdue ? '#EF4444' : '#F97316'} />
                      <Text style={[
                        styles.pendingText,
                        { color: isOverdue ? '#EF4444' : '#F97316' }
                      ]}>
                        {isOverdue ? 'Critical Action' : 'Payment Due'}
                      </Text>
                    </View>
                  )}
                  
                  {!isPaid && (
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      style={styles.payButton}
                    >
                      <Text style={styles.payButtonText}>{t('payNow')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={!!selectedReceipt}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedReceipt(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Payment Details</Text>
              <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                <Feather name="x" size={24} color={subtextColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Payment ID</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{selectedReceipt?.id || 'N/A'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Date</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {selectedReceipt?.payment_date ? new Date(selectedReceipt.payment_date).toLocaleDateString() : (selectedReceipt?.created_at ? new Date(selectedReceipt.created_at).toLocaleDateString() : 'N/A')}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Time</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {selectedReceipt?.payment_date ? new Date(selectedReceipt.payment_date).toLocaleTimeString() : (selectedReceipt?.created_at ? new Date(selectedReceipt.created_at).toLocaleTimeString() : 'N/A')}
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: borderColor, marginVertical: 15 }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Student Name</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{selectedStudent?.name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Class & Section</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>Class {selectedStudent?.class} {selectedStudent?.section ? `- ${selectedStudent.section}` : ''}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Father's Name</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{selectedStudent?.father_name || 'N/A'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: subtextColor }]}>Phone Number</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{selectedStudent?.parent_phone || 'N/A'}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: borderColor, marginVertical: 15 }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: textColor, fontWeight: '800', fontSize: 16 }]}>Amount Paid</Text>
                <Text style={[styles.detailValue, { color: '#10B981', fontWeight: '900', fontSize: 18 }]}>
                  Rs. {selectedReceipt?.amount?.toLocaleString() || '0'}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ... retaining styles below
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 15, fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 },
  flex1: { flex: 1 },
  headerWrapper: { zIndex: 10 },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 20, paddingHorizontal: 25, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  menuButton: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 100 },
  summaryCard: { borderRadius: 40, padding: 32, marginBottom: 40, shadowColor: '#0284C7', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 25, elevation: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  walletIconBg: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 16 },
  statusBadgeLarge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  statusBadgeTextLarge: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  outstandingLabel: { color: 'rgba(255,255,255,0.7)', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  outstandingAmount: { fontSize: 40, fontWeight: '900', color: '#FFFFFF', marginBottom: 24 },
  safetyInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  safetyText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', marginLeft: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  emptyCard: { borderRadius: 40, padding: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 15, elevation: 2, marginTop: 10 },
  emptyIconBg: { padding: 24, borderRadius: 999, marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  emptyDesc: { fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
  voucherCard: { borderRadius: 32, padding: 24, marginBottom: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 15, elevation: 2 },
  voucherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  voucherTitleSection: { flex: 1 },
  voucherTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  dateText: { fontSize: 10, fontWeight: '900', marginLeft: 6, letterSpacing: 1, textTransform: 'uppercase' },
  amountSection: { alignItems: 'flex-end' },
  amountText: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
  statusBadgeSmall: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, marginTop: 8 },
  statusBadgeTextSmall: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { height: 1, width: '100%', marginBottom: 24 },
  voucherFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  receiptText: { color: '#0369A1', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginLeft: 8, letterSpacing: 0.5 },
  pendingIndicator: { flexDirection: 'row', alignItems: 'center' },
  pendingText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginLeft: 8, letterSpacing: 0.5 },
  payButton: { backgroundColor: '#0284C7', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, shadowColor: '#0284C7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 4 },
  payButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 24, padding: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginVertical: 8 },
  detailLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '700', flex: 1.5, textAlign: 'right' },
});

export default FeesScreen;
