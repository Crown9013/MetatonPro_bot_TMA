import { Router } from "express"

import { bot_auth } from "@/middleware/bot.auth.middleware"

import AdminAuthRoutes from "./admin.auth.route"
import AdminUserRoutes from "./admin.user.route"
import AdminRobotRoutes from "./admin.robots.route"
import AdminTaskRoutes from "./admin.task.route"
import AdminWeaponRoutes from "./admin.weapons.route"

import BotAuthRoutes from "./bot.auth.route"
import BotLeaderboardRoutes from "./bot.leaderboard.route"
import BotAllianceRoutes from "./bot.alliance.route"
import BotRobotRoutes from "./bot.robot.route"
import BotShopRoutes from "./bot.shop.route"
import BotReferRoutes from "@/routes/bot.refer.route"
import BotTaskRoutes from '@/routes/bot.task.route'

const router: Router = Router()

router.use("/admin/auth", AdminAuthRoutes)
router.use("/admin/user", AdminUserRoutes)
router.use("/admin/robots", AdminRobotRoutes)
router.use("/admin/task", AdminTaskRoutes)
router.use("/admin/weapons", AdminWeaponRoutes)

router.use("/bot/auth", bot_auth(), BotAuthRoutes)
router.use("/bot/leaderboard", bot_auth(), BotLeaderboardRoutes)
router.use("/bot/alliance", bot_auth(), BotAllianceRoutes)
router.use("/bot/robot", bot_auth(), BotRobotRoutes)
router.use("/bot/shop", bot_auth(), BotShopRoutes)
router.use("/bot/refer", bot_auth(), BotReferRoutes)
router.use("/bot/tasks", bot_auth(), BotTaskRoutes)

export default router
