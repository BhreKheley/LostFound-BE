export const methodNotAllowed = (req, res, next) => {
  res.status(405).json({
    error: {
      code: "METHOD_NOT_ALLOWED",
      message: `Metode ${req.method} tidak diizinkan pada endpoint ini`,
    },
  });
};
