import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Calendar, Users, Clock, FileText, MessageSquare, BarChart3, Settings, Play, Pause, CheckCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { blink } from '../../blink/client';
import { Project, ProjectPhase, Task, TimeEntry, ProjectFile, User } from '../../types';

interface ProjectDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onProjectUpdated: () => void;
}

export function ProjectDetailModal({ open, onOpenChange, project, onProjectUpdated }: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>(project);

  const loadProjectData = useCallback(async () => {
    setLoading(true);
    try {
      // Загружаем этапы проекта
      const phasesData = await blink.db.projectPhases.list({
        where: { projectId: project.id },
        orderBy: { orderIndex: 'asc' }
      });
      setPhases(phasesData);

      // Загружаем задачи проекта
      const tasksData = await blink.db.tasks.list({
        where: { projectId: project.id },
        orderBy: { createdAt: 'desc' }
      });
      setTasks(tasksData);

      // Загружаем временные записи
      const timeData = await blink.db.timeEntries.list({
        where: { taskId: { in: tasksData.map(t => t.id) } },
        orderBy: { startTime: 'desc' }
      });
      setTimeEntries(timeData);

      // Загружаем файлы проекта
      const filesData = await blink.db.projectFiles.list({
        where: { projectId: project.id },
        orderBy: { createdAt: 'desc' }
      });
      setFiles(filesData);

      // Загружаем участников команды
      if (project.teamMembers?.length) {
        const membersData = await blink.db.users.list({
          where: { id: { in: project.teamMembers } }
        });
        setTeamMembers(membersData);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  }, [project.id, project.teamMembers]);

  useEffect(() => {
    if (open) {
      loadProjectData();
    }
  }, [open, project.id, loadProjectData]);

  const saveProject = async () => {
    try {
      await blink.db.projects.update(project.id, {
        ...editedProject,
        updatedAt: new Date().toISOString()
      });
      setEditMode(false);
      onProjectUpdated();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const addPhase = async () => {
    try {
      const newPhase = {
        projectId: project.id,
        name: 'Новый этап',
        status: 'planned' as const,
        orderIndex: phases.length
      };
      await blink.db.projectPhases.create(newPhase);
      await loadProjectData();
    } catch (error) {
      console.error('Error adding phase:', error);
    }
  };

  const updatePhaseStatus = async (phaseId: string, status: ProjectPhase['status']) => {
    try {
      await blink.db.projectPhases.update(phaseId, { 
        status,
        updatedAt: new Date().toISOString()
      });
      await loadProjectData();
    } catch (error) {
      console.error('Error updating phase:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-600" />;
      case 'on_hold': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getTotalHours = () => {
    return timeEntries.reduce((total, entry) => total + (entry.durationMinutes || 0), 0) / 60;
  };

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1">
            {editMode ? (
              <Input
                value={editedProject.name || ''}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                className="text-2xl font-bold border-none p-0 h-auto"
              />
            ) : (
              <DialogTitle className="text-2xl font-bold">{project.name}</DialogTitle>
            )}
            <p className="text-gray-600 mt-1">
              {editMode ? (
                <Textarea
                  value={editedProject.description || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                  className="mt-2"
                  placeholder="Описание проекта..."
                />
              ) : (
                project.description || 'Нет описания'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <Button onClick={saveProject} size="sm">Сохранить</Button>
                <Button onClick={() => setEditMode(false)} variant="outline" size="sm">Отмена</Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="phases">Этапы</TabsTrigger>
            <TabsTrigger value="tasks">Задачи</TabsTrigger>
            <TabsTrigger value="team">Команда</TabsTrigger>
            <TabsTrigger value="files">Файлы</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Прогресс</p>
                      <p className="text-2xl font-bold">{getCompletionRate()}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Задач</p>
                      <p className="text-2xl font-bold">{tasks.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Часов</p>
                      <p className="text-2xl font-bold">{getTotalHours().toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Участников</p>
                      <p className="text-2xl font-bold">{teamMembers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Последние задачи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                        <Badge variant="outline">{task.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phases" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Этапы проекта</h3>
              <Button onClick={addPhase} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить этап
              </Button>
            </div>
            
            <div className="space-y-3">
              {phases.map((phase, index) => (
                <Card key={phase.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{phase.name}</h4>
                          <p className="text-sm text-gray-600">{phase.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(phase.status)}
                        <Badge className={phase.status === 'completed' ? 'bg-green-100 text-green-800' : ''}>
                          {phase.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePhaseStatus(phase.id, 
                            phase.status === 'completed' ? 'active' : 'completed'
                          )}
                        >
                          {phase.status === 'completed' ? 'Возобновить' : 'Завершить'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">К выполнению</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getTasksByStatus('todo').map((task) => (
                    <div key={task.id} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-gray-600">{task.priority}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">В работе</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getTasksByStatus('in_progress').map((task) => (
                    <div key={task.id} className="p-2 bg-blue-50 rounded text-sm">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-gray-600">{task.priority}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Завершено</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getTasksByStatus('completed').map((task) => (
                    <div key={task.id} className="p-2 bg-green-50 rounded text-sm">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-gray-600">{task.priority}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.displayName?.charAt(0) || member.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.displayName || member.email}</p>
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Файлы проекта будут отображаться здесь</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Прогресс по времени</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Запланировано часов</span>
                      <span>{tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Потрачено часов</span>
                      <span>{getTotalHours().toFixed(1)}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (getTotalHours() / Math.max(1, tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0))) * 100)} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика задач</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Всего задач</span>
                      <span className="font-medium">{tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Завершено</span>
                      <span className="font-medium text-green-600">{getTasksByStatus('completed').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">В работе</span>
                      <span className="font-medium text-blue-600">{getTasksByStatus('in_progress').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">К выполнению</span>
                      <span className="font-medium text-gray-600">{getTasksByStatus('todo').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}