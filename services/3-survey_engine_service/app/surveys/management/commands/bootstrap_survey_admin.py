import os
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from app.surveys.models import Membership
class Command(BaseCommand):
    help = 'Create an administrator with tenant membership; never resets existing passwords.'
    def add_arguments(self, parser):
        parser.add_argument('--username', default=os.environ.get('ADMIN_USERNAME','admin'))
        parser.add_argument('--password', default=os.environ.get('ADMIN_PASSWORD'))
        parser.add_argument('--tenant', default=os.environ.get('ADMIN_TENANT','default'))
    def handle(self, *args, **options):
        user = User.objects.filter(username=options['username']).first()
        if not user:
            if not options['password'] or len(options['password']) < 10:
                raise CommandError('Set ADMIN_PASSWORD with at least 10 characters.')
            user = User.objects.create_user(options['username'], password=options['password'])
        Membership.objects.get_or_create(user=user, tenant_id=options['tenant'], defaults={'role':'admin'})
        self.stdout.write(self.style.SUCCESS('Administrator membership is ready.'))
