import { Router } from "express"

import AdminRobotsController from "@/controllers/admin/admin.robots.controller"

const router: Router = Router()

const controller = new AdminRobotsController()

router.post("/get", controller.getRobots)
router.post("/getRobotById", controller.getRobotById)
router.post("/update", controller.updateRobot)
router.post("/update_attribute", controller.updateRobotAttribute)

export default router
