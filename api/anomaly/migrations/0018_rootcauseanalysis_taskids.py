# Generated by Django 3.2.5 on 2021-08-18 23:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('anomaly', '0017_merge_20210810_0524'),
    ]

    operations = [
        migrations.AddField(
            model_name='rootcauseanalysis',
            name='taskIds',
            field=models.JSONField(default=list),
        ),
    ]
