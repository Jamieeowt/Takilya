# Takilya Safe Area & Navigation Bar Offsets Specification

## Standard Formula
Wrap the entire application in `SafeAreaProvider` from `react-native-safe-area-context`.
Never hard-code notch, system navigation bar, or home indicator offsets.

### Tab Bar Offset
```ts
const insets = useSafeAreaInsets();
const bottomInset = Math.max(insets.bottom, 12);
const tabHeight = 56 + bottomInset;
```

- **Height**: `56 + bottomInset`
- **Bottom Inset**: `Math.max(insets.bottom, 12)`
- Ensures the tab bar never overlaps the iOS home indicator, Android 3-button navigation bar, or Android gesture navigation pill.

### Feed Overlay & Floating Controls
All vertical feeds, floating controls, bottom action rails, and sheets must sit above the bottom navigation bar:
```ts
const overlayBottomPadding = 56 + Math.max(insets.bottom, 12) + 16;
```

- **Action Rail**: Positioned on the right edge, above `overlayBottomPadding`.
- **Metadata Column (Title, Director, Synopsis)**: Positioned on the bottom left, above `overlayBottomPadding`.
- **Pointer Events**: Parent containers use `pointerEvents="box-none"` so touches pass through cleanly to the native video player surface.
- **Top Safe Area**: Top controls (Mute button, Promoted pill, Category switchers) use `top: Platform.OS === 'ios' ? insets.top + 8 : insets.top + 16`.

