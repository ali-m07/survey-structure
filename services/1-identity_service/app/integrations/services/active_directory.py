"""Active Directory integration service."""
import ldap3
from ldap3 import Server, Connection, ALL, SUBTREE
from django.contrib.auth import get_user_model
from app.tenants.models import Tenant
from app.accounts.models import CustomUser
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class ActiveDirectoryService:
    """Service for Active Directory integration."""
    
    def __init__(self, config):
        self.config = config
        self.server = Server(config.server_url, get_info=ALL)
    
    def authenticate(self, username, password):
        """Authenticate user against Active Directory."""
        try:
            user_dn = f"CN={username},{self.config.base_dn}"
            conn = Connection(self.server, user=user_dn, password=password, auto_bind=True)
            conn.unbind()
            return True
        except Exception as e:
            logger.error(f"AD authentication failed: {e}")
            return False
    
    def sync_users(self):
        """Sync users from Active Directory."""
        try:
            conn = Connection(
                self.server,
                user=self.config.bind_dn,
                password=self.config.bind_password,
                auto_bind=True
            )
            
            search_base = self.config.base_dn
            search_filter = "(objectClass=user)"
            attributes = ['cn', 'mail', 'sAMAccountName', 'givenName', 'sn', 'memberOf']
            
            conn.search(search_base, search_filter, SUBTREE, attributes=attributes)
            
            synced_count = 0
            tenant = self.config.tenant
            
            for entry in conn.entries:
                try:
                    username = str(entry.sAMAccountName) if hasattr(entry, 'sAMAccountName') else str(entry.cn)
                    email = str(entry.mail) if hasattr(entry, 'mail') else f"{username}@example.com"
                    
                    user, created = CustomUser.objects.get_or_create(
                        username=username,
                        tenant=tenant,
                        defaults={
                            'email': email,
                            'first_name': str(entry.givenName) if hasattr(entry, 'givenName') else '',
                            'last_name': str(entry.sn) if hasattr(entry, 'sn') else '',
                        }
                    )
                    if created:
                        synced_count += 1
                        logger.info(f"Synced user: {username}")
                except Exception as e:
                    logger.error(f"Error syncing user {entry}: {e}")
            
            conn.unbind()
            return synced_count
        except Exception as e:
            logger.error(f"AD sync failed: {e}")
            return 0

