import { Request } from "express"
import httpStatus from "http-status";
import { SERVER_MSG } from "@repo/i18n";
import { ResponseHelper } from "@/helpers";
import { DatabaseUtil, LoggerUtil } from "@/utils";
import { IServiceResponse } from "@/types/service";
import { BotDailyRewardDao, BotTaskCompleteDao, BotTaskDao, BotUserDao } from "@/dao";
import { BOT_SCORE_TYPE } from "@repo/util/bot.constant";
import { differenceInDays } from "@/utils/date.util";
import { TelegramConfig } from "@/configs";

export default class BotTaskService {
  private botUserDao: BotUserDao
  private botTaskDao: BotTaskDao
  private botTaskCompleteDao: BotTaskCompleteDao
  private botDailyRewardDao: BotDailyRewardDao

  constructor() {
    this.botUserDao = new BotUserDao()
    this.botTaskDao = new BotTaskDao()
    this.botTaskCompleteDao = new BotTaskCompleteDao()
    this.botDailyRewardDao = new BotDailyRewardDao()
  }

  getTasks = async (req: Request): Promise<IServiceResponse> => {
    const { page, pageSize } = req.body
    
    const offset = page * pageSize
    const limit = pageSize

    const count = await this.botTaskDao.count({})
    
    const data = await this.botTaskDao.findAll({
      offset: offset,
      limit: limit,
      order: [
        ['order', 'ASC']
      ]
    })

    if (!data) {
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.NOT_FOUND)
    }

