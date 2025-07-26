import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Calendar, Users, Clock, FileText, MoreHorizontal, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { ProjectDetailModal } from '../modals/ProjectDetailModal';
import { blink } from '../../blink/client';
import { Project, ProjectPhase, Task, TimeEntry, ProjectFile } from '../../types';

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const user = await blink.auth.me();
      const projectsData = await blink.db.projects.list({
        where: {
          OR: [
            { ownerId: user.id },
            { teamMembers: { contains: user.id } }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      });
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterProjects = useCallback(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter, filterProjects]);

  const updateProjectStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      await blink.db.projects.update(projectId, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      await loadProjects();
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'on_hold': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Проекты</h1>
          <p className="text-gray-600 mt-1">Управление проектами и командной работой</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Создать проект
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск проектов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Статус: {statusFilter === 'all' ? 'Все' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>Все</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('planning')}>Планирование</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('active')}>Активные</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('on_hold')}>Приостановлены</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Завершены</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {project.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {project.description || 'Нет описания'}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openProjectDetail(project)}>
                      Открыть
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateProjectStatus(project.id, 'active')}>
                      Запустить
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateProjectStatus(project.id, 'on_hold')}>
                      Приостановить
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateProjectStatus(project.id, 'completed')}>
                      Завершить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status and Priority */}
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                  {getStatusIcon(project.status)}
                  {project.status}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Прогресс</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Dates */}
              {(project.startDate || project.endDate) && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {project.startDate && new Date(project.startDate).toLocaleDateString('ru-RU')}
                  </div>
                  {project.endDate && (
                    <div>
                      - {new Date(project.endDate).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              )}

              {/* Team Members */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {project.teamMembers?.length || 0} участников
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => openProjectDetail(project)}
                >
                  Подробнее
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Проекты не найдены' : 'Нет проектов'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Попробуйте изменить фильтры поиска'
              : 'Создайте свой первый проект для начала работы'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать проект
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onProjectCreated={loadProjects}
      />
      
      {selectedProject && (
        <ProjectDetailModal
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          project={selectedProject}
          onProjectUpdated={loadProjects}
        />
      )}
    </div>
  );
}