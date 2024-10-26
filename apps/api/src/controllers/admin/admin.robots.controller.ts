import { Request, Response } from "express"
import httpStatus from "http-status"

import { IServiceResponse } from "@/types/service"
import { LoggerUtil } from "@/utils"
import { BotRobotService } from "@/services"

export default class AdminRobotsController {
  private botRobotService: BotRobotService

  constructor() {
    this.botRobotService = new BotRobotService()
  }

  getRobots = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.botRobotService.getRobots(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }

  getRobotById = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.botRobotService.getRobotById(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }

  updateRobot = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.botRobotService.updateRobot(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }

  updateRobotAttribute = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.botRobotService.updateRobotAttribute(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }
}
