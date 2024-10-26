import { Router } from "express"

import AdminWeaponsController from "@/controllers/admin/admin.weapons.controller"

const router: Router = Router()

const controller = new AdminWeaponsController()

router.post("/get", controller.getWeapons)
router.post("/getById", controller.getById)
router.post("/update", controller.updateWeapon)

export default router
