import { NativeModules, Platform } from 'react-native';

const { BiometricModule } = NativeModules;

export interface BiometricCheckResult {
  available: boolean;
  enrolled: boolean;
  biometryType: 'Biometrics' | 'Fingerprint' | 'Face' | 'Iris' | 'None';
  status: string;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  errorCode?: number;
  error?: string;
  message?: string;
}

class BiometricService {
  /**
   * Checks if biometric hardware is present and user has enrolled biometric credentials.
   */
  async checkBiometrics(): Promise<BiometricCheckResult> {
    if (Platform.OS !== 'android' || !BiometricModule) {
      return {
        available: false,
        enrolled: false,
        biometryType: 'None',
        status: 'UNAVAILABLE',
        error: 'Biometric module is not available on this platform.',
      };
    }

    try {
      const res: BiometricCheckResult = await BiometricModule.isSensorAvailable();
      return res;
    } catch (e: any) {
      return {
        available: false,
        enrolled: false,
        biometryType: 'None',
        status: 'ERROR',
        error: e?.message || 'Failed to check biometric sensor.',
      };
    }
  }

  /**
   * Triggers the native Android BiometricPrompt (fingerprint / face).
   */
  async authenticate(
    title: string = 'SERA Security',
    subtitle: string = 'Biometric Unlock',
    description: string = 'Touch the fingerprint sensor or glance at the camera to unlock',
    cancelButtonText: string = 'Use PIN'
  ): Promise<BiometricAuthResult> {
    if (Platform.OS !== 'android' || !BiometricModule) {
      return {
        success: false,
        error: 'UNAVAILABLE',
        message: 'Biometric authentication is not supported.',
      };
    }

    try {
      const res: BiometricAuthResult = await BiometricModule.authenticate({
        title,
        subtitle,
        description,
        cancelButtonText,
      });
      return res;
    } catch (e: any) {
      return {
        success: false,
        error: 'EXCEPTION',
        message: e?.message || 'Authentication error',
      };
    }
  }
}

export const biometricService = new BiometricService();
export default biometricService;
