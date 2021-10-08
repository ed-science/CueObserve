
from search import ma
from search.globalDimensions.models import GlobalDimension, GlobalDimensionValues

class GlobalDimensionValuesSchema(ma.Schema):
    
    class Meta:
        fields = ("id", "dimension","datasetId", "dataset")
        include_fk=True


class GlobalDimensionSchema(ma.Schema):
    
    id= ma.Integer()
    name = ma.String()
    published = ma.Boolean()
    values = ma.List(ma.Nested(GlobalDimensionValuesSchema(only=("dimension","dataset"))))



# globaldimension_schema = GlobalDimensionSchema()
# globaldimensions_schema = GlobalDimensionSchema(many=True)

# globaldimensionValue_schema = GlobalDimensionValuesSchema()
# globaldimensionValues_schema = GlobalDimensionValuesSchema(many=True)