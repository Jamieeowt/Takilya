/* eslint-env jest */

// 1. Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => {
  const createChainableMock = () => {
    const chainable = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn((callback) => Promise.resolve(callback({ data: [], error: null, count: 0 }))),
    };
    return chainable;
  };

  return {
    createClient: jest.fn(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
      from: jest.fn(() => createChainableMock()),
      rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
      })),
      removeChannel: jest.fn().mockResolvedValue('ok'),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ data: { path: 'mock/path' }, error: null }),
          getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/mock.jpg' } })),
        })),
      },
    })),
  };
});

// 2. Mock expo-secure-store
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    getItemAsync: jest.fn(async (key) => store.get(key) || null),
    setItemAsync: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key) => {
      store.delete(key);
    }),
    isAvailableAsync: jest.fn(async () => true),
  };
});

// 3. Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn().mockReturnValue(true),
  useFonts: jest.fn().mockReturnValue([true, null]),
}));

// 4. Mock react-native-youtube-iframe
jest.mock('react-native-youtube-iframe', () => {
  const React = require('react');
  const { View } = require('react-native');
  return jest.fn((props) => React.createElement(View, { testID: 'youtube-iframe-player', ...props }));
});

// 5. Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// 6. Mock expo-blur
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props) => React.createElement(View, props, props.children),
  };
});

// 7. Mock expo-image
jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props) => React.createElement(View, { testID: 'expo-image', ...props }),
  };
});

// 8. Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text,
      createAnimatedComponent: (comp) => comp,
    },
    useSharedValue: (init) => ({ value: init }),
    useAnimatedStyle: (cb) => cb(),
    withSpring: (toValue) => toValue,
    withTiming: (toValue) => toValue,
    withDelay: (_, toValue) => toValue,
    withSequence: (...anims) => anims[0],
    Easing: {
      linear: (x) => x,
      ease: (x) => x,
      bezier: () => (x) => x,
    },
    runOnJS: (fn) => fn,
  };
});

// 9. Mock react-native-worklets
jest.mock('react-native-worklets', () => ({}));

