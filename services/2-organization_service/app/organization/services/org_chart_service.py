"""Organization chart service with Neo4j integration."""
import os
from typing import List, Dict, Any, Optional
from neo4j import GraphDatabase
import logging

logger = logging.getLogger(__name__)


class OrgChartService:
    """Service for managing organization charts with Neo4j."""
    
    def __init__(self):
        self.neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        self.neo4j_password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None
        self._connect()
    
    def _connect(self):
        """Connect to Neo4j database."""
        try:
            self.driver = GraphDatabase.driver(self.neo4j_uri, auth=(self.neo4j_user, self.neo4j_password))
            logger.info("Connected to Neo4j")
        except Exception as e:
            logger.error(f"Error connecting to Neo4j: {e}")
            self.driver = None
    
    def sync_employee_to_neo4j(self, employee_id: str, employee_data: Dict[str, Any]):
        """Sync employee to Neo4j graph database."""
        if not self.driver:
            logger.warning("Neo4j driver not available")
            return False
        
        try:
            with self.driver.session() as session:
                session.write_transaction(self._create_or_update_employee, employee_id, employee_data)
            return True
        except Exception as e:
            logger.error(f"Error syncing employee to Neo4j: {e}")
            return False
    
    @staticmethod
    def _create_or_update_employee(tx, employee_id: str, employee_data: Dict[str, Any]):
        """Create or update employee node in Neo4j."""
        query = """
        MERGE (e:Employee {id: $employee_id})
        SET e.name = $name,
            e.email = $email,
            e.job_title = $job_title,
            e.department = $department,
            e.updated_at = datetime()
        RETURN e
        """
        tx.run(query, 
               employee_id=employee_id,
               name=employee_data.get('name'),
               email=employee_data.get('email'),
               job_title=employee_data.get('job_title'),
               department=employee_data.get('department'))
    
    def create_reporting_relationship(self, manager_id: str, employee_id: str):
        """Create reporting relationship in Neo4j."""
        if not self.driver:
            return False
        
        try:
            with self.driver.session() as session:
                session.write_transaction(self._create_reports_to, manager_id, employee_id)
            return True
        except Exception as e:
            logger.error(f"Error creating reporting relationship: {e}")
            return False
    
    @staticmethod
    def _create_reports_to(tx, manager_id: str, employee_id: str):
        """Create REPORTS_TO relationship in Neo4j."""
        query = """
        MATCH (m:Employee {id: $manager_id})
        MATCH (e:Employee {id: $employee_id})
        MERGE (e)-[r:REPORTS_TO]->(m)
        SET r.created_at = datetime()
        RETURN r
        """
        tx.run(query, manager_id=manager_id, employee_id=employee_id)
    
    def get_org_chart(self, root_employee_id: str, depth: int = 5) -> Dict[str, Any]:
        """Get organization chart starting from root employee."""
        if not self.driver:
            return {"error": "Neo4j driver not available"}
        
        try:
            with self.driver.session() as session:
                result = session.read_transaction(self._get_org_chart_tree, root_employee_id, depth)
                return result
        except Exception as e:
            logger.error(f"Error getting org chart: {e}")
            return {"error": str(e)}
    
    @staticmethod
    def _get_org_chart_tree(tx, root_employee_id: str, depth: int):
        """Get org chart tree using Cypher query."""
        query = """
        MATCH path = (root:Employee {id: $root_id})<-[:REPORTS_TO*1..%d]-(subordinate:Employee)
        RETURN root, collect(DISTINCT subordinate) as subordinates
        LIMIT 100
        """ % depth
        
        result = tx.run(query, root_id=root_employee_id)
        records = list(result)
        
        if records:
            record = records[0]
            return {
                "root": dict(record["root"]),
                "subordinates": [dict(sub) for sub in record["subordinates"]]
            }
        return {"root": None, "subordinates": []}
    
    def get_direct_reports(self, employee_id: str) -> List[Dict[str, Any]]:
        """Get direct reports of an employee."""
        if not self.driver:
            return []
        
        try:
            with self.driver.session() as session:
                result = session.read_transaction(self._get_direct_reports, employee_id)
                return result
        except Exception as e:
            logger.error(f"Error getting direct reports: {e}")
            return []
    
    @staticmethod
    def _get_direct_reports(tx, employee_id: str):
        """Get direct reports using Cypher query."""
        query = """
        MATCH (manager:Employee {id: $employee_id})<-[:REPORTS_TO]-(direct_report:Employee)
        RETURN direct_report
        ORDER BY direct_report.name
        """
        result = tx.run(query, employee_id=employee_id)
        return [dict(record["direct_report"]) for record in result]
    
    def get_manager_chain(self, employee_id: str) -> List[Dict[str, Any]]:
        """Get manager chain (all managers up the hierarchy)."""
        if not self.driver:
            return []
        
        try:
            with self.driver.session() as session:
                result = session.read_transaction(self._get_manager_chain, employee_id)
                return result
        except Exception as e:
            logger.error(f"Error getting manager chain: {e}")
            return []
    
    @staticmethod
    def _get_manager_chain(tx, employee_id: str):
        """Get manager chain using Cypher query."""
        query = """
        MATCH path = (employee:Employee {id: $employee_id})-[:REPORTS_TO*]->(manager:Employee)
        RETURN manager
        ORDER BY length(path)
        """
        result = tx.run(query, employee_id=employee_id)
        return [dict(record["manager"]) for record in result]
    
    def close(self):
        """Close Neo4j driver connection."""
        if self.driver:
            self.driver.close()

