/* Global mocks so screen tests can render without native modules. */

// AsyncStorage — official in-memory jest mock (getItem/setItem/... are jest.fn).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// React Navigation: screens receive `navigation` as a prop, but they import
// useFocusEffect from the lib. Run its callback once on mount (like a focus).
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback) => React.useEffect(callback, []),
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useIsFocused: () => true,
    useRoute: () => ({ params: {} }),
  };
});
