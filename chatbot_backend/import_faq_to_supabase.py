import csv
import psycopg2

# Update these with your Supabase database credentials
DB_HOST = 'YOUR_SUPABASE_HOST'
DB_NAME = 'YOUR_SUPABASE_DB'
DB_USER = 'YOUR_SUPABASE_USER'
DB_PASSWORD = 'YOUR_SUPABASE_PASSWORD'
DB_PORT = 5432

CSV_PATH = '../chat/leo_support_agent/data/faq_seed.csv'

conn = psycopg2.connect(
    host=DB_HOST,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    port=DB_PORT
)
cursor = conn.cursor()

with open(CSV_PATH, encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        cursor.execute(
            """
            INSERT INTO public.faq_chatbot (question, answer, tags, locale, last_updated)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (question) DO NOTHING;
            """,
            (row['question'], row['answer'], row['tags'], row['locale'], row['last_updated'])
        )

conn.commit()
cursor.close()
conn.close()
print('FAQ import complete.')
