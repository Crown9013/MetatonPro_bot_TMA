import cookieParser from "cookie-parser"
import cors from "cors"
import express, { type Express, Request, Response } from "express"
import helmet from "helmet"
import morgan from "morgan"
import passport from "passport"
import path from "path"
import fs from 'fs'

import { AppConfig } from "@/configs"
import routes from "@/routes"
import { PassportUtil } from "@/utils"

import { API_URL, SITE_TITLE } from "@repo/util/constant"

import multer, { FileFilterCallback } from 'multer'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

export const createServer = (): Express => {
  const app = express()

  const allowedOrigins = [AppConfig.web_url, AppConfig.admin_url, AppConfig.bot_url]

  passport.use(PassportUtil.cookieStrategy)

  // ------- Image Upload ---------
  const imageUploadPath = 'static/uploads'
  let uploadedImagePathName = ''

  const storage = multer.diskStorage({
    destination: (
      request: Request,
      file: Express.Multer.File,
      callback: DestinationCallback
    ) => {
      callback(null, imageUploadPath)
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: FileNameCallback
    ) => {
      uploadedImagePathName = `${file.fieldname}_${Date.now()}_${file.originalname}`
      cb(null, uploadedImagePathName)
    }
  })

  let imageUpload = multer({storage: storage});

  // -----------------------------

  app
    .disable("x-powered-by")
    .use(helmet())
    .use(morgan("dev"))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cookieParser())
    .use(passport.initialize())
    .use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true)

            if (allowedOrigins.indexOf(origin) === -1) {
              const msg =
              "The CORS policy for this site does not allow access from the specified Origin."
              return callback(new Error(msg), false)
            }

          return callback(null, true)
        },
        credentials: true
      })
    )
    .use((req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      next()
    })
    .use(routes)
    .use("/static", express.static(path.join(__dirname, "..", path.sep, "static")))
    .get("/test", (_: Request, res: Response) => {
      return res.json({
        success: true,
        msg: `${SITE_TITLE}: This is a test response.`,
        data: null
      })
    })
    .get("/healthcheck", (_: Request, res: Response) => {
      return res.json({
        success: true,
        msg: `${SITE_TITLE}: The health is good now.`,
        data: {
          uptime: process.uptime(),
          name: process.env.npm_package_name,
          version: process.env.npm_package_version
        }
      })
    })
    .post('/image-upload', imageUpload.single('file'), (req, res) => {
      console.log(`uploads/${uploadedImagePathName}`)
      res.status(200).json({url: `uploads/${uploadedImagePathName}`})
    })
    .post('/image-remove', (req, res) => {
      const { oldImage } = req.body
      if (oldImage) {
        const oldPath = path.join(__dirname, "..", 'static/uploads', oldImage);
        console.log('oldPath', oldPath)
        try {
          fs.unlink(oldPath, (err:any) => {
            if (err) {
              console.error(err)
              res.status(404).json()
            }
            res.status(200).json()
          })
        } catch (e) {
          console.error(e)
          res.status(404).json()
        }
      }
    })

  return app
}
