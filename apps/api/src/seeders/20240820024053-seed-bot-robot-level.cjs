'use strict';

const { defaultRobotLevels } = require("../constants/bot.seeder.constant.cjs")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.bulkInsert('bot_robot_levels', [...defaultRobotLevels])
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('bot_robot_levels', null, {});
  }
};
