import { Request, Response } from "express"
import httpStatus from "http-status"

import { IServiceResponse } from "@/types/service"
import { LoggerUtil } from "@/utils"
import { AdminWeaponsService } from "@/services"

export default class AdminWeaponsController {
  private adminWeaponsService: AdminWeaponsService

  constructor() {
    this.adminWeaponsService = new AdminWeaponsService()
  }

  getWeapons = async (req: Request, res: Response) => {
    try {
      console.log(req)
      const resp: IServiceResponse = await this.adminWeaponsService.getWeapons(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }

  getById = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.adminWeaponsService.getById(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }

  updateWeapon = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.adminWeaponsService.updateWeapon(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }
}
