import { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GuestStartScreen } from '../features/onboarding/GuestStartScreen';

function TodayMenuApp() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isStarting, setIsStarting] = useState(false);

  const handleGuestStart = () => {
    // Guest authentication and recommendation-mode routing are added next.
    setIsStarting(true);
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="transparent"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
      />
      <GuestStartScreen
        isStarting={isStarting}
        onGuestStart={handleGuestStart}
      />
    </SafeAreaProvider>
  );
}

export default TodayMenuApp;
