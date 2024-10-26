import { Router } from "express"

import AdminTaskController from "@/controllers/admin/admin.task.controller"

const router: Router = Router()

const controller = new AdminTaskController()

router.post("/get", controller.getTasks)
router.post("/getTaskById", controller.getTaskById)
router.post("/update", controller.updateTask)

export default router
