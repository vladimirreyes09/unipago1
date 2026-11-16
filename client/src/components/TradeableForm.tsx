import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const AssetTypeEnumSchema = z.enum([
  "CryptoCurrency",
  "Commodity",
  "Future",
  "TradableStock",
  "PublicStock",
  "PrivateStock",
]);

const schema = z.object({
  name: z
    .string({ message: "Debe ser un texto" })
    .min(1, "Debe tener un nombre")
    .max(200, "El nombre no debe tener más de 200 caracteres"),
  symbol: z
    .string({ message: "Debe ser un texto" })
    .min(1, "Debe tener un símbolo")
    .max(200, "El símbolo no debe tener más de 200 caracteres"),
  tradable_type: z
    .string()
    .pipe(AssetTypeEnumSchema),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const DEFAULT_FORM_VAL: FormInput = {
  name: "",
  symbol: "",
  tradable_type: "",
};

export function TradeableForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_FORM_VAL,
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => console.log(data);

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
          {AssetTypeEnumSchema.options.map((type) => (
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

      <button className="submit-button" type="submit">
        Crear
      </button>
    </form>
  );
}
