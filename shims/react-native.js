const React = require("react");
const ReactNative = require("react-native");
const { getTextSizeScale, scaleTextStyle } = require("../utils/textSize");

const { StyleSheet } = ReactNative;
const NativeText = ReactNative.Text;
const NativeTextInput = ReactNative.TextInput;

function useScaledTypographyStyle(style) {
    // Lazy require to avoid circular dependency:
    // shim → usePreferences → expo-secure-store → react-native → shim
    const { usePreferencesStore } = require("../store/usePreferences");
    const textSizePreset = usePreferencesStore((state) => state.textSizePreset);
    const scale = getTextSizeScale(textSizePreset);

    return React.useMemo(() => {
        if (style == null || scale === 1) {
            return style;
        }

        return scaleTextStyle(StyleSheet.flatten(style), scale);
    }, [scale, style]);
}

// React 19 treats `ref` as a regular prop on function components, so the
// spread below forwards it to the native component without forwardRef.
function Text(props) {
    const scaledStyle = useScaledTypographyStyle(props.style);

    return React.createElement(NativeText, {
        ...props,
        allowFontScaling: props.allowFontScaling ?? false,
        style: scaledStyle,
    });
}

function TextInput(props) {
    const scaledStyle = useScaledTypographyStyle(props.style);

    return React.createElement(NativeTextInput, {
        ...props,
        allowFontScaling: props.allowFontScaling ?? false,
        style: scaledStyle,
    });
}

Text.displayName = NativeText.displayName || "Text";
TextInput.displayName = NativeTextInput.displayName || "TextInput";
TextInput.State = NativeTextInput.State;

// Copy all property descriptors (including lazy getters like FlatList,
// VirtualizedList, etc.) — spread only copies data properties and loses them.
const shimExports = {};
Object.defineProperties(
    shimExports,
    Object.getOwnPropertyDescriptors(ReactNative),
);
shimExports.Text = Text;
shimExports.TextInput = TextInput;

module.exports = shimExports;
