import React from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Calendar, Clock, MoreHorizontal, User, Flag, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ContentTask } from '../../types'
import { cn } from '../../lib/utils'

interface TaskCardProps {
  task: ContentTask
  onStatusChange?: (taskId: string, status: string) => void
  onEdit?: (task: ContentTask) => void
  onDelete?: (taskId: string) => void
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  published: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800'
}

const statusLabels = {
  draft: 'Черновик',
  in_review: 'На проверке',
  approved: 'Утверждено',
  published: 'Опубликовано',
  rejected: 'Отклонено'
}

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  urgent: 'text-red-600'
}

const priorityLabels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный'
}

const contentTypeIcons = {
  post: FileText,
  video: '🎥',
  image: '🖼️',
  story: '📖',
  article: '📄',
  campaign: '🎯'
}

const contentTypeLabels = {
  post: 'Пост',
  video: 'Видео',
  image: 'Изображение',
  story: 'История',
  article: 'Статья',
  campaign: 'Кампания'
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'published'
  
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isOverdue && "border-red-200 bg-red-50/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="text-lg">
              {typeof contentTypeIcons[task.contentType as keyof typeof contentTypeIcons] === 'string' 
                ? contentTypeIcons[task.contentType as keyof typeof contentTypeIcons]
                : React.createElement(contentTypeIcons[task.contentType as keyof typeof contentTypeIcons] as any, { className: "h-4 w-4" })
              }
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{task.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {contentTypeLabels[task.contentType as keyof typeof contentTypeLabels]}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Редактировать
                </DropdownMenuItem>
              )}
              {onStatusChange && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_review')}>
                    Отправить на проверку
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'approved')}>
                    Утвердить
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'published')}>
                    Опубликовать
                  </DropdownMenuItem>
                </>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-red-600"
                >
                  Удалить
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <Badge className={statusColors[task.status as keyof typeof statusColors]}>
            {statusLabels[task.status as keyof typeof statusLabels]}
          </Badge>
          
          <div className="flex items-center gap-1">
            <Flag className={cn("h-3 w-3", priorityColors[task.priority as keyof typeof priorityColors])} />
            <span className={cn("text-xs", priorityColors[task.priority as keyof typeof priorityColors])}>
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          {task.scheduledDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Публикация: {format(new Date(task.scheduledDate), 'dd MMM yyyy', { locale: ru })}</span>
            </div>
          )}
          
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-2 text-xs",
              isOverdue ? "text-red-600" : "text-muted-foreground"
            )}>
              <Clock className="h-3 w-3" />
              <span>Срок: {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: ru })}</span>
              {isOverdue && <span className="text-red-600 font-medium">Просрочено</span>}
            </div>
          )}
        </div>
        
        {task.assignedTo && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">Исполнитель</span>
          </div>
        )}
        
        {task.tags && (
          <div className="flex flex-wrap gap-1">
            {JSON.parse(task.tags).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}