import { Text as RNText, TextInput as RNTextInput } from 'react-native';

export const FONT_FAMILY = {
  Source: 'Source',
  SourceBold: 'Source',
} as const;

export function setAppDefaultFont(fontFamily: string = FONT_FAMILY.Source) {
  // Set global default props for React Native Text component
  const TextComponent = RNText as unknown as { defaultProps?: { style?: object } };
  TextComponent.defaultProps = TextComponent.defaultProps || {};
  TextComponent.defaultProps.style = [
    { fontFamily },
    TextComponent.defaultProps.style,
  ];

  // Set global default props for React Native TextInput component
  const TextInputComponent = RNTextInput as unknown as { defaultProps?: { style?: object } };
  TextInputComponent.defaultProps = TextInputComponent.defaultProps || {};
  TextInputComponent.defaultProps.style = [
    { fontFamily },
    TextInputComponent.defaultProps.style,
  ];
}
