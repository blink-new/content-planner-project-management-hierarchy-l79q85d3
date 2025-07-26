import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Users, User, Share2 } from 'lucide-react';
import { blink } from '../../blink/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
  defaultCalendarType?: 'team' | 'personal' | 'shared';
  defaultDate?: Date | null;
}

export function CreateTaskModal({ 
  open, 
  onOpenChange, 
  onTaskCreated, 
  defaultCalendarType = 'team',
  defaultDate 
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'general' as 'general' | 'social_media' | 'blog' | 'video' | 'design' | 'meeting' | 'event',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: defaultDate || new Date(),
    calendarType: defaultCalendarType,
    visibility: 'team' as 'team' | 'private' | 'public',
    tags: '',
    estimatedHours: 0
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (defaultDate) {
      setFormData(prev => ({ ...prev, dueDate: defaultDate }));
    }
    if (defaultCalendarType) {
      setFormData(prev => ({ ...prev, calendarType: defaultCalendarType }));
    }
  }, [defaultDate, defaultCalendarType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await blink.auth.me();
      
      const taskData = {
        title: formData.title,
        description: formData.description,
        contentType: formData.contentType,
        priority: formData.priority,
        dueDate: formData.dueDate.toISOString().split('T')[0],
        calendarType: formData.calendarType,
        visibility: formData.visibility,
        tags: formData.tags || null,
        estimatedHours: formData.estimatedHours || 0,
        status: 'todo',
        taskType: 'task',
        isEvent: false,
        isAllDay: false,
        createdBy: user.id,
        assignedTo: user.id
      };

      await blink.db.tasks.create(taskData);
      
      // Сброс формы
      setFormData({
        title: '',
        description: '',
        contentType: 'general',
        priority: 'medium',
        dueDate: new Date(),
        calendarType: defaultCalendarType,
        visibility: 'team',
        tags: '',
        estimatedHours: 0
      });
      
      onTaskCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создать задачу</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Название задачи */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Название задачи *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Введите название задачи..."
                required
              />
            </div>

            {/* Описание */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание задачи..."
                rows={3}
              />
            </div>

            {/* Тип контента */}
            <div>
              <Label>Тип контента</Label>
              <Select 
                value={formData.contentType} 
                onValueChange={(value: any) => setFormData({ ...formData, contentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Общая задача</SelectItem>
                  <SelectItem value="social_media">Социальные сети</SelectItem>
                  <SelectItem value="blog">Блог</SelectItem>
                  <SelectItem value="video">Видео</SelectItem>
                  <SelectItem value="design">Дизайн</SelectItem>
                  <SelectItem value="meeting">Встреча</SelectItem>
                  <SelectItem value="event">Событие</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Приоритет */}
            <div>
              <Label>Приоритет</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
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

            {/* Дата выполнения */}
            <div>
              <Label>Дата выполнения *</Label>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, 'PPP', { locale: ru }) : 'Выберите дату'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, dueDate: date });
                        setShowDatePicker(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Оценка времени */}
            <div>
              <Label htmlFor="estimatedHours">Оценка времени (часы)</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Тип календаря */}
            <div>
              <Label>Тип календаря</Label>
              <Select 
                value={formData.calendarType} 
                onValueChange={(value: any) => setFormData({ ...formData, calendarType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Командный
                    </div>
                  </SelectItem>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      Личный
                    </div>
                  </SelectItem>
                  <SelectItem value="shared">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-purple-600" />
                      Общий
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Видимость */}
            <div>
              <Label>Видимость</Label>
              <Select 
                value={formData.visibility} 
                onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Команда</SelectItem>
                  <SelectItem value="private">Приватная</SelectItem>
                  <SelectItem value="public">Публичная</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Теги */}
            <div className="md:col-span-2">
              <Label htmlFor="tags">Теги</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Введите теги через запятую..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать задачу'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}