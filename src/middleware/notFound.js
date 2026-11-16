export const notFound = (req, res, next) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
    },
  });
};
