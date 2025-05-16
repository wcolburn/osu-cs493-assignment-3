const { DataTypes } = require('sequelize')
const sequelize = require('../lib/sequelize')
const bcrypt = require('bcryptjs')

const User = sequelize.define('user', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
})

User.beforeSave(async (user, options) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

exports.User = User;
exports.UserClientFields = [
    'name',
    'email',
    'password',
    'admin'
]