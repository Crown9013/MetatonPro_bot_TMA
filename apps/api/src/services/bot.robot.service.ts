import { Request } from "express"
import httpStatus from "http-status"
import { literal } from "sequelize"

import { BotItemDao, BotRobotDao, BotRobotItemDao, BotRobotAttributeDao } from "@/dao"
import { ResponseHelper } from "@/helpers"
import { BotItemAttribute, BotRobot, BotRobotAttribute, BotRobotItem } from "@/models"
import { IServiceResponse } from "@/types/service"
import { DatabaseUtil, LoggerUtil } from "@/utils"

import { SERVER_MSG } from "@repo/i18n"

export const RobotDefaultAttributesData = [
  {attribute_name: 'attack', attribute_value: 50},
  {attribute_name: 'attack-speed', attribute_value: 10},
  {attribute_name: 'health', attribute_value: 2000},
  {attribute_name: 'energy', attribute_value: 100},
  {attribute_name: 'energy-shield', attribute_value: 0},
  {attribute_name: 'armor', attribute_value: 5},
]

export default class BotRobotService {
  private botRobotDao: BotRobotDao
  private botRobotAttributeDao: BotRobotAttributeDao
  private botItemDao: BotItemDao
  private botRobotItemDao: BotRobotItemDao

  constructor() {
    this.botRobotDao = new BotRobotDao()
    this.botItemDao = new BotItemDao()
    this.botRobotItemDao = new BotRobotItemDao()
    this.botRobotAttributeDao = new BotRobotAttributeDao()
  }

