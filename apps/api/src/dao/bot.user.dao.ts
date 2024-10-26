import { QueryTypes } from "sequelize"

import { BotUser } from "@/models"
import { DatabaseUtil, LoggerUtil } from "@/utils"

import BaseDao from "./base.dao"

export default class BotUserDao extends BaseDao {
  constructor() {
    super(BotUser)
  }

  getRank = async (userId: number) => {
    try {
      const sql = `
        SELECT rank
        FROM (
          SELECT id, score, RANK() OVER (ORDER BY score DESC) as rank
          FROM bot_users
        ) ranked_users
        WHERE id = :userId
      `

      const result: any = await DatabaseUtil.query(sql, {
        replacements: { userId },
        type: QueryTypes.SELECT
      })

      return BigInt(result[0]?.rank) ?? 1
    } catch (e) {
      LoggerUtil.error(e)
      console.error(e)
      throw e
    }
  }

  
  getRankList = async () => {
    try {
      const sql = `
        SELECT id, tg_avatar, tg_username, tg_first_name, tg_last_name, score, RANK() OVER (ORDER BY score DESC) as rank
          FROM bot_users LIMIT 100
      `

      const result: any = await DatabaseUtil.query(sql)

      return result[0]
    } catch (e) {
      LoggerUtil.error(e)
      console.error(e)
      throw e
    }
  }
}
