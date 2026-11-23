const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.getById = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'firstname', 'surname', 'email'],
  });
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  return res.status(200).json(user);
};

exports.create = async (req, res) => {
  const { firstname, surname, email, password, confirmPassword } = req.body;
  if (!firstname || !surname || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }
  if (await User.findOne({ where: { email } })) {
    return res.status(400).json({ message: 'E-mail já cadastrado' });
  }
  const hash = await bcrypt.hash(password, 10);
  await User.create({ firstname, surname, email, password: hash });
  return res.status(201).json({ message: 'Usuário criado' });
};

exports.update = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const { firstname, surname, email } = req.body;
  if (!firstname || !surname || !email) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }
  await user.update({ firstname, surname, email });
  return res.status(204).send();
};

exports.remove = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  await user.destroy();
  return res.status(204).send();
};

exports.token = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
  }
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'E-mail ou senha incorretos' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return res.status(200).json({ token });
};