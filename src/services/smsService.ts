import {
  NativeModules,
  Platform,
  PermissionsAndroid,
  NativeEventEmitter,
  DeviceEventEmitter,
} from 'react-native';

const { SmsModule } = NativeModules;

export interface DetectedSmsTransaction {
  amount: number;
  amountStr: string;
  merchant: string;
  type: 'expense' | 'income';
  categoryId?: string;
  rawText: string;
}

class SmsService {
  private isSupported: boolean = Platform.OS === 'android' && !!SmsModule;

  /**
   * Checks whether RECEIVE_SMS permission is granted
   */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const receiveGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
      );
      return receiveGranted;
    } catch (e) {
      console.warn('Error checking SMS permission:', e);
      return false;
    }
  }

  /**
   * Prompts the system permission dialog for RECEIVE_SMS and READ_SMS
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      ]);

      const receiveGranted =
        results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
        PermissionsAndroid.RESULTS.GRANTED;

      return receiveGranted;
    } catch (e) {
      console.warn('Error requesting SMS permission:', e);
      return false;
    }
  }

  /**
   * Checks whether background SMS detection is enabled in user preferences
   */
  async isDetectionEnabled(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      return await SmsModule.isSmsDetectionEnabled();
    } catch (e) {
      console.warn('Error checking SMS detection status:', e);
      return true;
    }
  }

  /**
   * Toggles SMS detection on or off
   */
  async setDetectionEnabled(enabled: boolean): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      if (enabled) {
        const hasPerm = await this.hasPermission();
        if (!hasPerm) {
          const granted = await this.requestPermission();
          if (!granted) return false;
        }
      }
      await SmsModule.setSmsDetectionEnabled(enabled);
      return true;
    } catch (e) {
      console.warn('Error setting SMS detection status:', e);
      return false;
    }
  }

  /**
   * Simulates an incoming SMS message to test parser and notification flow
   */
  async simulateSmsDetection(
    message: string = 'Debited Rs 350.00 from a/c **1234 to Swiggy UPI Ref 882910 on 27-Sep-26. Avail Bal: Rs 14,200.',
    sender: string = 'VK-HDFCBK'
  ): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      await SmsModule.simulateSmsDetection(message, sender);
      return true;
    } catch (e) {
      console.warn('Error simulating SMS detection:', e);
      return false;
    }
  }

  /**
   * Registers a listener for in-app real-time SMS detection
   */
  subscribeToSmsEvents(
    callback: (data: DetectedSmsTransaction) => void
  ): () => void {
    if (Platform.OS !== 'android') {
      return () => {};
    }

    const subscription = DeviceEventEmitter.addListener(
      'onSmsTransactionDetected',
      (data: DetectedSmsTransaction) => {
        callback(data);
      }
    );

    return () => {
      subscription.remove();
    };
  }
}

export const smsService = new SmsService();
