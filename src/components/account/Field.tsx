import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";
import NativeSelect from "@mui/material/NativeSelect";
import OutlinedInput, { type OutlinedInputProps } from "@mui/material/OutlinedInput";

type FieldProps = Omit<OutlinedInputProps, "error" | "id" | "label"> & {
  id: string;
  label: string;
  /** Shown after the label, e.g. "(optional)". */
  note?: string;
  /** The refusal for this field; marks the input invalid and is announced with it. */
  error?: string;
  hint?: string;
  full?: boolean;
};

/** A label above its input, as the mockups draw it; the label is a real <label> for the input. */
export function Field({ id, label, note, error, hint, full, inputProps, ...input }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        gridColumn: full ? "1 / -1" : undefined,
      }}
    >
      <Box
        component="label"
        htmlFor={id}
        sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}
      >
        {label}
        {note && (
          <Box component="span" sx={{ fontWeight: 400, color: "text.secondary", ml: 0.5 }}>
            {note}
          </Box>
        )}
      </Box>
      <OutlinedInput
        id={id}
        size="small"
        fullWidth
        error={Boolean(error)}
        inputProps={{
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
          ...inputProps,
        }}
        {...input}
      />
      {error ? (
        <FormHelperText id={`${id}-error`} error sx={{ m: 0 }}>
          {error}
        </FormHelperText>
      ) : (
        hint && (
          <FormHelperText id={`${id}-hint`} sx={{ m: 0 }}>
            {hint}
          </FormHelperText>
        )
      )}
    </Box>
  );
}

type Option = { value: string; label: string };

/** A label above a native select (the same look as Field). */
export function SelectField({
  id,
  name,
  label,
  options,
  defaultValue,
  error,
  full,
}: {
  id: string;
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string;
  error?: string;
  full?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        gridColumn: full ? "1 / -1" : undefined,
      }}
    >
      <Box component="label" htmlFor={id} sx={{ fontSize: 12, fontWeight: 600 }}>
        {label}
      </Box>
      <NativeSelect
        input={<OutlinedInput size="small" error={Boolean(error)} />}
        inputProps={{ id, name, "aria-describedby": error ? `${id}-error` : undefined }}
        defaultValue={defaultValue}
        fullWidth
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </NativeSelect>
      {error && (
        <FormHelperText id={`${id}-error`} error sx={{ m: 0 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}
