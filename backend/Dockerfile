FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "until alembic upgrade head; do echo 'Waiting for DB...'; sleep 2; done && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]