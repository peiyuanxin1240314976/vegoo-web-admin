import { onMounted, ref } from 'vue'

export interface IaaThemeColors {
  primary: string
  success: string
  warning: string
  danger: string
  textPrimary: string
  textSecondary: string
  border: string
  box: string
  bg: string
}

function readVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

export function useIaaTheme() {
  const colors = ref<IaaThemeColors>({
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F97316',
    danger: '#EF4444',
    textPrimary: '#F4F4F5',
    textSecondary: '#A1A1AA',
    border: '#27272A',
    box: '#18181B',
    bg: '#0A0A0A'
  })

  onMounted(() => {
    colors.value = {
      primary: readVar('--art-primary', colors.value.primary),
      success: readVar('--art-success', colors.value.success),
      warning: readVar('--art-warning', colors.value.warning),
      danger: readVar('--art-danger', colors.value.danger),
      textPrimary: readVar('--text-primary', colors.value.textPrimary),
      textSecondary: readVar('--text-secondary', colors.value.textSecondary),
      border: readVar('--default-border', colors.value.border),
      box: readVar('--default-box-color', colors.value.box),
      bg: readVar('--default-bg-color', colors.value.bg)
    }
  })

  return { colors }
}
