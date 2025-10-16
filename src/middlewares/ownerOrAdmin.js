export const ownerOrAdmin = (model) => {
  return async (req, res, next) => {
    const { id } = req.params;
    //Guardamos en una constante el ID que nos colocamos desde el params
    const user = req.user;
    try {
    //accedemos al contenido del Token previamente otorgado en el AuthMiddleware
      if (user.role === "admin") {
        return next();
        //verificamos que solo pueda acceder solo si es administrador
      }
      const recurso = await model.findOne({ _id: id, author: user.id });
      if (!recurso) {
        return res
          .status(403)
          .json({ msg: "Usted no tiene la autorizacion para acceder" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Internal Error Server" });
    }
  };
};
