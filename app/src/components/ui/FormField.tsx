import React from 'react';
import {
  Controller,
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';

export interface FormFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  rules?: Omit<
    RegisterOptions<TFieldValues, Path<TFieldValues>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  render: (props: {
    value: any;
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    error?: string;
  }) => React.ReactElement;
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  render,
}: FormFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) =>
        render({
          value,
          onChange,
          onBlur,
          error: error?.message,
        })
      }
    />
  );
}
