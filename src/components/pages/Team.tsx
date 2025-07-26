import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Button } from '../ui/button'
import { Users, Crown, Shield, UserCheck, Edit, User, Plus } from 'lucide-react'

export function Team() {
  // Моковые данные участников команды
  const teamMembers = [
    {
      id: '1',
      name: 'Анна Иванова',
      email: 'anna@example.com',
      role: 'owner',
      joinedAt: '2024-01-15',
      lastActive: '2024-01-20',
      tasksCount: 15,
      projectsCount: 3
    },
    {
      id: '2',
      name: 'Михаил Петров',
      email: 'mikhail@example.com',
      role: 'admin',
      joinedAt: '2024-01-18',
      lastActive: '2024-01-19',
      tasksCount: 12,
      projectsCount: 2
    },
    {
      id: '3',
      name: 'Елена Сидорова',
      email: 'elena@example.com',
      role: 'manager',
      joinedAt: '2024-01-20',
      lastActive: '2024-01-20',
      tasksCount: 8,
      projectsCount: 1
    },
    {
      id: '4',
      name: 'Дмитрий Козлов',
      email: 'dmitry@example.com',
      role: 'editor',
      joinedAt: '2024-01-22',
      lastActive: '2024-01-20',
      tasksCount: 6,
      projectsCount: 0
    }
  ]

  const roleIcons = {
    owner: Crown,
    admin: Shield,
    manager: UserCheck,
    editor: Edit,
    participant: User
  }

  const roleColors = {
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    manager: 'bg-green-100 text-green-800',
    editor: 'bg-yellow-100 text-yellow-800',
    participant: 'bg-gray-100 text-gray-800'
  }

  const roleLabels = {
    owner: 'Владелец',
    admin: 'Администратор',
    manager: 'Менеджер',
    editor: 'Редактор',
    participant: 'Участник'
  }

  const roleDescriptions = {
    owner: 'Полный доступ ко всем функциям системы',
    admin: 'Управление командой и проектами',
    manager: 'Создание и назначение задач',
    editor: 'Создание и редактирование контента',
    participant: 'Выполнение назначенных задач'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Команда</h1>
          <p className="text-muted-foreground">Управляйте участниками и их ролями</p>
        </div>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Пригласить участника
        </Button>
      </div>

      {/* Иерархия ролей */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Иерархия ролей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(roleLabels).map(([role, label]) => {
              const Icon = roleIcons[role as keyof typeof roleIcons]
              return (
                <div key={role} className="text-center p-4 border rounded-lg">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-sm mb-1">{label}</h3>
                  <p className="text-xs text-muted-foreground">
                    {roleDescriptions[role as keyof typeof roleDescriptions]}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Список участников */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const Icon = roleIcons[member.role as keyof typeof roleIcons]
          
          return (
            <Card key={member.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                    <Icon className="h-3 w-3 mr-1" />
                    {roleLabels[member.role as keyof typeof roleLabels]}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground">
                    Активен: {new Date(member.lastActive).toLocaleDateString('ru')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{member.tasksCount}</div>
                    <div className="text-xs text-muted-foreground">Задач</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{member.projectsCount}</div>
                    <div className="text-xs text-muted-foreground">Проектов</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  В команде с {new Date(member.joinedAt).toLocaleDateString('ru')}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Изменить роль
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Настройки
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Статистика команды */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Всего участников</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teamMembers.length}</div>
            <p className="text-sm text-muted-foreground">
              Активных: {teamMembers.filter(m => 
                new Date(m.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Общая нагрузка</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {teamMembers.reduce((sum, member) => sum + member.tasksCount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Активных задач</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Проекты в работе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {teamMembers.reduce((sum, member) => sum + member.projectsCount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Общее количество</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}