import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Separator } from '../ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { User, Bell, Shield, Palette, Globe, Save } from 'lucide-react'

export function Settings() {
  const [profile, setProfile] = useState({
    name: 'Анна Иванова',
    email: 'anna@example.com',
    role: 'owner',
    timezone: 'Europe/Moscow'
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    projectUpdates: true,
    teamActivity: false,
    weeklyReports: true
  })

  const [preferences, setPreferences] = useState({
    language: 'ru',
    theme: 'light',
    dateFormat: 'dd.mm.yyyy',
    startOfWeek: 'monday'
  })

  const handleSaveProfile = () => {
    console.log('Сохранение профиля:', profile)
    // Здесь будет логика сохранения
  }

  const handleSaveNotifications = () => {
    console.log('Сохранение уведомлений:', notifications)
    // Здесь будет логика сохранения
  }

  const handleSavePreferences = () => {
    console.log('Сохранение предпочтений:', preferences)
    // Здесь будет логика сохранения
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">Управляйте своим профилем и предпочтениями</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Предпочтения
          </TabsTrigger>
        </TabsList>

        {/* Профиль */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Информация профиля</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl font-semibold">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline">Изменить фото</Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG или GIF. Максимум 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Полное имя</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Роль</Label>
                  <Input
                    id="role"
                    value="Владелец"
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <Input
                    id="timezone"
                    value={profile.timezone}
                    onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="gap-2">
                  <Save className="h-4 w-4" />
                  Сохранить изменения
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Уведомления */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Получать уведомления на электронную почту
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Получать уведомления в браузере
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="task-reminders">Напоминания о задачах</Label>
                    <p className="text-sm text-muted-foreground">
                      Уведомления о приближающихся дедлайнах
                    </p>
                  </div>
                  <Switch
                    id="task-reminders"
                    checked={notifications.taskReminders}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, taskReminders: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="project-updates">Обновления проектов</Label>
                    <p className="text-sm text-muted-foreground">
                      Уведомления об изменениях в проектах
                    </p>
                  </div>
                  <Switch
                    id="project-updates"
                    checked={notifications.projectUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, projectUpdates: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="team-activity">Активность команды</Label>
                    <p className="text-sm text-muted-foreground">
                      Уведомления о действиях участников команды
                    </p>
                  </div>
                  <Switch
                    id="team-activity"
                    checked={notifications.teamActivity}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, teamActivity: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Еженедельные отчеты</Label>
                    <p className="text-sm text-muted-foreground">
                      Сводка активности за неделю
                    </p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="gap-2">
                  <Save className="h-4 w-4" />
                  Сохранить настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Безопасность */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Изменить пароль</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Текущий пароль</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Изменить пароль</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Двухфакторная аутентификация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA отключена</p>
                    <p className="text-sm text-muted-foreground">
                      Добавьте дополнительный уровень безопасности
                    </p>
                  </div>
                  <Button variant="outline">Включить 2FA</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Активные сессии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Текущая сессия</p>
                      <p className="text-sm text-muted-foreground">
                        Chrome на Windows • Москва, Россия
                      </p>
                    </div>
                    <span className="text-sm text-green-600">Активна</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Завершить все остальные сессии
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Предпочтения */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Предпочтения интерфейса</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Язык</Label>
                  <Input
                    id="language"
                    value="Русский"
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Тема</Label>
                  <Input
                    id="theme"
                    value="Светлая"
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Формат даты</Label>
                  <Input
                    id="date-format"
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-of-week">Начало недели</Label>
                  <Input
                    id="start-of-week"
                    value="Понедельник"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} className="gap-2">
                  <Save className="h-4 w-4" />
                  Сохранить предпочтения
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}