import { Request, Response } from "express"
import httpStatus from "http-status"

import { IServiceResponse } from "@/types/service"
import { LoggerUtil } from "@/utils"
import BotTaskService from "@/services/bot.task.service"

export default class AdminTaskController {
  private botTaskService: BotTaskService

  constructor() {
    this.botTaskService = new BotTaskService()
  }

  getTasks = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.botTaskService.getTasks(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }

  getTaskById = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.botTaskService.getTaskById(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }

  updateTask = async (req: Request, res: Response) => {
    try {
      const resp: IServiceResponse = await this.botTaskService.updateTask(req)
      const { status, message, data } = resp.response
      res.status(resp.statusCode).send({ status, message, data })
    } catch (e) {
      LoggerUtil.error(e)
      res.status(httpStatus.BAD_GATEWAY).send(e)
    }
  }
}
