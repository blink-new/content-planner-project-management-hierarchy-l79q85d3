import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Clock, Users, MapPin, Video } from 'lucide-react';
import { blink } from '../../blink/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: () => void;
  defaultDate?: Date | null;
}

export function CreateEventModal({ open, onOpenChange, onEventCreated, defaultDate }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: defaultDate || new Date(),
    startTime: '09:00',
    endTime: '10:00',
    isAllDay: false,
    calendarType: 'team' as 'team' | 'personal' | 'shared',
    visibility: 'team' as 'team' | 'private' | 'public',
    location: '',
    meetingUrl: '',
    attendees: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (defaultDate) {
      setFormData(prev => ({ ...prev, dueDate: defaultDate }));
    }
  }, [defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await blink.auth.me();
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate.toISOString().split('T')[0],
        startTime: formData.isAllDay ? null : formData.startTime,
        endTime: formData.isAllDay ? null : formData.endTime,
        isAllDay: formData.isAllDay,
        calendarType: formData.calendarType,
        visibility: formData.visibility,
        location: formData.location || null,
        meetingUrl: formData.meetingUrl || null,
        attendees: formData.attendees || null,
        priority: formData.priority,
        status: 'todo',
        contentType: 'event',
        taskType: 'event',
        isEvent: true,
        createdBy: user.id,
        assignedTo: user.id
      };

      await blink.db.tasks.create(eventData);
      
      // Сброс формы
      setFormData({
        title: '',
        description: '',
        dueDate: new Date(),
        startTime: '09:00',
        endTime: '10:00',
        isAllDay: false,
        calendarType: 'team',
        visibility: 'team',
        location: '',
        meetingUrl: '',
        attendees: '',
        priority: 'medium'
      });
      
      onEventCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создать событие</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Название события */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Название события *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Введите название события..."
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
                placeholder="Описание события..."
                rows={3}
              />
            </div>

            {/* Дата */}
            <div>
              <Label>Дата события *</Label>
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

            {/* Весь день */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAllDay"
                checked={formData.isAllDay}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isAllDay: !!checked })
                }
              />
              <Label htmlFor="isAllDay">Весь день</Label>
            </div>

            {/* Время начала */}
            {!formData.isAllDay && (
              <div>
                <Label htmlFor="startTime">Время начала</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Время окончания */}
            {!formData.isAllDay && (
              <div>
                <Label htmlFor="endTime">Время окончания</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

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
                      <Users className="h-4 w-4 text-green-600" />
                      Личный
                    </div>
                  </SelectItem>
                  <SelectItem value="shared">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
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
                  <SelectItem value="private">Приватное</SelectItem>
                  <SelectItem value="public">Публичное</SelectItem>
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

            {/* Место проведения */}
            <div>
              <Label htmlFor="location">Место проведения</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Адрес или место..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Ссылка на встречу */}
            <div>
              <Label htmlFor="meetingUrl">Ссылка на встречу</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="meetingUrl"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Участники */}
            <div className="md:col-span-2">
              <Label htmlFor="attendees">Участники</Label>
              <Input
                id="attendees"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                placeholder="email1@example.com, email2@example.com..."
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
              {loading ? 'Создание...' : 'Создать событие'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}