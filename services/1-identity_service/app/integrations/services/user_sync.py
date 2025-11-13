"""User synchronization service."""
import ldap3
from ldap3 import Server, Connection, ALL, SUBTREE
from app.integrations.services.active_directory import ActiveDirectoryService
from app.integrations.models import DirectoryConfiguration, DatabaseConfiguration
from app.accounts.models import CustomUser
from app.tenants.models import Tenant
import psycopg2
import logging

logger = logging.getLogger(__name__)


class UserSyncService:
    """Service for synchronizing users from external sources."""
    
    def sync_from_ad(self, config: DirectoryConfiguration):
        """Sync users from Active Directory."""
        if config.directory_type == 'AD':
            ad_service = ActiveDirectoryService(config)
            return ad_service.sync_users()
        return 0
    
    def sync_from_ldap(self, config: DirectoryConfiguration):
        """Sync users from LDAP."""
        try:
            server = Server(config.server_url, get_info=ALL)
            conn = Connection(
                server,
                user=config.bind_dn,
                password=config.bind_password,
                auto_bind=True
            )
            
            search_base = config.base_dn
            search_filter = "(objectClass=inetOrgPerson)"
            attributes = ['cn', 'mail', 'uid', 'givenName', 'sn']
            
            conn.search(search_base, search_filter, SUBTREE, attributes=attributes)
            
            synced_count = 0
            tenant = config.tenant
            
            for entry in conn.entries:
                try:
                    username = str(entry.uid) if hasattr(entry, 'uid') else str(entry.cn)
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
                except Exception as e:
                    logger.error(f"Error syncing LDAP user {entry}: {e}")
            
            conn.unbind()
            return synced_count
        except Exception as e:
            logger.error(f"LDAP sync failed: {e}")
            return 0
    
    def sync_from_database(self, config: DatabaseConfiguration):
        """Sync users from external database."""
        try:
            # Parse connection string and connect
            # This is a simplified example - adjust based on your database type
            conn = psycopg2.connect(config.connection_string)
            cursor = conn.cursor()
            
            # Example query - adjust based on your schema
            cursor.execute("SELECT username, email, first_name, last_name FROM users")
            rows = cursor.fetchall()
            
            synced_count = 0
            tenant = config.tenant
            
            for row in rows:
                try:
                    username, email, first_name, last_name = row
                    user, created = CustomUser.objects.get_or_create(
                        username=username,
                        tenant=tenant,
                        defaults={
                            'email': email or f"{username}@example.com",
                            'first_name': first_name or '',
                            'last_name': last_name or '',
                        }
                    )
                    if created:
                        synced_count += 1
                except Exception as e:
                    logger.error(f"Error syncing DB user {row}: {e}")
            
            cursor.close()
            conn.close()
            return synced_count
        except Exception as e:
            logger.error(f"Database sync failed: {e}")
            return 0
    
    def sync_from_scim(self, scim_endpoint, bearer_token, tenant):
        """Sync users from SCIM 2.0 endpoint."""
        import requests
        
        try:
            headers = {
                'Authorization': f'Bearer {bearer_token}',
                'Content-Type': 'application/scim+json'
            }
            response = requests.get(f"{scim_endpoint}/Users", headers=headers)
            response.raise_for_status()
            
            data = response.json()
            synced_count = 0
            
            for user_data in data.get('Resources', []):
                try:
                    username = user_data.get('userName')
                    email = user_data.get('emails', [{}])[0].get('value', '')
                    
                    user, created = CustomUser.objects.get_or_create(
                        username=username,
                        tenant=tenant,
                        defaults={
                            'email': email,
                            'first_name': user_data.get('name', {}).get('givenName', ''),
                            'last_name': user_data.get('name', {}).get('familyName', ''),
                        }
                    )
                    if created:
                        synced_count += 1
                except Exception as e:
                    logger.error(f"Error syncing SCIM user {user_data}: {e}")
            
            return synced_count
        except Exception as e:
            logger.error(f"SCIM sync failed: {e}")
            return 0

