import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Calendar, CheckCircle, Clock, TrendingUp, Users, FileText, AlertCircle } from 'lucide-react'
import { blink } from '../../blink/client'
import { ContentTask, Project } from '../../types'
import { TaskCard } from '../cards/TaskCard'

export function Dashboard() {
  const [tasks, setTasks] = useState<ContentTask[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      
      const tasksData = await blink.db.contentTasks.list({
        where: { createdBy: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 10
      })
      
      const projectsData = await blink.db.projects.list({
        where: { createdBy: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 5
      })
      
      setTasks(tasksData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await blink.db.contentTasks.update(taskId, { 
        status,
        updatedAt: new Date().toISOString()
      })
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ))
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await blink.db.contentTasks.delete(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Ошибка удаления задачи:', error)
    }
  }

  // Статистика
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'published').length
  const inProgressTasks = tasks.filter(task => ['draft', 'in_review', 'approved'].includes(task.status)).length
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'published'
  ).length

  const activeProjects = projects.filter(project => project.status === 'active').length
  const completedProjects = projects.filter(project => project.status === 'completed').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка дашборда...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground">Обзор вашей активности и прогресса</p>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего задач</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {inProgressTasks} в работе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% от общего числа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные проекты</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {completedProjects} завершено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просрочено</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Требует внимания
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Недавние задачи */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Недавние задачи</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Пока нет задач</p>
                <p className="text-sm text-muted-foreground">Создайте первую задачу в календаре</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Прогресс проектов */}
        <Card>
          <CardHeader>
            <CardTitle>Прогресс проектов</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">{project.title}</h4>
                      <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status === 'active' ? 'Активный' : 
                         project.status === 'completed' ? 'Завершен' :
                         project.status === 'paused' ? 'Приостановлен' : 'Отменен'}
                      </Badge>
                      <span>{project.priority === 'high' ? '🔴' : project.priority === 'medium' ? '🟡' : '🟢'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Пока нет проектов</p>
                <p className="text-sm text-muted-foreground">Создайте первый проект</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}