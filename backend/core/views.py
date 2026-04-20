from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Teacher, ClassRoom, Section, Student, Subject, TimeSlot, TimetableEntry, Department
from .serializers import (
    UserSerializer, UserCreateSerializer, TeacherSerializer, ClassRoomSerializer,
    SectionSerializer, StudentSerializer, SubjectSerializer, TimeSlotSerializer,
    TimetableEntrySerializer, TimetableEntryWriteSerializer, DepartmentSerializer
)

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'teacher']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard_stats(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        return Response({
            'teachers': Teacher.objects.count(),
            'students': Student.objects.count(),
            'classes': ClassRoom.objects.count(),
            'sections': Section.objects.count(),
            'subjects': Subject.objects.count(),
            'timetable_entries': TimetableEntry.objects.count(),
        })


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrTeacher]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related('user', 'department').all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAdminUser]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrTeacher()]
        return [IsAdminUser()]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_profile(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            return Response(TeacherSerializer(teacher).data)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=404)

    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrTeacher])
    def timetable(self, request, pk=None):
        teacher = self.get_object()
        entries = TimetableEntry.objects.filter(teacher=teacher).select_related(
            'section', 'section__classroom', 'subject', 'time_slot'
        )
        serializer = TimetableEntrySerializer(entries, many=True)
        return Response(serializer.data)


class ClassRoomViewSet(viewsets.ModelViewSet):
    queryset = ClassRoom.objects.select_related('department').prefetch_related('sections').all()
    serializer_class = ClassRoomSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.select_related('classroom', 'class_teacher__user').all()
    serializer_class = SectionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        classroom_id = self.request.query_params.get('classroom')
        if classroom_id:
            qs = qs.filter(classroom_id=classroom_id)
        return qs

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def timetable(self, request, pk=None):
        section = self.get_object()
        entries = TimetableEntry.objects.filter(section=section).select_related(
            'subject', 'teacher__user', 'time_slot'
        )
        serializer = TimetableEntrySerializer(entries, many=True)
        return Response(serializer.data)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('user', 'section__classroom').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_profile(self, request):
        try:
            student = Student.objects.get(user=request.user)
            return Response(StudentSerializer(student).data)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=404)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_timetable(self, request):
        try:
            student = Student.objects.get(user=request.user)
            if not student.section:
                return Response({'error': 'Not assigned to a section'}, status=400)
            entries = TimetableEntry.objects.filter(section=student.section).select_related(
                'subject', 'teacher__user', 'time_slot'
            )
            serializer = TimetableEntrySerializer(entries, many=True)
            return Response({'section': str(student.section), 'entries': serializer.data})
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=404)


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]


class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]


class TimetableEntryViewSet(viewsets.ModelViewSet):
    queryset = TimetableEntry.objects.select_related(
        'section__classroom', 'subject', 'teacher__user', 'time_slot'
    ).all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TimetableEntryWriteSerializer
        return TimetableEntrySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        section_id = self.request.query_params.get('section')
        day = self.request.query_params.get('day')
        teacher_id = self.request.query_params.get('teacher')
        if section_id:
            qs = qs.filter(section_id=section_id)
        if day:
            qs = qs.filter(day=day)
        if teacher_id:
            qs = qs.filter(teacher_id=teacher_id)
        return qs

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def bulk_update(self, request):
        """Replace all timetable entries for a section"""
        section_id = request.data.get('section_id')
        entries_data = request.data.get('entries', [])

        if not section_id:
            return Response({'error': 'section_id required'}, status=400)

        try:
            section = Section.objects.get(pk=section_id)
        except Section.DoesNotExist:
            return Response({'error': 'Section not found'}, status=404)

        TimetableEntry.objects.filter(section=section).delete()

        created = []
        errors = []
        for entry in entries_data:
            entry['section'] = section_id
            serializer = TimetableEntryWriteSerializer(data=entry)
            if serializer.is_valid():
                created.append(serializer.save())
            else:
                errors.append(serializer.errors)

        if errors:
            return Response({'created': len(created), 'errors': errors}, status=207)
        return Response({'message': f'{len(created)} entries saved'}, status=201)
