from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from users.models import Profile

class Command(BaseCommand):
    help = 'Updates a user subscription status'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)
        parser.add_argument('--paid', action='store_true')

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
            profile, created = Profile.objects.get_or_create(user=user)
            profile.paid_subscription = options['paid']
            profile.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully updated {username} paid status to {profile.paid_subscription}'
                )
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User {username} does not exist')
            )
