import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../services/supabase";
import { Runs } from "../types";

export default function Run() {
  const [runs, setRuns] = React.useState<Runs[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const wave1 = React.useRef(new Animated.Value(0)).current;
  const wave2 = React.useRef(new Animated.Value(0)).current;
  const trendMove = React.useRef(new Animated.Value(0)).current;
  const leftFoot = React.useRef(new Animated.Value(1)).current;
  const rightFoot = React.useRef(new Animated.Value(0.25)).current;

  React.useEffect(() => {
    const DURATION = 2400;
    const makeLoop = (value: Animated.Value) =>
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration: DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
    const loop1 = makeLoop(wave1);
    const loop2 = makeLoop(wave2);
    loop1.start();
    const timer = setTimeout(() => loop2.start(), DURATION / 2);
    return () => {
      loop1.stop();
      loop2.stop();
      clearTimeout(timer);
    };
  }, [wave1, wave2]);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(trendMove, {
          toValue: -4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(trendMove, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(leftFoot, {
            toValue: 0.25,
            duration: 320,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rightFoot, {
            toValue: 1,
            duration: 320,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(leftFoot, {
            toValue: 1,
            duration: 320,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rightFoot, {
            toValue: 0.25,
            duration: 320,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  const ringScale = (value: Animated.Value) =>
    value.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.6],
    });

  const ringOpacity = (value: Animated.Value) =>
    value.interpolate({
      inputRange: [0, 0.1, 1],
      outputRange: [0, 0.45, 0],
    });

  const fetchRuns = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .order("run_date", { ascending: false })
      .order("id", { ascending: false });
    if (!error && data) {
      setRuns(data as Runs[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchRuns();
    }, [fetchRuns]),
  );

  React.useEffect(() => {
    const channel = supabase
      .channel("runs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "runs" },
        (payload) => {
          setRuns((prev) => {
            const incoming = payload.new as Runs;
            if (prev.some((r) => r.id === incoming.id)) {
              return prev;
            }
            return [incoming, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "runs" },
        (payload) => {
          const updated = payload.new as Runs;
          setRuns((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r)),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "runs" },
        (payload) => {
          const removed = payload.old as Runs;
          setRuns((prev) => prev.filter((r) => r.id !== removed.id));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatThaiDate = (dateStr: string) => {
    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) {
      return dateStr;
    }
    return `${day} ${thaiMonths[month - 1]} พ.ศ. ${year + 543}`;
  };

  const openDetail = (item: Runs) => {
    router.push({
      pathname: "/[id]",
      params: {
        id: item.id,
        location: item.location,
        distance: String(item.distance),
        time_of_day: item.time_of_day,
        run_date: item.run_date,
        image_url: item.image_url,
      },
    });
  };

  const totalRuns = runs.length;
  const totalDistance = runs.reduce(
    (sum, item) => sum + (Number(item.distance) || 0),
    0,
  );

  const ListHeader = (
    <View>
      {/* ไอคอนคนวิ่งสีเขียว */}
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <FontAwesome6 name="person-running" size={70} color="#2ecc71" />
        </View>
      </View>

      <LinearGradient
        colors={["#2ecc71", "#27ae60"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statCard}
      >
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: trendMove,
                  },
                  {
                    scale: trendMove.interpolate({
                      inputRange: [-4, 0],
                      outputRange: [1.08, 1],
                    }),
                  },
                ],
              }}
            >
              <Ionicons name="trending-up" size={20} color="#fff" />
            </Animated.View>
          </View>
          <Text style={styles.statValue}>{totalRuns}</Text>
          <Text style={styles.statLabel}>ครั้งที่วิ่ง</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Animated.View
                style={{
                  opacity: leftFoot,
                  transform: [
                    {
                      translateY: leftFoot.interpolate({
                        inputRange: [0.25, 1],
                        outputRange: [2, -2],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons name="footsteps-outline" size={16} color="#fff" />
              </Animated.View>
              <Animated.View
                style={{
                  opacity: rightFoot,
                  transform: [
                    {
                      translateY: rightFoot.interpolate({
                        inputRange: [0.25, 1],
                        outputRange: [2, -2],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons
                  name="footsteps-outline"
                  size={16}
                  color="#fff"
                  style={{
                    transform: [{ scaleX: -1 }],
                  }}
                />
              </Animated.View>
            </View>
          </View>
          <Text style={styles.statValue}>{totalDistance.toFixed(1)}</Text>
          <Text style={styles.statLabel}>ระยะทางรวม (กม.)</Text>
        </View>
      </LinearGradient>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>สถานที่ไปวิ่ง</Text>
        <View style={styles.countChip}>
          <Text style={styles.countChipText}>{totalRuns} รายการ</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Runs }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => openDetail(item)}
    >
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardLocation} numberOfLines={1}>
          {item.location}
        </Text>
        <View style={styles.cardDateRow}>
          <Ionicons name="calendar-outline" size={14} color="#9a9a9a" />
          <Text style={styles.cardDate}>{formatThaiDate(item.run_date)}</Text>
        </View>
        <View style={styles.distancePill}>
          <Text style={styles.distancePillText}>{item.distance} km</Text>
        </View>
      </View>
      <View style={styles.chevronCircle}>
        <AntDesign name="right" size={16} color="#2ecc71" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2ecc71" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      ) : (
        <FlatList
          data={runs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor="#2ecc71"
              colors={["#2ecc71"]}
              onRefresh={() => {
                setRefreshing(true);
                fetchRuns();
              }}
            />
          }
        />
      )}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.fabWave,
            {
              transform: [{ scale: ringScale(wave1) }],
              opacity: ringOpacity(wave1),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.fabWave,
            {
              transform: [{ scale: ringScale(wave2) }],
              opacity: ringOpacity(wave2),
            },
          ]}
        />
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => router.push("/add")}
        >
          <LinearGradient
            colors={["#2ecc71", "#27ae60"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addBtnGradient}
          >
            <AntDesign name="plus" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f5fb",
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Kanit_400Regular",
    color: "#8a93a6",
    marginTop: 12,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 6,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#e8f8f0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2ecc71",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 130,
  },
  statCard: {
    flexDirection: "row",
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#27ae60",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  statValue: {
    fontFamily: "Kanit_700Bold",
    fontSize: 20,
    color: "#fff",
  },
  statLabel: {
    fontFamily: "Kanit_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.28)",
    marginVertical: 6,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Kanit_700Bold",
    fontSize: 18,
    color: "#1c2540",
  },
  countChip: {
    backgroundColor: "#e8f8f0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countChipText: {
    fontFamily: "Kanit_400Regular",
    fontSize: 12,
    color: "#2ecc71",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    marginBottom: 16,
    padding: 14,
    shadowColor: "#1f3a8a",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImage: {
    width: 92,
    height: 92,
    borderRadius: 16,
    backgroundColor: "#eef1f7",
  },
  cardBody: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  cardLocation: {
    fontFamily: "Kanit_700Bold",
    fontSize: 19,
    color: "#1c2540",
  },
  cardDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  cardDate: {
    fontFamily: "Kanit_400Regular",
    fontSize: 14,
    color: "#9a9a9a",
    marginLeft: 5,
  },
  distancePill: {
    alignSelf: "flex-start",
    backgroundColor: "#e8f8f0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 10,
  },
  distancePillText: {
    fontFamily: "Kanit_700Bold",
    fontSize: 14,
    color: "#2ecc71",
  },
  chevronCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f3f5fb",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  fabWrap: {
    position: "absolute",
    bottom: 60,
    right: 28,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  fabWave: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2ecc71",
  },
  addBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: "#27ae60",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  addBtnGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
