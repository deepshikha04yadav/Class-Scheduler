import os
import secrets
import string

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

ADMIN_EMAIL = "admin@example.com"
ADMIN_FIRST_NAME = "Admin"
ADMIN_LAST_NAME = "User"


def _generate_password(length: int = 20) -> str:
    """Generate a cryptographically secure random password."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return "".join(secrets.choice(alphabet) for _ in range(length))


class Command(BaseCommand):
    help = "Creates a superuser (admin@example.com) if one does not already exist."

    def handle(self, *args, **kwargs):
        if User.objects.filter(email=ADMIN_EMAIL).exists():
            self.stdout.write(
                self.style.WARNING(
                    f"Superuser '{ADMIN_EMAIL}' already exists — skipping creation."
                )
            )
            return

        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD") or _generate_password()

        User.objects.create_superuser(
            email=ADMIN_EMAIL,
            password=password,
            first_name=ADMIN_FIRST_NAME,
            last_name=ADMIN_LAST_NAME,
        )

        if os.environ.get("DJANGO_SUPERUSER_PASSWORD"):
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser '{ADMIN_EMAIL}' created successfully "
                    f"(password sourced from DJANGO_SUPERUSER_PASSWORD)."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser '{ADMIN_EMAIL}' created successfully.\n"
                    f"Auto-generated password: {password}\n"
                    "Set DJANGO_SUPERUSER_PASSWORD to use a fixed password on future runs."
                )
            )
