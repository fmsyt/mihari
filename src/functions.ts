import type { CPUState } from "./types"

// biome-ignore lint/suspicious/noExplicitAny: type guard
export function isCPUStateType(state: any): state is CPUState {
  const isObject = typeof state === "object"
  if (!isObject) {
    console.error("state is not an object")
    return false
  }

  const systemIsNumber = typeof state.system === "number"
  if (!systemIsNumber) {
    console.error("state.system is not a number")
    return false
  }

  const userIsNumber = typeof state.user === "number"
  if (!userIsNumber) {
    console.error("state.user is not a number")
    return false
  }

  const niceIsNumber = typeof state.nice === "number"
  if (!niceIsNumber) {
    console.error("state.nice is not a number")
    return false
  }

  const idleIsNumber = typeof state.idle === "number"
  if (!idleIsNumber) {
    console.error("state.idle is not a number")
    return false
  }

  const interruptIsNumber = typeof state.interrupt === "number"
  if (!interruptIsNumber) {
    console.error("state.interrupt is not a number")
    return false
  }

  return true
}

// biome-ignore lint/suspicious/noExplicitAny: type guard
export function isCPUStateArray(state: any): state is CPUState[] {
  const isArray = Array.isArray(state)
  if (!isArray) {
    console.error("state is not an array")
    return false
  }

  const isCPUState = state.every(isCPUStateType)
  if (!isCPUState) {
    console.error("state is not an array of CPUState")
    return false
  }

  return true
}
