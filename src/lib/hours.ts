export interface DayHours {
  day: string
  open: string
  close: string
  closed: boolean
}

export type StoreStatus = 'open' | 'closed' | 'closing_soon' | 'none'

export interface StatusInfo {
  status: StoreStatus
  label: string
  color: string
  nextDay?: string
}

const DAYS_MAP: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
}

export function getStoreStatus(businessHoursStr?: string): StatusInfo {
  if (!businessHoursStr) return { status: 'none', label: 'Horário não informado', color: 'text-gray-400' }

  try {
    const hours: DayHours[] = JSON.parse(businessHoursStr)
    const now = new Date()
    const currentDayName = DAYS_MAP[now.getDay()]
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0')

    const todayHours = hours.find(h => h.day === currentDayName)

    if (!todayHours || todayHours.closed) {
      return { status: 'closed', label: 'Fechado hoje', color: 'text-red-500' }
    }

    const [openH, openM] = todayHours.open.split(':').map(Number)
    const [closeH, closeM] = todayHours.close.split(':').map(Number)
    const [nowH, nowM] = currentTimeStr.split(':').map(Number)

    const openTotal = openH * 60 + openM
    const closeTotal = closeH * 60 + closeM
    const nowTotal = nowH * 60 + nowM

    if (nowTotal < openTotal) {
      return { status: 'closed', label: `Abre às ${todayHours.open}`, color: 'text-orange-500' }
    }

    if (nowTotal >= openTotal && nowTotal < closeTotal) {
      const minutesToClose = closeTotal - nowTotal
      if (minutesToClose <= 30) {
        return { status: 'closing_soon', label: `Fecha em breve (${todayHours.close})`, color: 'text-amber-500' }
      }
      return { status: 'open', label: `Aberto até as ${todayHours.close}`, color: 'text-green-500' }
    }

    return { status: 'closed', label: 'Fechado agora', color: 'text-red-500' }
  } catch (e) {
    return { status: 'none', label: 'Horário não informado', color: 'text-gray-400' }
  }
}
