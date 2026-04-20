from rest_framework import serializers
from .models import User, Teacher, ClassRoom, Section, Student, Subject, TimeSlot, TimetableEntry, Department


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='teacher'), write_only=True, source='user')
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Teacher
        fields = ['id', 'user', 'user_id', 'employee_id', 'department', 'department_name', 'subjects', 'phone', 'created_at']


class ClassRoomSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    section_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoom
        fields = ['id', 'name', 'grade', 'department', 'department_name', 'section_count', 'created_at']

    def get_section_count(self, obj):
        return obj.sections.count()


class SectionSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.user.get_full_name', read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['id', 'name', 'classroom', 'classroom_name', 'class_teacher', 'class_teacher_name', 'max_students', 'student_count', 'created_at']

    def get_student_count(self, obj):
        return obj.students.count()


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='student'), write_only=True, source='user')
    section_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'user', 'user_id', 'roll_number', 'section', 'section_name', 'phone', 'created_at']

    def get_section_name(self, obj):
        if obj.section:
            return str(obj.section)
        return None


class SubjectSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'department', 'department_name', 'created_at']


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'name', 'start_time', 'end_time', 'is_break', 'order']


class TimetableEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    time_slot_detail = TimeSlotSerializer(source='time_slot', read_only=True)

    class Meta:
        model = TimetableEntry
        fields = ['id', 'section', 'day', 'time_slot', 'time_slot_detail', 'subject', 'subject_name', 'teacher', 'teacher_name', 'room']


class TimetableEntryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimetableEntry
        fields = ['id', 'section', 'day', 'time_slot', 'subject', 'teacher', 'room']

    def validate(self, data):
        # Check teacher conflict
        if data.get('teacher'):
            qs = TimetableEntry.objects.filter(
                day=data['day'],
                time_slot=data['time_slot'],
                teacher=data['teacher']
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("This teacher already has a class at this time slot.")
        return data
