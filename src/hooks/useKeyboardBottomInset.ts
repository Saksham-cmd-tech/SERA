import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

/**
 * Hook that tracks the soft keyboard height across Android and iOS.
 * Returns the keyboard height plus an optional extra offset when active,
 * or 0 when the keyboard is hidden.
 */
export function useKeyboardBottomInset(extraOffset: number = 20): number {
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height + extraOffset);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [extraOffset]);

  return keyboardHeight;
}
