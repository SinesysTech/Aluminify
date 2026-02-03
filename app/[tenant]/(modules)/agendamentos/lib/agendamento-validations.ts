/**
 * Agendamento Validation Utilities
 * Pure functions for validating scheduling logic
 */

import { addMinutes, isAfter, isBefore, differenceInMinutes } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

export interface TimeSlot {
  start: Date
  end: Date
}

export interface AvailabilityRule {
  dia_semana: number // 0-6 (Sunday-Saturday)
  hora_inicio: string // HH:MM
  hora_fim: string // HH:MM
  ativo: boolean
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Parse time string (HH:MM or HH:MM:SS) to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes from midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Check if a time slot overlaps with another
 */
export function checkOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return isBefore(slot1.start, slot2.end) && isAfter(slot1.end, slot2.start)
}

/**
 * Check if there are conflicts between a new slot and existing bookings
 */
export function checkConflicts(
  newSlot: TimeSlot,
  existingSlots: TimeSlot[]
): boolean {
  return existingSlots.some(slot => checkOverlap(newSlot, slot))
}

/**
 * Validate minimum advance time for scheduling
 */
export function validateMinimumAdvance(
  scheduledTime: Date,
  minAdvanceMinutes: number
): ValidationResult {
  const minAllowedTime = addMinutes(new Date(), minAdvanceMinutes)

  if (isBefore(scheduledTime, minAllowedTime)) {
    return {
      valid: false,
      error: `O agendamento deve ser feito com pelo menos ${minAdvanceMinutes} minutos de antecedencia.`
    }
  }

  return { valid: true }
}

/**
 * Check if a time slot is within availability rules for a specific day
 */
export function isWithinAvailability(
  slot: TimeSlot,
  rules: AvailabilityRule[],
  timezone: string
): boolean {
  const localStart = toZonedTime(slot.start, timezone)
  const dayOfWeek = localStart.getDay()
  const dayRules = rules.filter(r => r.dia_semana === dayOfWeek && r.ativo)

  if (dayRules.length === 0) {
    return false
  }

  const slotStartMinutes = localStart.getHours() * 60 + localStart.getMinutes()
  const localEnd = toZonedTime(slot.end, timezone)
  const slotEndMinutes = localEnd.getHours() * 60 + localEnd.getMinutes()

  return dayRules.some(rule => {
    const ruleStart = timeToMinutes(rule.hora_inicio)
    const ruleEnd = timeToMinutes(rule.hora_fim)
    return slotStartMinutes >= ruleStart && slotEndMinutes <= ruleEnd
  })
}

/**
 * Validate a time slot is within availability
 */
export function validateAvailability(
  slot: TimeSlot,
  rules: AvailabilityRule[],
  timezone: string
): ValidationResult {
  if (!isWithinAvailability(slot, rules, timezone)) {
    return {
      valid: false,
      error: 'O horario selecionado esta fora da disponibilidade do professor.'
    }
  }

  return { valid: true }
}

/**
 * Check if cancellation is allowed based on time before appointment
 */
export function canCancel(
  appointmentTime: Date,
  minHoursBeforeCancellation: number = 2
): boolean {
  const minCancellationTime = addMinutes(new Date(), minHoursBeforeCancellation * 60)
  return isAfter(appointmentTime, minCancellationTime)
}

/**
 * Validate cancellation is allowed
 */
export function validateCancellation(
  appointmentTime: Date,
  minHoursBeforeCancellation: number = 2
): ValidationResult {
  if (!canCancel(appointmentTime, minHoursBeforeCancellation)) {
    return {
      valid: false,
      error: `Cancelamentos devem ser feitos com pelo menos ${minHoursBeforeCancellation} horas de antecedencia.`
    }
  }

  return { valid: true }
}

/**
 * Get duration in minutes between two dates
 */
export function getDurationMinutes(start: Date, end: Date): number {
  return differenceInMinutes(end, start)
}

/**
 * Validate slot duration is within acceptable range
 */
export function validateDuration(
  slot: TimeSlot,
  minDurationMinutes: number = 15,
  maxDurationMinutes: number = 120
): ValidationResult {
  const duration = getDurationMinutes(slot.start, slot.end)

  if (duration < minDurationMinutes) {
    return {
      valid: false,
      error: `A duracao minima do agendamento e de ${minDurationMinutes} minutos.`
    }
  }

  if (duration > maxDurationMinutes) {
    return {
      valid: false,
      error: `A duracao maxima do agendamento e de ${maxDurationMinutes} minutos.`
    }
  }

  return { valid: true }
}

/**
 * Comprehensive validation for a new appointment
 */
export function validateAppointment(
  slot: TimeSlot,
  options: {
    rules: AvailabilityRule[]
    existingSlots: TimeSlot[]
    minAdvanceMinutes: number
    minDurationMinutes?: number
    maxDurationMinutes?: number
    timezone: string
  }
): ValidationResult {
  // Check minimum advance
  const advanceResult = validateMinimumAdvance(slot.start, options.minAdvanceMinutes)
  if (!advanceResult.valid) return advanceResult

  // Check duration
  const durationResult = validateDuration(
    slot,
    options.minDurationMinutes,
    options.maxDurationMinutes
  )
  if (!durationResult.valid) return durationResult

  // Check availability
  const availabilityResult = validateAvailability(slot, options.rules, options.timezone)
  if (!availabilityResult.valid) return availabilityResult

  // Check conflicts
  if (checkConflicts(slot, options.existingSlots)) {
    return {
      valid: false,
      error: 'Ja existe um agendamento neste horario.'
    }
  }

  return { valid: true }
}

/**
 * Generate available time slots for a specific date
 */
export function generateAvailableSlots(
  date: Date,
  rules: AvailabilityRule[],
  existingSlots: TimeSlot[],
  slotDurationMinutes: number = 30,
  minAdvanceMinutes: number = 60,
  timezone: string = "America/Sao_Paulo"
): Date[] {
  const localDate = toZonedTime(date, timezone)
  const dayOfWeek = localDate.getDay()
  const dayRules = rules.filter(r => r.dia_semana === dayOfWeek && r.ativo)

  if (dayRules.length === 0) {
    return []
  }

  const slots: Date[] = []
  const minAllowedTime = addMinutes(new Date(), minAdvanceMinutes)

  // Get date string in YYYY-MM-DD format for constructing local datetimes
  const year = localDate.getFullYear()
  const month = String(localDate.getMonth() + 1).padStart(2, '0')
  const day = String(localDate.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`

  for (const rule of dayRules) {
    const startMins = timeToMinutes(rule.hora_inicio)
    const endMins = timeToMinutes(rule.hora_fim)

    for (let time = startMins; time + slotDurationMinutes <= endMins; time += slotDurationMinutes) {
      const timeStr = minutesToTime(time)
      // Convert local time to proper UTC by specifying the timezone
      const slotStart = fromZonedTime(`${dateStr}T${timeStr}:00`, timezone)

      const slotEnd = addMinutes(slotStart, slotDurationMinutes)

      // Check if slot is in the future with minimum advance
      if (isBefore(slotStart, minAllowedTime)) {
        continue
      }

      // Check for conflicts
      const hasConflict = existingSlots.some(existing =>
        checkOverlap({ start: slotStart, end: slotEnd }, existing)
      )

      if (!hasConflict) {
        slots.push(slotStart)
      }
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime())
}
