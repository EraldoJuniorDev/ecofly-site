import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useTheme } from '../../lib/theme-provider'

const ThemeToggle = () => {
  console.log('ThemeToggle component rendered')
  
  const { setTheme, theme } = useTheme()

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor }
  ]

  const currentTheme = themes.find(t => t.value === theme)
  const CurrentIcon = currentTheme?.icon || Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <CurrentIcon className="h-5 w-5" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value as any)}
              className={`flex items-center gap-2 cursor-pointer text-black dark:text-white hover:bg-green-500 hover:text-white ${
                theme === themeOption.value ? 'bg-green-700 text-white' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              {themeOption.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle