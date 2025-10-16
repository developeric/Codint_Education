export const adminMiddleware = (req, res, next) => {
  const user = req.user;
  try {
    if (user.role !== "admin") {
      console.log(user);
      return res
        .status(403)
        .json({ ok: false, msg: "Usted no es Administrador", data: null });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Message: "Internal Error Server" });
  }
};
