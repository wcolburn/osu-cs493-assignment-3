const { DataTypes } = require('sequelize')
const sequelize = require('../lib/sequelize')

const User = sequelize.define('user', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('password', has( this.name + value))
    }
  },
  admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
})

exports.User = User;
exports.UserClientFields = [
    'name',
    'email',
    'password',
    'admin'
]