  getRobots = async (req: Request): Promise<IServiceResponse> => {
    const { page, pageSize } = req.body
    
    const offset = page * pageSize
    const limit = pageSize

    const count = await this.botRobotDao.count({
      where: { owner_type: ['default', 'platform'] },
    })

    const data = await this.botRobotDao.findAll({
      where: { owner_type: ['default', 'platform'] },
      offset: offset,
      limit: limit,
      order: ['owner_type', 'level']
    })

    if (!data) {
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_NOT_FOUND)
    }
    const safeData = data
    return ResponseHelper.success(httpStatus.OK, "Success", {
      robots: safeData,
      total: count
    })
  }

  getRobotById = async (req: Request): Promise<IServiceResponse> => {
    const { robot_id } = req.body
    const t = await DatabaseUtil.transaction()
    try {
      const data = await this.botRobotDao.findOne({
        where: { id: robot_id },
        include: [
          {
            model: BotRobotAttribute
          },
          {
            model: BotRobotItem
          }
        ],
        transaction: t
      })
      
      await t.commit()
      if (!data) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_NOT_FOUND)
      }
      const safeData = data.toJSON()
      return ResponseHelper.success(httpStatus.OK, "Success", safeData)
    } catch (e) {
      console.error(e)
      await t.rollback()
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_SET_ITEM_FAILED)
    }
  }
  
  updateRobot = async (req: Request): Promise<IServiceResponse> => {
    const { id, image, name, score, level, price, owner_type } = req.body
    const t = await DatabaseUtil.transaction()
    try {
      let data;

      if (Number(id) > -1) {
        data = await this.botRobotDao.update({
          image, name, score, level, price
        }, {
          where: { id },
          transaction: t
        })
      } else {
        data = await this.botRobotDao.create({
          image, name, score, level, price, owner_type
        }, {
          transaction: t
        })

        const safeNewRobotData = data.toJSON()

        for (let rad of RobotDefaultAttributesData) {
          const safeRad = rad
          
          await this.botRobotAttributeDao.create(
            {
              robot_id: safeNewRobotData.id,
              attribute_name: safeRad.attribute_name,
              attribute_value: safeRad.attribute_value
            },
            {
              transaction: t
            }
          )
        }
      }
      
      await t.commit()
      if (!data) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_NOT_FOUND)
      }
      const safeData = data
      return ResponseHelper.success(httpStatus.OK, "Success", safeData)
    } catch (e) {
      console.error(e)
      await t.rollback()
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_SET_ITEM_FAILED)
    }
  }

  updateRobotAttribute = async (req: Request): Promise<IServiceResponse> => {
    const { id } = req.body

    const body = req.body
    delete body.id
    
    const t = await DatabaseUtil.transaction()

    try {
      for (let [key, value] of Object.entries(body)) {
        await this.botRobotAttributeDao.update({
          'attribute_value': value
        }, {
          where: { 
            'robot_id': id,
            'attribute_name': key
           },
          transaction: t
        })
      }
      
      await t.commit()
      
      return ResponseHelper.success(httpStatus.OK, "Success", {})

    } catch (e) {
      console.error(e)
      await t.rollback()
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_SET_ITEM_FAILED)
    }
  }

  setItem = async (req: Request): Promise<IServiceResponse> => {
    try {
      if (!req.botUserInfo) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_NOT_FOUND)
      }

      const { robot_id, item_id, position, type, remaining } = req.body

      let msg = ""

      const t = await DatabaseUtil.transaction()

      try {
        let itemData = await this.botRobotItemDao.findOne({
          where: {
            robot_id,
            position,
            type
          },
          transaction: t
        })

        if (itemData) {
          const safeItemData = itemData.toJSON()

          // Destroy old item
          await this.botRobotItemDao.destroy({
            where: {
              id: safeItemData.id
            },
            transaction: t
          })

          await this.botItemDao.update(
            {
              equipped_quantity: literal("equipped_quantity - 1")
            },
            { where: { id: safeItemData.item_id }, transaction: t }
          )

          msg = SERVER_MSG.BOT_ROBOT_SET_ITEM_REMOVED_SUCCESS

          // Replace with new item
          if (item_id !== safeItemData.item_id && Number(remaining) > 0) {
            await this.botRobotItemDao.create(
              {
                robot_id,
                item_id,
                position,
                type
              },
              { transaction: t }
            )

            await this.botItemDao.update(
              {
                equipped_quantity: literal("equipped_quantity + 1")
              },
              { where: { id: item_id }, transaction: t }
            )

            msg = SERVER_MSG.BOT_ROBOT_SET_ITEM_REPLACED_SUCCESS
          }
        } else {
          // Put new item if remaining
          if (Number(remaining) > 0) {
            itemData = await this.botRobotItemDao.create(
              {
                robot_id,
                item_id,
                position,
                type
              },
              { transaction: t }
            )

            await this.botItemDao.update(
              {
                equipped_quantity: literal("equipped_quantity + 1")
              },
              { where: { id: item_id }, transaction: t }
            )

            msg = SERVER_MSG.BOT_ROBOT_SET_ITEM_PUT_SUCCESS
          }
        }

        const newRobots = await this.botRobotDao.findAll({
          where: { user_id: req.botUserInfo.id },
          include: [
            {
              model: BotRobotAttribute
            },
            {
              model: BotRobotItem
            }
          ],
          transaction: t
        })

        const newItems = await this.botItemDao.findAll({
          where: { user_id: req.botUserInfo.id },
          include: [
            {
              model: BotItemAttribute
            }
          ],
          transaction: t
        })

        await t.commit()
        return ResponseHelper.success(httpStatus.OK, msg, {
          robotsData: newRobots,
          itemsData: newItems
        })
      } catch (ee) {
        console.error(ee)
        await t.rollback()
        LoggerUtil.error(ee)
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_SET_ITEM_FAILED)
      }
    } catch (e) {
      console.error(e)
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }

  levelUp = async (req: Request): Promise<IServiceResponse> => {
    try {
      if (!req.botUserInfo) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_NOT_FOUND)
      }

      const t = await DatabaseUtil.transaction()

      const userRobot = await this.botRobotDao.findOne({
        where: { user_id: req.botUserInfo.id },
        include: [
          {
            model: BotRobotAttribute
          },
          {
            model: BotRobotItem
          }
        ],
        transaction: t
      })

      if (userRobot) {
        const safeUserRobotData = userRobot.toJSON()
        // check if user score is over than score of robot level
        if (Number(req.botUserInfo.score) >= Number(safeUserRobotData.score)) {
          // Getting next level robot
          const levelUpRobot = await this.botRobotDao.findOne({
            where: { owner_type: 'platform', level: Number(safeUserRobotData.level) + 1 },
            include: [
              {
                model: BotRobotAttribute
              },
              {
                model: BotRobotItem
              }
            ],
            transaction: t
          })

          if (levelUpRobot) {
            const safeLevelUpRobot = levelUpRobot.toJSON()
  
            // Updating data of current user robot
            const newUserRobot = await this.botRobotDao.update(
              {
                image: safeLevelUpRobot.image,
                name: safeLevelUpRobot.name,
                score: safeLevelUpRobot.score,
                level: safeLevelUpRobot.level,
                price: safeLevelUpRobot.price
              },
              {
                where: { user_id: req.botUserInfo.id },
                transaction: t
              }
            )
  
            // Updating attributes of current user robot
            const levelUpRobotAttributs = await this.botRobotAttributeDao.findAll({
              where: { robot_id: safeLevelUpRobot.id }
            })
  
            for (let rad of levelUpRobotAttributs) {
              const safeRad = rad.toJSON()
              await this.botRobotAttributeDao.update(
                {
                  attribute_value: safeRad.attribute_value
                },
                {
                  where: { robot_id: safeUserRobotData.id, attribute_name: safeRad.attribute_name },
                  transaction: t
                }
              )
            }
  
            await t.commit()
            return ResponseHelper.success(httpStatus.OK, 'Level up successfully', {
              userRobot: newUserRobot,
            })
          }

          return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_NOT_FOUND)
          
        } else {
          return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
        }        
      } else {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_ROBOT_NOT_FOUND)
      }

    } catch (e) {
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }

  getItem = async (req: Request): Promise<IServiceResponse> => {
    const { id } = req.params
    const t = await DatabaseUtil.transaction()
    try {
      const data = await this.botItemDao.findOne({
        where: { id: id },
        transaction: t
      })
      
      await t.commit()
      if (!data) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.NOT_FOUND)
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
}
