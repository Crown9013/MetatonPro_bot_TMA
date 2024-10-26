import { Router } from "express"

import BotRobotController from "@/controllers/bot.robot.controller"

const router: Router = Router()

const controller = new BotRobotController()

router.post("/set-item", controller.setItem)

router.post('/level-up', controller.levelUp)

router.post("/weapons/:id", controller.getWeaponById)

export default router
