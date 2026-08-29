'use client';

import {
  PasswordInput,
  PasswordInputProps,
  Select,
  SelectProps,
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

export function StoreSelect(props: SelectProps) {
  return (
    <Select
      size="md"
      radius="md"
      allowDeselect={false}
      maxDropdownHeight={280}
      comboboxProps={{
        withinPortal: true,
        position: 'bottom-start',
        offset: 8,
        middlewares: { flip: true, shift: true },
      }}
      scrollAreaProps={{ type: 'auto', scrollbarSize: 6, offsetScrollbars: true }}
      {...props}
      styles={{
        ...sharedInputStyles,
        input: { ...sharedInputStyles.input, cursor: 'pointer', paddingInlineEnd: 42 },
        dropdown: {
          padding: 6,
          borderRadius: 14,
          border: '1px solid var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
          boxShadow: '0 18px 48px rgba(0, 0, 0, 0.22)',
        },
        options: { padding: 0 },
        option: {
          minHeight: 44,
          borderRadius: 10,
          padding: '10px 12px',
          fontSize: 15,
          lineHeight: 1.35,
        },
      }}
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
