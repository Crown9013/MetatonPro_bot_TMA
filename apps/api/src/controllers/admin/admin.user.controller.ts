import { Request, Response } from "express"
import httpStatus from "http-status"

import { IServiceResponse } from "@/types/service"
import { LoggerUtil } from "@/utils"
import AdminUserService from "@/services/admin/admin.user.service"

export default class AdminUserController {
  private adminUserService: AdminUserService

  constructor() {
    this.adminUserService = new AdminUserService()
  }

  getUsers = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.adminUserService.getUsers(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }
}
