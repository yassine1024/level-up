import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Fonts, Radii } from "@/constants/theme";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  /** Label of the current selection, or undefined when nothing is selected. */
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  value,
  options,
  onSelect,
  placeholder = "Choose an option",
  disabled = false,
}: SelectFieldProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleSelect = (option: SelectOption) => {
    onSelect(option.value);
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled, expanded: open }}
        style={[
          styles.box,
          !value && styles.boxPlaceholder,
          disabled && styles.boxDisabled,
        ]}>
        <Text style={styles.boxText} numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={disabled ? Colors.disabledText : Colors.muted}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent>
        <View style={styles.modalRoot}>
          <Animated.View entering={FadeIn.duration(160)} style={styles.backdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={close}
              accessibilityLabel="Close"
              accessibilityRole="button"
            />
          </Animated.View>

          <Animated.View
            entering={SlideInDown.springify().damping(18).stiffness(180)}
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable
                onPress={close}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close">
                <Ionicons name="close" size={22} color={Colors.muted} />
              </Pressable>
            </View>

            <ScrollView bounces={false} style={styles.list}>
              {options.map((option) => {
                const selected = option.label === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[styles.option, selected && styles.optionSelected]}>
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                      numberOfLines={2}>
                      {option.label}
                    </Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={Colors.primaryDark}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  label: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 6,
  },
  box: {
    height: 52,
    width: "100%",
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  boxPlaceholder: { borderColor: Colors.border },
  boxDisabled: { backgroundColor: Colors.disabled, borderColor: Colors.disabled },
  boxText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.text,
    flexShrink: 1,
  },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(16,36,28,0.35)",
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: "70%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.text,
  },
  list: { flexGrow: 0 },
  option: {
    minHeight: 56,
    borderRadius: Radii.button,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    shadowColor: Colors.cardBorder,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    shadowColor: Colors.primary,
  },
  optionText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
    color: Colors.text,
    flexShrink: 1,
  },
  optionTextSelected: { color: Colors.primaryDark },
});
