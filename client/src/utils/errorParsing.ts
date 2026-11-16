import { z } from "zod";

export const ValidationFieldErrorSchema = z.object({
  loc: z.union([
    z.string(),
    z.number(),
    z.array(z.union([z.string(), z.number()])),
  ]),
  message: z.string(),
  type: z.string(),
});

export const ValidationErrorSchema = z.object({
  type: z.literal("validation"),
  message: z.string(),
  fields: z.array(ValidationFieldErrorSchema),
});

export const UnknownErrorSchema = z.object({
  type: z.literal("unknown"),
  message: z.string(),
});

export const TaggedApiErrorSchema = z.discriminatedUnion("type", [
  ValidationErrorSchema,
  UnknownErrorSchema,
]);

export const ApiErrorResponseSchema = z.object({
  error: z.union([z.string(), TaggedApiErrorSchema]),
});

export type ValidationFieldError = z.infer<typeof ValidationFieldErrorSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type UnknownError = z.infer<typeof UnknownErrorSchema>;
export type TaggedApiError = z.infer<typeof TaggedApiErrorSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export interface FormFieldError<TField extends string = string> {
  field: TField;
  message: string;
  type: string;
}

export interface ParsedApiError<TField extends string = string> {
  message: string;
  isValidation: boolean;
  fields: FormFieldError<TField>[];
}

export function isValidationError(
  error: TaggedApiError
): error is ValidationError {
  return error.type === "validation";
}

function normalizeLocation(loc: ValidationFieldError["loc"]): string {
  return Array.isArray(loc) ? loc.join(".") : String(loc);
}

export function extractValidationFields<TField extends string = string>(
  error: ValidationError,
  fieldSchema?: z.ZodType<TField>
): FormFieldError<TField>[] {
  return error.fields.flatMap((item) => {
    const normalized = normalizeLocation(item.loc);

    if (fieldSchema) {
      const parsedField = fieldSchema.safeParse(normalized);
      if (!parsedField.success) {
        return [];
      }

      return [
        {
          field: parsedField.data,
          message: item.message,
          type: item.type,
        },
      ];
    }

    return [
      {
        field: normalized as TField,
        message: item.message,
        type: item.type,
      },
    ];
  });
}

export function parseErrorResponse<TField extends string = string>(
  response: Response,
  fieldSchema?: z.ZodType<TField>
): Promise<ParsedApiError<TField>> {
  return response.json().then((raw: unknown): ParsedApiError<TField> => {
    const parsed = ApiErrorResponseSchema.safeParse(raw);

    if (parsed.success) {
      const { error } = parsed.data;

      if (typeof error === "string") {
        return {
          isValidation: false,
          message: error,
          fields: [],
        };
      }

      if (isValidationError(error)) {
        return {
          isValidation: true,
          message: error.message.trim(),
          fields: extractValidationFields(error, fieldSchema),
        };
      }

      return {
        isValidation: false,
        message: error.message.trim(),
        fields: [],
      };
    }

    return {
      isValidation: false,
      message: `Error en la solicitud (HTTP ${response.status})`,
      fields: [],
    };
  });
}
