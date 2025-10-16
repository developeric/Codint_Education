import { hashPassword } from "../helpers/bcrypt.helper";

//REGISTER
export const Register = async (req, res) => {
  //Desestructuración
  const { username, email, password, role, profile } = req.body;
  console.log(req.body);
  try {
    //Creación
    const hashedPassword = await hashPassword(password);

    //Existencia de Email
    const emailExiste = await UserModel.findOne({ email: email });
    if (emailExiste) {
      return res
        .status(400)
        .json({ ok: false, msg: "Este email ya está Registrado" });
    }

    //Existencia de User
    const userExiste = await UserModel.findOne({ username: username });
    if (userExiste) {
      return res
        .status(400)
        .json({ ok: false, msg: "Este Username ya está Registrado" });
    }
    const user = await UserModel.create({
      //datos que se van a crear del Usuario
      //   username,
      //   email,
      //   password: hashedPassword,
      //   role,
      //   profile,
    });

    return res
      .status(201)
      .json({ ok: true, msg: "Registrado Correctamente", data: user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ ok: false, msg: "No Registrado", data: null });
  }
};

//LOGIN
export const Login = async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });

  if (!user) {
    return res.status(400).json({ ok: false, msg: "Algo ha Salido Mal" });
  }

  const validPassword = await comparePassword(password, user.password);

  if (!validPassword) {
    return res.status(401).json({ ok: false, msg: "Algo ha salido Mal" });
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
    name: user.profile.firstName,
    lastname: user.profile.lastName,
  });

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
  });
  return res.status(200).json({ ok: true, msg: "Logueado Correctamente" });
};

//LOGOUT
export const Logout = (req, res) => {
  res.clearCookie("token"); // Eliminar cookie del navegador
  return res.json({ message: "Logout exitoso" });
};
