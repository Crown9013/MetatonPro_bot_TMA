import { Request } from "express"
import httpStatus from "http-status"

import { BotUserDao } from "@/dao"
import { ResponseHelper } from "@/helpers"
import { IServiceResponse } from "@/types/service"
import { LoggerUtil } from "@/utils"

import { SERVER_MSG } from "@repo/i18n"

export default class BotLeaderboardService {
  private botUserDao: BotUserDao

  constructor() {
    this.botUserDao = new BotUserDao()
  }

  getLeaders = async (req: Request): Promise<IServiceResponse> => {
    try {
      if (!req.botUserInfo) {
        return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.BOT_USER_NOT_FOUND)
      }

      let data = await this.botUserDao.getRankList()

      return ResponseHelper.success(httpStatus.OK, SERVER_MSG.BOT_LEADERS_FETCH_SUCCESS, data)
    } catch (e) {
      LoggerUtil.error(e)
      return ResponseHelper.error(httpStatus.BAD_REQUEST, SERVER_MSG.SOMETHING_WENT_WRONG)
    }
  }
}
