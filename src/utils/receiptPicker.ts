import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Money Tracker needs camera access so you can photograph receipts.',
        buttonNeutral: 'Ask Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission request error:', err);
    return false;
  }
}

export async function captureReceiptFromCamera(): Promise<string | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    Alert.alert('Permission Denied', 'Camera permission is required to capture receipts.');
    return null;
  }

  return new Promise(resolve => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
        presentationStyle: 'fullScreen',
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          resolve(null);
          return;
        }

        if (response.errorCode) {
          Alert.alert('Camera Error', response.errorMessage || 'Failed to open camera.');
          resolve(null);
          return;
        }

        const asset = response.assets?.[0];
        if (asset?.uri) {
          resolve(asset.uri);
        } else {
          resolve(null);
        }
      }
    );
  });
}

export async function selectReceiptFromGallery(): Promise<string | null> {
  return new Promise(resolve => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          resolve(null);
          return;
        }

        if (response.errorCode) {
          Alert.alert('Gallery Error', response.errorMessage || 'Failed to open photo gallery.');
          resolve(null);
          return;
        }

        const asset = response.assets?.[0];
        if (asset?.uri) {
          resolve(asset.uri);
        } else {
          resolve(null);
        }
      }
    );
  });
}

export function promptReceiptOptions(onSelectUri: (uri: string) => void): void {
  Alert.alert(
    'Attach Receipt',
    'Choose a source for your receipt image:',
    [
      {
        text: 'Take Photo',
        onPress: async () => {
          const uri = await captureReceiptFromCamera();
          if (uri) {
            onSelectUri(uri);
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const uri = await selectReceiptFromGallery();
          if (uri) {
            onSelectUri(uri);
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
    { cancelable: true }
  );
}
