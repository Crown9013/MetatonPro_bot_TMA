import { Request } from "express"
import httpStatus from "http-status"
import { literal } from "sequelize"

import { BotItemDao, BotRobotDao, BotRobotItemDao, BotRobotAttributeDao, BotItemAttributeDao } from "@/dao"
import { ResponseHelper } from "@/helpers"
import { BotItemAttribute, BotRobot, BotRobotAttribute, BotRobotItem } from "@/models"
import { IServiceResponse } from "@/types/service"
import { DatabaseUtil, LoggerUtil } from "@/utils"

import { SERVER_MSG } from "@repo/i18n"

export const WeaponDefaultAttributesData = [
  {attribute_name: 'attack', attribute_value: 0},
  {attribute_name: 'attack-speed', attribute_value: 0},
  {attribute_name: 'health', attribute_value: 0},
  {attribute_name: 'energy', attribute_value: 0},
]

export default class AdminWeaponsService {
  private botItemDao: BotItemDao
  private botItemAttributeDao: BotItemAttributeDao

  constructor() {
    this.botItemDao = new BotItemDao()
    this.botItemAttributeDao = new BotItemAttributeDao()
  }

  getWeapons = async (req: Request): Promise<IServiceResponse> => {
    const { page, pageSize } = req.body
    
    const offset = page * pageSize
    const limit = pageSize

    const count = await this.botItemDao.count({
      where: { owner_type: ['default', 'platform'] },
    })

    const data = await this.botItemDao.findAll({
      where: { owner_type: ['default', 'platform'] },
      offset: offset,
      limit: limit,
      order: ['owner_type', 'id']
    })

    if (!data) {
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.NOT_FOUND)
    }
    const safeData = data
    return ResponseHelper.success(httpStatus.OK, "Success", {
      weapons: safeData,
      total: count
    })
  }

  getById = async (req: Request): Promise<IServiceResponse> => {
    const { weapon_id } = req.body
    const t = await DatabaseUtil.transaction()
    try {
      const data = await this.botItemDao.findOne({
        where: { id: weapon_id },
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
  
  updateWeapon = async (req: Request): Promise<IServiceResponse> => {
    console.log("*********************")
    const { id, owner_type, image, name, price, type, quantity } = req.body
    console.log(id, price)
    const t = await DatabaseUtil.transaction()
    try {
      let data;

      if (Number(id) > -1) {
        data = await this.botItemDao.update({
          owner_type, image, name, price, type, quantity
        }, {
          where: { id },
          transaction: t
        })
      } else {
        data = await this.botItemDao.create({
          owner_type, image, name, price, type, quantity
        }, {
          transaction: t
        })

        const safeNewWeaponData = data.toJSON()
      }
      
      await t.commit()
      if (!data) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.NOT_FOUND)
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

}
