from dbConnections.utils import limitSql
import json
import logging
import pandas as pd
from psycopg2 import connect
logger = logging.getLogger(__name__)


class Postgres:
    """
    Class to support functionalities on MySQL connection
    """
    def checkConnection(self):
        res = True
        try:
            host = self.get("host", "")
            port = int(self.get("port", 25060))
            database = self.get("database", "")
            user = self.get("username", "")
            password = self.get("password", "")
            conn = connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
            )
            curs = conn.cursor()

        except Exception as ex:
            logger.error("Can't connect to db with this credentials ")
            res = False
        return res

    def fetchDataframe(self, sql: str, limit: bool = False):
        dataframe = None
        try:
            host = self.get("host", "")
            port = int(self.get("port", 25060))
            database = self.get("database", "")
            user = self.get("username", "")
            password = self.get("password", "")
            conn = connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
            )
            curs = conn.cursor()
            if limit:
                sql = limitSql(sql)
            chunksize =  None
            dataframe = pd.read_sql(sql, conn, chunksize=chunksize)

        except Exception as ex:
            logger.error("Can't connect to db with this credentials %s", str(ex))

        return dataframe
