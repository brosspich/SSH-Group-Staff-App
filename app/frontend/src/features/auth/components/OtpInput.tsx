import React, { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const val = text.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join("");
    if (fullCode.length === length && !newDigits.includes("")) {
      onComplete(fullCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[styles.box, digit ? styles.boxFilled : null]}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 16,
  },
  box: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#D1D1D6",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    backgroundColor: "#FAFAFA",
  },
  boxFilled: {
    borderColor: "#007AFF",
    backgroundColor: "#FFFFFF",
  },
});
