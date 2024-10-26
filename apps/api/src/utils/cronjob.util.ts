import { addSeconds, differenceInSeconds, subSeconds } from "date-fns"
import * as cron from "node-cron"
import { Op } from "sequelize"

import { BotDailyRewardDao, BotScoreHistoryDao, BotUserDao } from "@/dao"

import { BOT_REWARD_LIMIT_TIME, BOT_SCORE_TYPE } from "@repo/util/bot.constant"

import DatabaseUtil from "./database.util"
import { differenceInDays } from "./date.util"

const HourlyReward = async () => {
  console.info("----- Hourly Reward Started -----")
  const startTime = new Date().getTime()

  const botUserDao = new BotUserDao()
  const botScoreHistoryDao = new BotScoreHistoryDao()

  let totalUserCount = await botUserDao.count({
    where: {
      hourly_rewarded_at: {
        [Op.lte]: subSeconds(new Date(), BOT_SCORE_TYPE.HOURLY_REWARD.unit)
      },
      last_online_at: {
        [Op.gte]: subSeconds(new Date(), BOT_REWARD_LIMIT_TIME)
      },
      is_online: 0
    }
  })
  console.info(`\ttotal users: ${totalUserCount}`)

  let users = await botUserDao.findAll({
    where: {
      hourly_rewarded_at: {
        [Op.lte]: subSeconds(new Date(), BOT_SCORE_TYPE.HOURLY_REWARD.unit)
      },
      last_online_at: {
        [Op.gte]: subSeconds(new Date(), BOT_REWARD_LIMIT_TIME)
      },
      is_online: 0
    },
    limit: 300
  })
  console.info(`\tusers: ${users.length}`)

  const t = await DatabaseUtil.transaction()

  try {
    const botUserUpdates = []
    const botScoreHistoryUpdates = []
    const botDailyRewardDestroies = []

    for (const user of users) {
      // User json data from `bot_users` table
      const safeUser = user.toJSON()

      // Getting score history record from `bot_score_histories` table
      const lastReward = await botScoreHistoryDao.findOne({
        where: {
          user_id: safeUser.id,
          type: BOT_SCORE_TYPE.HOURLY_REWARD.type
        },
        order: [["created_at", "DESC"]],
        transaction: t
      })
      const safeLastReward = lastReward.toJSON()

      // Calculating time difference in seconds since last reward update time
      const now = new Date()
      const secondsDifference = differenceInSeconds(now, safeLastReward.updated_at)
      const count = Math.floor(secondsDifference / (BOT_SCORE_TYPE.HOURLY_REWARD.unit))

      if (count > 0) {
        // Update user score, if it is passed 1+ hour since last reward update
        // @score_calculation_formula: current_score + hourly_reward * time_count
        // TODO: formula to calculate user's score
        botUserUpdates.push(
          botUserDao.update(
            {
              score: BigInt(safeUser.score) + BigInt(BOT_SCORE_TYPE.HOURLY_REWARD.score * count),
              // hourly_rewarded_at: addSeconds(safeLastReward.updated_at, count * BOT_SCORE_TYPE.HOURLY_REWARD.unit)
              hourly_rewarded_at: now,
              updated_at: now
            },
            {
              where: { id: safeUser.id },
              transaction: t
            }
          )
        )

        botScoreHistoryUpdates.push(
          botScoreHistoryDao.update(
            {
              score: BigInt(safeLastReward.score) + BigInt(BOT_SCORE_TYPE.HOURLY_REWARD.score * count),
              updated_at: now
            },
            {
              where: {
                user_id: safeUser.id,
                type: BOT_SCORE_TYPE.HOURLY_REWARD.type
              },
              transaction: t
            }
          )
        )
      }
    }

    await Promise.all([...botUserUpdates, ...botUserUpdates])
    await t.commit()

    const endTime = new Date().getTime()

    console.info(`\tupdates: ${botUserUpdates.length + botScoreHistoryUpdates.length}\n`)
    console.info(
      `\tstartTime: ${startTime}\n\tendTime: ${endTime}\n\telapsed time: ${endTime - startTime} ms`
    )

    console.info("----- Hourly Reward Completed -----")

  } catch (e: any) {
    await t.rollback()
    console.error("Hourly reward processing failed with error: ", e)
    throw new Error("Hourly reward processing failed with error: " + e.message)
  }
}

const DailyReward = async () => {
  console.info("----- Daily Reward Started -----")
  const startTime = new Date().getTime()

  const botUserDao = new BotUserDao()
  const botDailyRewardDao = new BotDailyRewardDao()

  let users = await botUserDao.findAll({
    limit: 300
  })
  console.info(`\tusers: ${users.length}`)

  const t = await DatabaseUtil.transaction()

  try {
    const botDailyRewardDestroies = []

    for (const user of users) {
      // User json data from `bot_users` table
      const safeUser = user.toJSON()

      // Calculating time difference in seconds since last reward update time
      
      console.info("----- Daily reward check -----")
      const lastDailyReward = await botDailyRewardDao.findOne({
        where: {
          user_id: safeUser.id,
        },
        transaction: t
      })
      if (lastDailyReward) {
        const safelastDailyReward = lastDailyReward.toJSON()
        const daysDifference = differenceInDays(safelastDailyReward.updated_at, new Date())
        
        if (daysDifference > 1) {
          botDailyRewardDestroies.push(
            botDailyRewardDao.destroy({
              where: {
                user_id: safeUser.id,
              },
              transaction: t
            })
          )
        }
      }
    }

    await Promise.all([...botDailyRewardDestroies])
    await t.commit()

    const endTime = new Date().getTime()

    console.info(`\tupdates: ${botDailyRewardDestroies.length}\n`)
    console.info(
      `\tstartTime: ${startTime}\n\tendTime: ${endTime}\n\telapsed time: ${endTime - startTime} ms`
    )

    console.info("----- Daily Reward Completed -----")

  } catch (e: any) {
    await t.rollback()
    console.error("Daily reward processing failed with error: ", e)
    throw new Error("Daily reward processing failed with error: " + e.message)
  }
}

const CronJobUtil = () => {
  cron.schedule("*/5 * * * *", async () => {
    await HourlyReward()
  })

  cron.schedule("0 * * * *", async () => {
    await DailyReward()
  })
}

export default CronJobUtil
