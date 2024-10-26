import { BotUserDao } from "@/dao";
import { ResponseHelper } from "@/helpers";
import { BotAlliance, BotAllianceMember, BotItem, BotItemAttribute, BotReferral, BotRobot, BotRobotAttribute, BotRobotItem } from "@/models";
import { SERVER_MSG } from "@repo/i18n";
import httpStatus from "http-status";

export default class AdminUserService {
  private botUserDao: BotUserDao

  constructor() {
    this.botUserDao = new BotUserDao()
  }

  getUsers = async (req: Request) => {
    const { page, pageSize } = req.body
    
    const offset = page * pageSize
    const limit = pageSize

    const count = await this.botUserDao.count({})
    
    const data = await this.botUserDao.findAll({
      offset: offset,
      limit: limit,
      include: [
        {
          model: BotAllianceMember,
          include: [
            {
              model: BotAlliance
            }
          ]
        },
        {
          model: BotRobot,
          include: [
            {
              model: BotRobotAttribute
            },
            {
              model: BotRobotItem
            }
          ]
        },
        {
          model: BotItem,
          include: [
            {
              model: BotItemAttribute
            }
          ]
        },
        {
          model: BotReferral
        }
      ]
    })

    if (!data) {
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_USER_NOT_FOUND)
    }

    const safeData = data
    return ResponseHelper.success(httpStatus.OK, SERVER_MSG.BOT_USER_AUTHENTICATE_SUCCESS, {
      user: safeData,
      total: count
    })
  }
}