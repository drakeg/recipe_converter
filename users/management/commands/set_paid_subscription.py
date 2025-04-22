from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from users.models import Profile

class Command(BaseCommand):
    help = 'Set paid subscription for a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
            profile, created = Profile.objects.get_or_create(user=user)
            profile.paid_subscription = True
            profile.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully set paid subscription for user {username}'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {username} does not exist'))
