import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '../../lib/utils'
import { blink } from '../../blink/client'
import { Project } from '../../types'

interface CreateProjectModalProps {
  onProjectCreated: (project: Project) => void
}

export function CreateProjectModal({ onProjectCreated }: CreateProjectModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    try {
      const user = await blink.auth.me()
      
      const projectData = {
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        description: formData.description,
        status: 'active',
        priority: formData.priority,
        startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : null,
        endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : null,
        progress: 0,
        ownerId: user.id,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await blink.db.projects.create(projectData)
      
      // Добавляем создателя как владельца проекта
      await blink.db.projectMembers.create({
        id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: projectData.id,
        userId: user.id,
        role: 'owner',
        permissions: JSON.stringify(['all']),
        joinedAt: new Date().toISOString()
      })
      
      onProjectCreated(projectData as Project)
      
      // Сброс формы
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        startDate: undefined,
        endDate: undefined
      })
      
      setOpen(false)
    } catch (error) {
      console.error('Ошибка создания проекта:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Создать проект
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создать новый проект</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Название проекта *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Введите название проекта"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Опишите цели и задачи проекта"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Приоритет</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="urgent">Срочный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "dd MMMM yyyy", { locale: ru }) : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "dd MMMM yyyy", { locale: ru }) : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? 'Создание...' : 'Создать проект'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}