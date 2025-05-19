from flask import Flask
import psycopg2
import os

app = Flask(__name__)

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS")
    )

@app.route('/')
def home():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT message FROM greetings LIMIT 1;")
    result = cur.fetchone()
    cur.close()
    conn.close()
    return f"<h1>{result[0]}</h1>" if result else "No greetings in database."
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    