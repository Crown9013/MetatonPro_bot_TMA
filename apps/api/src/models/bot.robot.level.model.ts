import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AutoIncrement,
} from "sequelize-typescript"


export interface IBotRobotLevel {
  id: number
  name: string
  level: number
  score: number
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

@Table({
  timestamps: true,
  tableName: "bot_robot_levels",
  underscored: true,
  paranoid: false
})
export default class BotRobotLevel extends Model implements IBotRobotLevel {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @AllowNull(false)
  @Default("")
  @Column(DataType.STRING)
  name!: string

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  level!: number

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  score!: number

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
