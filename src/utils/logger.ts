import { createLogger, format, transports } from 'winston'
import dayjs from 'dayjs'

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.label({ label: 'server' }),
    format.timestamp(),
    format.json(),
    format.printf(
      (info) =>
        `${dayjs(info?.timestamp as string | number | Date | null | undefined).format('YYYY-MM-DD HH:mm:ss')} [${info.label
        }] ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new transports.Console({
      handleExceptions: true,
      format: format.combine(
        format.colorize(),
        format.printf(
          (info) =>
            `${dayjs(info.timestamp as string | number | Date | null | undefined).format('YYYY-MM-DD HH:mm:ss')} [${info.label
            }] ${info.level}: ${info.message}`
        )
      )
    })
  ],
  defaultMeta: { service: 'user-service' }
})

export default logger
