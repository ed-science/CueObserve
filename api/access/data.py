from dbConnections import BigQuery
from anomaly.serializers import ConnectionDetailSerializer
from dbConnections import Druid

class Data:
    @staticmethod
    def runQueryOnConnection(connectionType, connectionParams, query, limit=True):
        dataframe = None
        if connectionType == "BigQuery":
            file = connectionParams['file']
            dataframe = BigQuery.fetchDataframe(file, query, limit=limit)
        if connectionType == "Druid":
            params = connectionParams
            dataframe = Druid.fetchDataframe(params, query, limit=limit)
        return dataframe
    
    @staticmethod
    def fetchDatasetDataframe(dataset):
        connectionData = ConnectionDetailSerializer(dataset.connection).data
        datasetDf = Data.runQueryOnConnection(connectionData["connectionType"], connectionData["params"], dataset.sql, False)
        return datasetDf
    

        
