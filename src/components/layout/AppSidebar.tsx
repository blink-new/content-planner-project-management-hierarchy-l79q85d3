import React from 'react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Separator } from '../ui/separator'
import { 
  LayoutDashboard, 
  Calendar, 
  FolderOpen, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react'
import { blink } from '../../blink/client'

interface AppSidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  user: any
}

export function AppSidebar({ currentPage, onPageChange, user }: AppSidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Дашборд',
      icon: LayoutDashboard,
      description: 'Обзор активности'
    },
    {
      id: 'calendar',
      label: 'Календарь',
      icon: Calendar,
      description: 'Планирование контента'
    },
    {
      id: 'projects',
      label: 'Проекты',
      icon: FolderOpen,
      description: 'Управление проектами'
    },
    {
      id: 'team',
      label: 'Команда',
      icon: Users,
      description: 'Участники и роли'
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: Settings,
      description: 'Профиль и предпочтения'
    }
  ]

  const handleLogout = () => {
    blink.auth.logout()
  }

  return (
    <div className="flex flex-col h-full bg-card border-r">
      {/* Заголовок */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CF</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">ContentFlow</h1>
            <p className="text-xs text-muted-foreground">Планировщик контента</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Навигация */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${
                  isActive ? '' : 'hover:bg-muted/50'
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </nav>

      <Separator />

      {/* Профиль пользователя */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="font-semibold">
              {user?.displayName ? 
                user.displayName.split(' ').map((n: string) => n[0]).join('') :
                user?.email?.[0]?.toUpperCase() || 'U'
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {user?.displayName || user?.email || 'Пользователь'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  )
}