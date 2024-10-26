import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AutoIncrement,
  ForeignKey,
} from "sequelize-typescript"

import BotUser from "./bot.user.model"
import BotRobot from "./bot.robot.model"

export interface IBotRobotUser {
  id: number
  user_id: number
  robot_id: number
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

@Table({
  timestamps: true,
  tableName: "bot_robot_users",
  underscored: true,
  paranoid: false
})
export default class BotRobotUser extends Model implements IBotRobotUser {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @AllowNull(true)
  @ForeignKey(() => BotUser)
  @Column(DataType.INTEGER)
  user_id!: number

  @AllowNull(true)
  @ForeignKey(() => BotRobot)
  @Column(DataType.INTEGER)
  robot_id!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date

  @AllowNull(false)
  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date

  @AllowNull(true)
  @DeletedAt
  @Column(DataType.DATE)
  deleted_at?: Date
}
