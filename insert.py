import pymysql
import csv

# 数据库连接
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='863235',
    database='fitness_demo'
)
cursor = conn.cursor()

# 打开 CSV 文件
with open('doc/dataSource/food.csv', 'r', encoding='utf-8') as file:
    csv_data = csv.reader(file)
    next(csv_data)  # 跳过表头
    for row in csv_data:
        cursor.execute(
            "INSERT INTO food (name, calories) VALUES (%s, %s)",
            row[1:])
conn.commit()
cursor.close()
conn.close()