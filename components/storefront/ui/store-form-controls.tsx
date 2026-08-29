'use client';

import {
  NativeSelect,
  NativeSelectProps,
  PasswordInput,
  PasswordInputProps,
  Textarea,
  TextareaProps,
  TextInput,
  TextInputProps,
} from '@mantine/core';

const sharedInputStyles = {
  input: {
    minHeight: 52,
    borderRadius: 12,
    border: '1px solid var(--mantine-color-default-border)',
    backgroundColor: 'var(--mantine-color-body)',
    color: 'var(--mantine-color-text)',
    fontSize: 16,
    paddingInline: 16,
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
  },
  label: {
    marginBottom: 8,
    color: 'var(--mantine-color-dimmed)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
  },
  error: {
    marginTop: 6,
    fontSize: 12,
  },
} as const;

export function StoreTextInput(props: TextInputProps) {
  return <TextInput size="md" radius="md" {...props} styles={sharedInputStyles} />;
}

export function StoreNativeSelect({ styles, ...props }: NativeSelectProps) {
  return (
    <NativeSelect
      size="md"
      radius="md"
      {...props}
      styles={
        typeof styles === 'object'
          ? { ...sharedInputStyles, ...styles }
          : (styles ?? sharedInputStyles)
      }
    />
  );
}

export function StorePasswordInput(props: PasswordInputProps) {
  return <PasswordInput size="md" radius="md" {...props} styles={sharedInputStyles} />;
}

export function StoreTextarea(props: TextareaProps) {
  return (
    <Textarea
      size="md"
      radius="md"
      minRows={3}
      autosize
      {...props}
      styles={{
        ...sharedInputStyles,
        input: {
          ...sharedInputStyles.input,
          minHeight: 112,
          paddingBlock: 14,
          resize: 'vertical',
        },
      }}
    />
  );
}