    const safeData = data
    return ResponseHelper.success(httpStatus.OK, SERVER_MSG.BOT_USER_AUTHENTICATE_SUCCESS, {
      tasks: safeData,
      total: count
    })
  }

  getTaskById = async (req: Request): Promise<IServiceResponse> => {
    const { task_id } = req.body
    const t = await DatabaseUtil.transaction()
    try {
      const data = await this.botTaskDao.findOne({
        where: { id: task_id },
        transaction: t
      })
      
      await t.commit()
      if (!data) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_USER_NOT_FOUND)
      }
      const safeData = data.toJSON()
      return ResponseHelper.success(httpStatus.OK, "Success", safeData)
    } catch (e) {
      console.error(e)
      await t.rollback()
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }
  
  updateTask = async (req: Request): Promise<IServiceResponse> => {
    const { id, icon, type, title, description, action, reward } = req.body
    const t = await DatabaseUtil.transaction()
    try {
      let data;
      let order = 0
      switch (type) {
        case 'invite':
          order = 1
          break;
        case 'wallet':
          order = 2
          break;
        default:
          break;
      }

      if (id > -1) {
        data = await this.botTaskDao.update({
          icon, title, description, action, reward, type, order
        }, {
          where: { id },
          transaction: t
        })
      } else {
        
        data = await this.botTaskDao.create(
          {
            type, icon, title, description, action, reward, order
          },
          { transaction: t }
        )
      }
      
      await t.commit()
      if (!data) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_USER_NOT_FOUND)
      }
      const safeData = data
      return ResponseHelper.success(httpStatus.OK, "Success", safeData)
    } catch (e) {
      console.error(e)
      await t.rollback()
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }

  getObjectives = async (req: Request): Promise<IServiceResponse> => {
    try {
      const tasksData = await this.botTaskDao.findAll({
        order: [
          ['order', 'ASC']
        ]
      })

      return ResponseHelper.success(
        httpStatus.OK,
        SERVER_MSG.BOT_TASKS_GET_SUCCESS,
        tasksData
      )
    } catch (e) {
      console.error(e)
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }

  getCompletedObjectives = async (req: Request): Promise<IServiceResponse> => {
    try {
      if (!req.botUserInfo) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_USER_NOT_FOUND)
      }

      const { id: user_id } = req.botUserInfo

      const data = await this.botTaskCompleteDao.findAll({
        where: {
          user_id: user_id
        }
      })

      return ResponseHelper.success(
        httpStatus.OK,
        SERVER_MSG.BOT_TASKS_GET_SUCCESS,
        data
      )
    } catch (e) {
      console.error(e)
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }

  getDailyRewards = async (req: Request): Promise<IServiceResponse> => {
    try {
      if (!req.botUserInfo) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_USER_NOT_FOUND)
      }

      const { id: user_id } = req.botUserInfo

      const data = await this.botDailyRewardDao.findOne({
        where: {
          user_id: user_id
        }
      })

      return ResponseHelper.success(
        httpStatus.OK,
        SERVER_MSG.BOT_TASKS_GET_SUCCESS,
        data
      )
    } catch (e) {
      console.error(e)
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }

  objectiveComplete = async (req: Request): Promise<IServiceResponse> => {
    try {
      if (!req.botUserInfo) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_USER_NOT_FOUND)
      }

      const { objective_id, objective_reward, objective_type } = req.body
      const { id: user_id, score } = req.botUserInfo

      const t = await DatabaseUtil.transaction()

      try {
        const ret = await this.botTaskCompleteDao.findOne({
          where: {
            user_id: user_id,
            task_id: objective_id
          },
          transaction: t
        })

        if (ret) {
          return ResponseHelper.error(
            httpStatus.CONFLICT,
            SERVER_MSG.BOT_TASKS_ALREADY_COMPLETED
          )
        }

        const createdTaskCompleted = await this.botTaskCompleteDao.create({
          user_id: user_id,
          task_type: objective_type,
          task_id: objective_id
        }, {
          transaction: t
        })

        await this.botUserDao.update({
          score: Number(score) + Number(objective_reward)
        }, {
          where: { id: user_id },
          transaction: t
        })

        await t.commit()

        return ResponseHelper.success(
          httpStatus.OK,
          SERVER_MSG.BOT_TASKS_COMPLETED_SUCCESS,
          createdTaskCompleted
        )
      } catch (err) {
          await t.rollback()
          LoggerUtil.error(err)
          return ResponseHelper.error(
            httpStatus.BAD_REQUEST,
            SERVER_MSG.BOT_TASKS_COMPLETE_FAILED
          )
        }
    } catch (e) {
      console.error(e)
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }

  updateDailyReward = async (req: Request): Promise<IServiceResponse> => {
    try {
      if (!req.botUserInfo) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_USER_NOT_FOUND)
      }

      const { id: user_id, score } = req.botUserInfo
      const t = await DatabaseUtil.transaction()

      try {
        const ret = await this.botDailyRewardDao.findOne({
          where: {
            user_id: user_id,
          },
          transaction: t
        })

        if (ret) {
          const safeRet = ret.toJSON()
          const daysDifference = differenceInDays(safeRet.updated_at, new Date())
          
          if (daysDifference === 0) {
            return ResponseHelper.error(
              httpStatus.BAD_REQUEST,
              SERVER_MSG.BOT_TASKS_COMPLETE_FAILED
            )
          } else {
            const newCountOfDay = Number(safeRet.day) + 1
            if (newCountOfDay <= BOT_SCORE_TYPE.DAILY_REWARD.limit) {
              const rewardAmount = BOT_SCORE_TYPE.DAILY_REWARD.score * newCountOfDay
  
              const newDailyRewardData = await this.botDailyRewardDao.update({
                  day: newCountOfDay,
                  reward: Number(safeRet.reward) + rewardAmount,
                  updated_at: new Date()
                }, {
                  where: { user_id: user_id },
                  transaction: t
                })
              
              await this.botUserDao.update({
                score: Number(score) + rewardAmount
              }, {
                where: { id: user_id },
                transaction: t
              })
  
              await t.commit()

              return ResponseHelper.success(
                httpStatus.OK,
                SERVER_MSG.BOT_TASKS_COMPLETED_SUCCESS,
                newDailyRewardData
              )
            }
            // TODO: should set return format when count of days is over limit
            return ResponseHelper.success(
              httpStatus.OK,
              SERVER_MSG.BOT_TASKS_COMPLETED_SUCCESS,
            )
          }
        }

        const rewardAmount = BOT_SCORE_TYPE.DAILY_REWARD.score

        const newDailyRewardData = await this.botDailyRewardDao.create({
          user_id: user_id,
          day: 1,
          reward: rewardAmount
        }, {
          transaction: t
        })

        await this.botUserDao.update({
          score: Number(score) + rewardAmount
        }, {
          where: { id: user_id },
          transaction: t
        })

        await t.commit()
  
        return ResponseHelper.success(
          httpStatus.OK,
          SERVER_MSG.BOT_TASKS_COMPLETED_SUCCESS,
          newDailyRewardData
        )
      } catch (ee) {
        await t.rollback()
        LoggerUtil.error(ee)
        return ResponseHelper.error(
          httpStatus.BAD_REQUEST,
          SERVER_MSG.BOT_TASKS_COMPLETE_FAILED
        )
      }
    } catch (e) {
      console.error(e)
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }

  checkChatMember = async (req: Request): Promise<IServiceResponse> => {
    try {
      if (!req.botUserInfo) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_USER_NOT_FOUND)
      }
      
      const { chat_id } = req.body
      const { tg_id } = req.botUserInfo

      const splitedChatLink = chat_id.split('/')

      if (splitedChatLink.length > 0 && tg_id) {
        const ret = await fetch(`${TelegramConfig.telegram_core_api}/bot${TelegramConfig.bot_token}/getChatMember?chat_id=@${splitedChatLink[splitedChatLink.length - 1]}&user_id=${tg_id}`)
        const data:any = await ret.json()
        console.log(data)
        if (data?.ok) {
          return ResponseHelper.success(
            httpStatus.OK,
            'You are a member of channel',
            data.result
          )
        } else {
          return ResponseHelper.error(
            httpStatus.NOT_FOUND,
            'You are not a member of channel'
          )
        }
      }

      return ResponseHelper.error(
          httpStatus.BAD_REQUEST,
          SERVER_MSG.SOMETHING_WENT_WRONG
        )
      
    } catch (e) {
      console.error(e)
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }
}