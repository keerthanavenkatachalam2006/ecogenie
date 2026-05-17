import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { analyticsAPI } from '../services/api';
import { colors } from '../theme/colors';

const W = Dimensions.get('window').width - 32;

const chartConfig = {
  backgroundGradientFrom: colors.bgCard,
  backgroundGradientTo: colors.bgCard,
  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
  labelColor: () => colors.textMuted,
  strokeWidth: 2,
  barPercentage: 0.6,
  decimalPlaces: 1,
  propsForBackgroundLines: { stroke: colors.border },
};

export default function AnalyticsScreen() {
  const [overview, setOverview] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [ovRes, recRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getRecommendations(),
      ]);
      setOverview(ovRes.data.overview);
      setRecommendations(recRes.data.recommendations);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.green} size="large" />
    </View>
  );

  const kpiCards = [
    { label: "Today's Usage", value: `${overview?.todayUsage || 0}`, unit: 'kWh', icon: 'today', color: colors.blue },
    { label: 'Monthly Usage', value: `${overview?.monthUsage || 0}`, unit: 'kWh', icon: 'calendar', color: colors.purple },
    { label: 'Est. Bill', value: `$${overview?.estimatedBill || 0}`, unit: '', icon: 'cash', color: colors.orange },
    { label: 'Energy Score', value: `${overview?.energySavingScore || 0}`, unit: '/100', icon: 'leaf', color: colors.green },
    { label: 'Carbon', value: `${overview?.carbonFootprint || 0}`, unit: 'kg CO₂', icon: 'cloud', color: colors.cyan },
    { label: 'Current Power', value: `${overview?.currentPower || 0}`, unit: 'W', icon: 'flash', color: colors.yellow },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.green} />}
    >
      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        {kpiCards.map((k) => (
          <View key={k.label} style={[styles.kpiCard, { borderColor: k.color + '30' }]}>
            <Ionicons name={k.icon + '-outline'} size={18} color={k.color} />
            <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}<Text style={styles.kpiUnit}>{k.unit}</Text></Text>
            <Text style={styles.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>

      {/* Weekly Chart */}
      {overview?.dailyData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📈 Weekly Consumption (kWh)</Text>
          <LineChart
            data={{
              labels: overview.dailyData.map((d) => d.date),
              datasets: [{ data: overview.dailyData.map((d) => d.usage) }],
            }}
            width={W}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Monthly Chart */}
      {overview?.monthlyData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 Monthly Trend (kWh)</Text>
          <BarChart
            data={{
              labels: overview.monthlyData.map((d) => d.month),
              datasets: [{ data: overview.monthlyData.map((d) => d.usage) }],
            }}
            width={W}
            height={180}
            chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})` }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      )}

      {/* Appliance Breakdown */}
      {overview?.applianceBreakdown && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>⚡ Appliance Breakdown</Text>
          {overview.applianceBreakdown.map((item, i) => {
            const barColors = [colors.green, colors.blue, colors.yellow, colors.red];
            return (
              <View key={item.name} style={styles.breakdownRow}>
                <Text style={styles.breakdownName}>{item.name}</Text>
                <View style={styles.breakdownBarBg}>
                  <View style={[styles.breakdownBarFill, { width: `${item.percentage}%`, backgroundColor: barColors[i % 4] }]} />
                </View>
                <Text style={[styles.breakdownPct, { color: barColors[i % 4] }]}>{item.percentage}%</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🤖 AI Recommendations</Text>
          {recommendations.map((rec) => (
            <View key={rec.id} style={[styles.recCard, {
              borderLeftColor: rec.priority === 'high' ? colors.red : rec.priority === 'medium' ? colors.orange : colors.blue
            }]}>
              <Text style={styles.recIcon}>{rec.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recDesc}>{rec.description}</Text>
                <Text style={styles.recSavings}>{rec.savings}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: { width: '30.5%', backgroundColor: colors.bgCard, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, gap: 4 },
  kpiValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  kpiUnit: { fontSize: 11, fontWeight: '400' },
  kpiLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  chartCard: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  chartTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  chart: { borderRadius: 12, marginLeft: -8 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  breakdownName: { width: 55, fontSize: 12, color: colors.textSecondary },
  breakdownBarBg: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  breakdownBarFill: { height: '100%', borderRadius: 4 },
  breakdownPct: { width: 38, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  recCard: { flexDirection: 'row', gap: 10, padding: 10, borderRadius: 10, backgroundColor: colors.bg, borderLeftWidth: 3, marginBottom: 8 },
  recIcon: { fontSize: 20 },
  recTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  recDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  recSavings: { fontSize: 11, color: colors.green, marginTop: 4, fontWeight: '600' },
});
