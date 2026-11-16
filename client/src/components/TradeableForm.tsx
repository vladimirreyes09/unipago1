import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTradeables } from "../hooks/useTradeables";
import {
  TradableTypeSchema,
  TradeableBaseSchema,
  type Tradeable,
} from "../schemas/tradeable";

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
  tradeable?: Tradeable;
  onSuccess?: (tradeable: Tradeable) => void;
}

export function TradeableForm({ tradeable, onSuccess }: TradeableFormProps) {
  const { createTradeable, updateTradeable, loading, error, fieldErrors } =
    useTradeables();
  const isEditing = Boolean(tradeable);

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
    reset(
      tradeable
        ? {
            name: tradeable.name,
            symbol: tradeable.symbol,
            tradable_type: tradeable.tradable_type,
          }
        : DEFAULT_FORM_VAL
    );
  }, [tradeable, reset]);

  useEffect(() => {
    for (const fieldError of fieldErrors) {
      setError(fieldError.field, {
        type: fieldError.type,
        message: fieldError.message,
      });
    }
  }, [fieldErrors, setError]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const request = tradeable
      ? updateTradeable(tradeable.id, data)
      : createTradeable(data);

    return request.then((saved) => {
      if (saved) {
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

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button className="submit-button" type="submit" disabled={loading}>
        {loading
          ? isEditing
            ? "Actualizando..."
            : "Creando..."
          : isEditing
            ? "Actualizar"
            : "Crear"}
      </button>
    </form>
  );
}
