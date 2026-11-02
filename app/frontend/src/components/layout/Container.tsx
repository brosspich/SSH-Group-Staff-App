import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

export interface ContainerProps extends ViewProps {
  paddingHorizontal?: number;
}

export const Container: React.FC<ContainerProps> = ({
  paddingHorizontal = 16,
  style,
  children,
  ...rest
}) => {
  return (
    <View style={[styles.container, { paddingHorizontal }, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
