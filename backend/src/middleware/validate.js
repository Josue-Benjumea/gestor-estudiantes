/**
 * Zod Validation Middleware
 * Validates request body against a Zod schema.
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors,
      });
    }

    req.validatedBody = result.data;
    next();
  };
}
