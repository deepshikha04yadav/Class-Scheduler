from django.core.management.base import BaseCommand
from core.models import Department, Teacher, ClassRoom, Section, Student, Subject, TimeSlot
from django.contrib.auth import get_user_model
User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        if not User.objects.filter(email='admin@school.com').exists():
            User.objects.create_superuser(email='admin@school.com', password='admin123', first_name='Admin', last_name='User')
        self.stdout.write('  Admin: admin@school.com / admin123')

        dept_sci, _ = Department.objects.get_or_create(name='Science', code='SCI')
        dept_math, _ = Department.objects.get_or_create(name='Mathematics', code='MATH')
        dept_arts, _ = Department.objects.get_or_create(name='Arts', code='ARTS')

        for name, code, dept in [('Mathematics','MATH101',dept_math),('Physics','PHY101',dept_sci),('Chemistry','CHEM101',dept_sci),('Biology','BIO101',dept_sci),('English','ENG101',dept_arts),('History','HIST101',dept_arts),('Computer Science','CS101',dept_sci),('Physical Education','PE101',None)]:
            Subject.objects.get_or_create(name=name, code=code, defaults={'department': dept})

        teacher_user = None
        if not User.objects.filter(email='teacher1@school.com').exists():
            teacher_user = User.objects.create_user(email='teacher1@school.com', password='teacher123', first_name='Sarah', last_name='Johnson', role='teacher')
            Teacher.objects.create(user=teacher_user, employee_id='T001', department=dept_math, subjects='Mathematics')
        self.stdout.write('  Teacher: teacher1@school.com / teacher123')

        if not User.objects.filter(email='teacher2@school.com').exists():
            u = User.objects.create_user(email='teacher2@school.com', password='teacher123', first_name='James', last_name='Wilson', role='teacher')
            Teacher.objects.create(user=u, employee_id='T002', department=dept_sci, subjects='Physics, Chemistry')

        class10, _ = ClassRoom.objects.get_or_create(name='Class 10', grade=10)
        class11, _ = ClassRoom.objects.get_or_create(name='Class 11', grade=11)

        t1 = Teacher.objects.filter(employee_id='T001').first()
        sec_a, _ = Section.objects.get_or_create(name='A', classroom=class10, defaults={'class_teacher': t1})
        Section.objects.get_or_create(name='B', classroom=class10)
        Section.objects.get_or_create(name='A', classroom=class11)

        for name, st, et, is_break, order in [('Period 1','08:00','08:45',False,1),('Period 2','08:45','09:30',False,2),('Period 3','09:30','10:15',False,3),('Break','10:15','10:30',True,4),('Period 4','10:30','11:15',False,5),('Period 5','11:15','12:00',False,6),('Lunch','12:00','12:45',True,7),('Period 6','12:45','13:30',False,8),('Period 7','13:30','14:15',False,9)]:
            TimeSlot.objects.get_or_create(name=name, defaults={'start_time':st,'end_time':et,'is_break':is_break,'order':order})

        if not User.objects.filter(email='student1@school.com').exists():
            u = User.objects.create_user(email='student1@school.com', password='student123', first_name='Rahul', last_name='Sharma', role='student')
            Student.objects.create(user=u, roll_number='10A001', section=sec_a)
        self.stdout.write('  Student: student1@school.com / student123')

        self.stdout.write(self.style.SUCCESS('Done! Login: admin@school.com/admin123, teacher1@school.com/teacher123, student1@school.com/student123'))
