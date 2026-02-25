import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ─── Configure notification handler ────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Request permissions ───────────────────────────────────────────────────
export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get notification permissions');
    return false;
  }

  // Android: Create notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3ED6C4',
    });

    await Notifications.setNotificationChannelAsync('budget-alerts', {
      name: 'Budget Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF5252',
    });

    await Notifications.setNotificationChannelAsync('savings-reminders', {
      name: 'Savings Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#4CAF50',
    });

    await Notifications.setNotificationChannelAsync('daily-summary', {
      name: 'Daily Summary',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0, 250],
      lightColor: '#3ED6C4',
    });
  }

  return true;
};

// ─── Cancel all scheduled notifications ───────────────────────────────────
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// ─── Cancel specific notification ─────────────────────────────────────────
export const cancelNotification = async (identifier) => {
  await Notifications.cancelScheduledNotificationAsync(identifier);
};

// ─── Get all scheduled notifications ──────────────────────────────────────
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPE 1: BUDGET ALERTS — Triggered when budget threshold reached
// ═══════════════════════════════════════════════════════════════════════════
export const sendBudgetAlert = async ({ categoryName, spent, limit, percentage }) => {
  const emoji = percentage >= 100 ? '🚨' : percentage >= 80 ? '⚠️' : '📊';
  const title = percentage >= 100 
    ? `${emoji} Budget Terlampaui!`
    : `${emoji} Budget Alert`;
  
  const body = percentage >= 100
    ? `Budget "${categoryName}" sudah terlampaui ${percentage.toFixed(0)}% (${formatCurrency(spent)} dari ${formatCurrency(limit)})`
    : `Budget "${categoryName}" sudah ${percentage.toFixed(0)}% terpakai (${formatCurrency(spent)} dari ${formatCurrency(limit)})`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      channelId: 'budget-alerts',
      data: { type: 'budget-alert', categoryName, spent, limit, percentage },
    },
    trigger: null, // Send immediately
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPE 2: SAVINGS REMINDER — Scheduled recurring reminders
// ═══════════════════════════════════════════════════════════════════════════
export const scheduleSavingsReminder = async ({ frequency, time }) => {
  // Cancel existing savings reminders first
  const scheduled = await getScheduledNotifications();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'savings-reminder') {
      await cancelNotification(notif.identifier);
    }
  }

  if (frequency === 'none') return;

  // Parse time (format: "09:00")
  const [hour, minute] = time.split(':').map(Number);

  let trigger;
  
  if (frequency === 'daily') {
    trigger = {
      hour,
      minute,
      repeats: true,
    };
  } else if (frequency === 'weekly') {
    // Every Monday at specified time
    trigger = {
      weekday: 2, // 1 = Sunday, 2 = Monday, etc
      hour,
      minute,
      repeats: true,
    };
  } else if (frequency === 'monthly') {
    // First day of every month
    trigger = {
      day: 1,
      hour,
      minute,
      repeats: true,
    };
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🐷 Waktunya Nabung!',
      body: 'Jangan lupa setor tabungan hari ini. Sedikit demi sedikit, lama-lama jadi bukit!',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
      channelId: 'savings-reminders',
      data: { type: 'savings-reminder', frequency },
    },
    trigger,
  });

  return identifier;
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPE 3: DAILY SUMMARY — End of day transaction summary
// ═══════════════════════════════════════════════════════════════════════════
export const scheduleDailySummary = async ({ enabled, time }) => {
  // Cancel existing daily summary
  const scheduled = await getScheduledNotifications();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'daily-summary') {
      await cancelNotification(notif.identifier);
    }
  }

  if (!enabled) return;

  const [hour, minute] = time.split(':').map(Number);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Ringkasan Hari Ini',
      body: 'Tap untuk lihat ringkasan transaksi hari ini',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.LOW,
      channelId: 'daily-summary',
      data: { type: 'daily-summary' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  return identifier;
};

// ─── Send daily summary with actual data ──────────────────────────────────
export const sendDailySummary = async ({ income, expense, transactionCount }) => {
  const net = income - expense;
  const emoji = net > 0 ? '💰' : net < 0 ? '💸' : '💳';
  
  let body = `${transactionCount} transaksi hari ini\n`;
  body += `Pemasukan: ${formatCurrency(income)}\n`;
  body += `Pengeluaran: ${formatCurrency(expense)}\n`;
  body += `Net: ${emoji} ${formatCurrency(Math.abs(net))}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Ringkasan Harian',
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
      channelId: 'daily-summary',
      data: { type: 'daily-summary', income, expense, net },
    },
    trigger: null,
  });
};

// ─── Helper: Format currency for notifications ────────────────────────────
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// ─── Helper: Get notification statistics ──────────────────────────────────
export const getNotificationStats = async () => {
  const scheduled = await getScheduledNotifications();
  
  return {
    total: scheduled.length,
    budgetAlerts: scheduled.filter(n => n.content.data?.type === 'budget-alert').length,
    savingsReminders: scheduled.filter(n => n.content.data?.type === 'savings-reminder').length,
    dailySummary: scheduled.filter(n => n.content.data?.type === 'daily-summary').length,
  };
};