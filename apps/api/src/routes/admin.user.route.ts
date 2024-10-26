import { Router } from "express"

import AdminUserController from "@/controllers/admin/admin.user.controller"

const router: Router = Router()

const controller = new AdminUserController()

router.post("/get", controller.getUsers)

export default router
