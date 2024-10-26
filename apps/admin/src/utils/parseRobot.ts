export function parseRobot(robot: Record<string, any>): Record<string, any> {
  let result: Record<string, any> = {}
  const { attributes, ...rest } = robot

  let newAttributes: Record<string, any> = {}
  for (const attr of attributes) {
    newAttributes = { ...newAttributes, [attr.attribute_name]: attr.attribute_value }
  }

  result = { ...rest, attributes: newAttributes }
  return result
}