import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TradableTypeSchema,
  TradeableBaseSchema,
  type CreateTradeableInput,
  type Tradeable,
  type TradeableField,
  type UpdateTradeableInput,
} from "../schemas/tradeable";
import type { FormFieldError } from "../utils/errorParsing";

const schema = TradeableBaseSchema.extend({
  tradable_type: z.string().pipe(TradableTypeSchema),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const DEFAULT_FORM_VAL: FormInput = {
  name: "",
  symbol: "",
  tradable_type: "",
};

interface TradeableFormProps {
  tradeable?: Tradeable | null;
  loading: boolean;
  error: string | null;
  fieldErrors: FormFieldError<TradeableField>[];
  onCreate: (payload: CreateTradeableInput) => Promise<Tradeable | null>;
  onUpdate: (
    id: number,
    payload: UpdateTradeableInput
  ) => Promise<Tradeable | null>;
  onCancelEdit?: () => void;
  onSuccess?: (tradeable: Tradeable) => void;
}

export function TradeableForm({
  tradeable,
  loading,
  error,
  fieldErrors,
  onCreate,
  onUpdate,
  onCancelEdit,
  onSuccess,
}: TradeableFormProps) {
  const isEditing = Boolean(tradeable);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: tradeable
      ? {
          name: tradeable.name,
          symbol: tradeable.symbol,
          tradable_type: tradeable.tradable_type,
        }
      : DEFAULT_FORM_VAL,
  });

  useEffect(() => {
    for (const fieldError of fieldErrors) {
      setError(fieldError.field, {
        type: fieldError.type,
        message: fieldError.message,
      });
    }
  }, [fieldErrors, setError]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setSubmitAttempted(true);

    const request = tradeable
      ? onUpdate(tradeable.id, data)
      : onCreate(data);

    return request.then((saved) => {
      if (saved) {
        setSubmitAttempted(false);
        if (!isEditing) {
          reset(DEFAULT_FORM_VAL);
        }
        onSuccess?.(saved);
      }
    });
  };

  return (
    <form className="tradeable-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-field">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          type="text"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="form-error" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="symbol">Símbolo</label>
        <input
          id="symbol"
          type="text"
          aria-invalid={Boolean(errors.symbol)}
          {...register("symbol")}
        />
        {errors.symbol && (
          <p className="form-error" role="alert">
            {errors.symbol.message}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="tradable_type">Tipo de activo</label>
        <select
          id="tradable_type"
          aria-invalid={Boolean(errors.tradable_type)}
          {...register("tradable_type")}
        >
          <option value="" disabled>
            Selecciona un tipo
          </option>
          {TradableTypeSchema.options.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.tradable_type && (
          <p className="form-error" role="alert">
            {errors.tradable_type.message}
          </p>
        )}
      </div>

      {submitAttempted && error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button className="submit-button" type="submit" disabled={loading}>
          {loading
            ? isEditing
              ? "Actualizando..."
              : "Creando..."
            : isEditing
              ? "Actualizar"
              : "Crear"}
        </button>

        {isEditing && onCancelEdit && (
          <button
            type="button"
            className="cancel-button"
            onClick={onCancelEdit}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
