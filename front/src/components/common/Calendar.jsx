import React, { useState } from 'react';
import '../../styles/calendar.css';
import DayTasksModal from '../tasks/DayTasksModal';

const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

const getWeekday = (date) => (date.getDay() === 0 ? 6 : date.getDay() - 1); // Пн=0, Вс=6

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

const Calendar = ({ tasks, categories = [], onDayClick, onTaskClick }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayTasks, setShowDayTasks] = useState(false);

  const days = getMonthDays(currentYear, currentMonth);
  const firstWeekday = getWeekday(days[0]);

  // Группируем задачи по дате (yyyy-mm-dd)
  const tasksByDate = {};
  tasks.forEach(task => {
    if (task.dueDate) {
      const dateKey = new Date(task.dueDate).toISOString().slice(0, 10);
      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
      tasksByDate[dateKey].push(task);
    }
  });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowDayTasks(true);
  };

  const handleCloseDayTasks = () => {
    setShowDayTasks(false);
    setSelectedDate(null);
  };

  const handleAddTask = (date) => {
    handleCloseDayTasks();
    onDayClick && onDayClick(date);
  };

  return (
    <div className="calendar-root">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav-btn" aria-label="Предыдущий месяц">
          {'<'}
        </button>
        <span className="calendar-month">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button onClick={nextMonth} className="calendar-nav-btn" aria-label="Следующий месяц">
          {'>'}
        </button>
      </div>
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-days">
        {/* Пустые ячейки до первого дня месяца */}
        {Array(firstWeekday).fill(null).map((_, i) => (
          <div key={'empty-' + i} className="calendar-day-empty" />
        ))}
        {/* Дни месяца */}
        {days.map(date => {
          const dateKey = date.toISOString().slice(0, 10);
          const isToday = date.toDateString() === today.toDateString();
          const dayTasks = tasksByDate[dateKey] || [];
          const hasMoreTasks = dayTasks.length > 1;

          return (
            <div
              key={dateKey}
              className={`calendar-day ${isToday ? 'calendar-day-today' : ''}`}
              onClick={() => handleDayClick(date)}
            >
              <div className="calendar-day-number">{date.getDate()}</div>
              {/* Список задач на этот день (максимум 1) */}
              {dayTasks.slice(0, 1).map(task => {
                const category = categories.find(cat => cat._id === (task.categories_id?._id || task.categories_id));
                return (
                <div
                  key={task._id}
                  className={`calendar-task ${task.isCompleted ? 'calendar-task-completed' : ''}`}
                  title={task.title}
                  onClick={e => { e.stopPropagation(); onTaskClick && onTaskClick(task); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}
                  >
                    {category?.color && (
                      <span style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        marginRight: '0.5em',
                      }} />
                    )}
                  {task.title}
                </div>
                );
              })}
              {hasMoreTasks && (
                <div className="calendar-more-tasks">
                  +{dayTasks.length - 1} еще
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Модальное окно с задачами на день */}
      {selectedDate && (
        <DayTasksModal
          isOpen={showDayTasks}
          onClose={handleCloseDayTasks}
          date={selectedDate}
          tasks={tasksByDate[selectedDate.toISOString().slice(0, 10)] || []}
          categories={categories}
          onTaskToggle={(taskId) => onTaskClick && onTaskClick({ _id: taskId })}
          onTaskDelete={(taskId) => onTaskClick && onTaskClick({ _id: taskId })}
          onTaskEdit={(task) => onTaskClick && onTaskClick(task)}
          onAddTask={handleAddTask}
        />
      )}
    </div>
  );
};

export default Calendar; 