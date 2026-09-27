import { NativeModules, Platform, PermissionsAndroid, Alert } from 'react-native';

const { NotificationModule } = NativeModules;

export interface NotificationPayload {
  title: string;
  message: string;
  channelId?: 'sera_budget_alerts' | 'sera_daily_reminders' | 'sera_general';
  id?: number;
}

class NotificationService {
  private isSupported: boolean = Platform.OS === 'android' && !!NotificationModule;

  /**
   * Initializes notification channels and default settings on app launch
   */
  async init(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      await NotificationModule.initChannels();
      return true;
    } catch (err) {
      console.warn('Failed to init notification channels:', err);
      return false;
    }
  }

  /**
   * Checks whether system notifications are currently enabled
   */
  async hasPermission(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const check = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (!check) return false;
      }
      return await NotificationModule.areNotificationsEnabled();
    } catch (err) {
      console.warn('Error checking notification permission:', err);
      return false;
    }
  }

  /**
   * Prompts the system permission dialog for notifications
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'SERA Notifications',
            message: 'Allow SERA to send daily spending reminders and budget overrun alerts.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      return await NotificationModule.areNotificationsEnabled();
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }

  /**
   * Sends an immediate native system notification
   */
  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const hasPerm = await this.hasPermission();
      if (!hasPerm) {
        const requested = await this.requestPermission();
        if (!requested) {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications for SERA in your Android device settings.'
          );
          return false;
        }
      }

      await NotificationModule.sendNotification({
        title: payload.title,
        message: payload.message,
        channelId: payload.channelId || 'sera_budget_alerts',
        id: payload.id || Math.floor(Math.random() * 100000),
      });

      return true;
    } catch (err) {
      console.warn('Failed to send notification:', err);
      return false;
    }
  }

  /**
   * Fires a test system notification so the user can verify native notifications
   */
  async sendTestNotification(): Promise<boolean> {
    return this.sendNotification({
      title: 'SERA • Financial Architecture',
      message: 'System notifications are active. Daily reminders and budget alerts are ready.',
      channelId: 'sera_general',
      id: 9999,
    });
  }

  /**
   * Sends a budget threshold alert notification
   */
  async sendBudgetAlert(
    categoryName: string,
    spent: number,
    limit: number,
    currencySymbol: string
  ): Promise<boolean> {
    const percent = Math.round((spent / limit) * 100);
    const isExceeded = spent > limit;

    const title = isExceeded
      ? `SERA • Budget Exceeded: ${categoryName}`
      : `SERA • Budget Warning: ${categoryName}`;

    const message = isExceeded
      ? `You have spent ${currencySymbol}${spent.toLocaleString()} (${percent}% of limit). Over limit by ${currencySymbol}${(spent - limit).toLocaleString()}.`
      : `You have reached ${percent}% of your ${currencySymbol}${limit.toLocaleString()} budget limit.`;

    return this.sendNotification({
      title,
      message,
      channelId: 'sera_budget_alerts',
      id: Math.floor(Math.random() * 50000) + 10000,
    });
  }

  /**
   * Sends an instant notification when a transaction (sent, received, or transfer) is recorded
   */
  async sendTransactionAlert(
    type: 'expense' | 'income' | 'transfer',
    amount: number,
    merchant: string,
    accountName: string,
    toAccountName?: string,
    currencySymbol: string = '₹'
  ): Promise<boolean> {
    const formattedAmount = `${currencySymbol}${amount.toLocaleString()}`;
    let title = '';
    let message = '';

    if (type === 'transfer') {
      title = `SERA • ${formattedAmount} Transferred`;
      message = `Moved ${formattedAmount} from ${accountName} to ${toAccountName || 'Account'}.`;
    } else if (type === 'income') {
      title = `SERA • ${formattedAmount} Received`;
      message = `Credited ${formattedAmount} from ${merchant} to ${accountName}.`;
    } else {
      title = `SERA • ${formattedAmount} Sent`;
      message = `Paid ${formattedAmount} to ${merchant} from ${accountName}.`;
    }

    return this.sendNotification({
      title,
      message,
      channelId: 'sera_general',
      id: Math.floor(Math.random() * 50000) + 20000,
    });
  }

  /**
   * Schedules a daily recurring expense logging reminder (e.g. 20:00)
   */
  async scheduleDailyReminder(hour: number = 20, minute: number = 0): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const hasPerm = await this.hasPermission();
      if (!hasPerm) {
        const granted = await this.requestPermission();
        if (!granted) return false;
      }

      await NotificationModule.scheduleDailyReminder(hour, minute);
      return true;
    } catch (err) {
      console.warn('Failed to schedule daily reminder:', err);
      return false;
    }
  }

  /**
   * Cancels the scheduled daily reminder
   */
  async cancelDailyReminder(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      await NotificationModule.cancelDailyReminder();
      return true;
    } catch (err) {
      console.warn('Failed to cancel daily reminder:', err);
      return false;
    }
  }

  /**
   * Clears all active notifications from the Android status bar
   */
  async cancelAll(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      await NotificationModule.cancelAllNotifications();
      return true;
    } catch (err) {
      console.warn('Failed to clear notifications:', err);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
