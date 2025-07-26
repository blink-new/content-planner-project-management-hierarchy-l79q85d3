import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Users, User, Share2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { CreateEventModal } from '../modals/CreateEventModal';
import { TaskCard } from '../cards/TaskCard';
import { blink } from '../../blink/client';
import { Task, CalendarFilters } from '../../types';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCalendarType, setActiveCalendarType] = useState<'all' | 'team' | 'personal' | 'shared'>('all');
  const [filters, setFilters] = useState<CalendarFilters>({
    calendarType: 'all',
    showCompleted: true,
    status: [],
    priority: [],
    assignedTo: [],
    projects: [],
    contentTypes: []
  });
  const [visibleCalendars, setVisibleCalendars] = useState({
    team: true,
    personal: true,
    shared: true
  });

  const loadTasks = useCallback(async () => {
    try {
      const user = await blink.auth.me();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const tasksData = await blink.db.tasks.list({
        where: {
          AND: [
            {
              OR: [
                { assignedTo: user.id },
                { createdBy: user.id },
                { visibility: 'team' },
                { visibility: 'public' }
              ]
            },
            {
              dueDate: {
                gte: startOfMonth.toISOString().split('T')[0],
                lte: endOfMonth.toISOString().split('T')[0]
              }
            }
          ]
        },
        orderBy: { dueDate: 'asc' }
      });
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  const applyFilters = useCallback(() => {
    let filtered = tasks;

    // Фильтр по типу календаря
    if (activeCalendarType !== 'all') {
      filtered = filtered.filter(task => task.calendarType === activeCalendarType);
    }

    // Фильтр по видимости календарей
    filtered = filtered.filter(task => {
      if (task.calendarType === 'team' && !visibleCalendars.team) return false;
      if (task.calendarType === 'personal' && !visibleCalendars.personal) return false;
      if (task.calendarType === 'shared' && !visibleCalendars.shared) return false;
      return true;
    });

    // Фильтр по статусу
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status!.includes(task.status));
    }

    // Фильтр по приоритету
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority!.includes(task.priority));
    }

    // Показывать ли завершенные задачи
    if (!filters.showCompleted) {
      filtered = filtered.filter(task => task.status !== 'completed');
    }

    setFilteredTasks(filtered);
  }, [tasks, filters, activeCalendarType, visibleCalendars]);

  useEffect(() => {
    loadTasks();
  }, [currentDate, loadTasks]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters, activeCalendarType, visibleCalendars, applyFilters]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Добавляем пустые дни в начале месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return filteredTasks.filter(task => task.dueDate === dateStr);
  };

  const getSelectedDateTasks = () => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getCalendarTypeColor = (calendarType: Task['calendarType']) => {
    switch (calendarType) {
      case 'team': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'personal': return 'bg-green-100 text-green-800 border-green-200';
      case 'shared': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCalendarTypeIcon = (calendarType: Task['calendarType']) => {
    switch (calendarType) {
      case 'team': return <Users className="h-3 w-3" />;
      case 'personal': return <User className="h-3 w-3" />;
      case 'shared': return <Share2 className="h-3 w-3" />;
      default: return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const toggleCalendarVisibility = (type: keyof typeof visibleCalendars) => {
    setVisibleCalendars(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Календарь</h1>
          <p className="text-gray-600 mt-1">Планирование контента и управление задачами</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Создать
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowCreateTaskModal(true)}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Задача
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCreateEventModal(true)}>
                <Users className="h-4 w-4 mr-2" />
                Событие
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Controls and Filters */}
        <div className="lg:col-span-1 space-y-4">
          {/* Calendar Type Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Тип календаря</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Tabs value={activeCalendarType} onValueChange={(value) => setActiveCalendarType(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all" className="text-xs">Все</TabsTrigger>
                  <TabsTrigger value="team" className="text-xs">Команда</TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  <TabsTrigger value="personal" className="text-xs">Личный</TabsTrigger>
                  <TabsTrigger value="shared" className="text-xs">Общий</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Calendar Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Видимость календарей</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="team-calendar"
                  checked={visibleCalendars.team}
                  onCheckedChange={() => toggleCalendarVisibility('team')}
                />
                <label htmlFor="team-calendar" className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Командный календарь
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personal-calendar"
                  checked={visibleCalendars.personal}
                  onCheckedChange={() => toggleCalendarVisibility('personal')}
                />
                <label htmlFor="personal-calendar" className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  Личный календарь
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shared-calendar"
                  checked={visibleCalendars.shared}
                  onCheckedChange={() => toggleCalendarVisibility('shared')}
                />
                <label htmlFor="shared-calendar" className="text-sm flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-purple-600" />
                  Общий календарь
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Фильтры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-completed"
                  checked={filters.showCompleted}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, showCompleted: !!checked }))
                  }
                />
                <label htmlFor="show-completed" className="text-sm">
                  Показывать завершенные
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Tasks */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {selectedDate.toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getSelectedDateTasks().length === 0 ? (
                  <p className="text-sm text-gray-500">Нет задач на этот день</p>
                ) : (
                  getSelectedDateTasks().map((task) => (
                    <div key={task.id} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {getCalendarTypeIcon(task.calendarType)}
                        <span className="text-xs font-medium">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Сегодня
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, index) => {
                  if (!day) {
                    return <div key={index} className="h-24 p-1"></div>;
                  }

                  const dayTasks = getTasksForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate?.toDateString() === day.toDateString();

                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 p-1 border rounded-lg cursor-pointer transition-colors ${
                        isToday ? 'bg-primary/10 border-primary' : 'border-gray-200 hover:bg-gray-50'
                      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-primary' : 'text-gray-900'
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {dayTasks.slice(0, 2).map((task) => (
                            <div
                              key={task.id}
                              className={`text-xs p-1 rounded border ${getCalendarTypeColor(task.calendarType)} truncate`}
                              title={task.title}
                            >
                              <div className="flex items-center gap-1">
                                {getCalendarTypeIcon(task.calendarType)}
                                <span className="truncate">{task.title}</span>
                              </div>
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayTasks.length - 2} еще
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal 
        open={showCreateTaskModal} 
        onOpenChange={setShowCreateTaskModal}
        onTaskCreated={loadTasks}
        defaultCalendarType={activeCalendarType === 'all' ? 'team' : activeCalendarType}
        defaultDate={selectedDate}
      />
      
      <CreateEventModal 
        open={showCreateEventModal} 
        onOpenChange={setShowCreateEventModal}
        onEventCreated={loadTasks}
        defaultDate={selectedDate}
      />
    </div>
  );
}