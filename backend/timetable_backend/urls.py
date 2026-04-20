# from django.contrib import admin
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from rest_framework_simplejwt.views import TokenRefreshView
# from core.views import (
#     CustomTokenObtainPairView, UserViewSet, TeacherViewSet, ClassRoomViewSet,
#     SectionViewSet, StudentViewSet, SubjectViewSet, TimeSlotViewSet,
#     TimetableEntryViewSet, DepartmentViewSet
# )

# router = DefaultRouter()
# router.register(r'users', UserViewSet)
# router.register(r'departments', DepartmentViewSet)
# router.register(r'teachers', TeacherViewSet)
# router.register(r'classes', ClassRoomViewSet)
# router.register(r'sections', SectionViewSet)
# router.register(r'students', StudentViewSet)
# router.register(r'subjects', SubjectViewSet)
# router.register(r'timeslots', TimeSlotViewSet)
# router.register(r'timetable', TimetableEntryViewSet)

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/', include(router.urls)),
#     path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain'),
#     path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
# ]



from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import (
    CustomTokenObtainPairView, UserViewSet, TeacherViewSet, ClassRoomViewSet,
    SectionViewSet, StudentViewSet, SubjectViewSet, TimeSlotViewSet,
    TimetableEntryViewSet, DepartmentViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'classes', ClassRoomViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'students', StudentViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'timeslots', TimeSlotViewSet)
router.register(r'timetable', TimetableEntryViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', csrf_exempt(CustomTokenObtainPairView.as_view()), name='token_obtain'),
    path('api/auth/refresh/', csrf_exempt(TokenRefreshView.as_view()), name='token_refresh'),
]