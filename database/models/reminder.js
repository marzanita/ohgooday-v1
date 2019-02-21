'use strict';
module.exports = (sequelize, DataTypes) => {
  const Reminder = sequelize.define('Reminder', {
    username: DataTypes.STRING,
    plantName: DataTypes.STRING,
    startDate: DataTypes.STRING,
    textDate: DataTypes.STRING,
    minutesNotify: DataTypes.INTEGER,
    phoneNum: DataTypes.INTEGER
  }, {});
  Reminder.associate = function(models) {
    // associations can be defined here
  };
  return Reminder;
};